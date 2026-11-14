/**
 * t44 (14-nov, con el «sí» de Ricardo): neuri.ventures medio escondida en /ventures/ y /en/ventures/.
 * Estático: noindex,nofollow; fuera de sitemap.xml y llms.txt; ninguna otra página la enlaza (ni menú ni pie);
 * sin *.railway.app; hreflang recíproco; solo lista Neuri Café, privada (sin enlace a la app, solo «Pedir acceso» por correo).
 * Navegador: ES/EN × 390/1280 sin scroll horizontal, axe WCAG 2 A/AA 0 violaciones y toques ≥44 px.
 * Uso: node scripts/ventures-t44-test.mjs   (CHROME=/ruta/chrome o PLAYWRIGHT_BROWSERS_PATH; AXE=/ruta/axe.min.js)
 */
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { createServer } from "node:http";
import { extname, join, normalize, relative, resolve } from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = await import("playwright-core")); }

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
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
const base = `http://127.0.0.1:${server.address().port}`;

const AXE = [process.env.AXE, join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js"),
  ...[homedir(), "/home/claude"].flatMap((h) => ["neuri-bazar", "nb-k85r"].map((d) => join(h, d, "node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js"))),
  join(ROOT, "node_modules/axe-core/axe.min.js")].filter(Boolean).find((f) => existsSync(f));
const axeSrc = AXE ? readFileSync(AXE, "utf8") : "";

let fails = 0;
const bad = (m) => { fails++; console.log("✗", m); };

const PAGES = [
  { path: "/ventures/", file: "ventures/index.html", lang: "es", pair: "https://neuri.tech/en/ventures/", access: /^Pedir acceso/ },
  { path: "/en/ventures/", file: "en/ventures/index.html", lang: "en", pair: "https://neuri.tech/ventures/", access: /^Request access/ },
];

// Estático: medio escondida.
for (const p of PAGES) {
  const h = readFileSync(join(ROOT, p.file), "utf8");
  if (!/<meta name="robots" content="noindex,nofollow">/.test(h)) bad(`${p.path}: falta <meta name="robots" content="noindex,nofollow">`);
  if (!h.includes(`<html lang="${p.lang}"`)) bad(`${p.path}: <html lang> no es ${p.lang}`);
  if (!h.includes(`<link rel="alternate" hreflang="${p.lang === "es" ? "en" : "es"}" href="${p.pair}">`)) bad(`${p.path}: hreflang al par falta`);
  if (/railway\.app/i.test(h)) bad(`${p.path}: muestra una URL de Railway`);
  if (!h.includes("Neuri Café")) bad(`${p.path}: no lista Neuri Café`);
}
const sm = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
if (/\/ventures\//.test(sm)) bad("sitemap.xml incluye /ventures/ (debe quedar fuera)");
if (existsSync(join(ROOT, "llms.txt")) && /ventures/i.test(readFileSync(join(ROOT, "llms.txt"), "utf8"))) bad("llms.txt menciona ventures (debe quedar fuera)");
const SKIP = new Set(["node_modules", ".git", "scripts", "docs", "tools", "tmp"]);
(function walk(d) {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n) || n.startsWith(".")) continue;
    const f = join(d, n);
    if (statSync(f).isDirectory()) { walk(f); continue; }
    if (!/\.(html|js|txt|xml|json)$/.test(n)) continue;
    const rel = relative(ROOT, f);
    if (rel === "ventures/index.html" || rel === "en/ventures/index.html") continue;
    if (/href=["'](?:https:\/\/neuri\.tech)?\/(?:en\/)?ventures\//.test(readFileSync(f, "utf8"))) bad(`${rel} enlaza a ventures (debe quedar sin enlaces en menú ni pie)`);
  }
})(ROOT);

const launch = {};
if (process.env.CHROME) launch.executablePath = process.env.CHROME;
else if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync("/opt/pw-browsers")) process.env.PLAYWRIGHT_BROWSERS_PATH = "/opt/pw-browsers";
const browser = await chromium.launch(launch);
let taps = 0;
for (const width of [390, 1280]) {
  for (const p of PAGES) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    await page.goto(base + p.path, { waitUntil: "load" });
    const where = `${p.path}@${width}`;
    const r = await page.evaluate(() => {
      const vis = (e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden";
      const apps = [...document.querySelectorAll("article.card:not(.empty):not(.wide) h3")].map((h) => h.textContent.trim());
      const cafe = document.querySelector("#cafe-h")?.closest("article");
      const links = cafe ? [...cafe.querySelectorAll("a")].map((a) => ({ href: a.getAttribute("href"), t: a.textContent.trim() })) : [];
      const targets = [...document.querySelectorAll("a, button, summary, input")].filter(vis)
        .filter((e) => !(e.closest("p, li, td, caption") && e.tagName === "A") && !e.classList.contains("skip"))
        .map((e) => { const b = e.getBoundingClientRect(); return { t: (e.textContent || e.tagName).trim().slice(0, 40), w: Math.round(b.width), h: Math.round(b.height) }; });
      return { sw: document.documentElement.scrollWidth, apps, links, targets, text: document.body.innerText };
    });
    if (r.sw > width) bad(`${where}: scroll horizontal ${r.sw}px`);
    if (r.apps.join("|") !== "Neuri Café") bad(`${where}: apps listadas «${r.apps.join(", ")}» (solo Neuri Café)`);
    if (r.links.length !== 1 || !/^mailto:hola@neuri\.tech/.test(r.links[0].href) || !p.access.test(r.links[0].t)) bad(`${where}: Neuri Café debe tener un solo botón «Pedir acceso» por correo: ${JSON.stringify(r.links)}`);
    if (/railway\.app/i.test(r.text)) bad(`${where}: texto con railway.app`);
    for (const t of r.targets) { taps++; if (t.h < 44 || t.w < 44) bad(`${where}: «${t.t}» mide ${t.w}x${t.h}px`); }
    if (axeSrc) {
      await page.addScriptTag({ content: axeSrc });
      const v = await page.evaluate(async () => {
        const res = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] });
        return res.violations.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`);
      });
      if (v.length) bad(`${where}: axe ${v.join("; ")}`);
    } else bad("no encontré axe-core (define AXE=/ruta/axe.min.js)");
    await page.close();
  }
}
await browser.close();
server.close();
if (!fails) console.log(`✓ t44 ventures: noindex,nofollow, fuera de sitemap/llms.txt y sin enlaces desde otras páginas; solo Neuri Café con «Pedir acceso»; ES/EN × 390/1280 sin scroll, axe AA 0, ${taps} toques ≥44 px`);
process.exit(fails ? 1 : 0);
