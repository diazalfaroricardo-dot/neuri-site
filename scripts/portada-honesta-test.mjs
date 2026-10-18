// T7/T11 (B-A8, honestidad): la portada de neuri.tech no promete lo que no existe.
// - El diagnóstico de consulting sale solo con controles automáticos desde K43 (16-oct-2026);
//   una persona lo revisa solo si un control falla → no decir «revisado por una persona» a secas.
// - La animación del encabezado es simulación: nada de «Sistema en línea» ni «señales / min»
//   que se lean como métrica real.
// Uso: node scripts/portada-honesta-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const home = readFileSync(join(root, "index.html"), "utf8");
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };
if (/revisado por una persona(?! si)/i.test(home.replace(/\(si algo no cuadra, lo revisa una persona\)/g, "")))
  bad("la portada promete «revisado por una persona» y la entrega es automática con controles (K43)");
// T12: la tarjeta de consulting decía «100 % · Revisado por persona» (sin «una»): el regex de arriba no la veía.
if (/revisado por persona|100\s*%[^<]{0,80}revisad/i.test(home))
  bad("la tarjeta de consulting promete «100 % revisado por persona» (K43: entrega automática con controles)");
// T7: el precio de entrada de la consultoría se ve en la portada, igual que en /consultoria.
if (!/\$4,500[\s\S]{0,200}diagnóstico desde/.test(home)) bad("la tarjeta de consulting no muestra el precio desde del diagnóstico");
if (/Sistema en línea/i.test(home)) bad("«Sistema en línea» se lee como estado real del servicio");
for (const m of home.matchAll(/([^>]{0,20})señales([^<]{0,20})\/ min/g))
  if (!/de ejemplo/.test(m[0])) bad(`«${m[0].trim()}» sin «de ejemplo»`);
if (!/Actividad neural · simulación/.test(home)) bad("falta la etiqueta «simulación» de la animación");
// T12b: lo mismo en las landings de consulting (ES/EN) y llms.txt: ninguna promete revisión humana de cada diagnóstico.
for (const f of ["consultoria/index.html", "en/ai-consulting/index.html", "llms.txt"]) {
  const txt = readFileSync(join(root, f), "utf8").replace(/\(si algo no cuadra, lo revisa una persona\)|\(if something doesn.t add up, a person reviews it\)/gi, "");
  if (/revisad[oa] por (una )?persona|100\s*%[^<]{0,80}revisad|(reviewed|checked) by a (real )?(person|human)|human[- ]reviewed|100\s*%[^<]{0,80}review/i.test(txt))
    bad(`${f} promete revisión humana de cada diagnóstico (K43: entrega automática con controles)`);
}
if (!fail) console.log("✓ portada honesta: diagnóstico con controles, animación marcada como ejemplo");
process.exit(fail ? 1 : 0);
