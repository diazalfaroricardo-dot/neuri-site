// T53 (baja, B-A4): la calculadora de /sigue-disponible/ ES dice que los montos son MXN (estático y plantilla).
import { readFileSync } from "node:fs";
const live = process.argv.includes("--live");
const html = live
  ? await (await fetch("https://neuri.tech/sigue-disponible/?t=" + Date.now())).text()
  : readFileSync(new URL("../sigue-disponible/index.html", import.meta.url), "utf8");
let fails = 0;
const ok = (c, m) => { if (c) console.log(`✓ ${m}`); else { fails++; console.error(`✗ ${m}`); } };
ok((html.match(/Lo que vale una venta en promedio \(MXN\)/g) || []).length >= 1, "control del ticket dice MXN");
ok((html.match(/>Al mes se te van \(MXN\)</g) || []).length === 2, "resultado dice MXN (estático y plantilla)");
ok((html.match(/El plan Básico cuesta \$899 MXN al mes\./g) || []).length === 2, "plan Básico con MXN (estático y plantilla)");
ok(!/El plan Básico cuesta \$899 al mes/.test(html), "sin $899 suelto");
process.exit(fails ? 1 : 0);
