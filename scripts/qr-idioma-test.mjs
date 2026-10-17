// A234/A235: un teléfono de Phoenix (zona America/Phoenix) que escanea el QR de un material impreso EN ESPAÑOL
// debe quedarse en la landing en español (no lo manda lang.js al inglés), y la landing ES en un teléfono de EE. UU.
// muestra precios en USD sola; ?moneda=mxn la regresa a MXN. Un teléfono de México sigue en MXN.
// Uso: node scripts/qr-idioma-test.mjs [base]   (por defecto https://neuri.tech; no envía ningún alta)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
// [zona, query, ruta esperada, ¿USD?]
const cases = [
  ["America/Phoenix", "?lang=es&negocio=Prueba&src=visita-31oct&moneda=usd#demo", "/sigue-disponible/", true],
  ["America/Phoenix", "?lang=es&negocio=Prueba&src=visita-31oct#demo", "/sigue-disponible/", true],
  ["America/Phoenix", "?lang=es&moneda=mxn", "/sigue-disponible/", false],
  // links ya impresos/enviados SIN lang=es: no deben irse al inglés (A234 en lang.js)
  ["America/Phoenix", "?negocio=Prueba&src=visita-31oct&moneda=usd#demo", "/sigue-disponible/", true],
  ["America/Phoenix", "?alta=c-prueba#alta", "/sigue-disponible/", true],
  ["America/Los_Angeles", "?lang=es", "/sigue-disponible/", true],
  ["America/Hermosillo", "?src=visita-31oct", "/sigue-disponible/", false],
  ["America/Mexico_City", "", "/sigue-disponible/", false],
];
let fail = 0;
for (const w of [390, 1280]) {
  for (const [tz, q, path, usd] of cases) {
    const ctx = await b.newContext({ timezoneId: tz, viewport: { width: w, height: 844 }, userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148" });
    // lang.js no redirige con navigator.webdriver: se apaga para probar como un teléfono real
    await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(`${BASE}/sigue-disponible/${q}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(400);
    const v = await p.evaluate(() => {
      const rs = [...document.querySelectorAll("form:has(fieldset[data-step]) input[name=plan]")].map((r) => r.value);
      const t = document.body.innerText;
      return { path: location.pathname, plans: rs, mxn: /MXN \/ mes|\$899\b/.test(t), usdCards: (t.match(/USD \/ mes/g) || []).length, note: !!document.getElementById("nb-usd"), sw: document.documentElement.scrollWidth };
    });
    const plansOk = usd ? v.plans.every((x) => /USD/.test(x)) && !v.mxn && v.usdCards >= 2 && v.note : v.plans.every((x) => !/USD/.test(x)) && v.mxn && !v.note;
    const ok = v.path === path && plansOk && v.sw <= w && errs.length === 0;
    if (!ok) fail++;
    console.log(ok ? "OK  " : "FALLA", w, tz, q || "(sin query)", JSON.stringify(v), errs.join(" | "));
    await ctx.close();
  }
}
await b.close();
process.exit(fail ? 1 : 0);
