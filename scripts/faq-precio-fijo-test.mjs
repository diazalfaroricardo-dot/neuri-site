// A249: la FAQ «¿Me cobran por cada mensaje o cliente?» existe en las 3 copias (JSON-LD, HTML, datos JS) ES/EN
// y el tope que promete (1,000 al día) es el mismo que usa el servidor (packages/sd-setup META_DAILY_CAP).
// Uso: node scripts/faq-precio-fijo-test.mjs [--live]
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
const live = process.argv.includes("--live");
const pages = [
  ["sigue-disponible/index.html", "¿Me cobran por cada mensaje o cliente?", "1,000 mensajes al día"],
  ["en/still-available/index.html", "Do you charge per message or per contact?", "1,000 messages a day"],
];
let fail = 0;
for (const [p, q, cap] of pages) {
  const html = live ? await (await fetch(`https://neuri.tech/${p.replace("index.html", "")}`)).text() : readFileSync(p, "utf8");
  const n = html.split(q).length - 1;
  const ok = n === 3 && html.includes(cap);
  if (!ok) fail++;
  console.log(`${ok ? "OK   " : "FALLA"} ${p}${live ? " (en vivo)" : ""} · ${n}/3 copias · tope ${html.includes(cap) ? "✓" : "✗"}`);
}
const send = `${homedir()}/neuri-bazar/packages/sd-setup/src/meta/send.ts`;
if (existsSync(send)) {
  const m = readFileSync(send, "utf8").match(/META_DAILY_CAP = ([\d_]+)/);
  const v = m ? Number(m[1].replace(/_/g, "")) : NaN;
  const ok = v === 1000;
  if (!ok) fail++;
  console.log(`${ok ? "OK   " : "FALLA"} servidor META_DAILY_CAP = ${v} (la FAQ dice 1,000)`);
}
process.exit(fail ? 1 : 0);
