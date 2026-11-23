// eng-alm-au-tech-headers (neuri.tech, clickjacking): GitHub Pages no deja mandar X-Frame-Options ni
// frame-ancestors (y frame-ancestors no sirve en <meta>), así que cada página trae el frame-buster de
// OWASP justo después de la CSP (lo pone scripts/csp-meta.py). Esta prueba:
//  1. estática: las páginas publicadas lo traen, en <head>, antes de cualquier otro <script>, sin hash
//     en script-src (un hash apagaría 'unsafe-inline' y rompería los <script> en línea);
//  2. navegador: la página carga normal (visible, sin errores de consola ni violaciones de CSP) a 390 y
//     1280 px; y desde OTRO origen metida en un iframe (normal y con sandbox) NO se ve: o se sale del
//     iframe (la ventana de arriba termina en neuri.tech) o se queda en blanco (html display:none).
// Uso: node scripts/t67-anti-iframe-test.mjs [--live]   (--live prueba https://neuri.tech en producción)
import { spawn } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const live = process.argv.includes("--live");
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };

// 1. Estática
const SKIP = new Set(["scripts", "tools", "docs", "node_modules", ".git"]);
const pages = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (d === root && (SKIP.has(n) || n.startsWith("."))) continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (n.endsWith(".html")) pages.push(p);
  }
})(root);
const STYLE = '<style id="antiClickjack">html{display:none!important}</style>';
for (const p of pages) {
  const s = readFileSync(p, "utf8");
  const rel = relative(root, p);
  const i = s.indexOf(STYLE);
  if (i < 0) { bad(`${rel} sin frame-buster`); continue; }
  const head = s.search(/<\/head>/i);
  if (head >= 0 && i > head) bad(`${rel}: el frame-buster no está en <head>`);
  const firstScript = s.search(/<script/i);
  if (firstScript < i) bad(`${rel}: hay un <script> antes del frame-buster`);
  const after = s.slice(i + STYLE.length, i + STYLE.length + 400);
  if (!/^<script>\(function\(\)\{try\{if\(self===top\)/.test(after) || !after.includes("top.location=self.location"))
    bad(`${rel}: falta el script que quita el estilo / se sale del iframe`);
  const csp = (s.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/) || [])[1] || "";
  if (/'sha(256|384|512)-/.test(csp)) bad(`${rel}: script-src con hash (apagaría 'unsafe-inline')`);
}

// 2. Navegador
let chromium;
try { ({ chromium } = await import("playwright")); } catch {
  for (const dir of [import.meta.url, process.env.PW_DIR, "../../neuri-bazar/apps/consulting/"].filter(Boolean)) {
    try { ({ chromium } = createRequire(new URL(dir, import.meta.url))("playwright")); break; } catch {}
    try { ({ chromium } = createRequire(new URL(dir, import.meta.url))("playwright-core")); break; } catch {}
  }
}
let browser = !!chromium;
if (!chromium) {
  console.log("(sin playwright: solo revisión estática)");
} else {
  const port = 8900 + Math.floor(Math.random() * 50);
  const evil = 8960 + Math.floor(Math.random() * 30);
  const srvs = [];
  if (!live) srvs.push(spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: root, stdio: "ignore" }));
  // «Atacante»: otro origen (localhost:otro puerto ≠ 127.0.0.1 ≠ neuri.tech), servidor de verdad en una
  // carpeta temporal (Chromium bloquea que una página «inventada» con route cargue 127.0.0.1).
  const evilDir = mkdtempSync(join(tmpdir(), "t67-"));
  writeFileSync(join(evilDir, "ataque.html"), `<!doctype html><title>ataque</title><p>Página de otro origen</p><script>
var q=new URLSearchParams(location.search),f=document.createElement("iframe");f.id="v";f.width=1200;f.height=800;
if(q.has("sandbox"))f.setAttribute("sandbox",q.get("sandbox"));f.src=q.get("src");document.body.appendChild(f);</script>`);
  srvs.push(spawn("python3", ["-m", "http.server", String(evil), "--bind", "127.0.0.1", "--directory", evilDir], { stdio: "ignore" }));
  await new Promise((r) => setTimeout(r, 900));
  const base = live ? "https://neuri.tech" : `http://127.0.0.1:${port}`;
  const evilOrigin = `http://localhost:${evil}`;
  const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const paths = ["/", "/bazar/", "/sigue-disponible/", "/marketing/", "/es/", "/legal/", "/afiliados/"];
  try {
    // 2a. Carga normal a 390 y 1280
    for (const width of [390, 1280]) {
      const ctx = await b.newContext({ viewport: { width, height: 900 } });
      if (!live) await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.fulfill({ status: 204, body: "" }));
      for (const path of paths) {
        const pg = await ctx.newPage();
        const errs = [];
        pg.on("console", (m) => { if (m.type() === "error" || /Content Security Policy/i.test(m.text())) errs.push(m.text().slice(0, 160)); });
        pg.on("pageerror", (e) => errs.push(`pageerror: ${String(e).slice(0, 160)}`));
        await pg.addInitScript(() => document.addEventListener("securitypolicyviolation", (e) => console.error(`Content Security Policy: ${e.violatedDirective} ${e.blockedURI}`)));
        await pg.goto(base + path, { waitUntil: "load", timeout: 30000 });
        await pg.waitForTimeout(500);
        const st = await pg.evaluate(() => ({
          display: getComputedStyle(document.documentElement).display,
          style: !!document.getElementById("antiClickjack"),
          h: document.body.getBoundingClientRect().height,
          sw: document.documentElement.scrollWidth,
        }));
        // frame-ancestors en <meta> lo ignora el navegador con un aviso conocido; no lo usamos, pero por si acaso.
        const real = errs.filter((t) => !/frame-ancestors/.test(t) && !(live && /Failed to load resource/.test(t)));
        if (st.display === "none" || st.style) bad(`${path} @${width}: la página se quedó oculta en la ventana de arriba`);
        if (st.h < 200) bad(`${path} @${width}: cuerpo casi vacío (${st.h}px)`);
        if (st.sw > width + 1) bad(`${path} @${width}: scroll horizontal (${st.sw}px)`);
        if (real.length) bad(`${path} @${width}: consola → ${real.join(" | ")}`);
        await pg.close();
      }
      await ctx.close();
    }
    // 2b. Metida en un iframe desde otro origen: normal y con sandbox (sin scripts, el truco clásico
    // para apagar frame-busters: ahí el estilo nunca se quita).
    for (const sandbox of ["", ' sandbox="allow-forms"', ' sandbox="allow-scripts allow-forms"']) {
      for (const path of ["/", "/bazar/", "/es/"]) {
        const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
        if (!live) await ctx.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.fulfill({ status: 204, body: "" }));
        const sb = sandbox.match(/sandbox="([^"]*)"/);
        const qs = new URLSearchParams({ src: base + path, ...(sb ? { sandbox: sb[1] } : {}) });
        const pg = await ctx.newPage();
        await pg.goto(`${evilOrigin}/ataque.html?${qs}`, { waitUntil: "load", timeout: 30000 }).catch(() => {});
        await pg.waitForTimeout(1500);
        const top = pg.url();
        const label = `${path} en iframe${sandbox || " (sin sandbox)"}`;
        if (top.startsWith(base)) { console.log(`  · ${label}: se salió del iframe (arriba quedó ${top})`); await ctx.close(); continue; }
        const fr = pg.frames().find((f) => f.url().startsWith(base));
        // Si el iframe ni siquiera cargó, la prueba no prueba nada: falla.
        if (!fr) { bad(`${label}: el iframe no cargó (frames: ${pg.frames().map((f) => f.url()).join(", ")})`); await ctx.close(); continue; }
        const st = await fr.evaluate(() => ({
          display: getComputedStyle(document.documentElement).display,
          visible: document.documentElement.getBoundingClientRect().height,
        })).catch((e) => ({ err: String(e).slice(0, 120) }));
        if (st.err) bad(`${label}: no se pudo revisar (${st.err})`);
        else if (st.display !== "none" || st.visible > 0) bad(`${label}: ¡se ve dentro del iframe! (display ${st.display}, alto ${st.visible})`);
        else console.log(`  · ${label}: en blanco (html display:none)`);
        await ctx.close();
      }
    }
  } finally { await b.close(); srvs.forEach((s) => s.kill()); rmSync(evilDir, { recursive: true, force: true }); }
}
if (live) {
  // Bandera «Cloudflare» (docs/CLOUDFLARE-HEADERS-ENCENDER.md): informativo, no falla mientras esté apagado.
  const h = (await fetch("https://neuri.tech/")).headers;
  const on = /deny/i.test(h.get("x-frame-options") || "") && /nosniff/i.test(h.get("x-content-type-options") || "") && !!h.get("permissions-policy");
  console.log(`  · headers de Cloudflare: ${on ? "ENCENDIDOS" : "apagados (solo frame-buster)"} · server: ${h.get("server")}`);
  const html = await (await fetch("https://neuri.tech/")).text();
  if (!html.includes(STYLE)) bad("neuri.tech en vivo todavía sin frame-buster");
}
if (!fail && !browser) console.log(`✓ T67 (estática): frame-buster en ${pages.length} páginas`);
else if (!fail) console.log(`✓ T67: frame-buster en ${pages.length} páginas; carga normal a 390/1280 sin errores; en iframe de otro origen no se ve${live ? " (en vivo, neuri.tech)" : ""}`);
process.exit(fail ? 1 : 0);
