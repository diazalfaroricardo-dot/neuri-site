import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
const req = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`);
const { chromium } = req("./index.js");
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const ctx = async (tz, locale = "es-MX") => {
  const c = await b.newContext({ timezoneId: tz, locale });
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
// QA #8 (4ª vuelta, 28-oct): la zona horaria ya no redirige; la página se queda y ofrece la barra en el otro idioma.
const check = async (name, tz, url, expect, steps, locale, bar) => {
  const c = await ctx(tz, locale);
  const p = await c.newPage();
  await p.goto(url, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(400);
  if (steps) await steps(p);
  const got = new URL(p.url()).pathname;
  const sug = await p.evaluate(() => document.getElementById("neuri-lang-sug")?.lang || null);
  const ok = got === expect && (bar === undefined || sug === bar);
  if (!ok) fail++;
  console.log(ok ? "OK  " : "FAIL", name, "→", got, "barra:", sug);
  await c.close();
};
await check("MX en página EN: se queda y ofrece español", "America/Mexico_City", "https://neuri.tech/en/still-available/", "/en/still-available/", null, undefined, "es");
await check("Tijuana en EN: se queda y ofrece español", "America/Tijuana", "https://neuri.tech/en/ai-consulting/", "/en/ai-consulting/", null, undefined, "es");
await check("Phoenix teléfono en inglés en ES: se queda y ofrece inglés", "America/Phoenix", "https://neuri.tech/sigue-disponible/", "/sigue-disponible/", null, "en-US", "en");
await check("Phoenix teléfono en español se queda sin barra", "America/Phoenix", "https://neuri.tech/sigue-disponible/", "/sigue-disponible/", null, "es-US", null);
await check("NY bazar ES (inglés): se queda y ofrece inglés", "America/New_York", "https://neuri.tech/bazar/", "/bazar/", null, "en-US", "en");
await check("Madrid se queda sin barra", "Europe/Madrid", "https://neuri.tech/en/marketing/", "/en/marketing/", null, undefined, null);
await check("Raíz no cambia", "America/Phoenix", "https://neuri.tech/", "/");
await check("?lang=es manda en US", "America/Phoenix", "https://neuri.tech/sigue-disponible/?lang=es", "/sigue-disponible/", null, "en-US");
await check("US elige «Seguir en español» y no vuelve a ver la barra", "America/Phoenix", "https://neuri.tech/sigue-disponible/", "/consultoria/", async (p) => {
  await p.evaluate(() => document.querySelector("#neuri-lang-sug button").click());
  await p.waitForTimeout(500);
  await p.goto("https://neuri.tech/consultoria/");
  await p.waitForTimeout(400);
}, "en-US", null);
await check("MX elige English y se queda", "America/Mexico_City", "https://neuri.tech/sigue-disponible/", "/en/still-available/", async (p) => {
  await p.evaluate(() => document.querySelector('a[hreflang="en"]').click());
  await p.waitForTimeout(600);
  await p.reload();
  await p.waitForTimeout(400);
});
await b.close();
process.exit(fail ? 1 : 0);
