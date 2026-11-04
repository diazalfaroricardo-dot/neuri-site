// 568: en el asistente de la landing de bazar, ana@gmial.com sugiere ana@gmail.com; solo cambia si se toca.
// Uso: node scripts/bazar-sug-correo-test.mjs [base]   (no crea ningún alta)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "http://127.0.0.1:8765";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
let fail = 0;
const cases = [
  ["/bazar/", 390, "¿Quisiste decir"],
  ["/bazar/", 1280, "¿Quisiste decir"],
  ["/en/bazar/", 390, "Did you mean"],
  ["/en/bazar/", 1280, "Did you mean"],
];
for (const [path, w, frase] of cases) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.route("https://bazar.neuri.tech/**", (r) => r.abort());
  await p.goto(`${BASE}${path}#prueba`, { waitUntil: "load" });
  // Lleva el asistente al paso 4 con su propio flujo.
  for (let i = 0; i < 4; i++) {
    const enCorreo = await p.evaluate(() => {
      const f = document.getElementById("asistente");
      const c = f.querySelector("#f-correo");
      if (c.offsetParent) return true;
      for (const el of f.querySelectorAll("input[type=text]")) if (el.offsetParent && !el.value) el.value = "Bazar QA";
      const groups = new Set([...f.querySelectorAll("input[type=radio]")].filter((r) => r.offsetParent).map((r) => r.name));
      for (const g of groups) if (!f.querySelector(`input[name=${g}]:checked`)) f.querySelector(`input[name=${g}]`).checked = true;
      return false;
    });
    if (enCorreo) break;
    await p.locator("#siguiente").click();
    await p.waitForTimeout(250);
  }
  const correo = p.locator("#f-correo");
  const sug = p.locator("#sug-correo");
  const fallas = [];
  await correo.fill("ana@gmial.com");
  if (!(await sug.isVisible().catch(() => false))) fallas.push("no sugiere con gmial");
  else {
    const t = await sug.textContent();
    if (!t.includes(frase) || !t.includes("ana@gmail.com")) fallas.push(`texto «${t}»`);
    const h = (await sug.boundingBox())?.height ?? 0;
    if (h < 44) fallas.push(`alto ${h}`);
    if ((await correo.inputValue()) !== "ana@gmial.com") fallas.push("cambió sin tocar");
    await sug.click();
    if ((await correo.inputValue()) !== "ana@gmail.com") fallas.push("no aplicó al tocar");
    if (await sug.isVisible()) fallas.push("sigue visible tras aplicar");
  }
  await correo.fill("ana@empresa.mx");
  if (await sug.isVisible().catch(() => false)) fallas.push("sugiere con un dominio bueno");
  const scroll = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  if (scroll) fallas.push("scroll horizontal");
  if (errs.length) fallas.push(errs.join(" | "));
  if (fallas.length) fail++;
  console.log(fallas.length ? "FALLA" : "OK  ", path, w, fallas.join("; "));
  await p.close();
}
await b.close();
process.exit(fail ? 1 : 0);
