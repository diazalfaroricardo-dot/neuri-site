// A227/A228: alta completa de neuri.bots desde el link de la tarjeta de visita (src=visita-31oct), ES/EN, 390 y 1280,
// hasta «¡Listo! Tu alta quedó completa». Revisa el aviso del correo (#okMail), el evento alta_recibida {origen, meta}
// y que no haya scroll horizontal ni errores.
// Uso: node scripts/alta-completa-test.mjs [base]          → /intake simulado (no crea altas)
//      node scripts/alta-completa-test.mjs --live [base]   → /intake real en sd.neuri.tech con delivered@resend.dev (solo 390 ES y EN)
import { chromium } from "playwright-core";
const args = process.argv.slice(2);
const LIVE = args.includes("--live");
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
  await s2.locator('input[name="giro"][value="bazar"]').check({ force: true });
  await next();
  await p.waitForTimeout(300);
  await next();
  await p.waitForTimeout(300);
  const at = await form.evaluate((f) => [...f.querySelectorAll("fieldset[data-step]")].find((s) => !s.hidden)?.dataset.step);
  if (at !== "4") console.log("paso visible antes de enviar:", at);
  await form.locator('label[for="consent"], label:has([name="consent"])').first().click();
  await form.evaluate((f) => f.requestSubmit());
  await p.waitForSelector("#ok:not([hidden])", { timeout: 20000 }).catch(() => {});
  const v = await p.evaluate(() => ({
    ok: !document.getElementById("ok").hidden,
    big: document.querySelector("#ok .big")?.textContent || "",
    mail: document.getElementById("okMail")?.textContent || "",
    ev: (window.__ev || []).filter((e) => e[0] === "alta_recibida"),
    sw: document.documentElement.scrollWidth,
  }));
  if (sent?.id) ids.push(sent.id);
  // A280: «Reenviar el correo» manda el mismo correo a /mi/link-nuevo y dice qué pasó (solo en mock).
  let resendOk = true;
  if (!LIVE) {
    let rs = null;
    await p.route("https://sd.neuri.tech/mi/link-nuevo**", async (r) => {
      rs = JSON.parse(r.request().postData() || "{}");
      await r.fulfill({ status: 200, contentType: "text/html", body: "ok" });
    });
    await p.locator("[data-resend-mail]").click();
    await p.waitForFunction(() => /Listo|Done/.test(document.getElementById("resendMsg")?.textContent || ""), null, { timeout: 5000 }).catch(() => {});
    const r2 = await p.evaluate(() => ({ msg: document.getElementById("resendMsg")?.textContent || "", dis: document.querySelector("[data-resend-mail]")?.disabled }));
    resendOk = rs?.correo === "delivered@resend.dev" && /Listo|Done/.test(r2.msg) && r2.dis === true;
    if (!resendOk) console.log("  reenviar:", JSON.stringify({ rs, ...r2 }));
  }
  const ev = v.ev[0]?.[1] || {};
  const good = resendOk && v.ok && /Listo|All set/.test(v.big) && /resend|correo|emailed/i.test(v.mail) && ev.origen === "visita-31oct" && ev.meta && sent?.origen === "visita-31oct" && v.sw <= w && errs.length === 0;
  if (!good) fail++;
  console.log(good ? "OK  " : "FALLA", lang, w, LIVE ? "live" : "mock", JSON.stringify({ big: v.big, mail: v.mail.slice(0, 40), ev, origen: sent?.origen, sw: v.sw }), errs.join(" | "));
  await p.close();
}
await b.close();
process.exit(fail ? 1 : 0);
