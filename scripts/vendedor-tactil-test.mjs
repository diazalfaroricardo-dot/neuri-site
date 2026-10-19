// B-N2/B-A10: los toques del vendedor de IA (cerrar, sugerencias, enviar, link, «Empezar de nuevo») miden ≥44 px.
// Hallado 19-oct en vivo: cerrar 40 px, sugerencias 36 px, «Start over» 32 px.
import { readFileSync } from "node:fs";
const s = readFileSync(new URL("../assets/vendedor.js", import.meta.url), "utf8");
const rule = (sel) => (s.match(new RegExp("\\n\\" + sel + "\\{([^}]*)\\}")) || [])[1] || "";
const px = (css, prop) => { const m = css.match(new RegExp("(?:^|;)" + prop + ":(\\d+)px")); return m ? +m[1] : 0; };
const fallas = [];
for (const [sel, props] of [[".x", ["height", "width"]], [".s", ["height", "width"]], [".q", ["min-height"]], [".c", ["min-height"]], [".r", ["min-height"]], [".l", ["height"]]]) {
  const css = rule(sel);
  for (const p of props) if (px(css, p) < 44) fallas.push(`${sel} ${p}=${px(css, p)}px`);
}
if (fallas.length) { console.error("vendedor-tactil: toques < 44 px →", fallas.join(", ")); process.exit(1); }
console.log("vendedor-tactil OK: 6 controles ≥44 px");
