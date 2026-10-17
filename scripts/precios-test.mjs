// A217 — La landing de neuri.bots (ES/EN) anuncia los mismos precios que cobra la app
// (sd-setup planswitch.ts: $899/$1,299 MXN, $49/$69 USD) en el texto visible y en el JSON-LD.
// Uso: node scripts/precios-test.mjs [--live]   (--live revisa también https://neuri.tech)
import { readFileSync } from "node:fs";

const pages = [
  { f: "sigue-disponible/index.html", url: "https://neuri.tech/sigue-disponible/", cur: "MXN", b: "899", p: "1299", vis: ["$899", "$1,299"] },
  { f: "en/still-available/index.html", url: "https://neuri.tech/en/still-available/", cur: "USD", b: "49", p: "69", vis: ["$49", "$69"] },
];
const live = process.argv.includes("--live");
let fail = 0;
const bad = (m) => { fail++; console.error("✗", m); };

for (const pg of pages) {
  const srcs = [["local", readFileSync(pg.f, "utf8")]];
  if (live) srcs.push(["live", await (await fetch(pg.url)).text()]);
  for (const [where, html] of srcs) {
    const offers = [...html.matchAll(/"price": "([0-9.]+)", "priceCurrency": "([A-Z]+)"/g)].map((m) => `${m[1]} ${m[2]}`);
    const want = [`${pg.b} ${pg.cur}`, `${pg.p} ${pg.cur}`];
    if (JSON.stringify(offers) !== JSON.stringify(want)) bad(`${where} ${pg.f}: JSON-LD ${offers} ≠ ${want}`);
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
    for (const v of pg.vis) if (!text.includes(v)) bad(`${where} ${pg.f}: no muestra ${v}`);
    const otros = text.match(/\$(999|799|1,199|1,499|39|59|79)(?=\b| ?(MXN|USD|\/))/g);
    if (otros) bad(`${where} ${pg.f}: precio de plan distinto ${otros}`);
    if (!fail) console.log(`✓ ${where} ${pg.f}: ${want.join(" / ")}`);
  }
}
process.exit(fail ? 1 : 0);
