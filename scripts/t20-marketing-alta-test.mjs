// t20 (reabierto por Ricardo 4-nov): el alta de Neuri Marketing está CERRADA hasta encender Meta. La landing
// (ES/EN), las portadas y llms.txt no prometen crear cuenta; los botones llevan al ejemplo (/demo) y no hay
// lista de espera. t23: mientras Neuri no esté
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
  // AUD29: con el alta abierta, POST /lista en producción redirige a /empezar sin guardar: un formulario
  // de «te avisamos» aquí promete un aviso que nunca sale.
  no(f, /marketing\.neuri\.tech\/lista|data-form="marketing"|id="join"/, "formulario que promete avisar y no guarda (AUD29)");
  no(f, /marketing\.neuri\.tech\/empezar\?lang=(es|en)["&]/, "botón o link a /empezar con el alta cerrada");
  no(f, /Crear mi cuenta|Crear cuenta|Crea tu cuenta|Elegir este plan|Quiero la mía|Create my account|Create account|Create your account|Choose this plan|I want mine|Sign up today/, "promete crear cuenta con el alta cerrada");
  no(f, /Sí\. Creas tu cuenta|Yes\. Create your account/, "la FAQ (o su JSON-LD) dice que ya se puede");
  yes(f, /href="https:\/\/marketing\.neuri\.tech\/demo\?lang=(es|en)" data-cta="marketing header"/, "encabezado → ejemplo");
  yes(f, /hola@neuri\.tech/, "contacto");
  yes(f, /Todavía no abrimos cuentas nuevas|we are not opening new accounts/, "FAQ honesta");
}
for (const f of ["marketing/index.html", "en/marketing/index.html"])
  yes(f, /searchParams\.set\('ref',ref\)/, "?ref de «Hecho con Neuri» pasa a /empezar (MK160)");
no("index.html", /Neuri Marketing \(pronto\)|Neuri Marketing<small>Lista de espera|Contenido · Lista de espera/, "tarjeta de Marketing en neuri.tech con lista de espera");
no("en/home/index.html", /Waitlist|waitlist|Will draft your business/, "portada EN de Marketing con lista de espera (qa #62)");
no("404.html", /Neuri Marketing \(pronto\)/, "la página 404 dice que Marketing es «pronto»");
no("llms.txt", /Not available yet; waitlist open|IVA incluido|Open for sign-up at https:\/\/marketing/, "llms.txt viejo");
no("index.html", /Neuri Marketing<small>Alta abierta|Contenido · Alta abierta|MISIÓN 04[^\n]*Alta abierta/, "portada dice Alta abierta en Marketing");
no("en/home/index.html", /Neuri Marketing<small>Sign-up open|Content · Sign-up open|MISSION 04[^\n]*Sign-up open/, "portada EN dice Sign-up open en Marketing");

if (fails.length) {
  console.error(`✗ t20/t23: ${fails.length}\n- ${fails.join("\n- ")}`);
  process.exit(1);
}
console.log("✓ t20/t23: landing de Marketing con alta cerrada, sin promesas de cuenta y sin «IVA incluido»");
