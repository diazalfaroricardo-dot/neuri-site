// B-E1 (neuri.bots): la caja «¿Tienes una duda?» de la landing vive en una plantilla que el demo vuelve a clonar
// cada pocos cientos de ms. Al clonarse se perdía el foco y lo que seguías escribiendo no entraba: quedaba «Hay co».
// Se escribe tecla por tecla, antes y después de que arranque el demo del hero, y en medio el cursor no se mueve.
// Uso: node scripts/ayuda-escribir-test.mjs [base]   (por defecto el servidor local de correr-pruebas.sh)
import { chromium } from "playwright-core";
const base = process.argv[2] || "http://127.0.0.1:8765";
const b = await chromium.launch({ executablePath: process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const TEXTO = "Hay contrato de permanencia";
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
for (const ruta of ["/sigue-disponible/", "/en/still-available/"]) for (const w of [390, 1280]) for (const espera of [200, 7000]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(base + ruta, { waitUntil: "load" });
  await p.waitForTimeout(espera);
  await p.evaluate(() => document.querySelector("#ayuda-q").scrollIntoView({ block: "center", behavior: "instant" }));
  await p.locator("#ayuda-q").click();
  await p.keyboard.type(TEXTO.slice(0, 20), { delay: 60 });
  await p.keyboard.press("ArrowLeft"); await p.keyboard.press("ArrowLeft");
  await p.waitForTimeout(1200); // varios repintados con el cursor quieto
  await p.keyboard.type("XY", { delay: 60 });
  await p.waitForTimeout(500);
  const v = await p.locator("#ayuda-q").inputValue();
  const foco = await p.evaluate(() => document.activeElement?.id);
  const esperado = TEXTO.slice(0, 18) + "XY" + TEXTO.slice(18, 20);
  ok(v === esperado && foco === "ayuda-q", `${ruta} @${w} tras ${espera} ms: «${v}» foco=${foco}`);
  // Irse del campo: un repintado no le regresa el foco ni abre el teclado otra vez.
  await p.locator("h2").first().click({ force: true }).catch(() => {});
  await p.evaluate(() => document.activeElement?.blur());
  await p.waitForTimeout(1200);
  ok((await p.evaluate(() => document.activeElement?.id)) !== "ayuda-q", `${ruta} @${w}: al salir no recupera el foco`);
  await ctx.close();
}
await b.close();
console.log(fails ? `${fails} fallas` : "todo OK");
process.exit(fails ? 1 : 0);
