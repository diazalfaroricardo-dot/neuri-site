#!/usr/bin/env node
// Salud de Neuri (backlog/hf-idea-20261122-salud-dmarc-action, cubre eng-revision-programada).
// Lo corre .github/workflows/salud.yml. Doc: docs/SALUD.md.
// SOLO LEE: unas pocas peticiones GET a las apps y consultas DNS públicas. Sin secretos.
//
//   node scripts/salud/salud.mjs --modo apps|diario|todo [--sin-issues]
//
// Modos:
//   apps   → portada (200 tras redirecciones) + /health de cada app + tiempo de respuesta.
//   diario → SPF / DKIM (selector «resend») / DMARC de neuri.tech, holaneuri.com, in.neuri.tech
//            + resultado de `pnpm audit --prod` de neuri-bazar (archivo en AUDIT_BAZAR_JSON;
//            SALUD_BAZAR=apagado lo salta como aviso cuando no hay token para el repo privado).
//   todo   → los dos.
// Escribe salud.json y salud.md, imprime ok=1|0. Con GITHUB_TOKEN y GITHUB_REPOSITORY (y sin
// --sin-issues) abre UN issue «salud» por problema, lo actualiza en silencio mientras siga y lo
// cierra cuando vuelve a verde. Solo cierra issues del alcance que revisó en esta corrida.
import * as dnsSistema from "node:dns/promises";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const modo = (args[args.indexOf("--modo") + 1] || "todo").trim();
if (!["apps", "diario", "todo"].includes(modo)) {
  console.error(`modo inválido: ${modo}`);
  process.exit(2);
}
const sinIssues = args.includes("--sin-issues");
const LENTO_MS = Number(process.env.SALUD_LENTO_MS || 4000);
const TIMEOUT_MS = 15000;
const INTENTOS = 3;

const APPS = [
  { id: "tech", nombre: "neuri.tech", url: "https://neuri.tech", health: null }, // GitHub Pages: no hay /health ni /estado (404)
  { id: "bots", nombre: "neuri.bots", url: "https://sd.neuri.tech", health: "/health" },
  { id: "bazar", nombre: "neuri.bazar", url: "https://bazar.neuri.tech", health: "/health" },
  { id: "consulting", nombre: "neuri.consulting", url: "https://consulting.neuri.tech", health: "/health" },
  { id: "marketing", nombre: "neuri.marketing", url: "https://marketing.neuri.tech", health: "/health" },
];

// envia: el dominio manda correo con Resend (SPF en send.<dominio>, DKIM resend._domainkey).
// in.neuri.tech solo RECIBE (MX de Resend inbound): sin SPF propio y DMARC heredado de neuri.tech
// son avisos, no fallas.
const DOMINIOS = [
  { dominio: "neuri.tech", envia: true },
  { dominio: "holaneuri.com", envia: true },
  { dominio: "in.neuri.tech", envia: false },
];
const SELECTOR_DKIM = "resend";

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const problemas = []; // { clave, titulo, detalle }
const avisos = [];
const filas = [];
const falla = (clave, titulo, detalle) => problemas.push({ clave, titulo, detalle });

async function pedir(url) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "neuri-salud/1 (GitHub Actions; solo lectura)" },
    });
    const cuerpo = await r.text();
    return { status: r.status, ms: Date.now() - t0, cuerpo, final: r.url };
  } catch (e) {
    return { status: 0, ms: Date.now() - t0, cuerpo: "", error: String(e?.cause?.code || e?.name || e) };
  }
}

// Reintenta para no abrir issues por un parpadeo de red: falla solo si los 3 intentos fallan.
async function pedirConReintento(url, valido) {
  let ultimo;
  for (let i = 1; i <= INTENTOS; i++) {
    ultimo = await pedir(url);
    ultimo.intentos = i;
    if (valido(ultimo)) {
      if (ultimo.ms <= LENTO_MS || i === INTENTOS) return ultimo;
    }
    if (i < INTENTOS) await espera(10000);
  }
  return ultimo;
}

function healthOk(r) {
  if (r.status !== 200) return false;
  try {
    const j = JSON.parse(r.cuerpo);
    if (j.ok === false) return false;
    if (j.jobs && Object.values(j.jobs).some((x) => x && x.ok === false)) return false;
    return true;
  } catch {
    return false;
  }
}

