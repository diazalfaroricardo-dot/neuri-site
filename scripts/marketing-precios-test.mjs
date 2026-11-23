// PR2 — neuri.tech/marketing anuncia los mismos precios que cobra neuri.marketing
// (apps/marketing/src/quota.ts PLANS, aprobados por Ricardo el 17-oct) y no promete
// en un plan funciones que plan-features.ts le da a otro.
// Uso: node scripts/marketing-precios-test.mjs [--live]
import { existsSync, readFileSync } from "node:fs";

// Si el repo de marketing está al lado, los precios salen de ahí (fuente única); si no, los aprobados.
let want = { inicio: [599, 449, 49], crece: [1199, 699, 99], pro: [1999, 1199, 169] };
const q = new URL("../../neuri-marketing/apps/marketing/src/quota.ts", import.meta.url);
if (existsSync(q)) {
  const src = readFileSync(q, "utf8");
  for (const id of Object.keys(want)) {
    const blk = src.match(new RegExp(`${id}: \\{([\\s\\S]*?)\\n  \\}`))?.[1] ?? "";
    const n = (k) => Number(blk.match(new RegExp(`${k}: (\\d+)`))?.[1]);
    want[id] = [n("mxn"), n("founderMxn"), n("usd")];
  }
}
const fmt = (n) => n.toLocaleString("en-US");
const live = process.argv.includes("--live");
let fail = 0;
const bad = (m) => { fail++; console.error("✗", m); };

// D-10 (22-nov): EE. UU. primero. La versión en español es para hispanos en EE. UU.: mismos precios
// en USD que la inglesa, sin pesos, sin MXN y sin precio de fundador (era solo México).
const srcs = [["local", readFileSync("marketing/index.html", "utf8")]];
if (live) srcs.push(["live", await (await fetch("https://neuri.tech/marketing/")).text()]);
for (const [where, html] of srcs) {
  const plans = [...html.matchAll(/<div class="plan[^"]*"[\s\S]*?<h3>(\w+)<\/h3>[\s\S]*?<b>US\$([\d,]+)<\/b>[\s\S]*?<b>US\$([\d,]+)<\/b> al año([\s\S]*?)<\/ul>/g)];
  if (plans.length !== 3) bad(`${where}: esperaba 3 planes en USD con precio anual, hay ${plans.length}`);
  for (const [, name, usd, year, body] of plans) {
    const w = want[name.toLowerCase()];
    if (!w) { bad(`${where}: plan desconocido ${name}`); continue; }
    if (usd !== fmt(w[2])) bad(`${where} ${name}: US$${usd} ≠ US$${fmt(w[2])}`);
    if (year !== fmt(w[2] * 10)) bad(`${where} ${name}: anual US$${year} ≠ US$${fmt(w[2] * 10)} (10 meses)`);
    // plan-features.ts: bandeja/compradores en Crece; reels IA, video crudo, collabs en Pro.
    if (name === "Inicio" && (/bandeja/i.test(body) || /\bIA\b/.test(body))) bad(`${where} Inicio promete bandeja o IA`);
    if (name === "Crece" && /reels? con IA|video crudo|collab/i.test(body)) bad(`${where} Crece promete algo de Pro`);
  }
  const text = html.replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
  for (const m of ["MXN", "pesos", "undador", "México", "es_MX"])
    if (text.includes(m) || html.includes(m)) bad(`${where}: queda «${m}» (D-10: nada de México para EE. UU.)`);
  if (!html.includes('hreflang="x-default" href="https://neuri.tech/en/marketing/"')) bad(`${where}: x-default debe ser la versión en inglés`);
  if (!fail) console.log(`✓ ${where} marketing/index.html: ${Object.values(want).map((w) => `US$${w[2]}`).join(" · ")} (sin pesos)`);
}
// EN (clientes de EE. UU. pagan en USD de lista; el precio de fundador es solo México).
const en = [["local", readFileSync("en/marketing/index.html", "utf8")]];
if (live) en.push(["live", await (await fetch("https://neuri.tech/en/marketing/")).text()]);
for (const [where, html] of en) {
  // T25: EN usa el mismo HTML que ES (generado por scripts/t25-marketing-en.mjs); planes Start/Grow/Pro.
  const NOMBRE = { Start: "Inicio", Grow: "Crece", Pro: "Pro" };
  const cards = [...html.matchAll(/<div class="plan[^"]*">(?:<span class="tagx">\w+<\/span>)?<div><h3>(\w+)<\/h3>[\s\S]*?<b>US\$(\d+)<\/b>([\s\S]*?)<\/ul>/g)]
    .map(([m, n, usd, body]) => [m, NOMBRE[n] || n, usd, body]);
  if (cards.length !== 3) bad(`${where} EN: esperaba 3 planes, hay ${cards.length}`);
  for (const [, name, usd, body] of cards) {
    const w = want[name.toLowerCase()];
    if (!w) { bad(`${where} EN: plan desconocido ${name}`); continue; }
    if (Number(usd) !== w[2]) bad(`${where} EN ${name}: US$${usd} ≠ US$${w[2]}`);
    if (name === "Inicio" && /inbox|\bAI\b/.test(body)) bad(`${where} EN Inicio promete bandeja o IA`);
    if (name === "Crece" && /AI reels|raw video|collab/i.test(body)) bad(`${where} EN Crece promete algo de Pro`);
  }
  if (/founder/i.test(html)) bad(`${where} EN: el precio de fundador es solo para México`);
  if (/MXN|pesos|Mexico/.test(html)) bad(`${where} EN: D-10, nada de México ni pesos para EE. UU.`);
  if (!fail) console.log(`✓ ${where} en/marketing/index.html: US$${want.inicio[2]}/${want.crece[2]}/${want.pro[2]}`);
}
process.exit(fail ? 1 : 0);
