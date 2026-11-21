#!/usr/bin/env node
// hf-idea-20261121-secretos-dependencias — fusiona solo los PR de Dependabot de versiones menores
// o parches, y solo cuando CI y Secretos pasaron en ESE commit.
// El repo es privado en plan gratis: GitHub no permite reglas de rama («Upgrade to GitHub Pro»),
// así que `gh pr merge --auto` no tendría checks que esperar. Por eso este script corre desde
// workflow_run (al terminar CI o Secretos) y revisa él mismo que todo esté verde.
// Copia de neuri-bazar/scripts/dependabot-automerge.mjs (mantener iguales).
// Uso (en Actions): GH_TOKEN, REPO, HEAD_SHA → node scripts/dependabot-automerge.mjs
import { execFileSync } from "node:child_process";

// Workflows que deben quedar en verde (neuri-site usa REQUIRED_WORKFLOWS="visual,Secretos").
export const REQUIRED_WORKFLOWS = (process.env.REQUIRED_WORKFLOWS || "CI,Secretos")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const OK_TYPES = new Set(["version-update:semver-patch", "version-update:semver-minor"]);
const OK_FILES = /(^|\/)(package\.json|pnpm-lock\.yaml)$|^\.github\/workflows\/[^/]+\.ya?ml$/;

/** Lee los `update-type` del bloque de metadatos que Dependabot pone en el mensaje del commit. */
export function updateTypes(message) {
  return [...String(message).matchAll(/^\s*update-type:\s*(\S+)\s*$/gm)].map((m) => m[1]);
}

/**
 * Decide si se fusiona. Devuelve { merge: boolean, reason: string }.
 * pr: { author, headSha, state, draft }, commits: [mensajes], files: [rutas],
 * runs: [{ name, head_sha, status, conclusion, created_at }]
 */
export function decide({ pr, headSha, commits, files, runs }) {
  if (pr.author !== "dependabot[bot]") return { merge: false, reason: "no es de Dependabot" };
  if (pr.state !== "open" || pr.draft) return { merge: false, reason: "PR cerrado o borrador" };
  if (pr.headSha !== headSha) return { merge: false, reason: "el PR cambió desde esta corrida" };
  if (commits.length !== 1) return { merge: false, reason: "el PR tiene commits ajenos" };
  const types = updateTypes(commits[0]);
  if (types.length === 0) return { merge: false, reason: "sin metadatos de Dependabot" };
  const bad = types.filter((t) => !OK_TYPES.has(t));
  if (bad.length) return { merge: false, reason: `incluye ${bad.join(", ")}: queda para revisión` };
  const extra = files.filter((f) => !OK_FILES.test(f));
  if (extra.length)
    return { merge: false, reason: `toca archivos inesperados: ${extra.join(", ")}` };
  for (const name of REQUIRED_WORKFLOWS) {
    const last = runs
      .filter((r) => r.name === name && r.head_sha === headSha)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
    if (!last) return { merge: false, reason: `${name} aún no corre en este commit` };
    if (last.status !== "completed") return { merge: false, reason: `${name} sigue corriendo` };
    if (last.conclusion !== "success")
      return { merge: false, reason: `${name}: ${last.conclusion}` };
  }
  return {
    merge: true,
    reason: `${types.length} actualización(es) menor/parche con ${REQUIRED_WORKFLOWS.join(" y ")} en verde`,
  };
}

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8" });
}
const api = (path) => JSON.parse(gh(["api", path]));

if (import.meta.url === `file://${process.argv[1]}`) {
  const { REPO, HEAD_SHA, DRY_RUN } = process.env;
  const prs = api(`repos/${REPO}/commits/${HEAD_SHA}/pulls`).filter((p) => p.state === "open");
  if (prs.length !== 1) {
    console.log(`Sin un PR abierto único para ${HEAD_SHA.slice(0, 8)}; nada que hacer.`);
    process.exit(0);
  }
  const p = prs[0];
  const commits = api(`repos/${REPO}/pulls/${p.number}/commits?per_page=100`).map(
    (c) => c.commit.message,
  );
  const files = api(`repos/${REPO}/pulls/${p.number}/files?per_page=100`).map((f) => f.filename);
  const runs = api(`repos/${REPO}/actions/runs?head_sha=${HEAD_SHA}&per_page=50`).workflow_runs;
  const verdict = decide({
    pr: { author: p.user.login, headSha: p.head.sha, state: p.state, draft: p.draft },
    headSha: HEAD_SHA,
    commits,
    files,
    runs,
  });
  console.log(
    `PR #${p.number}: ${verdict.merge ? "se fusiona" : "no se fusiona"} (${verdict.reason})`,
  );
  if (verdict.merge && DRY_RUN !== "1")
    gh([
      "pr",
      "merge",
      String(p.number),
      "--repo",
      REPO,
      "--squash",
      "--match-head-commit",
      HEAD_SHA,
    ]);
}
