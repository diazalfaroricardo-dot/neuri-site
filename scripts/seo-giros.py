#!/usr/bin/env python3
"""seo-pseo-giros (23-nov-2026): primeras 5 páginas por giro, cada una con las preguntas que de verdad
llegan en ese giro y cómo las contesta la app (solo funciones que ya existen y están en su landing).
VISTA PREVIA en la rama seo/pseo-giros: no se publica sin el «sí» de Ricardo. Empezar con 5 y medir
antes de seguir (backlog seo-pseo-giros). Keywords: docs/seo/keywords-es-mx.md.

Uso: python3 scripts/seo-giros.py && python3 scripts/seo-geo.py && python3 scripts/csp-meta.py && python3 scripts/seo.py
"""
import html, importlib.util, json, pathlib, re

R = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("bc", R / "scripts/brand-chrome.py")
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)
ISO = "2026-11-23"
E = html.escape


def txt(h):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", h))).strip()


BOTS_PRECIO = ("<section><h2>Cuánto cuesta</h2><p>Básico US$49 al mes y Pro US$69 al mes, fijo: sin cobro por mensaje ni por contacto, "
               "mes a mes y sin contrato. {pro}</p><p><a href=\"/sigue-disponible/#precios\">Ver planes</a> · "
               "<a href=\"/sigue-disponible/vs-manychat/\">Comparar con ManyChat</a></p></section>\n")

G = []

G.append(dict(
 path="sigue-disponible/boutiques/", brand="bots", lang="es", alt="/en/still-available/",
 title="Bot de Instagram para boutiques: tallas, apartados y envíos",
 desc="Para boutiques que venden por Instagram: neuri.bots contesta «¿sigue disponible?», tallas, precio y envío desde tu hoja, y aparta la pieza. US$49 al mes.",
 h1="Bot de Instagram para boutiques y tiendas de ropa",
 lead="<b>Respuesta corta:</b> neuri.bots contesta los DMs de tu boutique con lo que pones en tu hoja: si la pieza sigue, qué tallas y colores hay, el precio, el envío y cómo pagar. Aparta la pieza a quien la pide y te pasa la plática cuando le preguntan algo que no sabe.",
 qs_t="Lo que te preguntan todo el día, y cómo lo contesta",
 qs=[("«¿Sigue disponible?»", "Revisa tu hoja y contesta si la pieza sigue. Si ya se vendió, lo dice."),
     ("«¿Qué tallas tienes?» / «¿La tienes en negro?»", "Contesta con lo que dice tu hoja de esa pieza, por ejemplo «Vestido negro, talla M». Si no lo pusiste, no lo inventa: te pasa la plática."),
     ("«¿Cuánto cuesta?»", "Manda el precio de tu hoja; antes de mandarlo lo revisa contra tu hoja."),
     ("«Apártamela»", "Aparta la pieza a quien la pide y te avisa."),
     ("«¿Haces envíos? ¿Cuánto cuesta?»", "Contesta con tus formas de entrega y costos de envío de tu alta."),
     ("Comentan «info» o «precio» en tu publicación", "Le manda tu link por DM a quien comenta.")],
 extra="<section><h2>Qué pones en tu hoja</h2><ul><li>Cada pieza con su precio; en el nombre puedes poner talla y color («Vestido negro, talla M»). Cuando la marcas vendida, deja de ofrecerla en unos minutos.</li><li>Tus 5 preguntas frecuentes, como cuántos días aguantas un apartado.</li><li>Tus envíos y entregas, y cómo te pagan.</li></ul><p>El alta toma 3 minutos. Antes de activarlo le escribes desde tu cuenta personal con un código de prueba.</p></section>\n",
 pro="Con Pro además agenda entregas en persona y les manda recordatorio.",
 faq=[("¿Sirve si vendo por mayoreo?", "Sí, si pones en tu hoja tu precio de mayoreo y a partir de cuántas piezas aplica: contesta con eso. Si te piden algo fuera de tu hoja, te pasa la plática."),
      ("¿Contesta en WhatsApp también?", "Sí. Instagram, Messenger y WhatsApp, con la misma hoja."),
      ("¿Y si le preguntan algo raro?", "Te pasa la conversación y le avisa al cliente que tú le contestas. Ves cada plática y lo pausas cuando quieras.")],
))

