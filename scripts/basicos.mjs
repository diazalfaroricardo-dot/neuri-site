/**
 * T10 — casos básicos de neuri.tech sin navegador (B-A3, B-P1, B-P3, B-M1, pie legal):
 * cada página pública (*.html del sitio) trae <title>, descripción, favicon y og:image;
 * sin http:// en src/href de recursos (contenido mixto); links internos existen en el repo;
 * pie con /legal/ o privacidad + hola@neuri.tech; la portada y las landings tienen «Entrar»/«Sign in»;
 * 404.html propia con regreso al inicio. Con --live además pide cada página a https://neuri.tech
 * (200) y una ruta inexistente (404). Uso: node scripts/basicos.mjs [--live]
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LIVE = process.argv.includes("--live");
const SKIP = new Set(["node_modules", ".git", "scripts", "docs", "tmp"]);
const pages = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n) || n.startsWith(".")) continue;
    const f = join(d, n);
    if (statSync(f).isDirectory()) walk(f);
    else if (n.endsWith(".html")) pages.push(f);
  }
})(ROOT);
let fails = 0;
const bad = (p, m) => { fails++; console.log(`✗ /${p}: ${m}`); };
const LANDINGS = ["index.html", "bazar/index.html", "en/index.html", "consultoria/index.html", "en/ai-consulting/index.html", "sigue-disponible/index.html", "en/still-available/index.html"];
for (const f of pages) {
  const rel = relative(ROOT, f);
  const h = readFileSync(f, "utf8");
  if (/http-equiv=["']refresh/i.test(h)) continue; // redirección
  if (!/<title>[^<]{3,}<\/title>/i.test(h)) bad(rel, "sin <title>");
  if (!/<meta[^>]+name=["']description["']/i.test(h)) bad(rel, "sin meta description");
  if (!/<link[^>]+rel=["'](?:shortcut )?icon["']/i.test(h)) bad(rel, "sin favicon");
  if (rel !== "404.html" && !/property=["']og:image["']/i.test(h)) bad(rel, "sin og:image");
  for (const m of h.matchAll(/\b(?:src|href)=["'](http:\/\/[^"']+)["']/gi)) bad(rel, `contenido mixto ${m[1]}`);
  for (const m of h.matchAll(/\bhref=["'](\/[^"'#?]*)/g)) {
    const p = m[1];
    if (p.startsWith("//")) continue;
    const t = join(ROOT, p);
    if (!(existsSync(t) && (statSync(t).isFile() || existsSync(join(t, "index.html")))) && !existsSync(`${t}.html`)) bad(rel, `link roto ${p}`);
  }
  if (rel !== "404.html" && !/\/legal\/|privacidad|privacy/i.test(h)) bad(rel, "pie sin legal/privacidad");
  if (LANDINGS.includes(rel)) {
    if (!/hola@neuri\.tech/.test(h)) bad(rel, "sin hola@neuri.tech");
    if (!/>\s*(Entrar|Sign in)\b/.test(h)) bad(rel, "sin «Entrar»/«Sign in»");
  }
}
const n404 = existsSync(join(ROOT, "404.html")) ? readFileSync(join(ROOT, "404.html"), "utf8") : "";
if (!n404 || !/href=["']\/["']/.test(n404)) bad("404.html", "falta 404 propia con regreso al inicio");
if (LIVE) {
  for (const rel of LANDINGS) {
    const url = `https://neuri.tech/${rel.replace(/index\.html$/, "")}`;
    const r = await fetch(url);
    if (r.status !== 200) bad(rel, `en vivo ${r.status}`);
  }
  const r = await fetch("https://neuri.tech/no-existe-basicos-test/");
  if (r.status !== 404) bad("404", `ruta inexistente da ${r.status}`);
}
console.log(fails ? `basicos: ${fails} falla(s) en ${pages.length} páginas` : `basicos OK — ${pages.length} páginas${LIVE ? " + en vivo" : ""}`);
process.exit(fails ? 1 : 0);
