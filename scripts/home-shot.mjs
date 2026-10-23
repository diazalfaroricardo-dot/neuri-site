// Capturas de la portada (/ y /en/home/) a 390 y 1280 desde archivos locales → /tmp/home-*.png
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const server = createServer((req, res) => {
  let f = join(root, decodeURIComponent(req.url.split("?")[0]));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end();
  res.writeHead(200, { "content-type": { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript" }[extname(f)] || "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const [path, tag] of [["/?lang=es", "es"], ["/en/home/?lang=en", "en"]]) for (const w of [390, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  await p.goto(base + path, { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(800);
  await p.screenshot({ path: `/tmp/home-${tag}-${w}.png`, fullPage: true });
  await p.close();
}
await b.close(); server.close(); console.log("shots ok");
