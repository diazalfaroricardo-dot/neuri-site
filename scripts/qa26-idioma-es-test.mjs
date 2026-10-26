// QA #26: en las páginas en inglés, el botón de idioma «ES» (lang="es") debe llevar a la versión
// en español (la del <link rel="alternate" hreflang="es">), nunca a una ruta /en/.
// Uso: node scripts/qa26-idioma-es-test.mjs   (estático, revisa todo en/**/index.html)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".html")) files.push(p);
  }
})("en");

let fail = 0;
for (const f of files) {
  const html = readFileSync(f, "utf8");
  const alt = html.match(/<link rel="alternate" hreflang="es" href="https:\/\/neuri\.tech([^"]*)"/);
  for (const m of html.matchAll(/<a\b[^>]*\blang="es"[^>]*>/g)) {
    const href = (m[0].match(/href="([^"]*)"/) || [])[1] || "";
    const isSwitch = /data-idioma|aria-label="ES/.test(m[0]);
    let bad = href.startsWith("/en/") || href.startsWith("https://neuri.tech/en/");
    if (isSwitch && alt && href.split("?")[0] !== alt[1]) bad = true;
    if (bad) {
      fail++;
      console.log(`FALLA ${f}: ${href}${alt ? ` (esperaba ${alt[1]})` : ""}`);
    }
  }
}
console.log(fail ? `${fail} fallas en ${files.length} páginas` : `todo OK (${files.length} páginas)`);
process.exit(fail ? 1 : 0);
