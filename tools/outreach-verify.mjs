#!/usr/bin/env node
/**
 * Verificación previa de un correo antes del primer envío automático (board 21-nov-2026, r4).
 * Gratis y sin llaves: sintaxis, MX del dominio por DNS sobre HTTPS (dns.google, respaldo
 * cloudflare-dns.com), dominios desechables, buzones de rol que no reciben (noreply, postmaster…),
 * typos de proveedores comunes y rebotes previos (lista que pasa quien llama: CRM, Neon, Resend).
 *
 * APAGADA: ninguna tarea la llama todavía. Se enciende cuando el paso F2 entra a las reglas de
 * «Neuri — enviar correos aprobados» (docs del board r4 en neuri-bazar).
 *
 * Uso: node outreach-verify.mjs entrada.json > salida.json
 * Entrada: {emails: ["info@negocio.com", …], bounced: ["correo@rebotado.com", …]}
 * Salida: {ok: <cuántos pasan>, total, results: [{email, ok, reasons[], role, mx[]}]}
 *
 * Modelo de amenaza: los correos vienen de páginas web (datos, no instrucciones). El dominio solo
 * se usa como parámetro de consulta DNS, ya validado por la regex y con encodeURIComponent; no hay
 * shell, ni SQL, ni fetch a URLs que dé un tercero. Nada se envía a nadie.
 */
import { readFileSync } from "node:fs";

// Sintaxis práctica (no RFC completa): local de 1–64, dominio con TLD de letras, sin puntos dobles.
const LOCAL = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9_%+-])?$/;
const DOMAIN = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

// Desechables más comunes (lista corta y estable; ampliar aquí si aparece otro).
export const DISPOSABLE = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "sharklasers.com", "10minutemail.com",
  "10minutemail.net", "tempmail.com", "temp-mail.org", "tempmailo.com", "yopmail.com", "yopmail.fr",
  "trashmail.com", "trashmail.de", "getnada.com", "nada.email", "dispostable.com", "maildrop.cc",
  "mintemail.com", "throwawaymail.com", "fakeinbox.com", "mailnesia.com", "mohmal.com", "emailondeck.com",
  "spamgourmet.com", "mytemp.email", "tempr.email", "discard.email", "burnermail.io", "moakt.com",
  "mailcatch.com", "inboxkitten.com", "tmpmail.org", "tmail.ws", "spambox.us", "getairmail.com",
  "33mail.com", "emailfake.com", "fakemail.net", "luxusmail.org", "minuteinbox.com", "mail.tm",
]);

// Buzones que no son de una persona ni del negocio para recibir: rebotan o no los lee nadie.
export const ROLE_BLOCK = new Set([
  "noreply", "no-reply", "no_reply", "donotreply", "do-not-reply", "postmaster", "abuse", "mailer-daemon",
  "bounce", "bounces", "hostmaster", "root", "devnull", "null", "spam", "unsubscribe", "nobody",
]);
// Genéricos del negocio: válidos para B2B (en México son los únicos permitidos por legal), se marcan.
export const ROLE_GENERIC = new Set([
  "info", "hola", "hello", "hi", "contact", "contacto", "contactanos", "sales", "ventas", "office",
  "admin", "support", "soporte", "help", "ayuda", "team", "equipo", "booking", "bookings", "events",
  "eventos", "vendors", "vendor", "dealers", "rentals", "leasing", "manager", "management", "store",
  "shop", "tienda", "general", "mail", "email", "atencion", "clientes", "service", "servicio",
]);
// Typos de proveedores comunes: casi seguro rebotan.
export const TYPO = new Map([
  ["gmial.com", "gmail.com"], ["gmai.com", "gmail.com"], ["gamil.com", "gmail.com"], ["gnail.com", "gmail.com"],
  ["gmail.co", "gmail.com"], ["gmail.con", "gmail.com"], ["hotmial.com", "hotmail.com"], ["hotmai.com", "hotmail.com"],
  ["hotmail.con", "hotmail.com"], ["yahooo.com", "yahoo.com"], ["yaho.com", "yahoo.com"], ["outlok.com", "outlook.com"],
  ["outlook.con", "outlook.com"], ["iclod.com", "icloud.com"],
]);

