#!/usr/bin/env node
// T25 — genera /en/marketing desde /marketing (mismo HTML/CSS, textos en inglés).
// Las traducciones viven en scripts/t25/marketing-en.json como pares [es, en] y se
// aplican en orden a todo el archivo. Así EN nunca vuelve a ser «otro diseño»:
// cuando cambie /marketing, se vuelve a correr y solo faltan las frases nuevas.
//
//   node scripts/t25-marketing-en.mjs            → reporte de frases en español pendientes
//   node scripts/t25-marketing-en.mjs --write    → escribe en/marketing/index.html SOLO si quedan 0
//   node scripts/t25-marketing-en.mjs --preview  → escribe el borrador en .t25/marketing-en.html (no se publica)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const es = readFileSync(join(root, 'marketing/index.html'), 'utf8');
const pairs = JSON.parse(readFileSync(join(root, 'scripts/t25/marketing-en.json'), 'utf8'));

// Cambios estructurales: idioma, canónica, og, y links a los pares en inglés.
const estructura = [
  ['<html lang="es">', '<html lang="en">'],
  ['<link rel="canonical" href="https://neuri.tech/marketing/">', '<link rel="canonical" href="https://neuri.tech/en/marketing/">'],
  ['<meta property="og:locale" content="es_MX">', '<meta property="og:locale" content="en_US">'],
  ['<meta property="og:url" content="https://neuri.tech/marketing/">', '<meta property="og:url" content="https://neuri.tech/en/marketing/">'],
  ['/assets/og/marketing-es.png', '/assets/og/marketing-en.png'],
  ['?lang=es', '?lang=en'],
  ['<a class="lk lk-idioma" href="/en/marketing/" hreflang="en" lang="en" aria-label="EN, English" data-idioma>EN</a>',
   '<a class="lk lk-idioma" href="/marketing/" hreflang="es" lang="es" aria-label="ES, Español" data-idioma>ES</a>'],
  ['href="https://neuri.tech/sigue-disponible/"', 'href="https://neuri.tech/en/still-available/"'],
  ['href="https://neuri.tech/bazar/"', 'href="https://neuri.tech/en/"'],
  ['href="https://neuri.tech/consultoria/"', 'href="https://neuri.tech/en/ai-consulting/"'],
  ['href="https://neuri.tech/"', 'href="https://neuri.tech/en/home/"'],
  ['<a class="logo" href="/"', '<a class="logo" href="/en/home/"'],
];

let en = es;
let sinUso = [];
for (const [a, b] of [...estructura, ...pairs]) {
  if (!en.includes(a)) { sinUso.push(a); continue; }
  en = en.split(a).join(b);
}

// Frases que siguen en español (texto visible, atributos legibles, JSON-LD y strings del script).
// Fuera: CSS, comentarios de JS (no se ven) y la línea KEYS (regex que entiende giros en los dos idiomas).
const sinEstilo = en.replace(/<style[\s\S]*?<\/style>/g, '').replace(/\/\/[^\n]*/g, '').replace(/var KEYS=[^\n]*/g, '');
const trozos = [];
for (const m of sinEstilo.matchAll(/>([^<>]+)</g)) trozos.push(m[1]);
for (const m of sinEstilo.matchAll(/(?:content|placeholder|aria-label|alt|title)="([^"]+)"/g)) trozos.push(m[1]);
for (const m of sinEstilo.matchAll(/'([^'\n]{3,})'|"([^"\n]{3,})"/g)) trozos.push(m[1] || m[2]);
const marca = /[áéíóúñ¿¡]|\b(de|que|tu|tus|para|con|los|las|una|sin|mes|cada|nada|negocio)\b/i;
// Palabras en español que EN usa a propósito (nombres propios, el ejemplo «¿cuánto?» del detector, el link «Español»).
const permitidas = [/Example Café/g, /Café \/ restaurant/g, /a café/g, /Día de Muertos/g, /Buen Fin/g, /“¿cuánto\?”/g, /Español/g, /taquería/g, /hola@neuri\.tech/g];
const limpia = (t) => permitidas.reduce((s, r) => s.replace(r, ''), t);
const pendientes = [...new Set(trozos.map((t) => t.trim()).filter((t) => t && marca.test(limpia(t)) && !/^https?:/.test(t)))];

console.log(`t25: ${pairs.length} pares · ${pendientes.length} frases en español pendientes`);
if (sinUso.length) console.log(`  pares sin uso (¿cambió /marketing?): ${sinUso.length}\n   - ` + sinUso.slice(0, 10).map((s) => s.slice(0, 80)).join('\n   - '));
if (process.argv.includes('--lista')) for (const p of pendientes) console.log('  · ' + p.slice(0, 140));

if (process.argv.includes('--preview')) {
  mkdirSync(join(root, '.t25'), { recursive: true });
  writeFileSync(join(root, '.t25/marketing-en.html'), en);
  console.log('  borrador: .t25/marketing-en.html (no se publica)');
}
if (process.argv.includes('--write')) {
  if (pendientes.length) { console.error('  NO se escribe en/marketing: faltan traducciones'); process.exit(1); }
  writeFileSync(join(root, 'en/marketing/index.html'), en);
  console.log('  escrito en/marketing/index.html');
}
