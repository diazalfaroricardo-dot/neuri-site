#!/usr/bin/env python3
"""seo-herramientas-gratis (23-nov-2026): dos calculadoras con página propia, indexables, sin pedir
correo y con schema WebApplication. VISTA PREVIA en la rama seo/herramientas-gratis: no se publica
sin el «sí» de Ricardo (items/backlog «Publicar: …»).

- /sigue-disponible/calculadora-dms/  «¿Cuánto pierdes por DMs sin contestar?» — construida ENCIMA
  de la calculadora que ya vive en /sigue-disponible/#calculadora (mismas 4 entradas, mismos valores
  iniciales y la misma fórmula de assets/bots-v3.js: mensajes/día × 30 × % tarde × % que compra ×
  venta promedio; se paga con ceil(49 / venta promedio) ventas). No la duplica: la landing sigue con
  su sección y enlaza aquí para el detalle.
- /bazar/calculadora-renta-comision/  «Calculadora de renta y comisión para bazar de consigna».

Los números iniciales son EJEMPLOS editables, marcados como tales; no son promedios del mercado.
Uso: python3 scripts/seo-herramientas.py && python3 scripts/seo-geo.py && python3 scripts/csp-meta.py && python3 scripts/seo.py
"""
import html, importlib.util, json, pathlib, re

R = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("bc", R / "scripts/brand-chrome.py")
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)
ISO = "2026-11-23"
E = html.escape

CSS = """<style data-calc>
.calc{display:grid;gap:18px;grid-template-columns:minmax(0,1fr)}
@media (min-width:760px){.calc{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)}}
.calc-in{display:grid;gap:14px;min-width:0}
.calc-in label{display:grid;gap:6px;font-weight:600;color:var(--ink);font-size:15px}
.calc-in label small{font-weight:400;color:var(--muted);font-size:13.5px}
.calc-in input{font:inherit;font-variant-numeric:tabular-nums;min-height:44px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);width:100%}
.calc-out{display:grid;gap:10px;align-content:start;background:var(--tint);border-radius:12px;padding:18px;min-width:0}
.calc-out .k{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--tint-ink);font-weight:600}
.calc-out .big{font:700 clamp(34px,6vw,46px)/1.05 var(--font);color:var(--ink);font-variant-numeric:tabular-nums}
.calc-out dl{display:grid;grid-template-columns:1fr auto;gap:6px 12px;margin:0;font-size:15px}
.calc-out dt{color:var(--text)}.calc-out dd{margin:0;font-weight:600;color:var(--ink);font-variant-numeric:tabular-nums;text-align:right}
.calc-out p{margin:0;font-size:15px;color:var(--text)}
.calc-out .cta{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border-radius:999px;background:var(--btn);color:var(--on-btn);font-weight:600;text-decoration:none;justify-self:start}
.ejemplo{font-size:13.5px;color:var(--muted)}
</style>"""


def faq_ld(qs, lang):
    txt = lambda h: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", h))).strip()
    return {"@type": "FAQPage", "inLanguage": lang,
            "mainEntity": [{"@type": "Question", "name": txt(q), "acceptedAnswer": {"@type": "Answer", "text": txt(a)}} for q, a in qs]}


def faq_html(qs):
    return ('<section id="preguntas"><h2>Preguntas frecuentes</h2>\n<div class="faq">\n'
            + "".join(f"<details><summary>{q}</summary><p>{a}</p></details>\n" for q, a in qs) + "</div></section>\n")


