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
if (/Sistema en línea/i.test(home)) bad("«Sistema en línea» se lee como estado real del servicio");
for (const m of home.matchAll(/([^>]{0,20})señales([^<]{0,20})\/ min/g))
  if (!/de ejemplo/.test(m[0])) bad(`«${m[0].trim()}» sin «de ejemplo»`);
if (!/Actividad neural · simulación/.test(home)) bad("falta la etiqueta «simulación» de la animación");
if (!fail) console.log("✓ portada honesta: diagnóstico con controles, animación marcada como ejemplo");
process.exit(fail ? 1 : 0);
