/**
 * A102: chequeo visual de las páginas públicas (como A91 en sd-setup). Sirve el sitio estático en
 * proceso y, a 390 y 1280 px, revisa: sin scroll horizontal, cada campo con etiqueta, toques ≥44 px
 * (un link en línea dentro de <p>/<li> puede ser ≥24 px, WCAG 2.5.8), sin errores de consola ni
 * recursos 4xx, y sin «ManyChat» en las páginas del producto (Instagram/Facebook primero).
 *
 * Uso: node scripts/visual.mjs   (CHROME=ruta opcional; capturas en SHOTS=dir opcional)
 */
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const OUT = process.env.SHOTS ? resolve(process.env.SHOTS) : "";
if (OUT) mkdirSync(OUT, { recursive: true });
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
};
const server = createServer((req, res) => {
  let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let f = join(ROOT, p);
  if (!f.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const pages = [
  { name: "home", path: "/" },
  { name: "sigue-disponible", path: "/sigue-disponible/", product: true },
  { name: "privacidad", path: "/sigue-disponible/privacidad/" },
  { name: "hoja", path: "/sigue-disponible/hoja/" },
  { name: "still-available", path: "/en/still-available/", product: true },
  { name: "privacy", path: "/en/still-available/privacy/" },
  { name: "sheet", path: "/en/still-available/sheet/" },
  { name: "bazar-terminos", path: "/bazar/terminos/" },
  { name: "bazar-privacidad", path: "/bazar/privacidad/" },
  { name: "bazar-terms", path: "/en/bazar/terms/" },
  { name: "bazar-privacy", path: "/en/bazar/privacy/" },
  { name: "bazar-borrar", path: "/bazar/borrar-mis-datos/" },
  { name: "bazar-delete", path: "/en/bazar/delete-my-data/" },
  { name: "consultoria", path: "/consultoria/" },
  { name: "ai-consulting", path: "/en/ai-consulting/" },
  { name: "marketing", path: "/marketing/" },
  { name: "marketing-en", path: "/en/marketing/" },
];

// CHROME=ruta; si no, el Chromium de /opt/pw-browsers (si existe) o el que instaló Playwright.
const local = ["/opt/pw-browsers/chromium", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find(
  (x) => existsSync(x),
);
const browser = await chromium.launch({ executablePath: process.env.CHROME || local });
const problems = [];
for (const pg of pages) {
  for (const width of [390, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const p = await ctx.newPage();
    const errs = [];
    // T26: las landings preguntan a consulting.neuri.tech / sd.neuri.tech si hay sesión o vendedor de IA.
    // Desde 127.0.0.1 su CORS (solo neuri.tech) las bloquea y Chrome lo reporta como error de la página.
    // Respondemos 503 con CORS para el origen local: así además se prueba que la página aguanta el servicio caído (B-M5).
    await p.route(/^https:\/\/(consulting|sd|bazar|marketing)\.neuri\.tech\/(api\/|estado)/, (route) =>
      route.fulfill({
        status: 503,
        headers: { "access-control-allow-origin": base, "access-control-allow-credentials": "true" },
        contentType: "application/json",
        body: "{}",
      }),
    );
    p.on("console", (m) => {
      // Solo errores de este sitio: fuentes/analítica externas pueden fallar sin red.
      const u = m.location().url || "";
      if (m.type() === "error" && !u.endsWith("/favicon.ico") && (!u || u.startsWith(base)))
        errs.push(`${m.text()} ${m.location().url}`);
    });
    p.on("pageerror", (e) => errs.push(e.message));
    p.on("requestfailed", (x) => {
      // Recursos externos (fuentes, analítica) no cuentan si no hay red.
      if (x.url().startsWith(base)) errs.push(`falló ${new URL(x.url()).pathname}`);
    });
    p.on("response", (x) => {
      if (x.status() >= 400 && x.url().startsWith(base) && !x.url().endsWith("/favicon.ico"))
        errs.push(`${x.status()} ${new URL(x.url()).pathname}`);
    });
    const r = await p.goto(base + pg.path, { waitUntil: "load" });
    await p.waitForTimeout(150);
    if (OUT) await p.screenshot({ path: join(OUT, `${pg.name}-${width}.png`), fullPage: true });
    const tag = `${pg.name}@${width}`;
    if (!r || r.status() >= 400) problems.push(`${tag}: HTTP ${r?.status()}`);
    const m = await p.evaluate(() => {
      const vis = (e) => {
        const r = e.getBoundingClientRect();
        const st = getComputedStyle(e);
        return r.width > 0 && r.height > 0 && st.visibility !== "hidden";
      };
      const label = (el) => {
        if (el.type === "hidden" || el.type === "submit") return true;
        if (el.labels && el.labels.length > 0) return true;
        return !!(el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.title);
      };
      const txt = (e) => (e.innerText || e.getAttribute("aria-label") || e.id || "").trim().slice(0, 40);
      const small = [];
      const sel = "a[href],button,input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,summary";
      for (const e of document.querySelectorAll(sel)) {
        if (!vis(e) || e.tabIndex < 0 || e.closest("[aria-hidden=true]")) continue;
        const h = e.getBoundingClientRect().height;
        const inline = !!e.closest("p,li") && e.tagName === "A";
        if (h < (inline ? 24 : 44)) small.push(`${e.tagName.toLowerCase()} «${txt(e)}» ${Math.round(h)}px`);
      }
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        unlabeled: [...document.querySelectorAll("input,select,textarea")]
          .filter((e) => !label(e))
          .map((e) => e.name || e.id || e.tagName),
        small,
        manychat: /manychat/i.test(document.body.innerText),
      };
    });
    if (m.overflow > 0) problems.push(`${tag}: scroll horizontal (+${m.overflow}px)`);
    for (const u of m.unlabeled) problems.push(`${tag}: campo sin etiqueta: ${u}`);
    for (const x of m.small) problems.push(`${tag}: toque chico: ${x}`);
    if (pg.product && m.manychat) problems.push(`${tag}: dice «ManyChat»`);
    for (const e of errs) problems.push(`${tag}: consola: ${e}`);
    await ctx.close();
  }
}
await browser.close();
server.close();
console.log(`A102: ${pages.length} páginas × 2 anchos revisadas`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
