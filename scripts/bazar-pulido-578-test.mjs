// Auditoría 2-nov, 578 (resto): portada sin jerga ni «tres en órbita», tarjetas con la duración de la prueba y toques ≥44 px en bots.
// Uso: CHROME=ruta node scripts/bazar-pulido-578-test.mjs [base]   (por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://neuri.tech";
let fail = 0;
const ok = (c, m) => { console.log(c ? "OK  " : "FAIL", m); if (!c) fail++; };
const get = async (p) => (await fetch(`${BASE}${p}?t=${Date.now()}`)).text();
for (const [path, malas, buena] of [
  ["/", [/misiones/i, /en órbita/i, /red neural/i], "Cuatro productos, cada uno con un solo trabajo"],
  ["/en/home/", [/missions/i, /in orbit/i, /neural network/i], "Four products, each with one job"],
]) {
  const h = await get(path);
  for (const m of malas) ok(!m.test(h), `${path} sin ${m}`);
  ok(h.includes(buena), `${path} dice «${buena}»`);
}
for (const [path, t] of [["/bazar/", "Probar 14 días gratis"], ["/en/bazar/", "Start 14-day free trial"]]) {
  const h = await get(path);
  const n = [...h.matchAll(/data-trial(?:="")? data-plan="[^"]+"[^>]*>\s*([^<]+?)\s*<\/a>/g)].map((m) => m[1]);
  ok(n.length >= 3 && n.every((x) => x === t), `${path} tarjetas de precio: «${t}» (${n.length})`);
}
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--headless=new"] });
for (const path of ["/sigue-disponible/", "/en/still-available/"]) {
  for (const width of [390, 1280]) {
    const p = await b.newPage({ viewport: { width, height: 844 } });
    await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    const m = await p.evaluate(() => ({
      rango: document.getElementById("lc-msgs").getBoundingClientRect().height,
      logo: document.querySelector("a.logo").getBoundingClientRect().height,
    }));
    ok(m.rango >= 44, `${path}@${width} deslizador ≥44 px (${m.rango})`);
    ok(m.logo >= 44, `${path}@${width} logo ≥44 px (${m.logo})`);
    await p.close();
  }
}
await b.close();
console.log(fail ? `${fail} fallas` : "todo bien");
process.exit(fail ? 1 : 0);
