#!/usr/bin/env node
/**
 * Borradores de prospección de Neuri con diseño (HTML para Gmail).
 *
 * Uso (sin dependencias, Node 18+):
 *   curl -sL https://raw.githubusercontent.com/diazalfaroricardo-dot/neuri-site/main/tools/outreach-email.mjs -o /tmp/oe.mjs
 *   echo '{"product":"bazar","lang":"en","subject":"…","body":"…texto plano…"}' | node /tmp/oe.mjs > draft.html
 *
 * - product: bots | bazar | consulting | marketing | personal (pitch de Ricardo como fractional, sin producto)
 * - body: el mismo texto plano del borrador (va también como versión de texto). Se respeta palabra
 *   por palabra; la firma («Ricardo Díaz…»), el domicilio y la línea de baja («…reply "no"…») se
 *   detectan solos y salen en su lugar con diseño.
 * - Agrega (solo en el HTML) una tarjeta con una captura real del producto y un botón al recorrido.
 *   Nada inventado: las imágenes son capturas de neuri.tech y del ejemplo ficticio de consulting.
 */
import { readFileSync } from "node:fs";

export const T = {
  bots: { a: "#0B5E3A", bg: "#F6F4EE", ink: "#05080D", sub: "#56635C", line: "#E1E3DC", suf: ".bots",
    url: { es: "https://neuri.tech/sigue-disponible/", en: "https://neuri.tech/en/still-available/" },
    cta: { es: "Ver cómo contesta", en: "See it answer" },
    chips: { es: ["7 días de prueba gratis", "Yo lo configuro", "Instagram y Messenger"], en: ["7-day free trial", "I set it up for you", "Instagram and Messenger"] } },
  bazar: { a: "#B4441A", bg: "#F7F1E8", ink: "#05080D", sub: "#5E554C", line: "#E6DBC9", suf: ".bazar",
    url: { es: "https://neuri.tech/bazar/recorrido/", en: "https://neuri.tech/en/bazar/tour/" },
    cta: { es: "Ver el recorrido de 2 minutos", en: "Take the 2-minute tour" },
    chips: { es: ["Prueba de 14 días", "Lo configuro con tus vendedores", "Español e inglés"], en: ["14-day trial", "Set up with your vendors", "English and Spanish"] } },
  consulting: { a: "#1F7A52", bg: "#F6F3EE", ink: "#0A1A14", sub: "#4B5B54", line: "#E4E1DA", suf: ".consulting",
    url: { es: "https://consulting.neuri.tech/ejemplo", en: "https://consulting.neuri.tech/ejemplo?lang=en" },
    cta: { es: "Ver un reporte de ejemplo", en: "See a sample report" },
    chips: { es: ["Precio fijo", "Reporte por escrito", "Garantía de devolución"], en: ["Fixed price", "Written report", "Money-back guarantee"] } },
  marketing: { a: "#C2341D", bg: "#FFF8F2", ink: "#0B1118", sub: "#5B6670", line: "#F0E4DA", suf: ".marketing",
    url: { es: "https://neuri.tech/marketing/", en: "https://neuri.tech/en/marketing/" },
    cta: { es: "Ver una semana de ejemplo", en: "See a sample week" },
    chips: { es: ["Nada sale sin tu OK", "Tus fotos reales", "Instagram y Facebook"], en: ["Nothing posts without your OK", "Your real photos", "Instagram and Facebook"] } },
  personal: { a: "#05080D", bg: "#F4F6F7", ink: "#0B1118", sub: "#4F5A64", line: "#E2E7EB", suf: "" },
};
export const POSTAL = "Neuri LLC · 5818 W Raymond St, Phoenix, AZ 85043, USA";
export const FONT = "Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const utm = (u, p) => `${u}${u.includes("?") ? "&" : "?"}utm_source=outreach&utm_medium=email&utm_campaign=${p}`;

