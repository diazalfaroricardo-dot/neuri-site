// T21 (B-A6): a 390 px el cambio de idioma de las landings de consulting y neuri.bots se ve en el encabezado
// (antes quedaba oculto con class="hide"), con área táctil ≥44 px, sin scroll horizontal
// y sin que el encabezado se parta. Uso: node scripts/t21-idioma-visible-test.mjs [--live]
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, normalize, resolve, extname } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LIVE = process.argv.includes("--live");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let f = join(ROOT, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) { res.writeHead(404); return res.end("404"); }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = LIVE ? "https://neuri.tech" : `http://127.0.0.1:${server.address().port}`;
const CASES = [
  { path: "/consultoria/", label: "EN", href: "/en/ai-consulting/" },
  { path: "/en/ai-consulting/", label: "ES", href: "/consultoria/" },
  { path: "/sigue-disponible/", label: "EN", href: "/en/still-available/" },
  { path: "/en/still-available/", label: "ES", href: "/sigue-disponible/" },
];
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0;
for (const c of CASES) for (const width of [390, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(base + c.path + "?lang=" + (c.path.startsWith("/en") ? "en" : "es"), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate((c) => {
    const a = [...document.querySelectorAll("header nav a[data-idioma], nav a[data-idioma]")][0];
    if (!a) return { err: "sin link de idioma en el encabezado" };
    const b = a.getBoundingClientRect(), cs = getComputedStyle(a);
    const nav = a.closest("nav").getBoundingClientRect();
    return { text: a.textContent.trim(), href: a.getAttribute("href"), visible: cs.display !== "none" && cs.visibility !== "hidden" && b.width > 0,
      w: b.width, h: b.height, right: b.right, vw: innerWidth, sw: document.documentElement.scrollWidth, navH: nav.height };
  }, c);
  const bad = [];
  if (r.err) bad.push(r.err);
  else {
    if (!r.visible) bad.push("no se ve");
    if (r.text !== c.label) bad.push(`texto ${r.text}`);
    if (r.href !== c.href) bad.push(`href ${r.href}`);
    if (r.w < 44 || r.h < 44) bad.push(`toque ${Math.round(r.w)}x${Math.round(r.h)}`);
    if (r.right > r.vw) bad.push("se sale de la pantalla");
    if (r.sw > r.vw) bad.push(`scroll horizontal ${r.sw}>${r.vw}`);
    if (r.navH > 90) bad.push(`encabezado partido ${Math.round(r.navH)} px`);
  }
  console.log(`${bad.length ? "FALLA" : "OK"} ${c.path}@${width}${bad.length ? ": " + bad.join(", ") : ""}`);
  fails += bad.length ? 1 : 0;
  await page.close();
}
await browser.close();
server.close();
process.exit(fails ? 1 : 0);
