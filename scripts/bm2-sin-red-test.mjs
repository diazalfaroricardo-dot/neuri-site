// B-M2: sin red, el alta de neuri.bots lo dice en pantalla, no abre el correo y no pierde lo escrito; al volver la red avisa. ES/EN 390/1280, sin enviar nada.
// Uso: node scripts/bm2-sin-red-test.mjs [base]
import { chromium } from "playwright-core";
const args = process.argv.slice(2);
const LIVE = false;
const BASE = args.find((a) => !a.startsWith("--")) || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
const all = [
  ["es", 390, "/sigue-disponible/"],
  ["en", 390, "/en/still-available/"],
  ["es", 1280, "/sigue-disponible/"],
  ["en", 1280, "/en/still-available/"],
];
const cases = LIVE ? all.filter((c) => c[1] === 390) : all;
let fail = 0;
const ids = [];
for (const [lang, w, path] of cases) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  let sent = null;
  if (!LIVE)
    await p.route("https://sd.neuri.tech/intake", async (r) => {
      sent = JSON.parse(r.request().postData() || "{}");
      await r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "qa-mock", connect: "closed" }) });
    });
  else p.on("request", (r) => { if (r.url().endsWith("/intake") && r.method() === "POST") sent = JSON.parse(r.postData() || "{}"); });
  await p.goto(`${BASE}${path}?src=visita-31oct`, { waitUntil: "networkidle" });
  await p.evaluate(() => { window.__ev = []; window.nTrack = (n, pr) => window.__ev.push([n, pr]); });
  const form = p.locator("form:has(fieldset[data-step])").first();
  const next = async () => {
    await p.locator("#bNext").click();
    await p.waitForTimeout(250);
    const bad = await form.evaluate((f) => [...f.querySelectorAll('[aria-invalid="true"]')].map((e) => e.name || e.id));
    if (bad.length) console.log("  campos marcados:", bad.join(","));
  };
  const s1 = form.locator('fieldset[data-step="1"]');
  await s1.locator('[name="nombre"]').fill(lang === "es" ? "QA Neuri (borrar)" : "QA Neuri (delete)");
  await s1.locator('[name="whatsapp"]').fill("6670000000");
  await s1.locator('[name="correo"]').fill("delivered@resend.dev");
  await next();
  const s2 = form.locator('fieldset[data-step="2"]');
  await s2.locator('[name="negocio"]').fill("Bazar QA Neuri");
  await s2.locator('input[name="giro"][value="bazar"]').evaluate((e) => { e.checked = true; e.dispatchEvent(new Event("change", { bubbles: true })); });
  await next();
  await p.waitForTimeout(300);
  await next();
  await p.waitForTimeout(300);
  const at = await form.evaluate((f) => [...f.querySelectorAll("fieldset[data-step]")].find((s) => !s.hidden)?.dataset.step);
  if (at !== "4") console.log("paso visible antes de enviar:", at);
  let mailtoOpened = false;
  p.on("framenavigated", (f) => { if (f.url().startsWith("mailto:")) mailtoOpened = true; });
  await p.evaluate(() => { window.__mailto = 0; const o = window.open; window.open = (...a) => { window.__mailto++; return null; }; });
  await form.locator("#consent").evaluate((e) => { e.checked = true; e.dispatchEvent(new Event("change", { bubbles: true })); });
  // El mock de /intake respondería aun sin red: se quita para que el fetch real falle offline.
  await p.unrouteAll({ behavior: "ignoreErrors" });
  await p.context().setOffline(true);
  await form.evaluate((f) => f.requestSubmit());
  await p.waitForFunction(() => document.getElementById("missing")?.dataset.offline === "1", null, { timeout: 5000 }).catch(() => {});
  const v = await p.evaluate(() => ({
    msg: document.getElementById("missing")?.textContent || "",
    on: document.getElementById("missing")?.classList.contains("on"),
    neg: document.querySelector('[name="negocio"]')?.value,
    href: location.href,
    sw: document.documentElement.scrollWidth,
  }));
  await p.context().setOffline(false);
  await p.waitForTimeout(400);
  const back = await p.evaluate(() => document.getElementById("missing")?.textContent || "");
  const good = v.on && /Sin conexión|No internet/.test(v.msg) && v.neg === "Bazar QA Neuri" && !v.href.startsWith("mailto:") && !mailtoOpened && /volvió|back online/.test(back) && v.sw <= w && errs.length === 0;
  if (!good) fail++;
  console.log(good ? "OK  " : "FALLA", lang, w, JSON.stringify({ msg: v.msg.slice(0, 50), back: back.slice(0, 40), neg: v.neg, sw: v.sw }), errs.join(" | "));
  await p.close();
}
await b.close();
process.exit(fail ? 1 : 0);
