#!/usr/bin/env python3
"""seo-contenido-bazar-mejores (26-nov-2026): «Mejores programas para bazar de consigna» ES + EN.
Mismo patrón que scripts/seo-contenido-p1.py (rama seo/contenido-p1): contenido + JSON-LD aquí, y el
chrome de marca (encabezado, pie, brand.css en línea) con scripts/brand-chrome.py.

VISTA PREVIA: vive en la rama build/seo-bazar-mejores y NO se publica sin el «sí» de Ricardo
(items/seo-bazar-mejores-diseno → backlog/publicar-seo-bazar-mejores).

Reglas: cada dato de un competidor sale de su sitio (o de la fuente que se nombra) en la fecha que se dice;
lo que no se pudo confirmar en el sitio oficial se marca «sin confirmar»; sin reseñas, testimonios ni número
de clientes; marca en minúsculas (neuri.bazar); Neuri dice arriba que neuri.bazar es suyo.

Fuentes revisadas el 26-nov-2026:
  neuri.bazar      neuri.tech/bazar/#precios
  SimpleConsign    simpleconsign.com/pricing · simpleconsign.com/vendor-mall-plus
  ConsignCloud     consigncloud.com/pricing · consigncloud.com/solutions/vendor-mall-software
  Ricochet         ricoconsign.com/pricing · ricoconsign.com/vendor  (Capterra dice US$99 = plan Core;
                   el blog de ConsignCloud dice US$199 = plan Lead: las dos cifras son planes reales)
  ConsignPro       SIN CONFIRMAR en su sitio: US$1,495 pago único según el blog de ConsignCloud (competidor,
                   7-may-2026); Capterra UK: «desde US$129, por función», prueba de 30 días
  Square           squareup.com/us/en/point-of-sale/retail/pricing

Uso: python3 scripts/seo-bazar-mejores.py && python3 scripts/csp-meta.py
     (al publicar: python3 scripts/seo.py para el sitemap; ver docs/seo/BAZAR-MEJORES-ENCENDER.md)
"""
import html, importlib.util, json, pathlib, re

R = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("bc", R / "scripts/brand-chrome.py")
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)

ISO = "2026-11-26"
FECHA = {"es": "26 de noviembre de 2026", "en": "November 26, 2026"}
CORTA = {"es": "26-nov-2026", "en": "Nov 26, 2026"}
ES_PATH, EN_PATH = "bazar/mejores-programas-bazar/", "en/bazar/best-vendor-mall-software/"
ORG = {"@type": "Organization", "@id": "https://neuri.tech/#org", "name": "Neuri LLC", "url": "https://neuri.tech/"}
E = html.escape