BOTS_FAQ = [
 ("¿Cómo se calcula lo que pierdo?",
  "Mensajes al día × 30 días × el porcentaje que contestas tarde o nunca × de cada 100 que contestas, cuántos compran × lo que vale una venta. Es la misma fórmula de la calculadora de neuri.bots en su página principal."),
 ("¿De dónde salen los números que vienen puestos?",
  "Son un ejemplo para que veas cómo funciona: 30 mensajes al día, 40 % sin contestar a tiempo, 20 de cada 100 compran y US$60 por venta. Cámbialos por los tuyos; no son promedios del mercado."),
 ("¿Tengo que dejar mi correo para ver el resultado?",
  "No. El cálculo se hace en tu navegador y no guardamos lo que escribes."),
 ("¿Cuántas ventas necesito recuperar para pagar neuri.bots?",
  "El plan Básico cuesta US$49 al mes. Divide 49 entre lo que vale una venta: con ventas de US$60, se paga con 1 venta al mes."),
]
BAZAR_FAQ = [
 ("¿Qué conviene más: cobrar renta fija o comisión?",
  "Depende de cuánto venden tus vendedores. Con renta fija sabes cuánto entra cada mes; con comisión ganas más cuando venden más. La calculadora te dice a partir de qué comisión ganarías lo mismo que con la renta."),
 ("¿Cómo se calcula el pago a cada vendedor?",
  "Sus ventas del mes, menos la comisión del bazar (si cobras), menos su renta. Si sus ventas no alcanzan para la renta, la diferencia queda como saldo pendiente para su siguiente pago."),
 ("¿Los números que vienen puestos son promedios?",
  "No. Son un ejemplo para ver cómo funciona: 40 puestos, US$150 de renta al mes, US$600 de ventas por vendedor y 0 % de comisión. Pon los de tu bazar."),
 ("¿Tengo que dejar mi correo?",
  "No. El cálculo se hace en tu navegador y no guardamos lo que escribes."),
 ("¿Cuánto cuesta neuri.bazar para mi número de puestos?",
  "US$79 al mes hasta 30 vendedores, US$119 hasta 75 y US$149 sin límite. Precio fijo, sin comisión por venta. La calculadora te muestra el plan que te toca."),
]

BOTS_BODY = """<h1>¿Cuánto pierdes por DMs sin contestar?</h1>
<p class="lead"><b>Respuesta corta:</b> multiplica los mensajes que te llegan al día por 30, por el porcentaje que contestas tarde o nunca, por cuántos de cada 100 compran y por lo que vale una venta. Pon tus números abajo y lo ves al instante, sin dejar tu correo.</p>
<section aria-label="Calculadora">
<form class="calc" id="calc" onsubmit="return false">
 <div class="calc-in">
  <label for="c-msgs">Mensajes que te llegan al día<input id="c-msgs" type="number" inputmode="numeric" min="0" step="1" value="30"></label>
  <label for="c-late">De esos, los que contestas tarde o nunca (%)<input id="c-late" type="number" inputmode="numeric" min="0" max="100" step="1" value="40"></label>
  <label for="c-close">De cada 100 que sí contestas, ¿cuántos compran?<input id="c-close" type="number" inputmode="numeric" min="0" max="100" step="1" value="20"></label>
  <label for="c-ticket">Lo que vale una venta en promedio (USD)<input id="c-ticket" type="number" inputmode="decimal" min="0" step="1" value="60"></label>
  <p class="ejemplo">Los valores que vienen puestos son un ejemplo. Cámbialos por los tuyos.</p>
 </div>
 <div class="calc-out" aria-live="polite">
  <span class="k">Al mes se te van (USD)</span>
  <div class="big" id="r-money">$4,320</div>
  <dl><dt>Ventas perdidas al mes</dt><dd id="r-sales">72</dd>
  <dt>Mensajes sin respuesta a tiempo al mes</dt><dd id="r-lost">360</dd>
  <dt>Al año (USD)</dt><dd id="r-year">$51,840</dd></dl>
  <p>El plan Básico de neuri.bots cuesta US$49 al mes. <span id="r-be">Se paga con 1 venta.</span></p>
  <a class="cta" href="/sigue-disponible/#alta">Quiero mi asistente</a>
 </div>
</form></section>
<section><h2>Cómo leer el resultado</h2>
<p>Quien pregunta «¿sigue disponible?» y no recibe respuesta en minutos suele seguir buscando. La calculadora cuenta solo esos mensajes: los que contestas tarde o nunca, y de ellos, los que habrían comprado con la misma proporción que tus ventas de hoy.</p>
<ul><li><b>Mensajes sin respuesta a tiempo al mes</b> = mensajes al día × 30 × % tarde o nunca.</li>
<li><b>Ventas perdidas</b> = esos mensajes × de cada 100, cuántos compran.</li>
<li><b>Dinero</b> = ventas perdidas × lo que vale una venta.</li></ul>
<p>Si quieres un número más conservador, baja el porcentaje de los que compran: no todos los que escriben tarde se van.</p></section>
<section><h2>Cómo recuperarlas</h2><p>neuri.bots contesta «¿sigue disponible?», precio, entrega y pagos al momento por Instagram, Messenger y WhatsApp con la información de tu hoja, y te pasa la plática cuando no sabe algo. Precio fijo de US$49 al mes, sin cobro por mensaje.</p>
<p><a href="/sigue-disponible/"><b>Ver cómo funciona →</b></a></p></section>
"""