G.append(dict(
 path="sigue-disponible/celulares/", brand="bots", lang="es", alt="/en/still-available/",
 title="Bot de WhatsApp e Instagram para venta de celulares",
 desc="Para tiendas de celulares: neuri.bots contesta si el equipo sigue, precio, GB, color y garantía desde tu hoja, por Instagram, Messenger y WhatsApp.",
 h1="Bot para tiendas de celulares: contesta precio, GB y garantía",
 lead="<b>Respuesta corta:</b> si vendes celulares por DM, la mayoría de los mensajes piden lo mismo: si sigue, cuánto cuesta, de cuántos GB, si es original y si tiene garantía. neuri.bots lo contesta con los datos de cada equipo que pones en tu hoja, por Instagram, Messenger y WhatsApp.",
 qs_t="Lo que te preguntan, y cómo lo contesta",
 qs=[("«¿Sigue disponible el iPhone?»", "Revisa tu hoja y contesta si ese equipo sigue."),
     ("«¿De cuántos GB es? ¿Qué color?»", "Contesta con lo que dice tu hoja de ese equipo, por ejemplo «iPhone 13, 128 GB, azul»."),
     ("«¿Es original? ¿Está liberado?» / «¿Cuánto de batería?»", "Si lo pusiste en tu hoja o en tus preguntas frecuentes (estado, liberado, salud de batería), contesta con eso. Si no, no lo inventa: te pasa la plática."),
     ("«¿Tiene garantía?»", "Contesta con tu garantía si la pusiste en tus preguntas frecuentes."),
     ("«¿Aceptas mi equipo a cuenta?»", "Si lo pusiste en tu alta, contesta con tus condiciones; si no, te pasa la plática para que tú lo valores."),
     ("«Apártamelo»", "Aparta el equipo a quien lo pide y te avisa.")],
 extra="<section><h2>Qué pones en tu hoja</h2><ul><li>Cada equipo con su precio; en el nombre, capacidad, color y estado («iPhone 13, 128 GB, azul, batería 88 %»).</li><li>Tus 5 preguntas frecuentes: garantía, si aceptas equipos a cuenta, cómo te pagan.</li><li>Accesorios con su precio.</li></ul><p>Antes de mandar un precio lo revisa contra tu hoja: no ofrece un precio que no pusiste.</p></section>\n",
 pro="Con Pro además agenda la entrega o la visita a tu local y manda recordatorio.",
 faq=[("¿Puede revisar si un equipo es robado o tiene reporte?", "No. Contesta solo con lo que pones en tu hoja; la revisión del IMEI la haces tú."),
      ("¿Manda fotos del equipo?", "Contesta con texto y con tu link. Para fotos específicas, te pasa la plática."),
      ("¿Puedo pausarlo cuando entra mercancía nueva?", "Sí. Lo pausas desde Mi asistente cuando quieras y actualizas tu hoja.")],
))

G.append(dict(
 path="sigue-disponible/salones/", brand="bots", lang="es", alt="/en/still-available/",
 title="Bot para salones de belleza: agenda citas por Instagram y WhatsApp",
 desc="Para salones, uñas y barberías: neuri.bots ofrece tus horarios libres, agenda la cita, la recuerda y maneja cambios por Instagram, Messenger y WhatsApp.",
 h1="Bot para salones de belleza: contesta y agenda tus citas",
 lead="<b>Respuesta corta:</b> en un salón casi todos los mensajes son «¿cuánto cuesta?» y «¿tienes lugar el sábado?». neuri.bots contesta el precio de cada servicio, ofrece 3 horarios libres de tu agenda, aparta el que elijan y le recuerda la cita a tu clienta. Tú sigues trabajando.",
 qs_t="Lo que te preguntan, y cómo lo contesta",
 qs=[("«¿Cuánto cuesta el gelish / el corte / el lifting?»", "Contesta con el precio y la duración de cada servicio de tu lista."),
     ("«¿Tienes lugar el sábado?»", "Ofrece 3 horarios libres de tu agenda y aparta el que elijan. No ofrece uno que ya tenga cita."),
     ("«¿Me lo puedes cambiar para el lunes?»", "Cambia o cancela la cita por chat. Si el día está lleno, la anota en lista de espera y le ofrece el lugar que se libere."),
     ("«¿Pides anticipo?»", "Si quieres, pide anticipo con tu propio link de pago. El dinero va directo a ti y tú marcas cuando llegó."),
     ("«¿Dónde están?» / «¿A qué hora abren?»", "Contesta con tu dirección y tu horario por día, incluido tu descanso."),
     ("Recordatorio", "Le recuerda la cita un día antes y el mismo día, por el mismo chat, dentro de las 24 h que Meta permite después del último mensaje de tu clienta.")],
 extra="<section><h2>Qué pones</h2><ul><li>Cada servicio con su duración y precio.</li><li>Tu horario por día y tu descanso de mediodía.</li><li>Si pides anticipo, tu link de pago.</li></ul><p>Te avisamos por correo de cada cita nueva, cambiada o cancelada, y tú también apuntas citas a mano en Mi asistente.</p></section>\n",
 pro="Para agendar y mandar recordatorios necesitas Pro.",
 faq=[("¿Funciona si somos varias en el salón?", "Contesta con los servicios, horarios y precios que pongas en tu alta. Si cada una lleva su agenda aparte, escríbenos a hola@neuri.tech antes de darte de alta."),
      ("¿Y si una clienta pregunta algo que no está?", "Te pasa la conversación y le avisa que tú le contestas."),
      ("¿Tiene más ejemplos de negocios con cita?", "Sí: uñas, pestañas, barbería y spa en la página de citas.")],
 more='<p><a href="/sigue-disponible/citas/">Ver neuri.bots para citas</a></p>',
))