# Estilos propios de esta guía (solo tokens de assets/brand.css → pasa brand-check). Van dentro del
# contenido porque brand-chrome.py limpia los <style> del <head>.
CSS = """<style data-mp>
.nb-wrap:has(.mp){max-width:1040px}
.mp{--mp-r:14px;font-variant-numeric:tabular-nums}
.mp .mp-n{font-family:var(--mono);font-weight:500;letter-spacing:-.01em;color:var(--ink);white-space:nowrap}
.mp>h1{max-width:20ch}
.mp>.lead,.mp>.nota,.mp section>p,.mp section>ul,.mp section>ol{max-width:68ch}
.mp-meta{display:flex;flex-wrap:wrap;gap:6px 18px;margin:0 0 22px;font-size:14px;color:var(--muted)}
.mp-meta time{color:var(--ink);font-weight:600}
.nb-wrap .mp-resp{background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:26px 28px;margin:0;box-shadow:0 40px 80px -64px rgba(5,8,13,.35)}
.mp-resp>p:first-child{font-size:19px;line-height:1.55;color:var(--ink);margin:0 0 18px}
.mp-elige{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin:0;border-top:1px solid var(--line)}
.mp-elige>div{padding:16px 18px 4px 0;min-width:0}
.mp-elige>div+div{border-left:1px solid var(--line);padding-left:18px}
.mp-elige dt{font-size:14px;color:var(--muted);margin:0 0 4px}
.mp-elige dd{margin:0;font-weight:600;color:var(--ink);line-height:1.35}
.mp-elige dd small{display:block;font-weight:400;color:var(--text);font-size:14px;margin-top:3px}
.mp-aviso{display:flex;gap:10px;align-items:flex-start;margin:16px 0 0;font-size:14.5px;color:var(--text);max-width:72ch}
.mp-aviso::before{content:"";flex:none;width:8px;height:8px;border-radius:50%;background:var(--acc);margin-top:8px}
.nb-wrap section.mp-plain{background:transparent;border:0;padding:0;margin-top:44px}
.mp h2{font-size:clamp(22px,2.4vw,28px);letter-spacing:-.025em;line-height:1.15;margin:0 0 10px;text-wrap:balance}
.mp .tabla{margin:14px 0 8px;border:1px solid var(--line);border-radius:var(--mp-r);background:var(--surface)}
.nb-wrap .mp table{min-width:880px;font-size:14px}
.mp td a{overflow-wrap:normal!important;word-break:normal}
.nb-wrap .mp th,.nb-wrap .mp td{padding:13px 11px;border-top:1px solid var(--line)}
.nb-wrap .mp th:first-child{padding-left:16px}
.nb-wrap .mp tr:first-child th{border-top:0;font-size:13px;font-weight:600;color:var(--muted);background:var(--bg)}
.nb-wrap .mp tbody th{font-weight:700;color:var(--ink);min-width:128px}
.mp tr.mp-ours>*{background:var(--tint)}
.mp-chip{display:inline-block;font-size:12px;font-weight:600;line-height:1;padding:5px 8px;border-radius:999px;background:var(--acc);color:var(--on-acc);vertical-align:2px;margin-left:6px}
.mp-si,.mp-sc{display:inline-block;white-space:nowrap;font-size:13px;font-weight:600;line-height:1.2;padding:3px 8px;border-radius:999px;margin-right:4px}
.mp-si{background:var(--tint);color:var(--tint-ink)}
.mp tr.mp-ours .mp-si{background:var(--surface)}
.mp-sc{background:var(--warn);color:var(--warn-ink);border:1px dashed var(--warn-ink)}
.mp-no{color:var(--muted)}
.mp td small{display:block;color:var(--muted);font-size:12.5px;margin-top:3px;line-height:1.35}
.mp-year{list-style:none;margin:16px 0 6px;padding:0!important;display:grid;gap:12px;max-width:none!important}
.mp-year li{padding:0!important;display:grid;grid-template-columns:minmax(150px,220px) minmax(0,1fr) auto;gap:14px;align-items:center;padding:0}
.mp-year .mp-l{color:var(--ink);font-weight:600;font-size:15px;line-height:1.3}
.mp-year .mp-l small{display:block;font-weight:400;color:var(--muted);font-size:13px}
.mp-bar{height:14px;border-radius:999px;background:var(--bg);overflow:hidden;border:1px solid var(--line)}
.mp-bar i{display:block;height:100%;border-radius:999px;background:var(--text)}
.mp-year .mp-ours .mp-bar i{background:var(--acc)}
.mp-year .mp-n{font-size:15px;min-width:76px;text-align:right}
.mp-opt{scroll-margin-top:16px}
.mp-opt header{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 16px;margin:0 0 6px}
.mp-opt h3{font-size:21px;letter-spacing:-.02em;margin:0;color:var(--ink)}
.mp-opt header .mp-n{font-size:15px;color:var(--text)}
.mp-opt .mp-para{color:var(--text);margin:0 0 14px}
.mp-facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin:0 0 16px;border-block:1px solid var(--line)}
.mp-facts>div{padding:12px 14px 12px 0;min-width:0}
.mp-facts>div+div{border-left:1px solid var(--line);padding-left:14px}
.mp-facts dt{font-size:13px;color:var(--muted);margin:0 0 2px}
.mp-facts dd{margin:0;color:var(--ink);font-size:14.5px;line-height:1.4}
.mp-pros{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.mp-pros>div{min-width:0}
.mp-pros h4{font-size:14px;font-weight:600;color:var(--muted);margin:0 0 4px}
.mp-pros ul{margin:0!important;padding-left:18px!important}
.mp-opt.mp-ours{border-color:var(--acc)}
.mp-q{list-style:none;padding:0!important;margin:12px 0 0!important;display:grid;gap:0;max-width:none!important;counter-reset:q}
.mp-q li{display:grid;grid-template-columns:44px minmax(0,1fr);gap:4px 14px;padding:16px 0!important;border-top:1px solid var(--line);counter-increment:q}
.mp-q li::before{content:counter(q);font:500 22px/1 var(--mono);color:var(--acc);grid-row:span 2;padding-top:2px}
.mp-q b{font-size:17px}
.mp-q span{color:var(--text)}
.mp .faq details{border-top:1px solid var(--line);padding:4px 0}
.mp .faq details:last-child{border-bottom:1px solid var(--line)}
.mp .faq summary{cursor:pointer;font-weight:600;color:var(--ink);min-height:44px;display:flex;align-items:center;padding:8px 0;list-style-position:inside}
.mp .faq details p{margin:0 0 12px;color:var(--text);max-width:68ch}
.mp-fuentes{columns:2;column-gap:32px;font-size:14px;color:var(--muted);padding-left:18px!important}
.mp-fuentes li{break-inside:avoid}
.mp-cta{display:flex;flex-wrap:wrap;align-items:center;gap:10px 20px;margin-top:6px}
.mp-btn{display:inline-flex;align-items:center;min-height:44px;padding:0 20px;border-radius:999px;background:var(--btn);color:var(--on-btn)!important;text-decoration:none;font-weight:600}
.mp-btn:hover{background:var(--acc);color:var(--on-acc)!important}
@media (max-width:760px){
 .mp-elige,.mp-facts{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
 .mp-elige>div:nth-child(3){grid-column:1/-1;border-left:0;padding-left:0;border-top:1px solid var(--line)}
 .mp-facts>div:nth-child(3){border-left:0;padding-left:0}
 .mp-facts>div:nth-child(n+3){border-top:1px solid var(--line)}
 .mp-pros{grid-template-columns:minmax(0,1fr);gap:12px}
 .mp-fuentes{columns:1}
 .nb-wrap .mp-resp{padding:20px 18px}
 .mp-resp>p:first-child{font-size:17.5px}
 .mp-year li{grid-template-columns:minmax(0,1fr) auto;gap:6px 12px}
 .mp-year .mp-bar{grid-column:1/-1;grid-row:2}
 /* Tabla → una ficha por programa en el celular */
 .mp .tabla{border:0;background:transparent;overflow:visible}
 .nb-wrap .mp table{min-width:0}
 .mp table,.mp tbody,.mp tr,.mp td,.mp tbody th{display:block;width:auto}
 .mp tr:first-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
 .mp tbody tr:not(:first-child){background:var(--surface);border:1px solid var(--line);border-radius:var(--mp-r);margin:0 0 12px;overflow:hidden}
 .mp tr.mp-ours{border-color:var(--acc)!important}
 .nb-wrap .mp tbody th{font-size:17px;padding:14px 16px 8px;border-top:0}
 .nb-wrap .mp td{display:grid;grid-template-columns:118px minmax(0,1fr);gap:10px;padding:9px 16px;border-top:1px solid var(--line)}
 .mp td::before{content:attr(data-l);font-size:13px;color:var(--muted);line-height:1.4}
}
@media (max-width:420px){.mp-elige{grid-template-columns:minmax(0,1fr)}.mp-elige>div+div{border-left:0;padding-left:0;border-top:1px solid var(--line)}}
</style>"""


def si(t):
    return f'<span class="mp-si">{t}</span>'


def sc(t):
    return f'<span class="mp-sc">{t}</span>'


def no(t):
    return f'<span class="mp-no">{t}</span>'


def n(t):
    return f'<span class="mp-n">{t}</span>'


def tabla(th, rows, aria):
    head = "".join(f'<th scope="col">{c}</th>' for c in th)
    body = ""
    for r in rows:
        cls, cells = (r[0], r[1:]) if r[0] in ("mp-ours",) else ("", r)
        tds = "".join(f'<td data-l="{E(th[i + 1])}"><div>{c}</div></td>' for i, c in enumerate(cells[1:]))
        body += f'<tr{" class=" + chr(34) + cls + chr(34) if cls else ""}><th scope="row">{cells[0]}</th>{tds}</tr>\n'
    return (f'<div class="tabla" tabindex="0" role="region" aria-label="{aria}"><table>\n'
            f"<tr>{head}</tr>\n{body}</table></div>\n")


def opcion(id_, nombre, precio, para, facts, buenos, falta, extra="", ours=False):
    dl = "".join(f"<div><dt>{k}</dt><dd>{v}</dd></div>" for k, v in facts)
    ul = lambda xs: "<ul>" + "".join(f"<li>{x}</li>" for x in xs) + "</ul>"
    chip = '<span class="mp-chip">{}</span>'.format(ours) if ours else ""
    return (f'<section class="mp-opt{" mp-ours" if ours else ""}" id="{id_}"><header><h3>{nombre}{chip}</h3>{n(precio)}</header>\n'
            f'<p class="mp-para">{para}</p>\n<dl class="mp-facts">{dl}</dl>\n'
            f'<div class="mp-pros"><div><h4>{falta[0]}</h4>{ul(buenos)}</div><div><h4>{falta[1]}</h4>{ul(falta[2])}</div></div>{extra}</section>\n')


