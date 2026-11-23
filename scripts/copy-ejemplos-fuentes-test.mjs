// copy-ejemplos-fuentes (auditoría de copy, 23-nov-2026): cada número es real o dice «ejemplo»; cada dato
// de la industria lleva su fuente verificable.
// - bots: la calculadora («al mes se te van») muestra una etiqueta visible «Ejemplo» junto al resultado.
// - marketing: las reglas con dato (Meta y los reposts, señales de Instagram, Google indexa, 3 de cada 4,
//   el 52 %) llevan un link a su fuente pública. Si alguien quita la fuente, el dato se va con ella.
// Uso: node scripts/copy-ejemplos-fuentes-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const leer = (f) => readFileSync(join(root, f), "utf8");
let fallas = 0;
const mal = (m) => { console.error(`✗ ${m}`); fallas++; };

for (const [f, re] of [
  ["sigue-disponible/index.html", /<div class="calc-out">\s*<span class="co-ej"[^>]*>Ejemplo ·/],
  ["en/still-available/index.html", /<div class="calc-out">\s*<span class="co-ej"[^>]*>Example ·/],
]) if (!re.test(leer(f))) mal(`${f}: el resultado de la calculadora no dice «Ejemplo» a la vista`);

// Cada <small> de las reglas que trae un número, un año o una plataforma nombrada debe traer su <a href>.
const dato = /\d|Meta|Google|Instagram|señal|signal/;
for (const f of ["marketing/index.html", "en/marketing/index.html"]) {
  const s = leer(f);
  const reglas = [...s.matchAll(/<div class="rule rv">[\s\S]*?<h3>([^<]*)<small>([\s\S]*?)<\/small><\/h3>/g)];
  if (reglas.length < 8) mal(`${f}: esperaba 8 reglas, hay ${reglas.length}`);
  for (const [, titulo, small] of reglas) {
    const txt = small.replace(/<a[\s\S]*?<\/a>/g, "");
    if (dato.test(txt) && !/<a href="https:\/\/[^"]+"/.test(small)) mal(`${f}: «${titulo.trim()}» trae un dato sin fuente: «${txt.trim()}»`);
  }
  // El dato de Meta en el bloque de investigación también enlaza su fuente.
  const lede = s.match(/(Desde marzo de 2026|Since March 2026)[^<]*(<a[^>]*>)?/);
  if (!lede || !/href="https:\/\/creators\.facebook\.com\//.test(lede[0])) mal(`${f}: «desde marzo de 2026» sin la fuente de Meta`);
  if (/enseñan cada video primero|show every video first/.test(s)) mal(`${f}: «cada video primero a gente que no te sigue» no tiene fuente`);
}

if (!fallas) console.log("✓ calculadora de bots marcada como ejemplo y cada dato de marketing con su fuente");
process.exit(fallas ? 1 : 0);