BAZAR_PRICE = ("<section><h2>What it costs</h2><p>US$79 a month for up to 30 dealers, US$119 up to 75, US$149 unlimited. Flat price, 0% commission on your sales, "
               "month to month, 14-day free trial with no card. We load your booths and inventory for you.</p>"
               "<p><a href=\"/en/bazar/#precios\">See plans</a> · <a href=\"/en/bazar/vs-ricochet/\">vs Ricochet</a> · <a href=\"/en/bazar/vs-quail/\">vs Quail</a></p></section>\n")

G.append(dict(
 path="en/bazar/antique-mall/", brand="bazar", lang="en", alt="/bazar/",
 title="Antique mall software: booth rent, dealer payouts and POS",
 desc="Software for antique malls: one register for every dealer, booth rent taken out automatically, Monday statements and payout file, English and Spanish. From $79/mo.",
 h1="Antique mall software that pays your dealers by itself",
 lead="<b>Short answer:</b> an antique mall needs a register that knows whose item it is, rent that comes out of each dealer's balance, and statements dealers can read. neuri.bazar does that from US$79 a month with 0% commission, in English and Spanish.",
 qs_t="What antique mall owners ask, and how it works",
 qs=[("“How do I know which dealer an item belongs to?”", "Every item gets a barcode tag with its booth and price. Scan it and the sale lands in that dealer's balance."),
     ("“How do I collect booth rent?”", "Each booth has a fixed rent, weekly or monthly. It comes out of the dealer's balance automatically; if sales don't cover it, the difference carries over to the next payout."),
     ("“How do I pay 40 dealers without a spreadsheet?”", "Statements go out by email and the bank payout file (CSV) is ready to upload on Monday. Mark them paid and you're done."),
     ("“My dealers keep asking if their stuff sold.”", "Each dealer gets My Booth on their phone, no app to download: their sales live, their balance and their statement, with email alerts."),
     ("“Can dealers add their own items?”", "Yes, photo and price from their phone. You approve them before they go on sale."),
     ("“How do I fill an empty booth?”", "Pick the booth, pick someone from your waitlist and set the rent. They sign the agreement on their phone.")],
 extra="<section><h2>Moving from another system</h2><p>Import from Ricochet, Liberty or any Excel or CSV file, or send it to us and we load it. Sales tax is set once and added to every ticket. Roles for owner, manager, cashier and staff.</p></section>\n",
 pro="",
 faq=[("Do my dealers need to download an app?", "No. They get email alerts and check My Booth from their phone's browser."),
      ("Do you take a cut of sales?", "No. One flat monthly price, 0% commission."),
      ("Is it in Spanish too?", "Yes. The whole system and every dealer's My Booth work in English and Spanish.")],
))

