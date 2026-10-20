// B-K3 (alta, neuri.tech): /legal/ dice lo que el propio sitio hace — cada servicio de terceros que
// cargan las páginas (fuentes, analítica, scripts) y el almacenamiento local, en ES y en EN.
// Falla si aparece un host externo nuevo sin declarar o si la analítica deja de ser sin cookies.
// Uso: node scripts/k3-sitio-terceros-test.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const SKIP = new Set(["node_modules", ".git", ".t25", "scripts"]);
const NOMBRE = {
  "fonts.googleapis.com": "Google Fonts",
  "fonts.gstatic.com": "Google Fonts",
  "us.i.posthog.com": "PostHog",
  "us-assets.i.posthog.com": "PostHog",
};
const propio = (h) => h === "neuri.tech" || h.endsWith(".neuri.tech");
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };

const html = [];
const walk = (d) => {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n)) continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n.endsWith(".html")) html.push(p);
  }
};
walk(root);

const hosts = new Set();
for (const f of html) {
  const t = readFileSync(f, "utf8");
  for (const m of t.matchAll(/<(?:script|link|iframe|img)[^>]*?(?:src|href)="https?:\/\/([^/"]+)/g)) hosts.add(m[1]);
}
const assets = readdirSync(join(root, "assets")).filter((n) => n.endsWith(".js"));
let usaStorage = false;
for (const n of assets) {
  const t = readFileSync(join(root, "assets", n), "utf8");
  for (const m of t.matchAll(/https:\/\/([a-z0-9.-]+\.[a-z]{2,})/g)) if (m[1].includes("posthog")) hosts.add(m[1]);
  if (/localStorage\.setItem/.test(t)) usaStorage = true;
}

const legal = readFileSync(join(root, "legal/index.html"), "utf8");
const es = legal; // T50: el inglés vive aparte en /en/legal/
const en = readFileSync(join(root, "en/legal/index.html"), "utf8");
const sitioEs = es.split('id="sitio-h"')[1] || "";
const sitioEn = en.split('id="site-h"')[1] || "";
if (!sitioEs) bad("/legal/ sin sección «Este sitio (neuri.tech)» (id=sitio-h)");
if (!sitioEn) bad("/legal/ sin sección EN «This site (neuri.tech)» (id=site-h)");

const declarados = new Set();
for (const h of hosts) {
  if (propio(h)) continue;
  const nombre = NOMBRE[h];
  if (!nombre) { bad(`host externo sin declarar en /legal/: ${h} (agrégalo a NOMBRE y al aviso)`); continue; }
  declarados.add(nombre);
  if (!sitioEs.includes(nombre)) bad(`/legal/ ES no menciona ${nombre} (${h})`);
  if (!sitioEn.includes(nombre)) bad(`/legal/ EN no menciona ${nombre} (${h})`);
}
if (usaStorage) {
  if (!/almacenamiento local/i.test(sitioEs)) bad("assets usan localStorage y /legal/ ES no dice «almacenamiento local»");
  if (!/local storage/i.test(sitioEn)) bad("assets usan localStorage y /legal/ EN no dice «local storage»");
}
const an = readFileSync(join(root, "assets/analytics.js"), "utf8");
if (!/persistence\s*:\s*['"]memory['"]/.test(an)) bad("analytics.js ya no usa persistence 'memory': /legal/ dice «sin cookies»");
for (const s of ["Claude", "GitHub Pages"]) {
  if (!sitioEs.includes(s)) bad(`/legal/ ES sin ${s}`);
  if (!sitioEn.includes(s)) bad(`/legal/ EN sin ${s}`);
}

if (!fail) console.log(`✓ B-K3: ${html.length} páginas, terceros declarados ES/EN: ${[...declarados].join(", ")}${usaStorage ? " + almacenamiento local" : ""}`);
process.exit(fail ? 1 : 0);
