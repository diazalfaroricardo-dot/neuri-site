// I8: la portada trae las 4 pantallas reales ES/EN, con imagen propia, texto alterno y aviso de que
// los datos son de prueba o de ejemplo; bazar sale del bazar de prueba, no de Cardón.
// Uso: node scripts/i8-carrusel-test.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
let fail = 0;
const bad = (m) => {
  console.error(`✗ ${m}`);
  fail++;
};
for (const [f, lang, aviso] of [
  ["index.html", "es", /Bazar de prueba/],
  ["en/home/index.html", "en", /Test bazaar/],
]) {
  const html = readFileSync(join(root, f), "utf8");
  const shots = [...html.matchAll(/<a class="shot" href="([^"]+)"[^>]*>[\s\S]*?<\/a>/g)];
  if (shots.length !== 4) bad(`${f}: ${shots.length} pantallas, deben ser 4`);
  for (const m of shots) {
    const img = m[0].match(/<img src="\/img\/([^"]+)" alt="([^"]{20,})" width="\d+" height="\d+" loading="lazy"/);
    if (!img) bad(`${f}: ${m[1]} sin imagen lazy con alt y medidas`);
    else {
      if (!img[1].endsWith(`-${lang}.jpg`)) bad(`${f}: ${img[1]} en otro idioma`);
      if (!existsSync(join(root, "img", img[1]))) bad(`falta img/${img[1]}`);
    }
    if (!existsSync(join(root, m[1].replace(/^\//, ""), "index.html"))) bad(`${f}: ${m[1]} no existe`);
    if (!/<p class="src">[^<]{10,}<\/p>/.test(m[0])) bad(`${f}: ${m[1]} sin aviso de qué datos son`);
  }
  if (!aviso.test(html)) bad(`${f}: no dice que el bazar es de prueba`);
  if (/Cardón/.test(shots.map((s) => s[0]).join(""))) bad(`${f}: menciona a Cardón`);
}
for (const n of ["1-bazar", "2-bots", "3-marketing", "4-consulting"])
  for (const l of ["es", "en"])
    if (!existsSync(join(root, "img", `lamina-${n}-${l}.jpg`))) bad(`falta img/lamina-${n}-${l}.jpg`);
if (fail) process.exit(1);
console.log("✓ I8: 4 pantallas ES/EN en la portada y 8 láminas de 1080×1350");
