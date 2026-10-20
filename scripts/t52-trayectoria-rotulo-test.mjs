// T52 (B-A8): las cifras de trayectoria de /consultoria y /en/ai-consulting llevan, antes de los KPI, un rótulo visible
// que dice que son del fundador como empleado y no resultados de clientes de Neuri.
import { readFileSync } from "node:fs";
const pages = {
  "consultoria/index.html": /Trayectoria del fundador[^<]*no son resultados de clientes de Neuri/,
  "en/ai-consulting/index.html": /founder's track record[^<]*not results from Neuri clients/,
};
let fails = 0;
for (const [p, re] of Object.entries(pages)) {
  const html = readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
  const nota = html.indexOf('class="trayec"'), kpis = html.indexOf('class="kpis');
  if (nota < 0 || !re.test(html) || nota > kpis || !/\.trayec\{/.test(html)) { fails++; console.error(`✗ ${p}: falta el rótulo de trayectoria antes de los KPI`); }
  else console.log(`✓ ${p}`);
}
process.exit(fails ? 1 : 0);
