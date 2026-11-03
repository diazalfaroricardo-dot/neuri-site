/**
 * B-A8/B-A2: el paso «Conectas tu cuenta» de la landing de bots no da por hecha una conexión que aún
 * espera a Meta. Antes el aviso solo vivía en una pregunta frecuente cerrada. Lee el HTML, ES y EN.
 * Quitar esta prueba cuando la app de Meta esté aprobada y el aviso salga de la landing.
 * Uso: node scripts/bots-paso2-meta-test.mjs
 */
import { readFileSync } from "node:fs";
const casos = [
  ["sigue-disponible/index.html", "Conectas tu cuenta", /pendiente de aprobación de Meta/],
  ["en/still-available/index.html", "Connect your account", /pending Meta’s approval/],
];
let fallas = 0;
for (const [f, titulo, aviso] of casos) {
  const html = readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
  const i = html.indexOf(titulo);
  const parrafo = i < 0 ? "" : html.slice(i, html.indexOf("</p>", i));
  const ok = aviso.test(parrafo);
  console.log(`${ok ? "OK" : "FALLA"} ${f}`);
  if (!ok) fallas++;
}
process.exit(fallas ? 1 : 0);
