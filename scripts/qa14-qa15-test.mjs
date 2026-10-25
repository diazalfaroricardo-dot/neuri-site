// QA #14: a 390 px el link «¿Dudas? Pregúntalas aquí…» de la banda verde final queda dentro de la tarjeta (se parte en líneas).
// QA #15: la ayuda del celular dice lo mismo en ES y EN (10 dígitos; fuera de EE. UU., la clave del país).
// Uso: node scripts/qa14-qa15-test.mjs [--live]
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
const req = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`);
const { chromium } = req("./index.js");
const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const live = process.argv.includes("--live");
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0;
const pages = [["/sigue-disponible/", "es", /^10 dígitos\. Si no es de EE\. UU\., agrega la clave de tu país/], ["/en/still-available/", "en", /^10 digits\. Outside the US\? Add your country code/]];
for (const w of [390, 1280]) {
  for (const [path, lang, hint] of pages) {
    const c = await b.newContext({ viewport: { width: w, height: 800 }, timezoneId: "Europe/Madrid", locale: lang });
    if (!live) {
      await c.route("https://neuri.tech/**", (r) => {
        const p = new URL(r.request().url()).pathname;
        const f = root + p + (p.endsWith("/") ? "index.html" : "");
        if (!existsSync(f)) return r.fulfill({ status: 404, body: "" });
        const ct = f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : f.endsWith(".html") ? "text/html" : "application/octet-stream";
        r.fulfill({ status: 200, body: readFileSync(f), contentType: ct });
      });
      await c.route(/^(?!https:\/\/neuri\.tech).*/, (r) => r.abort());
    }
    const p = await c.newPage();
    await p.goto("https://neuri.tech" + path + (live ? `?t=${Date.now()}` : ""), { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(live ? 1500 : 400);
    const res = await p.evaluate(() => {
      const out = [];
      for (const a of document.querySelectorAll('a[href="#preguntas"]')) {
        if (!/Pregúntalas aquí|Ask here/.test(a.textContent) || !a.offsetParent) continue;
        let card = a.parentElement;
        while (card && getComputedStyle(card).backgroundColor === "rgba(0, 0, 0, 0)") card = card.parentElement;
        const r = a.getBoundingClientRect(), cr = card.getBoundingClientRect();
        out.push({ right: Math.round(r.right), card: Math.round(cr.right), vw: document.documentElement.clientWidth });
      }
      return { out, hint: document.getElementById("h-wa")?.textContent.trim() ?? "" };
    });
    const linkOk = res.out.length > 0 && res.out.every((x) => x.right <= x.card && x.right <= x.vw);
    const hintOk = hint.test(res.hint);
    if (!linkOk || !hintOk) fail++;
    console.log(linkOk && hintOk ? "OK  " : "FAIL", w, path, JSON.stringify(res.out), "|", res.hint);
    await c.close();
  }
}
await b.close();
if (fail) { console.log(fail, "fallas"); process.exit(1); }
console.log("qa14-qa15 OK");
