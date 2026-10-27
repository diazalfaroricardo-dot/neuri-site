/**
 * AF3 (27-oct): vista previa del programa de afiliados en /afiliados/ y /en/affiliates/.
 * A 390 y 1280 px, ES y EN: sin scroll horizontal, axe WCAG 2 A/AA 0 violaciones, noindex,
 * botón de solicitud deshabilitado (el formulario no envía nada), 20 % y mínimos US$25 / MX$500
 * presentes, panel marcado como ejemplo, toques ≥44 px. Además: título 20–65 caracteres,
 * hreflang recíproco y que ninguna otra página ni el sitemap enlacen a la vista previa.
 * Uso: node scripts/af3-afiliados-test.mjs   (CHROME=/ruta/chrome o PLAYWRIGHT_BROWSERS_PATH; AXE=/ruta/axe.min.js)
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
const base = `http://127.0.0.1:${server.address().port}`;

const AXE = [process.env.AXE, join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js"),
  ...[homedir(), "/home/claude"].flatMap((h) => ["neuri-bazar", "nb-k85r"].map((d) => join(h, d, "node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js"))),
  join(ROOT, "node_modules/axe-core/axe.min.js")].filter(Boolean).find((f) => existsSync(f));
const axeSrc = AXE ? readFileSync(AXE, "utf8") : "";

let fails = 0;
const bad = (m) => { fails++; console.log("✗", m); };

const PAGES = [
  { path: "/afiliados/", file: "afiliados/index.html", lang: "es", pair: "https://neuri.tech/en/affiliates/", example: /Ejemplo · datos ficticios/i, soon: /^Pronto — el programa abre cuando Neuri lo encienda$/ },
  { path: "/en/affiliates/", file: "en/affiliates/index.html", lang: "en", pair: "https://neuri.tech/afiliados/", example: /Example · fictional data/i, soon: /^Coming soon — the program opens when Neuri turns it on$/ },
];

// Estático: noindex, título, hreflang recíproco, sin enlaces desde otras páginas ni sitemap.
for (const p of PAGES) {
  const h = readFileSync(join(ROOT, p.file), "utf8");
  if (!/<meta name="robots" content="noindex">/.test(h)) bad(`${p.path}: falta noindex`);
  const t = (h.match(/<title>([^<]*)<\/title>/) || [, ""])[1];
  if (t.length < 20 || t.length > 65) bad(`${p.path}: título de ${t.length} caracteres «${t}»`);
  if (!h.includes(`<link rel="alternate" hreflang="${p.lang === "es" ? "en" : "es"}" href="${p.pair}">`)) bad(`${p.path}: hreflang al par falta`);
  if (/<form[^>]*\baction="(?!#")/.test(h) || /fetch\(|XMLHttpRequest|sendBeacon/.test(h)) bad(`${p.path}: el formulario podría enviar datos`);
}
if (/afiliados|affiliates/.test(readFileSync(join(ROOT, "sitemap.xml"), "utf8"))) bad("sitemap.xml enlaza la vista previa");
const SKIP = new Set(["node_modules", ".git", "scripts", "docs", "tools", "tmp", "afiliados", "affiliates"]);
(function walk(d) {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n) || n.startsWith(".")) continue;
    const f = join(d, n);
    if (statSync(f).isDirectory()) walk(f);
    else if (/\.(html|js|txt)$/.test(n) && /href="\/(en\/affiliates|afiliados)\//.test(readFileSync(f, "utf8"))) bad(`${relative(ROOT, f)} enlaza la vista previa`);
  }
})(ROOT);

const launch = { };
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
      const btn = document.querySelector("#solicitud button, #apply button");
      const targets = [...document.querySelectorAll("a, button, summary, input, textarea")].filter(vis)
        .filter((e) => !(e.closest("p, li, td, caption") && e.tagName === "A")) // links dentro de texto: excepción WCAG 2.5.8
        .map((e) => { const b = e.getBoundingClientRect(); return { t: (e.textContent || e.name || e.tagName).trim().slice(0, 40), w: Math.round(b.width), h: Math.round(b.height), tag: e.tagName }; });
      return {
        sw: document.documentElement.scrollWidth,
        text: document.body.innerText,
        btn: btn && { disabled: btn.disabled, text: btn.textContent.trim(), fs: btn.closest("fieldset")?.disabled },
        targets,
      };
    });
    if (r.sw > width) bad(`${where}: scroll horizontal ${r.sw}px`);
    if (!r.btn) bad(`${where}: no encontré el botón de solicitud`);
    else {
      if (!r.btn.disabled || !r.btn.fs) bad(`${where}: el botón/formulario no está deshabilitado`);
      if (!p.soon.test(r.btn.text)) bad(`${where}: texto del botón «${r.btn.text}»`);
    }
    for (const need of [/20 %/, /US\$25 \/ MX\$500/, /12 (meses|months)/, /60 (días|days)/, /30 (días|days)/, /Stripe Connect/, p.example]) {
      if (!need.test(r.text)) bad(`${where}: falta ${need}`);
    }
    for (const t of r.targets) {
      taps++;
      const min = t.tag === "INPUT" && t.w < 44 ? 24 : 44; // checkbox: 24 px (WCAG 2.5.8), su label completo también se toca
      if (t.h < min || t.w < min) bad(`${where}: «${t.t}» (${t.tag}) mide ${t.w}x${t.h}px`);
    }
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
if (!fails) console.log(`✓ AF3 afiliados: ES/EN × 390/1280 sin scroll, axe AA 0, noindex, botón deshabilitado, 20 % y mínimos, ${taps} toques ≥44 px, sin enlazar`);
process.exit(fails ? 1 : 0);
