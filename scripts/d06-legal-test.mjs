// D-06 (Mission Control): /legal ES/EN dice reembolso completo del primer pago en 7 días y respuesta en 1 día hábil, como los términos de cada app.
import { readFileSync } from "node:fs";
let fallos = 0;
const ok = (c, m) => { console.log((c ? "ok   " : "FALLA") + " " + m); if (!c) fallos++; };
const es = readFileSync(new URL("../legal/index.html", import.meta.url), "utf8");
const en = readFileSync(new URL("../en/legal/index.html", import.meta.url), "utf8");
ok(/data-terms-refund[^>]*>[\s\S]*Reembolso completo en 7 días/.test(es), "ES reembolso 7 días");
ok(/data-terms-reply[^>]*>[\s\S]*1 día hábil/.test(es), "ES 1 día hábil");
ok(/data-terms-refund[^>]*>[\s\S]*Full refund within 7 days/.test(en), "EN refund 7 days");
ok(/data-terms-reply[^>]*>[\s\S]*1 business day/.test(en), "EN 1 business day");
process.exit(fallos ? 1 : 0);
