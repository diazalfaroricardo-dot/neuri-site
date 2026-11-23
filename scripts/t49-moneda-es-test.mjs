// T49 (media, B-A4) → D-10 (22-nov): en /consultoria/ ningún monto queda con «$» suelto junto a «US$»;
// /bazar/ ES ya está en dólares: los demos y la calculadora rotulan USD y no dicen MXN.
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
ok((bazarHtml.match(/montos en dólares \(USD\)/gi) || []).length >= 1, "bazar: la demo «Pruébalo» rotula montos en USD (landing v3, 23-nov)");
ok(/montos en USD<\/em>/.test(bazarHtml), "bazar: el estado de cuenta del hero rotula montos en USD");
ok(bazarHtml.includes("Lo que vale una hora de tu tiempo (USD)") && bazarHtml.includes(">$25</b>"), "bazar: calculadora con tarifa en dólares");
ok(!/MXN/.test(bazarHtml), "bazar: sin MXN");
process.exit(fails ? 1 : 0);
