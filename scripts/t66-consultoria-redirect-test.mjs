// t66 (28-oct, pedido de Ricardo): neuri.tech/consultoria y /en/ai-consulting ya no son una copia vieja;
// mandan a consulting.neuri.tech (diseño v2 aprobado 25-oct) en su idioma, conservando ?ref y demás parámetros,
// con noindex y canonical a consulting.neuri.tech, y fuera del sitemap. Uso: node scripts/t66-consultoria-redirect-test.mjs [--live]
import { readFileSync } from "node:fs";
const live = process.argv.includes("--live");
let fails = 0; const ok = (c, m) => { if (c) console.log(`✓ ${m}`); else { fails++; console.error(`✗ ${m}`); } };
for (const [f, u, lang, canon] of [
  ["consultoria/index.html", "https://neuri.tech/consultoria/", "es", "https://consulting.neuri.tech/"],
  ["en/ai-consulting/index.html", "https://neuri.tech/en/ai-consulting/", "en", "https://consulting.neuri.tech/?lang=en"],
]) {
  const h = live ? await (await fetch(u + "?t=" + Date.now())).text() : readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
  ok(h.includes(`http-equiv="refresh" content="0; url=https://consulting.neuri.tech/?lang=${lang}"`), `${f}: refresh a consulting.neuri.tech ?lang=${lang}`);
  ok(h.includes(`q.set("lang","${lang}")`) && h.includes("location.search") && h.includes("location.hash"), `${f}: conserva parámetros (?ref) y ancla`);
  ok(/name="robots" content="noindex/.test(h) && h.includes(`rel="canonical" href="${canon}"`), `${f}: noindex + canonical`);
}
const sm = readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
ok(!/<loc>https:\/\/neuri\.tech\/(consultoria|en\/ai-consulting)\//.test(sm), "sitemap sin las páginas viejas");
process.exit(fails ? 1 : 0);
