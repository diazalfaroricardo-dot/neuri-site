// T15: ?lang=es|en lleva a su par aunque el navegador sea automatizado (webdriver=true), 390 y 1280.
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
const req = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`);
const { chromium } = req("./index.js");
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0;
const cases = [
  ["/bazar/?lang=en", "/en/", "en"],
  ["/en/?lang=es", "/bazar/", "es"],
  ["/sigue-disponible/?lang=en", "/en/still-available/", "en"],
  ["/en/still-available/?lang=es", "/sigue-disponible/", "es"],
  ["/bazar/?lang=es", "/bazar/", "es"],
  ["/?lang=en", "/en/home/", "en"],
  ["/en/home/?lang=es", "/", "es"],
  ["/?lang=es", "/", "es"],
  ["/marketing/?lang=en", "/en/marketing/", "en"],
  ["/en/marketing/?lang=es", "/marketing/", "es"],
  ["/marketing/?lang=es", "/marketing/", "es"],
];
for (const w of [390, 1280]) {
  for (const [from, to, lang] of cases) {
    const c = await b.newContext({ viewport: { width: w, height: 800 }, timezoneId: "America/Mexico_City" });
    await c.route("https://neuri.tech/**", (r) => {
      const p = new URL(r.request().url()).pathname;
      const f = root + p + (p.endsWith("/") ? "index.html" : "");
      if (!existsSync(f)) return r.fulfill({ status: 404, body: "" });
      const ct = f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : f.endsWith(".html") ? "text/html" : "application/octet-stream";
      r.fulfill({ status: 200, body: readFileSync(f), contentType: ct });
    });
    await c.route(/^(?!https:\/\/neuri\.tech).*/, (r) => (r.request().resourceType() === "document" ? r.continue() : r.abort()));
    const p = await c.newPage();
    await p.goto("https://neuri.tech" + from, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(500);
    const got = new URL(p.url()).pathname;
    const hl = await p.evaluate(() => document.documentElement.lang).catch(() => "?");
    const ok = got === to && hl.startsWith(lang);
    if (!ok) fail++;
    console.log(ok ? "OK  " : "FAIL", w, from, "→", got, hl);
    await c.close();
  }
}
await b.close();
if (fail) { console.log(fail, "fallas"); process.exit(1); }
console.log("t15 OK");
