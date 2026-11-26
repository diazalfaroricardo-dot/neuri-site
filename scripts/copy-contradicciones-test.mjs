// copy-contradicciones (auditoría de copy, 23-nov-2026): tres errores de hecho que no deben volver.
// 1) neuri.bots: /estado dice meta "open" y whatsapp "on" → ninguna página pública dice que Instagram,
//    Messenger o WhatsApp siguen «pendientes de Meta». (SMS sí sigue «pronto»; TikTok ya contesta comentarios, 25-nov.)
//    Los términos/privacidad quedan fuera: hablan en general de que cada conexión depende del permiso de Meta.
// 2) neuri.marketing: un solo mensaje → herramientas gratis abiertas, cuentas pronto. Sin «acceso anticipado»
//    ni «gratis y ya disponible» al lado de «todavía no abrimos cuentas nuevas».
// 3) neuri.bazar: el archivo de pagos para el banco va en todos los planes (packages/core/src/plans.ts no lo
//    limita; Básico lo lista). «Incluido en Plus» es de la tienda en línea y debe decirlo.
// Uso: node scripts/copy-contradicciones-test.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const leer = (f) => readFileSync(join(root, f), "utf8");
const texto = (s) => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
let fallas = 0;
const mal = (m) => { console.error(`✗ ${m}`); fallas++; };

// 1) Meta abierta
const botsPaginas = ["index.html", "es/index.html", "en/home/index.html", "llms.txt", "scripts/vs-paginas.py"];
for (const dir of ["sigue-disponible", "en/still-available"]) {
  botsPaginas.push(`${dir}/index.html`);
  for (const d of readdirSync(join(root, dir)))
    if (statSync(join(root, dir, d)).isDirectory() && !/^(terminos|terms|privacidad|privacy)$/.test(d)) botsPaginas.push(`${dir}/${d}/index.html`);
}
const metaViejo = /Meta pendiente|pendiente de (la )?(aprobación de )?Meta|pending Meta|Esperamos su aprobación|waiting on Meta|still waiting on Meta|todavía espera a Meta|en cuanto Meta abra|as soon as Meta opens|WhatsApp en camino|WhatsApp on the way/i;
for (const f of botsPaginas) {
  let s;
  try { s = leer(f); } catch { continue; }
  const m = s.match(metaViejo);
  if (m) mal(`${f}: «${m[0]}» y Meta ya está abierta (/estado: meta "open", whatsapp "on")`);
}
for (const [f, re] of [["es/index.html", /Instagram, Facebook y WhatsApp/], ["index.html", /Instagram, Facebook and WhatsApp/]])
  if (!re.test(leer(f))) mal(`${f}: la tarjeta de neuri.bots no dice que ya contesta en Instagram, Facebook y WhatsApp`);

// 2) Marketing: un solo mensaje
for (const [f, abiertas, pronto] of [
  ["marketing/index.html", /Herramientas gratis abiertas/, /cuentas[^.<]{0,40}pronto|abren pronto/i],
  ["en/marketing/index.html", /Free tools open/, /accounts[^.<]{0,40}soon|open soon/i],
]) {
  const s = leer(f);
  const m = s.match(/acceso anticipado|early access|Gratis y ya disponible|Free and available now/i);
  if (m) mal(`${f}: «${m[0]}» contradice «todavía no abrimos cuentas nuevas»`);
  if (!abiertas.test(s)) mal(`${f}: falta «herramientas gratis abiertas»`);
  if (!pronto.test(texto(s))) mal(`${f}: falta «cuentas, pronto»`);
}

// 3) Bazar: archivo para el banco en todos los planes; «Incluido en Plus» es de la tienda
for (const [f, todos, tienda] of [
  ["bazar/index.html", /Archivo de pagos para el banco<\/dt><dd>[^<]*En todos los planes/, /<p class="ti-k">Tienda en línea · incluida en Plus/],
  ["en/bazar/index.html", /Bank payout file<\/dt><dd>[^<]*On every plan/, /<p class="ti-k">Online store · included in Plus/],
]) {
  const s = leer(f);
  if (!todos.test(s)) mal(`${f}: el archivo de pagos para el banco no dice que va en todos los planes`);
  if (!tienda.test(s)) mal(`${f}: «Incluido en Plus» no dice que es la tienda en línea (se lee como si fuera el archivo del banco)`);
  if (/<p class="ti-k">(Incluido en Plus|Included in Plus)/.test(s)) mal(`${f}: «Incluido en Plus» suelto justo después del archivo para el banco`);
}

if (!fallas) console.log("✓ sin las 3 contradicciones: Meta abierta, Marketing con un solo mensaje, archivo del banco en todos los planes");
process.exit(fallas ? 1 : 0);
