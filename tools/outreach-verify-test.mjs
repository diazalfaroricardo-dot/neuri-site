#!/usr/bin/env node
// Candado de la verificación previa de correo (board 21-nov, r4). Sin red: DNS simulado.
import assert from "node:assert/strict";
import { lookupMx, parseEmail, verifyEmails } from "./outreach-verify.mjs";

const zones = {
  "negocio.com": { Status: 0, Answer: [{ type: 15, data: "20 mx2.negocio.com." }, { type: 15, data: "10 mx1.negocio.com." }] },
  "gmail.com": { Status: 0, Answer: [{ type: 15, data: "5 gmail-smtp-in.l.google.com." }] },
  "sincorreo.com": { Status: 0, Answer: [] },
  "nullmx.com": { Status: 0, Answer: [{ type: 15, data: "0 ." }] },
  "noexiste.com": { Status: 3 },
  "rebota.com": { Status: 0, Answer: [{ type: 15, data: "10 mx.rebota.com." }] },
};
let calls = 0;
const fakeFetch = async (url) => {
  calls++;
  const name = decodeURIComponent(new URL(url).searchParams.get("name"));
  if (name === "caido.com") throw new Error("red");
  return { ok: true, json: async () => zones[name] ?? { Status: 0, Answer: [] } };
};

// Sintaxis
assert.equal(parseEmail("Info@Negocio.com ").ok, true);
for (const bad of ["", "sinarroba.com", "a@@b.com", "a..b@negocio.com", ".a@negocio.com", "a@negocio", "a@-x.com", "a b@negocio.com", "a@negocio.c0m"])
  assert.equal(parseEmail(bad).ok, false, bad);

// MX: orden por preferencia, null MX, NXDOMAIN, caída de DNS con respaldo que también cae
assert.deepEqual(await lookupMx("negocio.com", fakeFetch), { status: "mx", hosts: ["mx1.negocio.com", "mx2.negocio.com"] });
assert.equal((await lookupMx("nullmx.com", fakeFetch)).status, "null-mx");
assert.equal((await lookupMx("noexiste.com", fakeFetch)).status, "sin-mx");
assert.equal((await lookupMx("caido.com", fakeFetch)).status, "error");

calls = 0;
const r = await verifyEmails(
  [
    "info@negocio.com", "ventas@negocio.com", "dueno.tienda@gmail.com", "noreply@negocio.com", "x@mailinator.com",
    "x@gmial.com", "info@sincorreo.com", "info@nullmx.com", "info@noexiste.com", "info@caido.com",
    "info@rebota.com", "otro@rebota.com", "nope", "Info@Negocio.com",
  ],
  { bounced: ["INFO@rebota.com "], fetchImpl: fakeFetch },
);
const by = Object.fromEntries(r.results.map((x, i) => [`${i}:${x.email}`, x]));
const get = (i) => Object.values(by)[i];
assert.equal(get(0).ok, true);
assert.equal(get(0).role, "generico");
assert.deepEqual(get(0).mx, ["mx1.negocio.com", "mx2.negocio.com"]);
assert.equal(get(1).ok, true);
assert.equal(get(2).ok, true); // Gmail del negocio en EE. UU.: la regla de México la aplica la tarea (paso G)
assert.deepEqual(get(3).reasons, ["buzon-que-no-recibe"]);
assert.deepEqual(get(4).reasons, ["desechable"]);
assert.deepEqual(get(5).reasons, ["typo:gmail.com"]);
assert.deepEqual(get(6).reasons, ["sin-mx"]);
assert.deepEqual(get(7).reasons, ["null-mx"]);
assert.deepEqual(get(8).reasons, ["sin-mx"]);
assert.deepEqual(get(9).reasons, ["dns-sin-respuesta"]); // sin DNS no se aprueba: falla cerrado
assert.deepEqual(get(10).reasons, ["rebote-previo"]);
assert.deepEqual(get(11).reasons, ["dominio-con-rebote-previo"]);
assert.deepEqual(get(12).reasons, ["sintaxis"]);
assert.equal(get(13).email, "info@negocio.com");
assert.equal(r.ok, 4);
assert.equal(r.total, 14);
// Caché por dominio: negocio, gmail, sincorreo, nullmx, noexiste, caido (2 intentos), rebota
assert.equal(calls, 8);
console.log("outreach-verify: ok");
