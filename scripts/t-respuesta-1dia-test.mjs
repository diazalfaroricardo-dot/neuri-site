// Candado: el tiempo de respuesta (1 día hábil, decisión de Ricardo) va junto a hola@neuri.tech en la portada ES/EN.
import { readFileSync } from "node:fs";
const casos = [
  ["index.html", "Te contestamos en 1 día hábil."],
  ["en/home/index.html", "We reply within 1 business day."],
];
let fallas = 0;
for (const [archivo, frase] of casos) {
  const html = readFileSync(new URL(`../${archivo}`, import.meta.url), "utf8");
  const i = html.indexOf(frase);
  const j = html.indexOf('href="mailto:hola@neuri.tech">hola@neuri.tech</a>');
  if (i < 0 || j < 0 || j - i > 400 || j < i) {
    console.error(`✗ ${archivo}: falta «${frase}» junto a hola@neuri.tech`);
    fallas++;
  } else console.log(`✓ ${archivo}`);
}
process.exit(fallas ? 1 : 0);
