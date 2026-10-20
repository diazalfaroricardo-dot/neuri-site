// T50 parte 2 (neuri.tech, B-A6): /novedades/ ya no mezcla un bloque EN; el inglés vive aparte en
// /en/whats-new/ (lang="en", mismas fechas, sin texto en español) y ambas se ligan con hreflang y con
// el botón de idioma. Falla con la página mezclada de antes.
// Uso: node scripts/t50b-novedades-en-test.mjs [--live]
import { readFileSync } from "node:fs";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };
const es = readFileSync(join(root, "novedades/index.html"), "utf8");
let en = "";
try { en = readFileSync(join(root, "en/whats-new/index.html"), "utf8"); } catch { bad("falta en/whats-new/index.html"); }
if (es.includes('<div lang="en">') || es.includes('id="en-h"')) bad("/novedades/ todavía trae el bloque EN dentro de la página");
if (!/<a class="nb-lang" href="\/en\/whats-new\/"/.test(es)) bad("/novedades/: botón EN no lleva a /en/whats-new/");
if (!es.includes('hreflang="en" href="https://neuri.tech/en/whats-new/"')) bad("/novedades/ sin hreflang en");
const MES = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 };
const fes = [...es.matchAll(/<h2 id="n-\d+">(\d{1,2}) de (\w+) de (\d{4})<\/h2>/g)].map((m) => new Date(+m[3], MES[m[2]], +m[1]).getTime());
if (en) {
  if (!/<html lang="en"/.test(en)) bad("/en/whats-new/ sin lang=en");
  if (!/<a class="nb-lang" href="\/novedades\/"/.test(en)) bad("/en/whats-new/: botón ES no lleva a /novedades/");
  if (!en.includes('hreflang="es" href="https://neuri.tech/novedades/"')) bad("/en/whats-new/ sin hreflang es");
  const fen = [...en.matchAll(/<h2 id="n-\d+">(\w+ \d{1,2}, \d{4})<\/h2>/g)].map((m) => new Date(m[1]).getTime());
  if (!fen.length || fen.join() !== fes.join()) bad("las fechas de /novedades/ y /en/whats-new/ no coinciden");
  const cuerpo = ((en.split("<!--contenido-->")[1] || "").split("<!--/contenido-->")[0]).replace(/<p lang="es">.*?<\/p>/, "");
  for (const w of ["Novedades", "octubre", "Escríbenos", "Privacidad"]) if (cuerpo.includes(w)) bad(`/en/whats-new/ trae texto en español: «${w}»`);
  for (const w of ["What’s new", "Skip to content", "Sign in"]) if (!en.includes(w)) bad(`/en/whats-new/ sin «${w}»`);
  if (/href="\/legal\//.test(cuerpo)) bad("/en/whats-new/ liga a /legal/ en español (usa /en/legal/)");
  if (!/<footer[^]*href="\/novedades\/" hreflang="es"/.test(en)) bad("/en/whats-new/: «Español» del pie no lleva a /novedades/");
}
if (!readFileSync(join(root, "en/legal/index.html"), "utf8").includes('href="/en/whats-new/"')) bad("/en/legal/ no liga a /en/whats-new/");
if (!readFileSync(join(root, "sitemap.xml"), "utf8").includes("https://neuri.tech/en/whats-new/")) bad("sitemap sin /en/whats-new/");
if (!readFileSync(join(root, "llms.txt"), "utf8").includes("https://neuri.tech/en/whats-new/")) bad("llms.txt sin /en/whats-new/");
if (process.argv.includes("--live")) {
  for (const u of ["https://neuri.tech/en/whats-new/", "https://neuri.tech/novedades/"]) {
    const r = await fetch(u); const h = await r.text();
    if (r.status !== 200) bad(`${u} → ${r.status}`);
    else if (u.includes("/en/") && !h.includes("NEURI · WHAT’S NEW")) bad(`${u} sin contenido (¿Pages no ha publicado?)`);
    else if (!u.includes("/en/") && h.includes('<div lang="en">')) bad(`${u} todavía mezclada`);
  }
}
console.log(fail ? `t50b: ${fail} fallas` : "t50b: OK");
process.exit(fail ? 1 : 0);
