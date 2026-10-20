// T47: las cifras de dinero de la trayectoria en /consultoria y /en/ai-consulting dicen la moneda (US$).
import { readFileSync } from "node:fs";
const pages = ["consultoria/index.html", "en/ai-consulting/index.html"];
let fails = 0;
for (const p of pages) {
  const html = readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
  const sueltas = html.match(/(?<![A-Z])\$\d[\d.,]*[MK]\+?/g) || [];
  if (sueltas.length) { fails++; console.error(`✗ ${p}: cifra sin moneda → ${sueltas.join(", ")}`); }
  else console.log(`✓ ${p}`);
}
process.exit(fails ? 1 : 0);
