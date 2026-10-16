import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
const req = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`);
const { chromium } = req("./index.js");
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const ctx = async (tz) => {
  const c = await b.newContext({ timezoneId: tz, locale: "es-MX" });
  await c.addInitScript(() => Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false }));
  await c.route("https://neuri.tech/**", (r) => {
    const p = new URL(r.request().url()).pathname;
    let f = root + p + (p.endsWith("/") ? "index.html" : "");
    if (!existsSync(f)) return r.fulfill({ status: 404, body: "" });
    const ct = f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : f.endsWith(".html") ? "text/html" : "application/octet-stream";
    r.fulfill({ status: 200, body: readFileSync(f), contentType: ct });
  });
  await c.route(/^(?!https:\/\/neuri\.tech).*/, (r) => (r.request().resourceType() === "document" ? r.continue() : r.abort()));
  return c;
};
let fail = 0;
const check = async (name, tz, url, expect, steps) => {
  const c = await ctx(tz);
  const p = await c.newPage();
  await p.goto(url, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(400);
  if (steps) await steps(p);
  const got = new URL(p.url()).pathname;
  const ok = got === expect;
  if (!ok) fail++;
  console.log(ok ? "OK  " : "FAIL", name, "→", got);
  await c.close();
};
await check("MX en página EN", "America/Mexico_City", "https://neuri.tech/en/still-available/", "/sigue-disponible/");
await check("Tijuana en EN", "America/Tijuana", "https://neuri.tech/en/ai-consulting/", "/consultoria/");
await check("Phoenix en ES", "America/Phoenix", "https://neuri.tech/sigue-disponible/", "/en/still-available/");
await check("NY bazar ES", "America/New_York", "https://neuri.tech/bazar/", "/en/");
await check("Madrid se queda", "Europe/Madrid", "https://neuri.tech/en/marketing/", "/en/marketing/");
await check("Raíz no cambia", "America/Phoenix", "https://neuri.tech/", "/");
await check("?lang=es manda en US", "America/Phoenix", "https://neuri.tech/sigue-disponible/?lang=es", "/sigue-disponible/");
await check("US elige Español y se queda", "America/Phoenix", "https://neuri.tech/sigue-disponible/", "/consultoria/", async (p) => {
  await p.click('a[hreflang="es"] >> nth=0', { force: true }).catch(() => p.evaluate(() => document.querySelector('a[hreflang="es"]').click()));
  await p.waitForTimeout(500);
  await p.goto("https://neuri.tech/consultoria/");
  await p.waitForTimeout(400);
});
await check("MX elige English y se queda", "America/Mexico_City", "https://neuri.tech/en/still-available/", "/en/still-available/", async (p) => {
  await p.evaluate(() => document.querySelector('a[hreflang="en"]').click());
  await p.waitForTimeout(600);
  await p.reload();
  await p.waitForTimeout(400);
});
await b.close();
process.exit(fail ? 1 : 0);
