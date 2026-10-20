// axe WCAG 2 A/AA de la página completa en producción, 390/1280. Uso: node scripts/axe-vivo.mjs /consultoria/ /en/ai-consulting/ /
// QA diario: node scripts/axe-vivo.mjs --todas → todas las páginas públicas del repo (incluye las secundarias: privacidad, términos, recorrido, hoja, borrar datos…).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const AXE = process.env.AXE || join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js");
if (!existsSync(AXE)) { console.log("sin axe-core"); process.exit(1); }
const axeSrc = readFileSync(AXE, "utf8");
// Páginas públicas = cada index.html del repo, sin carpetas ocultas, node_modules, docs, scripts ni assets.
export function paginasPublicas(root) {
  const out = [];
  const walk = (dir) => {
    for (const n of readdirSync(dir)) {
      if (n.startsWith(".") || ["node_modules", "docs", "scripts", "assets", "test-results"].includes(n)) continue;
      const f = join(dir, n);
      if (statSync(f).isDirectory()) walk(f);
      else if (n === "index.html") out.push("/" + relative(root, dir).split("\\").join("/") + (dir === root ? "" : "/"));
    }
  };
  walk(root);
  return out.map((p) => p.replace(/^\/\/$/, "/")).sort();
}
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (args.includes("--listar")) { console.log(paginasPublicas(ROOT).join("\n")); process.exit(0); }
const paths = args.includes("--todas") ? paginasPublicas(ROOT) : args.length ? args : ["/"];
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0;
for (const width of [390, 1280]) for (const p of paths) {
  const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion: "reduce" });
  await page.goto("https://neuri.tech" + p, { waitUntil: "load" });
  await page.addScriptTag({ content: axeSrc });
  const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  if (v.length || sw > width) { fails++; console.log(`✗ ${p}@${width}: ${v.join(", ")} ${sw > width ? `scroll ${sw}` : ""}`); }
  await page.close();
}
await browser.close();
if (!fails) console.log(`✓ axe AA 0 y sin scroll horizontal en ${paths.join(", ")} × 390/1280 (en vivo)`);
process.exit(fails ? 1 : 0);
