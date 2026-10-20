// T44 (B-N2/B-A10): a 390 px el globo «¿Te ayudo a elegir?» no tapa el hero al cargar.
// Estático siempre; con --live mide en neuri.tech que el globo no cruce «Sin tarjeta · Sin contrato».
import { readFileSync } from "node:fs";
const s = readFileSync(new URL("../assets/vendedor.js", import.meta.url), "utf8");
const f = [];
if (!/\.l\.wait\{[^}]*visibility:hidden/.test(s)) f.push("falta .l.wait oculto");
if (!/max-width:480px\)"\)\.matches[^\n]*scrollY < innerHeight/.test(s)) f.push("falta el arranque oculto en celular");
if (!/launch\.classList\.remove\("wait"\)/.test(s)) f.push("el globo nunca reaparece al bajar");
if (f.length) { console.error("t44:", f.join("; ")); process.exit(1); }
if (process.argv.includes("--live")) {
  const { chromium } = await import("playwright");
  const b = await chromium.launch();
  for (const [url, txt] of [["https://neuri.tech/sigue-disponible/", "Sin contrato"], ["https://neuri.tech/en/still-available/", "No contract"]]) {
    const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
    await pg.goto(url, { waitUntil: "networkidle" });
    await pg.waitForTimeout(2500);
    const vis = await pg.evaluate(() => {
      const h = document.getElementById("neuri-vendedor"); const l = h && h.shadowRoot && h.shadowRoot.querySelector(".l");
      return l ? getComputedStyle(l).visibility : "sin-globo";
    });
    if (vis === "visible") f.push(`${url} globo visible al cargar a 390`);
    await pg.mouse.wheel(0, 1200); await pg.waitForTimeout(800);
    const vis2 = await pg.evaluate(() => { const h = document.getElementById("neuri-vendedor"); const l = h && h.shadowRoot && h.shadowRoot.querySelector(".l"); return l ? getComputedStyle(l).visibility : "sin-globo"; });
    if (vis2 === "hidden") f.push(`${url} globo no aparece al bajar`);
    console.log(url, "carga:", vis, "· al bajar:", vis2, "·", txt);
    await pg.close();
  }
  await b.close();
  if (f.length) { console.error("t44 live:", f.join("; ")); process.exit(1); }
}
console.log("t44-globo-hero OK");
