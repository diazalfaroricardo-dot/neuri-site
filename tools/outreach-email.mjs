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
    chips: { es: ["7 días de prueba gratis", "Tú apruebas cada respuesta", "Contesta con tu hoja"], en: ["7-day free trial", "You approve every answer", "Answers from your sheet"] } },
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
    chips: { es: ["Nada sale sin tu OK", "Tus fotos reales", "Calendario de 30 días"], en: ["Nothing posts without your OK", "Your real photos", "30-day calendar"] } },
  personal: { a: "#05080D", bg: "#F4F6F7", ink: "#0B1118", sub: "#4F5A64", line: "#E2E7EB", suf: "" },
};
export const POSTAL = "Neuri LLC · 5818 W Raymond St, Phoenix, AZ 85043, USA";
export const FONT = "Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const utm = (u, p) => `${u}${u.includes("?") ? "&" : "?"}utm_source=outreach&utm_medium=email&utm_campaign=${p}`;

/** Firma «equipo» (envío automático, Ricardo 1-nov-2026): sin primera persona ni «Ricardo». */
const CHIPS_EQUIPO = {
  bots: { es: ["7 días de prueba gratis", "Tú apruebas cada respuesta", "Contesta con tu hoja"], en: ["7-day free trial", "You approve every answer", "Answers from your sheet"] },
  bazar: { es: ["Prueba de 14 días", "Lo configuramos con tus vendedores", "Español e inglés"], en: ["14-day trial", "Set up with your vendors", "English and Spanish"] },
};
export const PRIVACIDAD = { es: "https://neuri.tech/legal/#prospeccion", en: "https://neuri.tech/en/legal/#outreach" };

/**
 * A356 premium (vista previa 24-nov, espera el sí de Ricardo): tarjeta de datos con lo que se leyó en
 * los comentarios públicos de su TikTok. Solo números que ya van en el texto. Motion solo con CSS
 * (barras que crecen, tarjeta que sube) donde el cliente lo soporta (Apple Mail, iOS); Gmail y Outlook
 * la ven fija y completa. Respeta prefers-reduced-motion.
 * datos = {big, bigLabel, eyebrow, rows:[{label, n}], note}
 */
