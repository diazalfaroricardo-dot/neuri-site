#!/usr/bin/env python3
"""seo-contenido-p1 (23-nov-2026): 4 páginas de contenido prioridad 1, en el template de las «vs»
(scripts/vs-paginas.py + brand-chrome.py). VISTA PREVIA: viven en la rama seo/contenido-p1 y NO se
publican sin el «sí» de Ricardo (items/backlog «Publicar: …»).

Reglas: cada dato de un competidor sale de su sitio público (o de la fuente que se nombra) en la fecha
que se dice; sin reseñas, sin testimonios, sin cifras inventadas; marca en minúsculas; Neuri se
presenta como Neuri (neuri.tech) y dice que hace uno de los productos de la lista.

Uso: python3 scripts/seo-contenido-p1.py && python3 scripts/seo-geo.py && python3 scripts/csp-meta.py
     && python3 scripts/seo.py
"""
import html, importlib.util, json, pathlib

R = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("bc", R / "scripts/brand-chrome.py")
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)
ISO = "2026-11-23"
FECHA = {"es": "23 de noviembre de 2026", "en": "November 23, 2026"}
ORG = {"@id": "https://neuri.tech/#org"}

# ---------------------------------------------------------------------------------------------
# Datos de competidores y fuentes (revisadas en la fecha indicada en cada una).
#  SendPulse  sendpulse.com/latam/prices/messengers (23-nov-2026), sendpulse.com/pricing/messengers
#             (23-nov-2026), sendpulse.com/solutions/instagram-automation (23-nov-2026)
#  ManyChat   manychat.com/pricing y manychat.com/es (14-nov-2026, mismos datos que /sigue-disponible/vs-manychat/)
#  respond.io respond.io/pricing (23-nov-2026)
#  Kommo      kommo.com/pricing (23-nov-2026)
#  Predis.ai  predis.ai/pricing (23-nov-2026)
#  Metricool  metricool.com/en/pricing (23-nov-2026)
#  Canva      canva.com/pricing no se dejó leer el 23-nov-2026 → cifra de piktochart.com (mediados de 2026)
#  GalilAI    App Store, apps.apple.com/app/id6569255178 (23-nov-2026)
#  SimpleConsign simpleconsign.com/pricing, simpleconsign.com/99 y help.simpleconsign.com (23-nov-2026)
# ---------------------------------------------------------------------------------------------

E = html.escape


def tabla(th, rows, aria):
    head = "".join(f'<th scope="col">{c}</th>' for c in th)
    body = "".join("<tr>" + f'<th scope="row">{r[0]}</th>' + "".join(f"<td>{c}</td>" for c in r[1:]) + "</tr>" for r in rows)
    return (f'<div class="tabla" tabindex="0" role="region" aria-label="{aria}"><table>\n'
            f"<tr>{head}</tr>\n{body}</table></div>\n")


def faq_html(titulo, qs):
    items = "".join(f"<details><summary>{q}</summary><p>{a}</p></details>\n" for q, a in qs)
    return f'<section id="preguntas"><h2>{titulo}</h2>\n<div class="faq">\n{items}</div></section>\n'


def faq_ld(qs, lang):
    import re
    txt = lambda h: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", h))).strip()
    return {"@type": "FAQPage", "inLanguage": lang,
            "mainEntity": [{"@type": "Question", "name": txt(q), "acceptedAnswer": {"@type": "Answer", "text": txt(a)}} for q, a in qs]}


def fuentes_html(titulo, fs):
    li = "".join(f'<li><a href="{h}" rel="nofollow">{n}</a> — {d}</li>' for h, n, d in fs)
    return f'<section><h2>{titulo}</h2><ul class="nota">{li}</ul></section>\n'


PAGINAS = []

