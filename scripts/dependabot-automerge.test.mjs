import assert from "node:assert/strict";
import { test } from "node:test";
import { decide, updateTypes } from "./dependabot-automerge.mjs";

const SHA = "abc123";
const msg = (...types) =>
  `deps: bump the menores-y-parches group\n\n---\nupdated-dependencies:\n${types
    .map(
      (t, i) =>
        `- dependency-name: pkg${i}\n  dependency-type: direct:production\n  update-type: ${t}\n`,
    )
    .join("")}...\n\nSigned-off-by: dependabot[bot] <support@github.com>`;
const green = [
  {
    name: "CI",
    head_sha: SHA,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-23T14:00:00Z",
  },
  {
    name: "Secretos",
    head_sha: SHA,
    status: "completed",
    conclusion: "success",
    created_at: "2026-11-23T14:00:00Z",
  },
];
const base = {
  pr: { author: "dependabot[bot]", headSha: SHA, state: "open", draft: false },
  headSha: SHA,
  commits: [msg("version-update:semver-patch", "version-update:semver-minor")],
  files: ["package.json", "apps/api/package.json", "pnpm-lock.yaml"],
  runs: green,
};

test("lee los update-type de los metadatos de Dependabot", () => {
  assert.deepEqual(updateTypes(msg("version-update:semver-patch", "version-update:semver-major")), [
    "version-update:semver-patch",
    "version-update:semver-major",
  ]);
  assert.deepEqual(updateTypes("fix: nada"), []);
});

test("menor + parche con CI y Secretos en verde → se fusiona", () => {
  assert.equal(decide(base).merge, true);
});

test("una versión mayor en el grupo → queda para revisión", () => {
  const r = decide({
    ...base,
    commits: [msg("version-update:semver-patch", "version-update:semver-major")],
  });
  assert.equal(r.merge, false);
  assert.match(r.reason, /semver-major/);
});

test("CI rojo, pendiente o sin correr → no se fusiona", () => {
  const ci = (o) => [{ ...green[0], ...o }, green[1]];
  assert.equal(decide({ ...base, runs: ci({ conclusion: "failure" }) }).merge, false);
  assert.equal(
    decide({ ...base, runs: ci({ status: "in_progress", conclusion: null }) }).merge,
    false,
  );
  assert.equal(decide({ ...base, runs: [green[1]] }).merge, false);
  // La corrida más reciente manda: un verde viejo no tapa un rojo nuevo.
  const runs = [
    ...green,
    { ...green[0], conclusion: "failure", created_at: "2026-11-23T15:00:00Z" },
  ];
  assert.equal(decide({ ...base, runs }).merge, false);
});

test("Secretos rojo → no se fusiona", () => {
  assert.equal(
    decide({ ...base, runs: [green[0], { ...green[1], conclusion: "failure" }] }).merge,
    false,
  );
});

test("autor distinto, commit extra, archivo raro o PR movido → no se fusiona", () => {
  assert.equal(decide({ ...base, pr: { ...base.pr, author: "alguien" } }).merge, false);
  assert.equal(decide({ ...base, commits: [...base.commits, "otro"] }).merge, false);
  assert.equal(decide({ ...base, files: [...base.files, "apps/api/src/index.ts"] }).merge, false);
  assert.equal(decide({ ...base, pr: { ...base.pr, headSha: "otro" } }).merge, false);
  assert.equal(decide({ ...base, pr: { ...base.pr, draft: true } }).merge, false);
});

test("acciones de GitHub (ecosistema github-actions) se aceptan", () => {
  assert.equal(decide({ ...base, files: [".github/workflows/ci.yml"] }).merge, true);
});