export function outreachHtml({ product = "bazar", lang = "es", subject = "", body = "" }) {
  const t = T[product] ?? T.bazar;
  const en = lang === "en";
  let lines = body.replace(/\r\n/g, "\n").trim().split("\n");
  // Línea de baja (al final).
  let optOut = "";
  const oi = lines.findIndex((l) => /reply "no"|contésteme "no"|contésteme “no”|no le vuelvo a escribir|won't write again/i.test(l));
  if (oi >= 0) {
    optOut = lines[oi].trim();
    lines.splice(oi, 1);
  }
  // Firma: desde «Ricardo Díaz» (renglón solo) o «Best,/Saludos,» hasta el final.
  let sigStart = lines.findIndex((l) => /^\s*Ricardo( Díaz)?\s*$/i.test(l));
  let closing = "";
  if (sigStart > 0 && /^(best|thanks|thank you|saludos|un saludo|gracias)[,.!]?\s*$/i.test(lines[sigStart - 1].trim())) {
    closing = lines[sigStart - 1].trim();
    sigStart -= 1;
  }
  const bodyLines = sigStart >= 0 ? lines.slice(0, sigStart) : lines;
  // Quitar placeholders y domicilios sueltos (el pie ya lo lleva).
  const clean = bodyLines.filter((l) => !/^\[.*(Dirección postal|postal address).*\]$/i.test(l.trim()) && !/5818 W Raymond/.test(l));
  const paras = clean.join("\n").trim().split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const P = `margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.6;color:${t.ink}`;
  const bodyHtml = paras.map((p) => `<p style="${P}">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const isProduct = product !== "personal" && T[product]?.url;
  const L = en ? "en" : "es";
  const href = isProduct ? utm(t.url[L], product) : "";
  const hero = isProduct
    ? `<tr><td style="padding:0;line-height:0;font-size:0"><a href="${esc(href)}" target="_blank" style="display:block;text-decoration:none"><img src="https://neuri.tech/assets/email/hero-${product}-${L}.gif" width="600" alt="${esc(en ? `neuri${t.suf} — real product demo` : `neuri${t.suf} — demo del producto real`)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:18px 18px 0 0"></a></td></tr>`
    : "";
  const chips = isProduct
    ? // Chips inline-block (no celdas de tabla): en celular bajan a otra línea en vez de ensanchar el correo.
      `<div style="margin:4px 0 14px;font-size:0;line-height:0">${t.chips[L]
        .map(
          (c) =>
            `<span style="display:inline-block;margin:0 6px 6px 0;padding:7px 12px;border-radius:999px;background:${t.bg};border:1px solid ${t.line};font-family:${FONT};font-size:13px;line-height:16px;font-weight:600;color:${t.ink};white-space:nowrap">&#10003;&nbsp;${esc(c)}</span>`,
        )
        .join("")}</div>`
    : "";
  const card = isProduct
    ? `${chips}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px"><tr><td bgcolor="${t.a}" style="background:${t.a};border-radius:12px;box-shadow:0 8px 20px -8px ${t.a}"><a href="${esc(href)}" target="_blank" style="display:inline-block;padding:15px 26px;font-family:${FONT};font-size:16px;line-height:20px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:12px">${esc(t.cta[L])}&nbsp;&nbsp;&rarr;</a></td></tr></table>`
    : "";
  const role = product === "personal"
    ? en
      ? "Fractional operations &amp; program leadership · ex-Amazon (Last Mile Fleet &amp; Central Ops) · Phoenix, AZ"
      : "Operaciones y programas (fractional) · ex-Amazon · Phoenix, AZ"
    : en
      ? `Founder · <a href="https://neuri.tech/${en ? "en/" : ""}" style="color:${t.a};text-decoration:none;font-weight:600">neuri${t.suf || ""}</a>`
      : `Fundador · <a href="https://neuri.tech/" style="color:${t.a};text-decoration:none;font-weight:600">neuri${t.suf || ""}</a>`;
  const mark = `<td width="40" height="40" align="center" valign="middle" bgcolor="${t.a}" style="width:40px;height:40px;background:${t.a};border-radius:50%;font-family:${FONT};font-size:15px;font-weight:700;color:#FFFFFF;line-height:40px">RD</td>`;
  const sig = `${closing ? `<p style="${P};margin-bottom:12px">${esc(closing)}</p>` : ""}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px"><tr>${mark}<td style="padding:0 0 0 12px;font-family:${FONT}"><div style="font-size:15px;line-height:1.3;font-weight:700;color:${t.ink}">Ricardo Díaz</div><div style="font-size:13px;line-height:1.45;color:${t.sub}">${role}</div></td></tr></table>`;
  const foot = `${product === "personal" ? "" : `${esc(POSTAL)}<br>`}${esc(optOut)}`;
  const outerBg = isProduct ? t.bg : "#FFFFFF";
  const inner = isProduct
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="max-width:600px;background:#FFFFFF;border:1px solid ${t.line};border-radius:18px;border-collapse:separate">${hero}<tr><td style="padding:28px 30px 22px">${bodyHtml}${card}${sig}</td></tr></table>`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px"><tr><td style="padding:0 2px">${bodyHtml}${sig}</td></tr></table>`;
  return `<!doctype html><html lang="${L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head><body style="margin:0;padding:0;background:${outerBg}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${outerBg}" style="background:${outerBg}"><tr><td align="center" style="padding:${isProduct ? "24px 10px" : "8px 0"}">${inner}${foot.trim() ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px"><tr><td style="padding:16px 8px 0;font-family:${FONT};font-size:12px;line-height:1.55;color:${t.sub};text-align:${isProduct ? "center" : "left"}">${foot}</td></tr></table>` : ""}</td></tr></table></body></html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
  process.stdout.write(outreachHtml(JSON.parse(raw)));
}
