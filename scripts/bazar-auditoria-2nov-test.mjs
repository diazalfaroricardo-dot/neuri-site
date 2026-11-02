// Auditoría con ojos nuevos 2-nov, bazar 570, 571, 572, 575, 577, 579. No crea ningún alta: la navegación a la app se intercepta.
// Uso: node scripts/bazar-auditoria-2nov-test.mjs [base]   (por defecto https://neuri.tech)
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://neuri.tech";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";
let fail = 0;
const ok = (c, m) => { console.log(c ? "OK  " : "FAIL", m); if (!c) fail++; };
const ctx = async (w, saved) => {
  const c = await b.newContext({ viewport: { width: w, height: 844 }, timezoneId: "America/Phoenix", locale: "es-MX", userAgent: UA });
  await c.addInitScript((v) => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    if (v) try { localStorage.setItem("neuri-lang", v); } catch (_) {}
  }, saved);
  return c;
};
for (const [path, sim, viejos, renta] of [
  ["/bazar/", "Simulador", ["caja de prueba", "laspalmas", "Sola, cada semana", "del vendedor cada semana"], "semanal o mensual"],
  ["/en/bazar/", "Simulator", ["demo register", "desertrose", "Automatic, every week", "automatically every week"], "weekly or monthly"],
]) {
  const html = await (await fetch(`${BASE}${path}?t=${Date.now()}`)).text();
  for (const v of viejos) ok(!html.includes(v), `${path} sin «${v}» (570, 577)`);
  ok(html.includes(renta), `${path} dice «${renta}» (577)`);
  ok(html.includes(`>${sim}<`), `${path} nombra el simulador (570)`);
  ok(!html.includes('id="f-ciudad"'), `${path} no pide ciudad que luego se pierde (579)`);
  // 571: el plan del botón manda sobre los vendedores.
  const c = await ctx(390);
  const p = await c.newPage();
  await p.route("https://bazar.neuri.tech/**", (r) => (r.request().isNavigationRequest() ? r.fulfill({ body: "ok" }) : r.abort()));
  await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    const a = [...document.querySelectorAll("a[data-trial][data-plan]")].find((x) => x.dataset.plan === "Plus");
    a.setAttribute("href", "#prueba"); // como quien regresa con «atrás» al asistente
    a.click();
    document.getElementById("f-nombre").value = "Bazar QA";
  });
  await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById("siguiente").click());
  await p.evaluate(() => { document.querySelector("input[name=pais]").checked = true; document.getElementById("siguiente").click(); });
  const nota = await p.evaluate(() => { const n = document.getElementById("plan-nota"); return n && !n.hidden ? n.textContent : ""; });
  ok(/Plus/.test(nota), `${path} el paso 3 dice que el plan elegido se queda (571): ${nota}`);
  await p.evaluate(() => { document.querySelector("input[name=vendedores]").checked = true; document.getElementById("siguiente").click(); });
  const res = await p.evaluate(() => document.getElementById("resumen").textContent);
  ok(/Plus/.test(res), `${path} resumen con Plus aunque ponga el rango menor (571): ${res}`);
  await p.evaluate(() => { document.getElementById("f-correo").value = "qa@example.com"; document.getElementById("siguiente").click(); });
  await p.waitForTimeout(500);
  ok(/plan=plus/.test(p.url()), `${path} el alta recibe plan=plus (571): ${p.url().slice(0, 90)}`);
  await c.close();
  // 575: el globo no tapa «Siguiente» a 390.
  const c2 = await ctx(390);
  const q = await c2.newPage();
  // En local el servidor de consulting no responde a este origen: se simula que el globo está activo.
  if (BASE.includes("localhost")) await q.route((u) => u.href.includes("/api/vendedor"), (r) => r.fulfill({ json: { activo: true }, headers: { "access-control-allow-origin": "*" } }));
  // El globo solo existe si su script cargó: en local se sirve desde esta carpeta.
  await q.goto(`${BASE}${path}`, { waitUntil: "load" });
  await q.waitForFunction(() => document.getElementById("neuri-vendedor"), null, { timeout: 15000 }).catch(() => {});
  await q.waitForTimeout(400);
  // La página cambia de alto al cargar: se repite hasta que el botón queda abajo, en la zona del globo.
  for (let i = 0; i < 6; i++) {
    await q.evaluate(() => { const s = document.getElementById("siguiente"); scrollTo({ top: s.getBoundingClientRect().top + scrollY - innerHeight + s.offsetHeight + 24, behavior: "instant" }); });
    await q.waitForTimeout(350);
  }
  const tapa = await q.evaluate(() => {
    const host = [...document.body.children].find((e) => e.shadowRoot?.querySelector(".l"));
    const l = host.shadowRoot.querySelector(".l"), s = document.getElementById("siguiente").getBoundingClientRect(), r = l.getBoundingClientRect();
    const cruza = r.left < s.right && r.right > s.left && r.top < s.bottom && r.bottom > s.top;
    return { cruza, visible: getComputedStyle(l).visibility !== "hidden" };
  });
  ok(tapa.cruza && !tapa.visible, `${path} 390: globo sin tapar «Siguiente» (575) ${JSON.stringify(tapa)}`);
  await c2.close();
}
// 572: la elección de idioma se recuerda al volver (ofrece el otro sin redirigir) y el pie en inglés no regresa al español.
for (const [saved, path, want] of [["en", "/", "en"], ["en", "/bazar/", "en"], ["es", "/en/bazar/", "es"], ["es", "/bazar/", null]]) {
  const c = await ctx(1280, saved);
  const p = await c.newPage();
  await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(500);
  const sug = await p.evaluate(() => document.getElementById("neuri-lang-sug")?.lang || null);
  ok(sug === want && new URL(p.url()).pathname === path, `elegido=${saved} ${path} → barra ${sug}, sin redirigir (572)`);
  await c.close();
}
const en = await (await fetch(`${BASE}/en/bazar/?t=${Date.now()}`)).text();
ok(!/<a href="\/"[^>]*>neuri\.tech<\/a>/.test(en), "pie de /en/bazar/ liga a la portada en inglés (572)");
await b.close();
if (fail) { console.log(fail, "fallas"); process.exit(1); }
console.log("auditoría 2-nov OK");
