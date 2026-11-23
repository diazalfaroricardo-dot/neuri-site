// D-10 (22-nov, «EE. UU. primero») — neuri.bots visto por visitantes de EE. UU.:
//  - /bots/ lleva al inglés por omisión (es-US → español);
//  - /en/still-available/ (y sus subpáginas) sin México, MXN ni pesos visibles;
//  - /sigue-disponible/ y subpáginas en USD para todos salvo ?moneda=mxn o zona horaria de México;
//  - la barra de idioma ofrece inglés a cualquier navegador que no esté en español (lang.js);
//  - 390 y 1280 sin scroll horizontal; axe AA 0 en lo tocado.
// Uso: node scripts/d10-eeuu-bots-test.mjs [base]   (base por defecto https://neuri.tech; no envía ningún alta)
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = req("playwright"));
} catch (_) {
  ({ chromium } = req("playwright-core"));
}
let axeSrc = "";
try {
  axeSrc = readFileSync(req.resolve("axe-core/axe.min.js"), "utf8");
} catch (_) {}
const BASE = (process.argv[2] || "https://neuri.tech").replace(/\/$/, "");
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const MX = /M[ée]xico|\bMXN\b|\bpesos?\b|\+52|CDMX|\bRFC\b|\bSAT\b/;
let fail = 0;
const bad = (m) => {
  fail++;
  console.error("✗", m);
};
const ok = (m) => console.log("✓", m);

async function page(w, locale, tz, { human = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, locale, timezoneId: tz });
  if (human) await ctx.addInitScript(() => Object.defineProperty(navigator, "webdriver", { get: () => false }));
  const p = await ctx.newPage();
  p._errs = [];
  p.on("pageerror", (e) => p._errs.push(e.message));
  return p;
}
const visible = (p) =>
  p.evaluate(() => {
    // Lo que se ve: sin <script>/<style>/<template> ni el pliegue del aviso legal.
    return document.body.innerText;
  });

async function axe(p, where) {
  if (!axeSrc) return;
  await p.addScriptTag({ content: axeSrc });
  const r = await p.evaluate(async () => {
    // biome-ignore lint: axe global
    const res = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa"] });
    return res.violations.map((v) => `${v.id}(${v.nodes.length})`);
  });
  if (r.length) bad(`${where}: axe AA ${r.join(", ")}`);
}

