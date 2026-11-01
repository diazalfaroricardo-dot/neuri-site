#!/usr/bin/env node
/**
 * Primer correo automático de prospección (Ricardo, 1-nov-2026). Arma texto, HTML con diseño y
 * cabeceras a partir del cuerpo, y lo pasa por el revisor de marca/legal. Sin dependencias.
 *
 * Uso: baja outreach-auto.mjs, outreach-email.mjs y outreach-check.mjs a la misma carpeta y corre
 *   node outreach-auto.mjs entrada.json > salida.json
 * Entrada: {product, lang:"es"|"en", country:"US"|"MX", subject, body, unsubUrl, fuente}
 *   body = solo los párrafos (60–120 palabras), en plural, sin firma, sin baja y sin domicilio.
 * Salida: {ok, issues, warnings, from, replyTo, subject, text, html, headers}. Si ok es false, no enviar.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const { outreachHtml, POSTAL, PRIVACIDAD } = await import(join(here, "outreach-email.mjs"));
const { checkOutreach } = await import(join(here, "outreach-check.mjs"));

export const REPLY_TO = "hola@neuri.tech";

export function buildAuto(i) {
  const product = i.product === "sigue" ? "bots" : (i.product ?? "bazar");
  const en = i.lang === "en";
  const main = String(i.body ?? "").replace(/\r\n/g, "\n").trim();
  const firma = en ? "The Neuri team\nNeuri · neuri.tech" : "El equipo de Neuri\nNeuri · neuri.tech";
  const legal = en
    ? `This email is an advertisement from Neuri LLC.\n${POSTAL} · ${REPLY_TO}\n${i.fuente ? `We found your business email published on ${i.fuente}.\n` : ""}Privacy notice: ${PRIVACIDAD.en}\nUnsubscribe: ${i.unsubUrl}\nOr reply "no" and we won't write again.`
    : `Este correo es publicidad de Neuri LLC.\n${POSTAL} · ${REPLY_TO}\n${i.fuente ? `Encontramos el correo de tu negocio publicado en ${i.fuente}.\n` : ""}Aviso de privacidad: ${PRIVACIDAD.es}\nProfeco: https://www.gob.mx/profeco\nDarte de baja: ${i.unsubUrl}\nO responde "no" y no te volvemos a escribir.`;
  const text = `${main}\n\n${firma}\n\n${legal}`;
  const html = outreachHtml({ product, lang: en ? "en" : "es", subject: i.subject, body: `${main}\n\n${firma}`, firma: "equipo", unsubUrl: i.unsubUrl, fuente: i.fuente });
  const r = checkOutreach({ product, lang: en ? "en" : "es", country: i.country, subject: i.subject, body: text, html, firma: "equipo", unsubUrl: i.unsubUrl });
  return {
    ...r,
    from: `${en ? "The Neuri team" : "El equipo de Neuri"} <hola@holaneuri.com>`,
    replyTo: REPLY_TO,
    subject: String(i.subject ?? "").trim(),
    text,
    html,
    headers: {
      "List-Unsubscribe": `<${i.unsubUrl}>, <mailto:${REPLY_TO}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
  const out = buildAuto(JSON.parse(raw));
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exitCode = out.ok ? 0 : 1;
}