# 1 ── bots: Mejores bots de Instagram para tiendas 2026 ─────────────────────────────────────────
Q1 = [
 ("¿Cuál es el mejor bot de Instagram para una tienda pequeña?",
  "Depende de cómo vendes. Si casi todo es «¿sigue disponible?», precio y apartados, neuri.bots contesta desde tu hoja con un precio fijo de US$49 al mes. Si quieres armar tus propios flujos y usar muchos canales, ManyChat o SendPulse. Si vendes con un equipo y un embudo de ventas, Kommo o respond.io."),
 ("¿Hay bots de Instagram gratis?",
  "Sí, con límites. ManyChat tiene plan gratis hasta 25 contactos y SendPulse hasta 500 suscriptores y 10,000 mensajes al mes (datos de sus sitios). neuri.bots no tiene plan gratis; da 7 días de prueba sin tarjeta a los primeros 10 negocios."),
 ("¿Me pueden bloquear la cuenta por usar un bot?",
  "neuri.bots usa la API oficial de Meta y ManyChat dice ser Official Meta Business Partner. Lo que pone en riesgo una cuenta son las apps que piden tu contraseña o automatizan con trucos fuera de la API oficial."),
 ("¿Por qué el precio de algunos bots sube cada mes?",
  "Porque cobran por contactos o suscriptores: ManyChat y SendPulse suben de plan conforme crece tu lista, y respond.io cobra por contactos activos al mes. neuri.bots cobra un precio fijo, sin contar contactos ni mensajes."),
 ("¿Contestan en español?",
  "Sí. ManyChat y SendPulse tienen sitio en español; neuri.bots está hecho en español para México y el público hispano de EE. UU., y también contesta en inglés."),
]
PAGINAS.append(dict(
 path="sigue-disponible/mejores-bots-instagram/", brand="bots", lang="es", alt="/en/still-available/",
 title="Mejores bots de Instagram para tiendas (2026)",
 desc="Comparamos 5 bots de Instagram para tiendas: neuri.bots, ManyChat, SendPulse, respond.io y Kommo. Precios reales con fecha, cómo cobran y para quién conviene cada uno.",
 h1="Mejores bots de Instagram para tiendas en 2026",
 lead=("<b>Respuesta corta:</b> para una tienda que vende por DM, el bot que conviene depende de cómo cobra y de quién lo arma. "
       "<b>neuri.bots</b> (US$49 al mes, fijo) contesta «¿sigue disponible?», precio y apartados desde tu hoja. "
       "<b>ManyChat</b> y <b>SendPulse</b> tienen plan gratis y editor de flujos, y su precio sube con tus contactos. "
       "<b>respond.io</b> y <b>Kommo</b> están pensados para equipos de ventas con bandeja compartida."),
 aviso="Esta guía la hace Neuri (neuri.tech), que hace neuri.bots. Por eso ponemos cada precio con su fecha y su fuente, y decimos cuándo conviene otro.",
 cuerpo=lambda: (
  "<section><h2>Comparación rápida</h2>\n" + tabla(
   ["Bot", "Precio al mes (desde)", "Cómo cobra", "Plan gratis", "Para quién"],
   [("neuri.bots", "US$49 · 69", "Precio fijo, sin cobro por contacto ni por mensaje", "No; 7 días de prueba sin tarjeta (primeros 10 negocios)", "Tiendas que contestan lo mismo todo el día: si sigue, precio, entrega, apartados"),
    ("ManyChat", "US$17 · 39 · 99 · 199", "Por contactos activos (de 25 a 25,000 por plan)", "Sí, hasta 25 contactos", "Quien quiere armar sus propios flujos y usar muchos canales"),
    ("SendPulse", "US$7.20 (Standard) · US$15 (Pro), pagando el año", "Sube con tus suscriptores", "Sí, hasta 500 suscriptores y 10,000 mensajes", "Quien ya usa SendPulse para correo o quiere un plan gratis amplio"),
    ("respond.io", "US$79 · 159 · 279", "Plan + contactos activos al mes", "No; 7 días de prueba", "Equipos con varios agentes y WhatsApp como canal principal"),
    ("Kommo", "US$25 · 35 · 45 por usuario", "Por usuario, mínimo 6 meses", "No; 14 días de prueba sin tarjeta", "Ventas con embudo y CRM, varios vendedores")],
   "Tabla — desliza para ver todas las columnas") +
  f'<p class="nota">Precios en dólares, revisados en el sitio de cada uno (ManyChat el 14 de noviembre de 2026; los demás el {FECHA["es"]}). Pueden cambiar; ver fuentes abajo.</p></section>\n'
  "<section><h2>1. neuri.bots — precio fijo y contesta desde tu hoja</h2>\n"
  "<p><b>Conviene si</b> vendes piezas o servicios por Instagram, Messenger o WhatsApp y la mayoría de los mensajes son las mismas preguntas.</p>\n"
  "<ul><li>Contesta «¿sigue disponible?», precio, entrega y pagos con la información de tu hoja, y revisa cada precio contra tu hoja antes de mandarlo.</li>"
  "<li>Aparta piezas y manda tu link a quien comenta.</li><li>Si no sabe algo, te pasa la conversación y le avisa al cliente que tú le contestas.</li>"
  "<li>Básico US$49 y Pro US$69 al mes; sin cobro por contacto ni por mensaje; mes a mes, sin contrato.</li></ul>\n"
  "<p><b>Ojo:</b> no es un editor de flujos: no armas embudos a tu gusto. Es una IA y se puede equivocar, por eso ves cada plática y lo pausas cuando quieras.</p>\n"
  '<p><a href="/sigue-disponible/">Ver neuri.bots</a></p></section>\n'
  "<section><h2>2. ManyChat — el editor de flujos más conocido</h2>\n"
  "<p><b>Conviene si</b> quieres armar tus propias automatizaciones con plantillas y usar varios canales.</p>\n"
  "<ul><li>Plan gratis hasta 25 contactos; planes de pago de US$17 · 39 · 99 · 199 al mes (menos si pagas el año). Dice que el precio final depende del país de facturación.</li>"
  "<li>Cada plan trae un tope de contactos activos; arriba del tope cobra por contacto extra.</li>"
  "<li>Instagram, Messenger, WhatsApp, TikTok, Telegram, SMS y correo. Su IA (Manychat AI) viene desde el plan Pro.</li></ul>\n"
  '<p><a href="/sigue-disponible/vs-manychat/">neuri.bots vs ManyChat, punto por punto</a></p></section>\n'
  "<section><h2>3. SendPulse — plan gratis amplio y muchas herramientas</h2>\n"
  "<p><b>Conviene si</b> quieres empezar gratis con hasta 500 suscriptores o ya usas SendPulse para correo.</p>\n"
  "<ul><li>Plan gratis: 3 chatbots, hasta 500 suscriptores y 10,000 mensajes al mes.</li>"
  "<li>Standard desde US$7.20 y Pro desde US$15 al mes pagando el año (su sitio en español); el precio sube con los suscriptores.</li>"
  "<li>Contesta DMs, comentarios, menciones en historias y chats en vivo; editor sin código, plantillas y agentes de IA (Pro incluye 1 millón de créditos de IA al mes).</li></ul>\n"
  '<p><a href="/sigue-disponible/vs-sendpulse/">neuri.bots vs SendPulse, punto por punto</a></p></section>\n'
  "<section><h2>4. respond.io — bandeja para equipos</h2>\n"
  "<p><b>Conviene si</b> tienes varias personas contestando y WhatsApp pesa tanto como Instagram.</p>\n"
  "<ul><li>Starter US$79, Growth US$159 y Advanced US$279 al mes; dice que pagas solo por los contactos con los que hablas.</li><li>7 días de prueba gratis.</li></ul></section>\n"
  "<section><h2>5. Kommo — CRM con chats</h2>\n"
  "<p><b>Conviene si</b> vendes con embudo, seguimiento y varios vendedores.</p>\n"
  "<ul><li>US$25 · 35 · 45 por usuario al mes, con mínimo de 6 meses (no hay pago mensual).</li>"
  "<li>Cuentas de Instagram: 1 en Base, 3 en Advanced, ilimitadas en Pro (más una por usuario agregado). 14 días de prueba sin tarjeta.</li></ul></section>\n"
  "<section><h2>Cómo elegir en 3 preguntas</h2><ol>"
  "<li><b>¿Cuántos mensajes repetidos recibes?</b> Si la mayoría es «¿sigue?» y precio, te sirve un bot que conteste desde tu catálogo.</li>"
  "<li><b>¿Quieres armar flujos o que ya conteste?</b> Editor de flujos: ManyChat o SendPulse. Que conteste desde tu hoja: neuri.bots.</li>"
  "<li><b>¿Tu precio puede subir?</b> Si tu lista crece rápido, compara el precio con 1,000 o 5,000 contactos, no solo el de entrada.</li></ol></section>\n"
 ),
 faq_t="Preguntas frecuentes", faq=Q1,
 fuentes_t="Fuentes",
 fuentes=[("https://manychat.com/pricing", "manychat.com/pricing", "14 de noviembre de 2026"),
          ("https://sendpulse.com/latam/prices/messengers", "sendpulse.com/latam/prices/messengers", FECHA["es"]),
          ("https://sendpulse.com/solutions/instagram-automation", "sendpulse.com/solutions/instagram-automation", FECHA["es"]),
          ("https://respond.io/pricing", "respond.io/pricing", FECHA["es"]),
          ("https://kommo.com/pricing", "kommo.com/pricing", FECHA["es"]),
          ("/sigue-disponible/#precios", "neuri.bots: precios", FECHA["es"])],
 about=["neuri.bots", "ManyChat", "SendPulse", "respond.io", "Kommo"],
))

