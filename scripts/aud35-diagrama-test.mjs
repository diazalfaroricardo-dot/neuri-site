// AUD35: en celular las etiquetas de los 4 productos del diagrama de la portada chocaban mientras giran
// (37-45% de las muestras a 390 en ES). En celular la etiqueta lleva solo el nombre; el estado sigue en las tarjetas.
// Uso: node scripts/aud35-diagrama-test.mjs [base]
import { chromium } from "playwright-core";
const base = process.argv[2] || "http://127.0.0.1:8765";
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe });
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
for (const ruta of ["/", "/en/home/"]) for (const w of [390, 360]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  await p.goto(base + ruta, { waitUntil: "load" });
  await p.waitForTimeout(800);
  let choques = 0;
  let salen = 0;
  // Dos vueltas parciales, una muestra cada 400 ms: el choque depende del ángulo.
  for (let i = 0; i < 30; i++) {
    const r = await p.evaluate(() => [...document.querySelectorAll(".planet .tag")].map((e) => { const q = e.getBoundingClientRect(); return [q.left, q.top, q.right, q.bottom]; }));
    for (let a = 0; a < r.length; a++) for (let c = a + 1; c < r.length; c++) if (r[a][0] < r[c][2] && r[c][0] < r[a][2] && r[a][1] < r[c][3] && r[c][1] < r[a][3]) choques++;
    if (r.some((q) => q[0] < 0 || q[2] > w)) salen++;
    await p.waitForTimeout(400);
  }
  ok(choques === 0, `${ruta} ${w}: etiquetas sin choque (${choques})`);
  ok(salen === 0, `${ruta} ${w}: etiquetas dentro de la pantalla (${salen})`);
  ok(await p.evaluate(() => [...document.querySelectorAll(".planet a")].length === 4 && [...document.querySelectorAll(".planet .tag b")].every((e) => e.offsetWidth > 0)), `${ruta} ${w}: los 4 nombres se ven`);
  await p.close();
}
const d = await b.newPage({ viewport: { width: 1280, height: 800 } });
await d.goto(base + "/", { waitUntil: "load" });
ok(await d.evaluate(() => [...document.querySelectorAll(".planet .tag small")].every((e) => e.offsetWidth > 0)), "/ 1280: en computadora el estado sigue visible");
await b.close();
process.exit(fails ? 1 : 0);
