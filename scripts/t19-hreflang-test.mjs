/**
 * T19 — candado de idiomas de neuri.tech (hreflang, canonical, <html lang>, selector, sitemap).
 * Para cada página pública que no es redirección (meta refresh) ni la 404:
 *   - <html lang> = "en" si vive bajo /en/, si no "es";
 *   - canonical = su propia URL absoluta;
 *   - <link rel="alternate" hreflang> en orden es, en, x-default, URLs absolutas https://neuri.tech/…,
 *     la de su idioma = ella misma, la del otro idioma apunta a un archivo que existe (no redirección)
 *     y que la declara de vuelta (recíproco); x-default = la versión en español, igual en ambas;
 *     sin par: solo su idioma (+ x-default a sí misma si lo trae);
 *   - selector de idioma (links con data-idioma, o «English»/«Español» con lang=) lleva al par
 *     (se permite ?lang=… / #…), no al inicio del otro idioma;
 *   - sitemap.xml: cada página indexable con <loc> y los mismos xhtml:link alternates que su <head>.
 * Con --live pide cada URL de hreflang a https://neuri.tech y exige 200.
 * Uso: node scripts/t19-hreflang-test.mjs [--live]
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const BASE = "https://neuri.tech";
const LIVE = process.argv.includes("--live");
const SKIP = new Set(["node_modules", ".git", "scripts", "docs", "tools", "tmp", "assets", "img"]);
const files = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n) || n.startsWith(".") || n.startsWith("preview-")) continue;
    const f = join(d, n);
    if (statSync(f).isDirectory()) walk(f);
    else if (n === "index.html") files.push(relative(ROOT, f));
  }
})(ROOT);
files.sort();

const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const headOf = (h) => (h.match(/<head>([\s\S]*?)<\/head>/) || [, ""])[1];
const isRedirect = (h) => /http-equiv=["']refresh/i.test(h);
const urlOf = (rel) => BASE + "/" + rel.slice(0, -"index.html".length);
const fileOf = (url) => {
  if (!url.startsWith(BASE + "/")) return null;
  const p = url.slice(BASE.length + 1);
  return p.endsWith("/") || p === "" ? p + "index.html" : p;
};
const alts = (hd) => [...hd.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => [m[1], m[2]]);

const fails = [];
const bad = (rel, m) => fails.push(`/${rel.replace(/index\.html$/, "")}: ${m}`);
const info = new Map();
for (const rel of files) {
  const h = read(rel);
  if (isRedirect(h)) continue;
  const hd = headOf(h);
  info.set(rel, { h, hd, alts: alts(hd), noindex: /name="robots"\s+content="[^"]*noindex/.test(hd) });
}

const pairs = [], solos = [];
for (const [rel, p] of info) {
  const own = urlOf(rel);
  const lang = rel.startsWith("en/") ? "en" : "es";
  const other = lang === "es" ? "en" : "es";
  const htmlLang = (p.h.match(/<html[^>]*\blang="([^"]+)"/) || [])[1];
  if (htmlLang !== lang) bad(rel, `<html lang="${htmlLang}"> (esperado ${lang})`);
  const can = (p.hd.match(/<link rel="canonical" href="([^"]+)">/) || [])[1];
  if (can !== own) bad(rel, `canonical ${can ?? "falta"} (esperado ${own})`);
  const m = Object.fromEntries(p.alts);
  if (p.alts.length !== Object.keys(m).length) bad(rel, "hreflang repetido");
  for (const [l, u] of p.alts) if (!u.startsWith(BASE + "/")) bad(rel, `hreflang ${l} no es URL absoluta de neuri.tech: ${u}`);
  if (m[lang] !== own) bad(rel, `hreflang ${lang} = ${m[lang] ?? "falta"} (esperado ${own})`);
  const pair = m[other];
  if (!pair) {
    solos.push(rel);
    if (m["x-default"] && m["x-default"] !== own) bad(rel, `sin par pero x-default → ${m["x-default"]}`);
    continue;
  }
  const order = p.alts.map(([l]) => l).join(",");
  if (order !== "es,en,x-default") bad(rel, `hreflang en orden ${order} (esperado es,en,x-default)`);
  const es = lang === "es" ? own : pair;
  if (m["x-default"] !== es) bad(rel, `x-default = ${m["x-default"] ?? "falta"} (esperado ${es})`);
  const pf = fileOf(pair);
  if (!pf || !existsSync(join(ROOT, pf))) { bad(rel, `hreflang ${other} → ${pair}: no existe en el repo`); continue; }
  const q = info.get(pf);
  if (!q) { bad(rel, `hreflang ${other} → ${pair}: es una redirección, no la página`); continue; }
  const back = Object.fromEntries(q.alts)[lang];
  if (back !== own) bad(rel, `no recíproco: ${pair} declara hreflang ${lang} = ${back ?? "nada"}`);
  if (lang === "es") pairs.push([own, pair]);
  // Selector de idioma: data-idioma o «English»/«Español» con lang= → el par.
  const path = pair.slice(BASE.length);
  const sel = [...p.h.matchAll(/<a\b([^>]*)>([^<]*)/g)].filter(([, a, t]) =>
    /\bhreflang="(en|es)"/.test(a) && (/\bdata-idioma\b/.test(a) || (/\blang="(en|es)"/.test(a) && /^\s*(English|Español|EN|ES)\s*$/.test(t))));
  // Sin selector marcado (la portada usa un menú «EN ▾»): algún a[hreflang=otro] debe llevar al par.
  const anyToPair = [...p.h.matchAll(/<a\b([^>]*)>/g)].some(([, a]) => a.includes(`hreflang="${other}"`) &&
    ((a.match(/\bhref="([^"]+)"/) || [])[1] || "").replace(/[?#].*$/, "") === path);
  if (!sel.length && !anyToPair) bad(rel, `sin selector de idioma que lleve a ${path}`);
  for (const [, a, t] of sel) {
    const href = (a.match(/\bhref="([^"]+)"/) || [])[1] || "";
    if (href.replace(/[?#].*$/, "") !== path) bad(rel, `selector «${t.trim()}» → ${href} (esperado ${path})`);
  }
}

// sitemap.xml: indexables presentes y con los mismos alternates.
const sm = read("sitemap.xml");
const blocks = new Map([...sm.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((b) => [(b[1].match(/<loc>([^<]+)<\/loc>/) || [])[1], b[1]]));
for (const [rel, p] of info) {
  if (p.noindex) continue;
  const b = blocks.get(urlOf(rel));
  if (!b) { bad(rel, "no está en sitemap.xml (python3 scripts/seo.py)"); continue; }
  const xs = [...b.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)].map((m) => m[1] + "=" + m[2]).join(" ");
  const hs = p.alts.map(([l, u]) => l + "=" + u).join(" ");
  if (xs !== hs) bad(rel, `sitemap alternates «${xs}» ≠ <head> «${hs}» (python3 scripts/seo.py)`);
}

if (LIVE) {
  const urls = [...new Set([...info.values()].flatMap((p) => p.alts.map(([, u]) => u)))].sort();
  for (const u of urls) {
    const r = await fetch(u, { redirect: "manual" }).catch((e) => ({ status: String(e) }));
    if (r.status !== 200) fails.push(`en vivo ${u}: ${r.status}`);
  }
  console.log(`en vivo: ${urls.length} URLs de hreflang pedidas`);
}

if (fails.length) {
  console.error(`t19 hreflang ✗ ${fails.length}\n` + fails.join("\n"));
  process.exit(1);
}
console.log(`t19 hreflang ✓ ${info.size} páginas, ${pairs.length} pares ES↔EN recíprocos, ${solos.length} sin par${solos.length ? " (" + solos.join(", ") + ")" : ""}; selector y sitemap OK`);
