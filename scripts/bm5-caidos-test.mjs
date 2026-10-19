// B-M5 (alta, neuri.tech): con los servicios externos caídos (Google Fonts, PostHog, API de bots
// sd.neuri.tech, consulting.neuri.tech/vendedor) las landings cargan igual: sin errores de JS,
// h1 y botón principal visibles, «Entrar» presente y sin scroll horizontal, 390/1280.
// Uso: node scripts/bm5-caidos-test.mjs [--live]  (sin --live usa un servidor local del repo)
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const root = new URL("..", import.meta.url).pathname;
const live = process.argv.includes("--live");
const PAGES = ["/", "/en/home/", "/bazar/", "/en/", "/sigue-disponible/", "/en/still-available/", "/consultoria/", "/en/ai-consulting/", "/marketing/", "/en/marketing/"];
const CAIDOS = /fonts\.googleapis\.com|fonts\.gstatic\.com|posthog\.com|sd\.neuri\.tech|consulting\.neuri\.tech|railway\.app/;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };

let base = "https://neuri.tech", server;
if (!live) {
  server = createServer((req, res) => {
    let p = join(root, decodeURIComponent(req.url.split("?")[0]));
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
    if (!existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" });
    res.end(readFileSync(p));
  }).listen(0);
  base = `http://localhost:${server.address().port}`;
}
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0, n = 0;
for (const w of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
  await ctx.route(CAIDOS, (r) => r.abort());
  for (const path of PAGES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    try {
      await page.goto(base + path, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(1200);
      const r = await page.evaluate(() => {
        const vis = (el) => !!el && el.getBoundingClientRect().height > 0 && getComputedStyle(el).visibility !== "hidden";
        const h1 = document.querySelector("h1");
        const entrar = [...document.querySelectorAll("summary, a")].some((a) => /^(Entrar|Sign in|Log in)\b/i.test(a.textContent.trim()));
        return { h1: vis(h1), entrar, scroll: document.documentElement.scrollWidth > innerWidth + 1 };
      });
      const bad = [];
      if (errs.length) bad.push(`error JS: ${errs[0]}`);
      if (!r.h1) bad.push("h1 no visible");
      if (!r.entrar) bad.push("sin «Entrar»");
      if (r.scroll) bad.push("scroll horizontal");
      if (bad.length) { fail++; console.error(`✗ ${path} @${w}: ${bad.join(" · ")}`); }
      n++;
    } catch (e) { fail++; console.error(`✗ ${path} @${w}: ${e.message}`); }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server?.close();
if (!fail) console.log(`✓ B-M5: ${n} vistas con Google Fonts/PostHog/APIs caídas cargan sin error, h1 + «Entrar», sin scroll horizontal${live ? " (en vivo)" : ""}`);
process.exit(fail ? 1 : 0);
