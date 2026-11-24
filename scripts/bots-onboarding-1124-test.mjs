/**
 * bots-onboarding-clean-1124 (recorrido real del alta, 24-nov): arreglos sin rediseño que no deben volver.
 * 1) Automation First: el alta no promete «te escribimos / we'll reach out»; se arma sola.
 * 2) «¿Dónde vendes más?» no viene en Marketplace (la ayuda de arriba dice que el perfil personal no se conecta).
 * 3) El link para conectar dura 14 días (CONNECT_DAYS en packages/sd-setup): la pantalla de éxito lo dice igual.
 * 4) Un solo correo de soporte en la landing: hola@neuri.tech (el de los términos); sin «pasa a una persona».
 * 5) Éxito: «Conectar mi Instagram ahora» es el botón principal (btn go), no un link de texto.
 * 6) En celular (EN) la barra fija se esconde junto al formulario y el globo no tapa su botón ni al entrar.
 * Sirve el repo en local. Uso: node scripts/bots-onboarding-1124-test.mjs
 */
import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const leer = (f) => readFileSync(join(ROOT, f), "utf8");
let fallas = 0;
const mal = (m) => {
  console.error(`✗ ${m}`);
  fallas++;
};

const PAGINAS = [
  ["sigue-disponible/index.html", "alta", "assets/sd-alta.es.js"],
  ["en/still-available/index.html", "signup", "assets/sd-alta.en.js"],
];
for (const [f, id, js] of PAGINAS) {
  const s = leer(f);
  const ini = s.indexOf(`<section id="${id}"`);
  const alta = s.slice(ini, s.indexOf("</section>", ini));
  if (ini < 0) mal(`${f}: no encontré la sección #${id}`);
  // 1) Automation First
  const m = alta.match(/reach out|Te escribimos (en menos de 24 horas|para armar)|te contactamos|we'll contact you/i);
  if (m) mal(`${f}: el alta dice «${m[0]}» (Automation First: se arma sola)`);
  // 2) Marketplace no preseleccionado
  if (/value="Facebook Marketplace" checked/.test(alta)) mal(`${f}: «Marketplace» viene preseleccionado`);
  if (!/name="donde" value="Instagram" checked/.test(alta)) mal(`${f}: «Instagram» debería venir marcado (sí se conecta)`);
  // 4) Un solo correo de soporte, sin «una persona»
  if (/soporte@neuri\.tech|support@neuri\.tech/.test(s)) mal(`${f}: aparece otro correo de soporte además de hola@`);
  const p = s.match(/pasa a una persona de Neuri|goes to a person at Neuri|a person at Neuri/);
  if (p) mal(`${f}: «${p[0]}» (soporte: escríbenos a hola@neuri.tech)`);
  // 3) y 5) pantalla de éxito
  const a = leer(js);
  const ok = a.slice(a.indexOf("r.connect==='open'&&r.connectUrl?"), a.indexOf("r.connect==='open'&&r.connectUrl?") + 900);
  if (/few days|unos días/.test(ok)) mal(`${js}: el link «dura unos días»; el código dice 14`);
  if (!/14 (days|días)/.test(ok)) mal(`${js}: la pantalla de éxito no dice que el link dura 14 días`);
  if (!/<a class="btn go" href="'\+r\.connectUrl/.test(ok)) mal(`${js}: «Conectar mi Instagram» no es el botón principal (btn go)`);
}

// 6) Navegador: barra fija y globo a 390 px.
const TIPOS = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };
const server = createServer((req, res) => {
  let f = join(ROOT, normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!f.startsWith(ROOT) || !existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": TIPOS[extname(f)] || "application/octet-stream" });
  createReadStream(f).pipe(res);
});
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  ({ chromium } = await import("playwright"));
}
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const exe = process.env.CHROME || (existsSync("/Applications/Google Chrome.app") ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
for (const [ruta, id] of [["/sigue-disponible/", "alta"], ["/en/still-available/", "signup"]]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|fonts\.googleapis\.com|fonts\.gstatic\.com)/, (r) =>
    r.request().url().endsWith("/api/vendedor/estado")
      ? r.fulfill({ status: 200, contentType: "application/json", body: '{"activo":true}' })
      : r.abort(),
  );
  await page.goto(base + ruta, { waitUntil: "networkidle" });
  // Junto al formulario la barra no debe tapar los campos.
  await page.evaluate((id) => scrollTo({ top: document.getElementById(id).getBoundingClientRect().top + scrollY + 200, behavior: "instant" }), id);
  await page.waitForTimeout(700);
  if (await page.evaluate(() => document.querySelector(".dock")?.classList.contains("show")))
    mal(`${ruta}: la barra fija sigue visible encima del formulario`);
  // Al entrar la barra (un solo gesto, medido a media transición) el globo ya va arriba de su botón.
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(700);
  await page.evaluate(() => scrollTo({ top: 1400, behavior: "instant" }));
  for (const espera of [120, 900]) {
    await page.waitForTimeout(espera);
    const m = await page.evaluate(() => {
      const R = (e) => e.getBoundingClientRect();
      const d = document.querySelector(".dock.show");
      const btn = d?.querySelector(".btn");
      const l = document.getElementById("neuri-vendedor")?.shadowRoot?.querySelector(".l");
      if (!btn || !l) return { falta: !btn ? "barra" : "globo" };
      // Posición final del botón (sin la transformación de entrada de la barra).
      const t = new DOMMatrixReadOnly(getComputedStyle(d).transform === "none" ? undefined : getComputedStyle(d).transform).m42;
      const b = R(btn);
      const g = R(l);
      return { btnTop: Math.round(b.top - t), btnRight: Math.round(b.right), gBottom: Math.round(g.bottom), gLeft: Math.round(g.left), gW: Math.round(g.width) };
    });
    const ok = !m.falta && m.gW > 0 && (m.gBottom <= m.btnTop || m.gLeft >= m.btnRight);
    if (!ok) mal(`${ruta}: a ${espera} ms el globo tapa «Quiero mi asistente» ${JSON.stringify(m)}`);
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(fallas ? `${fallas} fallas` : "OK bots-onboarding-1124");
process.exit(fallas ? 1 : 0);
