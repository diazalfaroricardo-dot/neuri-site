// A214: el alta recibe negocio y «qué vendes» desde los links del demo (demo-qr/demo-wa/demo-copy), ES/EN, 390 y 1280.
// Uso: node scripts/alta-prefill-test.mjs [base]   (base por defecto https://neuri.tech; no envía ningún alta)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
const cases = [
  ["es", 390, "/sigue-disponible/", "productos=Silla%20de%20madera%20%24450%20MXN&negocio=Bazar%20Prueba&src=demo-qr", "Bazar Prueba", "Silla de madera $450 MXN"],
  ["en", 390, "/en/still-available/", "products=Wood%20chair%20%2445%20USD&business=Test%20Bazaar&src=demo-qr", "Test Bazaar", "Wood chair $45 USD"],
  ["es", 1280, "/sigue-disponible/", "productos=Lampara%20%24300&src=demo-wa", "", "Lampara $300"],
  ["en", 1280, "/en/still-available/", "products=Lamp%20%2430&src=demo-copy", "", "Lamp $30"],
];
let fail = 0;
for (const [lang, w, path, q, wantN, wantV] of cases) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(`${BASE}${path}?${q}`, { waitUntil: "networkidle" });
  const form = p.locator("form:has(fieldset[data-step])").first();
  for (const [n, v] of [["nombre", "Ana QA"], ["whatsapp", "6671234567"], ["correo", "delivered@resend.dev"]]) {
    const i = form.locator(`fieldset[data-step="1"] [name="${n}"]`);
    if (await i.count()) await i.fill(v);
  }
  await form.locator("button:visible").filter({ hasText: /^(Siguiente|Next)$/ }).first().click();
  await p.waitForTimeout(500);
  const v = await p.evaluate(() => {
    const f = document.querySelector("form:has(fieldset[data-step])");
    return { step2: !f.querySelector('fieldset[data-step="2"]').hidden, negocio: f.elements.negocio?.value, vendes: f.elements.vendes?.value, sw: document.documentElement.scrollWidth };
  });
  const ok = v.step2 && v.negocio === wantN && v.vendes === wantV && v.sw <= w && errs.length === 0;
  if (!ok) fail++;
  console.log(ok ? "OK  " : "FALLA", lang, w, JSON.stringify(v), errs.join(" | "));
  await p.close();
}
await b.close();
process.exit(fail ? 1 : 0);