function datosHtml(d, t) {
  if (!d?.rows?.length) return "";
  const max = Math.max(...d.rows.map((r) => r.n), 1);
  const rows = d.rows
    .map((r, i) => {
      const w = Math.max(6, Math.round((r.n / max) * 100));
      return `<tr><td style="padding:0 0 10px;font-family:${FONT}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-size:14px;line-height:18px;font-weight:600;color:${t.ink};padding:0 0 5px">${esc(r.label)}</td><td align="right" style="font-size:14px;line-height:18px;font-weight:700;color:${t.ink};padding:0 0 5px;font-variant-numeric:tabular-nums">${esc(String(r.n))}</td></tr><tr><td colspan="2" style="background:#FFFFFF;border-radius:999px;line-height:0;font-size:0;height:8px"><div class="nb-bar nb-d${i}" style="width:${w}%;height:8px;border-radius:999px;background:${t.a};line-height:0;font-size:0">&nbsp;</div></td></tr></table></td></tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="nb-card" style="margin:4px 0 22px;background:${t.bg};border:1px solid ${t.line};border-radius:16px;border-collapse:separate"><tr><td style="padding:20px 22px 12px;font-family:${FONT}"><div style="font-size:12px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:${t.a};margin:0 0 ${d.big ? "10px" : "14px"}">${esc(d.eyebrow ?? "")}</div>${d.big ? `<div class="nb-big" style="font-size:44px;line-height:46px;font-weight:800;letter-spacing:-.02em;color:${t.ink};font-variant-numeric:tabular-nums">${esc(d.big ?? "")}</div><div style="font-size:15px;line-height:21px;color:${t.sub};margin:4px 0 18px">${esc(d.bigLabel ?? "")}</div>` : ""}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>${d.note ? `<div style="font-size:13px;line-height:18px;color:${t.sub};margin:4px 0 6px">${esc(d.note)}</div>` : ""}</td></tr></table>`;
}

/** Portada del reporte (sin imagen: texto real, se ve igual con imágenes bloqueadas). */
function coverHtml(R, t, en) {
  return `<tr><td class="nb-cover" bgcolor="${t.bg}" style="background:${t.bg};border-radius:18px 18px 0 0;border-bottom:1px solid ${t.line};padding:26px 30px 24px;font-family:${FONT}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="font-family:${FONT}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="28" height="28" align="center" valign="middle" bgcolor="${t.a}" style="width:28px;height:28px;background:${t.a};border-radius:8px;font-family:${FONT};font-size:13px;font-weight:800;color:#FFFFFF;line-height:28px">N</td><td style="padding-left:9px;font-family:${FONT};font-size:15px;font-weight:700;color:${t.ink}">neuri<span style="color:${t.a}">.bots</span></td></tr></table></td><td align="right" style="font-family:${FONT};font-size:12px;line-height:16px;color:${t.sub}">${esc(R.fecha ?? "")}</td></tr></table><div class="nb-rise" style="margin:26px 0 0;font-size:12px;line-height:16px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:${t.a}">${esc(R.eyebrow ?? "")}</div><div class="nb-rise nb-r1" style="margin:6px 0 0;font-size:34px;line-height:38px;font-weight:800;letter-spacing:-.025em;color:${t.ink}">${esc(R.negocio ?? "")}</div><div class="nb-rise nb-r2" style="margin:8px 0 0;font-size:15px;line-height:21px;color:${t.sub}">${esc(R.sub ?? "")}</div>${progresoHtml(R, t)}</td></tr>`;
}

/** Progreso dotado (Nunes y Drèze 2006): la mayor parte ya está hecha; falta su OK. */
function progresoHtml(R, t) {
  const p = R.progreso;
  if (!p?.total) return "";
  const segs = Array.from({ length: p.total }, (_, i) => {
    const done = i < p.hechos;
    return `<td width="${Math.floor(100 / p.total)}%" style="padding:0 ${i < p.total - 1 ? "4px" : "0"} 0 0;line-height:0;font-size:0"><div class="${done ? `nb-seg nb-s${i}` : "nb-last"}" style="height:6px;border-radius:999px;line-height:0;font-size:0;${done ? `background:${t.a}` : `background:#FFFFFF;border:1px solid ${t.a};height:4px`}">&nbsp;</div></td>`;
  }).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0"><tr>${segs}</tr></table><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0"><tr><td style="font-family:${FONT};font-size:13px;line-height:18px;font-weight:700;color:${t.ink}">${esc(p.label ?? "")}</td><td align="right" style="font-family:${FONT};font-size:13px;line-height:18px;color:${t.sub}">${esc(p.falta ?? "")}</td></tr></table>`;
}

/** Lo que ya hicimos (transparencia del trabajo, Buell y Norton 2011): ✓ hecho · ○ falta su OK. */
function pasosHtml(R, t) {
  if (!R.pasos?.length) return "";
  const rows = R.pasos
    .map((x, i) => {
      const done = x.hecho !== false;
      const mark = done
        ? `<td width="22" valign="top" style="width:22px;padding-top:0"><div style="width:22px;height:22px;background:${t.a};border-radius:50%;font-family:${FONT};font-size:12px;line-height:22px;font-weight:800;color:#FFFFFF;text-align:center">&#10003;</div></td>`
        : `<td width="22" valign="top" style="width:22px"><div class="nb-last" style="width:20px;height:20px;border:1px solid ${t.a};border-radius:50%;font-size:0;line-height:0">&nbsp;</div></td>`;
      return `<tr class="nb-p nb-p${i}"><td style="padding:0 0 12px;font-family:${FONT}"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${mark}<td style="padding-left:12px;font-family:${FONT};font-size:15px;line-height:21px;color:${done ? t.ink : t.a};font-weight:${done ? 500 : 700}">${esc(x.t)}</td></tr></table></td></tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:2px 0 16px"><tr><td style="padding:0 2px;font-family:${FONT}"><div style="font-size:12px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:${t.a};margin:0 0 14px">${esc(R.pasosTitle ?? "")}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table></td></tr></table>`;
}

/** Tres números grandes (celdas: en celular siguen en una fila, cortas). */
function kpisHtml(R, t) {
  if (!R.kpis?.length) return "";
  const w = Math.floor(100 / R.kpis.length);
  const cells = R.kpis
    .map(
      (k, i) =>
        `<td width="${w}%" valign="top" class="nb-k nb-k${i}" style="padding:16px 14px;${i ? `border-left:1px solid ${t.line};` : ""}font-family:${FONT}"><div style="font-size:30px;line-height:34px;font-weight:800;letter-spacing:-.02em;color:${i === 1 ? t.a : t.ink};font-variant-numeric:tabular-nums">${esc(k.v)}</div><div style="font-size:13px;line-height:17px;color:${t.sub};margin-top:4px">${esc(k.l)}</div></td>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:2px 0 14px;border:1px solid ${t.line};border-radius:16px;border-collapse:separate"><tr>${cells}</tr></table>`;
}

/** Sus preguntas con la respuesta ya escrita, como plática: comentario → respuesta. */
function qaHtml(R, t) {
  if (!R.qa?.length) return "";
  const pairs = R.qa
    .map(
      (x, i) =>
        `<tr><td style="padding:0 0 6px;font-family:${FONT}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" class="nb-q nb-q${i}" style="max-width:86%"><tr><td style="background:#FFFFFF;border:1px solid ${t.line};border-radius:16px 16px 16px 4px;padding:10px 14px;font-family:${FONT}"><div style="font-size:11px;line-height:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${t.sub};margin-bottom:3px">${esc(R.qLabel ?? "")}</div><div style="font-size:15px;line-height:21px;color:${t.ink}">${esc(x.q)}</div></td></tr></table></td></tr><tr><td align="right" style="padding:0 0 14px;font-family:${FONT}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" class="nb-a nb-a${i}" style="max-width:86%"><tr><td bgcolor="${t.a}" style="background:${t.a};border-radius:16px 16px 4px 16px;padding:10px 14px;font-family:${FONT};text-align:left"><div style="font-size:11px;line-height:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#FFFFFF;opacity:.75;margin-bottom:3px">${esc(R.aLabel ?? "")}</div><div style="font-size:15px;line-height:21px;color:#FFFFFF">${esc(x.a)}</div></td></tr></table></td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;background:${t.bg};border:1px solid ${t.line};border-radius:16px;border-collapse:separate"><tr><td style="padding:18px 18px 6px;font-family:${FONT}"><div style="font-size:12px;line-height:16px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;color:${t.a};margin:0 0 14px">${esc(R.qaTitle ?? "")}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${pairs}</table>${R.mas ? `<div style="font-size:13px;line-height:18px;font-weight:600;color:${t.sub};text-align:center;margin:0 0 12px">${esc(R.mas)}</div>` : ""}</td></tr></table>`;
}

const MOTION_CSS = `<style>@media (prefers-reduced-motion:no-preference){.nb-card{animation:nbUp .7s cubic-bezier(.16,1,.3,1) both}.nb-big{animation:nbUp .7s .15s cubic-bezier(.16,1,.3,1) both}.nb-bar{transform-origin:left center;animation:nbGrow 1.1s cubic-bezier(.16,1,.3,1) both}.nb-d0{animation-delay:.35s}.nb-d1{animation-delay:.5s}.nb-d2{animation-delay:.65s}.nb-d3{animation-delay:.8s}.nb-rise{animation:nbUp .8s cubic-bezier(.16,1,.3,1) both}.nb-r1{animation-delay:.08s}.nb-r2{animation-delay:.16s}.nb-k{animation:nbUp .7s cubic-bezier(.16,1,.3,1) both}.nb-k0{animation-delay:.25s}.nb-k1{animation-delay:.35s}.nb-k2{animation-delay:.45s}.nb-q,.nb-a{animation:nbUp .6s cubic-bezier(.16,1,.3,1) both}.nb-q0{animation-delay:1.8s}.nb-a0{animation-delay:2.3s}.nb-q1{animation-delay:2.8s}.nb-a1{animation-delay:3.3s}.nb-cta{animation:nbPulse 2.4s 3.4s ease-in-out 2}.nb-seg{transform-origin:left center;animation:nbGrow .5s cubic-bezier(.16,1,.3,1) both}.nb-s0{animation-delay:.35s}.nb-s1{animation-delay:.5s}.nb-s2{animation-delay:.65s}.nb-s3{animation-delay:.8s}.nb-last{animation:nbBlink 1.6s 1s ease-in-out infinite}@keyframes nbBlink{50%{opacity:.35}}.nb-p{animation:nbUp .6s cubic-bezier(.16,1,.3,1) both}.nb-p0{animation-delay:.9s}.nb-p1{animation-delay:1.1s}.nb-p2{animation-delay:1.3s}.nb-p3{animation-delay:1.5s}@keyframes nbPulse{50%{transform:scale(1.02)}}@keyframes nbGrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}@keyframes nbUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}}</style>`;

const MOBILE_CSS = `<style>@media (max-width:480px){.nb-pad{padding:22px 18px 18px!important}.nb-cover{padding:22px 18px 20px!important}.nb-k{padding:12px 8px!important}}</style>`;

export function outreachHtml({ product = "bazar", lang = "es", subject = "", body = "", firma = "ricardo", unsubUrl = "", fuente = "", datos = null }) {
  const t = T[product] ?? T.bazar;
  const en = lang === "en";
  const equipo = firma === "equipo";
  let lines = body.replace(/\r\n/g, "\n").trim().split("\n");
  // Línea de baja (al final).
  let optOut = "";
  const oi = lines.findIndex((l) => /reply "no"|contésteme "no"|contésteme “no”|responde "no"|no le vuelvo a escribir|no te volvemos a escribir|won't write again/i.test(l));
  if (oi >= 0) {
    optOut = lines[oi].trim();
    lines.splice(oi, 1);
  }
  // Firma: desde «Ricardo Díaz» (renglón solo) o «Best,/Saludos,» hasta el final.
  let sigStart = lines.findIndex((l) => (equipo ? /^\s*(El equipo de Neuri|The Neuri team)\s*$/i : /^\s*Ricardo( Díaz)?\s*$/i).test(l));
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
  const pHtml = paras.map((p) => `<p style="${P}">${esc(p).replace(/\n/g, "<br>")}</p>`);
  const R = datos?.kind === "reporte" ? datos : null;
  if (R) {
    // A356 v3: reporte hecho para su tienda. Tras el gancho van los 3 números y las barras; tras la
    // oferta, sus respuestas ya escritas. Solo datos que también van en el texto o en su página /t/.
    const tt = T[product] ?? T.bazar;
    pHtml.splice(Math.min(2, pHtml.length), 0, kpisHtml(R, tt) + (R.rows?.length ? datosHtml({ rows: R.rows, eyebrow: R.note }, tt) : ""));
    pHtml.splice(Math.min(4, pHtml.length), 0, pasosHtml(R, tt) + qaHtml(R, tt));
  } else {
    const card0 = datosHtml(datos, T[product] ?? T.bazar);
    if (card0) pHtml.splice(Math.min(2, pHtml.length), 0, card0);
  }
  const bodyHtml = pHtml.join("");
  const isProduct = product !== "personal" && T[product]?.url;
  const L = en ? "en" : "es";
  const href = isProduct ? utm(R?.cta?.url ?? t.url[L], product) : "";
  const hero = R
    ? coverHtml(R, t, en)
    : isProduct
    ? `<tr><td style="padding:0;line-height:0;font-size:0"><a href="${esc(href)}" target="_blank" style="display:block;text-decoration:none"><img src="https://neuri.tech/assets/email/hero-${product}-${L}.gif" width="600" alt="${esc(en ? `neuri${t.suf} — real product demo` : `neuri${t.suf} — demo del producto real`)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:18px 18px 0 0"></a></td></tr>`
    : "";
  const chips = isProduct
    ? // Chips inline-block (no celdas de tabla): en celular bajan a otra línea en vez de ensanchar el correo.
      `<div style="margin:4px 0 14px;font-size:0;line-height:0">${((equipo && CHIPS_EQUIPO[product]?.[L]) || t.chips[L])
        .map(
          (c) =>
            `<span style="display:inline-block;margin:0 6px 6px 0;padding:7px 12px;border-radius:999px;background:${t.bg};border:1px solid ${t.line};font-family:${FONT};font-size:13px;line-height:16px;font-weight:600;color:${t.ink};white-space:nowrap">&#10003;&nbsp;${esc(c)}</span>`,
        )
        .join("")}</div>`
    : "";
  const card = isProduct
    ? `${R ? "" : chips}<table role="presentation" cellpadding="0" cellspacing="0" border="0" ${R ? 'width="100%" class="nb-cta"' : ""} style="margin:0 0 ${R ? "12px" : "24px"}"><tr><td bgcolor="${t.a}" style="background:${t.a};border-radius:12px;box-shadow:0 8px 20px -8px ${t.a}"><a href="${esc(href)}" target="_blank" style="display:${R ? "block;text-align:center" : "inline-block"};padding:${R ? "18px 26px" : "15px 26px"};font-family:${FONT};font-size:16px;line-height:20px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:12px">${esc(R?.cta?.label ?? t.cta[L])}&nbsp;&nbsp;&rarr;</a></td></tr></table>`
    : "";
  const cardFull = R && isProduct ? `${card}<div style="text-align:center;margin:0 0 26px;font-family:${FONT};font-size:13px;line-height:19px;color:${t.sub}">${esc(R.duda ?? "")}</div>` : card;
  const role = product === "personal"
    ? en
      ? "Fractional operations &amp; program leadership · ex-Amazon (Last Mile Fleet &amp; Central Ops) · Phoenix, AZ"
      : "Operaciones y programas (fractional) · ex-Amazon · Phoenix, AZ"
    : en
      ? `Founder · <a href="https://neuri.tech/${en ? "en/" : ""}" style="color:${t.a};text-decoration:none;font-weight:600">neuri${t.suf || ""}</a>`
      : `Fundador · <a href="https://neuri.tech/" style="color:${t.a};text-decoration:none;font-weight:600">neuri${t.suf || ""}</a>`;
  const mark = `<td width="40" height="40" align="center" valign="middle" bgcolor="${t.a}" style="width:40px;height:40px;background:${t.a};border-radius:50%;font-family:${FONT};font-size:15px;font-weight:700;color:#FFFFFF;line-height:40px">${equipo ? "N" : "RD"}</td>`;
  const sig = `${closing ? `<p style="${P};margin-bottom:12px">${esc(closing)}</p>` : ""}<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px"><tr>${mark}<td style="padding:0 0 0 12px;font-family:${FONT}"><div style="font-size:15px;line-height:1.3;font-weight:700;color:${t.ink}">${equipo ? (en ? "The Neuri team" : "El equipo de Neuri") : "Ricardo Díaz"}</div><div style="font-size:13px;line-height:1.45;color:${t.sub}">${equipo ? (R ? `<span style="color:${t.a};font-weight:600">neuri${t.suf || ""}</span> · Phoenix, AZ` : `<a href="https://neuri.tech/${en ? "en/" : ""}" style="color:${t.a};text-decoration:none;font-weight:600">neuri${t.suf || ""}</a>`) : role}</div></td></tr></table>`;
  const flink = (u, label) => `<a href="${esc(u)}" target="_blank" style="color:${t.sub};text-decoration:underline">${esc(label)}</a>`;
  const foot = equipo
    ? en
      ? `This email is an advertisement from Neuri LLC.<br>${esc(POSTAL)} · hola@neuri.tech<br>${fuente ? `We found your business email published on ${esc(fuente)}. ` : ""}${flink(PRIVACIDAD.en, "Privacy notice")}<br>${flink(unsubUrl, "Unsubscribe")} with one tap, or reply "no" and we won't write again.`
      : `Este correo es publicidad de Neuri LLC.<br>${esc(POSTAL)} · hola@neuri.tech<br>${fuente ? `Encontramos el correo de tu negocio publicado en ${esc(fuente)}. ` : ""}${flink(PRIVACIDAD.es, "Aviso de privacidad")} · ${flink("https://www.gob.mx/profeco", "Profeco")}<br>${flink(unsubUrl, "Darte de baja")} con un toque, o responde "no" y no te volvemos a escribir.`
    : `${product === "personal" ? "" : `${esc(POSTAL)}<br>`}${esc(optOut)}`;
  const outerBg = isProduct ? t.bg : "#FFFFFF";
  const inner = isProduct
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FFFFFF" style="max-width:600px;background:#FFFFFF;border:1px solid ${t.line};border-radius:18px;border-collapse:separate">${hero}<tr><td class="nb-pad" style="padding:28px 30px 22px">${bodyHtml}${cardFull}${sig}</td></tr></table>`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px"><tr><td style="padding:0 2px">${bodyHtml}${sig}</td></tr></table>`;
  return `<!doctype html><html lang="${L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title>${datos?.rows?.length || R ? MOTION_CSS + (R ? MOBILE_CSS : "") : ""}</head><body style="margin:0;padding:0;background:${outerBg}"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${outerBg}" style="background:${outerBg}"><tr><td align="center" style="padding:${isProduct ? "24px 10px" : "8px 0"}">${inner}${foot.trim() ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px"><tr><td style="padding:16px 8px 0;font-family:${FONT};font-size:12px;line-height:1.55;color:${t.sub};text-align:${isProduct ? "center" : "left"}">${foot}</td></tr></table>` : ""}</td></tr></table></body></html>`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8");
  process.stdout.write(outreachHtml(JSON.parse(raw)));
}
