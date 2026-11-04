// A133: el alta de bots pregunta «cómo apartas» solo a bazar y ropa, y el texto llega a /intake.
// Uso: node scripts/a133-apartado-test.mjs [base]
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";
const BASE = process.argv[2] || "https://neuri.tech";
for (const f of ["sigue-disponible/index.html", "en/still-available/index.html"])
  assert.ok(readFileSync(f, "utf8").includes('id="apartadoBox" hidden'), `${f}: sin campo apartado`);
const exe = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await chromium.launch({ executablePath: exe, args: ["--headless=new"] });
for (const [path, w] of [["/sigue-disponible/", 390], ["/en/still-available/", 390], ["/sigue-disponible/", 1280], ["/en/still-available/", 1280]]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(BASE + path, { waitUntil: "load" });
  const box = p.locator("#apartadoBox");
  const pick = (g) => p.evaluate((v) => {
    const r = document.querySelector(`input[name=giro][value=${v}]`);
    r.checked = true;
    r.dispatchEvent(new Event("change", { bubbles: true }));
  }, g);
  await pick("comida");
  assert.equal(await box.evaluate((e) => e.hidden), true, `${path} comida debe ocultarlo`);
  await pick("bazar");
  assert.equal(await box.evaluate((e) => e.hidden), false, `${path} bazar debe mostrarlo`);
  // Es el paso 3 del asistente: aquí solo importa que viaje con el formulario, no recorrer los pasos.
  await p.evaluate(() => { document.getElementById("apartado").value = "Con anticipo de $100"; });
  const enviado = await p.evaluate(() => new FormData(document.getElementById("apartado").form).get("apartado"));
  assert.equal(enviado, "Con anticipo de $100", `${path} no viaja en el formulario`);
  await pick("citas");
  assert.equal(await p.inputValue("#apartado"), "", `${path} al cambiar de giro debe vaciarse`);
  assert.deepEqual(errs, [], `${path} errores JS`);
  await p.close();
}
await b.close();
console.log("a133-apartado OK");
