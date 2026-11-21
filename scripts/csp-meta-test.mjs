// eng-auditoria-8-checks: cada página de neuri.tech trae la CSP y el referrer como <meta> (GitHub Pages
// no deja headers) ANTES de cualquier <script>, sin comodín en scripts; y lo interno (docs, scripts,
// tools) no se publica. Con CHROME y playwright, abre páginas clave en un servidor local y falla si el
// navegador reporta una violación de la CSP (que nada se rompa). Uso: node scripts/csp-meta-test.mjs [--live]
import { spawn } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join, relative } from "node:path";
const root = new URL("..", import.meta.url).pathname;
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };
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
for (const p of pages) {
  const s = readFileSync(p, "utf8");
  const rel = relative(root, p);
  const m = s.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  if (!m) { bad(`${rel} sin meta CSP`); continue; }
  if (s.indexOf(m[0]) > s.search(/<script/i) && s.search(/<script/i) >= 0) bad(`${rel}: la CSP va después de un <script>`);
  const script = m[1].split(";").map((x) => x.trim()).find((x) => x.startsWith("script-src ")) || "";
  if (!script || /\s(\*|https:|http:)(\s|$)/.test(script)) bad(`${rel}: script-src ausente o con comodín`);
  if (!/default-src 'self'/.test(m[1]) || !/object-src 'none'/.test(m[1])) bad(`${rel}: falta default-src/object-src`);
  if (!/<meta name="referrer" content="strict-origin-when-cross-origin">/.test(s)) bad(`${rel} sin meta referrer`);
}
const cfg = readFileSync(join(root, "_config.yml"), "utf8");
for (const d of ["docs", "scripts", "tools"]) if (!new RegExp(`exclude:.*\\b${d}\\b`).test(cfg)) bad(`_config.yml no excluye ${d}/`);

// Navegador: ninguna violación de CSP en las páginas clave.
let chromium;
try { ({ chromium } = await import("playwright")); } catch {
  for (const dir of [process.env.PW_DIR, "../../neuri-bazar/apps/consulting/", "../../eng-neuri-bazar/apps/consulting/"].filter(Boolean)) {
    try { ({ chromium } = createRequire(new URL(dir, import.meta.url))("playwright-core")); break; } catch {}
  }
}
const exe = process.env.CHROME;
if (chromium && exe) {
  const port = 8790 + Math.floor(Math.random() * 100);
  const srv = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], { cwd: root, stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 800));
  const b = await chromium.launch({ executablePath: exe });
  try {
    const ctx = await b.newContext();
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.fulfill({ status: 204, body: "" }));
    for (const path of ["/", "/sigue-disponible/", "/bazar/", "/marketing/", "/afiliados/", "/en/home/", "/legal/", "/novedades/"]) {
      const pg = await ctx.newPage();
      const v = [];
      pg.on("console", (msg) => { if (/Content Security Policy/i.test(msg.text()) && !/frame-ancestors/.test(msg.text())) v.push(msg.text().slice(0, 160)); });
      await pg.addInitScript(() => document.addEventListener("securitypolicyviolation", (e) => console.log(`Content Security Policy: ${e.violatedDirective} ${e.blockedURI}`)));
      await pg.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: "load", timeout: 15000 }).catch(() => {});
      await pg.waitForTimeout(600);
      if (v.length) bad(`${path}: ${v.join(" | ")}`);
      await pg.close();
    }
  } finally { await b.close(); srv.kill(); }
} else console.log("(sin CHROME/playwright: solo revisión estática)");

if (process.argv.includes("--live")) {
  const h = await (await fetch("https://neuri.tech/")).text();
  if (!h.includes('http-equiv="Content-Security-Policy"')) bad("neuri.tech en vivo sin meta CSP");
  const r = await fetch("https://neuri.tech/docs/SITE-BACKLOG.html");
  if (r.status !== 404) bad(`docs/ sigue publicado en vivo (${r.status})`);
}
if (!fail) console.log(`✓ CSP en <meta> en ${pages.length} páginas, sin violaciones en el navegador; docs/scripts/tools fuera de Pages`);
process.exit(fail ? 1 : 0);
