// QA #8: con un idioma guardado, abrir directo (o desde fuera) una URL con idioma explícito muestra ESE idioma;
// también navegando dentro de neuri.tech (2ª vuelta). 390 y 1280, zona Phoenix, como un teléfono real.
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
const req = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`);
const { chromium } = req("./index.js");
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const live = process.argv.includes("--live");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0;
// [guardado, url, referer, ruta esperada, lang esperado]
const cases = [
  ["en", "/sigue-disponible/", null, "/sigue-disponible/", "es"],
  ["es", "/en/still-available/", null, "/en/still-available/", "en"],
  ["en", "/sigue-disponible/", "https://www.google.com/", "/sigue-disponible/", "es"],
  ["en", "/bazar/", null, "/bazar/", "es"],
  // 2ª vuelta (25-oct): aun navegando dentro de neuri.tech, la URL con idioma manda.
  ["en", "/sigue-disponible/", "https://neuri.tech/en/home/", "/sigue-disponible/", "es"],
  ["es", "/en/still-available/", "https://neuri.tech/", "/en/still-available/", "en"],
  ["en", "/bazar/", "https://neuri.tech/en/", "/bazar/", "es"],
];
for (const w of [390, 1280]) {
  for (const [saved, from, ref, to, lang] of cases) {
    const c = await b.newContext({ viewport: { width: w, height: 800 }, timezoneId: "America/Phoenix", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148" });
    await c.addInitScript((v) => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      try { localStorage.setItem("neuri-lang", v); } catch (_) {}
    }, saved);
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
    await p.goto("https://neuri.tech" + from, { waitUntil: "domcontentloaded", ...(ref ? { referer: ref } : {}) });
    await p.waitForTimeout(live ? 1500 : 500);
    const got = new URL(p.url()).pathname;
    const hl = await p.evaluate(() => document.documentElement.lang).catch(() => "?");
    const ok = got === to && hl.startsWith(lang);
    if (!ok) fail++;
    console.log(ok ? "OK  " : "FAIL", w, `guardado=${saved}`, from, `ref=${ref ?? "-"}`, "→", got, hl);
    await c.close();
  }
}
await b.close();
if (fail) { console.log(fail, "fallas"); process.exit(1); }
console.log("qa8 OK");
