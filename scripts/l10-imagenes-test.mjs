// L10 (docs/LEGAL.md del repo neuri-bazar): toda imagen de neuri.tech tiene origen anotado en
// docs/legal/imagenes-resto.md. Una imagen en otra carpeta falla hasta anotarla allá y aquí.
// Fotos de stock (tech-l10-imagenes-inventario, 22-nov): cada archivo de assets/stock/<carpeta>/ necesita
// su fila en el CREDITS.md de esa carpeta, con link a la fuente y licencia. Sin fila, falla.
// Uso: node scripts/l10-imagenes-test.mjs
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, basename, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const CARPETAS = /^(assets\/(email|og)|bazar\/(img|recorrido\/img)|en\/(img|bazar\/tour\/img)|img|img\/mk)\/[^/]+$/;
const SUELTAS = new Set(["assets/neuri-logo.png"]);
const imagen = /\.(png|jpe?g|webp|gif|svg|ico|avif)$/i;

const fuera = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  cwd: root,
  encoding: "utf8",
})
  .split("\n")
  .filter((f) => imagen.test(f) && !SUELTAS.has(f) && !CARPETAS.test(f));

const STOCK = /^assets\/stock\/[^/]+\/[^/]+$/;
const sinFila = [];
for (const f of fuera.filter((x) => STOCK.test(x))) {
  const cred = join(root, dirname(f), "CREDITS.md");
  const fila = existsSync(cred) && readFileSync(cred, "utf8").split("\n").find((l) => l.startsWith(`| \`${basename(f)}\``));
  // La fila trae al menos un link a la fuente y una licencia (CC0, dominio público o Pexels), o dice «Sin fuente comprobada».
  if (!fila || !(/\]\(https:\/\//.test(fila) || /Sin fuente comprobada/.test(fila)) || !/CC0|dominio público|Licencia Pexels|\?/.test(fila)) sinFila.push(f);
}
if (sinFila.length) {
  console.error(`✗ fotos de stock sin fila en su CREDITS.md (fuente + licencia):\n${sinFila.join("\n")}`);
  process.exit(1);
}
const resto = fuera.filter((x) => !STOCK.test(x));
if (resto.length) {
  console.error(`✗ imágenes sin inventariar:\n${resto.join("\n")}`);
  process.exit(1);
}
console.log("✓ L10: todas las imágenes están en carpetas inventariadas");
