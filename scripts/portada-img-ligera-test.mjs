// Velocidad (10-nov): las 4 pantallas de la portada ES/EN se sirven en AVIF/WebP con el JPG de respaldo.
// Si i8-laminas.mjs vuelve a generar los JPG, regenera también los .avif/.webp.
// Uso: node scripts/portada-img-ligera-test.mjs
import { readFileSync, statSync, existsSync } from "node:fs";
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
for (const [page, lang] of [["index.html", "es"], ["en/home/index.html", "en"]]) {
  const html = readFileSync(page, "utf8");
  for (const app of ["bazar", "bots", "marketing", "consulting"]) {
    const base = `pantalla-${app}-${lang}`;
    const re = new RegExp(`<picture><source srcset="/img/${base}\\.avif" type="image/avif"><source srcset="/img/${base}\\.webp" type="image/webp"><img src="/img/${base}\\.jpg"`);
    ok(re.test(html), `${page}: ${base} en <picture> AVIF → WebP → JPG`);
    const jpg = statSync(`img/${base}.jpg`);
    for (const ext of ["avif", "webp"]) {
      const f = `img/${base}.${ext}`;
      ok(existsSync(f) && statSync(f).size < jpg.size, `${f} existe y pesa menos que el JPG`);
    }
  }
}
console.log(fails ? `${fails} fallas` : "todo bien");
process.exit(fails ? 1 : 0);
