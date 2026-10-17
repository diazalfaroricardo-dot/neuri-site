// A222: cada pregunta del FAQPage (JSON-LD) de la landing de neuri.bots se ve en la página
// DESPUÉS de que monta el JS (dc-lite reemplaza el HTML estático con su plantilla; una pregunta
// que solo está en el HTML estático desaparece y Google la vería como FAQ oculto). ES/EN, 390 y 1280.
// Uso: node scripts/faq-visible-test.mjs [base]   (base por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
let fail = 0;
for (const path of ["/sigue-disponible/", "/en/still-available/"]) {
  for (const w of [390, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: 844 } });
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(`${BASE}${path}?t=${Date.now()}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => {
      const qs = [];
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        const j = JSON.parse(s.textContent);
        for (const n of j["@graph"] ?? [j])
          if (n["@type"] === "FAQPage") for (const q of n.mainEntity) qs.push(q.name);
      }
      const vis = [...document.querySelectorAll("#preguntas summary")]
        .filter((s) => s.offsetParent)
        .map((s) => s.textContent.trim());
      return { qs, missing: qs.filter((q) => !vis.some((v) => v.startsWith(q))) };
    });
    const ok = r.qs.length > 0 && r.missing.length === 0 && errs.length === 0;
    if (!ok) fail++;
    console.log(`${ok ? "OK " : "FALLA"} ${path} ${w}px · ${r.qs.length} preguntas${r.missing.length ? ` · no se ven: ${r.missing.join(" | ")}` : ""}${errs.length ? ` · errores: ${errs.join("; ")}` : ""}`);
    await p.close();
  }
}
await b.close();
process.exit(fail ? 1 : 0);
