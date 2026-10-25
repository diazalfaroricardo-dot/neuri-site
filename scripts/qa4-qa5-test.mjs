// QA agente #4 y #5 (24-oct):
// #4 el recorrido de bazar no dice solo «renta mensual»: la app cobra renta semanal o mensual (rentCadence),
//    igual que la landing (que muestra renta semanal).
// #5 el paso 3 del alta de bots no dice «(required)/(obligatorio)» en formas de pago: se puede saltar
//    el paso y avanzar sin elegir; lo que es cierto es que se necesita para encender el asistente.
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const r = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const tourEs = r("bazar/recorrido/index.html");
const tourEn = r("en/bazar/tour/index.html");
assert.ok(!/se rentan a precio fijo al mes/.test(tourEs), "#4 ES: recorrido dice solo renta al mes");
assert.ok(!/fixed monthly price/.test(tourEn), "#4 EN: tour says monthly-only rent");
assert.ok(/semanal o mensual/.test(tourEs), "#4 ES: recorrido sin «semanal o mensual»");
assert.ok(/weekly or monthly/.test(tourEn), "#4 EN: tour without «weekly or monthly»");
for (const p of ["assets/sd-alta.en.js", "assets/sd-alta.es.js", "sigue-disponible/index.html", "en/still-available/index.html"]) {
  const s = r(p);
  assert.ok(!/"\((required|obligatorio)\)"/.test(s), `#5 ${p}: marca «(required)» en un paso que se puede saltar`);
  assert.ok(!/\((required|obligatorio); /.test(s), `#5 ${p}: etiqueta de pagos dice obligatorio`);
}
assert.ok(r("assets/sd-alta.en.js").includes("(needed to turn it on)"), "#5 EN: sin «needed to turn it on»");
assert.ok(r("assets/sd-alta.es.js").includes("(se necesita para encenderlo)"), "#5 ES: sin «se necesita para encenderlo»");
console.log("qa4-qa5: ok");
