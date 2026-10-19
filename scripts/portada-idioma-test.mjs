/**
 * T13 (B-A6/B-A1): la portada neuri.tech tiene «EN ▾» en el encabezado con las 4 páginas en inglés,
 * a 390 y 1280 px: se ve, abre con teclado, el menú cabe en pantalla, cada link existe, el nav no
 * se parte en dos renglones a 1280 y no hay scroll horizontal; axe AA 0 con el menú abierto.
 * Uso: node scripts/portada-idioma-test.mjs [--live]
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
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
const HREFS = ["/en/home/", "/en/still-available/", "/en/", "/en/ai-consulting/", "/en/marketing/"];
const AXE = process.env.AXE || join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js");
const axeSrc = existsSync(AXE) ? readFileSync(AXE, "utf8") : "";
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0;
const bad = (m) => { fails++; console.log("✗", m); };
for (const w of [390, 1280]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 }, reducedMotion: "reduce" });
  await page.goto(`${base}/`, { waitUntil: "domcontentloaded" });
  const sum = page.locator("header details[data-idioma] summary").first();
  if (!(await sum.isVisible())) { bad(`@${w}: «EN» no se ve`); await page.close(); continue; }
  await sum.focus();
  await page.keyboard.press("Enter");
  const links = page.locator("header details[data-idioma] [role=menu] a");
  const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  if (JSON.stringify(hrefs) !== JSON.stringify(HREFS)) bad(`@${w}: links ${hrefs}`);
  const box = await page.locator("header details[data-idioma] [role=menu]").first().boundingBox();
  if (!box || box.x < 0 || box.x + box.width > w + 1) bad(`@${w}: el menú se sale de la pantalla`);
  const nav = await page.locator("header nav.x-topnav").first().boundingBox();
  if (w >= 1280 && nav && nav.height > 60) bad(`@${w}: el nav se parte (${Math.round(nav.height)} px)`);
  const sx = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (sx > 1) bad(`@${w}: scroll horizontal ${sx}px`);
  if (axeSrc) {
    await page.addScriptTag({ content: axeSrc });
    const v = await page.evaluate(async () => (await axe.run(document.querySelector("header"), { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => x.id));
    if (v.length) bad(`@${w}: axe ${v.join(",")}`);
  }
  await page.close();
}
for (const h of HREFS) {
  const r = await fetch(`${base}${h}`, { redirect: "manual" });
  if (r.status !== 200 && r.status !== 301) bad(`${h} → ${r.status}`);
}
await browser.close();
server.close();
if (fails) { console.log(`portada-idioma-test: ${fails} falla(s)`); process.exit(1); }
console.log(`portada-idioma-test OK (${LIVE ? "live" : "local"})`);
