// B-O1 / A286 / T-LH: el salto de layout de las landings venía de la fuente. Geist llegaba de Google
// después de pintar con la de reserva; donde esa es ancha, el hero se reacomoda (CLS 0.18-0.21 en /en/still-available/ y /,
// ~30 puntos de Lighthouse). Ahora la fuente sale de /assets/fonts con preload. Se simula una reserva ancha.
// Uso: node scripts/b-o1-cls-fuente-test.mjs [base]   (por defecto el servidor local de correr-pruebas.sh)
import { chromium } from "playwright-core";
const base = process.argv[2] || "http://127.0.0.1:8765";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
const RESERVA = '"DejaVu Sans",Verdana';
const rutas = ["/", "/en/home/", "/sigue-disponible/", "/en/still-available/", "/bazar/", "/en/bazar/", "/marketing/", "/en/marketing/"];
for (const ruta of rutas) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const externas = [];
  p.on("request", (r) => { if (/fonts\.g(oogleapis|static)\.com/.test(r.url())) externas.push(r.url()); });
  // Se reemplaza system-ui por una reserva ancha, como en el corredor de GitHub. Google llega tarde, como en red real.
  await p.route(/fonts\.g(oogleapis|static)\.com/, async (r) => { await new Promise((s) => setTimeout(s, 300)); await r.continue(); });
  await p.route(base + ruta, async (r) => {
    const res = await r.fetch();
    const html = (await res.text()).replace(/system-ui/g, RESERVA);
    await r.fulfill({ response: res, body: html });
  });
  await p.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  await p.goto(base + ruta, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(async () => {
    await document.fonts.ready;
    return {
      cls: window.__cls,
      geist: [...document.fonts].some((f) => f.family.replace(/"/g, "") === "Geist" && f.status === "loaded"),
      pre: [...document.querySelectorAll('link[rel=preload][as=font]')].map((l) => new URL(l.href).pathname),
    };
  });
  ok(externas.length === 0, `${ruta}: sin pedir fuentes a Google (${externas.length})`);
  ok(r.geist, `${ruta}: Geist cargada`);
  ok(r.pre.includes("/assets/fonts/geist-latin-wght.woff2"), `${ruta}: preload de la fuente propia`);
  ok(r.cls < 0.05, `${ruta}: CLS con reserva ancha ${r.cls.toFixed(3)} < 0.05`);
  await ctx.close();
}
await b.close();
console.log(fails ? `${fails} fallas` : "todo OK");
process.exit(fails ? 1 : 0);
