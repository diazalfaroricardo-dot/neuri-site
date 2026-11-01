// N30 (vistas aprobadas 30-oct): candado de los tres cambios, ES y EN, sin navegador.
// 1) Pie de neuri.bots (landing + citas/comida/creadores y sus EN): tres bloques (marca + contacto, Productos, Legal),
//    sin «·» de texto entre links, hola@neuri.tech con ícono, Legal con Privacidad/Términos/Borrar mis datos a páginas
//    que existen, motion apagado con prefers-reduced-motion y reserva de 86 px en móvil; el CSS pegado en la landing
//    es copia de assets/bots-v3.css.
// 2) assets/vendedor.js: «escribiendo» = red neuronal SVG (sin .dots), <1 KB, color --a, el lector oye T.typing, quieta con reducir movimiento.
// 3) Cierre de neuri.bazar (bazar/ y en/): sección #cierre justo antes de cada <footer> (estático y plantilla dc-b),
//    12 puestos, título pedido, CTA al mismo #prueba, GSAP de /assets/gsap/ disparado una vez, sin montos, sin Repetir.
// Uso: node scripts/n30-vistas-test.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), "utf8");
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };
const existe = (href) => {
  const p = href.replace(/^https:\/\/neuri\.tech/, "").split(/[?#]/)[0];
  return existsSync(join(root, p, p.endsWith("/") ? "index.html" : ""));
};

// 1 · pie de neuri.bots
const css = read("assets/bots-v3.css");
for (const r of ["footer.bft", ".bft-cols", ".bft-reserva{height:calc(86px", "@keyframes bft-draw", "@keyframes bft-drift", "footer.bft ul a:hover"])
  if (!css.includes(r)) bad(`bots-v3.css sin ${r}`);
if (!/@media \(prefers-reduced-motion:reduce\)\{\.bft-glow,\.bft-rule\{animation:none\}/.test(css)) bad("bots-v3.css: el pie no se apaga con reducir movimiento");
const bloque = css.slice(css.indexOf("/* N30"));
const PIES = {
  "sigue-disponible/index.html": "es", "sigue-disponible/citas/index.html": "es", "sigue-disponible/comida/index.html": "es", "sigue-disponible/creadores/index.html": "es",
  "en/still-available/index.html": "en", "en/still-available/food/index.html": "en", "en/still-available/creators/index.html": "en", "en/still-available/appointments/index.html": "en",
};
const LEGAL = { es: ["Privacidad", "Términos", "Borrar mis datos"], en: ["Privacy", "Terms", "Delete my data"] };
const PROD = { es: ["Productos", ["/", "/bazar/", "/consultoria/", "/marketing/"]], en: ["Products", ["/", "/en/bazar/", "/en/ai-consulting/", "/en/marketing/"]] };
for (const [p, lang] of Object.entries(PIES)) {
  const h = read(p);
  const pies = h.split("<footer").slice(1).map((f) => f.split("</footer>")[0]);
  if (pies.length !== 1) { bad(`${p}: ${pies.length} pies`); continue; }
  const pie = pies[0];
  if (!/^ class="bft"/.test(pie)) { bad(`${p}: el pie no es el nuevo (class="bft")`); continue; }
  if (/<\/a>\s*·\s*<a/.test(pie)) bad(`${p}: quedan separadores «·» de texto entre links`);
  if (!/neuri<i>\.<\/i>bots/.test(pie)) bad(`${p}: sin marca «neuri.bots»`);
  if (!/<a class="bft-mail" href="mailto:hola@neuri\.tech"><svg aria-hidden="true"[^]*?<\/svg>hola@neuri\.tech<\/a>/.test(pie)) bad(`${p}: contacto sin hola@neuri.tech con ícono`);
  if (!pie.includes("Neuri LLC · Phoenix, Arizona")) bad(`${p}: sin «Neuri LLC · Phoenix, Arizona»`);
  if (/\d{3,} W |AZ \d{5}/.test(pie)) bad(`${p}: el pie de bots trae domicilio (no estaba aprobado)`);
  const [tProd, hrefs] = PROD[lang];
  if (!pie.includes(`>${tProd}</h2>`) || !pie.includes(">Legal</h2>")) bad(`${p}: faltan los bloques ${tProd}/Legal`);
  for (const href of hrefs) if (!pie.includes(`href="${href}"`)) bad(`${p}: Productos sin ${href}`);
  for (const t of LEGAL[lang]) {
    const m = pie.match(new RegExp(`<a href="([^"]+)">${t}</a>`));
    if (!m) bad(`${p}: Legal sin «${t}»`);
    else if (!existe(m[1])) bad(`${p}: «${t}» apunta a ${m[1]}, que no existe`);
  }
  if (!pie.includes('<div class="bft-reserva" aria-hidden="true"></div>')) bad(`${p}: sin la reserva para la barra fija`);
  if (/<style id="bots-v3">/.test(h)) {
    const inl = h.slice(h.indexOf('<style id="bots-v3">'), h.indexOf("</style>", h.indexOf('<style id="bots-v3">')));
    if (!inl.includes(bloque.trim())) bad(`${p}: el CSS pegado del pie no es copia de assets/bots-v3.css`);
  } else if (!h.includes('/assets/bots-v3.css?v=2"')) bad(`${p}: no pide bots-v3.css?v=2 (caché del CSS nuevo)`);
}

// 2 · «escribiendo» en vendedor.js
const v = read("assets/vendedor.js");
if (/class="dots"|\.dots i/.test(v)) bad("vendedor.js: quedan los tres puntos (.dots)");
const nnSrc = v.match(/const NN =([^]*?<\/svg>');\n/);
if (!nnSrc) bad("vendedor.js sin la red NN");
else {
  const NN = Function(`return (${nnSrc[1]})`)();
  if (!/^<svg class="nn"[^>]*aria-hidden="true"/.test(NN)) bad("vendedor.js: la red no es un <svg class=\"nn\" aria-hidden>");
  if (NN.length >= 1024) bad(`vendedor.js: la red pesa ${NN.length} B (≥1 KB)`);
  if ((NN.match(/class="n( e)?( k\d)?"/g) || []).length !== 7) bad("vendedor.js: la red no tiene 7 neuronas (1-3-2-1)");
}
// N31: el símbolo del agente es la misma red; no vuelven los puntos en órbita.
if (!v.includes('panel = $("section.p")')) bad("vendedor.js: el panel se busca con .p y choca con las señales de la red");
if (!v.includes("const SYM = NN.replace(")) bad("vendedor.js: el símbolo ya no sale de la red NN");
if ((v.match(/\$\{SYM\}/g) || []).length !== 2) bad("vendedor.js: el símbolo no está en el globo y el encabezado");
if (/class="o o1"|\.o1\{|@keyframes spin/.test(v)) bad("vendedor.js: quedan los puntos en órbita");
if (!v.includes("typing.innerHTML = `${NN}<span class=\"sr\">${T.typing}</span>`")) bad("vendedor.js: el lector ya no oye T.typing");
if (!/typing: "Escribiendo…"/.test(v) || !/typing: "Typing…"/.test(v)) bad("vendedor.js: sin «Escribiendo…»/«Typing…»");
if (!/\.nn \.n\{fill:var\(--a\)/.test(v)) bad("vendedor.js: la red no usa el color de acento --a");
if (!v.includes("@media (prefers-reduced-motion:reduce){.nn .n,.nn .p{animation:none}}")) bad("vendedor.js: la red no queda quieta con reducir movimiento");

// 3 · cierre de neuri.bazar
const dc = read("assets/dc-lite.js");
if (!dc.includes("from.hasAttribute('data-dc-keep')) return false")) bad("dc-lite.js no respeta data-dc-keep (morphdom borraría los estilos de GSAP)");
const CIERRE = {
  "bazar/index.html": ["Mira tu bazar armarse en <span class=\"cz-n\">10</span> segundos", "Prueba gratis 14 días"],
  "en/bazar/index.html": ["Watch your bazaar set itself up in <span class=\"cz-n\">10</span> seconds", "Start free 14-day trial"],
};
for (const [p, [titulo, cta]] of Object.entries(CIERRE)) {
  const h = read(p);
  if (!h.includes('<script src="/assets/gsap/gsap.min.js" defer></script>')) bad(`${p}: ya no carga GSAP de /assets/gsap/`);
  const secs = h.split('<section id="cierre"').slice(1).map((s) => s.split("</section>")[0]);
  if (secs.length !== 2) bad(`${p}: #cierre aparece ${secs.length} veces (esperado: estático y plantilla dc-b)`);
  const pegados = h.match(/<section id="cierre"(?:(?!<section)[^])*?<\/section>\n\n<footer style="background: #05080D; color: #CFC4B4">/g) || [];
  if (pegados.length !== 2) bad(`${p}: #cierre no va justo antes de cada <footer> (${pegados.length}/2)`);
  if (!h.includes('<template data-dc-part="dc-b">') || !h.split('<template data-dc-part="dc-b">')[1].includes('<section id="cierre"')) bad(`${p}: la plantilla dc-b no trae #cierre (dc-lite lo borraría)`);
  for (const s of secs) {
    if (!s.includes("data-dc-keep")) bad(`${p}: #cierre sin data-dc-keep`);
    if (!s.includes(titulo)) bad(`${p}: título distinto al aprobado`);
    if ((s.match(/<g class="cz-st">/g) || []).length !== 12) bad(`${p}: no son 12 puestos`);
    if (!new RegExp(`<a class="cz-cta" href="#prueba">${cta} <span aria-hidden="true">→</span></a>`).test(s)) bad(`${p}: el botón no es «${cta}» a #prueba`);
    if (/[$€]\s?\d|\d\s?(MXN|USD)/.test(s)) bad(`${p}: #cierre trae montos`);
    if (/Repetir|Replay|type="range"/.test(s)) bad(`${p}: #cierre trae controles de la vista previa`);
    if (!/role="img" aria-label="[^"]{20,}"/.test(s)) bad(`${p}: la animación no tiene texto para lector`);
  }
  const js = h.slice(h.lastIndexOf("/* N30: el bazar se arma"));
  if (!/IntersectionObserver[^]*io\.disconnect\(\); tl\.play\(0\)/.test(js)) bad(`${p}: la animación no se dispara una sola vez con IntersectionObserver`);
  if (!js.includes("matchMedia('(prefers-reduced-motion: reduce)').matches) return")) bad(`${p}: con reducir movimiento no se queda el cuadro final`);
  if (!/<style id="n30-cierre">[^]*?<\/style>\n<\/head>/.test(h)) bad(`${p}: falta el CSS del cierre en <head>`);
  if (!h.includes('href="#prueba"') || !h.includes('id="prueba"')) bad(`${p}: el destino de prueba #prueba ya no existe`);
}

if (fail) { console.error(`n30-vistas: ${fail} falla(s)`); process.exit(1); }
console.log(`✓ n30-vistas: pie de bots en ${Object.keys(PIES).length} páginas, red «escribiendo» en vendedor.js y cierre animado de bazar ES/EN`);
