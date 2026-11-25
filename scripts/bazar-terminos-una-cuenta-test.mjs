// Pedido de Ricardo (2026-11-21): los términos de todas las apps dicen una sola cuenta por red.
// neuri.bazar ES/EN, sección 9: una página de Facebook y una cuenta de Instagram por bazar, más cuentas
// no incluidas (se piden a hola@neuri.tech), WhatsApp es para avisos (no cuenta conectada), TikTok no
// aplica hoy, y versión 0.5 (vigente) del 22 de noviembre de 2026.
// Uso: node scripts/bazar-terminos-una-cuenta-test.mjs [--live]
import { readFileSync } from "node:fs";

const live = process.argv.includes("--live");
const leer = async (p) =>
  live ? (await fetch(`https://neuri.tech/${p.replace("index.html", "")}?t=${Date.now()}`)).text() : readFileSync(p, "utf8");
let fallos = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FALLA") + " " + m); if (!c) fallos++; };

const casos = [
  {
    p: "bazar/terminos/index.html", id: "redes",
    frases: ["Una cuenta por red", "una página de Facebook y una cuenta de Instagram", "no están incluidas",
      "avisos a los vendedores", "no es una cuenta de redes conectada", "TikTok no aplica hoy"],
    version: "Versión 0.7", fecha: "25 de noviembre de 2026",
  },
  {
    p: "en/bazar/terms/index.html", id: "social",
    frases: ["One account per network", "one Facebook Page and one Instagram account", "are not included",
      "notices to vendors", "is not a connected social account", "TikTok does not apply"],
    version: "Version 0.7", fecha: "November 25, 2026",
  },
];

for (const c of casos) {
  const s = await leer(c.p);
  const sec = (s.match(new RegExp(`<section id="${c.id}"><h2>9\\. [\\s\\S]*?</section>`)) || [""])[0];
  ok(/data-terms-accounts/.test(sec), `${c.p}: sección 9 con data-terms-accounts`);
  for (const f of c.frases) ok(sec.includes(f), `${c.p}: «${f}»`);
  ok(sec.includes("mailto:hola@neuri.tech"), `${c.p}: se piden a hola@neuri.tech`);
  ok(s.includes(`${c.fecha} · ${c.version}`), `${c.p}: ${c.version} · ${c.fecha}`);
}
process.exit(fallos ? 1 : 0);