def year(rows, nota):
    top = max(v for _, _, v, _ in rows)
    li = "".join(
        f'<li class="{c}"><span class="mp-l">{l}</span><span class="mp-bar" aria-hidden="true"><i style="width:{v / top * 100:.1f}%"></i></span>{n("US$" + format(v, ","))}</li>'
        for l, c, v, _ in rows)
    return f'<ul class="mp-year">{li}</ul><p class="nota">{nota}</p>\n'


def faq_html(titulo, qs):
    items = "".join(f"<details><summary>{q}</summary><p>{a}</p></details>\n" for q, a in qs)
    return f'<section class="mp-plain" id="preguntas"><h2>{titulo}</h2>\n<div class="faq">\n{items}</div></section>\n'


def txt(h):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", h))).strip()


# ════════════════════════════════════ ESPAÑOL ════════════════════════════════════
F_ES = FECHA["es"]
QES = [
 ("¿Cuánto cuesta un programa para bazar de consigna?",
  "En los que comparamos, entre US$79 y US$379 al mes (revisado el 26 de noviembre de 2026): neuri.bazar desde US$79, Ricochet desde US$99, "
  "ConsignCloud desde US$139 y SimpleConsign desde US$159; su plan para renta de puestos, Vendor Mall Plus, cuesta US$379 con US$199 de entrada. "
  "ConsignPro se vende como licencia de pago único: ConsignCloud dice US$1,495, cifra que no pudimos confirmar en el sitio de ConsignPro."),
 ("¿Qué programa cobra la renta del puesto automáticamente?",
  "neuri.bazar, SimpleConsign Vendor Mall Plus, ConsignCloud y Ricochet dicen en su sitio que descuentan la renta del saldo o de los pagos del vendedor. "
  "SimpleConsign también la puede cobrar a una tarjeta guardada. De ConsignPro no lo pudimos confirmar."),
 ("¿Hay software para bazar en español?",
  "Sí. neuri.bazar funciona completo en español y en inglés, incluido el portal de cada vendedor. Las páginas de precio de SimpleConsign, ConsignCloud y Ricochet "
  "no mencionan español (revisadas el 26 de noviembre de 2026)."),
 ("¿Puedo usar Square o una caja normal para un bazar de vendedores?",
  "Para cobrar, sí. Pero la página de precios de Square for Retail no menciona consigna ni renta de puestos: tendrías que llevar aparte qué vendió cada vendedor, "
  "cuánto debe de renta y cuánto le pagas. Square for Retail cuesta US$0, US$49 o US$149 al mes por local, más 2.4% a 2.6% + 15¢ por cobro con tarjeta en persona."),
 ("¿Cómo ven sus ventas los vendedores sin preguntarme?",
  "Con un portal del vendedor. En neuri.bazar se llama Mi Puesto y abre desde el navegador del celular. SimpleConsign Vendor Mall Plus, ConsignCloud Pro "
  "(hasta 1,000 vendedores) y Ricochet también dan acceso a cada vendedor para ver sus ventas o subir sus piezas."),
 ("¿Cobran comisión por venta?",
  "neuri.bazar no cobra comisión por venta y usas tu propia terminal de tarjeta. Los demás cobran un precio al mes; si usas sus pagos integrados, pagas la tarifa de tarjeta "
  "de cada uno. Ricochet publica la suya: 2.69% a 3.29% + 10¢ por cobro con RicochetPay, según el plan."),
]

ES_TH = ["Programa", "Precio al mes", "Renta del puesto automática", "Portal del vendedor", "Español", "Prueba gratis", "Fuente y fecha"]
ES_ROWS = [
 ("mp-ours", 'neuri.bazar <span class="mp-chip">nuestro</span>', n("US$79 · 119 · 149") + "<small>Sin comisión por venta</small>",
  si("Sí") + "<small>Semanal o mensual, del saldo del vendedor</small>", si("Sí") + "<small>Mi Puesto, en el celular</small>",
  si("Sí") + "<small>Todo el sistema, ES e EN</small>", "14 días, sin tarjeta", '<a href="/bazar/#precios">neuri.tech/bazar</a><small>26-nov-2026</small>'),
 ("SimpleConsign Vendor Mall Plus", n("US$379") + "<small>US$199 de entrada: 6 meses o US$50K en ventas</small>",
  si("Sí") + "<small>Del saldo o de tarjeta guardada</small>", si("Sí") + "<small>Inventario, etiquetas y ventas</small>",
  no("Su sitio no lo menciona"), "Sí; no dice cuántos días", '<a href="https://www.simpleconsign.com/pricing" rel="nofollow">simpleconsign.com</a><small>26-nov-2026</small>'),
 ("SimpleConsign Store <small>(consigna)</small>", n("US$159 · 259 · 359") + "<small>Professional: US$99 de entrada</small>",
  no("Su plan para renta es Vendor Mall Plus"), no("Su página de precios no lo detalla"),
  no("Su sitio no lo menciona"), "Sí; no dice cuántos días", '<a href="https://www.simpleconsign.com/pricing" rel="nofollow">simpleconsign.com</a><small>26-nov-2026</small>'),
 ("ConsignCloud", n("US$139 · 189") + "<small>Pro: por tienda, hasta 3 tiendas</small>",
  si("Sí") + "<small>Semanal, quincenal o mensual; no dice desde qué plan</small>", si("Pro") + "<small>Hasta 1,000 vendedores</small>",
  no("Su sitio no lo menciona"), "Sí; no dice cuántos días", '<a href="https://consigncloud.com/pricing" rel="nofollow">consigncloud.com</a><small>26-nov-2026</small>'),
 ("Ricochet", n("US$99 · 149 · 199") + "<small>Con RicochetPay: 2.69–3.29% + 10¢ por cobro</small>",
  si("Sí") + "<small>Se descuenta de los pagos</small>", si("Sí") + "<small>El vendedor sube sus piezas</small>",
  no("Su sitio no lo menciona"), "14 días", '<a href="https://www.ricoconsign.com/pricing/" rel="nofollow">ricoconsign.com</a><small>26-nov-2026</small>'),
 ("ConsignPro", sc("Sin confirmar") + "<small>Pago único: US$1,495 según ConsignCloud</small>",
  sc("Sin confirmar"), sc("Sin confirmar"), sc("Sin confirmar"), "30 días, según Capterra",
  '<a href="https://consigncloud.com/blog/6-top-consignment-softwares-for-2026" rel="nofollow">Blog de ConsignCloud</a><small>7-may-2026 (competidor)</small>'),
]

