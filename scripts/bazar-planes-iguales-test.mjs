// B-A8 (auditoría ojos nuevos 18-oct): los planes dicen lo mismo en ES y EN, y nada promete
// WhatsApp como canal de hoy (está «Pronto»). Estados de cuenta y archivo del banco vienen en
// todos los planes (el código solo limita vendedores, cajas y mensajes).
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const en = readFileSync(new URL("../en/index.html", import.meta.url), "utf8");
const es = readFileSync(new URL("../bazar/index.html", import.meta.url), "utf8");
assert.ok(!en.includes("WhatsApp · neuri.bazar"), "EN: simulador promete WhatsApp");
assert.ok(!es.includes("WhatsApp · neuri.bazar"), "ES: simulador promete WhatsApp");
assert.ok(!en.includes("Monthly statements"), "EN: Pro dice mensual (el código es semanal)");
assert.ok(en.includes("weekly statements and a bank payout file"), "EN: Basic sin estados/archivo");
assert.ok(es.includes("estados de cuenta semanales y archivo de pagos para el banco"), "ES: Básico sin estados/archivo");
assert.ok(!es.includes("Estado de cuenta semanal y archivo para el banco"), "ES: Pro presume lo que Básico ya trae");
console.log("bazar-planes-iguales: ok");
