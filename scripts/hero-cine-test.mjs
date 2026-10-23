/**
 * Candado del hero cinematográfico de neuri.bazar (/en/ y /bazar/), ver scripts/hero-cine.py.
 *  1. Sin scroll lateral de 360 a 1920 px; el escenario cabe en su columna.
 *  2. La escena NO arranca vacía: con «reducir movimiento» se ve la venta completa (3 piezas,
 *     total final, «Pagado», aviso y saldo nuevo) — antes el hero mostraba «Escanea una etiqueta» y $0.
 *  3. Se rotula como datos de ejemplo (no hay cifras de clientes reales).
 *  4. axe WCAG 2 A/AA sin violaciones en el hero (390 y 1280).
 *  6. Todos los colores del hero están en la paleta de neuri.bazar (la de scripts/brand-check.mjs).
 *  5. La animación sigue corriendo después de que la página hidrata (morphdom no la reinicia).
 * Uso: node scripts/hero-cine-test.mjs [--live]
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { homedir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LIVE = process.argv.includes("--live");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" };
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
const axeSrc = existsSync(AXE) ? readFileSync(AXE, "utf8") : null;
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const fails = [];
// paleta de bazar = COMMON + PALETTE.bazar + ILLUSTRATION.bazar de brand-check.mjs (misma fuente de verdad)
const bc = readFileSync(join(ROOT, "scripts/brand-check.mjs"), "utf8");
const pick = (re) => (bc.match(re)?.[1].match(/#[0-9A-F]{6}/gi) || []);
const PAL = [...pick(/const COMMON = \[([^\]]+)\]/), ...pick(/PALETTE = \{[\s\S]*?bazar: \[([^\]]+)\]/), ...pick(/ILLUSTRATION = \{[\s\S]*?bazar: \[([^\]]+)\]/)].map((h) => h.toUpperCase());
const PAGES = { "/en/": { sample: "sample data", total: "$140.00" }, "/bazar/": { sample: "datos de ejemplo", total: "$1,400.00" } };

for (const [path, exp] of Object.entries(PAGES)) {
  for (const width of [360, 390, 768, 1024, 1280, 1440, 1920]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(base + path + (LIVE ? `?t=${Date.now()}` : ""), { waitUntil: "load" });
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const st = document.querySelector("#dc-a .hc-st"), wrap = document.querySelector("#dc-a .hc-wrap");
      if (!st) return null;
      const vis = (sel) => { const el = document.querySelector("#dc-a " + sel); return el ? Number(getComputedStyle(el).opacity) > 0.9 && el.textContent.trim() : null; };
      return {
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        stW: st.getBoundingClientRect().width, wrapW: wrap.getBoundingClientRect().width,
        rows: [...document.querySelectorAll("#dc-a .hc-row")].filter((e) => Number(getComputedStyle(e).opacity) > 0.9).length,
        total: vis(".hc-t3"), paid: vis(".hc-pd"), notif: vis(".hc-nt"), bal: vis(".hc-b1"), t0: vis(".hc-t0"),
        tag: document.querySelector("#dc-a .hc-tag")?.textContent || "",
        h1: document.querySelector("#dc-a h1")?.textContent || "",
      };
    });
    const at = `${width}px ${path}`;
    if (!r) { fails.push(`${at}: no está el hero .hc-st`); await ctx.close(); continue; }
    if (r.sw > r.cw) fails.push(`${at}: scroll lateral (${r.sw} > ${r.cw})`);
    if (r.stW > r.wrapW + 1) fails.push(`${at}: el escenario (${r.stW.toFixed(0)}) no cabe en su columna (${r.wrapW.toFixed(0)})`);
    if (r.rows !== 3) fails.push(`${at}: reducir movimiento muestra ${r.rows} piezas (esperaba 3)`);
    if (r.total !== exp.total) fails.push(`${at}: total final visible «${r.total}» (esperaba ${exp.total})`);
    if (!r.paid || !r.notif || !r.bal) fails.push(`${at}: falta pagado/aviso/saldo nuevo en el estado final`);
    if (r.t0) fails.push(`${at}: con reducir movimiento se ve el total en $0`);
    if (!r.tag.includes(exp.sample)) fails.push(`${at}: no dice «${exp.sample}»`);
    if (r.h1.length < 20) fails.push(`${at}: titular vacío`);
    if (width === 1280) {
      const seen = await page.evaluate(() => {
        const out = new Set(), hex = (c) => { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); if (!m || m[4] === "0") return null; return "#" + [m[1], m[2], m[3]].map((x) => Number(x).toString(16).padStart(2, "0")).join("").toUpperCase(); };
        for (const el of document.querySelectorAll("#dc-a #inicio, #dc-a #inicio *")) {
          const cs = getComputedStyle(el); if (cs.display === "none") continue;
          for (const k of ["color", "backgroundColor", "fill", "stroke", ...(parseFloat(cs.borderTopWidth) ? ["borderTopColor"] : [])]) { const h = hex(cs[k] || ""); if (h) out.add(h); }
        }
        return [...out];
      });
      const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      const off = seen.filter((c) => !PAL.some((a) => { const x = rgb(a), y = rgb(c); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) <= 24; }));
      if (off.length) fails.push(`${at}: colores fuera de la paleta de bazar: ${off.join(" ")}`);
    }
    if (axeSrc && (width === 390 || width === 1280)) {
      await page.addScriptTag({ content: axeSrc });
      const v = await page.evaluate(async () => (await window.axe.run("#inicio", { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
      if (v.length) fails.push(`${at}: axe ${v.join(", ")}`);
    }
    await ctx.close();
  }
  // 5. la animación corre tras hidratar (dc-lite arranca ~3 s después de load)
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: "load" });
  await page.waitForTimeout(5000);
  const anim = await page.evaluate(() => document.getAnimations().filter((a) => a.animationName?.startsWith("hc") && a.playState === "running").length);
  if (anim < 15) fails.push(`${path}: solo ${anim} animaciones hc corriendo tras hidratar`);
  await ctx.close();
}

browser.close().catch(() => {});
server.closeAllConnections?.(); server.close();
if (!axeSrc) console.log("(sin axe-core local: se omitió el punto 4)");
if (fails.length) { console.error("HERO-CINE FALLA\n- " + fails.join("\n- ")); process.exit(1); }
console.log(`HERO-CINE OK (${LIVE ? "en vivo" : "local"}): /en/ y /bazar/ × 7 anchos, estado final completo, datos de ejemplo rotulados, axe 0, animación viva tras hidratar`);
process.exit(0);
