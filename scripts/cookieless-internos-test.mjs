// cc-visitantes-reales-vivo (neuri.tech): únicos por día SIN cookies (cookieless_mode 'always', hash
// diario en el servidor de PostHog, IP no guardada) y QA/robots/equipo SIEMPRE marcados is_internal,
// aunque el QA emule un iPhone con UA normal (navigator.webdriver).
// Uso: node scripts/cookieless-internos-test.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../assets/analytics.js", import.meta.url), "utf8");
let fail = 0;
const ok = (c, m) => { if (!c) { console.error(`✗ ${m}`); fail++; } else console.log(`✓ ${m}`); };

function corre(ua, { webdriver = false, path = "/", search = "" } = {}) {
  const el = () => ({ parentNode: { insertBefore() {} }, classList: { add() {} } });
  const doc = { readyState: "complete", createElement: el, getElementsByTagName: () => [el()], head: { appendChild() {} },
    documentElement: { lang: "es" }, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, addEventListener() {} };
  const win = { requestIdleCallback: () => 0, addEventListener() {} };
  const nav = { userAgent: ua, webdriver };
  const loc = { hostname: "neuri.tech", protocol: "https:", pathname: path, href: `https://neuri.tech${path}`, search, host: "neuri.tech" };
  new Function("window", "document", "location", "navigator", src)(win, doc, loc, nav);
  const ph = win.posthog;
  return { cfg: ph._i[0][1], reg: ph.find((x) => x[0] === "register")[1] };
}

const IPHONE_QA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const real = corre("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/157.0.0.0 Safari/537.36");
ok(real.cfg.cookieless_mode === "always", "cookieless_mode 'always'");
ok(real.cfg.persistence === "memory", "persistence 'memory'");
ok(real.reg.is_internal === false, "persona real no es interna");
ok(corre(IPHONE_QA, { webdriver: true }).reg.is_internal === true, "QA con iPhone emulado (webdriver) es interno");
ok(corre("Mozilla/5.0 Claude/5.11492.5 Chrome/156").reg.is_internal === true, "navegador de Claude es interno");
ok(corre("Mozilla/5.0+(compatible; UptimeRobot/2.0)").reg.is_internal === true, "UptimeRobot es interno");
ok(corre("Mozilla/5.0 Chrome/157", { path: "/qa/entrar" }).reg.is_internal === true, "/qa/ es interno");
ok(corre("Mozilla/5.0 Chrome/157", { search: "?interno=1" }).reg.is_internal === true, "?interno=1 es interno");
if (fail) { console.error(`${fail} fallas`); process.exit(1); }
