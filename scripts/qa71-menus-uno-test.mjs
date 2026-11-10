/**
 * QA #71: en neuri.tech, abrir «Entrar» y luego el menú de idioma (o al revés) deja un solo menú
 * abierto, a 390 y 1280 px, en ES y EN. Uso: node scripts/qa71-menus-uno-test.mjs [--live]
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
  const t = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" }[extname(f)] || "application/octet-stream";
  res.writeHead(200, { "content-type": t });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = LIVE ? "https://neuri.tech" : `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0;
for (const path of ["/"]) {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(base + path + (LIVE ? `?v=${Date.now()}` : ""), { waitUntil: "load" });
    for (const [a, b] of [["data-entrar", "data-idioma"], ["data-idioma", "data-entrar"]]) {
      await page.evaluate(() => document.querySelectorAll("details[open]").forEach((d) => { d.open = false; }));
      const sa = page.locator(`details[${a}] > summary`).first();
      const sb = page.locator(`details[${b}] > summary`).first();
      if (!(await sa.count()) || !(await sb.count())) continue;
      await sa.click();
      await sb.click();
      await page.waitForTimeout(100);
      const abiertos = await page.evaluate(() => [...document.querySelectorAll("details[data-entrar], details[data-idioma]")].filter((d) => d.open).map((d) => (d.hasAttribute("data-entrar") ? "entrar" : "idioma")));
      const esperado = b === "data-entrar" ? "entrar" : "idioma";
      const ok = abiertos.length === 1 && abiertos[0] === esperado;
      if (!ok) fails++;
      console.log(`${ok ? "ok" : "FALLA"} ${path} ${width}px ${a}→${b}: abiertos=${JSON.stringify(abiertos)}`);
      // Reabierto: dos toques seguidos y la lectura en el mismo instante (sin esperar el «toggle»).
      await page.evaluate(() => document.querySelectorAll("details[open]").forEach((d) => { d.open = false; }));
      await page.waitForTimeout(50);
      const inst = await page.evaluate(([x, y]) => {
        document.querySelector(`details[${x}] > summary`).click();
        document.querySelector(`details[${y}] > summary`).click();
        return [...document.querySelectorAll("details[data-entrar], details[data-idioma]")].filter((d) => d.open).length;
      }, [a, b]);
      if (inst !== 1) fails++;
      console.log(`${inst === 1 ? "ok" : "FALLA"} ${path} ${width}px ${a}→${b} al instante: abiertos=${inst}`);
    }
    await page.close();
  }
}
await browser.close();
server.close();
process.exit(fails ? 1 : 0);
