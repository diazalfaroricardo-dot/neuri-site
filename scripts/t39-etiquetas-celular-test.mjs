// t39 (Ricardo aprobó el 9-nov, r-aprobar-numeros-etiquetas): en «Tu semana» de /marketing y /en/marketing,
// en celular la etiqueta de cada tarjeta (POST, REEL · 0:10, CARRUSEL · 5, HISTORIA) baja a la franja de abajo
// para no tapar la pieza; en compu sigue sobre la pieza. Sin scroll lateral y sin fallas de axe en #wgrid.
// Uso: node scripts/t39-etiquetas-celular-test.mjs [base]   (base por defecto http://127.0.0.1:8765; --live = https://neuri.tech)
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const arg = process.argv[2];
const base = arg === "--live" ? "https://neuri.tech" : arg || "http://127.0.0.1:8765";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const AXE = process.env.AXE ? readFileSync(process.env.AXE, "utf8") : "";
const b = await chromium.launch({ executablePath: exe });
let fallas = 0;
for (const [lang, path] of [["es", "/marketing/"], ["en", "/en/marketing/"]]) {
  for (const w of [390, 1280]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 1000 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(`${base}${path}?t39=${Date.now()}`, { waitUntil: "networkidle" });
    await p.waitForSelector("#wgrid .piece .pmeta");
    const r = await p.evaluate(() =>
      [...document.querySelectorAll("#wgrid .piece")].map((pc) => {
        const vis = (el) => !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0;
        const tag = pc.querySelector(".art .mtag");
        const pt = pc.querySelector(".pmeta .ptype");
        return { sobre: vis(tag), franja: vis(pt), texto: (vis(tag) ? tag : pt)?.textContent || "" };
      }),
    );
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    let ax = [];
    if (AXE) {
      await p.addScriptTag({ content: AXE });
      ax = await p.evaluate(async () =>
        (await window.axe.run("#wgrid", { runOnly: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] })).violations.map((v) => v.id),
      );
    }
    const celular = w <= 820;
    const ok =
      r.length === 4 &&
      r.every((x) => x.texto && (celular ? !x.sobre && x.franja : x.sobre && !x.franja)) &&
      sw <= w &&
      ax.length === 0;
    if (!ok) fallas++;
    console.log(`${ok ? "ok" : "FALLA"} ${lang} ${w}px`, r.map((x) => `${x.sobre ? "sobre" : "franja"}:${x.texto}`).join(" | "), `scrollW=${sw}`, ax.length ? `axe=${ax}` : "");
    await ctx.close();
  }
}
await b.close();
process.exit(fallas ? 1 : 0);