async function revisarApps() {
  for (const app of APPS) {
    const p = await pedirConReintento(`${app.url}/`, (r) => r.status === 200);
    const pOk = p.status === 200;
    filas.push([app.nombre, "portada", pOk ? "✅" : "❌", p.status || p.error, `${p.ms} ms`]);
    if (!pOk) {
      falla(`app-${app.id}-portada`, `${app.nombre}: la portada no responde 200`,
        `GET ${app.url}/ → ${p.status || p.error} tras ${p.intentos} intentos (${p.ms} ms el último).`);
    } else if (p.ms > LENTO_MS) {
      falla(`app-${app.id}-lento`, `${app.nombre}: portada lenta`,
        `GET ${app.url}/ tardó ${p.ms} ms en ${p.intentos} intentos (umbral ${LENTO_MS} ms).`);
    }
    if (app.health) {
      const h = await pedirConReintento(`${app.url}${app.health}`, healthOk);
      const hOk = healthOk(h);
      filas.push([app.nombre, app.health, hOk ? "✅" : "❌", h.status || h.error, `${h.ms} ms`]);
      if (!hOk) {
        const extracto = (h.cuerpo || "").slice(0, 300).replace(/\s+/g, " ");
        falla(`app-${app.id}-health`, `${app.nombre}: ${app.health} en rojo`,
          `GET ${app.url}${app.health} → ${h.status || h.error} tras ${h.intentos} intentos. Respuesta: \`${extracto || "(vacía)"}\``);
      }
    }
  }
}

// DNS: el del runner por defecto. SALUD_DNS=doh usa DNS sobre HTTPS de Google (útil en local o si el
// resolvedor del runner falla). Solo consultas públicas de lectura.
const TIPOS = { TXT: 16, MX: 15, CNAME: 5 };
async function doh(nombre, tipo) {
  const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(nombre)}&type=${tipo}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  const j = await r.json();
  if (j.Status === 3) { const e = new Error("NXDOMAIN"); e.code = "ENOTFOUND"; throw e; }
  if (j.Status !== 0) { const e = new Error(`DoH status ${j.Status}`); e.code = `DOH${j.Status}`; throw e; }
  const resp = (j.Answer || []).filter((a) => a.type === TIPOS[tipo]).map((a) => a.data);
  if (!resp.length) { const e = new Error("sin datos"); e.code = "ENODATA"; throw e; }
  return resp;
}
const usarDoh = process.env.SALUD_DNS === "doh";
const resolveTxt = usarDoh
  ? async (n) => (await doh(n, "TXT")).map((d) => [d.replace(/^"|"$/g, "")]) // dns.google ya une los trozos
  : dnsSistema.resolveTxt;
const resolveMx = usarDoh
  ? async (n) => (await doh(n, "MX")).map((d) => { const [p, x] = d.split(/\s+/); return { priority: Number(p), exchange: x.replace(/\.$/, "") }; })
  : dnsSistema.resolveMx;
const resolveCname = usarDoh ? async (n) => (await doh(n, "CNAME")).map((d) => d.replace(/\.$/, "")) : dnsSistema.resolveCname;

async function txt(nombre) {
  try {
    return { ok: true, valores: (await resolveTxt(nombre)).map((partes) => partes.join("")) };
  } catch (e) {
    if (e.code === "ENOTFOUND" || e.code === "ENODATA") return { ok: true, valores: [] };
    return { ok: false, error: e.code || String(e) };
  }
}