ES_BODY = (
 '<section class="mp-plain"><h2>Comparación rápida</h2>\n<p>Precios de lista en dólares, sin impuestos. Revisamos cada uno en su propio sitio el ' + F_ES + '. '
 'Marcamos ' + sc("Sin confirmar") + ' lo que no pudimos ver en el sitio oficial.</p>\n'
 + tabla(ES_TH, ES_ROWS, "Tabla comparativa — desliza para ver todas las columnas") +
 '</section>\n'
 '<section class="mp-plain"><h2>Qué necesita un bazar que renta puestos</h2>\n'
 '<p>Una caja normal cobra. Un bazar de vendedores además tiene que saber de quién es cada pieza y cuánto le toca a cada quien. Revisa que el programa haga estas cuatro cosas:</p>\n'
 '<ul><li><b>Renta que se descuenta sola.</b> Semanal o mensual, del saldo del vendedor, sin perseguir a nadie.</li>'
 '<li><b>Cada venta ligada a su vendedor.</b> La etiqueta lleva el número de puesto y la caja suma la venta a su cuenta.</li>'
 '<li><b>Estado de cuenta para cada vendedor.</b> Ventas, renta y saldo, que el vendedor pueda ver sin preguntarte.</li>'
 '<li><b>Pago claro.</b> Saber cuánto le depositas a cada vendedor y tener el archivo listo para el banco.</li></ul></section>\n'
 '<section class="mp-plain"><h2>Lo que pagas el primer año</h2>\n'
 '<p>Con el plan más barato de cada uno que incluye portal del vendedor, a precio de lista:</p>\n'
 + year([("neuri.bazar Básico<small>hasta 30 vendedores</small>", "mp-ours", 948, ""),
         ("Ricochet Core<small>más tarifa de tarjeta si usas RicochetPay</small>", "", 1188, ""),
         ("ConsignCloud Pro<small>una tienda</small>", "", 2268, ""),
         ("SimpleConsign Vendor Mall Plus<small>6 meses a US$199 y 6 a US$379</small>", "", 3468, "")],
        "Cuentas: 79 × 12; 99 × 12; 189 × 12; 199 × 6 + 379 × 6. Sin impuestos ni comisiones de tarjeta. Con más de 30 vendedores, neuri.bazar Pro (75 vendedores) "
        "son US$1,428 al año. ConsignPro no entra porque no pudimos confirmar su precio.") +
 '</section>\n'
 '<section class="mp-plain"><h2>Las 5 opciones, una por una</h2><p>neuri.bazar va primero porque es nuestro y así queda claro desde el principio. El orden de las demás no es una calificación.</p></section>\n'
 + opcion("neuri-bazar", "neuri.bazar", "desde US$79 al mes",
   "<b>Para quién:</b> bazares, tianguis techados y antique malls que rentan puestos y quieren trabajar en español o en inglés.",
   [("Precio", "US$79 · 119 · 149 al mes, sin comisión"), ("Renta del puesto", "Fija, semanal o mensual, del saldo"),
    ("Portal del vendedor", "Mi Puesto, desde el celular"), ("Español", "Sí, todo el sistema")],
   ["La renta se descuenta sola; lo que falte pasa al siguiente pago.", "Mandas tu hoja o fotos de tu libreta y nosotros cargamos puestos, vendedores e inventario.",
    "Mes a mes, sin contrato; 14 días gratis sin tarjeta."],
   ("Lo bueno", "Lo que le falta", ["No tiene mapa de piso de los puestos.", "Cobro con tarjeta: usas tu propia terminal, no hay pagos integrados.",
                                    "Tienda en línea solo en el plan Plus; Básico llega a 30 vendedores."]),
   '<p class="mp-cta"><a class="mp-btn" href="/bazar/#prueba">Probar neuri.bazar 14 días</a><a href="/bazar/">Ver cómo funciona</a></p>', ours="nuestro")
 + opcion("simpleconsign", "SimpleConsign <small>(Store y Vendor Mall Plus)</small>", "desde US$159 al mes",
   "<b>Para quién:</b> malls de vendedores grandes que quieren mapa de piso en 3D y alta acompañada, y tiendas de consigna clásica.",
   [("Precio", "Store US$159 · 259 · 359; Vendor Mall Plus US$379 (US$199 de entrada)"), ("Renta del puesto", "Sí, en Vendor Mall Plus: del saldo o de tarjeta"),
    ("Portal del vendedor", "Sí: inventario, etiquetas y ventas"), ("Español", "Su sitio no lo menciona")],
   ["Vendor Mall Plus está hecho para malls de vendedores: renta y comisión automáticas, pago por ACH.", "Mapa de piso digital en 3D (con MappedIn).",
    "Entrada de US$199 al mes por 6 meses o hasta US$50K en ventas."],
   ("Lo bueno", "Ten en cuenta", ["Después de la entrada pasa a US$379 al mes.", "Su sitio no menciona español.", "Ofrece prueba gratis, pero no dice de cuántos días ni si incluye Vendor Mall Plus."]),
   '<p><a href="/en/bazar/vs-simpleconsign/" hreflang="en" lang="en">neuri.bazar vs SimpleConsign, point by point (in English)</a></p>')
 + opcion("consigncloud", "ConsignCloud", "desde US$139 al mes",
   "<b>Para quién:</b> tiendas de consigna y malls con muchos vendedores que quieren un sistema en la nube conocido en EE. UU.",
   [("Precio", "Basic US$139; Pro US$189 por tienda"), ("Renta del puesto", "Sí, cargos recurrentes del saldo"),
    ("Portal del vendedor", "En Pro, hasta 1,000 vendedores"), ("Español", "Su sitio no lo menciona")],
   ["Usuarios y cuentas de consignatarios sin límite en todos los planes.", "La renta se descuenta del saldo: semanal, quincenal o mensual, y sale en el recibo de pago.",
    "Cada vendedor ve solo sus piezas, ventas y saldo."],
   ("Lo bueno", "Ten en cuenta", ["El acceso para vendedores aparece desde Pro (US$189); Basic no lo lista.", "Su página de vendor malls no dice desde qué plan hay cargos recurrentes.",
                                  "Su sitio no menciona español."]))
 + opcion("ricochet", "Ricochet", "desde US$99 al mes",
   "<b>Para quién:</b> tiendas de renta de puestos y consigna que quieren el cobro con tarjeta integrado.",
   [("Precio", "Core US$99 · Reach US$149 · Lead US$199"), ("Renta del puesto", "Sí, se descuenta de los pagos"),
    ("Portal del vendedor", "Sí, el vendedor sube y etiqueta sus piezas"), ("Español", "Su sitio no lo menciona")],
   ["Descuento automático de la renta en los pagos al vendedor.", "El vendedor entra desde donde sea para subir, editar y etiquetar sus piezas.", "Prueba de 14 días."],
   ("Lo bueno", "Ten en cuenta", ["Con su procesador RicochetPay pagas 3.29%, 2.99% o 2.69% + 10¢ por cobro, según el plan.",
                                  "Capterra dice US$99 y el blog de ConsignCloud dice US$199: los dos son planes reales (Core y Lead).",
                                  "Ese blog (de un competidor) también habla de un cargo de US$100 al mes si no usas su procesador; la página de precios de Ricochet no lo dice. Pregúntalo antes de firmar."]),
   '<p><a href="/bazar/vs-ricochet/">neuri.bazar vs Ricochet, punto por punto</a></p>')
 + opcion("consignpro", "ConsignPro", "pago único (sin confirmar)",
   "<b>Para quién:</b> quien prefiere pagar una licencia una vez en lugar de una mensualidad.",
   [("Precio", sc("Sin confirmar") + " US$1,495 pago único, según ConsignCloud"), ("Renta del puesto", sc("Sin confirmar")),
    ("Portal del vendedor", sc("Sin confirmar")), ("Español", sc("Sin confirmar"))],
   ["Licencia de pago único, sin mensualidad (según ConsignCloud y Capterra).", "Capterra menciona prueba de 30 días."],
   ("Lo bueno", "Ten en cuenta", ["No pudimos ver su precio en su propio sitio. La cifra de US$1,495 viene del blog de ConsignCloud, que compite con él (7 de mayo de 2026).",
                                  "Capterra lo lista «desde US$129, por función». Pide cotización por escrito."]))
 + '<section class="mp-plain"><h2>¿Y Square?</h2><p>Square for Retail es una buena caja: US$0, US$49 o US$149 al mes por local, más 2.4% a 2.6% + 15¢ por cobro en persona. '
   'Su página de precios no menciona consigna ni renta de puestos, así que la renta, el saldo y el pago de cada vendedor los llevarías aparte. Sirve si tienes pocos vendedores y no te molesta la hoja de cálculo.</p></section>\n'
 '<section class="mp-plain"><h2>Cómo elegir en 3 preguntas</h2><ol class="mp-q">'
 '<li><b>¿Rentas puestos o consignas?</b><span>Si rentas puestos, necesitas renta automática: neuri.bazar, SimpleConsign Vendor Mall Plus, ConsignCloud o Ricochet. Si solo consignas por porcentaje, cualquiera de los cuatro, y SimpleConsign Store también.</span></li>'
 '<li><b>¿Cuántos vendedores tienes?</b><span>Hasta 30: neuri.bazar Básico (US$79) o Ricochet Core (US$99). Cientos de vendedores y varias tiendas: ConsignCloud Pro o SimpleConsign Vendor Mall Plus.</span></li>'
 '<li><b>¿Tus vendedores o clientes hablan español?</b><span>De los que comparamos, solo neuri.bazar funciona en español, con el portal del vendedor incluido.</span></li></ol></section>\n'
)

