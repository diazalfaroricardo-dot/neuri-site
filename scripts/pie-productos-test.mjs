// B-A5 (bots): el pie de la landing de neuri.bots ES/EN liga a los otros productos de Neuri
// en su idioma y cada destino existe en el sitio. Uso: node scripts/pie-productos-test.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const casos = [
  { page: "sigue-disponible/index.html", want: ["/", "/bazar/", "/consultoria/", "/marketing/"] },
  { page: "en/still-available/index.html", want: ["/", "/en/bazar/", "/en/ai-consulting/", "/en/marketing/"] },
];
let fail = 0;
for (const { page, want } of casos) {
  const html = readFileSync(join(root, page), "utf8");
  const pies = html.split("<footer").slice(1).map((f) => f.split("</footer>")[0]);
  if (!pies.length) { console.error(`✗ ${page}: sin <footer>`); fail++; continue; }
  for (const pie of pies) {
    for (const href of want) {
      if (!pie.includes(`href="${href}"`)) { console.error(`✗ ${page}: pie sin ${href}`); fail++; }
      const file = join(root, href, "index.html");
      if (!existsSync(file)) { console.error(`✗ ${page}: ${href} no existe en el sitio`); fail++; }
    }
  }
  if (!fail) console.log(`✓ ${page}: ${pies.length} pie(s) con ${want.length} productos`);
}
process.exit(fail ? 1 : 0);