# 2 ── bots: neuri.bots vs SendPulse ───────────────────────────────────────────────────────────────
Q2 = [
 ("¿SendPulse es gratis?",
  "Tiene plan gratis: 3 chatbots, hasta 500 suscriptores y 10,000 mensajes al mes. Arriba de eso pasas a Standard o Pro, que suben con tus suscriptores."),
 ("¿Cuánto cuesta neuri.bots?",
  "Básico US$49 y Pro US$69 al mes, fijo. No cobra por contacto ni por mensaje y se paga mes a mes, sin contrato."),
 ("¿Cuál contesta mejor «¿sigue disponible?»?",
  "neuri.bots está hecho para eso: lo contesta con lo que dice tu hoja y aparta la pieza. En SendPulse lo armas tú con su editor, plantillas o su agente de IA."),
 ("¿Puedo pasarme de SendPulse a neuri.bots?",
  "Sí. Solo necesitas tu cuenta de Instagram o tu página de Facebook y una hoja con tus piezas, precios, entregas y pagos. El alta toma 3 minutos."),
]
PAGINAS.append(dict(
 path="sigue-disponible/vs-sendpulse/", brand="bots", lang="es", alt="/en/still-available/",
 title="neuri.bots vs SendPulse: bot de Instagram para tiendas",
 desc="neuri.bots vs SendPulse para contestar los DMs de tu tienda: precio, cobro por suscriptores, cómo se arma, IA, canales y prueba gratis. Datos con fecha.",
 h1="neuri.bots vs SendPulse: ¿cuál conviene para los DMs de tu tienda?",
 lead=("<b>Respuesta corta:</b> elige <b>SendPulse</b> si quieres empezar gratis (hasta 500 suscriptores) y armar tus propios flujos; "
       "elige <b>neuri.bots</b> si quieres un precio fijo de US$49 al mes y que conteste «¿sigue disponible?», precio y apartados desde tu hoja, sin armar flujos."),
 aviso="Esta comparación la hace Neuri (neuri.tech), que hace neuri.bots. Los datos de SendPulse salen de su propio sitio.",
 cuerpo=lambda: (
  "<section>" + tabla(["Qué comparamos", "neuri.bots", "SendPulse"], [
   ("Precio al mes", "<b>US$49 · 69</b>", "Gratis hasta 500 suscriptores; Standard desde US$7.20 y Pro desde US$15 al mes pagando el año"),
   ("Cobro por suscriptores", "<b>No:</b> precio fijo, sin cobro por contacto ni por mensaje", "Sí: el precio de Standard y Pro sube con tus suscriptores"),
   ("Cómo se arma", "<b>Contesta desde tu hoja</b>: piezas, precios, entregas y pagos. El alta toma 3 minutos", "Editor sin código, plantillas y flujos generados con IA"),
   ("IA", "<b>Sí:</b> revisa cada precio contra tu hoja antes de mandarlo; si no sabe, te pasa la plática", "Agentes de IA: 3 en Standard, ilimitados en Pro (1 millón de créditos de IA al mes)"),
   ("Instagram", "<b>DMs, apartados y link a quien comenta</b>", "DMs, comentarios, menciones en historias y chats en vivo"),
   ("Otros canales", "<b>Messenger y WhatsApp</b>", "Su suscripción cubre todos sus canales de chatbot; también tiene correo y otras herramientas"),
   ("Español", "<b>Sí</b>", "Sí, sitio y precios en español"),
   ("Prueba", "<b>7 días sin tarjeta</b> (primeros 10 negocios)", "Plan gratis sin fecha de fin"),
  ], "Tabla — desliza para ver todas las columnas") +
  f'<p class="nota">Datos de SendPulse tomados de su propio sitio el {FECHA["es"]}: '
  '<a href="https://sendpulse.com/latam/prices/messengers" rel="nofollow">sendpulse.com/latam/prices/messengers</a>, '
  '<a href="https://sendpulse.com/solutions/instagram-automation" rel="nofollow">sendpulse.com/solutions/instagram-automation</a>. '
  "Ese día su página mostraba una promoción de Black Friday en planes anuales. Si cambian, actualizamos esta página.</p></section>\n"
  "<section><h2>¿Cuál elegir?</h2>\n<h3>Elige neuri.bots si…</h3><p>Vendes por Instagram, la mayoría de los mensajes son «¿sigue?», precio y entrega, y quieres un precio que no suba aunque te escriban más compradores.</p>\n"
  "<h3>Elige SendPulse si…</h3><p>Tienes pocos suscriptores y quieres empezar gratis, prefieres armar tus flujos a tu gusto, o ya usas SendPulse para correo.</p></section>\n"
  "<section><h2>Cuánto pagas cuando creces</h2><p>neuri.bots cuesta lo mismo con 100 o con 5,000 compradores al mes. En SendPulse, Standard y Pro suben con tus suscriptores: antes de elegir, revisa en su calculadora el precio con el número de suscriptores que esperas tener en un año.</p></section>\n"
  '<section><h2>Prueba neuri.bots</h2><p>Date de alta en 3 minutos con tu hoja.</p><p><a href="/sigue-disponible/#alta"><b>Quiero mi asistente →</b></a></p>'
  '<p><a href="/sigue-disponible/mejores-bots-instagram/">Ver los 5 mejores bots de Instagram para tiendas</a></p></section>\n'
 ),
 faq_t="Preguntas frecuentes", faq=Q2,
 fuentes_t=None, fuentes=[],
 about=["neuri.bots", "SendPulse"],
))

