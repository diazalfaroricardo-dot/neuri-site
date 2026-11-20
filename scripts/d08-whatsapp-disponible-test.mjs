// D-08 (#102 de neuri-bazar): WhatsApp ya está disponible en neuri.bots (Mi asistente lo conecta).
// La landing de bots y sus subpáginas, ES y EN (HTML + scripts sd-*), no dicen que WhatsApp viene «pronto».
// Uso: node scripts/d08-whatsapp-disponible-test.mjs [--live]
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { landingSource } from "./landing-src.mjs";

const live = process.argv.includes("--live");
const pages = [];
for (const dir of ["sigue-disponible", "en/still-available"]) {
  pages.push(`${dir}/index.html`);
  for (const d of readdirSync(dir)) if (statSync(join(dir, d)).isDirectory()) pages.push(`${dir}/${d}/index.html`);
}
const malas = [
  /WhatsApp\s*·\s*(pronto|soon)/i,
  /WhatsApp\s*\((próximamente|coming soon)\)/i,
  /WhatsApp,?\s*(próximamente|coming soon)/i,
  /(pronto|soon)[^<.]{0,12}WhatsApp/i,
  /WhatsApp (llega pronto|coming soon)/i,
  /cuando WhatsApp esté listo|as soon as WhatsApp is ready/i,
  /<span>WhatsApp<\/span><em>(Pronto|Soon)<\/em>/,
];
let fallas = 0;
for (const p of pages) {
  let src;
  try { src = await landingSource(p, live); } catch { continue; }
  for (const re of malas) {
    const m = src.match(re);
    if (m) { console.log(`✗ ${p}: «${m[0]}»`); fallas++; }
  }
}
for (const [p, frase] of [["sigue-disponible/index.html", "Ya está disponible."], ["en/still-available/index.html", "It’s available now."]]) {
  if (!(await landingSource(p, live)).includes(frase)) { console.log(`✗ ${p}: falta «${frase}» en la FAQ de WhatsApp`); fallas++; }
}
if (fallas) process.exit(1);
console.log(`✓ D-08 WhatsApp disponible: ${pages.length} páginas de bots sin «pronto/soon»${live ? " (en vivo)" : ""}`);