for (const w of [390, 1280]) {
  // 1) /bots/ → inglés para en-US; español para es-US.
  for (const [loc, want] of [
    ["en-US", "/en/still-available/"],
    ["es-US", "/sigue-disponible/"],
  ]) {
    const p = await page(w, loc, "America/Phoenix");
    await p.goto(`${BASE}/bots/`, { waitUntil: "domcontentloaded" });
    await p.waitForURL(`**${want}*`, { timeout: 15000 }).catch(() => {});
    const path = new URL(p.url()).pathname;
    path === want ? ok(`${w} /bots/ ${loc} → ${path}`) : bad(`${w} /bots/ ${loc} → ${path} (esperado ${want})`);
    await p.context().close();
  }

  // 2) Páginas en inglés: nada de México.
  for (const path of ["/en/still-available/", "/en/still-available/appointments/", "/en/still-available/vs-manychat/"]) {
    const p = await page(w, "en-US", "America/Chicago");
    await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    const t = await visible(p);
    const m = t.match(MX);
    m ? bad(`${w} ${path}: dice «${m[0]}»`) : ok(`${w} ${path}: sin México/MXN`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    if (sw > w) bad(`${w} ${path}: scroll horizontal ${sw}`);
    const loc = await p.getAttribute('meta[property="og:locale"]', "content");
    if (loc !== "en_US") bad(`${w} ${path}: og:locale ${loc}`);
    const xd = await p.getAttribute('link[hreflang="x-default"]', "href");
    if (!xd?.includes("/en/still-available/")) bad(`${w} ${path}: x-default ${xd}`);
    if (p._errs.length) bad(`${w} ${path}: errores JS ${p._errs.join(" | ")}`);
    if (path === "/en/still-available/" && w === 390) await axe(p, `${w} ${path}`);
    await p.context().close();
  }

  // 3) Página en español (hispanos en EE. UU.): USD en zona de EE. UU. y en una zona neutra.
  for (const [path, tz] of [
    ["/sigue-disponible/", "America/Los_Angeles"],
    ["/sigue-disponible/", "Europe/London"],
    ["/sigue-disponible/citas/", "America/New_York"],
    ["/sigue-disponible/vs-manychat/", "America/Phoenix"],
  ]) {
    const p = await page(w, "es-US", tz);
    await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1200);
    const t = await visible(p);
    const m = t.match(MX);
    m ? bad(`${w} ${path} (${tz}): dice «${m[0]}»`) : ok(`${w} ${path} (${tz}): sin México/MXN`);
    if (path !== "/sigue-disponible/vs-manychat/" && !/\$49/.test(t)) bad(`${w} ${path} (${tz}): no muestra $49`);
    if (path === "/sigue-disponible/") {
      const plans = await p.$$eval("input[name=plan]", (rs) => rs.map((r) => r.value));
      if (!plans.every((v) => /USD/.test(v))) bad(`${w} ${path} (${tz}): plan ${plans}`);
      const be = await p.textContent("#o-be").catch(() => "");
      if (be && !/1|2/.test(be)) bad(`${w} ${path}: calculadora ${be}`);
    }
    const loc = await p.getAttribute('meta[property="og:locale"]', "content");
    if (loc !== "es_US") bad(`${w} ${path}: og:locale ${loc}`);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    if (sw > w) bad(`${w} ${path}: scroll horizontal ${sw}`);
    if (p._errs.length) bad(`${w} ${path}: errores JS ${p._errs.join(" | ")}`);
    if (path === "/sigue-disponible/" && tz === "America/Los_Angeles" && w === 1280) await axe(p, `${w} ${path}`);
    await p.context().close();
  }

  // 4) Clientes de siempre: zona de México (o ?moneda=mxn) siguen viendo pesos.
  {
    const p = await page(w, "es-MX", "America/Mexico_City");
    await p.goto(`${BASE}/sigue-disponible/?src=d10`, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    const plans = await p.$$eval("input[name=plan]", (rs) => rs.map((r) => r.value));
    plans[0] === "Básico ($899)" ? ok(`${w} zona México → pesos`) : bad(`${w} zona México: ${plans}`);
    await p.context().close();
  }

  // 5) Barra de idioma: navegador en inglés (zona neutra) en la página en español → ofrece inglés; y el toggle ES existe en EN.
  {
    const p = await page(w, "en-GB", "Europe/London", { human: true });
    await p.goto(`${BASE}/sigue-disponible/`, { waitUntil: "domcontentloaded" });
    const bar = await p.waitForSelector("#neuri-lang-sug a.go", { timeout: 5000 }).catch(() => null);
    const href = bar && (await bar.getAttribute("href"));
    href?.startsWith("/en/still-available/") ? ok(`${w} barra «Switch to English» en /sigue-disponible/`) : bad(`${w} sin barra a inglés (${href})`);
    await p.context().close();
    const q = await page(w, "en-US", "America/Phoenix");
    await q.goto(`${BASE}/en/still-available/`, { waitUntil: "domcontentloaded" });
    const es = await q.$('a[hreflang="es"][href*="/sigue-disponible/"]');
    es ? ok(`${w} toggle ES en /en/still-available/`) : bad(`${w} sin toggle ES`);
    if (es) {
      await es.click();
      await q.waitForURL("**/sigue-disponible/**", { timeout: 10000 }).catch(() => {});
      const lang = await q.getAttribute("html", "lang");
      lang === "es" ? ok(`${w} toggle ES abre español`) : bad(`${w} toggle ES → lang ${lang}`);
    }
    await q.context().close();
  }
}
await b.close();
console.log(fail ? `D-10 bots: ${fail} fallas` : "D-10 bots ✓");
process.exit(fail ? 1 : 0);
