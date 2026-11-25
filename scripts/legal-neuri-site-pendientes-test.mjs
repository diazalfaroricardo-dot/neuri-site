// legal-neuri-site-pendientes (D-09, 25-nov-2026): lo que Ricardo pidió publicar en vivo marcado «En revisión
// de abogado / Under attorney review» mientras el abogado lo revisa. Revisa, ES y EN:
// «Clientes en México» y uso justo en términos de bots y bazar, «Pagos a tus vendedores» en bazar, y en
// neuri.tech /legal los socios con suscripción regalada («Aplica cuando la función esté disponible»).
// Uso: node scripts/legal-neuri-site-pendientes-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const ES_MX = ["data-terms-mx", "<b>Clientes en México.</b>", "Ley Federal de Protección al Consumidor", "PROFECO", "tu negocio está fuera de México"];
const EN_MX = ["data-terms-mx", "<b>Customers in Mexico.</b>", "Federal Consumer Protection Law", "PROFECO", "your business is outside Mexico"];
const ES_UJ = ['id="uso-justo"', "data-terms-fairuse", "al menos 7 días", "No se vale evadir los límites", "al menos 30 días"];
const EN_UJ = ['id="fair-use"', "data-terms-fairuse", "at least 7 days", "Don't evade limits", "at least 30 days' notice"];
const pages = [
  ["sigue-disponible/terminos/index.html", "Versión 0.12", [...ES_MX, ...ES_UJ, "canales, mensajes o respuestas de IA", "lo que Meta cobra por mensajes de WhatsApp"], "En revisión de abogado", 4],
  ["en/still-available/terms/index.html", "Version 0.12", [...EN_MX, ...EN_UJ, "channels, messages or AI replies", "what Meta charges for WhatsApp messages"], "Under attorney review", 4],
  ["bazar/terminos/index.html", "Versión 0.9", [...ES_MX, ...ES_UJ, "puestos, piezas publicadas o créditos de IA", 'id="pagos-vendedores"', "data-terms-payouts", "Neuri no recibe, guarda ni envía ese dinero", "no presenta formularios 1099", "Tu bazar te paga por transferencia bancaria después de cada cierre"], "En revisión de abogado", 5],
  ["en/bazar/terms/index.html", "Version 0.9", [...EN_MX, ...EN_UJ, "booths, published items or AI credits", 'id="paying-vendors"', "data-terms-payouts", "Neuri does not receive, hold or send that money", "does not file 1099s", "Your store pays you by bank transfer after each closing"], "Under attorney review", 5],
  ["sigue-disponible/privacidad/index.html", "Versión 1.12", ['id="derechos-estatales"'], "En revisión de abogado", 2],
  ["en/still-available/privacy/index.html", "Version 1.12", ['id="us-state-rights"'], "Under attorney review", 2],
  ["bazar/privacidad/index.html", "Versión 0.6", ['id="derechos-estatales"'], "En revisión de abogado", 2],
  ["en/bazar/privacy/index.html", "Version 0.6", ['id="us-state-rights"'], "Under attorney review", 2],
  ["legal/index.html", "Versión 1.1", ['id="socios-h"', "data-legal-partners", "Aplica cuando la función esté disponible", "No es canjeable por dinero", "Neuri me regala el plan", "Términos del afiliado", "Ley Federal de Protección al Consumidor"], "En revisión de abogado", 4],
  ["en/legal/index.html", "Version 1.1", ['id="partners-h"', "data-legal-partners", "Applies once the feature is available", "can't be exchanged for money", "Neuri gifts me the plan", "Affiliate terms", "Federal Consumer Protection Law"], "Under attorney review", 4],
];
let fail = 0;
for (const [p, version, needles, review, minReview] of pages) {
  const html = readFileSync(join(root, p), "utf8");
  for (const n of [version, ...needles])
    if (!html.includes(n)) { console.error(`✗ ${p}: falta «${n}»`); fail++; }
  const c = html.split(review).length - 1;
  if (c < minReview) { console.error(`✗ ${p}: «${review}» aparece ${c} veces (mínimo ${minReview})`); fail++; }
  if (/\[(pendiente|NOMBRE|FECHA|place|lugar)/i.test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) { console.error(`✗ ${p}: quedó un [marcador] sin rellenar`); fail++; }
}
if (fail) process.exit(1);
console.log(`✓ legal-neuri-site-pendientes: ${pages.length} páginas con las cláusulas en vivo y «en revisión de abogado»`);
