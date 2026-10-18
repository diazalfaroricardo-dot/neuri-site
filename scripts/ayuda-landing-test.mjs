// J3-bots: 10 dudas típicas de prospectos por idioma se contestan sin persona con la FAQ de la landing
// (assets/ayuda.js) y una pregunta sin respuesta cae al correo. Con --browser [base] además revisa en
// Chrome a 390 y 1280 que la caja aparece tras montar dc-lite, contesta y no hay errores.
// Uso: node scripts/ayuda-landing-test.mjs [--browser [base]]
import { readFileSync } from "node:fs";
import vm from "node:vm";
const ctx = {};
vm.runInNewContext(readFileSync("assets/ayuda.js", "utf8"), { globalThis: ctx });
const faqsOf = (p) => {
  const h = readFileSync(p, "utf8");
  const out = [];
  for (const m of h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    const j = JSON.parse(m[1]);
    for (const n of j["@graph"] ?? [j]) if (n["@type"] === "FAQPage") for (const q of n.mainEntity) out.push({ q: q.name, a: q.acceptedAnswer.text });
  }
  return out;
};
const casos = {
  "sigue-disponible/index.html": [
    ["¿Cuánto cuesta al mes?", 6], ["¿Me pueden banear Instagram?", 0], ["¿Hay contrato?", 5], ["¿lo puedo probar gratis?", 3],
    ["¿funciona con whatsapp?", 4], ["y si responde algo mal", 1], ["¿qué necesito para empezar?", 2], ["no me funciona, quién me ayuda", 7],
    ["¿sirve para marketplace?", 8], ["¿me cobran cuando acabe el mes gratis?", 11], ["¿me dan factura?", 10], ["¿para qué pago si instagram ya trae respuestas automáticas?", 9],
  ],
  "en/still-available/index.html": [
    ["How much does it cost per message?", 6], ["Will my account get banned?", 0], ["Is there a contract?", 5], ["Can I try it first?", 3],
    ["Does it work with WhatsApp?", 4], ["What if it answers wrong?", 1], ["What do I need to start?", 2], ["Who helps me if it breaks?", 7],
    ["Does it work on Marketplace?", 8], ["Is anyone using it?", 12], ["Do you send a receipt?", 10], ["Why pay if Instagram has built-in auto-replies?", 9],
  ],
};
let fail = 0;
for (const [p, cs] of Object.entries(casos)) {
  const faqs = faqsOf(p);
  let ok = 0;
  for (const [q, want] of cs) {
    const m = ctx.ayudaMatch(q, faqs);
    if (m && m.i === want) ok++;
    else { fail++; console.log(`FALLA ${p} «${q}» → ${m ? m.q : "sin respuesta"} (esperaba ${faqs[want]?.q})`); }
  }
  const none = ctx.ayudaMatch("zzz xyzw", faqs);
  if (none) { fail++; console.log(`FALLA ${p} una duda sin sentido no debe inventar respuesta`); }
  console.log(`${ok === cs.length && !none ? "OK   " : "FALLA"} ${p} · ${ok}/${cs.length} dudas contestadas sin persona`);
}
const bi = process.argv.indexOf("--browser");
if (bi > 0) {
  const BASE = process.argv[bi + 1] || "https://neuri.tech";
  const { chromium } = await import("playwright-core");
  const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--headless=new"] });
  for (const [path, q] of [["/sigue-disponible/", "¿hay contrato?"], ["/en/still-available/", "is there a contract?"]]) {
    for (const w of [390, 1280]) {
      const pg = await b.newPage({ viewport: { width: w, height: 844 } });
      const errs = [];
      pg.on("pageerror", (e) => errs.push(e.message));
      await pg.goto(`${BASE}${path}?t=${Date.now()}`, { waitUntil: "networkidle" });
      await pg.waitForTimeout(800);
      const vis = await pg.locator("#ayuda-q").isVisible().catch(() => false);
      let txt = "";
      if (vis) { await pg.fill("#ayuda-q", q); await pg.press("#ayuda-q", "Enter"); await pg.waitForTimeout(200); txt = await pg.textContent("#ayuda-r"); }
      const overflow = await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      const ok = vis && /cancel/i.test(txt) && !errs.length && !overflow;
      if (!ok) fail++;
      console.log(`${ok ? "OK   " : "FALLA"} ${path} ${w}px · caja ${vis ? "visible" : "NO"} · ${txt.slice(0, 60)} ${errs.join(" ")}${overflow ? " · desborde" : ""}`);
      await pg.close();
    }
  }
  await b.close();
}
process.exit(fail ? 1 : 0);
