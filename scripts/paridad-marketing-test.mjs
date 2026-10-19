// T25 · paridad ES/EN de la landing de Marketing (B-P4/B-A6/B-A8).
// Estático, sin navegador: /en/marketing debe tener las mismas secciones, anclas del menú,
// formularios, destinos externos (app, legal, correo) y hreflang que /marketing.
// Uso: node scripts/paridad-marketing-test.mjs   (falla mientras /en/marketing sea el diseño viejo)
import { readFileSync } from "node:fs";
const es = readFileSync(new URL("../marketing/index.html", import.meta.url), "utf8");
const en = readFileSync(new URL("../en/marketing/index.html", import.meta.url), "utf8");
const set = (re, s) => new Set([...s.matchAll(re)].map((m) => m[1]));
const ids = (s) => set(/<(?:section|form|main|nav|header|footer)[^>]*\sid="([^"]+)"/g, s);
const anchors = (s) => set(/href="(#[^"]+)"/g, s);
const ext = (s) => set(/href="(https?:\/\/[^"#?]+|mailto:[^"?]+)/g, s);
const hreflang = (s) => set(/hreflang="([^"]+)"/g, s);
const fields = (s) => set(/<(?:input|select|textarea)[^>]*\sname="([^"]+)"/g, s);
const fallas = [];
const diff = (nombre, a, b, ignorar = () => false) => {
  const faltan = [...a].filter((x) => !b.has(x) && !ignorar(x));
  const sobran = [...b].filter((x) => !a.has(x) && !ignorar(x));
  if (faltan.length) fallas.push(`${nombre}: faltan en EN → ${faltan.join(", ")}`);
  if (sobran.length) fallas.push(`${nombre}: EN tiene de más → ${sobran.join(", ")}`);
};
diff("secciones", ids(es), ids(en));
diff("anclas", anchors(es), anchors(en));
diff("campos", fields(es), fields(en));
// los destinos externos pueden diferir solo por idioma: cada página de neuri.tech se compara con su par
const PAR = { "/en/home/": "/", "/en/still-available/": "/sigue-disponible/", "/en/ai-consulting/": "/consultoria/", "/en/": "/bazar/", "/en/marketing/": "/marketing/" };
const norm = (u) => {
  const m = u.match(/^https:\/\/neuri\.tech(\/.*)$/);
  if (m && PAR[m[1]]) return "https://neuri.tech" + PAR[m[1]];
  return u.replace("neuri.tech/en/legal/", "neuri.tech/legal/");
};
diff("destinos externos", new Set([...ext(es)].map(norm)), new Set([...ext(en)].map(norm)));
diff("hreflang", hreflang(es), hreflang(en));
if (!/<html[^>]*lang="en/.test(en)) fallas.push('EN: <html lang="en"> falta');
if (fallas.length) { console.error(`paridad-marketing: ${fallas.length} diferencias\n- ` + fallas.join("\n- ")); process.exit(1); }
console.log("paridad-marketing: OK");
