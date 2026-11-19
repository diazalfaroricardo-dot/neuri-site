// AU1118-43 (Marketing): en la landing en inglés la hora de las publicaciones va con AM/PM, no 24 h.
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../en/marketing/index.html', import.meta.url), 'utf8');
const bad = html.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*(?: \d+ ·| at)? \d{1,2}:\d{2}(?! ?[AP]M)\b/g) ?? [];
if (bad.length) { console.error('✗ horas en 24 h en /en/marketing:', bad.slice(0, 5)); process.exit(1); }
console.log('✓ AU1118-43: /en/marketing con hora AM/PM');