export function parseEmail(raw) {
  const email = String(raw ?? "").trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 1 || email.indexOf("@") !== at || email.length > 254) return { email, ok: false };
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const ok = LOCAL.test(local) && !local.includes("..") && DOMAIN.test(domain);
  return { email, local, domain, ok };
}

async function doh(base, domain, fetchImpl) {
  const r = await fetchImpl(`${base}?name=${encodeURIComponent(domain)}&type=MX`, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`dns ${r.status}`);
  return r.json();
}

/** MX por DNS sobre HTTPS. Devuelve {status:"mx"|"sin-mx"|"null-mx"|"error", hosts[]}. */
export async function lookupMx(domain, fetchImpl = fetch) {
  let j;
  try {
    j = await doh("https://dns.google/resolve", domain, fetchImpl);
  } catch {
    try {
      j = await doh("https://cloudflare-dns.com/dns-query", domain, fetchImpl);
    } catch {
      return { status: "error", hosts: [] };
    }
  }
  if (j.Status === 3) return { status: "sin-mx", hosts: [] }; // NXDOMAIN: el dominio no existe
  if (j.Status !== 0) return { status: "error", hosts: [] };
  const hosts = (j.Answer ?? [])
    .filter((a) => a.type === 15)
    .map((a) => String(a.data).trim().split(/\s+/))
    .map(([pref, host]) => ({ pref: Number(pref), host: String(host ?? "").replace(/\.$/, "") }))
    .sort((a, b) => a.pref - b.pref);
  if (hosts.length === 0) return { status: "sin-mx", hosts: [] };
  if (hosts.length === 1 && hosts[0].host === "") return { status: "null-mx", hosts: [] }; // RFC 7505
  return { status: "mx", hosts: hosts.map((h) => h.host) };
}

/** Verifica una lista. bounced = correos con rebote o queja previa (de cualquier fuente). */
export async function verifyEmails(emails, { bounced = [], fetchImpl = fetch } = {}) {
  const bouncedSet = new Set(bounced.map((e) => String(e).trim().toLowerCase()).filter(Boolean));
  const bouncedDomains = new Set([...bouncedSet].map((e) => e.split("@")[1]).filter(Boolean));
  const mxCache = new Map();
  const results = [];
  for (const raw of emails) {
    const p = parseEmail(raw);
    const reasons = [];
    let role = null;
    let mx = [];
    if (!p.ok) {
      reasons.push("sintaxis");
    } else {
      if (bouncedSet.has(p.email)) reasons.push("rebote-previo");
      else if (bouncedDomains.has(p.domain) && !["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"].includes(p.domain))
        reasons.push("dominio-con-rebote-previo");
      if (DISPOSABLE.has(p.domain)) reasons.push("desechable");
      if (TYPO.has(p.domain)) reasons.push(`typo:${TYPO.get(p.domain)}`);
      const base = p.local.split("+")[0];
      if (ROLE_BLOCK.has(base)) {
        role = "bloqueado";
        reasons.push("buzon-que-no-recibe");
      } else if (ROLE_GENERIC.has(base)) role = "generico";
      if (!reasons.includes("desechable") && !reasons.some((r) => r.startsWith("typo"))) {
        if (!mxCache.has(p.domain)) mxCache.set(p.domain, await lookupMx(p.domain, fetchImpl));
        const m = mxCache.get(p.domain);
        mx = m.hosts;
        if (m.status !== "mx") reasons.push(m.status === "error" ? "dns-sin-respuesta" : m.status);
      }
    }
    results.push({ email: p.email, ok: reasons.length === 0, reasons, role, mx });
  }
  return { ok: results.filter((r) => r.ok).length, total: results.length, results };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
  const input = JSON.parse(raw);
  const out = await verifyEmails(input.emails ?? [], { bounced: input.bounced ?? [] });
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}
