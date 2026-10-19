/**
 * Chequeo de marca de TODO el sitio: abre cada .html (390 y 1280 px, modo claro y oscuro) y lee
 * los estilos YA CALCULADOS de cada elemento visible (color, fondo, bordes, fill/stroke de SVG y
 * font-family). Falla si:
 *   - un color no está en la paleta del producto al que pertenece la página (por su ruta), o
 *   - la primera fuente de un elemento con texto no es de marca (Geist / Geist Mono; Instrument
 *     Serif solo en neuri.consulting), o
 *   - falta lo básico de marca: <html lang> correcto, favicon, <footer>, hreflang a la contraparte,
 *     og:image del producto.
 * Las paletas salen de lo que pintan las landings (fuente de verdad) y de assets/brand.css.
 * Si una landing cambia de color a propósito, agrega el hex aquí.
 *
 * Uso: node scripts/brand-check.mjs [filtro]     (DUMP=1 imprime los colores vistos por página)
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";
import { homedir } from "node:os";
import { allPages } from "./brand-pages.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
// Contraste WCAG AA con axe-core (regla color-contrast). AXE=ruta opcional; sin él se avisa y se omite.
const AXE = [process.env.AXE, join(homedir(), "neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js"), "/home/claude/neuri-bazar/node_modules/.pnpm/axe-core@4.10.3/node_modules/axe-core/axe.min.js"].find((x) => x && existsSync(x));
const axeSrc = AXE ? readFileSync(AXE, "utf8") : "";

export function productOf(path) {
  if (/^\/(en\/)?(sigue-disponible|still-available)\//.test(path)) return "bots";
  if (/^\/(bazar\/|en\/bazar\/|en\/$)/.test(path)) return "bazar";
  if (/^\/(consultoria|en\/ai-consulting)\//.test(path)) return "consulting";
  if (/^\/(en\/)?marketing\//.test(path)) return "marketing";
  return "home";
}

// Comunes a todas: blanco/negro y el «ink» casi negro de Neuri, menta y durazno de los planetas del
// vendedor de IA (vendedor.js pinta los 3 productos en órbita en cualquier página).
const COMMON = ["#FFFFFF", "#000000", "#05080D", "#04060A", "#8FE0B4", "#F3B38F", "#FFC857", "#B4441A", "#C2341D", "#0B5E3A"];
export const PALETTE = {
  home: ["#E9EEF2", "#9AA6B2", "#6E7A86", "#0B1118", "#111922", "#B7C2CC", "#1B2530", "#4F5A64", "#7D8994", "#C5CED6", "#67E8F9", "#7DD3FC", "#FF8A7A", "#E9FFF4", "#070A10", "#FCA5A5", "#B5EDCD"],
  bots: ["#F6F4EE", "#3D4A44", "#56635C", "#E1E3DC", "#E3EFE7", "#C5D2CB", "#9A3D12", "#FCE9DC", "#EEF0EA", "#8FA79A", "#D5D9D2", "#F2F7F3", "#6B7A72", "#2F4339", "#24372E", "#E6ECE8", "#8A3510", "#6E2C0D", "#084A2D", "#B9CBBF", "#2A3B33", "#F2C14E", "#FFF7E0", "#F5E6B8", "#6B4E12", "#FAFAF7"],
  bazar: ["#F7F1E8", "#5E554C", "#CFC4B4", "#0E6B6B", "#E6DBC9", "#4E463E", "#D9CCB8", "#4A4239", "#3A332C", "#EFE6D8", "#716658", "#6F6559", "#2B2520", "#DCEDEC", "#8A3313", "#F3DCCD", "#CDE5E4", "#A89C8C", "#9FCFCC", "#F6E7DA"],
  consulting: ["#FBFAF7", "#0A1A14", "#4B5B54", "#5E6B64", "#E4E1DA", "#D3CFC6", "#1F7A52", "#145C3C", "#B4532A", "#EAF3EE", "#E3EFE7", "#C5D2CB"],
  marketing: ["#FFF8F2", "#0B1118", "#34404A", "#5B6670", "#F4ECE4", "#FF5B45", "#C2341D", "#0E7C66", "#1B0B06", "#1E6B57", "#FF8B79", "#FF8A7A", "#111922", "#16202A", "#C9D2DA", "#9AA6B2", "#F0E4DA", "#EADFD5", "#9E2914"],
};
// Colores de ilustración que pintan las propias landings (maquetas de chat, avatares, gráficas,
// mapa de puestos, paneles de la consola). Son parte del diseño aprobado de la landing.
const ILLUSTRATION = {
  home: ["#080C12", "#0A0E14"],
  bots: ["#0B1310", "#1C2A24", "#1E2D26", "#7F7F7F", "#C9D6F5", "#D4F2E1", "#ECECEC", "#F5D9E8", "#F7B48C", "#FFE9A8"],
  bazar: ["#0B4A4A", "#0B5555", "#0F0D0B", "#7A5A1E", "#7FC4C2", "#8A5A12", "#A6CDA0", "#A99D8D", "#C9B6E4", "#D8E6D2", "#D9B88F", "#DCCDB4", "#E0A090", "#E6E0F0", "#E8CD8C", "#E8D9C2", "#E8DFD2", "#EADFCD", "#ECE5DA", "#EFE7DA", "#F0C987", "#F5E6B8", "#FFD3BA"],
  consulting: ["#66726B", "#7F978C", "#8FA79C", "#93AA9F", "#A9BDB4", "#DDD8CE", "#EAF2EE", "#EEF6F1", "#F1F8F4", "#F5F3EE"],
  marketing: ["#3B2A20", "#DDF5EA", "#F1E7DD", "#3B3B3B", "#767676", "#858585"],
};
// Animaciones y degradados (p. ej. el resplandor coral de marketing) dan tonos intermedios:
// un color a ≤ TOL (distancia RGB) de uno de la paleta cuenta como ese color.
const TOL = { marketing: 48 }; // el texto «grad» de marketing anima entre coral y durazno
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const near = (c, set, tol = 24) => set.has(c) || [...set].some((a) => { const x = rgb(a), y = rgb(c); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) <= tol; });
const FONTS = { default: ["Geist", "Geist Mono"], consulting: ["Geist", "Geist Mono", "Instrument Serif"] };
const OG = { home: /\/og\/neuri\.png|\/og\/marketing-(es|en)\.png/, bots: /\/og\/bots-(es|en)\.png/, bazar: /\/og\/bazar-(es|en)\.png/, consulting: /./, marketing: /\/og\/marketing-(es|en)\.png/ };

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".json": "application/json", ".pdf": "application/pdf" };

const isMain = process.argv[1] && new URL(import.meta.url).pathname === process.argv[1];
if (isMain) {
  const server = createServer((req, res) => {
    let f = join(ROOT, normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)));
    if (!f.startsWith(ROOT)) return res.writeHead(403).end();
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
    if (!existsSync(f)) return res.writeHead(404).end("no");
    res.writeHead(200, { "content-type": TYPES[extname(f)] ?? "application/octet-stream" });
    res.end(readFileSync(f));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const exe = ["/opt/pw-browsers/chromium", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((x) => existsSync(x));
  const browser = await chromium.launch({ executablePath: process.env.CHROME || exe });
  const filter = process.argv[2] || "";
  const fails = [];
  const pages = allPages(ROOT).filter((p) => p.includes(filter));
  for (const path of pages) {
    const prod = productOf(path);
    const allowed = new Set([...COMMON, ...PALETTE[prod], ...ILLUSTRATION[prod]]);
    const fonts = FONTS[prod] || FONTS.default;
    const src = readFileSync(join(ROOT, path.endsWith(".html") ? path : path + "index.html"), "utf8");
    const bad = (m) => fails.push(`${path} [${prod}]: ${m}`);
    // — Básicos estáticos —
    const lang = /^\/en\//.test(path) ? "en" : "es";
    const redirect = /http-equiv="refresh"/.test(src);
    if (!new RegExp(`<html[^>]*lang="${lang}`).test(src)) bad(`<html lang> no es «${lang}»`);
    if (!/<link rel="icon"/.test(src)) bad("sin favicon");
    if (!redirect) {
      if (!/<footer/.test(src)) bad("sin <footer>");
      if (!/fonts\.googleapis\.com\/css2\?family=Geist/.test(src)) bad("no carga Geist de Google Fonts");
      const og = src.match(/property="og:image" content="([^"]+)"/);
      const prodImg = og && new RegExp(`^https://neuri\\.tech${path.replace(/\/$/, "")}/`).test(og[1]);
      if (og && !OG[prod].test(og[1]) && !prodImg) bad(`og:image de otro producto: ${og[1]}`);
      if (path !== "/404.html" && !/hreflang="(en|es)"/.test(src)) bad("sin link al otro idioma (hreflang)");
    }
    for (const scheme of ["light", "dark"]) {
      for (const width of [390, 1280]) {
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme, reducedMotion: "reduce" });
        const p = await ctx.newPage();
        await p.route(/^https:\/\/(consulting|sd|bazar|marketing)\.neuri\.tech\//, (r) =>
          r.fulfill({ status: 503, headers: { "access-control-allow-origin": base, "access-control-allow-credentials": "true" }, contentType: "application/json", body: "{}" }),
        );
        await p.route(/vendedor\.js/, (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
        await p.goto(base + path + "?lang=" + lang, { waitUntil: "load" }).catch(() => {});
        if (redirect) await p.waitForTimeout(300);
        const r = await p.evaluate(() => {
          const hex = (c) => {
            const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
            if (!m || (m[4] !== undefined && +m[4] === 0)) return null;
            return "#" + [m[1], m[2], m[3]].map((x) => (+x).toString(16).padStart(2, "0").toUpperCase()).join("");
          };
          const colors = new Map();
          const fonts = new Map();
          const add = (map, k, el) => { if (k && !map.has(k)) map.set(k, (el.id ? "#" + el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "")) + " «" + (el.textContent || "").trim().slice(0, 30) + "»"); };
          for (const el of document.querySelectorAll("body *")) {
            if (el.closest("template,script,style,noscript,[aria-hidden=true] svg defs")) continue;
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden") continue;
            const rc = el.getBoundingClientRect();
            if (!rc.width || !rc.height || rc.right <= 0 || rc.bottom <= 0 || rc.left >= innerWidth) continue;
            if (el instanceof SVGElement) {
              if (cs.fill && !cs.fill.startsWith("url")) add(colors, hex(cs.fill), el);
              if (cs.stroke && cs.stroke !== "none" && !cs.stroke.startsWith("url")) add(colors, hex(cs.stroke), el);
              continue;
            }
            if (el.tagName === "IMG" || el.tagName === "VIDEO" || el.tagName === "CANVAS" || el.tagName === "IFRAME") continue;
            const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
            if (own) {
              add(colors, hex(cs.color), el);
              add(fonts, cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(), el);
            }
            add(colors, hex(cs.backgroundColor), el);
            for (const s of ["Top", "Right", "Bottom", "Left"])
              if (parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none") add(colors, hex(cs[`border${s}Color`]), el);
          }
          add(colors, hex(getComputedStyle(document.body).backgroundColor), document.body);
          return { colors: [...colors], fonts: [...fonts], over: document.documentElement.scrollWidth - innerWidth };
        });
        const tag = `@${width}/${scheme}`;
        if (axeSrc) {
          // Con movimiento reducido y tras las entradas animadas (si no, axe mide colores a medio desvanecer).
          await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
          await p.waitForTimeout(1200);
          await p.addScriptTag({ content: axeSrc });
          const v = await p.evaluate(async () => (await window.axe.run(document, { runOnly: ["color-contrast"] })).violations);
          for (const x of v) for (const n of x.nodes.slice(0, 5)) bad(`${tag} contraste AA: ${n.target.join(" ")} — ${(n.any[0] && n.any[0].message) || x.help}`);
        }
        if (process.env.DUMP) console.log(path, tag, r.colors.map((c) => c[0]).join(" "));
        for (const [c, where] of r.colors) if (!near(c, allowed, TOL[prod])) bad(`${tag} color fuera de paleta ${c} en ${where}`);
        for (const [f, where] of r.fonts) if (!fonts.includes(f)) bad(`${tag} fuente fuera de marca «${f}» en ${where}`);
        if (r.over > 0) bad(`${tag} scroll horizontal +${r.over}px`);
        await ctx.close();
      }
    }
  }
  await browser.close();
  server.close();
  if (!axeSrc) console.log("aviso: sin axe-core, se omitió el contraste (AXE=ruta/axe.min.js)");
  const uniq = [...new Set(fails)];
  if (uniq.length) {
    console.error(uniq.join("\n"));
    console.error(`✗ brand-check: ${uniq.length} problema(s) en ${pages.length} páginas`);
    process.exit(1);
  }
  console.log(`✓ brand-check: ${pages.length} páginas × 390/1280 × claro/oscuro con paleta y tipografía de su producto`);
}
