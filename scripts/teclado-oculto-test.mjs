// Con Tab, el foco nunca cae en algo que no se ve (un menú cerrado con opacity:0, por ejemplo): la persona con teclado
// se queda sin saber dónde está y el lector de pantalla lee un menú cerrado.
// Uso: node scripts/teclado-oculto-test.mjs [--live]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const root = new URL("..", import.meta.url).pathname;
const live = process.argv.includes("--live");
const PAGES = [
  "/", "/en/home/", "/bazar/", "/en/bazar/", "/marketing/", "/en/marketing/", "/consultoria/", "/en/ai-consulting/",
  "/sigue-disponible/", "/en/still-available/", "/sigue-disponible/citas/", "/sigue-disponible/comida/",
  "/sigue-disponible/creadores/", "/en/still-available/appointments/", "/en/still-available/food/",
  "/en/still-available/creators/", "/legal/", "/en/legal/", "/novedades/",
];
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
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
const proxy = process.env.HTTPS_PROXY && live ? { proxy: { server: process.env.HTTPS_PROXY } } : {};
const browser = await chromium.launch({ ...proxy, executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0, paradas = 0;
for (const path of PAGES) {
  for (const width of [390, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 }, ignoreHTTPSErrors: !!proxy.proxy });
    await ctx.route("**/*", (r) => (/^(GET|HEAD)$/.test(r.request().method()) ? r.continue() : r.abort()));
    const page = await ctx.newPage();
    const res = await page.goto(base + path, { waitUntil: "load", timeout: 30000 }).catch(() => null);
    if (!res || res.status() !== 200) { console.log(`✗ ${path}: ${res?.status() ?? "sin respuesta"}`); fail++; await ctx.close(); continue; }
    await page.waitForTimeout(150);
    const malos = new Set();
    for (let i = 0; i < 45; i++) {
      await page.keyboard.press("Tab");
      const r = await page.evaluate(() => {
        let a = document.activeElement;
        while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
        if (!a || a === document.body) return null;
        let oculto = false;
        for (let n = a; n; n = n.parentElement ?? n.getRootNode().host) {
          const cs = getComputedStyle(n);
          if (cs.opacity === "0" && cs.pointerEvents === "none") oculto = true;
          if (cs.visibility === "hidden") oculto = true;
        }
        return { oculto, t: (a.innerText || a.getAttribute("aria-label") || a.tagName).trim().replace(/\s+/g, " ").slice(0, 40) };
      });
      if (!r) break;
      paradas++;
      if (r.oculto) malos.add(r.t);
    }
    if (malos.size) { fail++; console.log(`✗ ${path} a ${width}: foco en algo oculto: ${[...malos].join(" · ")}`); }
    await ctx.close();
  }
}
await browser.close();
server?.close();
console.log(fail ? `FALLA: ${fail}` : `OK: ${PAGES.length} páginas, ${paradas} paradas de Tab, ninguna en algo oculto`);
process.exit(fail ? 1 : 0);
