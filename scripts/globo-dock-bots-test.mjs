/**
 * B-N2/B-A10: en la landing de bots, ya con la barra fija «Quiero mi asistente», el globo de ayuda
 * no le tapa el botón (a 390 y 360 px, ES y EN). Sirve el repo en local. Uso: node scripts/globo-dock-bots-test.mjs
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };
const server = createServer((req, res) => {
  let f = join(ROOT, normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!f.startsWith(ROOT) || !existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": TIPOS[extname(f)] || "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fallas = 0;
for (const ruta of ["/sigue-disponible/", "/en/still-available/"]) {
  for (const [w, h] of [[390, 844], [360, 740]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) =>
      r.request().url().endsWith("/api/vendedor/estado")
        ? r.fulfill({ status: 200, contentType: "application/json", body: '{"activo":true}' })
        : r.abort(),
    );
    await page.goto(base + ruta, { waitUntil: "load" });
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(900);
    const m = await page.evaluate(() => {
      const R = (e) => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width) }; };
      const btn = document.querySelector(".dock.show .btn");
      const launch = document.getElementById("neuri-vendedor")?.shadowRoot?.querySelector(".l");
      return { btn: btn && R(btn), launch: launch && R(launch) };
    });
    const ok = m.btn && m.launch && m.launch.w > 0 && (m.launch.b <= m.btn.t || m.launch.l >= m.btn.r);
    console.log(`${ok ? "OK" : "FALLA"} ${ruta} ${w} ${JSON.stringify(m)}`);
    if (!ok) fallas++;
    await ctx.close();
  }
}
await browser.close();
server.close();
process.exit(fallas ? 1 : 0);