# 3 ── marketing: Mejores apps de IA para crear posts ─────────────────────────────────────────────
Q3 = [
 ("¿Cuál es la mejor app de IA para hacer posts de Instagram de mi negocio?",
  "Si quieres generar tú cada pieza con IA, Predis.ai o Canva. Si ya tienes los posts y solo quieres programarlos y medirlos, Metricool. Si quieres que te llegue el mes armado y solo aprobar, eso hace neuri.marketing, que todavía no abre cuentas nuevas."),
 ("¿Hay alguna gratis?",
  "Metricool tiene plan gratis (1 marca, hasta 20 publicaciones programadas al mes) y Canva tiene versión gratis. Predis.ai no tiene plan gratis: da 3 días de prueba."),
 ("¿La IA inventa precios o productos?",
  "Puede pasar con cualquier IA. neuri.marketing tiene un freno que no deja pasar precios, cifras ni productos inventados y nada sale sin tu visto bueno. En las demás, revisa cada texto antes de publicar."),
 ("¿Publican solas en Instagram?",
  "Metricool programa y publica. Predis.ai publica solo desde Rise (Core dice «No Auto Posting»). neuri.marketing publica lo que apruebas, con el inicio de sesión oficial de Meta, cuando abra."),
]
PAGINAS.append(dict(
 path="marketing/mejores-apps-ia-posts/", brand="marketing", lang="es", alt="/en/marketing/",
 title="Mejores apps de IA para crear posts de tu negocio (2026)",
 desc="Predis.ai, Canva, Metricool, GalilAI y neuri.marketing: qué hace cada app de IA para posts de Instagram, cuánto cuesta (con fecha y fuente) y para quién conviene.",
 h1="Mejores apps de IA para crear posts de Instagram de tu negocio",
 lead=("<b>Respuesta corta:</b> <b>Predis.ai</b> y <b>Canva</b> te ayudan a generar cada post con IA; <b>Metricool</b> programa y mide lo que ya tienes; "
       "<b>GalilAI</b> es una app de celular para reels y posts; <b>neuri.marketing</b> arma el mes completo con tu estilo y tú solo apruebas (todavía no abre cuentas nuevas)."),
 aviso="Esta guía la hace Neuri (neuri.tech), que hace neuri.marketing. Cada precio va con su fecha y su fuente.",
 cuerpo=lambda: (
  "<section><h2>Comparación rápida</h2>\n" + tabla(
   ["App", "Qué hace", "Precio al mes", "Plan gratis"],
   [("neuri.marketing", "Arma los posts y reels del mes con tu estilo; tú apruebas desde el celular", "US$49 · 99 · 169", "No. Todavía no abre cuentas nuevas"),
    ("Predis.ai", "Generas posts, videos y anuncios con créditos", "US$32 · 79 · 249 mes a mes, o US$19 · 40 · 212 pagando el año", "No; 3 días de prueba"),
    ("Canva", "Diseño con plantillas y herramientas de IA", "Pro: US$18 al mes o US$180 al año (fuente: Piktochart)", "Sí, versión gratis"),
    ("Metricool", "Programa, publica y mide; asistente de IA con créditos", "Starter desde US$25 (US$20 pagando el año); Advanced desde US$67 (US$53)", "Sí: 1 marca, 20 publicaciones programadas al mes"),
    ("GalilAI", "App de celular que genera reels, carruseles y posts", "Compras dentro de la app; la más cara listada: US$29.99", "Su ficha no lo dice")],
   "Tabla — desliza para ver todas las columnas") +
  f'<p class="nota">Precios en dólares revisados el {FECHA["es"]}. Canva no dejó leer su página de precios ese día: usamos la cifra que publica Piktochart (mediados de 2026). Ver fuentes abajo.</p></section>\n'
  "<section><h2>1. neuri.marketing — el mes armado, tú apruebas</h2>\n"
  "<p><b>Conviene si</b> no tienes tiempo de crear y prefieres revisar y aprobar.</p>\n"
  "<ul><li>Inicio US$49, Crece US$99 y Pro US$169 al mes; o pagas el año y te regalan 2 meses.</li>"
  "<li>Nada se publica sin tu visto bueno. Un freno no deja pasar precios, cifras ni productos inventados.</li>"
  "<li>Publica en Instagram y Facebook con el inicio de sesión oficial de Meta.</li></ul>\n"
  "<p><b>Ojo:</b> todavía no abre cuentas nuevas; abre cuando se pueda conectar Instagram y Facebook con el inicio de sesión oficial de Meta.</p>\n"
  '<p><a href="/marketing/">Ver neuri.marketing</a></p></section>\n'
  "<section><h2>2. Predis.ai — generas con créditos</h2>\n"
  "<p><b>Conviene si</b> quieres generar tú mismo posts, videos y anuncios, o manejas varias marcas.</p>\n"
  "<ul><li>Core US$32, Rise US$79 y Enterprise+ US$249 mes a mes; US$19, US$40 y US$212 al mes pagando el año.</li>"
  "<li>Créditos: 1,300 · 3,200 · 10,000 al mes. Publicación automática desde Rise.</li></ul>\n"
  '<p><a href="/marketing/vs-predis/">neuri.marketing vs Predis.ai, punto por punto</a></p></section>\n'
  "<section><h2>3. Canva — diseño con IA</h2>\n"
  "<p><b>Conviene si</b> te gusta diseñar y quieres plantillas y herramientas de IA en un solo lugar.</p>\n"
  "<ul><li>Versión gratis. Pro: US$18 al mes o US$180 al año para una persona, según Piktochart (mediados de 2026).</li><li>Tú armas cada pieza; la IA te ayuda a editar y generar.</li></ul></section>\n"
  "<section><h2>4. Metricool — programar y medir</h2>\n"
  "<p><b>Conviene si</b> ya tienes el contenido y quieres programarlo y ver qué funciona.</p>\n"
  "<ul><li>Gratis para 1 marca y 20 publicaciones programadas al mes.</li>"
  "<li>Starter: US$25 al mes (US$20 pagando el año) hasta 5 marcas. Advanced: desde US$67 al mes (US$53 pagando el año). Precios sin IVA.</li>"
  "<li>Asistente de IA con créditos por marca: 5 en Free, 20 en Starter, 35 en Advanced.</li></ul></section>\n"
  "<section><h2>5. GalilAI — reels y posts desde el celular</h2>\n"
  "<p><b>Conviene si</b> quieres una app de celular para generar reels, carruseles y posts con IA.</p>\n"
  "<ul><li>Vendedor en el App Store: GALILAI INTELIGENCIA ARTIFICIAL LTDA. Ahí, compras dentro de la app; la más cara listada es «Max» a US$29.99.</li></ul></section>\n"
  "<section><h2>Cómo elegir</h2><ol>"
  "<li><b>¿Quién va a crear?</b> Tú: Canva o Predis.ai. Alguien más, y tú apruebas: neuri.marketing.</li>"
  "<li><b>¿Ya tienes contenido?</b> Solo programar y medir: Metricool.</li>"
  "<li><b>¿Cuántas marcas?</b> Varias: Predis.ai Rise o Metricool Advanced.</li></ol></section>\n"
 ),
 faq_t="Preguntas frecuentes", faq=Q3,
 fuentes_t="Fuentes",
 fuentes=[("https://predis.ai/pricing", "predis.ai/pricing", FECHA["es"]),
          ("https://metricool.com/en/pricing/", "metricool.com/pricing", FECHA["es"]),
          ("https://piktochart.com/blog/canva-pricing-2026-costs-raised/", "Piktochart: precios de Canva 2026", "mediados de 2026, leído el " + FECHA["es"]),
          ("https://apps.apple.com/app/id6569255178", "GalilAI en el App Store", FECHA["es"]),
          ("/marketing/#precios", "neuri.marketing: precios", FECHA["es"])],
 about=["neuri.marketing", "Predis.ai", "Canva", "Metricool", "GalilAI"],
))

