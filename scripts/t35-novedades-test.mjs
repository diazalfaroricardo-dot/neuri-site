// T35 (neuri.tech, confianza): /novedades/ dice en ES/EN lo que ya está en vivo, con fecha.
// Candado: ES y EN con las mismas fechas, la más reciente no es futura ni tiene más de 30 días
// (obliga a mantenerla viva), links internos existen, sin promesas («pronto», «próximamente»),
// ligada desde /legal/, sitemap y llms.txt. Uso: node scripts/t35-novedades-test.mjs [--live]
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };
const html = readFileSync(join(root, "novedades/index.html"), "utf8");
const MES = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 };
const es = [...html.matchAll(/<h2 id="n-\d+">(\d{1,2}) de (\w+) de (\d{4})<\/h2>/g)].map((m) => new Date(+m[3], MES[m[2]], +m[1]).getTime());
const en = [...html.matchAll(/<h3>(\w+ \d{1,2}, \d{4})<\/h3>/g)].map((m) => new Date(m[1]).getTime());
if (!es.length) bad("sin fechas en español");
if (es.join() !== en.join()) bad("las fechas ES y EN no coinciden");
const newest = Math.max(...es);
if (newest > Date.now() + 864e5) bad("fecha en el futuro");
if (Date.now() - newest > 30 * 864e5) bad("la novedad más reciente tiene más de 30 días: actualiza /novedades/");
if (!html.includes('<div lang="en">')) bad("sin bloque en inglés");
const body = html.split("<!--contenido-->")[1] || "";
if (/pronto|próximamente|coming soon|soon/i.test(body)) bad("promete algo que no existe (pronto/soon)");
for (const [, href] of body.matchAll(/href="(\/[^"#?]*)/g)) {
  const f = href.endsWith("/") ? join(root, href, "index.html") : join(root, href);
  if (!existsSync(f)) bad(`link interno roto ${href}`);
}
if (!readFileSync(join(root, "legal/index.html"), "utf8").includes('href="/novedades/"')) bad("/legal/ no liga a /novedades/");
if (!readFileSync(join(root, "sitemap.xml"), "utf8").includes("https://neuri.tech/novedades/")) bad("sitemap sin /novedades/");
if (!readFileSync(join(root, "llms.txt"), "utf8").includes("https://neuri.tech/novedades/")) bad("llms.txt sin /novedades/");
if (process.argv.includes("--live")) {
  const r = await fetch("https://neuri.tech/novedades/");
  const t = await r.text();
  if (r.status !== 200 || !t.includes("NEURI · NOVEDADES")) bad(`/novedades/ en vivo ${r.status}`);
}
if (!fail) console.log(`✓ T35: /novedades/ ES/EN ${es.length} fechas, vigente, sin promesas, ligada${process.argv.includes("--live") ? " · en vivo 200" : ""}`);
process.exit(fail ? 1 : 0);
