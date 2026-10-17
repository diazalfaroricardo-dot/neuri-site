// A253: la FAQ «¿Por qué no uso las respuestas automáticas que ya trae Instagram?» existe en las 3 copias
// (JSON-LD, HTML, datos JS) ES/EN, reconoce que las nativas son gratis y bastan para saludar/ausencia,
// y no promete nada que neuri.bots no haga (sin cifras ni «ventas garantizadas»).
// Fuente: inro.social «How to Set Up Instagram Auto Reply (2026)» — lo nativo cubre saludo y ausencia;
// respuestas distintas por pregunta y comentarios no.
// Uso: node scripts/faq-instagram-nativo-test.mjs [--live]
import { readFileSync } from "node:fs";
const live = process.argv.includes("--live");
const pages = [
  ["sigue-disponible/index.html", "¿Por qué no uso las respuestas automáticas que ya trae Instagram?", /son gratis: si con eso te basta, úsalas/],
  ["en/still-available/index.html", "Why not use Instagram’s built-in auto-replies?", /they’re free: if that’s all you need, use them/],
];
const overclaim = /(garantiza|guaranteed|\d+\s?%|más ventas|more sales)/i;
let fail = 0;
for (const [p, q, honest] of pages) {
  const html = live ? await (await fetch(`https://neuri.tech/${p.replace("index.html", "")}?t=${Date.now()}`)).text() : readFileSync(p, "utf8");
  const n = html.split(q).length - 1;
  const ok = n === 3;
  if (!ok) fail++;
  console.log(`${ok ? "OK   " : "FALLA"} ${p}${live ? " (en vivo)" : ""} · ${n}/3 copias`);
  const hn = (html.match(new RegExp(honest.source, "g")) || []).length === 3;
  if (!hn) fail++;
  console.log(`${hn ? "OK   " : "FALLA"} ${p} · reconoce que las nativas son gratis y pueden bastar`);
  const i = html.indexOf(q);
  const ans = html.slice(i, i + 700);
  const bad = overclaim.test(ans);
  if (bad) fail++;
  console.log(`${bad ? "FALLA" : "OK   "} ${p} · sin cifras ni promesas`);
}
if (fail) process.exitCode = 1;
