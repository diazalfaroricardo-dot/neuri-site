// L10 (docs/LEGAL.md del repo neuri-bazar): toda imagen de neuri.tech tiene origen anotado en
// docs/legal/imagenes-resto.md. Una imagen en otra carpeta falla hasta anotarla allá y aquí.
// Uso: node scripts/l10-imagenes-test.mjs
import { execFileSync } from "node:child_process";

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

if (fuera.length) {
  console.error(`✗ imágenes sin inventariar:\n${fuera.join("\n")}`);
  process.exit(1);
}
console.log("✓ L10: todas las imágenes están en carpetas inventariadas");
