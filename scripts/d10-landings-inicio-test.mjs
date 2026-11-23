/**
 * d10-landings-es-home (D-10, 22-nov-2026) — candado del «inicio» de las landings.
 * La portada en inglés vive en / y la española en /es/. En cada landing de app y sus páginas
 * (bots, bazar, marketing, consultoría; ES y EN):
 *   - en español, el logo y el link «neuri.tech» van a /es/ (nunca a / ni a https://neuri.tech/);
 *   - en inglés, van a / (nunca a /en/home/, que es solo una redirección);
 *   - og:locale es es_US / en_US (nunca es_MX).
 * Además, en todo el sitio no queda ningún og:locale es_MX.
 * Uso: node scripts/d10-landings-inicio-test.mjs [--live]   (--live revisa https://neuri.tech en vez del repo)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const LIVE = process.argv.includes("--live");
const LANDINGS = ["sigue-disponible/", "marketing/", "bazar/", "consultoria/", "en/still-available/", "en/marketing/", "en/bazar/", "en/ai-consulting/"];
const SKIP = new Set(["node_modules", ".git", "scripts", "docs", "tools", "tmp", "assets", "img"]);

function walk(d, out = []) {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n) || n.startsWith(".") || n.startsWith("preview-")) continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (n.endsWith(".html")) out.push(relative(ROOT, p));
  }
  return out;
}

const errores = [];
const bad = (rel, m) => errores.push(`✗ ${rel}: ${m}`);
const todas = walk(ROOT);
const get = async (rel) => {
  if (!LIVE) return readFileSync(join(ROOT, rel), "utf8");
  const url = "https://neuri.tech/" + rel.replace(/index\.html$/, "");
  const r = await fetch(url, { cache: "no-store" });
  if (r.status !== 200) throw new Error(`${url} → ${r.status}`);
  return r.text();
};

let revisadas = 0;
for (const rel of todas) {
  const enLanding = LANDINGS.some((x) => rel.startsWith(x));
  const h = enLanding ? await get(rel) : readFileSync(join(ROOT, rel), "utf8");
  if (/og:locale"\s+content="es_MX"/.test(h)) bad(rel, "og:locale es_MX (debe ser es_US)");
  if (!enLanding || /http-equiv=["']refresh/i.test(h)) continue;
  revisadas++;
  const lang = (h.match(/<html[^>]*\blang="([a-z]+)/) || [])[1];
  const anchors = [...h.matchAll(/<a\b([^>]*)>([\s\S]{0,400}?)<\/a>/g)];
  // Logo: class logo/nb-logo, o el <a> del encabezado de bazar que envuelve el wordmark (display:flex).
  const inicio = anchors.filter(([, a, t]) => /class="[^"]*\b(nb-logo|logo)\b/.test(a) || /display:\s*flex/.test(a) || /^\s*neuri\.tech\s*$/.test(t));
  const loc = (h.match(/<meta property="og:locale" content="([^"]+)"/) || [])[1];
  if (lang === "es") {
    if (loc && loc !== "es_US") bad(rel, `og:locale ${loc} (esperado es_US)`);
    for (const [, a] of inicio) {
      const href = (a.match(/\bhref="([^"]*)"/) || [])[1];
      if (href === "/" || href === "https://neuri.tech/" || href === "https://neuri.tech")
        bad(rel, `logo/«neuri.tech» en español va a ${href} (portada en inglés); debe ir a /es/`);
    }
    if (/href="(https:\/\/neuri\.tech)?\/en\/home\/?"/.test(h)) bad(rel, "enlaza /en/home/ (redirección)");
  } else if (lang === "en") {
    if (loc && loc !== "en_US") bad(rel, `og:locale ${loc} (esperado en_US)`);
    if (/href="(https:\/\/neuri\.tech)?\/en\/home\/?"/.test(h)) bad(rel, "logo/«neuri.tech» en inglés va a /en/home/ (redirección); debe ir a /");
    for (const [, a] of inicio) {
      const href = (a.match(/\bhref="([^"]*)"/) || [])[1];
      if (href === "/es/" || href === "https://neuri.tech/es/") bad(rel, `logo/«neuri.tech» en inglés va a ${href}; debe ir a /`);
    }
  } else bad(rel, `<html lang> desconocido: ${lang}`);
}

// Las principales deben tener el logo al inicio de su idioma (no solo «no ir mal»).
const deben = {
  "sigue-disponible/index.html": "/es/", "marketing/index.html": "/es/", "bazar/index.html": "/es/",
  "en/still-available/index.html": "/", "en/marketing/index.html": "/", "en/bazar/index.html": "/",
};
for (const [rel, href] of Object.entries(deben)) {
  const h = await get(rel);
  const n = (h.match(new RegExp(`<a\\b[^>]*href="${href.replace(/\//g, "\\/")}"`, "g")) || []).length;
  if (!n) bad(rel, `ningún link a ${href} (logo/«neuri.tech»)`);
}

if (errores.length) {
  console.error(errores.join("\n"));
  console.error(`d10-landings-inicio: ${errores.length} errores`);
  process.exit(1);
}
console.log(`✓ d10-landings-inicio${LIVE ? " (en vivo)" : ""}: ${revisadas} páginas de landings con el inicio de su idioma (ES → /es/, EN → /), og:locale *_US y sin es_MX en ${todas.length} archivos`);