ES = dict(
 path=ES_PATH, lang="es", alt="/" + EN_PATH,
 title="Mejores programas para bazar de consigna en 2026 (con precios)",
 desc="Comparamos 5 programas para bazar de consigna y renta de puestos: precio mensual real, si cobran la renta del puesto y si funcionan en español. Actualizado nov-2026.",
 h1="Mejores programas para bazar de consigna en 2026",
 resp=("<b>Respuesta corta:</b> si tu bazar renta puestos, busca que la renta se descuente sola y que cada vendedor vea sus ventas. "
       "<b>SimpleConsign Vendor Mall Plus</b> es el más completo para eso (US$199 al mes de entrada, luego US$379). "
       "<b>neuri.bazar</b> lo hace desde US$79, en español y sin comisión. Para consigna clásica: <b>ConsignCloud</b> (desde US$139) o <b>Ricochet</b> (desde US$99)."),
 elige=[("Si rentas puestos y quieres mapa 3D", "SimpleConsign Vendor Mall Plus", "US$199 de entrada → US$379"),
        ("Si rentas puestos y quieres español", "neuri.bazar", "Desde US$79, sin comisión"),
        ("Si haces consigna clásica", "ConsignCloud o Ricochet", "Desde US$139 / US$99")],
 aviso="Esta guía la hace Neuri (neuri.tech), que hace neuri.bazar. Por eso va primero y marcado. Cada precio lleva su fuente y su fecha, y decimos cuándo te conviene otro.",
 meta=("Revisado el", "Precios en dólares (USD)", "6 programas en 5 opciones"),
 body=ES_BODY, faq_t="Preguntas frecuentes", faq=QES,
 metodo_t="Cómo hicimos esta guía",
 metodo=("El " + F_ES + " abrimos la página de precios de cada programa y copiamos lo que dice. No usamos reseñas ni número de clientes. "
         "Cuando el sitio oficial no da un dato, lo decimos o lo marcamos «sin confirmar». Los precios cambian: volvemos a revisarlos antes de cada actualización."),
 fuentes_t="Fuentes",
 fuentes=[("/bazar/#precios", "neuri.tech/bazar (precios)", CORTA["es"]),
          ("https://www.simpleconsign.com/pricing", "simpleconsign.com/pricing", CORTA["es"]),
          ("https://www.simpleconsign.com/vendor-mall-plus", "simpleconsign.com/vendor-mall-plus", CORTA["es"]),
          ("https://consigncloud.com/pricing", "consigncloud.com/pricing", CORTA["es"]),
          ("https://consigncloud.com/solutions/vendor-mall-software", "consigncloud.com · vendor mall software", CORTA["es"]),
          ("https://www.ricoconsign.com/pricing/", "ricoconsign.com/pricing", CORTA["es"]),
          ("https://www.ricoconsign.com/vendor", "ricoconsign.com/vendor", CORTA["es"]),
          ("https://consigncloud.com/blog/6-top-consignment-softwares-for-2026", "Blog de ConsignCloud (ConsignPro y Ricochet)", "7-may-2026, leído el " + CORTA["es"]),
          ("https://www.capterra.co.uk/software/121826/consignpro", "Capterra · ConsignPro", CORTA["es"]),
          ("https://squareup.com/us/en/point-of-sale/retail/pricing", "Square for Retail · precios", CORTA["es"])],
 upd=f'<span data-actualizado>Actualizado el <time datetime="{ISO}">{F_ES}</time></span>',
)

