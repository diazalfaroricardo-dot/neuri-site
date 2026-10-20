// T54 (baja, B-N3): la portada ES tiene «Saltar al contenido» como primer enlace, hacia #inicio.
import { readFileSync } from "node:fs";
const live = process.argv.includes("--live");
const html = live ? await (await fetch("https://neuri.tech/?t=" + Date.now())).text() : readFileSync(new URL("../index.html", import.meta.url), "utf8");
const body = html.slice(html.indexOf("<body"));
const first = body.match(/<a\b[^>]*>[^<]*/);
let fails = 0; const ok = (c, m) => { if (c) console.log(`✓ ${m}`); else { fails++; console.error(`✗ ${m}`); } };
ok(first && /href="#inicio"/.test(first[0]) && /Saltar al contenido/.test(first[0]), "primer enlace = Saltar al contenido → #inicio");
ok(/id="inicio"/.test(html), "existe #inicio");
ok(/\.x-skip:focus\{left:12px\}/.test(html), "se ve al enfocarlo");
process.exit(fails ? 1 : 0);
