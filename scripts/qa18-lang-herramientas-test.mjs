// QA #18 (agente QA): en /en/marketing los links a las herramientas gratis de marketing.neuri.tech
// (/diagnostico, /guia, /marca…, /privacidad, /terminos) abrían en español porque no llevaban ?lang=en.
// Regla: todo href a marketing.neuri.tech en la landing lleva el idioma de la página (ES ?lang=es, EN ?lang=en).
// Uso: node scripts/qa18-lang-herramientas-test.mjs          → revisa los archivos del repo
//      node scripts/qa18-lang-herramientas-test.mjs --vivo   → revisa https://neuri.tech en producción
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vivo = process.argv.includes('--vivo');
const paginas = [['marketing/index.html', 'https://neuri.tech/marketing/', 'es'], ['en/marketing/index.html', 'https://neuri.tech/en/marketing/', 'en']];
let fallas = 0;
for (const [archivo, url, lang] of paginas) {
  const html = vivo ? await (await fetch(url + '?qa18=' + Date.now())).text() : readFileSync(join(root, archivo), 'utf8');
  const hrefs = [...html.matchAll(/href="(https:\/\/marketing\.neuri\.tech\/[^"]*)"/g)].map((m) => m[1]);
  const malos = hrefs.filter((h) => new URL(h).searchParams.get('lang') !== lang);
  if (!hrefs.length) { console.log(`FALLA ${lang}: no hay links a marketing.neuri.tech`); fallas++; continue; }
  if (malos.length) fallas++;
  console.log(`${malos.length ? 'FALLA' : 'OK   '} ${lang} ${vivo ? url : archivo}: ${hrefs.length} links${malos.length ? ' · sin ?lang=' + lang + ': ' + malos.join(', ') : ''}`);
}
console.log(fallas ? `${fallas} fallas` : 'todo OK');
process.exit(fallas ? 1 : 0);
