#!/usr/bin/env node
// S8 — escaneo de secretos sin dependencias (equivalente a gitleaks para nuestras llaves).
// Uso:
//   node scripts/secret-scan.mjs              → archivos versionados en HEAD (CI y antes de push)
//   node scripts/secret-scan.mjs --history    → todo el historial de git (una vez al mes / al rotar)
//   node scripts/secret-scan.mjs --dir <ruta> → un bundle construido (p. ej. apps/web/dist): ahí
//                                               tampoco deben aparecer nombres de variables secretas
// Sale con código 1 si encuentra algo. Una línea con un valor falso a propósito (pruebas) se
// permite con el comentario «secret-scan:ok» en esa misma línea.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Patrones de las llaves que usa Neuri (PLATAFORMA.md) + genéricos de alto riesgo.
export const RULES = [
  ["Stripe secreta", /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}/],
  ["Stripe de prueba", /\b(?:sk|rk)_test_[A-Za-z0-9]{16,}/],
  ["Stripe webhook", /\bwhsec_[A-Za-z0-9]{24,}/],
  ["Resend", /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}/],
  ["Anthropic", /\bsk-ant-(?:api|admin)\d{2}-[A-Za-z0-9_-]{20,}/],
  ["OpenAI", /\bsk-(?:proj-)?[A-Za-z0-9]{40,}/],
  ["Meta token", /\bEAA[A-Za-z0-9]{60,}/],
  ["Google OAuth secreto", /\bGOCSPX-[A-Za-z0-9_-]{20,}/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["GitHub token", /\b(?:ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{36}\b|\bgithub_pat_[A-Za-z0-9_]{60,}/],
  ["npm token", /\bnpm_[A-Za-z0-9]{36}\b/],
  ["AWS", /\bAKIA[0-9A-Z]{16}\b/],
  ["Bearer fijo", /Authorization:\s*Bearer\s+[A-Za-z0-9-]{30,}/],
  ["Llave privada", /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/],
  // Cadena de Postgres con contraseña real (no localhost ni marcadores).
  [
    "Postgres con contraseña",
    /postgres(?:ql)?:\/\/[^:\s/"'`]+:(?!\$\{|<|\*|x{3}|pass(?:word)?@|postgres@)[^@\s"'`]{8,}@(?!localhost|127\.0\.0\.1|db[:/]|postgres[:/])[^\s"'`]+/,
  ],
];
// Nombres de variables secretas que nunca deben llegar al navegador (solo en --dir).
export const BUNDLE_NAMES =
  /\b(?:STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|STRIPE_CONNECT_WEBHOOK_SECRET|RESEND_API_KEY|RESEND_WEBHOOK_SECRET|ANTHROPIC_API_KEY|DATABASE_URL(?:_MIGRATIONS)?|META_APP_SECRET|META_VERIFY_TOKEN|WHATSAPP_TOKEN|SOCIAL_TOKEN_KEY|SD_TOKEN_KEY|SD_WEBHOOK_SECRET|BANK_DATA_KEYS?(?:_OLD)?|SESSION_SECRET|GOOGLE_CLIENT_SECRET|ADMIN_TOKEN|JOB_SECRET|CRON_SECRET)\b/;

const SKIP = /(^|\/)(node_modules|\.git)(\/|$)|secret-scan(\.test)?\.mjs$|pnpm-lock\.yaml$|\.(png|jpe?g|gif|webp|ico|pdf|woff2?|ttf|mp4|zip|gz)$/i;

export function scanText(text, file, { bundle = false } = {}) {
  const hits = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > 20000 && !bundle) continue; // minificados fuera del bundle
    if (line.includes("secret-scan:ok")) continue;
    for (const [name, re] of RULES) if (re.test(line)) hits.push({ file, line: i + 1, name });
    if (bundle && BUNDLE_NAMES.test(line)) hits.push({ file, line: i + 1, name: "Nombre de secreto en el bundle" });
  }
  return hits;
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (SKIP.test(p)) continue;
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (s.size < 5_000_000) out.push(p);
  }
  return out;
}

function main(argv) {
  const hits = [];
  if (argv.includes("--history")) {
    const log = execFileSync("git", ["log", "-p", "--all", "--no-color", "--format=commit %h"], {
      maxBuffer: 1 << 30,
      encoding: "utf8",
    });
    let commit = "?";
    let file = "?";
    for (const line of log.split("\n")) {
      if (line.startsWith("commit ")) commit = line.slice(7);
      else if (line.startsWith("+++ b/")) file = line.slice(6);
      else if (line.startsWith("+") && !SKIP.test(file))
        for (const h of scanText(line.slice(1), `${commit}:${file}`)) hits.push({ ...h, line: "+" });
    }
  } else if (argv.includes("--dir")) {
    const dir = argv[argv.indexOf("--dir") + 1];
    for (const f of walk(dir))
      hits.push(...scanText(readFileSync(f, "utf8"), relative(process.cwd(), f), { bundle: true }));
  } else {
    const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
    for (const f of files) {
      if (SKIP.test(f)) continue;
      let text;
      try {
        text = readFileSync(f, "utf8");
      } catch {
        continue;
      }
      hits.push(...scanText(text, f));
    }
  }
  for (const h of hits) console.log(`✗ ${h.name} — ${h.file}:${h.line}`);
  if (hits.length) {
    console.log(`\nsecret-scan: ${hits.length} posible(s) secreto(s). Rota la llave (PLATAFORMA.md § Rotación) y quítala.`);
    process.exit(1);
  }
  console.log("secret-scan: sin secretos ✓");
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