G.append(dict(
 path="en/bazar/flea-market/", brand="bazar", lang="en", alt="/bazar/",
 title="Flea market software: vendor rent, register and payouts",
 desc="For flea markets and swap meets with a central register: rent from each vendor's balance, statements and payouts, in English and Spanish. From $79/mo.",
 h1="Flea market software for markets that sell for their vendors",
 lead="<b>Short answer:</b> if your flea market rings up sales for its vendors at a central register, neuri.bazar tracks whose item sold, takes each vendor's rent out of their balance and prepares the payouts, in English and Spanish, from US$79 a month. If every vendor charges at their own table, you don't need it.",
 qs_t="What flea market owners ask, and how it works",
 qs=[("“Vendors speak Spanish. Can they use it?”", "Yes. The register and every vendor's My Booth work in English and Spanish."),
     ("“Can I charge rent per day?”", "Rent is weekly or monthly today. If you charge per market day, tell us at hola@neuri.tech before you sign up."),
     ("“Do vendors need a laptop?”", "No. They see their sales and balance in My Booth from their phone's browser, and can add items with a photo and price."),
     ("“Can I run the register from a phone?”", "Yes. Checkout with a scanner on a phone, a tablet or a computer; up to 3 registers on Pro."),
     ("“What if a vendor sells less than the rent?”", "The difference carries over to their next payout, so nobody has to chase cash."),
     ("“Do you take a percentage?”", "No. One flat monthly price, 0% commission.")],
 extra="<section><h2>When it fits, and when it doesn't</h2><p>It fits markets and swap meets with a central checkout, like indoor flea markets and vendor malls. Markets where each vendor collects at their own table only need booth rent, and neuri.bazar would be more than they need.</p></section>\n",
 pro="",
 faq=[("Is there a free trial?", "Yes, 14 days with no credit card."),
      ("Can you load my vendors for me?", "Yes. Send us your list or spreadsheet and we load your booths and inventory."),
      ("Is there a Spanish page?", "Yes, neuri.bazar in Spanish is at neuri.tech/bazar/.")],
))


def build(p):
    lang, url = p["lang"], "https://neuri.tech/" + p["path"]
    og = f'https://neuri.tech/assets/og/{bc.OG[(p["brand"], lang)]}.png'
    locale = "es_US" if lang == "es" else "en_US"
    app = "neuri.bots" if p["brand"] == "bots" else "neuri.bazar"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "name": p["h1"], "description": p["desc"], "url": url, "inLanguage": lang,
         "datePublished": ISO, "dateModified": ISO, "publisher": {"@id": "https://neuri.tech/#org"},
         "about": {"@type": "SoftwareApplication", "name": app, "applicationCategory": "BusinessApplication"}},
        {"@type": "FAQPage", "inLanguage": lang, "mainEntity": [
            {"@type": "Question", "name": txt(q), "acceptedAnswer": {"@type": "Answer", "text": txt(a)}} for q, a in p["faq"]]}]}
    head = (f'<!doctype html>\n<html lang="{lang}" data-brand="{p["brand"]}">\n<head>\n'
            f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{E(p["title"])}</title>'
            f'<meta name="description" content="{E(p["desc"])}">\n<link rel="canonical" href="{url}">\n'
            f'<link rel="alternate" hreflang="{lang}-US" href="{url}">\n'
            f'<meta property="og:type" content="website"><meta property="og:site_name" content="Neuri"><meta property="og:locale" content="{locale}">\n'
            f'<meta property="og:title" content="{E(p["h1"])}"><meta property="og:description" content="{E(p["desc"])}"><meta property="og:url" content="{url}">\n'
            f'<meta property="og:image" content="{og}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{og}">\n'
            f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n'
            '<script src="/assets/analytics.js" defer></script>\n</head>\n<body>\n')
    qs = "".join(f"<h3>{q}</h3><p>{a}</p>\n" for q, a in p["qs"])
    faq_t = "Preguntas frecuentes" if lang == "es" else "Common questions"
    faq = "".join(f"<details><summary>{q}</summary><p>{a}</p></details>\n" for q, a in p["faq"])
    if p["brand"] == "bots":
        precio = BOTS_PRECIO.format(pro=p["pro"])
        cta = '<section><h2>Pruébalo con tu negocio</h2><p>7 días de prueba gratis, sin tarjeta, para los primeros 10 negocios.</p><p><a href="/sigue-disponible/#alta"><b>Quiero mi asistente →</b></a></p>' + p.get("more", "") + "</section>\n"
    else:
        precio = BAZAR_PRICE
        cta = '<section><h2>Try it with your own booths</h2><p>14 days free, no card.</p><p><a href="/en/bazar/#prueba"><b>Start free trial →</b></a></p><p><a href="/en/bazar/tour/">See the tour with real screens</a></p></section>\n'
    content = (f"<!--contenido-->\n<h1>{p['h1']}</h1>\n<p class=\"lead\">{p['lead']}</p>\n"
               f"<section><h2>{p['qs_t']}</h2>\n{qs}</section>\n{p['extra']}{precio}"
               f'<section id="preguntas"><h2>{faq_t}</h2>\n<div class="faq">\n{faq}</div></section>\n{cta}<!--/contenido-->\n')
    f = R / p["path"] / "index.html"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(head + "<main>\n" + content + "</main>\n<footer></footer>\n</body>\n</html>\n", encoding="utf-8")
    bc.build(p["path"], (p["brand"], lang, p["alt"], "doc"))


if __name__ == "__main__":
    for p in G:
        build(p)
