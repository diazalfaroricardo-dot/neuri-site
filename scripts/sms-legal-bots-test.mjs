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
];
for (const c of casos) { const s = readFileSync(new URL(`../${c.p}`, import.meta.url), "utf8"); for (const t of c.t) ok(s.includes(t), `${c.p}: ${t}`); }
if (fallas) { console.error(`${fallas} falla(s)`); process.exit(1); }
console.log("sms-legal-bots: todo bien");
