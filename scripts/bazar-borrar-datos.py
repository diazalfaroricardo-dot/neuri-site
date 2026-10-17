# L11 (bazar): genera /bazar/borrar-mis-datos/ y /en/bazar/delete-my-data/
# reutilizando el <head> y estilos del aviso de privacidad. Solo describe lo que la app ya hace.
# Uso: python3 scripts/bazar-borrar-datos.py
import pathlib, re
R = pathlib.Path(__file__).resolve().parent.parent

def head_from(src, title, desc, canon, es, en, lang):
    h = (R / src).read_text().split('</head>')[0] + '</head>'
    h = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', h, flags=re.S)
    h = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + desc, h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', r'\g<1>' + desc, h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', r'\g<1>' + title.split(' | ')[0], h)
    h = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>' + canon, h)
    h = re.sub(r'(<meta property="og:url" content=")[^"]*', r'\g<1>' + canon, h)
    h = re.sub(r'(hreflang="es" href=")[^"]*', r'\g<1>' + es, h)
    h = re.sub(r'(hreflang="en" href=")[^"]*', r'\g<1>' + en, h)
    assert canon in h and es in h and en in h, 'head substitution failed'
    return h

MAIL_ES = 'mailto:hola@neuri.tech?subject=Borrar%20mis%20datos%20%C2%B7%20neuri.bazar&amp;body=Nombre%3A%0AQui%C3%A9n%20soy%20(due%C3%B1o%2C%20staff%2C%20vendedor%20o%20cliente)%3A%0ABazar%3A%0AQu%C3%A9%20quiero%20borrar%3A%0A'
MAIL_EN = 'mailto:hola@neuri.tech?subject=Delete%20my%20data%20%C2%B7%20neuri.bazar&amp;body=Name%3A%0AWho%20I%20am%20(owner%2C%20staff%2C%20vendor%20or%20customer)%3A%0ABazaar%3A%0AWhat%20I%20want%20deleted%3A%0A'

ES = '''<body><div class="wrap">
<header><a class="logo" href="/bazar/">neuri<span>.bazar</span></a><nav><a href="/en/bazar/delete-my-data/" hreflang="en" lang="en">English</a></nav></header>
<div class="borrador" role="note"><strong>Borrador pendiente de revisión legal · Draft pending legal review</strong>Este texto todavía no lo revisa un abogado y puede cambiar. No es asesoría legal.</div>
<h1>Borrar mis datos</h1>
<p class="lead">Cómo pedir que borremos tus datos de neuri.bazar · Última actualización: 17 de octubre de 2026</p>
<p class="hermana">Ver también: <a href="/bazar/privacidad/#arco">Aviso de privacidad (derechos ARCO)</a> · <a href="/bazar/terminos/">Términos</a></p>
<section id="pedir"><h2>Pídelo por correo</h2>
<p>Escribe a <a href="MAIL">hola@neuri.tech</a> con el asunto «Borrar mis datos». Incluye tu nombre, quién eres (dueño, staff, vendedor o cliente), de qué bazar y qué quieres borrar. Podemos pedirte acreditar tu identidad antes de borrar.</p>
<ul><li><b>Plazo:</b> te respondemos en un máximo de <b>20 días hábiles</b> y, si procede, lo hacemos efectivo en los 15 días hábiles siguientes.</li>
<li>Pedirlo es gratis.</li></ul></section>
<section id="quien"><h2>Según quién eres</h2>
<ul><li><b>Dueño de un bazar:</b> puedes descargar todo desde Configuración → Tus datos y cerrar el bazar ahí mismo. Al cerrarlo queda bloqueado 30 días (se puede restaurar o descargar) y luego se borra de forma definitiva; los respaldos cifrados se eliminan solos en los 30 días siguientes.</li>
<li><b>Gerente, cajero o staff:</b> pide al dueño que te quite del bazar, o escríbenos.</li>
<li><b>Vendedor o cliente de un bazar:</b> el bazar es el responsable de tus datos y Neuri los trata por su cuenta. Pídeselo al bazar o escríbenos y se lo pasamos de inmediato.</li>
<li><b>Solicitante de puesto:</b> si no confirmaste tu correo, la solicitud se borra sola a los 7 días. La foto de tu identificación se borra sola después de que rechacen tu solicitud o termine tu renta (90 días o el plazo del bazar); puedes pedir que se borre antes.</li></ul></section>
<section id="queda"><h2>Lo que puede quedar</h2>
<p>Solo lo que la ley nos obligue a conservar (por ejemplo, registros de facturación de nuestro plan), por el plazo legal. Te lo diremos en la respuesta.</p></section>
<footer><span>© 2026 Neuri LLC · 5818 W Raymond St, Phoenix, AZ 85043</span><a href="/bazar/">neuri.bazar</a><a href="/bazar/privacidad/">Privacidad</a><a href="/bazar/terminos/">Términos</a><a href="/en/bazar/delete-my-data/" hreflang="en">English</a></footer>
</div></body></html>
'''.replace('MAIL', MAIL_ES)