async function revisarDominio({ dominio, envia }) {
  const id = `dns-${dominio}`;
  // SPF: en el dominio (Porkbun reenvía) y, si envía con Resend, en send.<dominio> con amazonses.
  const raiz = await txt(dominio);
  const spfRaiz = raiz.ok ? raiz.valores.filter((v) => /^v=spf1\b/i.test(v)) : null;
  if (!raiz.ok) falla(`${id}-spf`, `${dominio}: no se pudo leer SPF`, `TXT ${dominio} → ${raiz.error}`);
  else if (spfRaiz.length > 1) falla(`${id}-spf`, `${dominio}: hay ${spfRaiz.length} registros SPF`, `Debe haber uno solo: ${spfRaiz.join(" | ")}`);
  else if (spfRaiz.length === 0 && envia) falla(`${id}-spf`, `${dominio}: falta SPF`, `No hay TXT v=spf1 en ${dominio}.`);
  else if (spfRaiz.length === 0) avisos.push(`${dominio}: sin SPF propio (solo recibe correo; no envía).`);
  filas.push([dominio, "SPF", spfRaiz?.length === 1 ? "✅" : envia ? "❌" : "⚠️", spfRaiz?.[0] || "—", ""]);

  if (envia) {
    const send = await txt(`send.${dominio}`);
    const spfSend = send.ok ? send.valores.filter((v) => /^v=spf1\b/i.test(v)) : [];
    const ok = spfSend.length === 1 && /include:amazonses\.com/i.test(spfSend[0]);
    filas.push([`send.${dominio}`, "SPF (Resend)", ok ? "✅" : "❌", spfSend[0] || send.error || "—", ""]);
    if (!ok) falla(`${id}-spf-send`, `${dominio}: SPF de envío (send.${dominio}) mal`,
      `Se espera un único \`v=spf1 include:amazonses.com ~all\` en send.${dominio}; hay: ${spfSend.join(" | ") || send.error || "nada"}.`);
  }

  // DKIM: selector «resend». Un CNAME comodín (p. ej. uixie.porkbun.com) NO cuenta como llave.
  const nombreDkim = `${SELECTOR_DKIM}._domainkey.${dominio}`;
  let cname = null;
  try { cname = (await resolveCname(nombreDkim))[0] || null; } catch {}
  const dk = await txt(nombreDkim);
  const llave = dk.ok ? dk.valores.find((v) => /(^|;)\s*p=[A-Za-z0-9+/]{100,}/.test(v)) : null;
  const dkOk = Boolean(llave) && !cname;
  filas.push([nombreDkim, "DKIM", dkOk ? "✅" : "❌", dkOk ? `llave pública (${llave.length} car.)` : cname ? `CNAME ${cname}` : dk.error || "—", ""]);
  if (!dkOk) falla(`${id}-dkim`, `${dominio}: falta la llave DKIM de Resend`,
    `TXT ${nombreDkim} no tiene una llave pública \`p=…\` válida${cname ? ` (es un CNAME a ${cname})` : ""}.`);

  // DMARC: propio, o heredado del dominio organizacional si es subdominio que solo recibe.
  const dm = await txt(`_dmarc.${dominio}`);
  const dmarc = dm.ok ? dm.valores.filter((v) => /^v=DMARC1\b/i.test(v)) : [];
  let politica = null;
  if (dmarc.length === 1) {
    politica = (dmarc[0].match(/(?:^|;)\s*p=(\w+)/i) || [])[1]?.toLowerCase() || null;
    if (!["none", "quarantine", "reject"].includes(politica || "")) {
      falla(`${id}-dmarc`, `${dominio}: DMARC sin política válida`, `\`${dmarc[0]}\` no tiene p=none|quarantine|reject.`);
    } else if (politica === "none") {
      avisos.push(`${dominio}: DMARC p=none (solo monitorea; endurecer a quarantine es decisión aparte).`);
    }
  } else if (dmarc.length > 1) {
    falla(`${id}-dmarc`, `${dominio}: hay ${dmarc.length} registros DMARC`, dmarc.join(" | "));
  } else if (!envia && dominio.split(".").length > 2) {
    avisos.push(`${dominio}: sin DMARC propio; aplica el de ${dominio.split(".").slice(-2).join(".")}.`);
  } else {
    falla(`${id}-dmarc`, `${dominio}: falta DMARC`, `No hay TXT v=DMARC1 en _dmarc.${dominio}${dm.ok ? "" : ` (${dm.error})`}.`);
  }
  filas.push([`_dmarc.${dominio}`, "DMARC", dmarc.length === 1 && politica ? "✅" : envia ? "❌" : "⚠️", dmarc[0] || "heredado / —", ""]);

  // MX: solo informativo para los que envían; obligatorio para in.neuri.tech (recibe).
  let mx = [];
  try { mx = (await resolveMx(dominio)).sort((a, b) => a.priority - b.priority).map((m) => m.exchange); } catch {}
  filas.push([dominio, "MX", mx.length ? "✅" : envia ? "⚠️" : "❌", mx.join(", ") || "—", ""]);
  if (!envia && !mx.length) falla(`${id}-mx`, `${dominio}: sin MX (no puede recibir correo)`, `No hay registros MX en ${dominio}.`);
}