# 4 ── bazar (EN): neuri.bazar vs SimpleConsign ────────────────────────────────────────────────────
Q4 = [
 ("How much does SimpleConsign Vendor Mall Plus cost?",
  "US$379 a month. New customers may get US$199 a month for six months or until the store reaches US$50,000 in tracked sales, whichever comes first. Then it moves to the standard price."),
 ("How much does neuri.bazar cost?",
  "US$79, US$119 or US$149 a month for 30, 75 or unlimited vendors. Flat monthly price, no commission per sale, 14-day free trial with no card."),
 ("Does either one take a cut of sales?",
  "neuri.bazar charges a flat monthly price and no commission per sale. SimpleConsign's pricing page lists flat monthly plans; card processing goes through its integrated payments."),
 ("Can my vendors check their sales?",
  "Yes, in both. neuri.bazar vendors use My Booth from their phone's browser, in English or Spanish. SimpleConsign lists a vendor real-time portal and vendor remote entry on Vendor Mall Plus."),
 ("Can I move my data from SimpleConsign?",
  "Yes. neuri.bazar imports any Excel or CSV export, or you send it to us and we load it for you."),
]
PAGINAS.append(dict(
 path="en/bazar/vs-simpleconsign/", brand="bazar", lang="en", alt="/bazar/",
 title="neuri.bazar vs SimpleConsign: vendor mall software compared",
 desc="neuri.bazar vs SimpleConsign Vendor Mall Plus for antique and vendor malls: price, intro offer, booth rent, vendor portal, Spanish and free trial, with dated sources.",
 h1="neuri.bazar vs SimpleConsign (Vendor Mall Plus): which fits your vendor mall?",
 lead=("<b>Short answer:</b> choose <b>SimpleConsign Vendor Mall Plus</b> if you want a 3D floor map, managed onboarding and an all-in-one consignment suite, at US$379 a month after the intro price. "
       "Choose <b>neuri.bazar</b> if you want to pay US$79–149 a month, keep your own card terminal, and run the register and vendor portal in English and Spanish."),
 aviso="This comparison is written by Neuri (neuri.tech), the maker of neuri.bazar. SimpleConsign details come from its own site.",
 cuerpo=lambda: (
  "<section>" + tabla(["Feature", "neuri.bazar", "SimpleConsign Vendor Mall Plus"], [
   ("Monthly price", "<b>US$79 · 119 · 149</b>", "US$379; intro US$199 for 6 months or until US$50K in sales"),
   ("Vendors per plan", "<b>30 · 75 · unlimited</b>", "Unlimited consignors and inventory (all plans)"),
   ("Booth rent", "<b>Fixed weekly or monthly rent, taken out of the vendor's balance automatically</b>; any shortfall carries to the next payout", "Recurring fees weekly, biweekly, monthly or yearly; collect from balance, card, or balance first with card fallback"),
   ("Commission per sale", "<b>None</b>", "Not listed on its pricing page"),
   ("Card payments", "<b>Use your own terminal</b>", "Integrated payment processing"),
   ("Vendor portal", "<b>My Booth</b>, from the phone's browser", "Vendor remote entry and real-time portal"),
   ("Floor map", "No", "3D map built from your floor plan"),
   ("Online store", "<b>Plus plan:</b> your site with your inventory and online holds", "Shopify integration, listed on its Professional plan"),
   ("Spanish", "<b>Yes</b>, the whole system and vendor portal", "Not mentioned on its site"),
   ("Free trial", "<b>14 days, no card</b>", "Offers a free trial; length not stated"),
   ("Contract", "<b>Month to month</b>", "Month to month, cancel anytime"),
  ], "Table — swipe to see all columns") +
  f'<p class="nota">SimpleConsign details taken from its own site on {FECHA["en"]}: '
  '<a href="https://www.simpleconsign.com/pricing" rel="nofollow">simpleconsign.com/pricing</a>, '
  '<a href="https://www.simpleconsign.com/99" rel="nofollow">simpleconsign.com/99</a>, '
  '<a href="https://help.simpleconsign.com/hc/en-us/articles/47481370418573" rel="nofollow">Vendor Mall Plus overview</a>. If they change, we update this page.</p></section>\n'
  "<section><h2>Which one to choose?</h2>\n<h3>Choose neuri.bazar if…</h3><p>Your vendors or shoppers speak Spanish, you want a lower monthly price, or you want to keep your own card terminal.</p>\n"
  "<h3>Choose SimpleConsign if…</h3><p>You want a 3D floor map and managed onboarding, you also run classic consignment, or you need Shopify and QuickBooks integrations.</p></section>\n"
  "<section><h2>What the first year costs</h2><p>On list prices, neuri.bazar Pro is US$119 × 12 = US$1,428. SimpleConsign Vendor Mall Plus is US$199 × 6 + US$379 × 6 = US$3,468 if the intro price lasts the full six months, or US$4,548 at the standard price.</p></section>\n"
  '<section><h2>Try it with your own mall</h2><p>Set up your mall in neuri.bazar and try it free for 14 days, no card.</p><p><a href="/en/bazar/#prueba"><b>Start free trial →</b></a></p>'
  '<p><a href="/en/bazar/vs-ricochet/">See neuri.bazar vs Ricochet</a> · <a href="/en/bazar/vs-quail/">neuri.bazar vs Quail</a></p></section>\n'
 ),
 faq_t="Common questions", faq=Q4,
 fuentes_t=None, fuentes=[],
 about=["neuri.bazar", "SimpleConsign"],
))


