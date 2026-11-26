/**
 * premium-arreglo-tech-1126 — zona segura del globo «¿Te ayudo a elegir?» (assets/vendedor.js), una sola regla
 * para todas las landings: no aparece sobre el hero, sube por encima de las barras fijas de abajo y se esconde
 * mientras quedaría encima de texto, enlaces, botones, deslizadores o tarjetas. Sirve el repo en local y recorre
 * cada página a 390 y 1280: en cada parada donde el globo se ve, nada de eso puede quedar debajo.
 * Uso: node scripts/zona-segura-globo-test.mjs   (CHROME=ruta del navegador)
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const f = [];
// Estático: las otras tres piezas del item.
const hola = readFileSync(join(ROOT, "assets/hola.js"), "utf8");
if (!/destination-out/.test(hola) || !/function zonas\(\)/.test(hola)) f.push("hola.js: falta el velo detrás del texto del cierre");
const dia = readFileSync(join(ROOT, "assets/dia.js"), "utf8");
const hold = +(dia.match(/var HOLD = ([\d.]+)/) || [])[1];
if (!(hold >= 0.85)) f.push(`dia.js: HOLD ${hold} deja demasiada pantalla vacía entre capítulos`);
for (const p of ["ventures/index.html", "en/ventures/index.html"]) {
  const s = readFileSync(join(ROOT, p), "utf8");
  if (/\.tag\{font:500 \.7rem/.test(s) || /font-size:\.7rem/.test(s)) f.push(`${p}: etiquetas < 12 px`);
  if (!/\.tile small\{[^}]*font-size:12px/.test(s)) f.push(`${p}: precios de la maqueta < 12 px`);
  if (!/@media\(max-width:600px\)\{\.hero\{padding-top:\d+px\}\.orbit\{/.test(s)) f.push(`${p}: la órbita sigue detrás del titular en celular`);
}

const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let p = join(ROOT, normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
  if (!p.startsWith(ROOT) || !existsSync(p)) {
    res.writeHead(404, { "content-type": TIPOS[".html"] });
    return createReadStream(join(ROOT, "404.html")).pipe(res);
  }
  res.writeHead(200, { "content-type": TIPOS[extname(p)] || "application/octet-stream" });
  createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });

const PAGINAS = ["/es/", "/bazar/", "/en/bazar/", "/sigue-disponible/", "/en/still-available/", "/marketing/", "/no-existe-zona-segura/"];
for (const ruta of PAGINAS)
  for (const [w, h] of [[390, 844], [1280, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) =>
      r.request().url().endsWith("/api/vendedor/estado")
        ? r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"activo":true}' })
        : r.abort(),
    );
    await page.goto(base + ruta, { waitUntil: "load" });
    await page.waitForTimeout(900);
    const largo = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const estado = () =>
      page.evaluate(() => {
        const l = document.getElementById("neuri-vendedor")?.shadowRoot?.querySelector(".l");
        if (!l) return { sin: true };
        if (getComputedStyle(l).visibility !== "visible") return { v: false };
        const R = l.getBoundingClientRect();
        const m = 2;
        const cruza = (r) => r.width && r.height && R.left - m < r.right && R.right + m > r.left && R.top - m < r.bottom && R.bottom + m > r.top;
        const vivo = (e) => {
          for (let x = e; x && x !== document.body; x = x.parentElement) {
            const cs = getComputedStyle(x);
            if (cs.visibility === "hidden" || cs.opacity === "0" || cs.display === "none") return false;
          }
          return true;
        };
        const malo = [];
        // Texto visible (renglón por renglón).
        const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          if (!n.data.trim() || !n.parentElement || n.parentElement.closest("#neuri-vendedor,script,style")) continue;
          const rg = document.createRange();
          rg.selectNodeContents(n);
          if ([...rg.getClientRects()].some(cruza) && vivo(n.parentElement)) malo.push(`texto «${n.data.trim().slice(0, 24)}»`);
        }
        // Controles y barras fijas.
        for (const e of document.querySelectorAll('a,button,input,select,textarea,[role="slider"],.sticky,.dock.show,.cta-fijo')) {
          if (e.closest("#neuri-vendedor") || !vivo(e)) continue;
          if (cruza(e.getBoundingClientRect())) malo.push(`${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]}`);
        }
        return { v: true, malo: [...new Set(malo)].slice(0, 3) };
      });
    const e0 = await estado();
    if (e0.sin) {
      f.push(`${ruta} ${w}: no montó el globo`);
      await ctx.close();
      continue;
    }
    if (largo > h * 0.75 && e0.v) f.push(`${ruta} ${w}: el globo se ve sobre el hero al cargar`);
    let vistos = 0;
    const paso = Math.max(240, Math.floor(largo / 16));
    for (let y = 0; y <= largo + paso; y += paso) {
      await page.evaluate((y) => scrollTo(0, y), Math.min(y, largo));
      await page.waitForTimeout(650);
      const e = await estado();
      if (!e.v) continue;
      vistos++;
      if (e.malo.length) f.push(`${ruta} ${w} y=${Math.min(y, largo)}: el globo pisa ${e.malo.join(", ")}`);
    }
    if (largo > h * 3 && !vistos) f.push(`${ruta} ${w}: el globo nunca aparece`);
    console.log(`${ruta} ${w}: visible en ${vistos} paradas`);
    await ctx.close();
  }
await browser.close();
server.close();
if (f.length) {
  console.error("✗ zona-segura-globo:\n  " + f.join("\n  "));
  process.exit(1);
}
console.log("✓ zona-segura-globo: sin globo sobre el hero, ni sobre texto, controles o barras fijas (7 páginas × 390/1280)");
