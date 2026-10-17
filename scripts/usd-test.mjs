// A230/A233: ?moneda=usd en el alta ES muestra y manda el plan en USD (vendedores de EE. UU., visitas en Phoenix); sin el parámetro queda en MXN.
// Uso: node scripts/usd-test.mjs [base]   (base por defecto https://neuri.tech; no envía ningún alta)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
const cases = [
  [390, "?moneda=usd&src=visita-31oct", ["Básico ($49 USD)", "Pro ($69 USD)"], true],
  [1280, "?moneda=USD", ["Básico ($49 USD)", "Pro ($69 USD)"], true],
  [390, "?src=visita-31oct", ["Básico ($899)", "Pro ($1,299)"], false],
  // A248: regresión de A247 — teléfono (UA móvil) a 1280 px: la plantilla repinta las tarjetas tarde
  [1280, "?moneda=usd&src=visita-31oct", ["Básico ($49 USD)", "Pro ($69 USD)"], true, true],
];
let fail = 0;
for (const [w, q, want, usd, movil] of cases) {
  // zona de México: sin ?moneda la landing queda en MXN (en zona de EE. UU. sale USD sola, ver qr-idioma-test A235)
  const p = await b.newPage({ viewport: { width: w, height: 844 }, timezoneId: "America/Mexico_City", ...(movil ? { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148" } : {}) });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(`${BASE}/sigue-disponible/${q}`, { waitUntil: "networkidle" });
  // A248: las tarjetas ya deben decir USD a los 400 ms (antes del clic), como las vería un vendedor al abrir
  await p.waitForTimeout(400);
  const early = await p.evaluate(() => (document.body.innerText.match(/USD \/ mes/g) || []).length);
  // El botón «Pro» de la sección de precios debe elegir el radio Pro también con USD
  await p.locator('a[data-plan^="Pro"]:visible').first().click();
  await p.waitForTimeout(300);
  const v = await p.evaluate(() => {
    const rs = [...document.querySelectorAll('form:has(fieldset[data-step]) input[name=plan]')];
    return {
      values: rs.map((r) => r.value),
      labels: rs.map((r) => r.parentNode.querySelector("b")?.textContent),
      checked: rs.find((r) => r.checked)?.value,
      note: !!document.getElementById("nb-usd"),
      sw: document.documentElement.scrollWidth,
      mxnVisible: /MXN \/ mes|\$899\b|\$1,299\b/.test(document.body.innerText),
      usdCards: (document.body.innerText.match(/USD \/ mes/g) || []).length,
    };
  });
  const ok = JSON.stringify(v.values) === JSON.stringify(want) && v.checked === want[1] && v.note === usd &&
    (!usd || early >= 2) && (!usd || (v.labels.every((l) => /USD/.test(l)) && !v.mxnVisible && v.usdCards >= 2)) && (usd || v.mxnVisible) && v.sw <= w && errs.length === 0;
  if (!ok) fail++;
  console.log(ok ? "OK  " : "FALLA", w, q, movil ? "móvil" : "", "early=" + early, JSON.stringify(v), errs.join(" | "));
  await p.close();
}
await b.close();
process.exit(fail ? 1 : 0);
