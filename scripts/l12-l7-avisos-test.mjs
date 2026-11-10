// L12 + L7 (decisión de Ricardo 9-nov): avisos de bazar y bots dicen el plazo de 12 meses con
// aviso 30 días antes, y nombran OpenAI (bots), Anthropic (bazar) y Google Fonts (ambos).
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const r = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const casos = [
  ["sigue-disponible/privacidad/index.html", [/12 meses<\/b> después de cancelar/, /30 días antes/, /<td>OpenAI<\/td>/, /<td>Google Fonts<\/td>/]],
  ["en/still-available/privacy/index.html", [/12 months<\/b> after canceling/, /30 days before/, /<td>OpenAI<\/td>/, /<td>Google Fonts<\/td>/]],
  ["bazar/privacidad/index.html", [/12 meses<\/b> después del último cobro/, /30 días antes/, /<td>Anthropic<\/td>/, /<td>Google Fonts<\/td>/]],
  ["en/bazar/privacy/index.html", [/12 months<\/b> after the last charge/, /30 days before/, /<td>Anthropic<\/td>/, /<td>Google Fonts<\/td>/]],
  ["sigue-disponible/terminos/index.html", [/12 meses después de cancelar/]],
  ["en/still-available/terms/index.html", [/12 months after you cancel/]],
  ["bazar/terminos/index.html", [/12 meses sin cobro/]],
  ["en/bazar/terms/index.html", [/12 months with no charge/]],
];
for (const [p, res] of casos) {
  const s = r(p);
  for (const re of res) assert.match(s, re, `${p}: falta ${re}`);
  assert.doesNotMatch(s, /\[(Pendiente|Pending): (plazo|automatic deletion|maximum period)/, `${p}: queda el pendiente de plazo`);
}
console.log(`ok l12-l7-avisos: ${casos.length} páginas`);
