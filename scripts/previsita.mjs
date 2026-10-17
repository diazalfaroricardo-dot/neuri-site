// A246 — Chequeo previo a las visitas (31-oct y las que sigan): corre en vivo, en un solo comando,
// las pruebas de lo que un vendedor toca desde la tarjeta/QR/correo y dice en una tabla qué pasó.
// Nada envía altas reales ni correos (cada prueba usa su modo simulado). Sale con 1 si algo falla.
// Uso: node scripts/previsita.mjs [--md salida.md]
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const md = process.argv.includes("--md")
	? process.argv[process.argv.indexOf("--md") + 1]
	: "";

/** [qué revisa (para Ricardo), script, args] */
export const PRUEBAS = [
	[
		"Precios de la landing = los que cobra la app",
		"precios-test.mjs",
		["--live"],
	],
	[
		"Demo armado desde el link del QR / correo (ES/EN, 390 y 1280)",
		"alta-prefill-test.mjs",
		[],
	],
	["Alta completa desde la tarjeta (simulada)", "alta-completa-test.mjs", []],
	["Vendedor de Phoenix en español ve USD", "usd-test.mjs", []],
	["QR en español no salta a inglés", "qr-idioma-test.mjs", []],
	["Carga ligera en señal mala", "carga-ligera-test.mjs", []],
	["Preguntas frecuentes visibles", "faq-visible-test.mjs", []],
	["Aviso de privacidad junto al consentimiento", "privnote-test.mjs", []],
	[
		"Sin testimonios ni cifras inventadas",
		"l8-sin-testimonios-test.mjs",
		["--live"],
	],
	["Tarjeta de neuri.bazar respeta el idioma", "bazar-lang-link-test.mjs", []],
];

/** Servicios en vivo: responden y dicen su estado. */
export const SERVICIOS = [
	[
		"neuri.bots en línea (sd.neuri.tech/estado)",
		"https://sd.neuri.tech/estado",
	],
	["neuri.bazar en línea", "https://bazar.neuri.tech/"],
	["Landing neuri.bots ES", "https://neuri.tech/sigue-disponible/"],
	["Landing neuri.bots EN", "https://neuri.tech/en/still-available/"],
];

export function fila(ok, que, detalle, seg) {
	return `| ${ok ? "✓" : "✗"} | ${que} | ${detalle.replace(/\|/g, "/").slice(0, 90)} | ${seg}s |`;
}

const isMain =
	process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
	const filas = ["| | Qué se revisó | Detalle | Tiempo |", "|---|---|---|---|"];
	let fallas = 0;
	for (const [que, url] of SERVICIOS) {
		const t = Date.now();
		let ok = false;
		let det = "";
		try {
			const r = await fetch(url, {
				redirect: "follow",
				signal: AbortSignal.timeout(15000),
			});
			const body = await r.text();
			ok = r.ok;
			det = url.endsWith("/estado") ? body.slice(0, 80) : `HTTP ${r.status}`;
		} catch (e) {
			det = String(e.message || e);
		}
		if (!ok) fallas++;
		filas.push(fila(ok, que, det, ((Date.now() - t) / 1000).toFixed(1)));
	}
	for (const [que, script, args] of PRUEBAS) {
		const t = Date.now();
		const r = spawnSync(process.execPath, [join(dir, script), ...args], {
			encoding: "utf8",
			timeout: 180000,
		});
		const ok = r.status === 0;
		if (!ok) fallas++;
		const out = `${r.stdout || ""}${r.stderr || ""}`
			.trim()
			.split("\n")
			.filter(Boolean);
		const det = ok
			? out.at(-1) || "OK"
			: out.find((l) => /✗|fail|error/i.test(l)) ||
				out.at(-1) ||
				`salió ${r.status}`;
		filas.push(fila(ok, que, det, ((Date.now() - t) / 1000).toFixed(1)));
		console.log(`${ok ? "✓" : "✗"} ${que}`);
	}
	const resumen = `${filas.join("\n")}\n\n${fallas ? `${fallas} con falla` : "Todo en verde"} · ${new Date().toISOString()}\n`;
	console.log(`\n${resumen}`);
	if (md) writeFileSync(md, `# Chequeo previo a visitas\n\n${resumen}`);
	if (fallas) process.exit(1);
}
