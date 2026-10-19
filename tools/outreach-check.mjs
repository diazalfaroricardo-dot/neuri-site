#!/usr/bin/env node
/**
 * Revisión de marca de los correos de prospección de Neuri (sin dependencias, Node 18+).
 *
 * Uso:
 *   curl -sL https://raw.githubusercontent.com/diazalfaroricardo-dot/neuri-site/main/tools/outreach-check.mjs -o /tmp/oc.mjs
 *   curl -sL https://raw.githubusercontent.com/diazalfaroricardo-dot/neuri-site/main/tools/outreach-email.mjs -o /tmp/outreach-email.mjs
 *   echo '{"product":"bazar","lang":"en","country":"US","subject":"…","body":"…"}' | node /tmp/oc.mjs
 *   (o un arreglo de esos objetos; agrega "html" para revisar también la versión con diseño)
 *
 * Devuelve JSON {ok, issues:[{code,msg}], warnings:[…]} (o un arreglo). ok=false si hay algún issue.
 * product: bots|sigue (neuri.bots), bazar, consulting, marketing, personal.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const { T, FONT, outreachHtml } = await import(join(here, "outreach-email.mjs"));

const NAME = { bots: "neuri.bots", bazar: "neuri.bazar", consulting: "neuri.consulting", marketing: "neuri.marketing" };
// Escrituras de marca correctas (cualquier otra variante con mayúsculas/espacios es error).
const BRAND_OK = /^(neuri\.(bots|bazar|consulting|marketing|tech)|Neuri( (Bazar|Marketing|LLC|Consulting))?|neuri)$/;
const OPT_ES = /contésteme ["“]no["”] y no le vuelvo a escribir/i;
const OPT_EN = /reply ["“]no["”] and I won't write again/i;
const SIG = /Ricardo Díaz\s*\n\s*Neuri · neuri\.tech/;
const POSTAL_RE = /Neuri LLC · 5818 W Raymond St, Phoenix, AZ 85043/;
const EMOJI = /\p{Extended_Pictographic}/u;
const ES_WORDS = /\b(hola|usted|negocio|gracias|puestos|saludos|quiero|para|está)\b/gi;
const EN_WORDS = /\b(hello|hi|your|business|thanks|would|the|and|you)\b/gi;

function hexes(s) {
  return [...new Set((s.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) ?? []).map((h) => h.toUpperCase()))];
}

export function checkOutreach(input) {
  const product = input.product === "sigue" ? "bots" : (input.product ?? "bazar");
  const t = T[product] ?? T.bazar;
  const en = (input.lang ?? (input.country === "US" ? "en" : "es")) === "en";
  const us = input.country ? input.country === "US" : en;
  const subject = String(input.subject ?? "").trim();
  const body = String(input.body ?? "").replace(/\r\n/g, "\n").trim();
  const issues = [];
  const warnings = [];
  const bad = (code, msg) => issues.push({ code, msg });
  const warn = (code, msg) => warnings.push({ code, msg });

  // Asunto
  const sw = subject.split(/\s+/).filter(Boolean).length;
  if (!subject) bad("asunto-vacio", "Falta el asunto.");
  else {
    if (sw < 3 || sw > 7) bad("asunto-largo", `El asunto tiene ${sw} palabras (3–7).`);
    if (/\b(gratis|free)\b/i.test(subject)) bad("asunto-spam", "El asunto dice gratis/free.");
    if (/[!$%]|^re:/i.test(subject) || EMOJI.test(subject)) bad("asunto-spam", "El asunto lleva !, $, %, emoji o «Re:».");
    if (/\b[A-ZÁÉÍÓÚÑ]{4,}\b/.test(subject.replace(/\bNeuri\b|\bLLC\b|\bCRM\b|\bWhatsApp\b|\bIA\b|\bAI\b/g, ""))) bad("asunto-mayusculas", "El asunto lleva palabras en MAYÚSCULAS.");
  }

  // Cuerpo
  if (!body) bad("cuerpo-vacio", "Falta el cuerpo.");
  const sigIdx = body.search(/Ricardo Díaz/);
  const main = sigIdx > 0 ? body.slice(0, sigIdx) : body;
  const words = main.split(/\s+/).filter(Boolean).length;
  if (body && (words < 60 || words > 120)) bad("cuerpo-largo", `El cuerpo tiene ${words} palabras antes de la firma (60–120).`);
  if (product !== "personal" && !SIG.test(body)) bad("firma", "Falta la firma exacta «Ricardo Díaz / Neuri · neuri.tech».");
  if (!(en ? OPT_EN : OPT_ES).test(body)) bad("baja", `Falta la línea de baja en ${en ? "inglés" : "español"}.`);
  if (us && product !== "personal" && !POSTAL_RE.test(body)) bad("domicilio", "Falta el domicilio postal (CAN-SPAM) bajo la firma.");
  if ((/\[[^\]]*\]|\{[^}]*\}|lorem ipsum/i.test(body) || /\b(TODO|XXX)\b/.test(body))) bad("placeholder", "Quedó un marcador sin llenar ([…], {…}, TODO).");
  if (/https?:\/\/|www\./i.test(main)) bad("enlaces", "El texto plano no lleva enlaces (van en la versión con diseño).");
  if (EMOJI.test(body)) bad("emoji", "El correo lleva emojis.");
  if (/[!¡]{2,}|\?{2,}/.test(body)) bad("tono", "Signos repetidos (!!, ??).");
  // Escritura de la marca
  for (const m of body.matchAll(/\bneuri[\s.]?[a-z]*\b/gi)) {
    const w = m[0];
    if (!BRAND_OK.test(w) && !/^neuri (de|y|para|es|is|a|an|the|and|for|helps?|ayuda)$/i.test(w))
      bad("marca", `Marca mal escrita: «${w}» (usa ${NAME[product] ?? "Neuri"}).`);
  }
  // Promesas por línea
  if (product === "bots" && /marketplace/i.test(body)) bad("promesa", "neuri.bots no promete Marketplace.");
  if ((product === "bots" || product === "marketing") && /(\$|US\s?\d|MXN|USD|pesos|dólares|dollars|\/mes|per month|al mes)/i.test(main))
    bad("precio", `${NAME[product]} no menciona precio.`);
  if (product === "marketing" && /(seguidores|followers|ventas garantizadas|más ventas|more sales|alcance|reach|publica solo|posts automatically)/i.test(main))
    bad("promesa", "Marketing no promete resultados ni que publica solo.");
  if (/\b\d{1,3}\s?%/.test(main)) warn("cifra", "Hay un porcentaje: confirma que tiene fuente real.");
  // Idioma
  const es = (main.match(ES_WORDS) ?? []).length;
  const enw = (main.match(EN_WORDS) ?? []).length;
  if (en && es > enw) bad("idioma", "El prospecto es en inglés y el correo parece en español.");
  if (!en && enw > es + 2) bad("idioma", "El prospecto es en español y el correo parece en inglés.");

  // Versión con diseño: la del input o la que genera la plantilla oficial.
  const html = input.html ?? (body ? outreachHtml({ product, lang: en ? "en" : "es", subject, body }) : "");
  if (html) {
    const allowed = new Set(
      ["#FFFFFF", "#FFF", t.a, t.bg, t.ink, t.sub, t.line].filter(Boolean).map((h) => h.toUpperCase()),
    );
    const off = hexes(html).filter((h) => !allowed.has(h));
    if (off.length) bad("paleta", `Colores fuera de la paleta de ${NAME[product] ?? "Neuri"}: ${off.join(", ")}.`);
    const fonts = [...html.matchAll(/font-family:([^;"]+)/g)].map((m) => m[1].trim());
    if (fonts.some((f) => f !== FONT.replace(/"/g, "'") && f !== FONT)) bad("fuente", "Hay una tipografía distinta a Geist (la de la marca).");
    const imgs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    for (const src of imgs)
      if (!/^https:\/\/neuri\.tech\/assets\/email\//.test(src)) bad("imagen", `Imagen fuera de neuri.tech/assets/email: ${src}`);
    if (imgs.some((s) => !/alt="[^"]+"/.test(html))) bad("alt", "Imagen sin texto alternativo.");
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    for (const h of hrefs) {
      if (/^mailto:/.test(h)) continue;
      if (!/^https:\/\/(neuri\.tech|consulting\.neuri\.tech)(\/|$)/.test(h)) bad("link", `Link fuera de los dominios de Neuri: ${h}`);
    }
    if (product !== "personal" && !hrefs.some((h) => /utm_source=outreach/.test(h))) bad("cta", "Falta el botón con link medible (utm_source=outreach).");
    if (us && product !== "personal" && !/5818 W Raymond St/.test(html)) bad("domicilio-html", "La versión con diseño no muestra el domicilio.");
    if (!/(reply|contésteme)/i.test(html)) bad("baja-html", "La versión con diseño no muestra la baja.");
    const kb = Buffer.byteLength(html) / 1024;
    if (kb > 100) bad("peso", `El HTML pesa ${kb.toFixed(0)} KB; Gmail corta arriba de ~102 KB.`);
  }
  return { ok: issues.length === 0, issues, warnings };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
  const data = JSON.parse(raw);
  const out = Array.isArray(data) ? data.map((d) => ({ id: d.id, ...checkOutreach(d) })) : checkOutreach(data);
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exitCode = (Array.isArray(out) ? out : [out]).every((o) => o.ok) ? 0 : 1;
}
