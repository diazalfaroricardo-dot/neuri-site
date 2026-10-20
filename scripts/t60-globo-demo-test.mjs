// T60 (B-A10/B-N2): el globo «Need help choosing?» no tapa el teléfono de la demo de /en/ y /bazar/.
// Estático siempre; con --live, en neuri.tech a 1280 y 390, con #demo en pantalla el globo queda oculto.
import { readFileSync } from "node:fs";
const s = readFileSync(new URL("../assets/vendedor.js", import.meta.url), "utf8");
const f = [];
if (!/\.l\.tapa\{[^}]*visibility:hidden/.test(s)) f.push("falta .l.tapa oculto");
if (!/getElementById\("demo"\)[\s\S]{0,200}IntersectionObserver[\s\S]{0,200}toggle\("tapa"/.test(s)) f.push("el globo no se esconde con la demo en pantalla");
if (f.length) { console.error("t60:", f.join("; ")); process.exit(1); }
if (process.argv.includes("--live")) {
  const { chromium } = await import("playwright-core");
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
  for (const url of ["https://neuri.tech/en/", "https://neuri.tech/bazar/"]) for (const w of [1280, 390]) {
    const pg = await b.newPage({ viewport: { width: w, height: w > 500 ? 800 : 844 } });
    await pg.goto(url, { waitUntil: "networkidle" });
    await pg.waitForTimeout(2000);
    await pg.evaluate(() => document.getElementById("demo")?.scrollIntoView({ block: "center" }));
    await pg.waitForTimeout(900);
    const v = await pg.evaluate(() => { const h = document.getElementById("neuri-vendedor"); const l = h?.shadowRoot?.querySelector(".l"); return l ? getComputedStyle(l).visibility : "sin-globo"; });
    if (v === "visible") f.push(`${url} ${w}px globo visible sobre la demo`);
    console.log(url, w, "con la demo en pantalla:", v);
    await pg.close();
  }
  await b.close();
  if (f.length) { console.error("t60 live:", f.join("; ")); process.exit(1); }
}
console.log("t60-globo-demo OK");
