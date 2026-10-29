// L9 (docs/LEGAL.md): los términos de neuri.bazar y neuri.bots dicen, ES y EN, que el servicio es
// para mayores de edad (18 años o más). Uso: node scripts/l9-edad-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pages = [
  ["bazar/terminos/index.html", /mayores de edad<\/b> \(18 años o más\)/],
  ["en/bazar/terms/index.html", /adults<\/b> \(18 or older\)/],
  ["sigue-disponible/terminos/index.html", /mayores de edad<\/b> \(18 años o más\)/],
  ["en/still-available/terms/index.html", /adults<\/b> \(18 or older\)/],
];
let fail = 0;
for (const [p, re] of pages) {
  if (!re.test(readFileSync(join(root, p), "utf8"))) { console.error(`✗ ${p} sin la línea de 18 años o más`); fail++; }
}
if (fail) process.exit(1);
console.log(`✓ L9: ${pages.length} páginas de términos dicen 18 años o más`);
