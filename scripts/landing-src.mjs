// A286: los scripts grandes de la landing de bots viven en /assets/sd-*.js.
// Las pruebas que buscan textos en la página leen la página + esos scripts, igual que el navegador.
import { readFileSync } from "node:fs";
export async function landingSource(p, live = false) {
  const html = live ? await (await fetch(`https://neuri.tech/${p.replace("index.html", "")}?t=${Date.now()}`)).text() : readFileSync(p, "utf8");
  const srcs = [...html.matchAll(/<script src="\/(assets\/sd-[a-z]+\.(?:es|en)\.js)(?:\?v=[0-9a-f]+)?"><\/script>/g)].map((m) => m[1]);
  let out = html;
  for (const s of srcs) out += "\n<script>\n" + (live ? await (await fetch(`https://neuri.tech/${s}?t=${Date.now()}`)).text() : readFileSync(s, "utf8")) + "\n</script>";
  return out;
}