function revisarAuditBazar() {
  const ruta = process.env.AUDIT_BAZAR_JSON || "audit-bazar.json";
  const clave = "deps-neuri-bazar";
  if (process.env.SALUD_BAZAR === "apagado") {
    // neuri-bazar es privado: sin SALUD_BAZAR_TOKEN no se puede clonar. Listo para encender (docs/SALUD.md).
    avisos.push("neuri-bazar: audit apagado (falta el secreto SALUD_BAZAR_TOKEN; ver docs/SALUD.md). neuri-site no tiene dependencias npm.");
    filas.push(["neuri-bazar", "pnpm audit --prod", "⚠️", "apagado (sin token)", ""]);
    return;
  }
  if (!existsSync(ruta)) {
    falla(clave, "neuri-bazar: no se pudo correr pnpm audit --prod", `No existe ${ruta} (¿falló el clon público o pnpm?).`);
    filas.push(["neuri-bazar", "pnpm audit --prod", "❌", "no corrió", ""]);
    return;
  }
  try {
    const j = JSON.parse(readFileSync(ruta, "utf8"));
    const v = j?.metadata?.vulnerabilities;
    if (!v) throw new Error("sin metadata.vulnerabilities");
    const graves = (v.high || 0) + (v.critical || 0);
    const resumen = `critical ${v.critical || 0} · high ${v.high || 0} · moderate ${v.moderate || 0} · low ${v.low || 0}`;
    filas.push(["neuri-bazar", "pnpm audit --prod", graves ? "❌" : "✅", resumen, ""]);
    if (graves) {
      const lista = Object.values(j.advisories || {})
        .filter((a) => ["high", "critical"].includes(a.severity))
        .slice(0, 15)
        .map((a) => `- **${a.severity}** \`${a.module_name}\` ${a.vulnerable_versions} → ${a.patched_versions} · ${a.url || a.title}`)
        .join("\n");
      falla(clave, "neuri-bazar: dependencias de producción con vulnerabilidades high/critical", `${resumen}\n\n${lista}`);
    } else if (v.moderate) {
      avisos.push(`neuri-bazar: ${v.moderate} vulnerabilidades moderate en producción (no abren issue).`);
    }
  } catch (e) {
    falla(clave, "neuri-bazar: no se pudo leer pnpm audit --prod", `${ruta}: ${e.message}`);
    filas.push(["neuri-bazar", "pnpm audit --prod", "❌", "salida ilegible", ""]);
  }
}

