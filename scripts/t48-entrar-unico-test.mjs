// T48 (media, B-A3): «Entrar» solo significa iniciar sesión. Un botón de lista de espera
// u otra acción no puede empezar con «Entrar» (en /marketing salía «Entrar a la lista»
// junto a «Entrar» y el visitante nuevo terminaba en el login sin cuenta).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const ok = /^Entrar(\s+a\s+neuri\.(bazar|bots|consulting|marketing))?$/;
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    if (f === "node_modules" || f.startsWith(".")) continue;
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".html")) files.push(p);
  }
})(".");
let bad = 0;
for (const f of files) {
  const html = readFileSync(f, "utf8");
  for (const m of html.matchAll(/>\s*(Entrar[^<]*)</g)) {
    const t = m[1].replace(/\s+/g, " ").trim();
    if (!ok.test(t)) { bad++; console.error(`✗ ${f}: «${t}» usa «Entrar» para algo que no es iniciar sesión`); }
  }
}
console.log(bad ? `t48: ${bad} falla(s)` : `t48 OK (${files.length} páginas)`);
process.exit(bad ? 1 : 0);
