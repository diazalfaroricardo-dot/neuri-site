// A237/A238 (QA en vivo): un iPhone en inglés que escanea la tarjeta de visita EN ESPAÑOL de neuri.bazar
// (bazar.neuri.tech/?signup&lang=es…) debe ver la app en español y con <html lang="es">; con lang=en, en inglés.
// Sin lang, sigue mandando el teléfono. No envía ningún alta.
// Uso: node scripts/bazar-lang-link-test.mjs [base]   (por defecto https://bazar.neuri.tech)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://bazar.neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
// [idioma del teléfono, query, idioma esperado]
const cases = [
  ["en-US", "?signup&lang=es&country=MX&src=qa-lang&name=Prueba", "es"],
  ["es-MX", "?signup&lang=en&country=US&src=qa-lang&name=Test", "en"],
  ["en-US", "?signup&country=US&src=qa-lang", "en"],
  ["es-MX", "?signup&country=MX&src=qa-lang", "es"],
];
let fail = 0;
for (const w of [390, 1280]) {
  for (const [locale, q, want] of cases) {
    const ctx = await b.newContext({ locale, viewport: { width: w, height: 844 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.goto(`${BASE}/${q}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    const html = await p.evaluate(() => document.documentElement.lang);
    const stored = await p.evaluate(() => localStorage.getItem("nb_lang"));
    const ok = html === want && errs.length === 0;
    if (!ok) fail++;
    console.log(`${ok ? "OK " : "FALLA"} ${w}px ${locale} ${q} → html lang=${html} nb_lang=${stored}${errs.length ? ` errores: ${errs.join(" | ")}` : ""}`);
    await ctx.close();
  }
}
await b.close();
console.log(fail ? `${fail} fallas` : "todo OK");
process.exit(fail ? 1 : 0);
