// Auditoría 2-nov: la 404 bajo /en/ salía en español. Carga 404.html en un navegador como la sirve Pages.
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url + "/../../../neuri-bazar/");
let chromium;
try { ({ chromium } = await import("playwright")); } catch { ({ chromium } = require("playwright")); }
const html = readFileSync(new URL("../404.html", import.meta.url), "utf8");
const b = await chromium.launch();
const open = async (url) => {
  const p = await b.newPage();
  await p.route("**/*", (r) => r.request().isNavigationRequest() ? r.fulfill({ status: 404, contentType: "text/html", body: html }) : r.abort());
  await p.goto(url);
  return p;
};
let fallos = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FALLA") + " " + m); if (!c) fallos++; };
const en = await open("https://neuri.tech/en/bazar/nope-xyz/");
ok(await en.getAttribute("html", "lang") === "en", "lang=en");
const t = await en.innerText("body");
ok(t.includes("This page doesn’t exist"), "título en inglés");
for (const es of ["Esta página no existe", "Entrar", "Privacidad", "Quizá", "Consultoría"]) ok(!t.includes(es), "sin «" + es + "»");
const hrefs = await en.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
for (const h of ["/en/home/", "/en/bazar/", "/en/still-available/", "/en/marketing/", "/en/ai-consulting/", "/en/legal/"]) {
  ok(hrefs.includes(h), "liga " + h);
  ok(existsSync(new URL(".." + h + "index.html", import.meta.url)), "existe " + h);
}
ok(!hrefs.some((h) => h.includes("lang=es")), "Entrar con lang=en");
const es = await open("https://neuri.tech/bazar/nope-xyz/");
ok(await es.getAttribute("html", "lang") === "es", "fuera de /en/ sigue en español");
ok((await es.innerText("h1")).includes("Esta página no existe"), "título en español");
await b.close();
if (fallos) process.exit(1);
