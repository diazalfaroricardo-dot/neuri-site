// Candado SEO de neuri.tech: node scripts/seo-test.mjs
// canonical, títulos únicos, descripción, sitemap completo, llms.txt sin URLs viejas, robots sin bloquear IA.
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const SKIP = ["node_modules/", "docs/", "tools/", "scripts/", "preview-", ".t25/", "assets/", "img/"];
const files = globSync("**/index.html").filter((f) => !SKIP.some((s) => f.startsWith(s))).sort();
const fails = [];
const titles = new Map();
const sitemap = readFileSync("sitemap.xml", "utf8");
const head = (h) => (h.match(/<head>([\s\S]*?)<\/head>/) || [, ""])[1];

for (const f of files) {
  const h = readFileSync(f, "utf8");
  const hd = head(h);
  const robots = (hd.match(/name="robots"\s+content="([^"]*)"/) || [, ""])[1];
  if (robots.includes("noindex")) continue;
  const url = "https://neuri.tech/" + f.slice(0, -"index.html".length);
  const can = (hd.match(/rel="canonical"\s+href="([^"]+)"/) || [])[1];
  if (can !== url) fails.push(`${f}: canonical ${can ?? "falta"} (esperado ${url})`);
  const t = (hd.match(/<title>([\s\S]*?)<\/title>/) || [, ""])[1].trim();
  if (!t) fails.push(`${f}: sin <title>`);
  if (titles.has(t)) fails.push(`${f}: título repetido con ${titles.get(t)}`);
  titles.set(t, f);
  const d = (hd.match(/name="description"\s+content="([^"]*)"/) || [, ""])[1];
  if (d.length < 50 || d.length > 170) fails.push(`${f}: descripción de ${d.length} caracteres (50–170)`);
  if (!sitemap.includes(`<loc>${url}</loc>`)) fails.push(`${f}: no está en sitemap.xml (corre python3 scripts/seo.py)`);
}

const llms = readFileSync("llms.txt", "utf8");
if (/railway\.app/.test(llms)) fails.push("llms.txt: todavía apunta a railway.app");
const robots = readFileSync("robots.txt", "utf8");
for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"]) {
  const block = new RegExp(`User-agent:\\s*${bot}[\\s\\S]*?Disallow:\\s*/\\s*$`, "mi");
  if (block.test(robots)) fails.push(`robots.txt bloquea ${bot}`);
}
if (!/Sitemap:\s*https:\/\/neuri\.tech\/sitemap\.xml/.test(robots)) fails.push("robots.txt sin línea Sitemap");

if (fails.length) {
  console.error("SEO ✗\n" + fails.join("\n"));
  process.exit(1);
}
console.log(`SEO ✓ ${titles.size} páginas indexables: canonical, título único, descripción, en sitemap; llms.txt y robots OK`);
