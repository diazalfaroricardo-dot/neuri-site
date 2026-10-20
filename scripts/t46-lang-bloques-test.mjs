// T46: /legal/ y /novedades/ (lang=es) marcan con lang="en" todo lo que está en inglés
// (desde el encabezado #en-h hasta el final del contenido), para lectores de pantalla y traductores.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const req = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`);
const { chromium } = req("./index.js");
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0;
for (const p of ["legal/index.html", "novedades/index.html"]) {
  const page = await b.newPage();
  await page.setContent(readFileSync(`${root}/${p}`, "utf8").replace(/<script[\s\S]*?<\/script>/g, ""));
  const malos = await page.evaluate(() => {
    const start = document.getElementById("en-h");
    if (!start) return ["sin #en-h"];
    const main = start.closest("main");
    const out = [];
    for (const el of main.querySelectorAll("h1,h2,h3,p,li,a,dt,dd")) {
      if (!(start.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) && el !== start) continue;
      if (!el.textContent.trim()) continue;
      if (el.closest("[lang]")?.getAttribute("lang") !== "en") out.push(el.textContent.trim().slice(0, 50));
    }
    return out;
  });
  if (malos.length) { fail++; console.log(`FAIL ${p}: ${malos.length} bloques en inglés sin lang="en" (p. ej. «${malos[0]}»)`); }
  else console.log(`OK ${p}`);
  await page.close();
}
await b.close();
process.exit(fail ? 1 : 0);