// ---------- issues ----------
const MARCA = (clave) => `<!-- salud:${clave} -->`;
async function gh(metodo, ruta, cuerpo) {
  const r = await fetch(`https://api.github.com${ruta}`, {
    method: metodo,
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...(cuerpo ? { "content-type": "application/json" } : {}),
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (!r.ok && !(metodo === "POST" && ruta.endsWith("/labels") && r.status === 422)) {
    throw new Error(`GitHub ${metodo} ${ruta} → ${r.status} ${(await r.text()).slice(0, 200)}`);
  }
  return r.status === 204 ? null : r.json();
}

async function sincronizarIssues(alcances, hora, corrida) {
  const repo = process.env.GITHUB_REPOSITORY;
  await gh("POST", `/repos/${repo}/labels`, { name: "salud", color: "D93F0B", description: "Salud de las apps y del correo (workflow salud.yml)" });
  const abiertos = (await gh("GET", `/repos/${repo}/issues?labels=salud&state=open&per_page=100`))
    .filter((i) => !i.pull_request)
    .map((i) => ({ numero: i.number, clave: (i.body || "").match(/<!-- salud:([\w.-]+) -->/)?.[1] }))
    .filter((i) => i.clave);
  const acciones = [];
  for (const p of problemas) {
    const cuerpo = `${MARCA(p.clave)}\n**Sigue en rojo** · última revisión ${hora} Phoenix · [corrida](${corrida})\n\n${p.detalle}\n\n` +
      `_Lo abre y lo cierra solo \`.github/workflows/salud.yml\` (docs/SALUD.md). Se cierra en la primera corrida en verde._`;
    const existe = abiertos.find((i) => i.clave === p.clave);
    if (existe) {
      await gh("PATCH", `/repos/${repo}/issues/${existe.numero}`, { body: cuerpo }); // en silencio: sin comentario
      acciones.push(`actualizado #${existe.numero} (${p.clave})`);
    } else {
      const n = await gh("POST", `/repos/${repo}/issues`, { title: `Salud: ${p.titulo}`, labels: ["salud"], body: cuerpo });
      acciones.push(`abierto #${n.number} (${p.clave})`);
    }
  }
  const claves = new Set(problemas.map((p) => p.clave));
  for (const i of abiertos) {
    if (claves.has(i.clave) || !alcances.some((a) => i.clave.startsWith(a))) continue;
    await gh("POST", `/repos/${repo}/issues/${i.numero}/comments`, { body: `Recuperado: en verde en la corrida del ${hora} Phoenix ([corrida](${corrida})).` });
    await gh("PATCH", `/repos/${repo}/issues/${i.numero}`, { state: "closed", state_reason: "completed" });
    acciones.push(`cerrado #${i.numero} (${i.clave})`);
  }
  return acciones;
}

// ---------- principal ----------
const alcances = [];
if (modo === "apps" || modo === "todo") {
  alcances.push("app-");
  await revisarApps();
}
if (modo === "diario" || modo === "todo") {
  alcances.push("dns-", "deps-");
  // Cordura: neuri.tech siempre tiene TXT (SPF, verificaciones). Si el resolvedor no ve nada, no
  // abrimos 10 issues falsos: uno solo diciendo que el DNS del runner no respondió.
  const prueba = await txt("neuri.tech");
  if (!prueba.ok || prueba.valores.length === 0) {
    falla("dns-resolvedor", "no se pudo consultar DNS desde el runner",
      `TXT neuri.tech → ${prueba.ok ? "vacío" : prueba.error}. No se revisaron SPF/DKIM/DMARC en esta corrida.`);
  } else {
    for (const d of DOMINIOS) await revisarDominio(d);
  }
  revisarAuditBazar();
}

const hora = new Date().toLocaleString("es-MX", { timeZone: "America/Phoenix", dateStyle: "medium", timeStyle: "short" });
const corrida = process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : "(local)";
const celda = (s) => String(s).replace(/\|/g, "\\|").slice(0, 120);
let md = `### Salud de Neuri · modo ${modo} · ${hora} Phoenix\n\n` +
  `${problemas.length ? `❌ **${problemas.length} problema(s)**` : "✅ Todo en verde"}\n\n` +
  `| Qué | Revisión | Estado | Resultado | Tiempo |\n|---|---|---|---|---|\n` +
  filas.map((f) => `| ${f.map(celda).join(" | ")} |`).join("\n") + "\n";
if (problemas.length) md += `\n#### Problemas\n${problemas.map((p) => `- **${p.titulo}** (\`${p.clave}\`)`).join("\n")}\n`;
if (avisos.length) md += `\n#### Avisos (no abren issue)\n${avisos.map((a) => `- ${a}`).join("\n")}\n`;

let acciones = [];
if (!sinIssues && process.env.GITHUB_TOKEN && process.env.GITHUB_REPOSITORY) {
  acciones = await sincronizarIssues(alcances, hora, corrida);
  if (acciones.length) md += `\n#### Issues «salud»\n${acciones.map((a) => `- ${a}`).join("\n")}\n`;
}

writeFileSync("salud.md", md);
writeFileSync("salud.json", JSON.stringify({ modo, hora, ok: problemas.length === 0, problemas, avisos, filas, acciones }, null, 2));
console.log(md);
console.log(`ok=${problemas.length ? 0 : 1}`);
