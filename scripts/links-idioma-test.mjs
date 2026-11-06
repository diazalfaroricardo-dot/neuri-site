/**
 * Issue #68: un link de neuri.tech a una app lleva el idioma de la página. Sin ?lang=, la app elige por
 * el navegador y el lector de la versión en español cae en inglés (y al revés). Mira todo <a> de cada
 * página publicada. El de bots en inglés puede ir por ruta (/en/...). Uso: node scripts/links-idioma-test.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const FUERA = new Set(["docs", "assets", "tools", "scripts", "img", "node_modules", ".git"]);
const paginas = [];
(function camina(dir) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) { if (!FUERA.has(n)) camina(f); }
    else if (n.endsWith(".html")) paginas.push(f);
  }
})(ROOT);

const malos = [];
let vistos = 0;
for (const f of paginas) {
  const s = readFileSync(f, "utf8");
  const idioma = /<html[^>]*\blang="([a-z]{2})/i.exec(s)?.[1];
  if (!idioma) continue;
  for (const [, href] of s.matchAll(/<a\b[^>]*\bhref="(https:\/\/[a-z-]+\.neuri\.tech[^"]*)"/gi)) {
    const u = new URL(href.replaceAll("&amp;", "&"));
    vistos += 1;
    if (u.searchParams.get("lang") === idioma || u.pathname.startsWith(`/${idioma}/`)) continue;
    malos.push(`${relative(ROOT, f)} (${idioma}): ${href}`);
  }
}
if (vistos < 50) { console.error(`solo vi ${vistos} links: el escaneo está roto`); process.exit(1); }
if (malos.length) { console.error(`Links a una app sin el idioma de la página:\n${malos.join("\n")}`); process.exit(1); }
console.log(`links-idioma OK: ${vistos} links en ${paginas.length} páginas`);