BOTS_JS = """<script>(function(){var f=function(i){return document.getElementById(i)},n=function(i){var v=parseFloat(f(i).value);return isFinite(v)&&v>0?v:0},fmt=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
function calc(){var m=n('c-msgs'),l=Math.min(n('c-late'),100),c=Math.min(n('c-close'),100),t=n('c-ticket');
var lost=m*30*(l/100),ventas=lost*(c/100),money=ventas*t;
f('r-money').textContent='$'+fmt.format(Math.round(money));f('r-sales').textContent=fmt.format(Math.round(ventas));
f('r-lost').textContent=fmt.format(Math.round(lost));f('r-year').textContent='$'+fmt.format(Math.round(money*12));
var be=t>0?Math.max(1,Math.ceil(49/t)):0;f('r-be').textContent=be?('Se paga con '+be+(be===1?' venta.':' ventas.')):'Pon lo que vale una venta para ver cuántas necesitas.';}
f('calc').addEventListener('input',calc);calc();})();</script>"""

BAZAR_BODY = """<h1>Calculadora de renta y comisión para bazar de consigna</h1>
<p class="lead"><b>Respuesta corta:</b> lo que entra a tu bazar al mes es la renta de todos los puestos más la comisión sobre lo que venden; lo que le pagas a cada vendedor es lo que vendió menos esa comisión y su renta. Pon tus números y ve cuánto ganas, cuánto pagas y desde qué comisión te conviene más que la renta. Sin dejar tu correo.</p>
<section aria-label="Calculadora">
<form class="calc" id="calc" onsubmit="return false">
 <div class="calc-in">
  <label for="b-booths">Puestos rentados (vendedores)<input id="b-booths" type="number" inputmode="numeric" min="0" step="1" value="40"></label>
  <label for="b-rent">Renta por puesto al mes (USD)<input id="b-rent" type="number" inputmode="decimal" min="0" step="1" value="150"></label>
  <label for="b-sales">Ventas de cada vendedor al mes (USD)<small>En promedio; lo que se cobra en tu caja por sus piezas.</small><input id="b-sales" type="number" inputmode="decimal" min="0" step="1" value="600"></label>
  <label for="b-comm">Comisión del bazar sobre cada venta (%)<small>Pon 0 si solo cobras renta.</small><input id="b-comm" type="number" inputmode="decimal" min="0" max="100" step="0.5" value="0"></label>
  <p class="ejemplo">Los valores que vienen puestos son un ejemplo. Cámbialos por los de tu bazar.</p>
 </div>
 <div class="calc-out" aria-live="polite">
  <span class="k">Entra a tu bazar al mes (USD)</span>
  <div class="big" id="r-income">$6,000</div>
  <dl><dt>De renta</dt><dd id="r-rent">$6,000</dd>
  <dt>De comisión</dt><dd id="r-comm">$0</dd>
  <dt>Pago a cada vendedor</dt><dd id="r-pay">$450</dd>
  <dt>Comisión que iguala la renta</dt><dd id="r-even">25%</dd>
  <dt>Plan de neuri.bazar</dt><dd id="r-plan">Pro · US$119</dd></dl>
  <p id="r-note">Cada vendedor se queda con 75 % de lo que vende.</p>
  <a class="cta" href="/bazar/#prueba">Prueba 14 días gratis</a>
 </div>
</form></section>
<section><h2>Cómo se calcula</h2>
<ul><li><b>Renta al mes</b> = puestos × renta por puesto.</li>
<li><b>Comisión al mes</b> = puestos × ventas de cada vendedor × % de comisión.</li>
<li><b>Pago a cada vendedor</b> = sus ventas − la comisión − su renta. Si sale negativo, ese vendedor queda debiendo la diferencia y se descuenta de su siguiente pago.</li>
<li><b>Comisión que iguala la renta</b> = renta ÷ ventas de cada vendedor. Arriba de ese porcentaje, cobrar solo comisión te deja más que la renta fija.</li></ul></section>
<section><h2>Renta fija, comisión o las dos</h2>
<p>Con <b>renta fija</b> sabes cuánto entra aunque el mes esté flojo, y tus vendedores se quedan con todo lo demás. Con <b>comisión</b> compartes el riesgo: ganas más en meses buenos y menos en los malos. Muchos bazares combinan una renta baja con una comisión pequeña. Sea cual sea tu esquema, neuri.bazar calcula la renta y el pago de cada vendedor solo, cada semana o cada mes, y cada vendedor ve sus ventas en Mi Puesto.</p>
<p><a href="/bazar/"><b>Ver neuri.bazar →</b></a></p></section>
"""

