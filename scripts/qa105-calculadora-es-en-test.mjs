// QA #105: la calculadora «¿Cuánto se te va…?» daba 10x más en español ($600 → $43,200) que en
// inglés ($60 → $4,320) con los mismos datos, y la barra de «cuántos compran» se leía distinto.
// Ahora ambos idiomas arrancan igual (USD) y el «se paga con» usa el plan en USD que dice al lado.
// Uso: node scripts/qa105-calculadora-es-en-test.mjs [base]
import { chromium } from "playwright-core";
const base = process.argv[2] || "http://127.0.0.1:8765";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
const leer = async (ruta, tz) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: tz });
  const p = await ctx.newPage();
  await p.goto(base + ruta, { waitUntil: "load" });
  await p.waitForTimeout(400);
  const v = await p.evaluate(() => {
    const t = (id) => document.getElementById(id)?.textContent?.trim();
    const r = (id) => { const e = document.getElementById(id); return e ? [e.min, e.max, e.step, e.value].join("/") : ""; };
    return { t: t("o-t"), r: t("o-r"), c: t("o-c"), be: t("o-be"), ticket: r("lc-ticket"), close: r("lc-close") };
  });
  await ctx.close();
  return v;
};
for (const tz of ["America/Phoenix", "America/Mexico_City"]) {
  const es = await leer("/sigue-disponible/", tz);
  const en = await leer("/en/still-available/", tz);
  ok(es.t === en.t && es.t === "$60", `${tz}: venta promedio igual (ES ${es.t}, EN ${en.t})`);
  ok(es.r === en.r && es.r === "$4,320", `${tz}: resultado igual (ES ${es.r}, EN ${en.r})`);
  ok(es.ticket === en.ticket, `${tz}: misma barra de venta promedio (ES ${es.ticket}, EN ${en.ticket})`);
  ok(es.close === en.close && es.c === en.c, `${tz}: «cuántos compran» igual (ES ${es.c} ${es.close}, EN ${en.c} ${en.close})`);
  ok(/con 1 venta/.test(es.be || ""), `${tz}: ES «se paga con 1 venta» con $49 USD (${es.be})`);
}
await b.close();
process.exit(fails ? 1 : 0);
