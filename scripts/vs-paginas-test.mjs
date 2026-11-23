// Ideas 3 y 4 de Ricardo (14-nov-2026): páginas «vs» por competidor y la promesa «Tu precio no sube».
// Cuida: cada página vs existe ES/EN, con canonical propio y hreflang recíproco, cita sus fuentes con fecha,
// no trae logos de terceros, está en el sitemap y en llms.txt y se enlaza desde la sección de precios;
// la promesa sale en precios (bazar, bots y sus verticales, marketing) y en los términos ES/EN con su alcance.
// Uso: node scripts/vs-paginas-test.mjs
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), "utf8");
let fail = 0;
const bad = (m) => { console.error("✗ " + m); fail++; };

const pares = [
  ["bazar/vs-quail/", "en/bazar/vs-quail/", "quailhq.com"],
  ["bazar/vs-ricochet/", "en/bazar/vs-ricochet/", "ricoconsign.com"],
  ["sigue-disponible/vs-manychat/", "en/still-available/vs-manychat/", "manychat.com"],
  ["marketing/vs-predis/", "en/marketing/vs-predis/", "predis.ai"],
];
const sitemap = read("sitemap.xml"), llms = read("llms.txt");
for (const [es, en, dom] of pares) {
  for (const [p, otro, lang] of [[es, en, "es"], [en, es, "en"]]) {
    const s = read(p + "index.html");
    if (!s.includes(`<html lang="${lang}"`)) bad(`${p} sin lang=${lang}`);
    if (!s.includes(`<link rel="canonical" href="https://neuri.tech/${p}">`)) bad(`${p} sin canonical propio`);
    if (!s.includes(`hreflang="${lang === "es" ? "en" : "es"}" href="https://neuri.tech/${otro}"`)) bad(`${p} sin hreflang a ${otro}`);
    // D-10: en neuri.bots x-default apunta al inglés.
    const xd = es.startsWith("sigue-disponible/") ? en : es;
    if (!s.includes(`hreflang="x-default" href="https://neuri.tech/${xd}"`)) bad(`${p} sin x-default`);
    if (!new RegExp(`href="https://(www\\.)?${dom.replace(".", "\\.")}`).test(s)) bad(`${p} no enlaza su fuente ${dom}`);
    if (!/(noviembre|November) \d+, 2026|\d+ de noviembre de 2026/.test(s)) bad(`${p} sin fecha de revisión de la fuente`);
    if (/<img[^>]+(quail|ricochet|ricoconsign|manychat|predis)/i.test(s)) bad(`${p} trae un logo de tercero`);
    if (!sitemap.includes(`<loc>https://neuri.tech/${p}</loc>`)) bad(`${p} no está en sitemap.xml`);
    if (!llms.includes(`https://neuri.tech/${p}`)) bad(`${p} no está en llms.txt`);
  }
}

// Links desde la sección de precios de cada landing.
const links = [
  ["bazar/index.html", "/bazar/vs-ricochet/"], ["en/bazar/index.html", "/en/bazar/vs-ricochet/"],
  ["bazar/index.html", "/bazar/vs-quail/"], ["en/bazar/index.html", "/en/bazar/vs-quail/"],
  ["sigue-disponible/index.html", "/sigue-disponible/vs-manychat/"], ["en/still-available/index.html", "/en/still-available/vs-manychat/"],
  ["marketing/index.html", "/marketing/vs-predis/"], ["en/marketing/index.html", "/en/marketing/vs-predis/"],
];
for (const [p, href] of links) {
  // bots: el nombre ManyChat solo va dentro de la comparación (#cmp-t, regla de visual.mjs); ahí va el link.
  const s = read(p), i = s.indexOf(href.includes("manychat") ? 'aria-labelledby="cmp-t"' : 'id="precios"');
  if (i < 0 || s.indexOf(`href="${href}"`, i) < 0) bad(`${p}: la sección de precios (o comparación) no enlaza ${href}`);
}

// Promesa en precios: dice el alcance (suscripción activa) y lo que no cubre (cambiar de plan).
const precios = {
  es: ["bazar/index.html", "sigue-disponible/index.html", "sigue-disponible/citas/index.html", "sigue-disponible/comida/index.html",
       "sigue-disponible/creadores/index.html", "marketing/index.html"],
  en: ["en/bazar/index.html", "en/still-available/index.html", "en/still-available/appointments/index.html",
       "en/still-available/food/index.html", "en/still-available/creators/index.html", "en/marketing/index.html"],
};
const frase = { es: [/Tu precio no sube/, /suscripción siga activa/, /cambias de plan/], en: [/Your price won’t go up/, /subscription stays active/, /switching plans/] };
for (const lang of ["es", "en"]) for (const p of precios[lang]) {
  const s = read(p), i = s.indexOf('id="precios"');
  const sec = s.slice(i, s.indexOf("</section>", i));
  for (const re of frase[lang]) if (!re.test(sec)) bad(`${p}: la sección de precios no dice ${re}`);
}
if (!/precio de fundador dura/.test(read("marketing/index.html"))) bad("marketing: la promesa no aclara el precio de fundador");

// Términos: la promesa en la sección de planes y la excepción en «Cambios».
const terminos = [
  ["bazar/terminos/index.html", "es"], ["sigue-disponible/terminos/index.html", "es"],
  ["en/bazar/terms/index.html", "en"], ["en/still-available/terms/index.html", "en"],
];
for (const [p, lang] of terminos) {
  const s = read(p);
  for (const re of frase[lang]) if (!re.test(s)) bad(`${p} no dice ${re}`);
  if (!(lang === "es" ? /no aplican a suscripciones activas/ : /don’t apply to active subscriptions/).test(s)) bad(`${p}: «Cambios» no exceptúa a las suscripciones activas`);
}

if (fail) process.exit(1);
console.log(`✓ vs-paginas: ${pares.length * 2} páginas vs, links desde precios, promesa en ${precios.es.length * 2} landings y ${terminos.length} términos`);
