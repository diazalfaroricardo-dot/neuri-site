#!/usr/bin/env python3
"""Páginas comparativas «vs» por competidor (ES/EN). Aprobadas por Ricardo el 14-nov-2026 (idea 3).

Mismo formato que scripts/vs-quail.py: escribe la fuente con <!--contenido--> y aplica el chrome
de marca (brand-chrome.py). Cada dato del competidor sale de SU sitio público, revisado en la fecha
de FUENTES; la página lo dice y enlaza las fuentes. Sin logos de terceros ni adjetivos sobre ellos.
Si un competidor cambia precios: edita su bloque, cambia la fecha y vuelve a correr.
Uso: python3 scripts/vs-paginas.py && python3 scripts/seo.py && node scripts/vs-paginas-test.mjs
"""
import importlib.util, json, pathlib

R = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("bc", R / "scripts/brand-chrome.py")
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)

FECHA = {"es": "14 de noviembre de 2026", "en": "November 14, 2026"}
ISO = "2026-11-14"

# slug → datos. Fuentes revisadas el 14-nov-2026:
#  Ricochet: ricoconsign.com, ricoconsign.com/pricing/, ricoconsign.com/vendor
#  ManyChat: manychat.com/pricing (precios vistos desde EE. UU.), manychat.com/es
#  Predis.ai: predis.ai/pricing/ (interruptor «Monthly» y «Annually»)
PAGINAS = [
 dict(
  brand="bazar", es="bazar/vs-ricochet/", en="en/bazar/vs-ricochet/", them="Ricochet", us="neuri.bazar",
  them_url="https://www.ricoconsign.com/",
  fuentes=[("https://www.ricoconsign.com/pricing/", "ricoconsign.com/pricing"), ("https://www.ricoconsign.com/vendor", "ricoconsign.com/vendor")],
  T={
   "es": dict(
    title="neuri.bazar vs Ricochet: software para bazar de puestos",
    desc="Comparamos neuri.bazar y Ricochet para bazares y antique malls que rentan puestos: precio, cobro con tarjeta, portal del vendedor, tienda en línea, español y pesos.",
    h1="neuri.bazar vs Ricochet: ¿cuál conviene para tu bazar de puestos?",
    lead="Los dos sirven para tiendas que rentan puestos a vendedores y descuentan la renta de lo que venden. Cambian en el precio, en cómo se cobra con tarjeta, en el idioma y en el país.",
    th="Qué comparamos",
    rows=[
     ("Precio al mes", "US$79 · 119 · 149, o MXN 499 · 899 · 1,499", "US$99 · 149 · 199 (Core, Reach, Lead), y paquetes a la medida"),
     ("Renta de puestos", "Sí: renta fija semanal o mensual que se descuenta sola del saldo del vendedor", "Sí: tiene versión para renta de puestos y antique malls, con la renta descontada de los pagos al vendedor"),
     ("Vendedores por plan", "30 · 75 · sin límite", "Su sitio no pone tope de vendedores; dice usuarios, artículos y equipos sin límite"),
     ("Cobro con tarjeta", "Usas tu terminal; neuri.bazar no cobra comisión por venta", "Con su procesador RicochetPay: 3.29%, 2.99% o 2.69% + 10¢ por cobro, según el plan"),
     ("Portal para cada vendedor", "Sí, Mi Puesto, desde el navegador del celular", "Sí, Ricochet Go: el vendedor entra y sube sus propias piezas"),
     ("Tienda en línea", "En el plan Plus: tu sitio con tu inventario y apartado en línea", "Complemento Ricochet Web, incluido en Reach y Lead"),
     ("Español", "Sí, todo el sistema y el portal del vendedor", "Su sitio no lo menciona"),
     ("México y pesos", "Sí, cobra en MXN o USD", "Su sitio cobra en dólares y no menciona México"),
     ("Prueba gratis", "14 días, sin tarjeta", "Ofrece prueba gratis; su sitio no dice de cuántos días"),
    ],
    h2a="¿Cuál elegir?",
    pick_us=("Elige neuri.bazar si…", "Tu bazar está en México, tus vendedores hablan español, quieres pagar menos al mes o seguir con tu propia terminal de tarjeta."),
    pick_them=("Elige Ricochet si…", "Operas en EE. UU. o Canadá en inglés, quieres el cobro con tarjeta integrado a su procesador, o también manejas consigna además de renta de puestos."),
    h2b="Pruébalo con tu propio bazar",
    cta="Arma tu bazar en neuri.bazar y prueba 14 días gratis, sin tarjeta.", cta_link="Empezar prueba gratis", cta_href="/bazar/#prueba",
    more="Ver neuri.bazar vs Quail", more_href="/bazar/vs-quail/"),
   "en": dict(
    title="neuri.bazar vs Ricochet: booth rental software compared",
    desc="neuri.bazar vs Ricochet for antique and vendor malls that rent booths: price, card processing, vendor portal, online store, Spanish and pesos.",
    h1="neuri.bazar vs Ricochet: which fits your booth rental mall?",
    lead="Both are built for stores that rent booths to vendors and take the rent out of their sales. They differ in price, in how card payments work, and in language and country.",
    th="Feature",
    rows=[
     ("Monthly price", "US$79 · 119 · 149, or MXN 499 · 899 · 1,499", "US$99 · 149 · 199 (Core, Reach, Lead), plus custom packages"),
     ("Booth rent", "Yes: fixed weekly or monthly rent taken from the vendor’s balance automatically", "Yes: has a version for booth rental and antique malls, with rent taken from vendor payouts"),
     ("Vendors per plan", "30 · 75 · unlimited", "Its site lists no vendor cap; it says unlimited users, items and devices"),
     ("Card payments", "Use your own terminal; neuri.bazar takes no fee on sales", "Through its RicochetPay processor: 3.29%, 2.99% or 2.69% + 10¢ per charge, by plan"),
     ("Vendor portal", "Yes, My Booth, in the phone’s browser", "Yes, Ricochet Go: vendors log in and add their own items"),
     ("Online store", "On the Plus plan: your site with your inventory and online holds", "Ricochet Web add-on, included in Reach and Lead"),
     ("Spanish", "Yes, the whole system and the vendor portal", "Not mentioned on its site"),
     ("Mexico and pesos", "Yes, bills in MXN or USD", "Its site prices in dollars and doesn’t mention Mexico"),
     ("Free trial", "14 days, no card", "Offers a free trial; its site doesn’t say how long"),
    ],
    h2a="Which should you choose?",
    pick_us=("Choose neuri.bazar if…", "Your vendors speak Spanish, you operate in Mexico, you want a lower monthly price, or you want to keep your own card terminal."),
    pick_them=("Choose Ricochet if…", "You operate in the US or Canada in English, want card payments built in through its processor, or also run consignment besides booth rental."),
    h2b="Try it with your own mall",
    cta="Set up your mall on neuri.bazar and try it free for 14 days, no card.", cta_link="Start free trial", cta_href="/en/bazar/#prueba",
    more="See neuri.bazar vs Quail", more_href="/en/bazar/vs-quail/"),
  }),
 dict(
  brand="bots", es="sigue-disponible/vs-manychat/", en="en/still-available/vs-manychat/", them="ManyChat", us="neuri.bots",
  them_url="https://manychat.com/",
  fuentes=[("https://manychat.com/pricing", "manychat.com/pricing"), ("https://manychat.com/es", "manychat.com/es")],
  T={
   "es": dict(
    title="neuri.bots vs ManyChat: bot de Instagram para vender",
    desc="Comparamos neuri.bots y ManyChat para contestar DMs de Instagram y Messenger: precio en pesos, cobro por contactos, canales, cómo se arma y qué está listo hoy.",
    h1="neuri.bots vs ManyChat: ¿cuál conviene para contestar tus DMs?",
    lead="Los dos contestan mensajes de Instagram y Messenger por ti. Cambian en cómo cobran, en qué canales cubren, en cómo se arman y en qué está listo hoy.",
    th="Qué comparamos",
    rows=[
     ("Qué está listo hoy", "Alta abierta. La conexión directa con Instagram y Messenger está pendiente de aprobación de Meta", "Funcionando; dice ser Official Meta Business Partner"),
     ("Precio al mes", "MXN 899 · 1,299, o US$49 · 69", "Gratis hasta 25 contactos; US$17 · 39 · 99 · 199 (menos si pagas el año). Dice que el precio final depende del país de facturación"),
     ("Cobro por contactos", "No: precio fijo, sin cobro por contacto ni por mensaje (hasta 1,000 mensajes al día por cuenta)", "Cada plan trae un tope de contactos activos al mes (de 25 a 25,000); arriba del tope cobra por cada contacto extra"),
     ("Canales", "Instagram y Messenger; WhatsApp en camino", "Instagram, Messenger, WhatsApp, TikTok, Telegram, SMS y correo"),
     ("Cómo se arma", "Contesta con la información de tu hoja: piezas, precios, entregas y pagos. El alta toma 3 minutos", "Armas tus automatizaciones con su editor y plantillas; su IA (Manychat AI) viene desde el plan Pro"),
     ("Español", "Sí", "Sí, tiene sitio en español"),
     ("Pesos", "Sí, cobra en MXN o USD", "Su página de precios muestra dólares"),
     ("Prueba gratis", "7 días, sin tarjeta, para los primeros 10 negocios", "Plan gratis, y 14 días gratis de Essential o Pro"),
    ],
    h2a="¿Cuál elegir?",
    pick_us=("Elige neuri.bots si…", "Vendes por Instagram en México, quieres un precio fijo en pesos sin contar contactos y prefieres que conteste desde tu hoja en vez de armar flujos. Ojo: la conexión con Instagram todavía espera a Meta."),
    pick_them=("Elige ManyChat si…", "Lo necesitas funcionando hoy, usas WhatsApp, TikTok u otros canales, o quieres armar tus propios flujos. Si tienes pocos contactos al mes, su plan gratis puede bastarte."),
    h2b="Prueba neuri.bots",
    cta="Date de alta en 3 minutos y te avisamos por correo en cuanto Meta abra la conexión.", cta_link="Quiero mi asistente", cta_href="/sigue-disponible/#alta",
    more="Ver cómo funciona", more_href="/sigue-disponible/#como-funciona"),
   "en": dict(
    title="neuri.bots vs ManyChat: Instagram DM bot for sellers",
    desc="neuri.bots vs ManyChat for answering Instagram and Messenger DMs: flat price, contact-based billing, channels, setup, and what works today.",
    h1="neuri.bots vs ManyChat: which should answer your DMs?",
    lead="Both answer Instagram and Messenger messages for you. They differ in how they bill, which channels they cover, how you set them up, and what works today.",
    th="Feature",
    rows=[
     ("What works today", "Sign-up is open. The direct Instagram and Messenger connection is pending Meta’s approval", "Live; says it is an Official Meta Business Partner"),
     ("Monthly price", "US$49 · 69, or MXN 899 · 1,299", "Free up to 25 contacts; US$17 · 39 · 99 · 199 (less if billed yearly). Says the final price depends on your billing country"),
     ("Billing by contacts", "No: flat price, no charge per contact or per message (up to 1,000 messages a day per account)", "Each plan has a monthly active-contact limit (25 to 25,000); above it, it charges for each extra contact"),
     ("Channels", "Instagram and Messenger; WhatsApp on the way", "Instagram, Messenger, WhatsApp, TikTok, Telegram, SMS and email"),
     ("Setup", "Answers from your sheet: items, prices, delivery and payment. Sign-up takes 3 minutes", "You build automations with its builder and templates; its AI (Manychat AI) starts on the Pro plan"),
     ("Spanish", "Yes", "Yes, it has a Spanish site"),
     ("Pesos", "Yes, bills in MXN or USD", "Its pricing page shows dollars"),
     ("Free trial", "7 days, no card, for the first 10 businesses", "Free plan, plus 14 days free on Essential or Pro"),
    ],
    h2a="Which should you choose?",
    pick_us=("Choose neuri.bots if…", "You sell on Instagram, want a flat price without counting contacts, and would rather it answer from your sheet than build flows. Note: the Instagram connection is still waiting on Meta."),
    pick_them=("Choose ManyChat if…", "You need it working today, use WhatsApp, TikTok or other channels, or want to build your own flows. With few contacts a month, its free plan may be enough."),
    h2b="Try neuri.bots",
    cta="Sign up in 3 minutes and we’ll email you as soon as Meta opens the connection.", cta_link="Get my assistant", cta_href="/en/still-available/#signup",
    more="See how it works", more_href="/en/still-available/#como-funciona"),
  }),
 dict(
  brand="marketing", es="marketing/vs-predis/", en="en/marketing/vs-predis/", them="Predis.ai", us="neuri.marketing",
  them_url="https://predis.ai/",
  fuentes=[("https://predis.ai/pricing/", "predis.ai/pricing")],
  T={
   "es": dict(
    title="neuri.marketing vs Predis.ai: redes con IA para tu negocio",
    desc="Comparamos neuri.marketing y Predis.ai: precio en pesos, publicaciones contra créditos, quién arma el contenido, aprobación y publicación automática.",
    h1="neuri.marketing vs Predis.ai: ¿cuál conviene para tus redes?",
    lead="Los dos usan IA para tus publicaciones de Instagram y Facebook. En Predis.ai tú generas el contenido con créditos; en neuri.marketing te llega el mes armado y tú apruebas.",
    th="Qué comparamos",
    rows=[
     ("Qué está listo hoy", "Todavía no abre cuentas nuevas: abre cuando se pueda conectar Instagram y Facebook con el inicio de sesión oficial de Meta", "Funcionando"),
     ("Precio al mes", "MXN 599 · 1,199 · 1,999, o US$49 · 99 · 169", "US$32 · 79 · 249 mes a mes, o US$19 · 40 · 212 al mes pagando el año"),
     ("Qué incluye", "Publicaciones del mes: de 12 fotos y 4 reels (Inicio) a 30 fotos y 12 reels (Pro)", "Créditos para generar: 1,300 · 3,200 · 10,000 al mes (en Core, unas 325 imágenes o 33 videos)"),
     ("Quién arma el contenido", "Neuri arma el plan y las publicaciones con tu estilo", "Tú lo generas en su herramienta"),
     ("Antes de publicar", "Nada se publica sin tu visto bueno; apruebas desde el celular", "Menciona flujo de aprobación y borradores"),
     ("Publicación automática", "Sí, lo que apruebas sale en tu calendario", "En Rise y Enterprise+; Core dice «No Auto Posting»"),
     ("Idiomas", "Español e inglés", "Dice que maneja más de 18 idiomas"),
     ("Pesos", "Sí, precio final en MXN", "Precios en dólares, más impuestos"),
    ],
    h2a="¿Cuál elegir?",
    pick_us=("Elige neuri.marketing si…", "Quieres que alguien arme tu mes y tú solo apruebes, pagar en pesos por un número fijo de publicaciones, y puedes esperar a que abra."),
    pick_them=("Elige Predis.ai si…", "Lo quieres hoy, prefieres generar tú mismo publicaciones y anuncios con IA, o manejas varias marcas."),
    h2b="Mira cómo se ve un mes",
    cta="Ve un ejemplo de un mes armado por neuri.marketing, sin crear cuenta.", cta_link="Ver un ejemplo", cta_href="https://marketing.neuri.tech/demo?lang=es",
    more="Ver precios y planes", more_href="/marketing/#precios"),
   "en": dict(
    title="neuri.marketing vs Predis.ai: AI social media compared",
    desc="neuri.marketing vs Predis.ai: price, posts vs credits, who makes the content, approval and auto-posting for your Instagram and Facebook.",
    h1="neuri.marketing vs Predis.ai: which fits your social media?",
    lead="Both use AI for your Instagram and Facebook posts. With Predis.ai you generate content with credits; with neuri.marketing your month arrives ready and you approve it.",
    th="Feature",
    rows=[
     ("What works today", "Not opening new accounts yet: it opens when Instagram and Facebook can be connected through Meta’s official login", "Live"),
     ("Monthly price", "US$49 · 99 · 169, or MXN 599 · 1,199 · 1,999", "US$32 · 79 · 249 month to month, or US$19 · 40 · 212 a month billed yearly"),
     ("What you get", "The month’s posts: from 12 photos and 4 reels (Start) to 30 photos and 12 reels (Pro)", "Credits to generate: 1,300 · 3,200 · 10,000 a month (on Core, about 325 images or 33 videos)"),
     ("Who makes the content", "Neuri plans and makes the posts in your style", "You generate it in its tool"),
     ("Before anything posts", "Nothing posts without your OK; you approve from your phone", "Mentions an approval flow and drafts"),
     ("Auto-posting", "Yes, what you approve goes out on your calendar", "On Rise and Enterprise+; Core says “No Auto Posting”"),
     ("Languages", "Spanish and English", "Says it supports 18+ languages"),
     ("Pesos", "Yes, final price in MXN", "Prices in USD, plus taxes"),
    ],
    h2a="Which should you choose?",
    pick_us=("Choose neuri.marketing if…", "You want someone to build your month so you only approve, want a fixed number of posts at a flat price, and can wait for it to open."),
    pick_them=("Choose Predis.ai if…", "You want it today, prefer to generate posts and ads yourself with AI, or manage several brands."),
    h2b="See what a month looks like",
    cta="See a sample month made by neuri.marketing, no account needed.", cta_link="See a sample", cta_href="https://marketing.neuri.tech/demo?lang=en",
    more="See pricing and plans", more_href="/en/marketing/#precios"),
  }),
]

