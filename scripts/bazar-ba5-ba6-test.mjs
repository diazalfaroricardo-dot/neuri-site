// B-A5/B-A6 (bazar): a 390 y 1280 px el cambio de idioma se ve en el encabezado de la landing
// ES/EN, y el pie liga a los otros productos de Neuri con páginas que existen.
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
const req = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`);
const { chromium } = req("./index.js");
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const live = process.argv.includes("--live");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0;
const ok = (c, m) => { console.log(c ? "OK  " : "FAIL", m); if (!c) fail++; };
for (const [path, label, others] of [["/bazar/", "English", ["/consultoria/", "/marketing/", "/sigue-disponible/"]], ["/en/", "Español", ["/en/ai-consulting/", "/en/marketing/", "/en/still-available/"]]]) {
  for (const w of [390, 1280]) {
    const c = await b.newContext({ viewport: { width: w, height: 900 }, timezoneId: path === "/en/" ? "America/Phoenix" : "America/Mexico_City" });
    if (!live) await c.route("https://neuri.tech/**", (r) => {
      const p = new URL(r.request().url()).pathname;
      const f = root + p + (p.endsWith("/") ? "index.html" : "");
      if (!existsSync(f)) return r.fulfill({ status: 404, body: "" });
      const ct = f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : f.endsWith(".html") ? "text/html" : "application/octet-stream";
      r.fulfill({ status: 200, body: readFileSync(f), contentType: ct });
    });
    const p = await c.newPage();
    await p.goto("https://neuri.tech" + path, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(500);
    const hdr = p.locator("header a[data-idioma]").first();
    ok(await hdr.isVisible(), `${path} ${w}px «${label}» visible en el encabezado`);
    const box = await hdr.boundingBox();
    ok(box && box.height >= 44, `${path} ${w}px «${label}» de 44 px`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= w, `${path} ${w}px sin scroll horizontal (${sw})`);
    const hrefs = await p.$$eval("footer a", (as) => as.filter((a) => a.offsetParent).map((a) => a.getAttribute("href")));
    for (const o of others) ok(hrefs.includes(o) && (live || existsSync(root + o + "index.html")), `${path} ${w}px pie liga a ${o}`);
    await c.close();
  }
}
await b.close();
console.log(fail ? `${fail} fallas` : "todo OK");
process.exit(fail ? 1 : 0);
