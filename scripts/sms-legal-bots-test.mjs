// Candado SMS (23-nov-2026): términos y privacidad de neuri.bots ES/EN con lo que pide la revisión
// de la campaña A2P 10DLC (CTIA): consentimiento, frecuencia, cargos, STOP/HELP, operadoras y la
// frase de que los números y el consentimiento para SMS no se comparten para marketing.
import { readFileSync } from "node:fs";
let fallas = 0;
const ok = (c, m) => { console.log(`${c ? "ok   " : "FALLA"} ${m}`); if (!c) fallas++; };
const casos = [
  { p: "sigue-disponible/terminos/index.html", t: ['id="sms"', "Message and data rates may apply", "<b>STOP</b>", "<b>HELP</b>", "<b>START</b>", "La cantidad de mensajes varía", "no son responsables de mensajes retrasados", "no se comparten con terceros ni afiliados para fines de marketing", "TCPA", "Códigos de regalo"] },
  { p: "en/still-available/terms/index.html", t: ['id="sms"', "Message and data rates may apply", "<b>STOP</b>", "<b>HELP</b>", "<b>START</b>", "Message frequency varies", "not liable for delayed or undelivered messages", "not shared with third parties or affiliates for marketing or promotional purposes", "TCPA", "Gift codes"] },
  { p: "sigue-disponible/privacidad/index.html", t: ['<h3 id="sms">', "no se comparten con terceros ni afiliados para fines de marketing", "<td>Twilio</td>", "<td>ElevenLabs</td>", "<td>TikTok</td>", "<td>Sentry</td>", "<td>Cal.com</td>", "<td>Shopify</td>", "Conversions API", "Códigos de regalo"] },
  { p: "en/still-available/privacy/index.html", t: ['<h3 id="sms">', "text messaging originator opt-in data and consent; this information will not be shared with any third parties", "<td>Twilio</td>", "<td>ElevenLabs</td>", "<td>TikTok</td>", "<td>Sentry</td>", "<td>Cal.com</td>", "<td>Shopify</td>", "Conversions API", "Gift codes"] },
  // Prueba pública del opt-in para la campaña A2P (25-nov-2026): «Text us» + número + aviso + links.
  { p: "en/still-available/text-us/index.html", t: ["Text us at", "sms:+15076876869", "By texting us you agree to receive replies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.", 'href="/en/still-available/privacy/#sms"', 'href="/en/still-available/terms/#sms"', "We do not sell or share your SMS opt-in data or personal information with third parties for marketing purposes"] },
  { p: "en/still-available/privacy/index.html", t: ["We do not sell or share your SMS opt-in data or personal information with third parties for marketing purposes.", "<title>Privacy Policy · neuri.bots | Neuri</title>"] },
];
for (const c of casos) { const s = readFileSync(new URL(`../${c.p}`, import.meta.url), "utf8"); for (const t of c.t) ok(s.includes(t), `${c.p}: ${t}`); }
if (fallas) { console.error(`${fallas} falla(s)`); process.exit(1); }
console.log("sms-legal-bots: todo bien");
