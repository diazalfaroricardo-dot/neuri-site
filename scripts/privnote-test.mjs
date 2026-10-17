// S2 (e): el alta de neuri.bots muestra el aviso de privacidad simplificado (LFPDPPP) junto a la
// casilla de consentimiento, en el mismo paso, DESPUÉS de montar el JS. ES/EN, 390 y 1280.
// Uso: node scripts/privnote-test.mjs [base]   (base por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
const CASES = [
  { path: "/sigue-disponible/", need: ["Neuri LLC", "ARCO", "hola@neuri.tech", "BAJA"], full: "/sigue-disponible/privacidad/" },
  { path: "/en/still-available/", need: ["Neuri LLC", "hola@neuri.tech", "STOP"], full: "/en/still-available/privacy/" },
];
let fail = 0;
for (const c of CASES) {
  for (const w of [390, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: 844 } });
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(`${BASE}${c.path}?t=${Date.now()}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const n = document.getElementById("privnote");
      const consent = document.getElementById("consent");
      if (!n || !consent) return { found: false };
      const sameStep = n.closest("fieldset") === consent.closest("fieldset");
      const links = [...n.querySelectorAll("a")].map((a) => a.getAttribute("href"));
      const cs = getComputedStyle(n);
      return { found: true, text: n.textContent, sameStep, links, fs: parseFloat(cs.fontSize), wide: n.scrollWidth <= n.clientWidth + 1 };
    });
    const missing = r.found ? c.need.filter((t) => !r.text.includes(t)) : c.need;
    const ok = r.found && r.sameStep && !missing.length && r.links.includes(c.full) && r.links.includes("mailto:hola@neuri.tech") && r.fs >= 13 && r.wide && !errs.length;
    if (!ok) fail++;
    console.log(`${ok ? "OK " : "FALLA"} ${c.path} ${w}px${!r.found ? " · no existe #privnote" : ""}${missing.length ? ` · falta: ${missing.join(", ")}` : ""}${r.found && !r.sameStep ? " · no está en el paso de la casilla" : ""}${errs.length ? ` · errores: ${errs.join("; ")}` : ""}`);
    await p.close();
  }
}
await b.close();
process.exit(fail ? 1 : 0);