BAZAR_JS = """<script>(function(){var f=function(i){return document.getElementById(i)},n=function(i){var v=parseFloat(f(i).value);return isFinite(v)&&v>0?v:0},fmt=new Intl.NumberFormat('en-US',{maximumFractionDigits:0}),m=function(x){return (x<0?'−$':'$')+fmt.format(Math.round(Math.abs(x)))};
function calc(){var b=Math.round(n('b-booths')),r=n('b-rent'),s=n('b-sales'),c=Math.min(n('b-comm'),100);
var rent=b*r,comm=b*s*c/100,pay=s-s*c/100-r;
f('r-income').textContent=m(rent+comm);f('r-rent').textContent=m(rent);f('r-comm').textContent=m(comm);f('r-pay').textContent=m(pay);
f('r-even').textContent=s>0?(Math.round(r/s*1000)/10)+'%':'—';
f('r-plan').textContent=b<=30?'Básico · US$79':(b<=75?'Pro · US$119':'Plus · US$149');
f('r-note').textContent=s<=0?'Pon las ventas de cada vendedor para ver su pago.':(pay<0?'Con esas ventas, cada vendedor queda debiendo '+m(-pay).replace('$','US$')+' que se descuentan de su siguiente pago.':'Cada vendedor se queda con '+Math.round(pay/s*100)+' % de lo que vende.');}
f('calc').addEventListener('input',calc);calc();})();</script>"""

PAGES = [
 dict(path="sigue-disponible/calculadora-dms/", brand="bots", lang="es", alt="/en/still-available/",
      title="¿Cuánto pierdes por DMs sin contestar? Calculadora",
      desc="Calculadora gratis: cuánto dinero pierdes al mes por los mensajes de Instagram, Messenger y WhatsApp que contestas tarde o nunca. Sin dejar tu correo.",
      name="Calculadora de DMs sin contestar", body=BOTS_BODY, js=BOTS_JS, faq=BOTS_FAQ),
 dict(path="bazar/calculadora-renta-comision/", brand="bazar", lang="es", alt="/en/bazar/",
      title="Calculadora de renta y comisión para bazar de consigna",
      desc="Calcula cuánto entra a tu bazar por renta de puestos y comisión, cuánto le pagas a cada vendedor y desde qué comisión conviene más que la renta. Gratis, sin correo.",
      name="Calculadora de renta y comisión para bazar", body=BAZAR_BODY, js=BAZAR_JS, faq=BAZAR_FAQ),
]


def build(p):
    url = "https://neuri.tech/" + p["path"]
    og = f'https://neuri.tech/assets/og/{bc.OG[(p["brand"], p["lang"])]}.png'
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebApplication", "name": p["name"], "url": url, "inLanguage": p["lang"], "description": p["desc"],
         "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "isAccessibleForFree": True,
         "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
         "datePublished": ISO, "dateModified": ISO, "publisher": {"@id": "https://neuri.tech/#org"}},
        faq_ld(p["faq"], p["lang"])]}
    head = (f'<!doctype html>\n<html lang="{p["lang"]}" data-brand="{p["brand"]}">\n<head>\n'
            f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(p["title"])}</title>'
            f'<meta name="description" content="{E(p["desc"])}">\n<link rel="canonical" href="{url}">\n'
            f'<link rel="alternate" hreflang="es-US" href="{url}">\n'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="Neuri"><meta property="og:locale" content="es_US">\n'
            f'<meta property="og:title" content="{E(p["title"])}"><meta property="og:description" content="{E(p["desc"])}"><meta property="og:url" content="{url}">\n'
            f'<meta property="og:image" content="{og}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{og}">\n'
            f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n'
            '<script src="/assets/analytics.js" defer></script>\n</head>\n<body>\n')
    content = "<!--contenido-->\n" + CSS + "\n" + p["body"] + faq_html(p["faq"]) + p["js"] + "\n<!--/contenido-->\n"
    f = R / p["path"] / "index.html"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(head + "<main>\n" + content + "</main>\n<footer></footer>\n</body>\n</html>\n", encoding="utf-8")
    bc.build(p["path"], (p["brand"], p["lang"], p["alt"], "doc"))


if __name__ == "__main__":
    for p in PAGES:
        build(p)
