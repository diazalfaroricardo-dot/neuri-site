// Copy aprobado por Ricardo el 24-nov (Mission Control: copy-bazar-mexico-aprobar, copy-lectura-subtitulos-aprobar,
// copy-una-accion-aprobar). Candado estático: el texto publicado es el de la vista previa aprobada.
import { readFileSync } from "node:fs";
const root = new URL("..", import.meta.url).pathname;
const leer = (p) => readFileSync(root + p, "utf8");
const txt = (h) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const palabras = (t) => t.split(/\s+/).filter((w) => /[\p{L}\p{N}$]/u.test(w)).length;
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log("✗", m); } else console.log("✓", m); };

// 1 · /bazar/ en español para hispanos en EE. UU. (opción B, D-10)
{
  const h = leer("bazar/index.html");
  ok(h.includes("La caja para tu bazar, swap meet o antique mall. Cada venta va al vendedor correcto. Desde $79 al mes, sin comisión."), "bazar ES: hero B");
  ok(h.includes("Dólares; el impuesto de tu estado (sales tax) se suma solo"), "bazar ES: paso de país explica el sales tax");
  for (const q of ["¿Puedo traer mis datos de otro sistema (como Ricochet o Liberty) o de Excel?", "¿La caja suma el sales tax de mi estado?", "¿En qué se distingue de otros sistemas para antique malls?"]) {
    ok(h.split(q).length - 1 === 2, `bazar ES: FAQ visible y JSON-LD «${q.slice(0, 40)}…»`);
  }
  ok(!/sales tax encima|impuesto de ventas|Cómo se compara con Quail|tianguis|MXN/.test(h), "bazar ES: sin textos viejos ni México/MXN (D-10)");
}

// 2 · Lectura fácil: subtítulos del hero ≤20 palabras ES/EN y sin la jerga del glosario (docs/copy/glosario.md)
{
  const heros = [
    ["es/index.html", /<p>(Neuri contesta a tus clientes[^<]*)<\/p>/, "Neuri contesta a tus clientes, cobra, lleva tus cuentas y hace tus posts. A cualquier hora, con tus reglas."],
    ["index.html", /<p>(Neuri answers your customers[^<]*)<\/p>/, "Neuri answers your customers, runs your register, keeps your books and makes your posts. Any hour, your rules."],
    ["bazar/index.html", /<p class="lead">([^<]*)<\/p>/, "La caja para tu bazar, swap meet o antique mall. Cada venta va al vendedor correcto. Desde $79 al mes, sin comisión."],
    ["en/bazar/index.html", /<p class="lead">([^<]*)<\/p>/, "Every sale goes to the right dealer. Statements and payouts are ready Monday. From $79 a month, no commission."],
    ["marketing/index.html", /<p class="lede">([^<]*)<\/p>/, "neuri.marketing hace los posts y reels del mes con tu estilo. Tú los apruebas con un toque."],
    ["en/marketing/index.html", /<p class="lede">([^<]*)<\/p>/, "neuri.marketing makes the month's posts and reels in your style. You approve them with one tap."],
    ["en/still-available/index.html", /<p class="lead rise rise-2">([^<]*)<\/p>/, "Neuri answers your Instagram, Facebook and WhatsApp messages in seconds: price, stock, pickup and holds. You just hand it over."],
  ];
  for (const [f, re, esperado] of heros) {
    const m = leer(f).match(re);
    // El hero ES de bazar es el texto exacto de la opción B (22 palabras con «$79»); Ricardo lo aprobó tal cual.
    ok(m && txt(m[1]) === esperado && palabras(esperado) <= (f === "bazar/index.html" ? 22 : 20), `${f}: subtítulo del hero aprobado (${palabras(esperado)} palabras)`);
  }
  ok(leer("marketing/index.html").includes("Con tu cuenta conectada se publican a su hora; si aún no, las descargas y las subes tú."), "marketing ES: «cuenta conectada» bajó a cómo funciona");
  ok(leer("en/marketing/index.html").includes("With your account connected they post on schedule; if it isn't yet, you download them and post them yourself."), "marketing EN: «account connected» bajó a cómo funciona");
  const sd = leer("sigue-disponible/index.html"), en = leer("en/still-available/index.html");
  ok(sd.includes("¿Usas Claude o ChatGPT? Tu asistente te da de alta, lee tus precios y lo prende cuando digas que sí.") && sd.includes("No, tú armas cada respuesta") && sd.includes(">Link para tu asistente<") && sd.includes("</svg>Conexión oficial de Meta</span>"), "bots ES: frases y sello nuevos");
  ok(en.includes("Use Claude or ChatGPT? Your assistant signs you up, reads your prices and turns it on when you say yes.") && en.includes("No, you build each reply") && en.includes(">Link for your assistant<") && en.includes("</svg>Meta’s official connection</span>"), "bots EN: frases y sello nuevos");
  for (const m of en.matchAll(/(?:name|property)="(?:og:|twitter:)?description" content="([^"]*)"/g))
    ok(/^Answer Instagram and Messenger messages:.*sends your link to people who comment/.test(m[1]) && !/\bDMs?\b/.test(m[1]), "bots EN: description sin «DMs»");
  const prohibidas = [
    [/API oficial de Meta|Meta’s official API|Meta's official API/, ["index.html", "es/index.html", "sigue-disponible/index.html", "en/still-available/index.html"]],
    [/URL del conector|Connector URL|armas los flujos|build the flows|suite de agentes|suite of AI agents that grows your business: they/, ["index.html", "es/index.html", "sigue-disponible/index.html", "en/still-available/index.html"]],
  ];
  for (const [re, fs] of prohibidas) for (const f of fs) ok(!re.test(leer(f)),`${f}: sin ${re.source.slice(0, 30)}…`);
  ok(/20 palabras o menos/.test(leer("docs/copy/glosario.md")), "glosario docs/copy/glosario.md");
}

if (fail) { console.log(`✗ ${fail} fallas`); process.exit(1); }
console.log("✓ copy 24-nov publicado igual que la vista previa");
