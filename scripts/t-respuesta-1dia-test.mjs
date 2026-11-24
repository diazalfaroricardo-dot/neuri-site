// Candado: el tiempo de respuesta (1 día hábil, decisión de Ricardo) va junto a hola@neuri.tech en la portada ES/EN.
import { readFileSync } from "node:fs";
const casos = [
  ["es/index.html", "Te contestamos en 1 día hábil."],
  ["index.html", "We reply within 1 business day."],
];
let fallas = 0;
for (const [archivo, frase] of casos) {
  const html = readFileSync(new URL(`../${archivo}`, import.meta.url), "utf8");
  const i = html.indexOf(frase);
  // Una acción (24-nov): en el cierre el correo es link de texto «o escribe a hola@neuri.tech» después del botón de demo.
  const m = /href="mailto:hola@neuri\.tech">[^<]*hola@neuri\.tech<\/a>/.exec(html.slice(Math.max(i, 0)));
  const j = m ? i + m.index : -1;
  if (i < 0 || j < 0 || j - i > 700) {
    console.error(`✗ ${archivo}: falta «${frase}» junto a hola@neuri.tech`);
    fallas++;
  } else console.log(`✓ ${archivo}`);
}
process.exit(fallas ? 1 : 0);
