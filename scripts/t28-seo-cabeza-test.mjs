// t28 (27-oct): toda página indexable trae título de 20–65 caracteres, descripción,
// canonical, og:image, twitter:card y JSON-LD válido. Las <h1> dentro de <template> no cuentan.
// Uso: node scripts/t28-seo-cabeza-test.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const pages = [];
const walk = (d) => {
  for (const n of readdirSync(d)) {
    if (n.startsWith(".") || n === "node_modules" || n === "scripts" || n === "docs") continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n === "index.html") pages.push(p);
  }
};
walk(root);

const fails = [];
let n = 0;
for (const p of pages) {
  const s = readFileSync(p, "utf8");
  if (/noindex/.test(s)) continue;
  n++;
  const rel = p.slice(root.length);
  const t = s.match(/<title>([\s\S]*?)<\/title>/)?.[1].trim() ?? "";
  if (t.length < 20 || t.length > 65) fails.push(`${rel}: título de ${t.length} caracteres`);
  if (!/name="description" content="[^"]{70,170}"/.test(s)) fails.push(`${rel}: descripción`);
  if (!/rel="canonical"/.test(s)) fails.push(`${rel}: canonical`);
  if (!/og:image/.test(s)) fails.push(`${rel}: og:image`);
  if (!/name="twitter:card"/.test(s)) fails.push(`${rel}: twitter:card`);
  const lds = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!lds.length) fails.push(`${rel}: sin JSON-LD`);
  for (const m of lds) {
    try {
      JSON.parse(m[1]);
    } catch {
      fails.push(`${rel}: JSON-LD inválido`);
    }
  }
  const sinTemplates = s.replace(/<template[\s\S]*?<\/template>/g, "");
  const h1 = (sinTemplates.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) fails.push(`${rel}: ${h1} <h1>`);
}
if (fails.length) {
  console.error(`t28 ✗ ${fails.length}\n${fails.join("\n")}`);
  process.exit(1);
}
console.log(`t28 ✓ ${n} páginas indexables con título, descripción, canonical, og, twitter y JSON-LD`);
