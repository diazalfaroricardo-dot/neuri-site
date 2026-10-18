// A251: la FAQ «¿Y la respuesta automática de Marketplace?» existe en las 3 copias (JSON-LD, HTML, datos JS) ES/EN
// y es honesta: no promete contestar dentro de Marketplace (la API de Meta solo cubre Instagram y Páginas).
// Fuente: Meta agregó en mar-2026 una respuesta automática de Meta AI a «¿sigue disponible?» dentro de Marketplace
// (aphnetworks.com/news/31470-still-available-facebook-marketplace-now-lets-meta-ai-respond).
// Uso: node scripts/faq-marketplace-test.mjs [--live]
import { readFileSync } from "node:fs";
import { landingSource } from "./landing-src.mjs";
const live = process.argv.includes("--live");
const pages = [
  ["sigue-disponible/index.html", "¿Y la respuesta automática de Marketplace?", /contesta(mos)? (dentro de|en) Marketplace/i],
  ["en/still-available/index.html", "What about Marketplace’s own auto-reply?", /(we )?answers? (inside|in) Marketplace/i],
];
let fail = 0;
for (const [p, q, overclaim] of pages) {
  const html = await landingSource(p, live);
  const n = html.split(q).length - 1;
  const ok = n === 3;
  if (!ok) fail++;
  console.log(`${ok ? "OK   " : "FALLA"} ${p}${live ? " (en vivo)" : ""} · ${n}/3 copias`);
  const bad = overclaim.test(html);
  if (bad) fail++;
  console.log(`${bad ? "FALLA" : "OK   "} ${p} · no promete contestar dentro de Marketplace`);
}
if (fail) process.exitCode = 1;
// A252: el alta (paso 2, «¿Dónde vendes más?») avisa que Marketplace de perfil personal no se conecta.
for (const p of ["sigue-disponible/index.html", "en/still-available/index.html"]) {
  const html = await landingSource(p);
  const ok = /<p class="help" id="h-donde">[^<]*Marketplace[^<]*<\/p>/.test(html) && html.includes('aria-describedby="h-donde"');
  console.log(`${ok ? "OK   " : "FALLA"} ${p} · aviso de Marketplace en el alta (A252)`);
  if (!ok) process.exitCode = 1;
}
