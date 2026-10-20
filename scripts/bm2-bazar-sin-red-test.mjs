// B-M2: sin red, el alta de /bazar y /en/bazar no navega a una página de error del navegador:
// lo dice en pantalla, conserva lo escrito y, al volver la red, sigue sola a crear la cuenta. ES/EN 390/1280.
// Uso: node scripts/bm2-bazar-sin-red-test.mjs [base]   (base por defecto https://neuri.tech; no crea cuentas: la navegación a la app se intercepta)
import { chromium } from "playwright-core";
const BASE = process.argv.slice(2).find((a) => !a.startsWith("--")) || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
const cases = [
  ["es", 390, "/bazar/"],
  ["en", 390, "/en/"],
  ["es", 1280, "/bazar/"],
  ["en", 1280, "/en/"],
];
let fail = 0;
for (const [lang, w, path] of cases) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  let went = null;
  await ctx.route("https://bazar.neuri.tech/**", (r) => {
    if (r.request().isNavigationRequest()) { went = r.request().url(); return r.fulfill({ status: 200, contentType: "text/html", body: "<p>app</p>" }); }
    return r.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  const f = p.locator("#asistente");
  await f.scrollIntoViewIfNeeded();
  const next = async () => { await p.locator("#siguiente").click(); await p.waitForTimeout(200); };
  await p.locator("#f-nombre").fill("Bazar Ñandú's QA");
  await next();
  await p.locator("#f-ciudad").fill("Culiacán");
  await f.locator('input[name="pais"]').first().evaluate((e) => { e.checked = true; e.dispatchEvent(new Event("change", { bubbles: true })); });
  await next();
  await f.locator('input[name="vendedores"]').first().evaluate((e) => { e.checked = true; e.dispatchEvent(new Event("change", { bubbles: true })); });
  await next();
  await p.locator("#f-correo").fill("delivered@resend.dev");
  await ctx.setOffline(true);
  await p.locator("#siguiente").click();
  await p.waitForTimeout(400);
  const v = await p.evaluate(() => ({
    msg: document.getElementById("e-correo")?.textContent || "",
    correo: document.getElementById("f-correo")?.value,
    nombre: document.getElementById("f-nombre")?.value,
    href: location.href,
    sw: document.documentElement.scrollWidth,
  }));
  const stayed = went === null && !v.href.startsWith("chrome-error");
  await ctx.setOffline(false);
  await p.waitForTimeout(1500);
  const good = stayed && /Sin conexión|offline/.test(v.msg) && v.correo === "delivered@resend.dev" && v.nombre === "Bazar Ñandú's QA" &&
    v.sw <= w && errs.length === 0 && went && /signup/.test(went);
  if (!good) fail++;
  console.log(good ? "OK  " : "FALLA", lang, w, JSON.stringify({ msg: v.msg.slice(0, 40), stayed, went }), errs.join(" | "));
  await ctx.close();
}
await b.close();
process.exit(fail ? 1 : 0);
