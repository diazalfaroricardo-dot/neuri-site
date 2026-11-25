// legal-us-privacidad (D-09, espera el sí del abogado): los avisos de privacidad de neuri.bots y
// neuri.bazar, ES y EN, traen el apartado «Your US state privacy rights / Tus derechos de privacidad
// en EE. UU.»: derechos, asunto «Privacy request», 45 días, apelación «Appeal», Global Privacy Control,
// que no vendemos/compartimos/publicidad dirigida/perfilamiento, y la línea de menores de 13.
// Uso: node scripts/legal-us-privacidad-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const EN = [
  'id="us-state-rights"',
  "California or another US state",
  "give you a copy in a portable format",
  "correct it; delete it",
  "opt out of sale, sharing, targeted advertising and profiling",
  "we don't do these",
  "subject “Privacy request”",
  "within 45 days",
  "replying “Appeal”",
  "Global Privacy Control",
  "not directed to children under 13",
  "mailto:hola@neuri.tech?subject=Privacy%20request",
];
const ES = [
  'id="derechos-estatales"',
  "California o en otro estado",
  "una copia en formato portable",
  "corregirlos; borrarlos",
  "salirte de la venta, el compartir, la publicidad dirigida y el perfilamiento",
  "no los hacemos",
  "asunto «Privacy request»",
  "Respondemos en 45 días",
  "respondiendo «Appeal»",
  "Global Privacy Control",
  "menores de 13",
  "mailto:hola@neuri.tech?subject=Privacy%20request",
];
const pages = [
  ["en/still-available/privacy/index.html", EN],
  ["sigue-disponible/privacidad/index.html", ES],
  ["en/bazar/privacy/index.html", EN],
  ["bazar/privacidad/index.html", ES],
];
let fail = 0;
for (const [p, needles] of pages) {
  const html = readFileSync(join(root, p), "utf8");
  for (const n of needles) {
    if (!html.includes(n)) {
      console.error(`✗ ${p}: falta «${n}»`);
      fail++;
    }
  }
  // un solo apartado (el script de inserción es idempotente)
  const c = (html.match(/id="(us-state-rights|derechos-estatales)"/g) || []).length;
  if (c !== 1) {
    console.error(`✗ ${p}: ${c} apartados de derechos estatales (debe ser 1)`);
    fail++;
  }
}
if (fail) process.exit(1);
console.log(`✓ legal-us-privacidad: ${pages.length} avisos con derechos de privacidad de EE. UU.`);
