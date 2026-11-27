// backlog/legal-privacidad-bots-google (22-nov-2026): la privacidad de neuri.bots (v1.3) y la de datos de
// Google (/legal/google v1.1) dicen los permisos que el código pide de verdad (neuri-bazar
// packages/sd-setup/src/gcal.ts: calendar.freebusy + calendar.app.created; greviews/api.ts: business.manage)
// y traen la declaración de Uso Limitado de la Google API Services User Data Policy.
// Uso: node scripts/legal-google-permisos-test.mjs [--live]
import { readFileSync } from "node:fs";

const live = process.argv.includes("--live");
const leer = async (p) =>
  live ? (await fetch(`https://neuri.tech/${p.replace("index.html", "")}?t=${Date.now()}`)).text() : readFileSync(p, "utf8");
let fallos = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FALLA") + " " + m); if (!c) fallos++; };
const LU = /use and transfer to any other app of information received from Google APIs will adhere to the <a href="https:\/\/developers\.google\.com\/terms\/api-services-user-data-policy"[^>]*>Google API Services User Data Policy<\/a>, including the Limited Use requirements/;

const casos = [
  { p: "sigue-disponible/privacidad/index.html", version: "Versión 1.13 (vigente", gbp: "Perfil de Negocio de Google (reseñas)", noIA: "no se manda a ningún modelo de IA", off: "con el botón <b>Desconectar</b> en Conexiones" },
  { p: "en/still-available/privacy/index.html", version: "Version 1.13 (in force", gbp: "Google Business Profile (reviews)", noIA: "not sent to any AI model", off: "with the <b>Disconnect</b> button in Connections" },
  { p: "legal/google/index.html", version: "Versión 1.1 (vigente)", gbp: "Perfil de Negocio de Google en neuri.bots", noIA: "no se manda a ningún modelo de IA" },
  { p: "en/legal/google/index.html", version: "Version 1.1 (in force)", gbp: "Google Business Profile in neuri.bots", noIA: "not sent to any AI model" },
];

for (const c of casos) {
  const s = await leer(c.p);
  const main = (s.match(/<main[\s\S]*?<\/main>/) || [""])[0];
  ok(main.includes(c.version), `${c.p}: ${c.version}`);
  ok(/calendar\.freebusy/.test(main) && /calendar\.app\.created/.test(main), `${c.p}: nombra calendar.freebusy y calendar.app.created`);
  // calendar.events solo puede aparecer para decir que NO se pide (y en el registro de cambios).
  const usos = [...main.matchAll(/[^.>]{0,80}<code>(?:https:\/\/www\.googleapis\.com\/auth\/)?calendar\.events<\/code>/g)].map((m) => m[0]);
  ok(usos.length > 0 && usos.every((u) => /No pedimos|We don't request|ya no|no longer/.test(u)), `${c.p}: calendar.events solo como «no lo pedimos»`);
  ok(main.includes(c.gbp) && /business\.manage/.test(main), `${c.p}: sección de Google Business Profile con business.manage`);
  ok(main.includes(c.noIA), `${c.p}: el texto de las reseñas de bots no va a IA`);
  ok(LU.test(main), `${c.p}: declaración de Uso Limitado`);
  // A351 (22-nov): el botón «Desconectar» de reseñas de Google (privacidad de bots v1.3).
  if (c.off) ok(main.includes(c.off), `${c.p}: se desconecta con el botón Desconectar en Conexiones`);
}
process.exit(fallos ? 1 : 0);
