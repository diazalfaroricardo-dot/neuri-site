// QA #7: la landing ES de neuri.bots en zona de EE. UU. (Phoenix) muestra USD en tarjetas, alta, calculadora y título
// (no promete «pesos» junto a $49 USD); en zona de México todo queda en MXN.
// QA #9: el buscador de dudas con «cuánto cuesta» / «how much is it» contesta con los precios.
// Uso: node scripts/qa7-qa9-precios-test.mjs [--live]   390 y 1280
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
const req = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`);
const { chromium } = req("./index.js");
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const live = process.argv.includes("--live");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0;
const check = (ok, ...m) => { if (!ok) fail++; console.log(ok ? "OK  " : "FAIL", ...m); };
// [ruta, zona, pregunta, debe tener (texto), no debe tener, precio en la respuesta]
const cases = [
  ["/sigue-disponible/?lang=es", "America/Phoenix", "cuánto cuesta", ["Precios en dólares", "Al mes se te van (USD)", "cuesta $49 USD al mes"], ["Precios en pesos", "(MXN)"], "$49 USD"],
  ["/sigue-disponible/?lang=es", "America/Mexico_City", "cuánto cuesta", ["Precios en pesos", "Al mes se te van (MXN)", "$899 MXN al mes"], ["Precios en dólares"], "$899 MXN"],
  ["/en/still-available/?lang=en", "America/Phoenix", "how much is it", [], [], "$49 USD"],
];
for (const w of [390, 1280]) {
  for (const [path, tz, q, must, mustNot, price] of cases) {
    const c = await b.newContext({ viewport: { width: w, height: 900 }, timezoneId: tz });
    if (!live) {
      await c.route("https://neuri.tech/**", (r) => {
        const p = new URL(r.request().url()).pathname;
        const f = root + p + (p.endsWith("/") ? "index.html" : "");
        if (!existsSync(f)) return r.fulfill({ status: 404, body: "" });
        const ct = f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : f.endsWith(".html") ? "text/html" : "application/octet-stream";
        r.fulfill({ status: 200, body: readFileSync(f), contentType: ct });
      });
      await c.route(/^(?!https:\/\/neuri\.tech).*/, (r) => (r.request().resourceType() === "document" ? r.continue() : r.abort()));
    }
    const p = await c.newPage();
    await p.goto("https://neuri.tech" + path, { waitUntil: "load" });
    await p.waitForTimeout(1500);
    const txt = await p.evaluate(() => document.body.innerText);
    const html = await p.evaluate(() => document.body.innerText + " " + [...document.querySelectorAll("h2,label,span")].map((e) => e.textContent).join(" "));
    for (const s of must) check(html.includes(s) || txt.toUpperCase().includes(s.toUpperCase()), w, tz, path, "tiene", s);
    for (const s of mustNot) check(!txt.includes(s) && !txt.toUpperCase().includes(s.toUpperCase()), w, tz, path, "no tiene", s);
    const box = p.locator("#ayuda-box:visible").first();
    await box.scrollIntoViewIfNeeded();
    await box.locator("#ayuda-q").click();
    await p.keyboard.type(q);
    await p.keyboard.press("Enter");
    await p.waitForFunction(() => [...document.querySelectorAll("#ayuda-r")].some((e) => e.innerText.trim()), null, { timeout: 5000 }).catch(() => {});
    const r = await p.evaluate(() => [...document.querySelectorAll("#ayuda-r")].map((e) => e.innerText).join(" "));
    check(r.includes(price), w, tz, path, `«${q}» →`, r.replace(/\s+/g, " ").slice(0, 140));
    await c.close();
  }
}
await b.close();
if (fail) { console.log(fail, "fallas"); process.exit(1); }
console.log("qa7-qa9 OK");
