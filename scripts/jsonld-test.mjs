// T33 — El JSON-LD (lo que leen Google y los asistentes de IA) dice lo mismo que la página.
// Revisa en cada página con datos estructurados: JSON válido; cada precio de Offer aparece
// visible en la misma página; las portadas ES/EN declaran Organization (Neuri LLC, hola@) y WebSite
// con su idioma. Uso: node scripts/jsonld-test.mjs [--live]
import { readFileSync } from "node:fs";

const pages = [
  ["index.html", "/", "es", true],
  ["en/home/index.html", "/en/home/", "en", true],
  ["bazar/index.html", "/bazar/", "es"],
  ["en/index.html", "/en/", "en"],
  ["sigue-disponible/index.html", "/sigue-disponible/", "es"],
  ["en/still-available/index.html", "/en/still-available/", "en"],
  // /consultoria y /en/ai-consulting redirigen a consulting.neuri.tech desde 28-oct (t66).
  ["marketing/index.html", "/marketing/", "es"],
  ["en/marketing/index.html", "/en/marketing/", "en"],
];
const live = process.argv.includes("--live");
let fail = 0;
const bad = (m) => { fail++; console.error("✗", m); };

const nodes = (x, out = []) => {
  if (Array.isArray(x)) x.forEach((v) => nodes(v, out));
  else if (x && typeof x === "object") { if (x["@type"]) out.push(x); Object.values(x).forEach((v) => nodes(v, out)); }
  return out;
};
const fmt = (p) => Number(p).toLocaleString("en-US");

for (const [f, path, lang, portada] of pages) {
  const srcs = [["local", readFileSync(f, "utf8")]];
  if (live) srcs.push(["live", await (await fetch("https://neuri.tech" + path)).text()]);
  for (const [where, html] of srcs) {
    const before = fail;
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    if (!blocks.length) { bad(`${where} ${path}: sin JSON-LD`); continue; }
    const all = [];
    for (const b of blocks) {
      try { nodes(JSON.parse(b), all); } catch (e) { bad(`${where} ${path}: JSON-LD inválido (${e.message})`); }
    }
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|\s+/g, " ");
    let n = 0;
    for (const o of all.filter((x) => x["@type"] === "Offer" && x.price != null)) {
      n++;
      const p = fmt(o.price);
      if (!new RegExp(`\\$ ?${p.replace(",", "\\,")}(?![0-9])`).test(text)) bad(`${where} ${path}: JSON-LD dice ${o.price} ${o.priceCurrency} (${o.name}) y la página no muestra $${p}`);
    }
    if (portada) {
      const org = all.find((x) => x["@type"] === "Organization");
      const web = all.find((x) => x["@type"] === "WebSite");
      if (!org || org.legalName !== "Neuri LLC" || org.email !== "hola@neuri.tech") bad(`${where} ${path}: falta Organization Neuri LLC / hola@neuri.tech`);
      if (!web || web.inLanguage !== lang) bad(`${where} ${path}: WebSite sin inLanguage ${lang}`);
    }
    if (fail === before) console.log(`✓ ${where} ${path}: ${all.length} nodos, ${n} precios visibles`);
  }
}
console.log(fail ? `jsonld FALLA (${fail})` : "jsonld OK");
process.exit(fail ? 1 : 0);
