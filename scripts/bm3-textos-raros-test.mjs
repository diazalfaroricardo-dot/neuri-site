// B-M3 (media, neuri.tech): textos largos, acentos, ñ, emojis y apóstrofos no rompen las landings.
// En cada campo de texto visible (lista de espera, alta, calculadoras, vendedor de IA) escribe
// `Café Ñandú's 🌮 “Doña” <b>…` + una palabra larguísima y revisa, a 390 y 1280:
// el valor se queda íntegro, no aparece HTML inyectado, no hay scroll horizontal ni errores de JS.
// Nada se envía: toda petición que no sea GET se aborta.
// Uso: node scripts/bm3-textos-raros-test.mjs [--live]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const root = new URL("..", import.meta.url).pathname;
const live = process.argv.includes("--live");
const PAGES = ["/", "/en/home/", "/bazar/", "/en/", "/sigue-disponible/", "/en/still-available/", "/consultoria/", "/en/ai-consulting/", "/marketing/", "/en/marketing/"];
const RARO = "Café Ñandú's 🌮 “Doña” <b id=bm3x>x</b> " + "Supercalifragilísticoespialidoso".repeat(4);
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain" };

let base = "https://neuri.tech", server;
if (!live) {
  server = createServer((req, res) => {
    let p = join(root, decodeURIComponent(req.url.split("?")[0]));
    if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
    if (!existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" });
    res.end(readFileSync(p));
  }).listen(0);
  base = `http://localhost:${server.address().port}`;
}
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0, campos = 0, vistas = 0;
for (const w of [390, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
  await ctx.route((u) => true, (r) => (r.request().method() === "GET" ? r.fallback() : r.abort()));
  for (const path of PAGES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    try {
      await page.goto(base + path, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(800);
      const loc = page.locator("input:is([type=text],[type=search],:not([type])), textarea");
      const total = await loc.count();
      let llenos = 0;
      for (let i = 0; i < total; i++) {
        const el = loc.nth(i);
        if (!(await el.isVisible()) || !(await el.isEditable())) continue;
        await el.fill(RARO, { timeout: 3000 });
        await el.dispatchEvent("change");
        const v = await el.inputValue();
        const max = await el.getAttribute("maxlength");
        const esperado = max ? RARO.slice(0, Number(max)) : RARO;
        if (v !== esperado) { fail++; console.error(`✗ ${path} @${w}: campo ${i} cambió el texto («${v.slice(0, 40)}…»)`); }
        llenos++;
      }
      await page.waitForTimeout(300);
      const r = await page.evaluate(() => ({
        inyectado: !!document.getElementById("bm3x"),
        scroll: document.documentElement.scrollWidth > innerWidth + 1,
      }));
      const bad = [];
      if (errs.length) bad.push(`error JS: ${errs[0]}`);
      if (r.inyectado) bad.push("HTML inyectado en la página");
      if (r.scroll) bad.push("scroll horizontal con texto largo");
      if (bad.length) { fail++; console.error(`✗ ${path} @${w} (${llenos} campos): ${bad.join(" · ")}`); }
      campos += llenos; vistas++; console.log(`· ${path} @${w}: ${llenos} campos`);
    } catch (e) { fail++; console.error(`✗ ${path} @${w}: ${e.message}`); }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server?.close();
if (!fail) console.log(`✓ B-M3: ${vistas} vistas, ${campos} campos con ñ/acentos/emoji/apóstrofos/«<b>»/palabra larga: texto íntegro, sin HTML inyectado ni scroll horizontal${live ? " (en vivo)" : ""}`);
process.exit(fail ? 1 : 0);
