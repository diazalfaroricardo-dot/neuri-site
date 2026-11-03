// I8: arma las láminas de 1080×1350 (img/lamina-*.jpg) y las pantallas de la portada (img/pantalla-*.jpg)
// a partir de capturas de 780 px de ancho de las páginas vivas.
// Uso: CHROME=... node scripts/i8-laminas.mjs <carpeta con {bazar,bots,marketing,consulting}-{es,en}.jpg>
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const root = new URL("..", import.meta.url).pathname;
const dir = process.argv[2];
const L = [
  ["1-bazar", "bazar", "neuri.bazar", "Tu bazar, en tu celular.", "Your mall, on your phone.", "Bazar de prueba, con datos de prueba.", "Test bazaar with test data."],
  ["2-bots", "bots", "neuri.bots", "Contesta «¿sigue disponible?» por ti.", "Answers “is this still available?” for you.", "Página de neuri.bots, en vivo.", "neuri.bots live page."],
  ["3-marketing", "marketing", "Neuri Marketing", "Así se ve tu mes de contenido.", "See what your month of content looks like.", "Página de ejemplo: negocio inventado.", "Sample page: made-up business."],
  ["4-consulting", "consulting", "neuri.consulting", "Lee un diagnóstico de ejemplo antes de pagar.", "Read a sample assessment before you pay.", "Diagnóstico de ejemplo: negocio ficticio.", "Sample assessment: fictional business."],
];
const b64 = (f) => `data:image/jpeg;base64,${readFileSync(f).toString("base64")}`;
const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
for (const [n, app, tag, es, en, srcEs, srcEn] of L)
  for (const lang of ["es", "en"]) {
    const src = b64(join(dir, `${app}-${lang}.jpg`));
    await page.setContent(`<!doctype html><meta charset=utf8><style>
      *{box-sizing:border-box}body{margin:0;width:1080px;height:1350px;overflow:hidden;position:relative;font-family:Geist,system-ui,sans-serif;color:#E9EEF2;background:radial-gradient(90% 60% at 50% 95%,rgba(143,224,180,.28),transparent 70%),radial-gradient(70% 40% at 90% 10%,rgba(243,179,143,.16),transparent 70%),#0B1118;padding:72px}
      .t{font:30px "Geist Mono",monospace;color:#8FE0B4}h2{margin:18px 0 0;font-size:72px;line-height:1.05;letter-spacing:-.03em;font-weight:700}
      .p{position:absolute;left:210px;width:660px;top:400px;bottom:-40px;border:14px solid #1b232c;border-radius:64px 64px 0 0;overflow:hidden;background:#fff;box-shadow:0 40px 120px rgba(143,224,180,.25)}.p img{display:block;width:100%}
      .s{position:absolute;left:40px;right:40px;bottom:32px;margin:0;text-align:center;font-size:26px;background:rgba(4,6,10,.85);padding:10px 16px;border-radius:12px;width:fit-content;margin-inline:auto}
    </style><div class=t>${tag}</div><h2>${lang === "es" ? es : en}</h2><div class=p><img src="${src}"></div><p class=s>${lang === "es" ? srcEs : srcEn}</p>`);
    await page.waitForFunction(() => document.images[0].complete);
    await page.screenshot({ path: join(root, "img", `lamina-${n}-${lang}.jpg`), type: "jpeg", quality: 82 });
  }
await browser.close();
