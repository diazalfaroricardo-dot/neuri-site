/**
 * bots-sd-alta-texto (20-nov): la conexión con Meta ya está abierta (/estado → meta "open"), así que
 * el mensaje después del alta ya no dice «te avisamos cuando la conexión con Meta esté abierta».
 * Lee los dos scripts del alta (ES/EN) y revisa que el ?v= de cada landing sea el md5 del archivo.
 * Uso: node scripts/sd-alta-meta-abierta-test.mjs
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
const leer = (f) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
const casos = [
  ["assets/sd-alta.es.js", "sigue-disponible/index.html", /conexión directa con Meta esté abierta|cuando la conexión con Meta/, /te llega el link para conectar tu Instagram/],
  ["assets/sd-alta.en.js", "en/still-available/index.html", /direct connection with Meta opens|connection with Meta is open/, /get the link to connect your Instagram/],
];
let fallas = 0;
for (const [js, html, viejo, nuevo] of casos) {
  const src = leer(js);
  const v = createHash("md5").update(src).digest("hex").slice(0, 8);
  const ok = !viejo.test(src) && nuevo.test(src) && leer(html).includes(`${js.slice(7)}?v=${v}`);
  console.log(`${ok ? "OK" : "FALLA"} ${js}`);
  if (!ok) fallas++;
}
process.exit(fallas ? 1 : 0);
