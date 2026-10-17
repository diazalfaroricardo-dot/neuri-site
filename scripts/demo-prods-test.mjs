// A208/A209: «Tus productos» muestra lo que el bot entendió y el link para mandarse el demo por WhatsApp. Uso: node scripts/demo-prods-test.mjs
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { join, normalize, resolve } from "node:path";
import { chromium } from "playwright-core";
const ROOT = resolve(new URL("..", import.meta.url).pathname);
const server = createServer((req, res) => {
  let f = join(ROOT, normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)));
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) return res.writeHead(404).end("no");
  res.writeHead(200, { "content-type": f.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" });
  createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;
const b = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
let fail = 0;
for (const [path, good, bad, ok] of [
  ["/sigue-disponible/?lang=es", "Silla roja $450 MXN; Lámpara $300", "silla bonita", "Entendí"],
  ["/en/still-available/?lang=en", "Red chair $45; Lamp 30 dlls", "nice chair", "Got it"],
]) {
  for (const w of [390, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    const errs = []; p.on("pageerror", (e) => errs.push(String(e)));
    await p.goto(`http://localhost:${port}${path}`);
    const inp = p.locator("#bot-prods");
    await inp.fill(good); await inp.dispatchEvent("change");
    const t1 = await p.locator('[role=status]').filter({ hasText: ok }).innerText().catch(() => "");
    const href = await p.locator("a[data-a209]").getAttribute("href").catch(() => "");
    const dec = decodeURIComponent(href || "");
    const hb = await p.locator("a[data-a209]").boundingBox().catch(() => null);
    const okWa = dec.startsWith("https://wa.me/?text=") && /(productos|products)=/.test(dec) && !/(negocio|business)=&/.test(dec) && (hb?.height ?? 0) >= 44;
    if (!okWa) { fail++; console.log("A209 FALLA", dec, hb); } else console.log("A209", w, dec.slice(20, 160));
    await p.locator("button[data-a212]").click();
    const qrSvg = await p.locator("#nb-qr [data-qr] svg").count();
    const qrUrl = await p.locator("#nb-qr").getAttribute("data-url");
    const qb = await p.locator("#nb-qr [data-qr]").boundingBox().catch(() => null);
    await p.keyboard.press("Escape");
    const qrGone = (await p.locator("#nb-qr").count()) === 0;
    if (!(qrSvg === 1 && /^https:\/\/neuri\.tech\/.+(productos|products)=.+src=demo-qr$/.test(qrUrl || "") && (qb?.width ?? 0) >= 180 && qrGone)) { fail++; console.log("A212 FALLA", qrSvg, qb, qrGone); } else console.log("A212", w, "QR OK");
    await p.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: `http://localhost:${port}` });
    await p.locator("button[data-a213]").click();
    const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(() => "");
    const cTxt = await p.locator("button[data-a213]").innerText();
    if (!(/src=demo-copy$/.test(clip) && /Copiado|Copied/.test(cTxt))) { fail++; console.log("A213 FALLA", clip, cTxt); } else console.log("A213", w, "copia OK");
    await inp.fill(bad); await inp.dispatchEvent("change");
    const t2 = await p.locator('[role=status]').filter({ hasText: /precios|prices/ }).count();
    await inp.fill(""); await inp.dispatchEvent("change");
    const t3 = await p.locator('[role=status]').filter({ hasText: /Entendí|Got it|precios|prices/ }).count();
    const sx = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    const pass = t1.includes("$") && t2 === 1 && t3 === 0 && !sx && !errs.length;
    if (!pass) fail++;
    console.log(path, w, pass ? "OK" : "FALLA", JSON.stringify({ t1, t2, t3, sx, errs }));
    if (w === 390 && path.includes("sigue")) { await inp.fill(good); await inp.dispatchEvent("change"); await inp.scrollIntoViewIfNeeded();  }
    await p.close();
  }
}
await b.close(); server.close(); process.exit(fail ? 1 : 0);
