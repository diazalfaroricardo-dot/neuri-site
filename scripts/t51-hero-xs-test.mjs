/**
 * T51 (baja, B-A9/B-N2): en / ES a 390 px «Ver los productos» queda arriba del pliegue con
 * (≤664: alto visible de Safari en iPhone de 390×844 con barras) y hay contacto visible en el hero («Hablar con Neuri» → hola@neuri.tech),
 * que a 1280 solo vive en el encabezado. Sin scroll horizontal; toques ≥44 px.
 * Uso: node scripts/t51-hero-xs-test.mjs [--live]
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LIVE = process.argv.includes("--live");
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let f = join(ROOT, p);
  if (!f.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": extname(f) === ".html" ? "text/html; charset=utf-8" : "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = LIVE ? "https://neuri.tech" : `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fallas = 0;
for (const w of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, locale: "es-MX" });
  const page = await ctx.newPage();
  await page.route(/^(?!https?:\/\/(127\.0\.0\.1|neuri\.tech))/, (r) => r.abort());
  await page.goto(`${base}/?lang=es`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const vis = (el) => el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
    const cta = [...document.querySelectorAll('a[href="#sistemas"]')].find((a) => vis(a) && /Ver los productos/.test(a.textContent));
    const hablar = [...document.querySelectorAll("a[data-hero-contacto]")].find(vis);
    const r = cta?.getBoundingClientRect();
    const hr = hablar?.getBoundingClientRect();
    return {
      ctaBottom: r ? Math.round(r.bottom) : null,
      hablar: hablar ? { href: hablar.getAttribute("href"), h: Math.round(hr.height), bottom: Math.round(hr.bottom) } : null,
      scrollX: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });
  const ok = [];
  if (m.ctaBottom == null) ok.push("sin «Ver los productos» visible");
  if (w === 390) {
    if (m.ctaBottom > 664) ok.push(`CTA muy abajo (${m.ctaBottom})`);
    if (!m.hablar) ok.push("sin «Hablar con Neuri» en el hero");
    else {
      if (m.hablar.href !== "mailto:hola@neuri.tech") ok.push(`href ${m.hablar.href}`);
      if (m.hablar.h < 44) ok.push(`toque ${m.hablar.h}px`);
      if (m.hablar.bottom > 844) ok.push(`contacto bajo el pliegue (${m.hablar.bottom})`);
    }
  } else if (m.hablar) ok.push("contacto del hero duplicado a 1280 (ya está en el encabezado)");
  if (m.scrollX) ok.push("scroll horizontal");
  console.log(`${ok.length ? "FALLA" : "OK"} ${w} ${JSON.stringify(m)} ${ok.join("; ")}`);
  if (ok.length) fallas++;
  await ctx.close();
}
await browser.close();
server.close();
console.log(fallas ? `t51: ${fallas} fallas` : "t51: 2/2 OK");
process.exit(fallas ? 1 : 0);
