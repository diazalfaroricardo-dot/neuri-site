// A250: la FAQ «¿Quién me ayuda si algo falla?» existe en las 3 copias (JSON-LD, HTML, datos JS) ES/EN
// y lo que promete existe en el servidor (packages/sd-setup/src/support.ts: revisión «algo_mal» → ticket a una persona).
// Uso: node scripts/faq-ayuda-test.mjs [--live]
import { readFileSync, existsSync } from "node:fs";
import { landingSource } from "./landing-src.mjs";
import { homedir } from "node:os";
const live = process.argv.includes("--live");
const pages = [
  ["sigue-disponible/index.html", "¿Quién me ayuda si algo falla?"],
  ["en/still-available/index.html", "Who helps me if something breaks?"],
];
let fail = 0;
for (const [p, q] of pages) {
  const html = await landingSource(p, live);
  const n = html.split(q).length - 1;
  const ok = n === 3;
  if (!ok) fail++;
  console.log(`${ok ? "OK   " : "FALLA"} ${p}${live ? " (en vivo)" : ""} · ${n}/3 copias`);
}
const sup = `${homedir()}/neuri-bazar/packages/sd-setup/src/support.ts`;
if (existsSync(sup)) {
  const s = readFileSync(sup, "utf8");
  const ok = s.includes('"algo_mal"') && /ticket/i.test(s);
  if (!ok) fail++;
  console.log(`${ok ? "OK   " : "FALLA"} servidor: revisión «algo_mal» y ticket a una persona existen`);
}
process.exit(fail ? 1 : 0);
