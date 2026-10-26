// t20 + t23 (revisión 26-oct): el alta de Neuri Marketing está abierta, así que la landing (ES/EN),
// la tarjeta de neuri.tech y llms.txt ya no dicen «Pronto» ni «lista de espera abierta», y los botones
// principales llevan a marketing.neuri.tech/empezar (cada plan con su ?plan=). Mientras Neuri no esté
// registrado ante el SAT tampoco decimos «IVA incluido» / «VAT included»: decimos «precio final».
// Uso: node scripts/t20-marketing-alta-test.mjs
import { readFileSync } from "node:fs";

const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
const fails = [];
const no = (f, re, why) => re.test(read(f)) && fails.push(`${f}: ${why} (${re})`);
const yes = (f, re, why) => re.test(read(f)) || fails.push(`${f}: falta ${why} (${re})`);

for (const f of ["marketing/index.html", "en/marketing/index.html"]) {
  no(f, /IVA incluido|VAT included|with VAT|IVA incl/i, "promete IVA incluido sin registro SAT");
  no(f, /<b>(Pronto|Soon)<\/b>|Lista de espera abierta|Waitlist open|Join the waitlist|Unirme a la lista/, "estado Pronto/lista de espera");
  no(f, /(se activa|se encienden?|turns? on) (al abrir|at launch|when we open)|cuando abramos/i, "«al abrir» con el alta abierta");
  no(f, /Todavía no\. Lo estamos construyendo|Not yet\. We're building it/, "FAQ dice que todavía no se puede usar");
  no(f, /href="#lista">(Apartar mi lugar|Save my spot)/, "botón de plan a la lista de espera");
  yes(f, /data-cta="marketing header"[^>]*>|href="https:\/\/marketing\.neuri\.tech\/empezar\?lang=(es|en)" data-cta="marketing header"/, "CTA del encabezado");
  yes(f, /href="https:\/\/marketing\.neuri\.tech\/empezar\?lang=(es|en)" data-cta="marketing header"/, "encabezado → /empezar");
  for (const p of ["inicio", "crece", "pro"])
    yes(f, new RegExp(`href="https://marketing\\.neuri\\.tech/empezar\\?lang=(es|en)&amp;plan=${p}"`), `botón del plan ${p}`);
}
for (const f of ["marketing/index.html", "en/marketing/index.html"])
  yes(f, /searchParams\.set\('ref',ref\)/, "?ref de «Hecho con Neuri» pasa a /empezar (MK160)");
no("index.html", /Neuri Marketing \(pronto\)|Neuri Marketing<small>Lista de espera|Contenido · Lista de espera/, "tarjeta de Marketing en neuri.tech con lista de espera");
no("llms.txt", /Not available yet; waitlist open|IVA incluido/, "llms.txt viejo");

if (fails.length) {
  console.error(`✗ t20/t23: ${fails.length}\n- ${fails.join("\n- ")}`);
  process.exit(1);
}
console.log("✓ t20/t23: landing de Marketing con alta abierta y sin «IVA incluido»");
