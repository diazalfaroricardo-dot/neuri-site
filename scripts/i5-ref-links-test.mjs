/**
 * I5: neuri.tech/?ref=X lleva el ref en la URL al pasar a otra página o a una app, sin cookies ni
 * almacenamiento. Uso: node scripts/i5-ref-links-test.mjs [--vivo]
 * (CHROME=/ruta/chrome). Sin --vivo sirve el repo en local.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = await import("playwright-core")); }
const ROOT = resolve(new URL("..", import.meta.url).pathname);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };
const vivo = process.argv.includes("--vivo");
let base = "https://neuri.tech";
let srv;
if (!vivo) {
  srv = createServer((q, s) => {
    let f = join(ROOT, decodeURIComponent(new URL(q.url, "http://x").pathname));
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
    if (!existsSync(f)) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
    createReadStream(f).pipe(s);
  }).listen(0);
  base = `http://localhost:${srv.address().port}`;
}
const b = await chromium.launch({ executablePath: process.env.CHROME || undefined });
let bad = 0;
const check = (ok, m) => { console.log(`${ok ? "ok " : "MAL"} ${m}`); if (!ok) bad++; };
const ctx = await b.newContext();
// Se corta toda salida: no se navega ni se da de alta a nada de verdad.
const clickHref = async (path, selector) => {
  const page = await ctx.newPage();
  await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("load");
  const href = await page.evaluate((sel) => {
    const a = [...document.querySelectorAll(sel)][0];
    if (!a) return null;
    a.addEventListener("click", (e) => e.preventDefault());
    a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    return a.href;
  }, selector);
  const guardado = await page.evaluate(() => {
    try { return JSON.stringify([{ ...localStorage }, { ...sessionStorage }, document.cookie]); } catch { return document.cookie; }
  });
  await page.close();
  return { href, guardado };
};
for (const [path, sel, want] of [
  ["/?ref=TEST", 'a[href*="/bazar"]', "/bazar"],
  ["/?ref=TEST", 'a[href*="bazar.neuri.tech"]', "bazar.neuri.tech"],
  ["/bazar/?ref=TEST", "a[data-trial]", "bazar.neuri.tech"],
  ["/en/bazar/?ref=TEST", "a[data-trial]", "bazar.neuri.tech"],
  ["/marketing/?ref=TEST", 'a[href*="marketing.neuri.tech/empezar"]', "marketing.neuri.tech"],
]) {
  const r = await clickHref(path, sel);
  check(r.href && r.href.includes(want) && /[?&]ref=test\b/.test(r.href), `${path} ${sel} → ${r.href}`);
  check(!/test/i.test(r.guardado), `${path} el ref no se guarda en cookies ni almacenamiento`);
}
const sin = await clickHref("/bazar/", "a[data-trial]");
check(sin.href && !sin.href.includes("ref="), "sin ?ref no se agrega nada");
const raro = await clickHref("/bazar/?ref=%3Cx%3E", "a[data-trial]");
check(raro.href && !raro.href.includes("ref="), "ref inválido no viaja");
await b.close();
srv?.close();
if (bad) { console.error(`${bad} fallas`); process.exit(1); }
console.log("I5 ref OK");
