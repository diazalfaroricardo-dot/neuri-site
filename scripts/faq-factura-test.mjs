// A276 (B-C6): la FAQ de factura/recibo existe en las 3 copias (JSON-LD, HTML, datos JS) ES/EN y dice
// honestamente qué hay (recibo de Stripe al empezar los cobros) y qué no (CFDI todavía no).
// Uso: node scripts/faq-factura-test.mjs [--live]
import { readFileSync } from "node:fs";
import { landingSource } from "./landing-src.mjs";
const live = process.argv.includes("--live");
const pages = [
  ["sigue-disponible/index.html", "¿Me dan factura?", /Todavía no emitimos factura CFDI/],
  ["en/still-available/index.html", "Do I get a receipt or invoice?", /we don’t issue Mexican CFDI invoices yet/],
];
const overclaim = /(CFDI (incluida|disponible|automática)|we issue CFDI|deducible garantizado)/i;
let fail = 0;
for (const [p, q, honest] of pages) {
  const html = await landingSource(p, live);
  const n = html.split(q).length - 1;
  if (n !== 3) fail++;
  console.log(`${n === 3 ? "OK   " : "FALLA"} ${p}${live ? " (en vivo)" : ""} · ${n}/3 copias`);
  const h = (html.match(new RegExp(honest.source, "g")) || []).length;
  if (h !== 3) fail++;
  console.log(`${h === 3 ? "OK   " : "FALLA"} ${p} · dice que CFDI todavía no (${h}/3)`);
  if (overclaim.test(html)) { fail++; console.log(`FALLA ${p} · promete CFDI`); }
}
if (fail) process.exitCode = 1;
