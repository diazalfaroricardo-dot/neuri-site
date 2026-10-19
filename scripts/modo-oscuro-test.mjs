// B-N5 (tech): con el modo oscuro del sistema, las páginas de neuri.tech siguen legibles — axe AA (incluye contraste) 0, sin scroll horizontal, 390/1280. Uso: node scripts/modo-oscuro-test.mjs [rutas…]
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const AXE = process.env.AXE || join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js");
if (!existsSync(AXE)) { console.log("sin axe-core"); process.exit(1); }
const axeSrc = readFileSync(AXE, "utf8");
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/en/home/", "/bazar/", "/en/", "/consultoria/", "/en/ai-consulting/", "/sigue-disponible/", "/en/still-available/", "/marketing/", "/legal/", "/sigue-disponible/hoja/", "/en/still-available/sheet/"];
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0;
for (const width of [390, 1280]) for (const p of paths) {
  const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion: "reduce", colorScheme: "dark" });
  const r = await page.goto("https://neuri.tech" + p, { waitUntil: "load" });
  if (!r || r.status() >= 400) { fails++; console.log(`✗ ${p}@${width}: HTTP ${r?.status()}`); await page.close(); continue; }
  await page.addScriptTag({ content: axeSrc });
  const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  if (v.length || sw > width) { fails++; console.log(`✗ ${p}@${width} oscuro: ${v.join(", ")} ${sw > width ? `scroll ${sw}` : ""}`); }
  await page.close();
}
await browser.close();
if (!fails) console.log(`✓ modo oscuro: axe AA 0 y sin scroll horizontal en ${paths.length} páginas × 390/1280 (en vivo)`);
process.exit(fails ? 1 : 0);
