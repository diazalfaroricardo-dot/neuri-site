// A286 (B-O1): la malla y el panel del hero de neuri.bots no se mueven durante la carga (trababan el
// primer toque en móvil); se quedan en su primer cuadro hasta el primer toque, scroll o tecla, o 6 s
// después de cargar. Uso: node scripts/a286-hero-calma-test.mjs [base]   (por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const base = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
const foto = (p) => p.evaluate(() => document.querySelector(".hx-mesh").toDataURL());
for (const path of ["/sigue-disponible/", "/en/still-available/"]) {
  for (const width of [390, 1280]) {
    const ctx = await b.newContext({ viewport: { width, height: 844 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    await p.goto(base + path, { waitUntil: "load" });
    await p.waitForTimeout(300);
    const a = await foto(p);
    ok(a.length > 2000, `${path} ${width}: la malla ya pintó su primer cuadro`);
    ok(await p.evaluate(() => document.querySelectorAll(".cons .feed .th").length >= 2), `${path} ${width}: el panel trae sus dos pláticas`);
    await p.waitForTimeout(1500);
    ok(a === (await foto(p)), `${path} ${width}: la malla sigue quieta durante la carga`);
    await p.mouse.wheel(0, 1);
    await p.waitForTimeout(400);
    ok(a !== (await foto(p)), `${path} ${width}: al primer scroll la malla se mueve`);
    ok(errs.length === 0, `${path} ${width}: sin errores de JS ${errs.join(" | ")}`);
    await ctx.close();
    const ctx2 = await b.newContext({ viewport: { width, height: 844 } });
    const p2 = await ctx2.newPage();
    await p2.goto(base + path, { waitUntil: "load" });
    await p2.waitForTimeout(300);
    const c = await foto(p2);
    await p2.waitForTimeout(6500);
    ok(c !== (await foto(p2)), `${path} ${width}: sin tocar nada, se mueve sola después de 6 s`);
    await ctx2.close();
  }
}
await b.close();
console.log(fails ? `${fails} fallas` : "OK a286-hero-calma");
process.exit(fails ? 1 : 0);
