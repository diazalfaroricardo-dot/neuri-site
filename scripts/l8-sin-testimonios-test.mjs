// L8 (docs/LEGAL.md del repo neuri-bazar): neuri.tech no publica testimonios, reseñas, calificaciones
// ni cifras de clientes («+50 negocios confían…») hasta que sean reales y con permiso por escrito.
// Revisa el HTML y JS del sitio (estático, sin navegador) y, con --live, las páginas públicas de
// consulting.neuri.tech. Si un día hay testimonios reales, agrégalos a PERMITIDOS con la fecha del permiso.
// Uso: node scripts/l8-sin-testimonios-test.mjs [--live]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const PERMITIDOS = []; // p. ej. { file: "bazar/index.html", texto: "Café Bazaar Cardón", permiso: "2026-11-02 correo" }
const PATRONES = [
  /testimoni/i,
  /reseñas? de (nuestros )?clientes/i,
  /lo que dicen (nuestros )?clientes/i,
  /what (our )?(clients|customers) say/i,
  /(clientes|customers) (felices|satisfechos|happy|love)/i,
  /(confían en|trusted by|used by) (\+?\d|más de|over|cientos|hundreds|miles|thousands)/i,
  /\+\s?\d[\d,]*\s?(negocios|clientes|vendedores|bazares|empresas|businesses|customers|sellers|companies)/i,
  /\d[\d,]*\+\s?(negocios|clientes|vendedores|bazares|empresas|businesses|customers|sellers|companies)/i,
  /aggregateRating|"@type"\s*:\s*"Review"|ratingValue/,
  /★{3,}|⭐{3,}/,
];

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n === "node_modules" || n.startsWith(".") || n === "scripts") continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(html|js|json|txt)$/.test(n)) out.push(p);
  }
  return out;
}

const hallazgos = [];
function revisar(nombre, texto) {
  const plano = texto.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  for (const re of PATRONES) {
    for (const fuente of [texto, plano]) {
      const m = fuente.match(re);
      if (!m) continue;
      const trozo = fuente.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60);
      if (PERMITIDOS.some((x) => nombre.endsWith(x.file) && trozo.includes(x.texto))) continue;
      hallazgos.push(`${nombre}: «${trozo.trim()}»`);
      break;
    }
  }
}

const root = new URL("..", import.meta.url).pathname;
const files = walk(root);
for (const f of files) revisar(f.slice(root.length), readFileSync(f, "utf8"));

if (process.argv.includes("--live")) {
  for (const path of ["/", "/precios", "/ejemplo", "/score", "/?lang=en", "/precios?lang=en"]) {
    const r = await fetch(`https://consulting.neuri.tech${path}`);
    revisar(`consulting.neuri.tech${path}`, await r.text());
  }
}

if (hallazgos.length) {
  console.error(`L8 FALLA — ${hallazgos.length} posible(s) testimonio(s)/cifra(s) sin permiso:`);
  for (const h of hallazgos) console.error(" - " + h);
  process.exit(1);
}
console.log(`L8 OK — ${files.length} archivos${process.argv.includes("--live") ? " + 6 páginas de consulting" : ""} sin testimonios, reseñas ni cifras de clientes`);
