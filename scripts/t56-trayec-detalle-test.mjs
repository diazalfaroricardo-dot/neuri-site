// T56 (baja, B-A8): el bloque de detalle con «US$100M+» junto a Amazon lleva su propio rótulo de trayectoria (ES/EN).
import { readFileSync } from "node:fs";
const live = process.argv.includes("--live");
const get = async (p, u) => live ? (await fetch(u + "?t=" + Date.now())).text() : readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
let fails = 0; const ok = (c, m) => { if (c) console.log(`✓ ${m}`); else { fails++; console.error(`✗ ${m}`); } };
for (const [p, u, re] of [["consultoria/index.html", "https://neuri.tech/consultoria/", /no resultados de clientes de Neuri\.<\/p>\s*<div class="wins">/], ["en/ai-consulting/index.html", "https://neuri.tech/en/ai-consulting/", /not results from Neuri clients\.<\/p>\s*<div class="wins">/]]) {
  const h = await get(p, u); if (/consulting\.neuri\.tech\/\?lang=/.test(h) && /noindex/.test(h)) { ok(true, `${p}: redirige a consulting.neuri.tech (t66)`); continue; } ok(re.test(h), `${p}: rótulo justo antes de los logros`);
}
process.exit(fails ? 1 : 0);
