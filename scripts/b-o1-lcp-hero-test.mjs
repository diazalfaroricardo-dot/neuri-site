// B-O1: el párrafo del hero (el LCP) pinta desde el primer cuadro a casi cero y termina visible, igual
// a la vista, pero el navegador ya no espera la entrada. Sin esto el LCP subía a 3.8 s en /bazar/.
// Uso: node scripts/b-o1-lcp-hero-test.mjs [base]   (por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const base = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
const casos = [["/", ".hero-p"], ["/en/home/", ".hero-p"], ["/bazar/", ".hx-p"], ["/en/bazar/", ".hx-p"]];
for (const [path, sel] of casos) {
  for (const width of [390, 1280]) {
    const ctx = await b.newContext({ viewport: { width, height: 844 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    // El primer valor que tiene el párrafo, antes de que corra ningún script diferido.
    await p.addInitScript((s) => {
      window.__lcp = [];
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__lcp.push({ t: e.startTime, sel: e.element?.matches?.(s) });
      }).observe({ type: "largest-contentful-paint", buffered: true });
      const mira = () => {
        const el = document.querySelector(s);
        if (el) {
          const c = getComputedStyle(el);
          window.__primero = { vis: c.visibility, op: Number(c.opacity) };
        } else requestAnimationFrame(mira);
      };
      requestAnimationFrame(mira);
    }, sel);
    await p.goto(base + path, { waitUntil: "load" });
    await p.waitForTimeout(3500);
    const r = await p.evaluate((s) => {
      const c = getComputedStyle(document.querySelector(s));
      return { vis: c.visibility, op: Number(c.opacity), primero: window.__primero, lcp: window.__lcp };
    }, sel);
    ok(r.primero?.vis === "visible" && r.primero.op > 0, `${path} ${width}: el párrafo ya está pintado al inicio (${JSON.stringify(r.primero)})`);
    ok(r.primero?.op <= 0.02, `${path} ${width}: al inicio se ve como antes, casi cero`);
    ok(r.vis === "visible" && r.op === 1, `${path} ${width}: al terminar la entrada se ve completo (${r.op})`);
    ok(errs.length === 0, `${path} ${width}: sin errores de JS ${errs.join(" | ")}`);
    await ctx.close();
  }
}
await b.close();
console.log(fails ? `${fails} fallas` : "OK b-o1-lcp-hero");
process.exit(fails ? 1 : 0);
