// si1124-demo-links (Ricardo 24-nov, «A: sí a los 4 links»): las landings de neuri-site llevan al único evento activo de
// Calendly, «Demo Neuri» (slug 30min), con el producto ya escrito en la nota (a1) y utm por landing. Nunca al evento
// apagado «demo-neuri-bazar» ni a los otros demo-neuri-* inactivos. consultoria/ es redirección a consulting.neuri.tech
// (vive en neuri-bazar apps/consulting).
import { readFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname;
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log("✗", m); } else console.log("✓", m); };
const url = (p, c) => `https://calendly.com/diazalfaroricardo/30min?a1=Producto%3A+${p}&amp;utm_source=neuri&amp;utm_medium=landing&amp;utm_campaign=${c}`;
for (const [f, p, c, n] of [
  ["bazar/index.html", "Neuri+Bazar", "bazar", 2], ["en/bazar/index.html", "Neuri+Bazar", "bazar", 2],
  ["sigue-disponible/index.html", "neuri.bots", "bots", 1], ["en/still-available/index.html", "neuri.bots", "bots", 1],
  ["marketing/index.html", "Neuri+Marketing", "marketing", 1], ["en/marketing/index.html", "Neuri+Marketing", "marketing", 1],
]) {
  const h = readFileSync(root + f, "utf8");
  const links = [...h.matchAll(/href="(https:\/\/calendly\.com\/[^"]+)"/g)].map((m) => m[1]);
  ok(links.length === n && links.every((l) => l === url(p, c)), `${f}: ${n} link(s) a «Demo Neuri» con «Producto: ${p.replace("+", " ")}»`);
  ok(!/demo-neuri-/.test(h), `${f}: sin eventos demo-neuri-* apagados`);
}
if (fail) process.exit(1);
console.log("✓ demo por Calendly: «Demo Neuri» en bazar, bots y marketing (ES/EN)");
