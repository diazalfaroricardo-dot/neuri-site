/**
 * D-10 (Ricardo, 22-nov-2026): EE. UU. primero en lo común de neuri.tech.
 * Estático:
 *   - / es la portada en inglés (lang en, og:locale en_US, canonical /, hreflang en-US/es-US, x-default /);
 *   - /es/ es la portada en español (lang es, og:locale es_US, canonical /es/, mismo trío de hreflang);
 *   - /en/home/ y /en/ redirigen a / (no se rompe ninguna URL vieja);
 *   - nada de México, MXN, MX$, pesos, IVA, SAT, RFC, +52, CDMX ni es_MX en lo común que ve un visitante de EE. UU.
 *     (portadas, afiliados, novedades, ventures, 404, llms.txt). /legal/ y /en/legal/ quedan fuera hasta que el
 *     abogado apruebe docs/legal/tech/d10-eeuu-borrador.md.
 * Navegador (Accept-Language en-US, zona America/Phoenix, 390 y 1280): / sale en inglés y sin barra de español;
 *   con el teléfono en español (es-US) sale la barra «también habla español» que lleva a /es/.
 * Uso: node scripts/d10-eeuu-test.mjs
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const read = (f) => readFileSync(join(ROOT, f), "utf8");
let fails = 0;
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };

const TRIO = (h) => [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => `${m[1]}=${m[2]}`).join(" ");
const WANT = "en-US=https://neuri.tech/ es-US=https://neuri.tech/es/ x-default=https://neuri.tech/";
const en = read("index.html"), es = read("es/index.html");
ok(/<html lang="en"/.test(en), "/ en inglés");
ok(en.includes('<link rel="canonical" href="https://neuri.tech/">'), "/ canonical propio");
ok(en.includes('<meta property="og:locale" content="en_US">'), "/ og:locale en_US");
ok(TRIO(en) === WANT, `/ hreflang ${TRIO(en)}`);
ok(/<html lang="es"/.test(es), "/es/ en español");
ok(es.includes('<link rel="canonical" href="https://neuri.tech/es/">'), "/es/ canonical propio");
ok(es.includes('<meta property="og:locale" content="es_US">'), "/es/ og:locale es_US");
ok(TRIO(es) === WANT, `/es/ hreflang ${TRIO(es)}`);
for (const f of ["en/home/index.html", "en/index.html"]) {
  const h = read(f);
  ok(/http-equiv="refresh" content="0; url=\/"/.test(h) && h.includes('<link rel="canonical" href="https://neuri.tech/">'), `/${f.replace("index.html", "")} redirige a /`);
}

const MX = /M[eé]xic|\bMXN\b|MX\$|\bpesos?\b|PROFECO|\+52|CDMX|es_MX|es-MX/i;
const MX_SIGLAS = /\b(IVA|SAT|RFC|CFDI)\b/; // con mayúsculas: «class="sat"» no cuenta
// Los términos del programa de afiliados (sección #terminos/#terms) son contrato: el «US$25 / MX$500» espera al
// abogado (docs/legal/tech/d10-eeuu-borrador.md, punto 3).
const visible = (h) => h.replace(/<script(?![^>]*application\/(ld\+)?json)[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ")
  .replace(/<section class="s" id="(terminos|terms)"[\s\S]*?<\/section>/, " ");
for (const f of ["index.html", "es/index.html", "afiliados/index.html", "en/affiliates/index.html", "novedades/index.html", "en/whats-new/index.html", "ventures/index.html", "en/ventures/index.html", "404.html", "llms.txt"]) {
  const v = visible(read(f));
  const m = v.match(new RegExp(".{0,40}(" + MX.source + ").{0,40}", "i")) || v.match(new RegExp(".{0,40}" + MX_SIGLAS.source + ".{0,40}"));
  ok(!m, `${f}: sin México/MXN${m ? ` — «${m[0]}»` : ""}`);
}

// Navegador
const server = createServer((req, res) => {
  let f = normalize(join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) { res.writeHead(404); return res.end(); }
  const t = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" }[extname(f)] || "application/octet-stream";
  res.writeHead(200, { "content-type": t });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
// Visitante humano: navigator.webdriver en false para que lang.js ofrezca la barra.
const humano = () => Object.defineProperty(navigator, "webdriver", { get: () => false });
for (const w of [390, 1280]) {
  // es-US en la raíz ahora va a /es/ en la primera visita (copy-idioma-default, 23-nov; lo cubre copy-idioma-default-test).
  for (const loc of ["en-US"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, locale: loc, timezoneId: "America/Phoenix", extraHTTPHeaders: { "Accept-Language": loc + ",en;q=0.5" } });
    await ctx.addInitScript(humano);
    await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    const p = await ctx.newPage();
    await p.goto(base + "/", { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(400);
    ok(new URL(p.url()).pathname === "/", `${w} ${loc}: / no redirige`);
    ok((await p.getAttribute("html", "lang")) === "en", `${w} ${loc}: / en inglés`);
    const bar = p.locator("#neuri-lang-sug");
    if (loc === "en-US") ok((await bar.count()) === 0, `${w} en-US: sin barra de español`);
    else {
      ok((await bar.count()) === 1, `${w} es-US: barra «también habla español»`);
      const href = (await bar.count()) ? await bar.locator("a").getAttribute("href") : "";
      ok(/^\/es\/\?lang=es/.test(href || ""), `${w} es-US: la barra lleva a /es/ (${href})`);
    }
    ok(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)), `${w} ${loc}: sin scroll horizontal`);
    // Toggle ES del encabezado
    const tg = p.locator('header a[hreflang="es"]').first();
    ok((await tg.getAttribute("href")) === "/es/", `${w} ${loc}: toggle ES → /es/`);
    await ctx.close();
  }
}
await browser.close();
server.close();
console.log(fails ? `d10-eeuu: ${fails} falla(s)` : "d10-eeuu: OK");
process.exit(fails ? 1 : 0);
