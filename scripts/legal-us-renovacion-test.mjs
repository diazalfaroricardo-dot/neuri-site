// legal-us-renovacion (D-09, espera el sí del abogado): los términos de neuri.bots y neuri.bazar, ES y
// EN, dicen claro que el plan se renueva solo cada mes hasta cancelar (FTC/ROSCA y California AB 2863),
// la casilla aparte, el correo con liga para cancelar, cómo cancelar en línea (con la pantalla real),
// la oferta que se puede saltar y el recordatorio anual. Uso: node scripts/legal-us-renovacion-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const EN = [
  "renews automatically every month",
  "until you cancel",
  "plus applicable taxes",
  "separate checkbox",
  "direct cancel link",
  "cancel online at any time",
  "a couple of clicks",
  "skip it with one click",
  "until the end of the month you already paid",
  "Once a year we email you a reminder",
  "at least 30 days before",
];
const ES = [
  "se renueva sola cada mes",
  "hasta que canceles",
  "más los impuestos que apliquen",
  "casilla aparte",
  "liga directa para cancelar",
  "cancelar en línea cuando quieras",
  "un par de clics",
  "puedes saltarla con un clic",
  "hasta el fin del mes ya pagado",
  "Una vez al año te mandamos un recordatorio",
  "al menos 30 días antes",
];
const pages = [
  ["en/still-available/terms/index.html", [...EN, "“My assistant” → “Your plan”", "at least 2 days before the first charge"]],
  ["sigue-disponible/terminos/index.html", [...ES, "«Mi asistente» → «Tu plan»", "al menos 2 días antes del primer cobro"]],
  ["en/bazar/terms/index.html", [...EN, "“My plan”", "never turns into a paid plan by itself"]],
  ["bazar/terminos/index.html", [...ES, "«Mi plan»", "nunca se vuelve plan de pago sola"]],
];
let fail = 0;
for (const [p, needles] of pages) {
  const html = readFileSync(join(root, p), "utf8");
  for (const n of needles)
    if (!html.includes(n)) {
      console.error(`✗ ${p}: falta «${n}»`);
      fail++;
    }
  if ((html.match(/data-terms-autorenew/g) || []).length !== 1) {
    console.error(`✗ ${p}: debe haber un solo bloque de renovación`);
    fail++;
  }
  if (html.includes("[place]") || html.includes("[lugar]")) {
    console.error(`✗ ${p}: quedó un [place]/[lugar] sin rellenar`);
    fail++;
  }
}
if (fail) process.exit(1);
console.log(`✓ legal-us-renovacion: ${pages.length} términos dicen la renovación automática claro`);
