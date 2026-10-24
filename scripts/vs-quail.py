#!/usr/bin/env python3
"""Páginas comparativas neuri.bazar vs Quail (ES/EN). Aprobadas por Ricardo el 24-oct-2026.

Escribe la fuente con <!--contenido--> y aplica el chrome de marca de bazar (brand-chrome.py).
Datos de Quail: quailhq.com/llms.txt (24-oct-2026). Si Quail cambia precios, edita QUAIL y vuelve a correr.
Uso: python3 scripts/vs-quail.py && python3 scripts/seo.py && node scripts/seo-test.mjs
"""
import importlib.util, json, pathlib

R = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("bc", R / "scripts/brand-chrome.py")
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)

ES_PATH, EN_PATH = "bazar/vs-quail/", "en/bazar/vs-quail/"
FECHA_ES, FECHA_EN = "24 de octubre de 2026", "October 24, 2026"

T = {
 "es": dict(
  title="neuri.bazar vs Quail: software para bazares y antique malls | Neuri",
  desc="Comparamos neuri.bazar y Quail: precio, vendedores por plan, español, México y pesos, portal del vendedor y tienda en línea. Cuál conviene a tu bazar.",
  h1="neuri.bazar vs Quail: ¿cuál conviene para tu bazar o antique mall?",
  lead="Los dos sirven para bazares que rentan puestos a vendedores. La diferencia está en el idioma, el país y si quieres que tu inventario se venda también en línea.",
  th=("Qué comparamos", "neuri.bazar", "Quail"),
  rows=[
   ("Precio al mes", "US$79 · 119 · 149, o MXN 499 · 899 · 1,499", "US$40 · 70 · 135"),
   ("Vendedores por plan", "30 · 75 · sin límite", "30 · 60 · sin límite"),
   ("Comisión por venta", "No", "No (dice «sin otros cargos»)"),
   ("Español", "Sí, todo el sistema y el portal del vendedor", "Su sitio no lo menciona"),
   ("México y pesos", "Sí, cobra en MXN o USD", "Su sitio habla solo de EE. UU."),
   ("Portal para cada vendedor", "Sí, Mi Puesto", "Sí, con apps para iOS y Android"),
   ("Página web con tu inventario", "Sí, en el plan Plus, con apartado en línea", "Su sitio no lo menciona"),
   ("Prueba gratis", "14 días", "30 días"),
  ],
  h2a="¿Cuál elegir?",
  us=("Elige neuri.bazar si…", "Tu bazar está en México, tus vendedores hablan español, o quieres que tu inventario se vea y se aparte en línea."),
  them=("Elige Quail si…", "Operas solo en EE. UU., en inglés, buscas el precio más bajo y no necesitas tienda en línea."),
  h2b="Pruébalo con tu propio bazar",
  cta="Arma tu bazar en neuri.bazar y prueba 14 días gratis, sin tarjeta.", cta_link="Empezar prueba gratis", cta_href="/bazar/#prueba",
  tour="Ver el recorrido con pantallas reales", tour_href="/bazar/recorrido/",
  src=f"Datos de Quail tomados de su propio sitio el {FECHA_ES}. Si cambian, actualizamos esta página.",
  aria="Tabla — desliza para ver todas las columnas", locale="es_MX"),
 "en": dict(
  title="neuri.bazar vs Quail: antique mall software compared | Neuri",
  desc="neuri.bazar vs Quail: price, vendors per plan, Spanish, Mexico and pesos, vendor portal and online store. Which antique mall software fits your mall.",
  h1="neuri.bazar vs Quail: which antique mall software fits your mall?",
  lead="Both are built for malls and bazaars that rent booths to vendors. The difference is language, country, and whether you want your inventory to sell online too.",
  th=("Feature", "neuri.bazar", "Quail"),
  rows=[
   ("Monthly price", "US$79 · 119 · 149, or MXN 499 · 899 · 1,499", "US$40 · 70 · 135"),
   ("Vendors per plan", "30 · 75 · unlimited", "30 · 60 · unlimited"),
   ("Fee on sales", "No", "No (says “no other fees”)"),
   ("Spanish", "Yes, the whole system and the vendor portal", "Not mentioned on its site"),
   ("Mexico and pesos", "Yes, bills in MXN or USD", "Its site mentions the US only"),
   ("Vendor portal", "Yes, My Booth", "Yes, with iOS and Android apps"),
   ("Website with your inventory", "Yes, on the Plus plan, with online holds", "Not mentioned on its site"),
   ("Free trial", "14 days", "30 days"),
  ],
  h2a="Which should you choose?",
  us=("Choose neuri.bazar if…", "Your vendors speak Spanish, you operate in Mexico, or you want your inventory online where shoppers can hold items."),
  them=("Choose Quail if…", "You operate only in the US, in English, want the lowest price and don't need an online store."),
  h2b="Try it with your own mall",
  cta="Set up your mall on neuri.bazar and try it free for 14 days, no card.", cta_link="Start free trial", cta_href="/en/#prueba",
  tour="See the tour with real screens", tour_href="/en/bazar/tour/",
  src=f"Quail details taken from its own site on {FECHA_EN}. If they change, we update this page.",
  aria="Table — swipe to see all columns", locale="en_US"),
}


