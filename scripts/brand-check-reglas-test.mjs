// tech-cls-noindex-brandcheck (22-nov): las reglas de brand-check.mjs siguen al sitio publicado.
// Antes daba 101 avisos en 56 páginas y 51 eran falsos («no carga Geist de Google Fonts»: el sitio ya la
// autoaloja); además marcaba la Instrument Serif itálica que bots y ventures usan en vivo.
// Prueba solo las reglas puras (sin navegador): reglas que sí deben seguir avisando y las que ya no.
// Uso: node scripts/brand-check-reglas-test.mjs
import { readFileSync } from "node:fs";
import { fontAllowed, productOf, staticIssues } from "./brand-check.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("✗", m); } };
const read = (f) => readFileSync(ROOT + f, "utf8");

// Producto por ruta
ok(productOf("/sigue-disponible/") === "bots", "/sigue-disponible/ es bots");
ok(productOf("/afiliados/") === "consulting", "/afiliados/ usa la paleta de consulting");
ok(productOf("/ventures/") === "home", "/ventures/ es home");

// Tipografía: lo que está en vivo pasa…
ok(fontAllowed("bots", "Instrument Serif", true), "bots: serif itálica de acento permitida");
ok(fontAllowed("home", "Instrument Serif", true), "home/ventures: serif itálica de acento permitida");
ok(fontAllowed("consulting", "Instrument Serif", false), "consulting: serif recta permitida (títulos)");
for (const p of ["home", "bots", "bazar", "consulting", "marketing"]) {
  ok(fontAllowed(p, "Geist"), `${p}: Geist`);
  ok(fontAllowed(p, "Geist Mono"), `${p}: Geist Mono`);
}
// …y lo que no es de marca sigue avisando.
ok(!fontAllowed("bots", "Instrument Serif", false), "bots: serif recta (cuerpo/títulos) avisa");
ok(!fontAllowed("bazar", "Instrument Serif", true), "bazar: serif avisa");
ok(!fontAllowed("marketing", "Instrument Serif", true), "marketing: serif avisa");
ok(!fontAllowed("home", "Arial"), "fuente de sistema avisa");
ok(!fontAllowed("consulting", "monospace"), "monospace genérica avisa");

// Básicos estáticos con páginas reales: sin falsos.
for (const f of ["index.html", "sigue-disponible/index.html", "afiliados/index.html", "ventures/index.html", "bazar/index.html", "marketing/index.html", "en/still-available/index.html"]) {
  const path = "/" + f.replace(/index\.html$/, "");
  const v = staticIssues(path, read(f));
  ok(v.length === 0, `${path}: sin avisos estáticos (dio: ${v.join("; ")})`);
}
// Redirecciones: no piden favicon/pie (su destino se revisa aparte).
for (const f of ["bots/index.html", "consultoria/index.html"]) {
  const path = "/" + f.replace(/index\.html$/, "");
  const v = staticIssues(path, read(f));
  ok(v.length === 0, `${path} (redirección): sin avisos (dio: ${v.join("; ")})`);
}

// Problemas reales que sí deben avisar.
const base = read("sigue-disponible/index.html");
const conGoogle = base.replace("</head>", '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist">' + "</head>");
ok(staticIssues("/sigue-disponible/", conGoogle).some((m) => /Google Fonts/.test(m)), "pedir fuentes a Google avisa");
const sinGeist = base.replaceAll("/assets/fonts/geist-latin-wght.woff2", "/x.woff2");
ok(staticIssues("/sigue-disponible/", sinGeist).some((m) => /Geist autoalojada/.test(m)), "sin Geist autoalojada avisa");
const sinIcono = base.replace(/<link rel="icon"[^>]*>/, "");
ok(staticIssues("/sigue-disponible/", sinIcono).includes("sin favicon"), "sin favicon avisa");
const sinPie = base.replace(/<footer/g, "<div");
ok(staticIssues("/sigue-disponible/", sinPie).includes("sin <footer>"), "sin pie avisa");
// D-10: una redirección a /en/ debe estar en inglés (/bots/ → /en/still-available/); en español avisa.
ok(staticIssues("/bots/", read("bots/index.html").replace('lang="en"', 'lang="es"')).some((m) => /<html lang> no es «en»/.test(m)), "redirección a /en/ con lang es avisa");
ok(staticIssues("/en/still-available/", base).some((m) => /<html lang>/.test(m)), "lang equivocado avisa");

console.log(fails ? `${fails} fallas` : "✓ brand-check reglas: tipografía y básicos alineados con el sitio publicado");
process.exit(fails ? 1 : 0);
