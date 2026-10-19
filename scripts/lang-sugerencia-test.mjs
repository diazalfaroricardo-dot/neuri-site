/**
 * B-A6 (auditoría ojos nuevos bazar 18-oct): la portada no redirige por idioma, pero a un navegador en inglés
 * sin elección guardada le ofrece «View this page in English →» arriba; «Seguir en español» lo cierra y se recuerda.
 * En español no aparece. 390/1280, toques ≥44 px, sin scroll horizontal, axe AA 0.
 * Uso: node scripts/lang-sugerencia-test.mjs [--live]
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

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
const AXE = process.env.AXE || join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js");
const axeSrc = existsSync(AXE) ? readFileSync(AXE, "utf8") : "";
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0;
setTimeout(() => { console.error("✗ timeout 60 s"); process.exit(2); }, 60000).unref();
const bad = (m) => { console.error(`✗ ${m}`); fails++; };
const humano = () => Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false });
for (const w of [390, 1280]) {
  for (const loc of ["en-US", "es-MX"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, locale: loc, timezoneId: "America/Phoenix" });
    await ctx.addInitScript(humano);
    const p = await ctx.newPage();
    await p.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 15000 }); console.log(`· ${w} ${loc} cargó`);
    await p.waitForTimeout(300);
    const bar = p.locator("#neuri-lang-sug");
    const n = await bar.count();
    if (loc === "es-MX") { if (n) bad(`${w} es-MX: aparece la sugerencia de inglés`); await ctx.close(); continue; }
    if (n !== 1) { bad(`${w} en-US: no aparece «View this page in English»`); await ctx.close(); continue; }
    const href = await bar.locator("a").getAttribute("href");
    if (!/^\/en\/home\/\?lang=en$/.test(href)) bad(`${w}: link ${href}`);
    for (const el of await bar.locator("a,button").all()) {
      const b = await el.boundingBox();
      if (!b || b.height < 44) bad(`${w}: toque de ${b && b.height} px`);
    }
    if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) bad(`${w}: scroll horizontal`);
    if (axeSrc) {
      await p.addScriptTag({ content: axeSrc });
      const v = await p.evaluate(async () => (await axe.run("#neuri-lang-sug", { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => x.id));
      if (v.length) bad(`${w}: axe ${v.join(",")}`);
    }
    console.log(`· ${w} ${loc} barra ok`);
    await bar.locator("button").click({ timeout: 5000 });
    if (await bar.count()) bad(`${w}: «Seguir en español» no la cierra`);
    await p.reload({ waitUntil: "domcontentloaded" });
    await p.waitForTimeout(300);
    if (await p.locator("#neuri-lang-sug").count()) bad(`${w}: reaparece después de elegir español`);
    if (!/^\/$/.test(new URL(p.url()).pathname)) bad(`${w}: redirigió a ${p.url()}`);
    await ctx.close();
  }
}
await browser.close();
server.close();
if (!fails) console.log(`✓ sugerencia de idioma en la portada (${LIVE ? "en vivo" : "local"}) 390/1280 en-US/es-MX`);
process.exit(fails ? 1 : 0);
