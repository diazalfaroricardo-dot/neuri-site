// T50 (neuri.tech, B-A6): /legal/ ya no mezcla un bloque EN largo; la versión en inglés vive aparte
// en /en/legal/ (lang="en", mismas secciones, sin texto en español) y ambas se ligan con hreflang
// y con el botón de idioma. Falla con la página mezclada de antes.
// Uso: node scripts/t50-legal-en-test.mjs [--live]
import { readFileSync } from "node:fs";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };
const es = readFileSync(join(root, "legal/index.html"), "utf8");
let en = "";
try { en = readFileSync(join(root, "en/legal/index.html"), "utf8"); } catch { bad("falta en/legal/index.html"); }
if (es.includes('<section lang="en"')) bad("/legal/ todavía trae el bloque EN dentro de la página");
if (!/<a class="nb-lang" href="\/en\/legal\/"/.test(es)) bad("/legal/: botón EN no lleva a /en/legal/");
if (!es.includes('hreflang="en" href="https://neuri.tech/en/legal/"')) bad("/legal/ sin hreflang en → /en/legal/");
if (en) {
  if (!/<html lang="en"/.test(en)) bad("/en/legal/ sin lang=en");
  for (const id of ["site-h", "security-h"]) if (!en.includes(`id="${id}"`)) bad(`/en/legal/ sin #${id}`);
  if (!/<a class="nb-lang" href="\/legal\/"/.test(en)) bad("/en/legal/: botón ES no lleva a /legal/");
  if (!en.includes('hreflang="es" href="https://neuri.tech/legal/"')) bad("/en/legal/ sin hreflang es");
  const cuerpo = en.split("<!--contenido-->")[1] || "";
  for (const w of ["Este sitio", "Aviso de privacidad", "Términos de uso", "Escríbenos"]) if (cuerpo.includes(w)) bad(`/en/legal/ trae texto en español: «${w}»`);
  for (const w of ["Privacy, terms and contact", "Skip to content", "Sign in"]) if (!en.includes(w)) bad(`/en/legal/ sin «${w}»`);
}
if (!readFileSync(join(root, "sitemap.xml"), "utf8").includes("https://neuri.tech/en/legal/")) bad("sitemap sin /en/legal/");
if (process.argv.includes("--live")) {
  for (const u of ["https://neuri.tech/en/legal/", "https://neuri.tech/legal/"]) {
    const r = await fetch(u); const h = await r.text();
    if (r.status !== 200) bad(`${u} → ${r.status}`);
    if (u.includes("/en/") && !h.includes('id="site-h"')) bad(`${u} sin #site-h (¿Pages no ha publicado?)`);
    if (!u.includes("/en/") && h.includes('<section lang="en"')) bad(`${u} todavía mezclada`);
  }
}
console.log(fail ? `t50: ${fail} fallas` : "t50: OK");
process.exit(fail ? 1 : 0);
