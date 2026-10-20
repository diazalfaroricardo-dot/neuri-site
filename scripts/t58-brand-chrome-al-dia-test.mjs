// T58 candado: correr scripts/brand-chrome.py sobre el repo no debe cambiar ninguna página.
// Si falla, alguien editó a mano una página secundaria (o assets/brand.css) sin poner al día el generador,
// y la próxima corrida del script borraría ese cambio (p. ej. menu-esc.js o el pie EN → /en/legal/).
// Uso: node scripts/t58-brand-chrome-al-dia-test.mjs
import { cpSync, mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const R = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(R, "scripts/brand-chrome.py"), "utf8");
const block = src.slice(src.indexOf("PAGES = {"), src.indexOf("}", src.indexOf("PAGES = {")));
const pages = [...block.matchAll(/^\s+"([^"]+)":/gm)].map((m) => m[1]);
if (pages.length < 10) { console.error("T58: no pude leer PAGES"); process.exit(1); }

const tmp = mkdtempSync(join(tmpdir(), "t58-"));
let fallas = 0;
try {
  cpSync(join(R, "scripts"), join(tmp, "scripts"), { recursive: true });
  cpSync(join(R, "assets"), join(tmp, "assets"), { recursive: true });
  for (const p of pages) {
    const f = p.endsWith(".html") ? p : p + "index.html";
    if (!existsSync(join(R, f))) { console.error("T58 falta", f); fallas++; continue; }
    cpSync(join(R, f), join(tmp, f), { recursive: true });
  }
  execFileSync("python3", [join(tmp, "scripts/brand-chrome.py")], { stdio: "ignore" });
  for (const p of pages) {
    const f = p.endsWith(".html") ? p : p + "index.html";
    if (!existsSync(join(R, f))) continue;
    if (readFileSync(join(R, f), "utf8") !== readFileSync(join(tmp, f), "utf8")) {
      console.error("T58 ✗ brand-chrome.py cambiaría", f); fallas++;
    }
  }
  // Lo que antes se perdía al regenerar:
  for (const p of pages) {
    const f = p.endsWith(".html") ? p : p + "index.html";
    const h = readFileSync(join(R, f), "utf8");
    if (!h.includes('src="/assets/menu-esc.js"')) { console.error("T58 ✗ sin menu-esc.js", f); fallas++; }
    // B-N3 (T59): toda tabla con scroll horizontal se alcanza con teclado (axe scrollable-region-focusable)
    const sinFoco = (h.match(/<div class="tabla"(?![^>]*tabindex="0")[^>]*>/g) || []).length;
    if (sinFoco) { console.error(`T59 ✗ ${sinFoco} tabla(s) con scroll sin tabindex`, f); fallas++; }
    if (/^en\//.test(f) && /aria-label="Footer"[\s\S]*?href="\/legal\/">Privacy/.test(h)) { console.error("T58 ✗ pie EN liga a /legal/ en español", f); fallas++; }
  }
} finally { rmSync(tmp, { recursive: true, force: true }); }
if (fallas) { console.error(`T58 FALLA (${fallas})`); process.exit(1); }
console.log(`T58 OK — ${pages.length} páginas al día con brand-chrome.py (menu-esc.js y pie EN → /en/legal/)`);