EN = '''<body><div class="wrap">
<header><a class="logo" href="/en/">neuri<span>.bazar</span></a><nav><a href="/bazar/borrar-mis-datos/" hreflang="es" lang="es">Español</a></nav></header>
<div class="borrador" role="note"><strong>Draft pending legal review</strong>A lawyer has not reviewed this text yet and it may change. It is not legal advice.</div>
<h1>Delete my data</h1>
<p class="lead">How to ask us to delete your neuri.bazar data · Last updated: October 17, 2026</p>
<p class="hermana">See also: <a href="/en/bazar/privacy/">Privacy notice</a> · <a href="/en/bazar/terms/">Terms</a></p>
<section id="request"><h2>Ask by email</h2>
<p>Email <a href="MAIL">hola@neuri.tech</a> with the subject “Delete my data”. Include your name, who you are (owner, staff, vendor or customer), which bazaar, and what you want deleted. We may ask you to verify your identity before deleting.</p>
<ul><li><b>Timing:</b> we reply within <b>20 business days</b> and, if it applies, carry it out within the following 15 business days.</li>
<li>Asking is free.</li></ul></section>
<section id="who"><h2>Depending on who you are</h2>
<ul><li><b>Bazaar owner:</b> you can download everything from Settings → Your data and close the bazaar right there. Once closed it stays locked for 30 days (you can restore or download it) and is then permanently deleted; encrypted backups expire on their own within the next 30 days.</li>
<li><b>Manager, cashier or staff:</b> ask the owner to remove you from the bazaar, or email us.</li>
<li><b>Vendor or customer of a bazaar:</b> the bazaar is responsible for your data and Neuri processes it on its behalf. Ask the bazaar, or email us and we pass it on right away.</li>
<li><b>Booth applicant:</b> if you never confirmed your email, the application is deleted automatically after 7 days. Your ID photo is deleted automatically after your application is declined or your rental ends (90 days or the bazaar’s setting); you can ask for earlier deletion.</li></ul></section>
<section id="kept"><h2>What may be kept</h2>
<p>Only what the law requires us to keep (for example, billing records for our plan), for the legal period. We will tell you in our reply.</p></section>
<footer><span>© 2026 Neuri LLC · 5818 W Raymond St, Phoenix, AZ 85043</span><a href="/en/">neuri.bazar</a><a href="/en/bazar/privacy/">Privacy</a><a href="/en/bazar/terms/">Terms</a><a href="/bazar/borrar-mis-datos/" hreflang="es">Español</a></footer>
</div></body></html>
'''.replace('MAIL', MAIL_EN)

es_url = 'https://neuri.tech/bazar/borrar-mis-datos/'
en_url = 'https://neuri.tech/en/bazar/delete-my-data/'
pages = [
  ('bazar/privacidad/index.html', 'bazar/borrar-mis-datos/index.html', 'Borrar mis datos · neuri.bazar | Neuri',
   'Cómo pedir que borremos tus datos de neuri.bazar: por correo, respuesta en 20 días hábiles.', es_url, 'es', ES),
  ('en/bazar/privacy/index.html', 'en/bazar/delete-my-data/index.html', 'Delete my data · neuri.bazar | Neuri',
   'How to ask us to delete your neuri.bazar data: by email, reply within 20 business days.', en_url, 'en', EN),
]
for src, dst, title, desc, canon, lang, body in pages:
    out = head_from(src, title, desc, canon, es_url, en_url, lang) + '\n' + body
    p = R / dst; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(out)
    print('ok', dst, len(out))
