// Lighthouse móvil contra neuri.tech: 3 corridas por landing, se usa la mediana (A286, B-O1).
// Uso: node scripts/lighthouse-vivo.mjs [ruta...]. Sale 1 si alguna mediana queda abajo de 90.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const RUTAS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/en/", "/sigue-disponible/", "/en/still-available/", "/bazar/", "/en/bazar/"];
const CORRIDAS = 3;
const MINIMO = 90;

export const mediana = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

let fallas = 0;
for (const ruta of RUTAS) {
  const puntos = [];
  const detalle = [];
  for (let i = 0; i < CORRIDAS; i++) {
    const out = join(tmpdir(), `lh-${Date.now()}.json`);
    try {
      execFileSync(
        "npx",
        [
          "lighthouse",
          `https://neuri.tech${ruta}`,
          "--only-categories=performance",
          "--quiet",
          "--chrome-flags=--headless=new --no-sandbox",
          "--output=json",
          `--output-path=${out}`,
        ],
        { stdio: "ignore", timeout: 180_000 },
      );
      const r = JSON.parse(readFileSync(out, "utf8"));
      const a = r.audits;
      const p = Math.round(r.categories.performance.score * 100);
      puntos.push(p);
      detalle.push(
        `${p} (FCP ${a["first-contentful-paint"].displayValue}, LCP ${a["largest-contentful-paint"].displayValue}, TBT ${a["total-blocking-time"].displayValue})`,
      );
    } catch (e) {
      detalle.push(`corrida fallida: ${e.message.slice(0, 80)}`);
    }
  }
  const m = puntos.length ? mediana(puntos) : 0;
  const ok = puntos.length === CORRIDAS && m >= MINIMO;
  if (!ok) fallas++;
  console.log(`${ok ? "OK " : "BAJO"} ${ruta} mediana ${m}: ${detalle.join(" · ")}`);
}
process.exit(fallas ? 1 : 0);
