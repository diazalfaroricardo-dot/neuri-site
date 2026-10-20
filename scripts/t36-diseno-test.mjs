/**
 * T36 (19-oct, reporte de Ricardo): candado de diseño en neuri.tech.
 *  1. Los menús «EN ▾» / «Entrar ▾» siguen abiertos 3 s después de tocarlos (antes el render
 *     de la portada —reloj cada 1 s— borraba el atributo open y el menú «desaparecía»).
 *  2. La palabra con degradado del titular («contesta», «aparta»…) no sale mocha: su última
 *     letra cabe dentro de su caja.
 *  3. Ninguna página tiene scroll lateral a 360/390/1280 px (cabecera desalineada al entrar).
 *  4. Los menús de las páginas secundarias se ven como el de la portada (sin mayúsculas mono).
 *  5. «Entrar»/«EN» quedan en el renglón del logo de 360 a 1920 px (antes, en Chrome de escritorio
 *     a 1024/1536/1920, «Entrar» bajaba a un segundo renglón a la izquierda).
 * Uso: node scripts/t36-diseno-test.mjs [--live]   (CHROME=/ruta/a/chrome si no es Mac)
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LIVE = process.argv.includes("--live");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let f = join(ROOT, p);
  if (!f.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = LIVE ? "https://neuri.tech" : `http://127.0.0.1:${server.address().port}`;

const PAGES = ["/", "/en/home/", "/sigue-disponible/", "/en/still-available/", "/bazar/", "/en/", "/consultoria/", "/en/ai-consulting/", "/marketing/", "/en/marketing/", "/legal/", "/novedades/"];
const MENUS = ["/", "/en/home/", "/legal/", "/novedades/"];
const fails = [];
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });

for (const width of [360, 390, 1024, 1280, 1440, 1536, 1920]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, locale: "es-MX", timezoneId: "America/Phoenix" });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    await page.goto(base + path, { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    if (sw > cw) fails.push(`${width}px ${path}: scroll lateral (${sw} > ${cw})`);

    if (!MENUS.includes(path)) continue;
    const summaries = page.locator("header details > summary, nav details > summary").filter({ visible: true });
    const n = await summaries.count();
    if (!n) fails.push(`${width}px ${path}: no hay menú visible en la cabecera`);
    for (let i = 0; i < n; i++) {
      const s = summaries.nth(i);
      await s.click();
      await page.waitForTimeout(3000);
      const open = await s.evaluate((el) => el.parentElement.open);
      if (!open) { fails.push(`${width}px ${path}: el menú ${i + 1} se cerró solo`); continue; }
      const look = await s.evaluate((el) => {
        const a = el.parentElement.querySelector("[role=menu] a");
        const r = el.parentElement.querySelector("[role=menu]").getBoundingClientRect();
        const cs = getComputedStyle(a);
        const logo = document.querySelector('header a[href="#inicio"], header a[href="/"], header .logo, .nb-logo');
        const sb = el.getBoundingClientRect(), lb = logo ? logo.getBoundingClientRect() : sb;
        return { tt: cs.textTransform, left: r.left, right: r.right, vw: document.documentElement.clientWidth, dy: Math.abs((sb.top + sb.bottom) / 2 - (lb.top + lb.bottom) / 2) };
      });
      if (look.tt === "uppercase") fails.push(`${width}px ${path}: menú ${i + 1} con estilo de enlace mono en mayúsculas`);
      if (look.dy > 12) fails.push(`${width}px ${path}: «${(await s.textContent()).trim()}» no está en el mismo renglón que el logo (${look.dy.toFixed(0)} px)`);
      if (look.left < 0 || look.right > look.vw + 1) fails.push(`${width}px ${path}: menú ${i + 1} se sale de la pantalla`);
      await s.click();
    }
  }
  await ctx.close();
}

// 2. Ninguna palabra del titular sale mocha: la caja del span cubre toda la tinta del texto.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base + "/", { waitUntil: "load" });
  const seen = new Set();
  for (let t = 0; t < 14 && seen.size < 5; t++) {
    await page.waitForTimeout(1100);
    const r = await page.evaluate(() => {
      const el = document.querySelector("#x-h1 .x-wa, #x-h1 .x-wb");
      if (!el) return null;
      const box = el.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(el);
      const rects = [...range.getClientRects()];
      const inkRight = Math.max(...rects.map((x) => x.right));
      // la tinta de la última letra se extiende ~.06em más allá del avance (letter-spacing -.06em)
      const em = parseFloat(getComputedStyle(el).fontSize);
      return { word: el.textContent.trim(), room: box.right - (inkRight + 0.06 * em) };
    });
    if (!r || seen.has(r.word)) continue;
    seen.add(r.word);
    if (r.room < 0) fails.push(`titular: «${r.word}» queda mocha (${r.room.toFixed(1)} px)`);
  }
  if (seen.size < 3) fails.push(`titular: solo vi ${seen.size} palabras rotando`);
}

await browser.close();
server.close();
if (fails.length) { console.error("T36 FALLA\n- " + fails.join("\n- ")); process.exit(1); }
console.log(`T36 OK (${LIVE ? "en vivo" : "local"}): menús abiertos, titular completo, sin scroll lateral en ${PAGES.length} páginas × 7 anchos`);
