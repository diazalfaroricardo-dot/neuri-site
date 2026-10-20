/**
 * T42 (B-A3): a 390 px «Entrar»/«Sign in» queda en la primera fila del encabezado (misma
 * altura que el logo) y del lado derecho, en /bazar/, /en/ y /sigue-disponible/ (+ EN).
 * Sin scroll horizontal y con toques ≥44 px. Uso: node scripts/t42-entrar-arriba-test.mjs [--live]
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
const PAGES = ["/bazar/", "/en/", "/sigue-disponible/", "/en/still-available/"];
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fallas = 0;
for (const w of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    await page.route(/^(?!https?:\/\/(127\.0\.0\.1|neuri\.tech))/, (r) => r.abort());
    await page.goto(base + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const h = document.querySelector("header");
      const logo = h.querySelector("a");
      const e = h.querySelector("a[data-entrar]");
      const lr = logo.getBoundingClientRect();
      const er = e.getBoundingClientRect();
      return {
        mismaFila: er.top < lr.bottom && er.bottom > lr.top,
        derecha: er.left > innerWidth / 2,
        alto: Math.round(er.height),
        scroll: document.documentElement.scrollWidth > innerWidth,
      };
    });
    const ok = m.mismaFila && m.derecha && m.alto >= 44 && !m.scroll;
    if (!ok) fallas++;
    console.log(`${ok ? "OK   " : "FALLA"} ${path} @${w}`, JSON.stringify(m));
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.close();
if (fallas) { console.log(`t42: ${fallas} fallas`); process.exit(1); }
console.log("t42: OK");