# ════════════════════════════════════ ENGLISH ════════════════════════════════════
F_EN = FECHA["en"]
QEN = [
 ("How much does vendor mall software cost?",
  "Among the ones we compared, US$79 to US$379 a month (checked November 26, 2026): neuri.bazar from US$79, Ricochet from US$99, ConsignCloud from US$139 and "
  "SimpleConsign from US$159; its booth-rental plan, Vendor Mall Plus, is US$379 with a US$199 intro price. ConsignPro is sold as a one-time license: ConsignCloud says "
  "US$1,495, which we could not confirm on ConsignPro's own site."),
 ("Which software collects booth rent automatically?",
  "neuri.bazar, SimpleConsign Vendor Mall Plus, ConsignCloud and Ricochet all say on their sites that they take rent out of the vendor's balance or payout. "
  "SimpleConsign can also charge a card on file. We could not confirm it for ConsignPro."),
 ("Is there vendor mall software in Spanish?",
  "Yes. neuri.bazar runs fully in English and Spanish, including each vendor's portal. The pricing pages of SimpleConsign, ConsignCloud and Ricochet do not mention Spanish "
  "(checked November 26, 2026)."),
 ("Can I use Square or a regular POS for a vendor mall?",
  "To take payments, yes. But Square for Retail's pricing page does not mention consignment or booth rent, so you would track each vendor's sales, rent and payout separately. "
  "Square for Retail costs US$0, US$49 or US$149 a month per location, plus 2.4% to 2.6% + 15¢ per in-person card payment."),
 ("How can vendors see their sales without asking me?",
  "Through a vendor portal. In neuri.bazar it is called My Booth and opens in the phone's browser. SimpleConsign Vendor Mall Plus, ConsignCloud Pro (up to 1,000 vendors) "
  "and Ricochet also give each vendor a login to check sales or add items."),
 ("Do they take a commission on sales?",
  "neuri.bazar takes no commission per sale and you keep your own card terminal. The others charge a monthly price; if you use their integrated payments, you pay each one's card rate. "
  "Ricochet publishes its rate: 2.69% to 3.29% + 10¢ per transaction with RicochetPay, depending on the plan."),
]

EN_TH = ["Software", "Monthly price", "Automatic booth rent", "Vendor portal", "Spanish", "Free trial", "Source and date"]
EN_ROWS = [
 ("mp-ours", 'neuri.bazar <span class="mp-chip">ours</span>', n("US$79 · 119 · 149") + "<small>No commission per sale</small>",
  si("Yes") + "<small>Weekly or monthly, from the vendor's balance</small>", si("Yes") + "<small>My Booth, on the phone</small>",
  si("Yes") + "<small>The whole system, EN and ES</small>", "14 days, no card", '<a href="/en/bazar/">neuri.tech/en/bazar</a><small>Nov 26, 2026</small>'),
 ("SimpleConsign Vendor Mall Plus", n("US$379") + "<small>US$199 intro: 6 months or US$50K in sales</small>",
  si("Yes") + "<small>From balance or card on file</small>", si("Yes") + "<small>Inventory, labels and sales</small>",
  no("Not mentioned on its site"), "Yes; length not stated", '<a href="https://www.simpleconsign.com/pricing" rel="nofollow">simpleconsign.com</a><small>Nov 26, 2026</small>'),
 ("SimpleConsign Store <small>(consignment)</small>", n("US$159 · 259 · 359") + "<small>Professional: US$99 intro</small>",
  no("Its booth-rent plan is Vendor Mall Plus"), no("Not detailed on its pricing page"),
  no("Not mentioned on its site"), "Yes; length not stated", '<a href="https://www.simpleconsign.com/pricing" rel="nofollow">simpleconsign.com</a><small>Nov 26, 2026</small>'),
 ("ConsignCloud", n("US$139 · 189") + "<small>Pro: per location, up to 3</small>",
  si("Yes") + "<small>Weekly, biweekly or monthly; plan not stated</small>", si("Pro") + "<small>Up to 1,000 vendors</small>",
  no("Not mentioned on its site"), "Yes; length not stated", '<a href="https://consigncloud.com/pricing" rel="nofollow">consigncloud.com</a><small>Nov 26, 2026</small>'),
 ("Ricochet", n("US$99 · 149 · 199") + "<small>With RicochetPay: 2.69–3.29% + 10¢ per charge</small>",
  si("Yes") + "<small>Taken out of payouts</small>", si("Yes") + "<small>Vendors add their own items</small>",
  no("Not mentioned on its site"), "14 days", '<a href="https://www.ricoconsign.com/pricing/" rel="nofollow">ricoconsign.com</a><small>Nov 26, 2026</small>'),
 ("ConsignPro", sc("Unconfirmed") + "<small>One-time: US$1,495 per ConsignCloud</small>",
  sc("Unconfirmed"), sc("Unconfirmed"), sc("Unconfirmed"), "30 days, per Capterra",
  '<a href="https://consigncloud.com/blog/6-top-consignment-softwares-for-2026" rel="nofollow">ConsignCloud blog</a><small>May 7, 2026 (competitor)</small>'),
]

