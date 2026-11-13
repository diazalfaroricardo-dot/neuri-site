/**
 * 574 (aprobado 12-nov): la landing de bazar en el celular (390 px) trae encabezado fijo con logo,
 * «Entrar» y un menú (Funciones, Precios, Preguntas, Recorrido, idioma, «Entrar», prueba gratis) que abre
 * con clic y con teclado (Enter, Escape, aria-expanded/aria-controls), no tapa el botón principal ni el
 * globo de IA, sin scroll horizontal; el pie trae «Entrar». A 1280 el encabezado sigue igual (sin menú).
 * axe WCAG 2 A/AA de la página completa en 0 a 390 y 1280 (y con el menú abierto). ES y EN.
 * Uso: node scripts/bazar-574-menu-test.mjs [--live]
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
  const t = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" }[extname(f)] || "application/octet-stream";
  res.writeHead(200, { "content-type": t });
  createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = LIVE ? "https://neuri.tech" : `http://127.0.0.1:${server.address().port}`;
const CASES = [
  { path: "/bazar/", entrar: "Entrar", login: "https://bazar.neuri.tech/login?lang=es", idioma: ["English", "/en/bazar/"], items: ["Funciones", "Precios", "Preguntas frecuentes", "Recorrido"] },
  { path: "/en/bazar/", entrar: "Sign in", login: "https://bazar.neuri.tech/login?lang=en", idioma: ["Español", "/bazar/"], items: ["Features", "Pricing", "Common questions", "Tour"] },
];
const AXE = process.env.AXE || join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js");
const axeSrc = existsSync(AXE) ? readFileSync(AXE, "utf8") : "";
if (!axeSrc) console.log("aviso: sin axe-core, se omite axe");
const browser = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fails = 0;
const bad = (m) => { fails++; console.log("✗", m); };
const choca = (a, b) => a && b && a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const axe = async (page, ctx, label) => {
  if (!axeSrc) return;
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ content: axeSrc });
  const v = await page.evaluate(async (c) => (await window.axe.run(c || document, { runOnly: ["wcag2a", "wcag2aa"] })).violations.map((x) => `${x.id} (${x.nodes.length}: ${x.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")})`), ctx);
  if (v.length) bad(`${label}: axe ${v.join(", ")}`);
};
const sinScroll = async (page, w, label) => {
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  if (sw > w) bad(`${label}: scroll horizontal ${sw}px`);
};

for (const c of CASES) {
  // ---------- 390: encabezado fijo + menú ----------
  {
    const w = 390, L = `${c.path}@${w}`;
    const page = await browser.newPage({ viewport: { width: w, height: 844 }, reducedMotion: "reduce" });
    await page.goto(base + c.path + (LIVE ? `?v=${Date.now()}` : ""), { waitUntil: "load" });
    await page.waitForTimeout(600);
    const head = page.locator("header").first();
    const sum = head.locator("details[data-menu] > summary");
    // Arriba: el encabezado no tapa el botón principal del hero.
    const hb0 = await head.boundingBox();
    const cta = await page.locator(".hx-btn.pri").first().boundingBox();
    if (choca(hb0, cta)) bad(`${L}: el encabezado tapa el botón principal`);
    await axe(page, null, `${L} página`);
    await sinScroll(page, w, L);
    // Bajando hasta Precios el encabezado sigue arriba, con logo, «Entrar» y menú.
    await page.evaluate(() => { const s = document.getElementById("precios"); scrollTo(0, scrollY + s.getBoundingClientRect().top + 400); });
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => {
      const h = document.querySelector("header"), r = h.getBoundingClientRect(), logo = h.querySelector("a").getBoundingClientRect();
      const e = h.querySelector("a[data-entrar]"), er = e.getBoundingClientRect();
      return { y: scrollY, top: r.top, bottom: r.bottom, logo: logo.top >= 0 && logo.bottom <= r.bottom + 1 && logo.width > 0, entrar: getComputedStyle(e).display !== "none" && er.width > 0 && er.top >= 0 && er.bottom <= innerHeight };
    });
    if (st.y < 3000) bad(`${L}: no bajó lo suficiente (${st.y})`);
    if (st.top !== 0 || st.bottom < 44 || st.bottom > 80) bad(`${L}: tras bajar el encabezado no queda fijo arriba (top ${st.top}, bottom ${st.bottom})`);
    if (!st.logo) bad(`${L}: tras bajar no se ve el logo`);
    if (!st.entrar) bad(`${L}: tras bajar no se ve «${c.entrar}»`);
    const hayMenu = (await sum.count()) && (await sum.isVisible());
    if (!hayMenu) bad(`${L}: sin botón de menú visible en el encabezado`);
    if (hayMenu) {
      const sb = await sum.boundingBox();
      if (sb.width < 44 || sb.height < 44) bad(`${L}: botón de menú de ${Math.round(sb.width)}x${Math.round(sb.height)}px`);
      if ((await sum.getAttribute("aria-expanded")) !== "false") bad(`${L}: aria-expanded cerrado ≠ false`);
      const ctl = await sum.getAttribute("aria-controls");
      const panel = page.locator(`#${ctl}`);
      if (!ctl || !(await panel.count())) bad(`${L}: aria-controls no apunta al panel`);
      if (!(await sum.getAttribute("aria-label"))) bad(`${L}: el botón de menú no tiene nombre`);
      // Clic: abre.
      await sum.click();
      await page.waitForTimeout(150);
      if (!(await panel.isVisible())) bad(`${L}: el menú no abre con clic`);
      if ((await sum.getAttribute("aria-expanded")) !== "true") bad(`${L}: aria-expanded abierto ≠ true`);
      const links = await panel.locator("a").evaluateAll((as) => as.map((a) => ({ t: a.textContent.replace(/\s+/g, " ").trim(), h: a.getAttribute("href"), e: a.hasAttribute("data-entrar"), hh: Math.round(a.getBoundingClientRect().height), lang: a.getAttribute("lang") })));
      for (const it of c.items) if (!links.some((l) => l.t.startsWith(it))) bad(`${L}: el menú no trae «${it}»`);
      if (!links.some((l) => l.e && l.t === c.entrar && l.h === c.login)) bad(`${L}: el menú no trae «${c.entrar}» al login`);
      if (!links.some((l) => l.t === c.idioma[0] && l.h === c.idioma[1] && l.lang)) bad(`${L}: el menú no trae «${c.idioma[0]}»`);
      if (!links.some((l) => l.h === "#precios") || !links.some((l) => l.h === "#funciones")) bad(`${L}: Precios/Funciones no van a sus secciones`);
      for (const l of links) if (l.hh < 44) bad(`${L}: «${l.t}» de ${l.hh}px`);
      const pb = await panel.boundingBox();
      if (pb.x < 0 || pb.x + pb.width > w || pb.y + pb.height > 844) bad(`${L}: el menú se sale de la pantalla`);
      const globo = await page.evaluate(() => { const l = document.getElementById("neuri-vendedor")?.shadowRoot?.querySelector(".l"); if (!l || getComputedStyle(l).visibility === "hidden") return null; const r = l.getBoundingClientRect(); return r.width ? { x: r.x, y: r.y, width: r.width, height: r.height } : null; });
      if (choca(pb, globo) || choca(await head.boundingBox(), globo)) bad(`${L}: el menú o el encabezado tapan el globo de IA`);
      await sinScroll(page, w, `${L} menú abierto`);
      await axe(page, "header", `${L} menú abierto`);
      // Escape cierra y regresa el foco al botón.
      await panel.locator("a").first().focus();
      await page.keyboard.press("Escape");
      await page.waitForTimeout(100);
      if (await panel.isVisible()) bad(`${L}: Escape no cierra el menú`);
      else if (!(await sum.evaluate((s) => s === document.activeElement))) bad(`${L}: tras Escape el foco no regresa al botón de menú`);
      if ((await sum.getAttribute("aria-expanded")) !== "false") bad(`${L}: aria-expanded no regresa a false`);
      // Teclado: Enter abre, el foco se ve, Tab entra al menú.
      await sum.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);
      if (!(await panel.isVisible())) bad(`${L}: el menú no abre con Enter`);
      const ring = await sum.evaluate((s) => { const cs = getComputedStyle(s); return s.matches(":focus-visible") && cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2; });
      if (!ring) bad(`${L}: el botón de menú no muestra el foco`);
      await page.keyboard.press("Tab");
      if (!(await page.evaluate((id) => document.getElementById(id).contains(document.activeElement), ctl))) bad(`${L}: Tab no entra al menú`);
      await page.keyboard.press("Escape");
      // Tocar fuera cierra; elegir Precios cierra y deja la sección a la vista, no debajo del encabezado.
      await sum.click();
      await page.mouse.click(200, 700);
      await page.waitForTimeout(100);
      if (await panel.isVisible()) bad(`${L}: tocar fuera no cierra el menú`);
      await sum.click();
      await panel.locator('a[href="#precios"]').click();
      await page.waitForTimeout(700);
      if (await panel.isVisible()) bad(`${L}: elegir Precios no cierra el menú`);
      const tp = await page.evaluate(() => { const s = document.getElementById("precios"); const h = s.querySelector("h2") || s; return { t: h.getBoundingClientRect().top, hb: document.querySelector("header").getBoundingClientRect().bottom }; });
      if (tp.t < tp.hb - 1 || tp.t > 400) bad(`${L}: tras ir a Precios el título queda en ${Math.round(tp.t)}px (encabezado hasta ${Math.round(tp.hb)}px)`);
    }
    // Pie con «Entrar».
    const pie = page.locator("footer a[data-entrar]").first();
    if (!(await pie.count())) bad(`${L}: el pie no trae «${c.entrar}»`);
    else {
      await pie.scrollIntoViewIfNeeded();
      const t = (await pie.innerText()).trim(), h = await pie.getAttribute("href"), b = await pie.boundingBox();
      if (t !== c.entrar || h !== c.login) bad(`${L}: pie dice «${t}» → ${h}`);
      if (!(await pie.isVisible()) || b.height < 44) bad(`${L}: «${c.entrar}» del pie no se ve o mide ${b?.height}px`);
    }
    await page.close();
  }
  // ---------- 1280: el encabezado de computadora no cambia ----------
  {
    const w = 1280, L = `${c.path}@${w}`;
    const page = await browser.newPage({ viewport: { width: w, height: 800 }, reducedMotion: "reduce" });
    await page.goto(base + c.path + (LIVE ? `?v=${Date.now()}` : ""), { waitUntil: "load" });
    await page.waitForTimeout(400);
    const d = await page.evaluate(() => {
      const h = document.querySelector("header"), m = h.querySelector("details[data-menu]");
      const vis = [...h.querySelectorAll("nav > a")].filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.getAttribute("href"));
      return { pos: getComputedStyle(h).position, menu: m ? getComputedStyle(m).display : "none", vis };
    });
    if (d.pos === "fixed" || d.pos === "sticky") bad(`${L}: el encabezado de computadora quedó ${d.pos}`);
    if (d.menu !== "none") bad(`${L}: el botón de menú se ve en computadora`);
    for (const h of ["#funciones", "#precios"]) if (!d.vis.includes(h)) bad(`${L}: falta ${h} en el encabezado`);
    if (!(await page.locator("footer a[data-entrar]").first().isVisible())) bad(`${L}: el pie no trae «${c.entrar}»`);
    await axe(page, null, `${L} página`);
    await sinScroll(page, w, L);
    await page.close();
  }
}
await browser.close();
server.close();
console.log(fails ? `${fails} fallas` : `bazar-574-menu OK (${LIVE ? "en vivo" : "local"})`);
process.exit(fails ? 1 : 0);
