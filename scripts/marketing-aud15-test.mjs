/**
 * AUD15 (auditoría ojos nuevos, 2-nov): la landing de Marketing no brinca niveles de título (axe heading-order)
 * y a un navegador en inglés le ofrece «View this page in English →» sin redirigir (QA #8).
 * Sin elegir idioma, /en/marketing/ no muestra la barra. Uso: node scripts/marketing-aud15-test.mjs [--live]
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(`${process.env.PW_FROM || process.cwd()}/`);
const { chromium } = require("playwright-core");
const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LIVE = process.argv.includes("--live");
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let f = join(ROOT, p);
  if (!f.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": extname(f) === ".html" ? "text/html; charset=utf-8" : "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = LIVE ? "https://neuri.tech" : `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0;
const check = (ok, msg) => {
  console.log(`${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) fails++;
};
for (const w of [390, 1280]) {
  for (const [path, bar] of [["/marketing/", 1], ["/en/marketing/", 0]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, locale: "en-US" });
    await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
    const p = await ctx.newPage();
    await p.goto(`${base}${path}?v=${Date.now()}`, { waitUntil: "domcontentloaded" });
    const levels = await p.evaluate(() => [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1])));
    const jump = levels.findIndex((l, i) => i > 0 && l - levels[i - 1] > 1);
    check(jump === -1 && levels[0] === 1, `${path} ${w}: títulos sin brincos${jump === -1 ? "" : ` (h${levels[jump - 1]}→h${levels[jump]})`}`);
    await p.waitForTimeout(300);
    check((await p.locator("#neuri-lang-sug").count()) === bar, `${path} ${w}: barra de idioma con navegador en-US = ${bar}`);
    check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} ${w}: sin scroll horizontal`);
    await ctx.close();
  }
}
await browser.close();
server.close();
console.log(fails ? `✗ ${fails} fallas` : "✓ AUD15 OK");
process.exit(fails ? 1 : 0);