EN_BODY = (
 '<section class="mp-plain"><h2>Quick comparison</h2>\n<p>List prices in US dollars, before tax. We checked each one on its own site on ' + F_EN + '. '
 'We mark ' + sc("Unconfirmed") + ' anything we could not see on the official site.</p>\n'
 + tabla(EN_TH, EN_ROWS, "Comparison table — swipe to see all columns") +
 '</section>\n'
 '<section class="mp-plain"><h2>What a booth-rental mall needs</h2>\n'
 '<p>A regular POS takes payments. A vendor mall also has to know whose item it is and what each vendor is owed. Check that the software does these four things:</p>\n'
 '<ul><li><b>Rent that collects itself.</b> Weekly or monthly, out of the vendor\'s balance, without chasing anyone.</li>'
 '<li><b>Every sale tied to its vendor.</b> The tag carries the booth number and the register adds the sale to that account.</li>'
 '<li><b>A statement for each vendor.</b> Sales, rent and balance, visible to the vendor without asking you.</li>'
 '<li><b>Clear payouts.</b> Know what you owe each vendor and have the file ready for the bank.</li></ul></section>\n'
 '<section class="mp-plain"><h2>What the first year costs</h2>\n'
 '<p>On each one\'s cheapest plan that includes a vendor portal, at list price:</p>\n'
 + year([("neuri.bazar Basic<small>up to 30 vendors</small>", "mp-ours", 948, ""),
         ("Ricochet Core<small>plus card fees if you use RicochetPay</small>", "", 1188, ""),
         ("ConsignCloud Pro<small>one location</small>", "", 2268, ""),
         ("SimpleConsign Vendor Mall Plus<small>6 months at US$199, 6 at US$379</small>", "", 3468, "")],
        "Math: 79 × 12; 99 × 12; 189 × 12; 199 × 6 + 379 × 6. Before tax and card fees. With more than 30 vendors, neuri.bazar Pro (75 vendors) "
        "is US$1,428 a year. ConsignPro is left out because we could not confirm its price.") +
 '</section>\n'
 '<section class="mp-plain"><h2>The 5 options, one by one</h2><p>neuri.bazar comes first because it is ours, so that is clear from the start. The order of the rest is not a ranking.</p></section>\n'
 + opcion("neuri-bazar", "neuri.bazar", "from US$79 a month",
   "<b>Best for:</b> vendor malls, antique malls and flea markets that rent booths and want to work in English or Spanish.",
   [("Price", "US$79 · 119 · 149 a month, no commission"), ("Booth rent", "Fixed, weekly or monthly, from the balance"),
    ("Vendor portal", "My Booth, on the phone"), ("Spanish", "Yes, the whole system")],
   ["Rent comes out on its own; any shortfall carries to the next payout.", "Send your spreadsheet or photos of your ledger and we load booths, vendors and inventory.",
    "Month to month, no contract; 14-day free trial, no card."],
   ("The good", "What it lacks", ["No booth floor map.", "Card payments: you keep your own terminal; there are no integrated payments.",
                                  "Online store only on the Plus plan; Basic tops out at 30 vendors."]),
   '<p class="mp-cta"><a class="mp-btn" href="/en/bazar/#prueba">Try neuri.bazar free for 14 days</a><a href="/en/bazar/">See how it works</a></p>', ours="ours")
 + opcion("simpleconsign", "SimpleConsign <small>(Store and Vendor Mall Plus)</small>", "from US$159 a month",
   "<b>Best for:</b> larger vendor malls that want a 3D floor map and guided onboarding, and classic consignment shops.",
   [("Price", "Store US$159 · 259 · 359; Vendor Mall Plus US$379 (US$199 intro)"), ("Booth rent", "Yes, on Vendor Mall Plus: from balance or card"),
    ("Vendor portal", "Yes: inventory, labels and sales"), ("Spanish", "Not mentioned on its site")],
   ["Vendor Mall Plus is built for vendor malls: automatic rent and commission, ACH payouts.", "Digital 3D floor plan (powered by MappedIn).",
    "US$199 a month intro for 6 months or until US$50K in sales."],
   ("The good", "Keep in mind", ["After the intro it moves to US$379 a month.", "Its site does not mention Spanish.", "Offers a free trial but does not say how long or whether it covers Vendor Mall Plus."]),
   '<p><a href="/en/bazar/vs-simpleconsign/">neuri.bazar vs SimpleConsign, point by point</a></p>')
 + opcion("consigncloud", "ConsignCloud", "from US$139 a month",
   "<b>Best for:</b> consignment shops and malls with many vendors that want a well-known cloud system in the US.",
   [("Price", "Basic US$139; Pro US$189 per location"), ("Booth rent", "Yes, recurring fees from the balance"),
    ("Vendor portal", "On Pro, up to 1,000 vendors"), ("Spanish", "Not mentioned on its site")],
   ["Unlimited users and consignor accounts on every plan.", "Rent comes out of the balance weekly, biweekly or monthly and shows on payout receipts.",
    "Each vendor sees only their own items, sales and balance."],
   ("The good", "Keep in mind", ["Vendor access is listed from Pro (US$189); Basic does not list it.", "Its vendor mall page does not say which plan includes recurring fees.",
                                 "Its site does not mention Spanish."]))
 + opcion("ricochet", "Ricochet", "from US$99 a month",
   "<b>Best for:</b> booth-rental and consignment stores that want card processing built in.",
   [("Price", "Core US$99 · Reach US$149 · Lead US$199"), ("Booth rent", "Yes, taken out of payouts"),
    ("Vendor portal", "Yes, vendors add and label their items"), ("Spanish", "Not mentioned on its site")],
   ["Automatic rent deductions from vendor payouts.", "Vendors log in from anywhere to add, edit and label their own items.", "14-day trial."],
   ("The good", "Keep in mind", ["With its RicochetPay processor you pay 3.29%, 2.99% or 2.69% + 10¢ per charge, by plan.",
                                 "Capterra says US$99 and ConsignCloud's blog says US$199: both are real plans (Core and Lead).",
                                 "That blog (from a competitor) also mentions a US$100 monthly fee if you do not use its processor; Ricochet's pricing page does not. Ask before you sign."]),
   '<p><a href="/en/bazar/vs-ricochet/">neuri.bazar vs Ricochet, point by point</a></p>')
 + opcion("consignpro", "ConsignPro", "one-time license (unconfirmed)",
   "<b>Best for:</b> stores that would rather pay for a license once than pay monthly.",
   [("Price", sc("Unconfirmed") + " US$1,495 one-time, per ConsignCloud"), ("Booth rent", sc("Unconfirmed")),
    ("Vendor portal", sc("Unconfirmed")), ("Spanish", sc("Unconfirmed"))],
   ["One-time license, no monthly fee (per ConsignCloud and Capterra).", "Capterra mentions a 30-day trial."],
   ("The good", "Keep in mind", ["We could not see its price on its own site. The US$1,495 figure comes from ConsignCloud's blog, a competitor (May 7, 2026).",
                                 "Capterra lists it «from US$129, per feature». Ask for a written quote."]))
 + '<section class="mp-plain"><h2>What about Square?</h2><p>Square for Retail is a good register: US$0, US$49 or US$149 a month per location, plus 2.4% to 2.6% + 15¢ per in-person payment. '
   'Its pricing page does not mention consignment or booth rent, so you would track each vendor\'s rent, balance and payout on the side. It works if you have few vendors and do not mind a spreadsheet.</p></section>\n'
 '<section class="mp-plain"><h2>How to choose in 3 questions</h2><ol class="mp-q">'
 '<li><b>Do you rent booths or consign?</b><span>If you rent booths you need automatic rent: neuri.bazar, SimpleConsign Vendor Mall Plus, ConsignCloud or Ricochet. If you only consign by percentage, any of the four, plus SimpleConsign Store.</span></li>'
 '<li><b>How many vendors do you have?</b><span>Up to 30: neuri.bazar Basic (US$79) or Ricochet Core (US$99). Hundreds of vendors across several stores: ConsignCloud Pro or SimpleConsign Vendor Mall Plus.</span></li>'
 '<li><b>Do your vendors or shoppers speak Spanish?</b><span>Of the ones we compared, only neuri.bazar runs in Spanish, vendor portal included.</span></li></ol></section>\n'
)

