// D-11 (27-nov): las miniaturas de apps de la portada (img/pantalla-*-{es,en}) son capturas actuales en claro.
// La de neuri.bots se había quedado con el hero oscuro viejo; esto evita que vuelva una captura oscura.
// Mide la luminancia media de cada JPG/WebP/AVIF en el navegador y revisa medidas 480×680.
// Uso: node scripts/portada-miniaturas-claras-test.mjs
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const req = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = req("playwright")); } catch { ({ chromium } = req("playwright-core")); }

const root = new URL("..", import.meta.url).pathname;
const MIN = 170; // 0–255; las capturas claras de hoy dan ~225–240, la oscura vieja daba 74
const mime = { jpg: "image/jpeg", webp: "image/webp", avif: "image/avif" };
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK  " : "FALLA ") + m); if (!c) fails++; };
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage();
await page.setContent("<!doctype html><canvas></canvas>");
for (const app of ["bazar", "bots", "marketing", "consulting"])
  for (const lang of ["es", "en"])
    for (const ext of ["jpg", "webp", "avif"]) {
      const f = `img/pantalla-${app}-${lang}.${ext}`;
      const src = `data:${mime[ext]};base64,${readFileSync(root + f).toString("base64")}`;
      const r = await page.evaluate(async (src) => {
        const im = new Image(); im.src = src; await im.decode();
        const c = document.querySelector("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
        const x = c.getContext("2d"); x.drawImage(im, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height).data; let s = 0;
        for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        return { w: c.width, h: c.height, l: Math.round(s / (d.length / 4)) };
      }, src);
      ok(r.w === 480 && r.h === 680, `${f}: ${r.w}×${r.h}`);
      ok(r.l >= MIN, `${f}: luminancia media ${r.l} (mínimo ${MIN}, captura en claro)`);
    }
await browser.close();
console.log(fails ? `${fails} fallas` : "todo bien");
process.exit(fails ? 1 : 0);
