// QA #20 (agente QA): «El tiempo que te regresa» decía 18/32/48 publicaciones y /empezar y la Ayuda dicen 26/48/72
// (estas suman historias: quota.ts caps Inicio 12 fotos+2 carruseles+4 reels+8 historias = 26; Crece 48; Pro 72).
// Regla: cada tarjeta data-tiempo-plan muestra el total del plan (26/48/72) y aclara cuántas son historias.
// Uso: node scripts/qa20-cifras-plan-test.mjs [--vivo]
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const vivo = process.argv.includes('--vivo');
const total = { inicio: 26, crece: 48, pro: 72 };
const historias = { inicio: 8, crece: 16, pro: 24 };
const paginas = [['marketing/index.html', 'https://neuri.tech/marketing/', 'es', /historias/], ['en/marketing/index.html', 'https://neuri.tech/en/marketing/', 'en', /stories/]];
let fallas = 0;
for (const [archivo, url, lang, palabra] of paginas) {
  const html = vivo ? await (await fetch(url + '?qa20=' + Date.now())).text() : readFileSync(join(root, archivo), 'utf8');
  for (const plan of Object.keys(total)) {
    const m = html.match(new RegExp(`data-tiempo-plan="${plan}">([\\s\\S]*?)</div>`));
    const txt = m ? m[1].replace(/<[^>]+>/g, ' ') : '';
    const ok = txt.includes(String(total[plan])) && txt.includes(String(historias[plan])) && palabra.test(txt);
    if (!ok) fallas++;
    console.log(`${ok ? 'OK   ' : 'FALLA'} ${lang} ${plan}: ${txt.replace(/\s+/g, ' ').trim()}`);
  }
}
console.log(fallas ? `${fallas} fallas` : 'todo OK');
process.exit(fallas ? 1 : 0);
