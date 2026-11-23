// T53 (baja, B-A4) + D-10: la calculadora de /sigue-disponible/ ES dice en qué moneda están los montos.
// D-10: el HTML ya viene en USD; sd-alta.es.js trae los textos en MXN para ?moneda=mxn o zona horaria de México.
import { readFileSync } from "node:fs";
const live = process.argv.includes("--live");
const html = live
  ? await (await fetch("https://neuri.tech/sigue-disponible/?t=" + Date.now())).text()
  : readFileSync(new URL("../sigue-disponible/index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../assets/sd-alta.es.js", import.meta.url), "utf8");
let fails = 0;
const ok = (c, m) => { if (c) console.log(`✓ ${m}`); else { fails++; console.error(`✗ ${m}`); } };
ok((html.match(/Lo que vale una venta en promedio \(USD\)/g) || []).length >= 1, "control del ticket dice USD en el HTML");
ok((html.match(/>Al mes se te van \(USD\)</g) || []).length >= 1, "resultado dice USD en el HTML");
ok((html.match(/El plan Básico cuesta \$49 USD al mes\./g) || []).length >= 1, "plan Básico con USD en el HTML");
ok(!/MXN|\$899/.test(html.replace(/<script[\s\S]*?<\/script>/g, "")), "sin pesos en el HTML");
ok(js.includes("'El plan Básico cuesta $899 MXN al mes.'") && js.includes("'Al mes se te van (MXN)'") && js.includes("'(MXN)'"), "sd-alta.es.js cambia la calculadora a MXN para México");
process.exit(fails ? 1 : 0);
