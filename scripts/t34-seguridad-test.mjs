// T34 (neuri.tech, confianza): /legal/ dice en ES/EN cómo se cuida la información — solo lo que se
// puede comprobar — y /.well-known/security.txt (RFC 9116) existe con Contact y Expires vigente.
// Con --live además exige HSTS + x-frame-options en bazar/consulting (lo que la página promete)
// y que security.txt responda 200 en producción. Uso: node scripts/t34-seguridad-test.mjs [--live]
import { readFileSync } from "node:fs";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
let fail = 0;
const bad = (m) => { console.error(`✗ ${m}`); fail++; };
const legal = readFileSync(join(root, "legal/index.html"), "utf8");
for (const id of ["seguridad-h", "security-h"]) if (!legal.includes(`id="${id}"`)) bad(`/legal/ sin sección #${id}`);
for (const t of ["HSTS", "Stripe", "hola@neuri.tech", "/.well-known/security.txt"]) if ((legal.split(t).length - 1) < 2) bad(`/legal/ sin «${t}» en ES y EN`);
const sec = readFileSync(join(root, ".well-known/security.txt"), "utf8");
if (!/^Contact: mailto:hola@neuri\.tech$/m.test(sec)) bad("security.txt sin Contact");
const exp = sec.match(/^Expires: (.+)$/m);
if (!exp || !(new Date(exp[1]) > new Date())) bad("security.txt sin Expires vigente");
else if (new Date(exp[1]) - new Date() > 366 * 864e5) bad("security.txt Expires a más de un año (RFC 9116)");
if (!readFileSync(join(root, "_config.yml"), "utf8").includes(".well-known")) bad("_config.yml no incluye .well-known (Jekyll lo omitiría)");
if (process.argv.includes("--live")) {
  for (const h of ["bazar.neuri.tech", "consulting.neuri.tech"]) {
    const r = await fetch(`https://${h}/`, { redirect: "manual" });
    if (!/max-age=\d{7,}/.test(r.headers.get("strict-transport-security") || "")) bad(`${h} sin HSTS`);
    if (!/deny|sameorigin/i.test(r.headers.get("x-frame-options") || "") && !/frame-ancestors/.test(r.headers.get("content-security-policy") || "")) bad(`${h} se deja incrustar`);
  }
  const r = await fetch("https://neuri.tech/.well-known/security.txt");
  if (r.status !== 200 || !(await r.text()).includes("Contact:")) bad(`security.txt en vivo ${r.status}`);
  const l = await (await fetch("https://neuri.tech/legal/")).text();
  if (!l.includes('id="seguridad-h"')) bad("/legal/ en vivo sin la sección");
}
if (!fail) console.log(`✓ T34: /legal/ ES/EN con seguridad comprobable · security.txt vigente${process.argv.includes("--live") ? " · en vivo HSTS/frame + security.txt 200" : ""}`);
process.exit(fail ? 1 : 0);
