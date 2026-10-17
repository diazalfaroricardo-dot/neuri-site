// A223/A224: la landing de neuri.bots carga ligera en señal mala.
// - qrcode.js NO se baja con la página; se baja al tocar «Escanéalo con tu teléfono» y el QR sale.
// - array.js de PostHog se pide después del evento load (no compite con la página) y la analítica sigue mandando eventos.
// Uso: node scripts/carga-ligera-test.mjs [base]   (base por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const base = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
for (const path of ["/sigue-disponible/", "/en/still-available/"]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" }) // PostHog descarta HeadlessChrome;
  await ctx.addInitScript(() => { window.__NEURI_ANALYTICS_FORCE = 1; window.__loadAt = 0; addEventListener("load", () => { window.__loadAt = performance.now(); }); });
  const p = await ctx.newPage();
  const reqs = [];
  p.on("request", (r) => reqs.push({ url: r.url(), t: Date.now() }));
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto(base + path, { waitUntil: "load" });
  const loadWall = Date.now();
  ok(!reqs.some((r) => r.url.includes("/assets/qrcode.js")), `${path} qrcode.js no se baja al cargar`);
  await p.waitForTimeout(9000);
  const arr = reqs.find((r) => r.url.includes("posthog.com/static/array.js"));
  ok(arr && arr.t >= loadWall - 50, `${path} array.js de PostHog se pide después de load`);
  const loaded = await p.evaluate(() => !!(window.posthog && window.posthog.__loaded));
  ok(loaded, `${path} PostHog quedó cargado (posthog.__loaded)`);
  // (No se revisa el envío de eventos: posthog-js descarta navegadores con navigator.webdriver, como este.)
  // Llenar la demo para que exista el link precargado y abrir el QR.
  const inp = p.locator("#bot-prods");
  await inp.fill(path.startsWith("/en") ? "Red chair $45; Lamp 30 dlls" : "Silla roja $450 MXN; Lámpara $300"); await inp.dispatchEvent("change");
  const btn = p.locator("button[data-a212]").first();
  if (await btn.count()) {
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true }).catch(() => {});
    await p.locator("#nb-qr svg").waitFor({ timeout: 8000 }).catch(() => {});
    const dl = reqs.some((r) => r.url.includes("/assets/qrcode.js"));
    const svg = await p.locator("#nb-qr svg").count();
    ok(dl && svg > 0, `${path} al tocar el botón se baja qrcode.js y sale el QR`);
  } else ok(false, `${path} no encontré el botón [data-a212]`);
  ok(errs.length === 0, `${path} sin errores de JS ${errs.join(" | ")}`);
  await ctx.close();
}
await b.close();
process.exit(fails ? 1 : 0);
