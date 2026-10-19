/**
 * Capturas de marca: sirve el sitio en proceso y toma captura de CADA .html del sitio
 * a 390 y 1280 px, en modo claro y oscuro (prefers-color-scheme). Reporta scroll horizontal,
 * errores de consola y recursos 4xx del propio sitio.
 *
 * Uso: SHOTS=/tmp/capturas node scripts/brand-shots.mjs [filtro]
 *      FULL=1 para captura de página completa (por defecto, solo la primera pantalla).
 */
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";
import { allPages } from "./brand-pages.mjs";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const OUT = resolve(process.env.SHOTS || "/tmp/brand-shots");
mkdirSync(OUT, { recursive: true });

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".json": "application/json" };
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let f = join(ROOT, p);
  if (!f.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const local = ["/opt/pw-browsers/chromium", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((x) => existsSync(x));
const browser = await chromium.launch({ executablePath: process.env.CHROME || local });
const filter = process.argv[2] || "";
const problems = [];
for (const path of allPages(ROOT).filter((p) => p.includes(filter))) {
  const name = path.replace(/^\/|\/$/g, "").replace(/\//g, "_").replace(/\.html$/, "") || "home";
  for (const scheme of ["light", "dark"]) {
    for (const width of [390, 1280]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
      const p = await ctx.newPage();
      const errs = [];
      await p.route(/^https:\/\/(consulting|sd|bazar|marketing)\.neuri\.tech\//, (route) =>
        route.fulfill({ status: 503, headers: { "access-control-allow-origin": base, "access-control-allow-credentials": "true" }, contentType: "application/json", body: "{}" }),
      );
      p.on("console", (m) => {
        const u = m.location().url || "";
        if (m.type() === "error" && (!u || u.startsWith(base))) errs.push(m.text());
      });
      p.on("pageerror", (e) => errs.push(e.message));
      p.on("response", (x) => {
        if (x.status() >= 400 && x.url().startsWith(base)) errs.push(`${x.status()} ${new URL(x.url()).pathname}`);
      });
      await p.goto(base + path, { waitUntil: "load" });
      await p.waitForTimeout(400);
      await p.screenshot({ path: join(OUT, `${name}-${width}-${scheme}.png`), fullPage: !!process.env.FULL });
      const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const tag = `${path}@${width}/${scheme}`;
      if (over > 0) problems.push(`${tag}: scroll horizontal +${over}px`);
      for (const e of errs) problems.push(`${tag}: ${e}`);
      await ctx.close();
    }
  }
}
await browser.close();
server.close();
console.log(problems.length ? problems.join("\n") : "brand-shots OK");
process.exit(problems.length ? 1 : 0);
