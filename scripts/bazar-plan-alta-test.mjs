// B-B1: en la landing de neuri.bazar ES/EN el plan que elige el visitante («Probar gratis» de Básico/Pro/Plus
// o los vendedores del asistente) viaja al alta: bazar.neuri.tech/?signup&country=…&src=…&plan=basico|pro|plus.
// Uso: node scripts/bazar-plan-alta-test.mjs [base]   (no crea ningún alta: la navegación a la app se intercepta)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
let fail = 0;
const cases = [
  ["/bazar/", "MX", 390, 2, "plus", "visit-phx"],
  ["/bazar/", "MX", 1280, 0, "basico", ""],
  ["/en/", "US", 390, 1, "pro", ""],
  ["/en/", "US", 1280, 0, "basico", "tarjeta-qa"],
];
for (const [path, country, w, idx, want, src] of cases) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  let dest = "";
  await p.route("https://bazar.neuri.tech/**", (r) => {
    if (r.request().isNavigationRequest()) { dest = r.request().url(); return r.fulfill({ body: "ok" }); }
    return r.abort();
  });
  await p.goto(`${BASE}${path}${src ? `?src=${src}` : ""}`, { waitUntil: "networkidle" });
  await p.locator("a[data-trial][data-plan]:visible").nth(idx).click();
  await p.waitForTimeout(600);
  for (let i = 0; i < 8 && !dest; i++) {
    await p.evaluate(() => {
      const f = document.getElementById("asistente");
      for (const el of f.querySelectorAll("input[type=text]")) if (el.offsetParent && !el.value) el.value = "Bazar QA";
      for (const el of f.querySelectorAll("input[type=email]")) if (el.offsetParent && !el.value) el.value = "qa@example.com";
      const groups = new Set([...f.querySelectorAll("input[type=radio]")].filter((r) => r.offsetParent).map((r) => r.name));
      for (const g of groups) if (!f.querySelector(`input[name=${g}]:checked`)) f.querySelector(`input[name=${g}]`).checked = true;
    });
    await p.locator("#siguiente").click().catch(() => {});
    await p.waitForTimeout(500);
  }
  // El # no viaja en la petición: se lee de la URL de la página ya navegada.
  if (dest) { await p.waitForURL(/bazar\.neuri\.tech/).catch(() => {}); dest = p.url(); }
  const u = dest ? new URL(dest) : null;
  const ok = u && u.searchParams.has("signup") && u.searchParams.get("country") === country &&
    u.searchParams.get("plan") === want && u.searchParams.get("src") === (src || "landing") && errs.length === 0 &&
    // QA #16: tienda y correo viajan en el # para que el alta no los vuelva a pedir.
    new URLSearchParams(u.hash.slice(1)).get("name") === "Bazar QA" &&
    new URLSearchParams(u.hash.slice(1)).get("email") === "qa@example.com";
  if (!ok) fail++;
  console.log(ok ? "OK  " : "FALLA", path, w, want, dest || "(sin navegación)", errs.join(" | "));
  await p.close();
}
await b.close();
process.exit(fail ? 1 : 0);
