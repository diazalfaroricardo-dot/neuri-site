// T16: /bazar/ dice «Pesos y dólares»: el precio en USD debe verse sin registrarse (arriba y en Precios), igual que /en/.
// Uso: node scripts/t16-usd-bazar-test.mjs [--live]
import { landingSource } from "./landing-src.mjs";
const live = process.argv.includes("--live");
const es = await landingSource("bazar/index.html", live);
const en = await landingSource("en/index.html", live);
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.error("FALLA:", m); } else console.log("ok:", m); };
ok(/Desde \$499 MXN o US\$79 al mes/.test(es), "hero de /bazar/ dice MXN y USD");
ok(/US\$79, US\$119 y US\$149 al mes/.test(es), "Precios de /bazar/ trae los 3 planes en USD");
for (const [n, v] of [["Basic", "79"], ["Pro", "119"], ["Plus", "149"]])
  ok(new RegExp(`"name": "${n}", "price": "${v}", "priceCurrency": "USD"`).test(en), `/en/ ${n} = US$${v} (mismo precio que /bazar/)`);
process.exit(fail ? 1 : 0);
