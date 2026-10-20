// Candado: los buscadores de IA (ChatGPT, Claude, Perplexity, Google, Apple) pueden leer Neuri.
// Sin --live revisa robots.txt local; con --live además pide cada página como cada bot y exige 200.
// Fuentes: limy.ai «llms.txt in 2026» (12-may-2026), ecorpit.com «Does llms.txt help SEO?» (7-jul-2026).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const BOTS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'OAI-SearchBot', 'Google-Extended', 'Applebot-Extended'];
const URLS = [
  'https://neuri.tech/', 'https://neuri.tech/en/home/', 'https://neuri.tech/llms.txt',
  'https://neuri.tech/sigue-disponible/', 'https://neuri.tech/en/still-available/',
  'https://neuri.tech/bazar/', 'https://neuri.tech/en/', 'https://neuri.tech/consultoria/',
  'https://neuri.tech/en/ai-consulting/', 'https://neuri.tech/marketing/', 'https://neuri.tech/en/marketing/',
];
let fallas = 0;
const falla = (m) => { fallas++; console.error('✗ ' + m); };

// robots.txt: ningún bloque que aplique a un bot de IA (o a *) puede tener «Disallow: /».
export function revisaRobots(txt, origen) {
  let agentes = [];
  let enReglas = false;
  for (const linea of txt.split(/\r?\n/)) {
    const [k, ...r] = linea.split(':');
    const clave = (k || '').trim().toLowerCase();
    const valor = r.join(':').trim();
    if (clave === 'user-agent') { if (enReglas) { agentes = []; enReglas = false; } agentes.push(valor.toLowerCase()); }
    else if (clave === 'disallow' || clave === 'allow') {
      enReglas = true;
      if (clave === 'disallow' && valor === '/') {
        const tocados = agentes.filter((a) => a === '*' || BOTS.some((b) => b.toLowerCase() === a));
        if (tocados.length) falla(`${origen}: «Disallow: /» bloquea a ${tocados.join(', ')}`);
      }
    }
  }
  if (!/^sitemap:\s*https:\/\/neuri\.tech\/sitemap\.xml/im.test(txt)) falla(`${origen}: falta Sitemap`);
}

if (process.argv.includes('--autoprueba')) {
  // El candado debe fallar con un robots.txt que bloquea a GPTBot.
  revisaRobots('User-agent: GPTBot\nDisallow: /\n\nSitemap: https://neuri.tech/sitemap.xml', 'autoprueba');
  if (fallas !== 1) { console.error('bots-ia: la autoprueba no detectó el bloqueo'); process.exit(1); }
  fallas = 0;
}

revisaRobots(readFileSync(raiz + 'robots.txt', 'utf8'), 'robots.txt local');

if (process.argv.includes('--live')) {
  const r = await fetch('https://neuri.tech/robots.txt');
  revisaRobots(await r.text(), 'robots.txt en vivo');
  for (const bot of BOTS) {
    for (const url of URLS) {
      const res = await fetch(url, { headers: { 'user-agent': `Mozilla/5.0 (compatible; ${bot}/1.0)` }, redirect: 'manual' });
      if (res.status !== 200) falla(`${bot} ${url} → ${res.status}`);
    }
  }
}

if (fallas) { console.error(`bots-ia: ${fallas} falla(s)`); process.exit(1); }
console.log(`bots-ia: OK (${BOTS.length} bots${process.argv.includes('--live') ? ` × ${URLS.length} páginas en vivo` : ', robots.txt'})`);
