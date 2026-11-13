// t35 y t36 (decisiones de Ricardo del 26-oct): los términos de neuri.bazar y neuri.bots dicen, ES y EN,
// reembolso completo del primer pago dentro de 7 días y respuesta de soporte en 1 día hábil.
// Uso: node scripts/t35-t36-reembolso-soporte-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pages = [
  ["bazar/terminos/index.html", /Reembolso completo en 7 días/, /1 día hábil/],
  ["sigue-disponible/terminos/index.html", /Reembolso completo en 7 días/, /1 día hábil/],
  ["en/bazar/terms/index.html", /Full refund within 7 days/, /1 business day/],
  ["en/still-available/terms/index.html", /Full refund within 7 days/, /1 business day/],
];
let fail = 0;
for (const [p, refund, sla] of pages) {
  const s = readFileSync(join(root, p), "utf8");
  if (!refund.test(s)) { console.error(`✗ ${p} sin el reembolso de 7 días`); fail++; }
  if (!sla.test(s)) { console.error(`✗ ${p} sin el tiempo de respuesta de soporte`); fail++; }
}
if (fail) process.exit(1);
console.log(`✓ t35/t36: ${pages.length} páginas de términos dicen reembolso en 7 días y soporte en 1 día hábil`);