def page(lang, path, alt_path):
    t = T[lang]
    url, alt = "https://neuri.tech/" + path, "https://neuri.tech/" + alt_path
    es_url = url if lang == "es" else alt
    ld = {"@context": "https://schema.org", "@type": "WebPage", "name": t["h1"], "description": t["desc"], "url": url,
          "inLanguage": "es" if lang == "es" else "en", "dateModified": "2026-10-24",
          "publisher": {"@type": "Organization", "name": "Neuri LLC", "url": "https://neuri.tech/"},
          "about": [{"@type": "SoftwareApplication", "name": "neuri.bazar", "applicationCategory": "BusinessApplication"},
                    {"@type": "SoftwareApplication", "name": "Quail", "applicationCategory": "BusinessApplication", "url": "https://quailhq.com/"}]}
    rows = "".join(f'<tr><th scope="row">{a}</th><td><b>{b}</b></td><td>{c}</td></tr>' for a, b, c in t["rows"])
    head = (f'<!doctype html>\n<html lang="{lang}" data-brand="bazar">\n<head>\n'
            f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{t["title"]}</title>'
            f'<meta name="description" content="{t["desc"]}">\n'
            f'<link rel="canonical" href="{url}">\n'
            f'<link rel="alternate" hreflang="es" href="{es_url}"><link rel="alternate" hreflang="en" href="{alt if lang == "es" else url}">'
            f'<link rel="alternate" hreflang="x-default" href="{es_url}">\n'
            f'<meta property="og:type" content="article"><meta property="og:site_name" content="Neuri"><meta property="og:locale" content="{t["locale"]}">\n'
            f'<meta property="og:title" content="{t["h1"]}"><meta property="og:description" content="{t["desc"]}"><meta property="og:url" content="{url}">\n'
            f'<meta property="og:image" content="https://neuri.tech/assets/og/bazar-es.png"><meta name="twitter:card" content="summary_large_image">'
            f'<meta name="twitter:image" content="https://neuri.tech/assets/og/bazar-es.png">\n'
            f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n'
            '<script src="/assets/analytics.js" defer></script>\n</head>\n<body>\n')
    content = (f'<!--contenido-->\n<h1>{t["h1"]}</h1>\n<p class="lead">{t["lead"]}</p>\n'
               f'<section><div class="tabla" tabindex="0" role="region" aria-label="{t["aria"]}"><table>\n'
               f'<tr><th scope="col">{t["th"][0]}</th><th scope="col">{t["th"][1]}</th><th scope="col">{t["th"][2]}</th></tr>\n{rows}</table></div>\n'
               f'<p class="nota">{t["src"]} <a href="https://quailhq.com/">quailhq.com</a></p></section>\n'
               f'<section><h2>{t["h2a"]}</h2>\n<h3>{t["us"][0]}</h3><p>{t["us"][1]}</p>\n<h3>{t["them"][0]}</h3><p>{t["them"][1]}</p></section>\n'
               f'<section><h2>{t["h2b"]}</h2><p>{t["cta"]}</p>'
               f'<p><a href="{t["cta_href"]}"><b>{t["cta_link"]} →</b></a></p><p><a href="{t["tour_href"]}">{t["tour"]}</a></p></section>\n<!--/contenido-->\n')
    f = R / path / "index.html"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(head + "<main>\n" + content + "</main>\n<footer></footer>\n</body>\n</html>\n", encoding="utf-8")
    bc.build(path, ("bazar", lang, "/" + alt_path, "doc"))


page("es", ES_PATH, EN_PATH)
page("en", EN_PATH, ES_PATH)
