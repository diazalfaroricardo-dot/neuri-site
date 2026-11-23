// T16 → D-10 (22-nov): /bazar/ (español para hispanos en EE. UU.) muestra los mismos precios en USD que /en/bazar/,
// arriba y en Precios, sin registrarse. Nada de MXN, México ni IVA a un visitante de EE. UU.
// Uso: node scripts/t16-usd-bazar-test.mjs [--live]
import { landingSource } from "./landing-src.mjs";
const live = process.argv.includes("--live");
const es = await landingSource("bazar/index.html", live);
const en = await landingSource("en/bazar/index.html", live);
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.error("FALLA:", m); } else console.log("ok:", m); };
ok(/Desde \$79 al mes/.test(es), "hero de /bazar/ dice desde $79 al mes");
ok(/Precios en dólares \(USD\)/.test(es), "Precios de /bazar/ en USD");
for (const [n, v] of [["Básico", "79"], ["Pro", "119"], ["Plus", "149"]])
  ok(new RegExp(`"name": "${n}", "price": "${v}", "priceCurrency": "USD"`).test(es), `/bazar/ ${n} = US$${v}`);
for (const [n, v] of [["Basic", "79"], ["Pro", "119"], ["Plus", "149"]])
  ok(new RegExp(`"name": "${n}", "price": "${v}", "priceCurrency": "USD"`).test(en), `/en/ ${n} = US$${v} (mismo precio que /bazar/)`);
for (const [p, h] of [["/bazar/", es], ["/en/bazar/", en]]) {
  const t = h.replace(/<style[\s\S]*?<\/style>/g, "");
  ok(!/M[ée]xico|MXN|MX\$|\bpesos\b|\bIVA\b|tianguis|country=MX|value="MX"/i.test(t), `${p}: sin México, MXN, pesos, IVA ni opción MX`);
}
process.exit(fail ? 1 : 0);
