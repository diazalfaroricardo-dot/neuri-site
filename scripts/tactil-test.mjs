/**
 * T22 (19-oct): también ≥44 px de ancho y 11 páginas (landings ES/EN de los 4 productos, tour, borrar datos, hoja).
 * T9 / B-N2: áreas táctiles de 44 px en /consultoria, /en/ai-consulting, /bazar y /en/ —
 * «Solicitar diagnóstico» del encabezado y todos los links del pie miden ≥44 px de alto
 * a 390 y 1280 px, sin scroll horizontal y con axe AA 0 en encabezado y pie.
 * T8 / B-P1: el título de /consultoria y /en/ai-consulting no repite la marca (termina en «| Neuri Consulting»).
 * Uso: node scripts/tactil-test.mjs [--live]
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LIVE = process.argv.includes("--live");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let f = join(ROOT, p);
  if (!f.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = LIVE ? "https://neuri.tech" : `http://127.0.0.1:${server.address().port}`;
const AXE = process.env.AXE || join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js");
const axeSrc = existsSync(AXE) ? readFileSync(AXE, "utf8") : "";
const PAGES = ["/consultoria/", "/en/ai-consulting/", "/bazar/", "/en/", "/sigue-disponible/", "/en/still-available/", "/marketing/", "/en/marketing/", "/en/bazar/tour/", "/en/bazar/delete-my-data/", "/en/still-available/sheet/", "/bazar/recorrido/", "/bazar/borrar-mis-datos/", "/bazar/privacidad/", "/en/bazar/terms/"];
for (const f of ["consultoria/index.html", "en/ai-consulting/index.html"]) {
  const t = (readFileSync(join(ROOT, f), "utf8").match(/<title>([^<]*)</) || [])[1] || "";
  if (!t.endsWith("| Neuri Consulting") || (t.match(/Neuri/g) || []).length > 1) { console.log("✗", `${f}: título «${t}»`); process.exitCode = 1; }
}
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0, checked = 0;
const bad = (m) => { fails++; console.log("✗", m); };
for (const width of [390, 1280]) {
  for (const path of PAGES) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion: "reduce" });
    await page.goto(base + path, { waitUntil: "load" });
    const small = await page.evaluate(() => {
      const els = [...document.querySelectorAll("footer a, header .btn.sm, nav .btn.sm")];
      return els.filter((a) => a.getClientRects().length && getComputedStyle(a).visibility !== "hidden")
        .map((a) => ({ t: a.textContent.trim().slice(0, 30), h: Math.round(a.getBoundingClientRect().height), w: Math.round(a.getBoundingClientRect().width) }));
    });
    if (!small.length) bad(`${path}@${width}: no encontré links en el pie`);
    for (const s of small) { checked++; if (s.h < 44 || s.w < 44) bad(`${path}@${width}: «${s.t}» mide ${s.w}x${s.h}px`); }
    if (axeSrc) {
      await page.addScriptTag({ content: axeSrc });
      const v = await page.evaluate(async () => {
        const r = await window.axe.run({ include: [["footer"], ["header"], ["nav"]] }, { runOnly: ["wcag2a", "wcag2aa"] });
        return r.violations.map((x) => `${x.id} (${x.nodes.length})`);
      });
      if (v.length) bad(`${path}@${width}: axe ${v.join(", ")}`);
    }
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > width) bad(`${path}@${width}: scroll horizontal ${sw}px`);
    await page.close();
  }
}
await browser.close();
server.close();
if (!fails) console.log(`✓ ${checked} links/botones ≥44 px en ${PAGES.length} páginas × 390/1280${axeSrc ? ", axe AA 0" : " (sin axe)"}${LIVE ? " (en vivo)" : ""}`);
process.exit(fails || process.exitCode ? 1 : 0);