def build(p):
    lang, url = p["lang"], "https://neuri.tech/" + p["path"]
    og = f'https://neuri.tech/assets/og/{bc.OG[(p["brand"], lang)]}.png'
    locale = "es_US" if lang == "es" else "en_US"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "name": p["h1"], "description": p["desc"], "url": url, "inLanguage": lang,
         "datePublished": ISO, "dateModified": ISO, "publisher": ORG,
         "about": [{"@type": "SoftwareApplication", "name": n, "applicationCategory": "BusinessApplication"} for n in p["about"]]},
        faq_ld(p["faq"], lang)]}
    head = (f'<!doctype html>\n<html lang="{lang}" data-brand="{p["brand"]}">\n<head>\n'
            f'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{p["title"]}</title>'
            f'<meta name="description" content="{E(p["desc"])}">\n<link rel="canonical" href="{url}">\n'
            f'<link rel="alternate" hreflang="{lang}-US" href="{url}">\n'
            f'<meta property="og:type" content="article"><meta property="og:site_name" content="Neuri"><meta property="og:locale" content="{locale}">\n'
            f'<meta property="og:title" content="{E(p["h1"])}"><meta property="og:description" content="{E(p["desc"])}"><meta property="og:url" content="{url}">\n'
            f'<meta property="og:image" content="{og}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{og}">\n'
            f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n'
            '<script src="/assets/analytics.js" defer></script>\n</head>\n<body>\n')
    content = (f"<!--contenido-->\n<h1>{p['h1']}</h1>\n<p class=\"lead\">{p['lead']}</p>\n<p class=\"nota\">{p['aviso']}</p>\n"
               + p["cuerpo"]() + faq_html(p["faq_t"], p["faq"])
               + (fuentes_html(p["fuentes_t"], p["fuentes"]) if p["fuentes"] else "") + "<!--/contenido-->\n")
    f = R / p["path"] / "index.html"
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(head + "<main>\n" + content + "</main>\n<footer></footer>\n</body>\n</html>\n", encoding="utf-8")
    bc.build(p["path"], (p["brand"], lang, p["alt"], "doc"))


if __name__ == "__main__":
    for p in PAGINAS:
        build(p)
