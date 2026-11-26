// premium-arreglo-bots-1126 (auditoría D-11): pulidos del hero de neuri.bots, ES/EN a 390 y 1280.
// - El párrafo nombra TikTok solo como comentarios (no promete DMs de TikTok).
// - Las etiquetas «pronto/soon» de los chips miden ≥12 px.
// - Titular y párrafo llevan velo (::before) para que la red de puntos no cruce las letras.
// - A 390 las tarjetas visibles quedan dentro del ancho y no se enciman entre sí.
// Uso: node scripts/bots-premium-1126-test.mjs [base]   (por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const base = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
for (const [path, en] of [["/sigue-disponible/", false], ["/en/still-available/", true]]) {
  for (const width of [390, 1280]) {
    const p = await b.newPage({ viewport: { width, height: 844 } });
    await p.goto(base + path, { waitUntil: "load" });
    await p.waitForTimeout(4500);
    const r = await p.evaluate(() => {
      const lead = document.querySelector("#inicio .lead");
      const cards = [...document.querySelectorAll(".np-noti")].filter((n) => getComputedStyle(n).display !== "none").map((n) => n.getBoundingClientRect());
      let choque = 0;
      for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i], c = cards[j];
        if (a.left < c.right - 4 && c.left < a.right - 4 && a.top < c.bottom - 4 && c.top < a.bottom - 4) choque++;
      }
      return {
        lead: lead.textContent,
        velo: getComputedStyle(lead, "::before").content !== "none" && getComputedStyle(document.querySelector("#inicio h1"), "::before").content !== "none",
        chicas: [...document.querySelectorAll(".np-can small")].map((s) => parseFloat(getComputedStyle(s).fontSize)),
        fuera: cards.filter((c) => c.left < -1 || c.right > innerWidth + 1).length,
        choque,
      };
    });
    const t = `${path} ${width}`;
    ok(en ? /TikTok comments/.test(r.lead) : /comentarios de TikTok/.test(r.lead), `${t}: el párrafo nombra los comentarios de TikTok`);
    ok(!/TikTok (DMs|messages)|mensajes de TikTok/.test(r.lead), `${t}: sin prometer DMs de TikTok`);
    ok(r.chicas.every((s) => s >= 12), `${t}: «pronto» ≥12 px (${r.chicas.join(", ")})`);
    ok(r.velo, `${t}: velo detrás del titular y el párrafo`);
    if (width === 390) {
      ok(r.fuera === 0, `${t}: tarjetas dentro del ancho (${r.fuera} fuera)`);
      ok(r.choque === 0, `${t}: tarjetas sin encimarse (${r.choque})`);
    }
    await p.close();
  }
}
await b.close();
process.exit(fails ? 1 : 0);
