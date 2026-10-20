// T28 (B-O1/CLS): el hero de /marketing y /en/marketing no cambia de alto cuando llega Geist.
// Compara el bloque del hero (h1 + p.lede) con Google Fonts bloqueado (respaldo) vs con Geist cargado, a 390 y 1280.
// Falla si el h1 cambia de número de líneas o el párrafo se mueve más de 8 px.
// Uso: node scripts/t28-cls-marketing-test.mjs [base]   (base por defecto http://127.0.0.1:8765; --live = https://neuri.tech)
import { chromium } from "playwright-core";
const arg = process.argv[2];
const base = arg === "--live" ? "https://neuri.tech" : (arg || "http://127.0.0.1:8765");
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
const medir = async (ruta, w, sinFuentes) => {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2 });
  if (sinFuentes) await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const p = await ctx.newPage();
  await p.goto(base + ruta, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  const m = await p.evaluate(() => {
    const h = document.querySelector(".hero h1"), l = document.querySelector(".hero .lede");
    const lh = parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize) * .94;
    return { lineas: Math.round(h.getBoundingClientRect().height / lh), ledeTop: l.getBoundingClientRect().top, fam: getComputedStyle(h).fontFamily };
  });
  await ctx.close();
  return m;
};
for (const ruta of ["/marketing/", "/en/marketing/"]) for (const w of [390, 1280]) {
  const a = await medir(ruta, w, true), c = await medir(ruta, w, false);
  ok(a.lineas === c.lineas && Math.abs(a.ledeTop - c.ledeTop) <= 8,
    `${ruta}@${w} h1 ${a.lineas}→${c.lineas} líneas, p.lede ${Math.round(a.ledeTop)}→${Math.round(c.ledeTop)} px (respaldo → Geist)`);
}
await b.close();
console.log(fails ? `${fails} FALLAS` : "T28 OK");
process.exit(fails ? 1 : 0);
