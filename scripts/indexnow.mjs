#!/usr/bin/env node
// seo-indexnow — avisa a IndexNow (Bing, Yandex, Seznam, Naver…; Bing alimenta ChatGPT Search)
// qué URLs de neuri.tech cambiaron. La llave es pública por diseño: /<llave>.txt en la raíz.
// Uso:
//   node scripts/indexnow.mjs --todo                 → todas las URLs del sitemap.xml
//   node scripts/indexnow.mjs --desde <sha> --hasta <sha>  → solo las páginas cambiadas en ese rango
//   node scripts/indexnow.mjs --urls https://neuri.tech/a/,https://neuri.tech/b/
//   … --dry  → imprime el JSON sin mandar nada
// Sale 1 si IndexNow no responde 200/202. Doc: docs/seo/indexnow.md
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";

const HOST = "neuri.tech";
const BASE = `https://${HOST}/`;
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : undefined; };
const has = (n) => process.argv.includes(n);

const keyFile = readdirSync(".").find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) { console.error("✗ falta /<llave>.txt en la raíz"); process.exit(1); }
const key = readFileSync(keyFile, "utf8").trim();
if (`${key}.txt` !== keyFile) { console.error("✗ el contenido de la llave no coincide con su nombre"); process.exit(1); }

const sitemap = [...readFileSync("sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const enSitemap = new Set(sitemap);

// archivo del repo → URL pública (solo páginas *.html; index.html → carpeta)
export function urlDe(f) {
  if (!f.endsWith(".html")) return null;
  if (/^(docs|scripts|tools|node_modules|\.github)\//.test(f)) return null;
  return BASE + (f.endsWith("index.html") ? f.slice(0, -"index.html".length) : f);
}

let urls;
if (has("--todo")) urls = sitemap;
else if (arg("--urls")) urls = arg("--urls").split(",").map((s) => s.trim()).filter(Boolean);
else {
  const desde = arg("--desde"), hasta = arg("--hasta") || "HEAD";
  if (!desde || /^0+$/.test(desde)) { console.log("Sin rango previo: mando el sitemap completo."); urls = sitemap; }
  else {
    const cambiados = execFileSync("git", ["diff", "--name-only", "--diff-filter=AMR", desde, hasta], { encoding: "utf8" })
      .split("\n").filter(Boolean);
    urls = [...new Set(cambiados.map(urlDe).filter((u) => u && enSitemap.has(u)))];
    console.log(`${cambiados.length} archivos cambiados → ${urls.length} URLs del sitemap`);
  }
}
urls = urls.filter((u) => u.startsWith(BASE)).slice(0, 10000);
if (!urls.length) { console.log("Nada que avisar."); process.exit(0); }

const body = { host: HOST, key, keyLocation: `${BASE}${keyFile}`, urlList: urls };
if (has("--dry")) { console.log(JSON.stringify(body, null, 2)); process.exit(0); }

const r = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
const txt = await r.text().catch(() => "");
console.log(`IndexNow ${r.status} ${r.statusText} · ${urls.length} URLs ${txt ? "· " + txt.slice(0, 200) : ""}`);
for (const u of urls) console.log("  " + u);
process.exit(r.status === 200 || r.status === 202 ? 0 : 1);
