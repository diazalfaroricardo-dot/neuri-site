// QA #80: la nota de la otra moneda se leía como si los precios estuvieran cruzados.
// ES muestra pesos y aclara «Precios en pesos mexicanos»; EN muestra dólares y aclara «Prices in US dollars».
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const es = readFileSync(new URL("../bazar/index.html", import.meta.url), "utf8");
const en = readFileSync(new URL("../en/bazar/index.html", import.meta.url), "utf8");
assert.ok(!es.includes(">En dólares: US$79"), "ES: nota de dólares sin aclarar la moneda principal");
assert.ok(!en.includes(">In pesos: MX$499"), "EN: nota de pesos sin aclarar la moneda principal");
assert.equal((es.match(/Precios en pesos mexicanos \(MXN\)\. ¿Pagas en dólares\? US\$79, US\$119 y US\$149 al mes\./g) || []).length, 2, "ES: falta la aclaración (2 plantillas)");
assert.equal((en.match(/Prices in US dollars \(USD\)\. Paying in pesos\? MX\$499, MX\$899 and MX\$1,499 per month\./g) || []).length, 2, "EN: falta la aclaración (2 plantillas)");
console.log("qa80-moneda: ok");
