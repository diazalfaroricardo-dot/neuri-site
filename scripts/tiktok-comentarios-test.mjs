// tech 25-nov-2026: neuri.bots ya contesta en TikTok (comentarios, no mensajes directos). Ninguna página
// de bots ni la portada dicen que TikTok viene «pronto/soon»; el chip del hero dice «comentarios/comments»
// y SMS sigue «pronto/soon». Uso: node scripts/tiktok-comentarios-test.mjs
import { readFileSync } from "node:fs";
let fails = 0;
const mal = (m) => { console.log("FALLA " + m); fails++; };
const viejo = [/TikTok\s*(y|and)\s*SMS,?\s*(pronto|soon|coming)/i, /TikTok<small>(pronto|soon)<\/small>/i, /TikTok\s*(·|,)?\s*(pronto|soon|coming soon|próximamente)/i];
const paginas = ["sigue-disponible/index.html", "en/still-available/index.html", "es/index.html", "index.html", "sigue-disponible/vs-manychat/index.html", "en/still-available/vs-manychat/index.html", "llms.txt"];
for (const p of paginas) {
  const s = readFileSync(p, "utf8");
  for (const r of viejo) if (r.test(s)) mal(`${p}: todavía dice TikTok «pronto» (${r})`);
}
for (const [p, tt, sms] of [["sigue-disponible/index.html", "comentarios", "pronto"], ["en/still-available/index.html", "comments", "soon"]]) {
  const s = readFileSync(p, "utf8");
  const chip = s.match(/<span class="(np-can[^"]*)">(?:(?!<\/span>).)*?TikTok<small>([^<]*)<\/small><\/span>/s);
  if (!chip) mal(`${p}: falta el chip de TikTok`);
  else {
    if (/pronto/.test(chip[1])) mal(`${p}: el chip de TikTok sigue en gris («pronto»)`);
    if (chip[2] !== tt) mal(`${p}: el chip de TikTok dice «${chip[2]}», no «${tt}»`);
  }
  if (!new RegExp(`class="np-can pronto">(?:(?!</span>).)*?SMS<small>${sms}</small>`, "s").test(s)) mal(`${p}: SMS ya no dice «${sms}»`);
}
// El script del hero no debe borrar la etiqueta «comentarios» al leer /estado.
const js = readFileSync("assets/bots-premium.js", "utf8");
if (!/if \(sm && el\.classList\.contains\('pronto'\)\) sm\.remove\(\)/.test(js)) mal("bots-premium.js: borra cualquier <small> del chip, no solo «pronto»");
if (fails) process.exit(1);
console.log(`✓ TikTok ya no «pronto»: ${paginas.length} páginas; chip «comentarios/comments»; SMS sigue «pronto/soon»`);
