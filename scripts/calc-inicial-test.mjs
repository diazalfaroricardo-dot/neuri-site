// B-A7 (auditoría 19-oct): la calculadora de ventas perdidas decía «$0» junto a «72 ventas»
// hasta que se montaba la demo. Candado: lo pintado en el HTML y el estado inicial del JS
// coinciden con la fórmula de los valores por defecto de los deslizadores.
import { readFileSync } from "node:fs";

const casos = [
  ["sigue-disponible/index.html", "assets/sd-demo.es.js"],
  ["en/still-available/index.html", "assets/sd-demo.en.js"],
];
let fallas = 0;
for (const [html, js] of casos) {
  const h = readFileSync(html, "utf8");
  const s = readFileSync(js, "utf8");
  const val = (id) => Number(new RegExp(`id="${id}"[^>]*value="(\\d+)"`).exec(h)?.[1]);
  const [m, l, c, t] = ["lc-msgs", "lc-late", "lc-close", "lc-ticket"].map(val);
  const ventas = Math.round(m * 30 * (l / 100) * (c / 100));
  const dinero = Math.round(m * 30 * (l / 100) * (c / 100) * t);
  const shown = `$${dinero.toLocaleString("en-US")}`;
  // v3 (25-oct): la landing ES ya no pinta la calculadora con la plantilla; la pinta assets/bots-v3.js con la misma fórmula
  const v3 = h.includes('id="o-r"');
  const ok = v3 ? h.includes(`id="o-r">${shown}<`) && h.includes(`id="o-v">${ventas}<`) && /m\*30\*\(l\/100\)\*\(cl\/100\)/.test(readFileSync("assets/bots-v3.js", "utf8")) :
    h.includes(`color: #F7B48C">${shown}</span>`) &&
    !h.includes('color: #F7B48C">$0</span>') &&
    h.includes(` ${ventas} `) &&
    new RegExp(`lcMsgs: ${m}, lcLate: ${l}, lcClose: ${c}, lcTicket: ${t}, lostAnim: ${dinero},`).test(s);
  console.log(`${ok ? "OK " : "FALLA"} ${html}: ${shown} · ${ventas} ventas`);
  if (!ok) fallas++;
}
process.exit(fallas ? 1 : 0);
