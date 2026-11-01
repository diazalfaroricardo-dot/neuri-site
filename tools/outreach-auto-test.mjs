#!/usr/bin/env node
// Candado del primer correo automático: firma de equipo, baja, domicilio, publicidad, privacidad.
import assert from "node:assert/strict";
import { buildAuto } from "./outreach-auto.mjs";

const U = "https://consulting.neuri.tech/prospeccion/baja/3f2b8c1e-1234-4abc-8def-001122334455";
const en = "Hi RaeAnn,\n\nWe read the AZFamily piece on Static Hall: 33 booths at a flat rent, a vendor waitlist and monthly payouts. Great for vendors, but it means a lot of tracking on your side.\n\nWe build Neuri Bazar for booth-rental shops: add vendors from your waitlist, see who has paid and who owes each month, give every vendor a page with their rent and payouts, and send reminders. You can try it for 14 days, and we set it up with your current vendors.\n\nWould a 15-minute call next week be worth it?";
const es = "Hola,\n\nVimos que La Colchonera tiene cuatro sucursales en Sinaloa y envíos a varias ciudades. Con ese movimiento, seguro les llegan muchas preguntas de precio y disponibilidad por mensaje, y contestarlas a tiempo se vuelve difícil.\n\nHacemos neuri.bots, un asistente que contesta Instagram y Messenger de tu negocio: precio, disponibilidad y entrega, y te pasa lo que no sabe. Lo configuramos por ustedes y pueden probarlo sin costo durante siete días.\n\n¿Les serviría una llamada de 15 minutos la próxima semana?";

const a = buildAuto({ product: "bazar", lang: "en", country: "US", subject: "Booth rent and payouts at Static Hall", body: en, unsubUrl: U, fuente: "statichall.com" });
assert.equal(a.ok, true, JSON.stringify(a.issues));
assert.match(a.text, /The Neuri team\nNeuri · neuri\.tech/);
assert.match(a.text, /5818 W Raymond St, Phoenix, AZ 85043/);
assert.match(a.text, /is an advertisement/);
assert.ok(a.html.includes(`href="${U}"`));
assert.ok(a.html.includes("5818 W Raymond St"));
assert.ok(!/Ricardo|>RD</.test(a.html));
assert.equal(a.replyTo, "hola@neuri.tech");
assert.match(a.from, /@holaneuri\.com>$/);
assert.equal(a.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
assert.ok(a.headers["List-Unsubscribe"].includes(U));

const b = buildAuto({ product: "sigue", lang: "es", country: "MX", subject: "Mensajes de La Colchonera", body: es, unsubUrl: U, fuente: "lacolchonera.com.mx" });
assert.equal(b.ok, true, JSON.stringify(b.issues));
assert.match(b.text, /El equipo de Neuri/);
assert.match(b.text, /es publicidad/);
assert.ok(b.html.includes("https://www.gob.mx/profeco"));
assert.ok(b.html.includes("neuri.tech/legal/#prospeccion"));
assert.ok(b.html.includes("hero-bots-es.gif"));

// Lo que debe frenar el envío
assert.equal(buildAuto({ product: "bazar", lang: "en", country: "US", subject: "Booth rent at Static Hall", body: en.replace("We build", "I'm Ricardo and I build"), unsubUrl: U }).ok, false);
assert.equal(buildAuto({ product: "bazar", lang: "en", country: "US", subject: "Booth rent at Static Hall", body: en, unsubUrl: "" }).ok, false);
assert.equal(buildAuto({ product: "bazar", lang: "en", country: "US", subject: "FREE booth rent!!", body: en, unsubUrl: U }).ok, false);
// El modo anterior (correos que Ricardo aprueba a mano) sigue igual.
console.log("outreach-auto OK");
