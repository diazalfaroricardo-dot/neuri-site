// D-10 (backlog/d10-bots-landing-usd-html): /sigue-disponible/ y sus sub-páginas en español traen US$49/69 en el HTML,
// sin depender de JavaScript. El JS solo cambia a pesos con ?moneda=mxn o zona horaria de México (?moneda=usd gana).
// Revisa sin JS y con JS, en-US y es-US, 390/1280. Uso: node scripts/d10-usd-html-test.mjs [base]
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "http://127.0.0.1:8765";
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const pages = ["/sigue-disponible/", "/sigue-disponible/citas/"];
// [js, zona, idioma, query, moneda esperada]
const cases = [
  [false, "America/Phoenix", "en-US", "", "USD"],
  [false, "America/Phoenix", "es-US", "", "USD"],
  [false, "America/Mexico_City", "es-MX", "", "USD"], // sin JS no hay cambio: el HTML es USD
  [true, "America/Phoenix", "en-US", "", "USD"],
  [true, "America/Los_Angeles", "es-US", "", "USD"],
  [true, "America/Phoenix", "es-US", "?moneda=mxn", "MXN"],
  [true, "America/Mexico_City", "es-MX", "", "MXN"],
  [true, "America/Mexico_City", "es-MX", "?moneda=usd", "USD"],
];
let fail = 0;
for (const path of pages) for (const w of [390, 1280]) for (const [js, tz, loc, q, want] of cases) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, javaScriptEnabled: js, timezoneId: tz, locale: loc });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(`${BASE}${path}${q}`, { waitUntil: js ? "networkidle" : "load" });
  if (js) await p.waitForTimeout(600);
  const v = await p.evaluate(() => {
    const t = document.body.innerText;
    const radios = [...document.querySelectorAll("input[name=plan]")].map((r) => r.value);
    const cards = [...document.querySelectorAll(".pn")].map((s) => s.textContent + " " + (s.nextElementSibling?.textContent || ""));
    return { cards, radios, plans: [...document.querySelectorAll("a[data-plan]")].map((a) => a.dataset.plan),
      usd: /\$49(?![0-9,])/.test(t) && /\$69(?![0-9,])/.test(t) && /USD \/ mes/.test(t), mxn: /MXN|\$899(?![0-9])|\$1,299(?![0-9])/.test(t),
      sw: document.documentElement.scrollWidth };
  });
  const isUSD = want === "USD";
  const okCur = isUSD ? v.usd && !v.mxn : v.mxn && v.cards.every((c) => /MXN/.test(c));
  const okRad = !v.radios.length || (isUSD ? v.radios.every((r) => /USD/.test(r)) : v.radios.every((r) => !/USD/.test(r)));
  // los data-plan quedan en USD (el clic traduce al radio en pesos); el HTML nunca los trae en pesos
  const okPlan = v.plans.every((x) => /USD/.test(x));
  const ok = okCur && okRad && okPlan && v.sw <= w && errs.length === 0;
  if (!ok) fail++;
  console.log(ok ? "✓" : "✗", path, w, js ? "JS" : "sin JS", tz, loc, q || "-", "→", want, ok ? "" : JSON.stringify(v) + " " + errs.join(" | "));
  await ctx.close();
}
await b.close();
console.log(fail ? `d10-usd-html FALLA (${fail})` : "d10-usd-html OK");
process.exit(fail ? 1 : 0);
