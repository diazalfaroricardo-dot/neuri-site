// T61 candado: el QA diario de axe en vivo (axe-vivo.mjs --todas) cubre las páginas secundarias de producto,
// no solo portada y landings (falla de proceso del 20-oct: T59 se escapó porque /…/privacidad no estaba en la lista).
import { execFileSync } from "node:child_process";
const out = execFileSync("node", ["scripts/axe-vivo.mjs", "--listar"], { encoding: "utf8" }).trim().split("\n");
const deben = ["/", "/en/home/", "/bazar/privacidad/", "/en/bazar/privacy/", "/sigue-disponible/privacidad/", "/en/still-available/privacy/",
  "/bazar/terminos/", "/en/still-available/terms/", "/bazar/recorrido/", "/en/bazar/tour/", "/sigue-disponible/hoja/", "/en/still-available/sheet/",
  "/bazar/borrar-mis-datos/", "/en/bazar/delete-my-data/", "/legal/", "/en/legal/", "/novedades/", "/en/whats-new/"];
const faltan = deben.filter((p) => !out.includes(p));
const raras = out.filter((p) => /\/(\.|node_modules|docs|scripts|assets)/.test(p));
if (faltan.length || raras.length || out.length < 25) { console.log("✗ T61", { faltan, raras, total: out.length }); process.exit(1); }
console.log(`✓ T61 axe-vivo --todas cubre ${out.length} páginas, incluidas las secundarias`);
