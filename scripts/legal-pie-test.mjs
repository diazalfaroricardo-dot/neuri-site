// B-A9/B-K3 (neuri.tech): el pie de la portada liga a /legal/ (privacidad y términos de cada
// producto) y a hola@neuri.tech, y «English» ya no manda a la landing de bazar (/en/) como si
// fuera neuri.tech en inglés. Cada destino local existe. Uso: node scripts/legal-pie-test.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };
const home = readFileSync(join(root, "index.html"), "utf8");
const pies = home.split("<footer").slice(1).map((f) => f.split("</footer>")[0]);
if (!pies.length) bad("index.html sin <footer>");
for (const pie of pies) {
  for (const href of ["/legal/", "mailto:hola@neuri.tech", "/en/ai-consulting/", "/en/bazar/"])
    if (!pie.includes(`href="${href}"`)) bad(`pie de la portada sin ${href}`);
  if (pie.includes('href="/en/"')) bad("pie de la portada manda «English» a /en/ (landing de bazar)");
}
const legal = readFileSync(join(root, "legal/index.html"), "utf8");
const hrefs = [...legal.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((h) => h.startsWith("/") && !h.startsWith("//"));
for (const h of hrefs) if (!existsSync(join(root, h.split("?")[0], h.endsWith("/") ? "index.html" : ""))) bad(`/legal/ liga a ${h}, que no existe`);
for (const prod of ["neuri.bots", "neuri.bazar", "neuri.consulting", "neuri.marketing"]) {
  if ((legal.match(new RegExp(`${prod.replace(".", "\\.")} — `, "g")) || []).length < 4) bad(`/legal/ sin privacidad y términos ES/EN de ${prod}`);
}
if (!legal.includes('<section lang="en"')) bad("/legal/ sin sección en inglés marcada con lang");
// axe scrollable-region-focusable: todo contenedor con scroll horizontal de la portada es enfocable con teclado
for (const m of home.matchAll(/<div([^>]*overflow-x: auto[^>]*)>/g)) if (!m[1].includes('tabindex="0"')) bad("portada: contenedor con overflow-x sin tabindex=0");
if (!fail) console.log(`✓ portada: ${pies.length} pie(s) con /legal/, contacto e inglés correcto · /legal/: ${hrefs.length} links locales existen`);
// T41: el pie de neuri.bots dice quién está detrás (Neuri LLC), ES y EN, visible y en la plantilla
for (const p of ["sigue-disponible/index.html", "en/still-available/index.html"]) {
  const pies = readFileSync(join(root, p), "utf8").split("<footer").slice(1).map((f) => f.split("</footer>")[0]);
  if (!pies.length) bad(`${p} sin pie`);
  for (const pie of pies) if (!pie.includes("Neuri LLC")) bad(`${p}: pie sin «Neuri LLC» (T41)`);
}
// T45: el logo de /en/ai-consulting/ regresa al inicio en inglés
if (!readFileSync(join(root, "en/ai-consulting/index.html"), "utf8").includes('class="logo" href="/en/home/"')) bad("/en/ai-consulting/: el logo no va a /en/home/ (T45)");

process.exit(fail ? 1 : 0);