TXT = {
 "es": dict(src="Datos de {them} tomados de su propio sitio el {fecha}: {links}. Si cambian, actualizamos esta página.",
            aria="Tabla — desliza para ver todas las columnas", locale="es_MX"),
 "en": dict(src="{them} details taken from its own site on {fecha}: {links}. If they change, we update this page.",
            aria="Table — swipe to see all columns", locale="en_US"),
}
OG = {"bazar": "bazar", "bots": "bots", "marketing": "marketing"}


def page(p, lang):
    t, x = p["T"][lang], TXT[lang]
    path, alt_path = (p["es"], p["en"]) if lang == "es" else (p["en"], p["es"])
    url, alt = "https://neuri.tech/" + path, "https://neuri.tech/" + alt_path
    es_url, en_url = "https://neuri.tech/" + p["es"], "https://neuri.tech/" + p["en"]
    og = f'https://neuri.tech/assets/og/{OG[p["brand"]]}-{lang}.png'
    ld = {"@context": "https://schema.org", "@type": "WebPage", "name": t["h1"], "description": t["desc"], "url": url,
          "inLanguage": lang, "dateModified": ISO,
          "publisher": {"@type": "Organization", "name": "Neuri LLC", "url": "https://neuri.tech/"},
          "about": [{"@type": "SoftwareApplication", "name": p["us"], "applicationCategory": "BusinessApplication"},
                    {"@type": "SoftwareApplication", "name": p["them"], "applicationCategory": "BusinessApplication", "url": p["them_url"]}]}
    rows = "".join(f'<tr><th scope="row">{a}</th><td><b>{b}</b></td><td>{c}</td></tr>' for a, b, c in t["rows"])
    links = ", ".join(f'<a href="{h}" rel="nofollow">{n}</a>' for h, n in p["fuentes"])
    src = x["src"].format(them=p["them"], fecha=FECHA[lang], links=links)
    head = (f'<!doctype html>\n<html lang="{lang}" data-brand="{p["brand"]}">\n<head>\n'
            f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{t["title"]}</title>'
            f'<meta name="description" content="{t["desc"]}">\n'
            f'<link rel="canonical" href="{url}">\n'
            f'<link rel="alternate" hreflang="es" href="{es_url}"><link rel="alternate" hreflang="en" href="{en_url}">'
            f'<link rel="alternate" hreflang="x-default" href="{es_url}">\n'
            f'<meta property="og:type" content="article"><meta property="og:site_name" content="Neuri"><meta property="og:locale" content="{x["locale"]}">\n'
            f'<meta property="og:title" content="{t["h1"]}"><meta property="og:description" content="{t["desc"]}"><meta property="og:url" content="{url}">\n'
            f'<meta property="og:image" content="{og}"><meta name="twitter:card" content="summary_large_image">'
            f'<meta name="twitter:image" content="{og}">\n'
            f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n'
            '<script src="/assets/analytics.js" defer></script>\n</head>\n<body>\n')
    content = (f'<!--contenido-->\n<!-- Fuentes de {p["them"]} revisadas el {ISO}: {", ".join(h for h, _ in p["fuentes"])} -->\n'
               f'<h1>{t["h1"]}</h1>\n<p class="lead">{t["lead"]}</p>\n'
               f'<section><div class="tabla" tabindex="0" role="region" aria-label="{x["aria"]}"><table>\n'
               f'<tr><th scope="col">{t["th"]}</th><th scope="col">{p["us"]}</th><th scope="col">{p["them"]}</th></tr>\n{rows}</table></div>\n'
               f'<p class="nota">{src}</p></section>\n'
               f'<section><h2>{t["h2a"]}</h2>\n<h3>{t["pick_us"][0]}</h3><p>{t["pick_us"][1]}</p>\n'
               f'<h3>{t["pick_them"][0]}</h3><p>{t["pick_them"][1]}</p></section>\n'
               f'<section><h2>{t["h2b"]}</h2><p>{t["cta"]}</p>'
               f'<p><a href="{t["cta_href"]}"><b>{t["cta_link"]} →</b></a></p><p><a href="{t["more_href"]}">{t["more"]}</a></p></section>\n<!--/contenido-->\n')
    f = R / path / "index.html"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(head + "<main>\n" + content + "</main>\n<footer></footer>\n</body>\n</html>\n", encoding="utf-8")
    bc.build(path, bc.PAGES[path])


if __name__ == "__main__":
    for p in PAGINAS:
        page(p, "es")
        page(p, "en")
