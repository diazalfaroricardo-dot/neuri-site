// qa #6: entrar a /marketing/#precios (o dar clic en un link «#precios») deja la sección de precios
// a la vista aunque las secciones usen content-visibility:auto (antes la página crecía al pasar y el ancla se quedaba corta).
// Uso: node scripts/qa6-ancla-precios-test.mjs [base]   (base por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const base = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
const enVista = (p) => p.evaluate(() => { const r = document.getElementById("precios").getBoundingClientRect(); return { top: Math.round(r.top), vh: innerHeight }; });
for (const w of [390, 1280]) for (const path of ["/marketing/", "/en/marketing/"]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  await p.goto(`${base}${path}#precios`, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  let r = await enVista(p);
  ok(r.top >= 0 && r.top < 200, `${w}px ${path}#precios al cargar: la sección queda arriba (top ${r.top})`);
  // Clic en un link interno a #precios desde arriba de la página.
  await p.goto(`${base}${path}`, { waitUntil: "load" });
  await p.evaluate(() => { const a = document.createElement("a"); a.href = "#precios"; a.id = "qa6"; a.textContent = "x"; a.style.cssText = "position:fixed;top:0;left:0;z-index:99999"; document.body.append(a); });
  await p.click("#qa6");
  await p.waitForTimeout(2500);
  r = await enVista(p);
  ok(r.top >= 0 && r.top < 200, `${w}px ${path} clic en «#precios»: la sección queda arriba (top ${r.top})`);
  await p.close();
}
await b.close();
console.log(fails ? `${fails} falla(s)` : "todo OK");
process.exit(fails ? 1 : 0);
