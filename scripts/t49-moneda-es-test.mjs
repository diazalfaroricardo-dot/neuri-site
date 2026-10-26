// T49 (media, B-A4): en /consultoria/ y /bazar/ ES ningún monto queda con «$» suelto junto a «US$».
// Dólares dicen US$; pesos dicen MXN (o están en un demo rotulado «pesos mexicanos (MXN)»).
import { readFileSync } from "node:fs";
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, "");
let fails = 0;
const ok = (c, m) => { if (c) console.log(`✓ ${m}`); else { fails++; console.error(`✗ ${m}`); } };

const cons = text(read("consultoria/index.html"));
const sueltasCons = cons.match(/(?<!US)\$\d[\d.,]*\s*[MK](?![A-Z])\+?/g) || [];
ok(!sueltasCons.length, `consultoria: cifras en millones con US$ ${sueltasCons.join(", ")}`);
const pesosCons = cons.match(/(?<!US)\$\d[\d,]*(?![\d,]*\s*(MXN|[MK]))/g) || [];
ok(!pesosCons.length, `consultoria: montos en pesos dicen MXN ${pesosCons.join(", ")}`);

const bazarHtml = read("bazar/index.html");
ok((bazarHtml.match(/montos en pesos mexicanos \(MXN\)/gi) || []).length === 6, "bazar: los 2 demos y la escena «Así se mueve el dinero» (estático y plantilla) rotulan montos en MXN");
ok((bazarHtml.match(/montos en MXN<\/span>/g) || []).length === 2, "bazar: la caja del hero (estático y plantilla) rotula montos en MXN");
ok(bazarHtml.includes("Con tu hora a $100 MXN") && bazarHtml.includes("Con tu hora a {{rateText}} MXN"), "bazar: calculadora dice la tarifa en MXN");
ok(bazarHtml.includes('">$9,030 MXN <span') && bazarHtml.includes('">{{valueText}} MXN <span'), "bazar: calculadora dice el valor en MXN");
process.exit(fails ? 1 : 0);
