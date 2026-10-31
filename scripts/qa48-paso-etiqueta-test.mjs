// qa #48: el alta de neuri.bots (sigue-disponible / still-available) no debe mostrar «PASO 1» fijo
// en cada paso del formulario (::before con contador que siempre da 1 y texto en español en EN).
// El encabezado .prog ya dice «Paso N de 4» / «Step N of 4». Uso: node scripts/qa48-paso-etiqueta-test.mjs
import { chromium } from "playwright-core";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const pages = ["sigue-disponible/index.html", "en/still-available/index.html"];
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0;
for (const p of pages) {
  const page = await browser.newPage();
  await page.goto("file://" + join(root, p), { waitUntil: "domcontentloaded" });
  const etiquetas = await page.$$eval("fieldset.paso", (fs) =>
    fs.map((f) => getComputedStyle(f, "::before").content));
  for (const [i, c] of etiquetas.entries()) {
    if (c && c !== "none" && c !== "normal" && c !== '""') { console.error(`✗ ${p} paso ${i + 1}: ::before = ${c}`); fail++; }
  }
  await page.close();
}
await browser.close();
if (fail) process.exit(1);
console.log(`✓ qa48: ${pages.length} altas sin etiqueta «Paso 1» fija en los pasos`);