EN = dict(
 path=EN_PATH, lang="en", alt="/" + ES_PATH,
 title="Best vendor mall software in 2026: prices compared",
 desc="We compared 5 vendor mall software options for booth-rental and consignment stores: real monthly prices, automatic booth rent and Spanish support. Updated Nov 2026.",
 h1="Best vendor mall software in 2026",
 resp=("<b>Short answer:</b> if your mall rents booths, look for rent that comes out on its own and a portal where each vendor sees their sales. "
       "<b>SimpleConsign Vendor Mall Plus</b> is the most complete for that (US$199 a month intro, then US$379). "
       "<b>neuri.bazar</b> does it from US$79, in English and Spanish, with no commission. For classic consignment: <b>ConsignCloud</b> (from US$139) or <b>Ricochet</b> (from US$99)."),
 elige=[("Booth rent plus a 3D floor map", "SimpleConsign Vendor Mall Plus", "US$199 intro → US$379"),
        ("Booth rent in English and Spanish", "neuri.bazar", "From US$79, no commission"),
        ("Classic consignment", "ConsignCloud or Ricochet", "From US$139 / US$99")],
 aviso="This guide is written by Neuri (neuri.tech), the maker of neuri.bazar. That is why it comes first and is marked. Every price has its source and date, and we say when another one fits you better.",
 meta=("Checked", "Prices in US dollars", "6 products in 5 options"),
 body=EN_BODY, faq_t="Common questions", faq=QEN,
 metodo_t="How we made this guide",
 metodo=("On " + F_EN + " we opened each product's pricing page and copied what it says. We use no reviews or customer counts. "
         "When the official site does not give a figure, we say so or mark it «unconfirmed». Prices change: we check them again before every update."),
 fuentes_t="Sources",
 fuentes=[("/en/bazar/", "neuri.tech/en/bazar (pricing)", CORTA["en"]),
          ("https://www.simpleconsign.com/pricing", "simpleconsign.com/pricing", CORTA["en"]),
          ("https://www.simpleconsign.com/vendor-mall-plus", "simpleconsign.com/vendor-mall-plus", CORTA["en"]),
          ("https://consigncloud.com/pricing", "consigncloud.com/pricing", CORTA["en"]),
          ("https://consigncloud.com/solutions/vendor-mall-software", "consigncloud.com · vendor mall software", CORTA["en"]),
          ("https://www.ricoconsign.com/pricing/", "ricoconsign.com/pricing", CORTA["en"]),
          ("https://www.ricoconsign.com/vendor", "ricoconsign.com/vendor", CORTA["en"]),
          ("https://consigncloud.com/blog/6-top-consignment-softwares-for-2026", "ConsignCloud blog (ConsignPro and Ricochet)", "May 7, 2026, read " + CORTA["en"]),
          ("https://www.capterra.co.uk/software/121826/consignpro", "Capterra · ConsignPro", CORTA["en"]),
          ("https://squareup.com/us/en/point-of-sale/retail/pricing", "Square for Retail · pricing", CORTA["en"])],
 upd=f'<span data-actualizado>Updated <time datetime="{ISO}">{F_EN}</time></span>',
)

ITEMS = [("neuri-bazar", "neuri.bazar"), ("simpleconsign", "SimpleConsign"), ("consigncloud", "ConsignCloud"),
         ("ricochet", "Ricochet"), ("consignpro", "ConsignPro")]


def build(p):
    lang, url = p["lang"], "https://neuri.tech/" + p["path"]
    es_url, en_url = "https://neuri.tech/" + ES_PATH, "https://neuri.tech/" + EN_PATH
    og = f'https://neuri.tech/assets/og/{bc.OG[("bazar", lang)]}.png'
    locale = "es_US" if lang == "es" else "en_US"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Article", "@id": url + "#article", "headline": p["h1"], "description": p["desc"], "inLanguage": lang,
         "mainEntityOfPage": url, "url": url, "image": og, "datePublished": ISO, "dateModified": ISO,
         "author": ORG, "publisher": ORG,
         "about": {"@type": "Thing", "name": "Vendor mall software" if lang == "en" else "Programa para bazar de consigna"}},
        {"@type": "ItemList", "@id": url + "#opciones", "name": p["h1"], "numberOfItems": len(ITEMS),
         "itemListOrder": "https://schema.org/ItemListUnordered",
         "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": nm, "url": f"{url}#{a}"} for i, (a, nm) in enumerate(ITEMS)]},
        {"@type": "FAQPage", "@id": url + "#preguntas", "inLanguage": lang,
         "mainEntity": [{"@type": "Question", "name": txt(q), "acceptedAnswer": {"@type": "Answer", "text": txt(a)}} for q, a in p["faq"]]}]}
    head = (f'<!doctype html>\n<html lang="{lang}" data-brand="bazar">\n<head>\n'
            f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{p["title"]}</title>'
            f'<meta name="description" content="{E(p["desc"])}">\n<link rel="canonical" href="{url}">\n'
            f'<link rel="alternate" hreflang="en-US" href="{en_url}">\n<link rel="alternate" hreflang="es-US" href="{es_url}">\n'
            f'<link rel="alternate" hreflang="x-default" href="{en_url}">\n'
            f'<meta property="og:type" content="article"><meta property="og:site_name" content="Neuri"><meta property="og:locale" content="{locale}">\n'
            f'<meta property="og:title" content="{E(p["h1"])}"><meta property="og:description" content="{E(p["desc"])}"><meta property="og:url" content="{url}">\n'
            f'<meta property="og:image" content="{og}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{og}">\n'
            f'<meta property="article:modified_time" content="{ISO}">\n'
            f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n'
            '<script src="/assets/analytics.js" defer></script>\n</head>\n<body>\n')
    m = p["meta"]
    elige = "".join(f"<div><dt>{a}</dt><dd>{b}<small>{c}</small></dd></div>" for a, b, c in p["elige"])
    fuentes = "".join(f'<li><a href="{h}"{"" if h.startswith("/") else " rel=" + chr(34) + "nofollow" + chr(34)}>{nm}</a> · {d}</li>' for h, nm, d in p["fuentes"])
    content = (
        f"<!--contenido-->\n{CSS}\n<article class=\"mp\">\n<h1>{p['h1']}</h1>\n"
        f'<p class="mp-meta"><span>{m[0]} <time datetime="{ISO}">{FECHA[lang]}</time></span><span>{m[1]}</span><span>{m[2]}</span></p>\n'
        f'<section class="mp-resp"><p>{p["resp"]}</p>\n<dl class="mp-elige">{elige}</dl></section>\n'
        f'<p class="mp-aviso">{p["aviso"]}</p>\n'
        + p["body"] + faq_html(p["faq_t"], p["faq"])
        + f'<section class="mp-plain" id="metodo"><h2>{p["metodo_t"]}</h2><p>{p["metodo"]}</p>\n'
          f'<h3>{p["fuentes_t"]}</h3><ul class="mp-fuentes">{fuentes}</ul></section>\n'
        + "</article>\n<!--/contenido-->\n")
    f = R / p["path"] / "index.html"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(head + "<main>\n" + content + f"</main>\n<footer>{p['upd']}</footer>\n</body>\n</html>\n", encoding="utf-8")
    bc.build(p["path"], ("bazar", lang, p["alt"], "doc"))


if __name__ == "__main__":
    for p in (ES, EN):
        build(p)
