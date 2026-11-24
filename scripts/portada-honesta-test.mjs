// T7/T11 (B-A8, honestidad): la portada de neuri.tech no promete lo que no existe.
// - El diagnóstico de consulting sale solo con controles automáticos desde K43 (16-oct-2026);
//   una persona lo revisa solo si un control falla → no decir «revisado por una persona» a secas.
// - La animación del encabezado es simulación: nada de «Sistema en línea» ni «señales / min»
//   que se lean como métrica real.
// Uso: node scripts/portada-honesta-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const home = readFileSync(join(root, "es/index.html"), "utf8");
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };
if (/revisado por una persona(?! si)/i.test(home.replace(/\(si algo no cuadra, lo revisa una persona\)/g, "")))
  bad("la portada promete «revisado por una persona» y la entrega es automática con controles (K43)");
// T12: la tarjeta de consulting decía «100 % · Revisado por persona» (sin «una»): el regex de arriba no la veía.
if (/revisado por persona|100\s*%[^<]{0,80}revisad/i.test(home))
  bad("la tarjeta de consulting promete «100 % revisado por persona» (K43: entrega automática con controles)");
// T7: la tarjeta de consulting dice que el AI Score es gratis y que el precio es fijo (portada v2, 18-nov:
// el «$4,500 desde» vive en /consultoria y en consulting.neuri.tech/precios).
if (!/Tu AI Score, gratis[\s\S]{0,300}Precio por etapa/.test(home)) bad("la tarjeta de consulting no dice AI Score gratis y precio fijo por etapa");
if (/Sistema en línea/i.test(home)) bad("«Sistema en línea» se lee como estado real del servicio");
for (const m of home.matchAll(/([^>]{0,20})señales([^<]{0,20})\/ min/g))
  if (!/de ejemplo/.test(m[0])) bad(`«${m[0].trim()}» sin «de ejemplo»`);
// Portada v12 (Ricardo 23-nov): la línea del día y la historia se marcan como ejemplo con datos inventados.
if (!/ejemplo con datos inventados/.test(home) || !/Un día de ejemplo con datos inventados/.test(home)) bad("falta la etiqueta de ejemplo en la línea del día o en la historia");
// T12b: lo mismo en las landings de consulting (ES/EN) y llms.txt: ninguna promete revisión humana de cada diagnóstico.
for (const f of ["consultoria/index.html", "en/ai-consulting/index.html", "llms.txt"]) {
  const txt = readFileSync(join(root, f), "utf8").replace(/\(si algo no cuadra, lo revisa una persona\)|\(if something doesn.t add up, a person reviews it\)/gi, "");
  if (/revisad[oa] por (una )?persona|100\s*%[^<]{0,80}revisad|(reviewed|checked) by a (real )?(person|human)|human[- ]reviewed|100\s*%[^<]{0,80}review/i.test(txt))
    bad(`${f} promete revisión humana de cada diagnóstico (K43: entrega automática con controles)`);
}
// T14: la tarjeta de neuri.bots dice el estado real — el alta está abierta (y desde 23-nov, Meta abierta).
if (/Por abrir/i.test(home)) bad("la tarjeta de neuri.bots dice «Por abrir» y el alta ya está abierta en /sigue-disponible");
const bots = (home.match(/<article class="prod" style="--c:var\(--bots\)">[\s\S]{0,1600}/g) || []);
// Diseño v2 (25-oct-2026): la portada ya no usa dc-lite con plantilla duplicada; el HTML es la única copia.
if (bots.length < 1) bad("no encontré la tarjeta de neuri.bots");
for (const b of bots) {
  if (!/Alta abierta/.test(b)) bad("la tarjeta de neuri.bots no dice «Alta abierta»");
  // copy-contradicciones (23-nov): /estado dice meta "open" y whatsapp "on" → ya no «pendiente de Meta».
  if (/pendiente de Meta|Meta pendiente/i.test(b)) bad("la tarjeta de neuri.bots dice «pendiente de Meta» y Meta ya está abierta (/estado)");
}
// B-A8 (auditoría bazar 18-oct): neuri.marketing está en lista de espera → no decir que las cuatro ya están «en órbita».
if (/Cuatro misiones\.\s*Ya en órbita/i.test(home)) bad("«Cuatro misiones. Ya en órbita.» y neuri.marketing sigue en lista de espera");
// T39 (B-A8/B-C1): la garantía de las landings de consulting dice su condición (la misma de consulting.neuri.tech/precios).
for (const f of ["consultoria/index.html", "en/ai-consulting/index.html"]) {
  const txt = readFileSync(join(root, f), "utf8");
  for (const m of txt.matchAll(/<span>([^<]*(garant|money-back)[^<]*)<\/span>/gi))
    if (!/3 (oportunidades|actionable)/i.test(m[1])) bad(`${f}: «${m[1]}» sin la condición de la garantía (3 oportunidades accionables)`);
}
// T38 (B-A1, re-auditoría 19-oct): la portada ES dice en lenguaje llano lo mismo que /en/home/ y el atajo ⌘K no sale en pantallas táctiles.
// Portada v2 (Ricardo 18-nov): sin «negocios pequeños». Lectura fácil (Ricardo 24-nov, copy-lectura-subtitulos):
// el subtítulo dice lo que hace en ≤20 palabras, sin «suite de agentes».
if (!/Neuri contesta a tus clientes, cobra, lleva tus cuentas y hace tus posts\. A cualquier hora, con tus reglas\./.test(home)) bad("T38: la portada ES no explica en llano qué hace Neuri");
if (/negocios pequeños/i.test(home)) bad("la portada ES dice «negocios pequeños» (Ricardo 18-nov: no)");
if (/Tú piensas\. La red ejecuta\.|Ver sistemas en operación/.test(home)) bad("T38: copy abstracto de la portada ES");
if ((home.match(/>Ver los productos</g) || []).length + (home.match(/>Ver los productos<svg/g) || []).length < 2) bad("T38: falta «Ver los productos» en el encabezado");
for (const m of home.matchAll(/<span class="([^"]*)"[^>]*>⌘K<\/span>Probar la demo/g))
  if (!/x-kbd/.test(m[1])) bad("T38: el ⌘K del botón «Probar la demo» no se oculta en táctil (.x-kbd)");
// Portada v12 (23-nov): ya no hay consola ni atajo ⌘K; si el botón vuelve, el ⌘K se oculta en táctil (arriba).
if (!fail) console.log("✓ portada honesta: diagnóstico con controles, animación marcada como ejemplo");
// T55 (B-A1, re-auditoría 20-oct): botón llano sin «consola» y la palabra rotativa no se lee como «te cobra».
if (/Abrir la consola/.test(home)) bad("T55: la portada ES aún dice «Abrir la consola» (jerga)");

if (/'cobra',/.test(home)) bad("T55: la palabra rotativa «cobra» sola se lee como «te cobra»; usar «cobra la renta»");
process.exit(fail ? 1 : 0);
