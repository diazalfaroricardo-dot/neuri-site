// Pedido de Ricardo (2026-11-21): los términos de todas las apps dicen una sola cuenta por red.
// neuri.bots ES/EN: sección «Una cuenta por red» con las cuatro redes, más cuentas no incluidas
// (se piden a hola@neuri.tech), WhatsApp ya conectable, TikTok por etapas y versión 0.5 (23-nov-2026; v0.5 agrega SMS y códigos de regalo).
// Uso: node scripts/bots-terminos-una-cuenta-test.mjs [--live]
import { readFileSync } from "node:fs";

const live = process.argv.includes("--live");
const leer = async (p) =>
  live ? (await fetch(`https://neuri.tech/${p.replace("index.html", "")}?t=${Date.now()}`)).text() : readFileSync(p, "utf8");
let fallos = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FALLA") + " " + m); if (!c) fallos++; };

const casos = [
  {
    p: "sigue-disponible/terminos/index.html",
    titulo: "Una cuenta por red",
    redes: ["una cuenta de Instagram", "una página de Facebook (Messenger)", "un número de WhatsApp", "una cuenta de TikTok"],
    fuera: "no están incluidas",
    version: "Versión 0.13",
    fecha: "27 de noviembre de 2026",
    viejo: [/WhatsApp está en camino/, /por <b>Instagram y Messenger<\/b>/],
    tiktok: /TikTok<\/b> y los <b>mensajes de texto \(SMS\)<\/b> se van encendiendo por etapas/,
  },
  {
    p: "en/still-available/terms/index.html",
    titulo: "One account per network",
    redes: ["one Instagram account", "one Facebook Page (Messenger)", "one WhatsApp number", "one TikTok account"],
    fuera: "are not included",
    version: "Version 0.13",
    fecha: "November 27, 2026",
    viejo: [/WhatsApp is on the way/, /on <b>Instagram and Messenger<\/b>/],
    tiktok: /TikTok<\/b> and <b>text messages \(SMS\)<\/b> are being turned on in stages/,
  },
];

for (const c of casos) {
  const s = await leer(c.p);
  const sec = (s.match(/<section id="(?:una-cuenta-por-red|one-account-per-network)">([\s\S]*?)<\/section>/) || [])[1] || "";
  ok(sec.includes(c.titulo), `${c.p}: título «${c.titulo}»`);
  ok(/data-terms-accounts/.test(sec), `${c.p}: marca data-terms-accounts`);
  for (const r of c.redes) ok(sec.includes(r), `${c.p}: nombra «${r}»`);
  ok(sec.includes(c.fuera), `${c.p}: más cuentas «${c.fuera}»`);
  ok(sec.includes("mailto:hola@neuri.tech"), `${c.p}: se piden a hola@neuri.tech`);
  ok(s.includes(c.version) && s.includes(c.fecha), `${c.p}: ${c.version} · ${c.fecha}`);
  ok(c.tiktok.test(s), `${c.p}: TikTok por etapas`);
  // v0.4: cargos de Meta por WhatsApp (plantillas) fuera del plan, pagados en la cuenta de WhatsApp Business.
  ok(/<li data-terms-meta-fees>[^<]*<b>[^<]+<\/b>[^<]*(WhatsApp Business)/.test(s), `${c.p}: cláusula de cargos de Meta por WhatsApp`);
  for (const re of c.viejo) ok(!re.test(s), `${c.p}: ya no dice ${re}`);
  const nums = [...s.matchAll(/<section id="[^"]+"><h2>(\d+)\. /g)].map((m) => +m[1]);
  ok(nums.every((n, i) => n === i + 1), `${c.p}: secciones numeradas 1..${nums.length} sin saltos`);
}
process.exit(fallos ? 1 : 0);
