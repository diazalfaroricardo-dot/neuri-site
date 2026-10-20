// T63 (B-N3, axe label-content-name-mismatch): el botón de idioma que se ve como «EN»/«ES»
// debe tener un nombre accesible que empiece con ese mismo texto («EN, English»).
// Recorre todas las páginas .html del repo y falla si alguna trae aria-label="English"/"Español" sobre «EN»/«ES».
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
const files = execSync("git ls-files '*.html'").toString().trim().split("\n");
const re = /<a\b[^>]*aria-label="([^"]*)"[^>]*>(EN|ES)<\/a>/g;
let fallas = 0, revisados = 0;
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(re)) {
    revisados++;
    if (!m[1].startsWith(m[2])) { fallas++; console.error(`✗ ${f}: aria-label="${m[1]}" no incluye el texto visible «${m[2]}»`); }
  }
}
const py = readFileSync("scripts/brand-chrome.py", "utf8");
if (/aria-label="\{"English" if es/.test(py)) { fallas++; console.error("✗ scripts/brand-chrome.py vuelve a generar aria-label=\"English\""); }
if (revisados < 20) { fallas++; console.error(`✗ solo ${revisados} botones de idioma revisados (esperaba ≥20)`); }
console.log(fallas ? `t63: ${fallas} fallas` : `t63 OK: ${revisados} botones EN/ES con nombre que incluye el texto visible`);
process.exit(fallas ? 1 : 0);
