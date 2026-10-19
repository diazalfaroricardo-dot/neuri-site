// B-O2/B-N5 (tech): toda página de neuri.tech declara su color-scheme (meta o CSS) para que el modo oscuro del sistema no pinte controles ni fondos del otro tema al cargar. Uso: node scripts/bo2-color-scheme-test.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const pages = [];
const walk = (d) => { for (const f of readdirSync(d)) { if (f === "node_modules" || f.startsWith(".")) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f === "index.html") pages.push(p); } };
walk(".");
let fails = 0;
for (const p of pages) {
  const s = readFileSync(p, "utf8");
  if (!/name="color-scheme"|color-scheme\s*:/.test(s)) { fails++; console.log(`✗ ${p}: sin color-scheme`); }
}
console.log(fails ? `${fails} de ${pages.length} páginas sin color-scheme` : `OK ${pages.length} páginas con color-scheme`);
process.exit(fails ? 1 : 0);
