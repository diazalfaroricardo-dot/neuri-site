// QA #27: abrir el asistente en /marketing/ y luego ir a /sigue-disponible/#alta (misma pestaña) no debe mostrar la
// conversación de Marketing ni tapar el formulario a 390 px. Una conversación por producto; solo se reabre sola en la
// misma página y nunca a ≤480 px. Local por defecto (API simulada); con --live, contra neuri.tech.
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
let chromium;
try {
  ({ chromium } = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`)("./index.js"));
} catch (_) {
  ({ chromium } = createRequire(import.meta.url)("playwright"));
}
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const live = process.argv.includes("--live");
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const f = [];
const panelOpen = (p) => p.evaluate(() => { const r = document.getElementById("neuri-vendedor")?.shadowRoot; const w = r?.querySelector(".w, [role=dialog]") ; const l = r?.querySelector(".l"); return { mounted: !!r, launchHidden: !!l?.hidden, text: r?.textContent?.includes("Marketing cuesta") || false }; });
for (const [w, lang, from, to] of [[390, "es", "/marketing/", "/sigue-disponible/#alta"], [1280, "es", "/marketing/", "/sigue-disponible/#alta"], [390, "en", "/en/marketing/", "/en/still-available/#signup"], [1280, "en", "/en/marketing/", "/en/still-available/#signup"]]) {
  const c = await b.newContext({ viewport: { width: w, height: 844 }, locale: lang === "en" ? "en-US" : "es-MX", timezoneId: lang === "en" ? "America/New_York" : "America/Mexico_City" });
  if (!live) {
    await c.route("https://consulting.neuri.tech/api/vendedor/estado", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"activo":true}' }));
    await c.route("https://neuri.tech/**", (r) => {
      const p = new URL(r.request().url()).pathname;
      const file = root + p + (p.endsWith("/") ? "index.html" : "");
      if (!existsSync(file)) return r.fulfill({ status: 404, body: "" });
      const ct = file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : file.endsWith(".html") ? "text/html" : "application/octet-stream";
      r.fulfill({ status: 200, body: readFileSync(file), contentType: ct });
    });
    await c.route(/^(?!https:\/\/(neuri\.tech|consulting\.neuri\.tech\/api\/vendedor\/estado)).*/, (r) => (r.request().resourceType() === "document" ? r.continue() : r.abort()));
  }
  const p = await c.newPage();
  await p.goto("https://neuri.tech" + from, { waitUntil: "domcontentloaded" });
  await p.waitForFunction(() => document.getElementById("neuri-vendedor")?.shadowRoot?.querySelector(".l"), null, { timeout: 15000 }).catch(() => {});
  // Abrir el asistente y simular una conversación de Marketing guardada.
  await p.evaluate(() => document.getElementById("neuri-vendedor").shadowRoot.querySelector(".l").click());
  await p.waitForTimeout(300);
  const before = await panelOpen(p);
  if (!before.launchHidden) f.push(`${w} ${lang}: no se pudo abrir el asistente en ${from}`);
  await p.goto("https://neuri.tech" + to, { waitUntil: "domcontentloaded" });
  await p.waitForFunction(() => document.getElementById("neuri-vendedor")?.shadowRoot?.querySelector(".l"), null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  const after = await panelOpen(p);
  if (after.launchHidden) f.push(`${w} ${lang}: el asistente llega abierto a ${to}`);
  // El primer «Siguiente» del alta se puede tocar (nada lo intercepta).
  const btn = p.locator("#bNext");
  if (await btn.count()) {
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    const ok = await btn.click({ trial: true, timeout: 3000 }).then(() => true).catch((e) => (console.log(String(e).slice(0, 300)), false));
    if (!ok) f.push(`${w} ${lang}: el botón del alta no recibe el toque`);
  }
  // Misma página a 1280: regresar a /marketing/ reabre su propia conversación (se conserva lo útil).
  if (w === 1280) {
    await p.goto("https://neuri.tech" + from, { waitUntil: "domcontentloaded" });
    await p.waitForFunction(() => document.getElementById("neuri-vendedor")?.shadowRoot?.querySelector(".l"), null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(500);
    if (!(await panelOpen(p)).launchHidden) f.push(`${w} ${lang}: en ${from} ya no se reabre su propia conversación`);
  }
  console.log(w, lang, from, "→", to, "abierto al llegar:", after.launchHidden);
  await c.close();
}
await b.close();
if (f.length) { console.error("qa27:", f.join("; ")); process.exit(1); }
console.log("qa27 OK");
