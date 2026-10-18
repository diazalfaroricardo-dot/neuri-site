// A286 (B-O1): la demo de neuri.bots ya viene pintada en el HTML y NO se monta durante la carga
// (no traba el primer toque en móvil); se monta sola en un rato libre después de load, y al momento si tocas.
// Uso: node scripts/demo-idle-test.mjs [base]   (base por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const base = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
for (const path of ["/sigue-disponible/", "/en/still-available/"]) {
  for (const width of [390, 1280]) {
    const ctx = await b.newContext({ viewport: { width, height: 844 } });
    await ctx.addInitScript(() => { addEventListener("load", () => { window.__demoAtLoad = !!window.__nDemo; }); });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    await p.goto(base + path, { waitUntil: "load" });
    ok((await p.evaluate(() => window.__demoAtLoad)) === false, `${path} ${width}: la demo no se monta durante la carga`);
    ok(await p.evaluate(() => !!document.querySelector("#inicio h1")), `${path} ${width}: el hero ya está pintado sin JS de la demo`);
    await p.waitForFunction(() => !!window.__nDemo, null, { timeout: 9000 }).then(() => ok(true, `${path} ${width}: se monta sola después de cargar`), () => ok(false, `${path} ${width}: se monta sola después de cargar`));
    ok(errs.length === 0, `${path} ${width}: sin errores de JS ${errs.join(" | ")}`);
    await ctx.close();
    // tocar antes de que se monte sola → se monta al momento
    const ctx2 = await b.newContext({ viewport: { width, height: 844 }, hasTouch: width === 390 });
    const p2 = await ctx2.newPage();
    await p2.goto(base + path, { waitUntil: "load" });
    await p2.mouse.click(5, 300);
    ok(await p2.evaluate(() => !!window.__nDemo), `${path} ${width}: tocar la página monta la demo al momento`);
    await ctx2.close();
  }
}
await b.close();
console.log(fails ? `${fails} FALLAS` : "TODO OK");
process.exit(fails ? 1 : 0);
