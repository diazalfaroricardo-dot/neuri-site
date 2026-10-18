/**
 * B-A3: «Entrar» visible en el encabezado de neuri.tech (menú con las apps) y de las landings
 * de bazar ES/EN y consulting, a 390 y 1280 px; el menú abre con teclado, cabe en pantalla y
 * cada destino es el login correcto. Uso: node scripts/entrar-test.mjs [--live]
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const LIVE = process.argv.includes("--live");
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  let f = join(ROOT, p);
  if (!f.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": extname(f) === ".html" ? "text/html; charset=utf-8" : "application/octet-stream" });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = LIVE ? "https://neuri.tech" : `http://127.0.0.1:${server.address().port}`;
const CASES = [
  { path: "/", text: "Entrar", menu: true, hrefs: ["https://bazar.neuri.tech/login?lang=es", "https://consulting.neuri.tech/entrar?lang=es", "https://sd.neuri.tech/entrar?lang=es"] },
  { path: "/sigue-disponible/", text: "Entrar", hrefs: ["https://sd.neuri.tech/entrar?lang=es"] },
  { path: "/en/still-available/", text: "Sign in", hrefs: ["https://sd.neuri.tech/entrar?lang=en"] },
  { path: "/bazar/", text: "Entrar", hrefs: ["https://bazar.neuri.tech/login?lang=es"] },
  { path: "/en/", text: "Sign in", hrefs: ["https://bazar.neuri.tech/login?lang=en"] },
  { path: "/consultoria/", text: "Entrar", hrefs: ["https://consulting.neuri.tech/entrar?lang=es"] },
  { path: "/en/ai-consulting/", text: "Sign in", hrefs: ["https://consulting.neuri.tech/entrar?lang=en"] },
];
// axe-core del repo neuri-bazar (AXE=ruta opcional); sin él la prueba avisa y sigue.
const AXE = process.env.AXE || join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js");
const axeSrc = existsSync(AXE) ? readFileSync(AXE, "utf8") : "";
if (!axeSrc) console.log("aviso: sin axe-core, se omite axe");
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0;
const bad = (m) => { fails++; console.log("✗", m); };
for (const width of [390, 1280]) {
  for (const c of CASES) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.goto(base + c.path, { waitUntil: "domcontentloaded" });
    const el = page.locator("header [data-entrar]").first();
    if (!(await el.count())) { bad(`${c.path}@${width}: sin «Entrar» en el encabezado`); await page.close(); continue; }
    const target = c.menu ? el.locator("summary") : el;
    if (!(await target.isVisible())) bad(`${c.path}@${width}: «Entrar» no se ve`);
    const label = (await target.innerText()).trim();
    if (!label.startsWith(c.text)) bad(`${c.path}@${width}: dice «${label}»`);
    const box = await target.boundingBox();
    if (!box || box.height < 44) bad(`${c.path}@${width}: toque de ${box?.height}px`);
    if (c.menu) {
      await target.focus();
      await page.keyboard.press("Enter");
      const menu = el.locator('[role="menu"]');
      if (!(await menu.isVisible())) bad(`${c.path}@${width}: el menú no abre con Enter`);
      const mb = await menu.boundingBox();
      if (mb && (mb.x < 0 || mb.x + mb.width > width)) bad(`${c.path}@${width}: el menú se sale de la pantalla`);
    }
    const hrefs = await page.locator("header [data-entrar] a, header a[data-entrar]").evaluateAll((as) => as.map((a) => a.href));
    for (const h of c.hrefs) if (!hrefs.includes(h)) bad(`${c.path}@${width}: falta destino ${h}`);
    if (axeSrc) {
      await page.addScriptTag({ content: axeSrc });
      const v = await page.evaluate(async () => (await window.axe.run("header", { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => `${x.id} (${x.nodes.length})`));
      if (v.length) bad(`${c.path}@${width}: axe ${v.join(", ")}`);
    }
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > width) bad(`${c.path}@${width}: scroll horizontal ${sw}px`);
    await page.close();
  }
}
if (LIVE) {
  for (const u of ["https://bazar.neuri.tech/login?lang=es", "https://bazar.neuri.tech/login?lang=en", "https://consulting.neuri.tech/entrar?lang=es"]) {
    const r = await fetch(u);
    if (r.status !== 200) bad(`${u}: ${r.status}`);
  }
}
await browser.close();
server.close();
console.log(fails ? `${fails} fallas` : `entrar-test OK (${LIVE ? "en vivo" : "local"})`);
process.exit(fails ? 1 : 0);
