// QA #80 → D-10 (22-nov, «EE. UU. primero»): /bazar/ (español para hispanos en EE. UU.) y /en/bazar/ cobran en USD
// y ya no ofrecen pesos. Cada uno lo aclara una vez por plantilla (estática y viva).
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const es = readFileSync(new URL("../bazar/index.html", import.meta.url), "utf8");
const en = readFileSync(new URL("../en/bazar/index.html", import.meta.url), "utf8");
assert.equal((es.match(/Precios en dólares \(USD\)\./g) || []).length, 1, "ES: falta la aclaración USD (una vez, en precios; landing v3 sin plantillas)");
assert.equal((en.match(/Prices in US dollars \(USD\)\./g) || []).length, 1, "EN: falta la aclaración USD (una vez, en precios; landing v3 sin plantillas)");
assert.ok(!/pesos|MXN|MX\$/i.test(es.replace(/<style[\s\S]*?<\/style>/g, "")), "ES: ya no menciona pesos ni MXN");
assert.ok(!/pesos|MXN|MX\$/i.test(en.replace(/<style[\s\S]*?<\/style>/g, "")), "EN: ya no menciona pesos ni MXN");
console.log("qa80-moneda: ok");
