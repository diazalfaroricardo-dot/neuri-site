// T37: neuri.tech/en/ ya no es la landing de neuri.bazar. /en/ redirige al inicio en inglés (/en/home/)
// conservando ?query y #ancla; los anclas viejos de bazar (#precios, #prueba…) van a /en/bazar/ para que
// links y QR impresos tipo neuri.tech/en/#precios sigan sirviendo. La landing EN de bazar vive en /en/bazar/.
// Uso: node scripts/t37-en-home-test.mjs   (lee archivos locales; Playwright con rutas falsas a neuri.tech)
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { createRequire } from "node:module";

const root = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
let fail = 0;
const ok = (c, m) => { console.log(c ? "OK  " : "FAIL", m); if (!c) fail++; };
const read = (r) => readFileSync(join(root, r), "utf8");

// 1. /en/index.html = redirección al inicio en inglés.
const r = read("en/index.html");
ok(/<meta name="robots" content="noindex/.test(r), "/en/ noindex");
ok(r.includes('<link rel="canonical" href="https://neuri.tech/en/home/">'), "/en/ canonical → https://neuri.tech/en/home/");
ok(/http-equiv="refresh" content="0; url=\/en\/home\/"/.test(r), "/en/ meta refresh → /en/home/");
ok(/location\.replace\(/.test(r) && /location\.search/.test(r) && /location\.hash/.test(r), "/en/ location.replace conserva search y hash");
ok(r.length < 5000, `/en/ es una redirección corta (${r.length} B), no la landing`);

// 2. /en/bazar/index.html = landing real con canonical propio.
const b = read("en/bazar/index.html");
ok(!/http-equiv=["']refresh/i.test(b), "/en/bazar/ no es redirección");
ok(b.includes('<link rel="canonical" href="https://neuri.tech/en/bazar/">'), "/en/bazar/ canonical propio");
ok(b.includes('<meta property="og:url" content="https://neuri.tech/en/bazar/">'), "/en/bazar/ og:url propio");
ok(b.includes('hreflang="en" href="https://neuri.tech/en/bazar/"') && b.includes('hreflang="es" href="https://neuri.tech/bazar/"'), "/en/bazar/ hreflang en/es");
ok(b.includes('id="precios"') && b.length > 100000, "/en/bazar/ trae la landing completa (#precios)");
ok(!b.includes('"url": "https://neuri.tech/en/"'), "/en/bazar/ JSON-LD sin la URL vieja /en/");
ok(read("bazar/index.html").includes('hreflang="en" href="https://neuri.tech/en/bazar/"'), "/bazar/ hreflang en → /en/bazar/");

// 3. Ningún HTML enlaza a /en/ pelado (salvo la propia redirección).
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  if (n === "node_modules" || n.startsWith(".")) return [];
  return statSync(p).isDirectory() ? walk(p) : n.endsWith(".html") ? [p] : [];
});
const bare = /(["'])(https:\/\/neuri\.tech)?\/en\/(?=["'#?])/;
const malos = walk(root).map((p) => relative(root, p)).filter((rel) => rel !== "en/index.html" && bare.test(read(rel)));
ok(malos.length === 0, `sin links a "/en/" pelado en HTML (${malos.join(", ") || "0"})`);

// 4. sitemap y llms.txt.
const sm = read("sitemap.xml");
ok(!sm.includes("<loc>https://neuri.tech/en/</loc>"), "sitemap sin <loc>https://neuri.tech/en/</loc>");
ok(sm.includes("<loc>https://neuri.tech/en/bazar/</loc>"), "sitemap con /en/bazar/");
ok(!/neuri\.tech\/en\/[)"\s]/.test(sm + read("llms.txt")), "sitemap y llms.txt sin https://neuri.tech/en/ pelado");

// 5. Navegador: la redirección en sí.
let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)("playwright"));
} catch {
  ({ chromium } = createRequire(`${process.env.HOME}/neuri-bazar/node_modules/.pnpm/playwright-core@1.55.1/node_modules/playwright-core/package.json`)("./index.js"));
}
const br = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
const ctx = await br.newContext();
await ctx.route("https://neuri.tech/**", (rt) => {
  const p = new URL(rt.request().url()).pathname;
  const f = root + p + (p.endsWith("/") ? "index.html" : "");
  if (!existsSync(f) || statSync(f).isDirectory()) return rt.fulfill({ status: 404, body: "" });
  const ct = f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : f.endsWith(".html") ? "text/html" : "application/octet-stream";
  rt.fulfill({ status: 200, body: readFileSync(f), contentType: ct });
});
await ctx.route(/^https:\/\/(?!neuri\.tech\/)/, (rt) => rt.abort());
const page = await ctx.newPage();
for (const [from, to] of [
  ["/en/", "/en/home/"],
  ["/en/?ref=qr", "/en/home/?ref=qr"],
  ["/en/#productos", "/en/home/#productos"],
  ["/en/?ref=qr#precios", "/en/bazar/?ref=qr#precios"],
  ["/en/#prueba", "/en/bazar/#prueba"],
  ["/en/#simula", "/en/bazar/#simula"],
  ["/en/#funciones", "/en/bazar/#funciones"],
  ["/en/#vendedores", "/en/bazar/#vendedores"],
  ["/en/#en-linea", "/en/bazar/#en-linea"],
  ["/en/#demo", "/en/bazar/#demo"],
]) {
  await page.goto("https://neuri.tech" + from, { waitUntil: "domcontentloaded" }).catch(() => {});
  await page.waitForURL((u) => !/\/en\/(\?|#|$)/.test(u.pathname + u.search + u.hash) || u.pathname !== "/en/", { timeout: 5000 }).catch(() => {});
  const u = new URL(page.url());
  ok(u.pathname + u.search + u.hash === to, `${from} → ${to} (${u.pathname + u.search + u.hash})`);
}
await br.close();
console.log(fail ? `t37-en-home: ${fail} falla(s)` : "t37-en-home: OK");
process.exit(fail ? 1 : 0);
