#!/usr/bin/env node
// Candado de las promesas de neuri.bots en correos (23-nov): WhatsApp se puede nombrar (ya contesta en vivo);
// TikTok y SMS no se prometen todavía. Sin red.
import assert from "node:assert/strict";
import { checkOutreach } from "./outreach-check.mjs";

const promesas = (main) =>
  checkOutreach({ product: "bots", lang: "es", country: "MX", subject: "Tus mensajes de Instagram", body: main })
    .issues.filter((i) => i.code === "promesa")
    .map((i) => i.msg);

assert.deepEqual(promesas("Tu asistente contesta en Instagram, Facebook y WhatsApp mientras tú vendes."), []);
assert.equal(promesas("También contesta tus comentarios de TikTok.").length, 1);
assert.equal(promesas("Contesta por SMS a quien no usa redes.").length, 1);
assert.equal(promesas("Contesta tus mensajes de texto.").length, 1);
assert.equal(promesas("Y te vendemos en Marketplace.").length, 1);
// Otros productos no cambian.
assert.deepEqual(
  checkOutreach({ product: "bazar", lang: "es", country: "MX", subject: "Tu bazar sin cuentas", body: "Avísales por WhatsApp o TikTok." })
    .issues.filter((i) => i.code === "promesa"),
  [],
);
console.log("outreach-check: ok (WhatsApp sí; TikTok y SMS no, en neuri.bots)");
