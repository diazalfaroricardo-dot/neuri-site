// QA #22 (agente QA): en /en/still-available/ la línea de tiempo de la noche decía «Apartado» (español).
// Regla: ninguna etiqueta de estado (span.pl / span.st) de las páginas en inglés usa palabras en español.
// Uso: node scripts/qa22-etiquetas-en-test.mjs          → revisa los archivos del repo (todas las en/**/index.html)
//      node scripts/qa22-etiquetas-en-test.mjs --vivo   → revisa https://neuri.tech/en/still-available/ en producción
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vivo = process.argv.includes('--vivo');
const espanol = /\b(Apartad[oa]s?|Contestad[oa]s?|Para ti|Pasad[oa] a ti|Pendiente|Vendid[oa]|En espera|Respondid[oa])\b/;

function htmls(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? htmls(p) : n.endsWith('.html') ? [p] : [];
  });
}

const fuentes = vivo
  ? [['https://neuri.tech/en/still-available/', await (await fetch('https://neuri.tech/en/still-available/?qa22=' + Date.now())).text()]]
  : htmls(join(root, 'en')).map((p) => [relative(root, p), readFileSync(p, 'utf8')]);

let fallas = 0;
for (const [nombre, html] of fuentes) {
  const etiquetas = [...html.matchAll(/<span class="(?:pl|st)\b[^"]*"[^>]*>([^<]*)<\/span>/g)].map((m) => m[1]);
  const malas = etiquetas.filter((t) => espanol.test(t));
  if (malas.length) { fallas++; console.log(`FALLA ${nombre}: ${malas.join(' | ')}`); }
  else if (etiquetas.length) console.log(`OK    ${nombre}: ${etiquetas.length} etiquetas en inglés`);
}
console.log(fallas ? `${fallas} fallas` : 'todo OK');
process.exit(fallas ? 1 : 0);
