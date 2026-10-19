// Lista de TODAS las páginas .html públicas del sitio (sin node_modules, tools, scripts, docs, assets).
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

const SKIP = new Set(["node_modules", "tools", "scripts", "docs", ".git", ".t25", "assets"]);
export function allPages(root, dir = root) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) out.push(...allPages(root, join(dir, e.name)));
    } else if (e.name.endsWith(".html")) out.push("/" + relative(root, join(dir, e.name)).replace(/index\.html$/, ""));
  }
  return out.sort();
}
