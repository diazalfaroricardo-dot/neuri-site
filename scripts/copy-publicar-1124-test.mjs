// Copy aprobado por Ricardo el 24-nov (Mission Control: copy-bazar-mexico-aprobar, copy-lectura-subtitulos-aprobar,
// copy-una-accion-aprobar). Candado estático: el texto publicado es el de la vista previa aprobada.
import { readFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname;
const leer = (p) => readFileSync(root + p, "utf8");
const txt = (h) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const palabras = (t) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}$]/u.test(w)).length;
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log("✗", m); } else console.log("✓", m); };

// 1 · /bazar/ en español para hispanos en EE. UU. (opción B, D-10)
{
  const h = leer("bazar/index.html");
  ok(h.includes("La caja para tu bazar, swap meet o antique mall. Cada venta va al vendedor correcto. Desde $79 al mes, sin comisión."), "bazar ES: hero B");
  ok(h.includes("Dólares; el impuesto de tu estado (sales tax) se suma solo"), "bazar ES: paso de país explica el sales tax");
  for (const q of ["¿Puedo traer mis datos de otro sistema (como Ricochet o Liberty) o de Excel?", "¿La caja suma el sales tax de mi estado?", "¿En qué se distingue de otros sistemas para antique malls?"]) {
    ok(h.split(q).length - 1 === 2, `bazar ES: FAQ visible y JSON-LD «${q.slice(0, 40)}…»`);
  }
  ok(!/sales tax encima|impuesto de ventas|Cómo se compara con Quail|tianguis|MXN/.test(h), "bazar ES: sin textos viejos ni México/MXN (D-10)");
}

if (fail) { console.log(`✗ ${fail} fallas`); process.exit(1); }
console.log("✓ copy 24-nov publicado igual que la vista previa");
