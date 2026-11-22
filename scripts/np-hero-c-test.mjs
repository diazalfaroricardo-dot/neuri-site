// Pasada premium de neuri.bots (aprobada por Ricardo 21-nov-2026): hero C, celular 3D que contesta.
// Reemplaza a a286-hero-calma (probaba el panel oscuro que ya no existe). Revisa ES/EN a 390 y 1280:
// el celular y sus notificaciones salen, el chat contesta, sin errores de JS, sin scroll horizontal,
// solo canales reales encendidos (WhatsApp/TikTok/SMS dicen «pronto») y sin el aviso viejo de Meta.
// Uso: node scripts/np-hero-c-test.mjs [base]   (por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const base = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
for (const [path, en] of [["/sigue-disponible/", false], ["/en/still-available/", true]]) {
  for (const width of [390, 1280]) {
    const p = await b.newPage({ viewport: { width, height: 844 } });
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(base + path, { waitUntil: "load" });
    await p.waitForTimeout(4500);
    const r = await p.evaluate(() => ({
      stage: !!document.querySelector("#inicio .np-stage"),
      notis: document.querySelectorAll(".np-noti").length,
      chat: document.querySelectorAll(".np-chat .m").length,
      over: document.documentElement.scrollWidth > innerWidth,
      pronto: document.querySelectorAll(".np-can.pronto").length,
      meta: /pendiente de aprobación de Meta|pending Meta’s approval/.test(document.body.innerText),
    }));
    const t = `${path} ${width}`;
    ok(r.stage, `${t}: hero C presente`);
    ok(r.notis === 5, `${t}: 5 notificaciones (${r.notis})`);
    ok(r.chat >= 1, `${t}: el celular contesta (${r.chat} mensajes)`);
    ok(!r.over, `${t}: sin scroll horizontal`);
    ok(r.pronto === 3, `${t}: WhatsApp, TikTok y SMS marcados como pronto (${r.pronto})`);
    ok(!r.meta, `${t}: sin el aviso viejo de Meta`);
    ok(errs.length === 0, `${t}: sin errores de JS ${errs.join(" | ")}`);
    await p.close();
  }
}
await b.close();
process.exit(fails ? 1 : 0);
