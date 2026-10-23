// Captura la primera pantalla de una URL a 1440 y 390 px. Uso: node scripts/hero-shot.mjs <url> <prefijo>
import { chromium } from "playwright-core";
const [url, pre = "/tmp/hero"] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(Number(process.env.WAIT || 2500));
  await p.screenshot({ path: `${pre}-${w}.png` });
}
await b.close();
