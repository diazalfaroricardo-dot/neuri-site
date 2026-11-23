/**
 * copy-idioma-default (auditoría de copy, 23-nov-2026): neuri.tech abre en inglés (raíz = canonical y x-default);
 * el español vive en /es/. A quien llega a la raíz por primera vez con el navegador en español lo mandamos a /es/.
 * No redirige a buscadores/bots, ni con ?lang, ni si ya eligió idioma (neuri-lang), ni en la segunda visita,
 * ni si viene de otra página de neuri.tech. canonical y hreflang de la raíz no cambian.
 * Uso: node scripts/copy-idioma-default-test.mjs [--live]   (CHROME=/ruta/a/chrome)
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LIVE = process.argv.includes("--live");
const tipos = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let f = join(ROOT, p);
  if (!f.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": tipos[extname(f)] || "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = LIVE ? "https://neuri.tech" : `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
setTimeout(() => { console.error("✗ timeout 120 s"); process.exit(2); }, 120000).unref();
const PERSONA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const GOOGLEBOT = "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
let fallas = 0;
const ok = (c, m) => { console.log(`${c ? "OK  " : "FALLA"} ${m}`); if (!c) fallas++; };

async function visita({ locale, ua = PERSONA, guardado = null, ruta = "/", width = 1280, segunda = false }) {
  const ctx = await browser.newContext({ locale, userAgent: ua, viewport: { width, height: 844 } });
  // Una persona real: navigator.webdriver en false (Playwright lo pone en true).
  await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false }));
  if (guardado) await ctx.addInitScript((v) => { try { if (!localStorage.getItem("neuri-lang")) localStorage.setItem("neuri-lang", v); } catch (_) {} }, guardado);
  const p = await ctx.newPage();
  await p.goto(base + ruta, { waitUntil: "load" });
  await p.waitForTimeout(400);
  if (segunda) {
    await p.goto("about:blank");
    await p.goto(base + "/", { waitUntil: "load" });
    await p.waitForTimeout(400);
  }
  const r = { path: new URL(p.url()).pathname, lang: await p.evaluate(() => document.documentElement.lang) };
  await ctx.close();
  return r;
}

for (const width of [390, 1280]) {
  let r = await visita({ locale: "es-MX", width });
  ok(r.path === "/es/" && r.lang.startsWith("es"), `${width}: es-MX primera visita a / → /es/ (${r.path}, lang=${r.lang})`);
  r = await visita({ locale: "en-US", width });
  ok(r.path === "/" && r.lang.startsWith("en"), `${width}: en-US se queda en / en inglés (${r.path})`);
}
let r = await visita({ locale: "es-MX", guardado: "en" });
ok(r.path === "/", `es-MX que eligió inglés (neuri-lang=en) se queda en / (${r.path})`);
r = await visita({ locale: "es-MX", segunda: true });
ok(r.path === "/", `es-MX en su segunda visita a / ya no se redirige (${r.path})`);
r = await visita({ locale: "es-MX", ua: GOOGLEBOT });
ok(r.path === "/", `Googlebot con es-MX no se redirige (${r.path})`);
r = await visita({ locale: "es-MX", ruta: "/?lang=en" });
ok(r.path === "/", `es-MX con ?lang=en se queda en / (${r.path})`);
r = await visita({ locale: "es-MX", ruta: "/?utm_source=correo" });
ok(r.path === "/", `es-MX con un link armado por Neuri (utm) se queda en / (${r.path})`);
r = await visita({ locale: "es-MX", ruta: "/en/still-available/" });
ok(r.path === "/en/still-available/", `la regla solo aplica en la raíz (${r.path})`);

// canonical y hreflang intactos (la raíz sigue siendo inglés y x-default).
const ctx = await browser.newContext({ locale: "es-MX" });
const p = await ctx.newPage();
await p.goto(base + "/", { waitUntil: "load" });
const seo = await p.evaluate(() => ({
  canonical: document.querySelector('link[rel="canonical"]')?.href,
  x: document.querySelector('link[hreflang="x-default"]')?.href,
  es: document.querySelector('link[hreflang="es-US"]')?.href,
  path: location.pathname,
}));
ok(seo.path === "/", `navegador automatizado (webdriver) no se redirige (${seo.path})`);
ok(seo.canonical === "https://neuri.tech/" && seo.x === "https://neuri.tech/" && seo.es === "https://neuri.tech/es/", `canonical y hreflang de / intactos (${JSON.stringify(seo)})`);
await ctx.close();

await browser.close();
server.close();
console.log(fallas ? `${fallas} fallas` : "✓ idioma por navegador en la raíz, sin tocar SEO");
process.exit(fallas ? 1 : 0);
