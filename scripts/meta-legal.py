#!/usr/bin/env python3
"""M1 (docs/META-REVIEW.md en neuri-bazar): páginas de datos de Meta y de borrado de datos.

Genera, a partir de las plantillas legal/index.html y en/legal/index.html (misma marca, cabecera y pie):
  /legal/meta/            ES  — Datos de Facebook, Instagram y WhatsApp (política para la app de Meta)
  /en/legal/meta/         EN
  /legal/borrar-datos/    ES  — Cómo borrar tus datos (Data Deletion Instructions URL de Meta)
  /en/legal/data-deletion/ EN
Correr de nuevo si cambia la plantilla: python3 scripts/meta-legal.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FECHA_ES = "24 de octubre de 2026"
FECHA_EN = "October 24, 2026"

META_ES = """<div class="code">NEURI LLC · LEGAL · META</div>
<h1>Datos de Facebook, Instagram y WhatsApp</h1>
<p>Esta política explica qué hace la app «Neuri» de Meta con los datos que recibe cuando conectas tu página de Facebook, tu cuenta profesional de Instagram o tu número de WhatsApp Business a un producto de Neuri LLC. Complementa el aviso de privacidad de cada producto. Última actualización: {fecha}.</p>
<section aria-labelledby="quien-h">
<h2 id="quien-h">Quién es responsable</h2>
<p>Neuri LLC, 5818 W Raymond St, Phoenix, AZ 85043, EE. UU. Contacto: <a href="mailto:hola@neuri.tech">hola@neuri.tech</a>.</p>
</section>
<section aria-labelledby="que-h">
<h2 id="que-h">Qué usa cada producto y para qué</h2>
<ul class="sitio">
<li><b>neuri.bots</b> — contesta por ti las preguntas de tus clientes. Con tu permiso recibe los mensajes que te mandan por Instagram, Messenger y WhatsApp (texto, nombre o usuario e identificador de quien escribe, fecha), los responde en tu nombre con la información de tus productos que tú cargaste y te avisa cuando una persona tiene que intervenir. Permisos: instagram_business_basic, instagram_business_manage_messages, pages_show_list, pages_manage_metadata, pages_messaging, whatsapp_business_management, whatsapp_business_messaging.</li>
<li><b>Neuri Marketing</b> — publica en tu página e Instagram lo que tú apruebas y te ayuda a no perder clientes. Lee la lista de tus páginas y su cuenta de Instagram, publica fotos, carruseles y reels aprobados, recibe comentarios y mensajes directos para mostrártelos en una bandeja y marcar a quien pregunta precios, y lee estadísticas de tus publicaciones (alcance, guardados, compartidos) para tu reporte del mes. Permisos: pages_show_list, pages_read_engagement, pages_manage_posts, pages_manage_metadata, pages_messaging, business_management, instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_messages, instagram_manage_insights.</li>
<li><b>neuri.bazar</b> — publica en la página e Instagram del bazar las publicaciones que el dueño programa y manda avisos por WhatsApp a sus locatarios. Usa los mismos permisos de publicar y de WhatsApp de arriba.</li>
<li><b>neuri.consulting</b> no se conecta a Facebook, Instagram ni WhatsApp.</li>
</ul>
<p>Solo pedimos los permisos que el producto que usas necesita, y solo actuamos sobre las páginas y cuentas que tú eliges al conectar.</p>
</section>
<section aria-labelledby="no-h">
<h2 id="no-h">Lo que nunca hacemos</h2>
<ul class="sitio">
<li>No vendemos, rentamos ni compartimos tus datos de Meta con anunciantes ni corredores de datos.</li>
<li>No los usamos para hacer perfiles de personas, publicidad dirigida ni para entrenar modelos de IA.</li>
<li>No publicamos nada que tú no hayas aprobado (o encendido como piloto automático) y no mandamos mensajes a personas que no te escribieron primero, salvo plantillas de WhatsApp aprobadas por Meta a contactos que dieron su permiso.</li>
</ul>
</section>
<section aria-labelledby="terceros-h">
<h2 id="terceros-h">Proveedores que procesan datos por nosotros</h2>
<ul class="sitio">
<li><b>Anthropic (Claude)</b> y, cuando la función está encendida, <b>Google (Gemini)</b> y <b>OpenAI</b> (transcribir notas de voz): redactan respuestas, textos o imágenes. Reciben solo lo necesario para esa tarea y no lo usan para entrenar sus modelos según sus términos para empresas.</li>
<li><b>Railway</b> (servidores) y <b>Neon</b> (base de datos), en EE. UU.; <b>Resend</b> para correos.</li>
</ul>
</section>
<section aria-labelledby="guardar-h">
<h2 id="guardar-h">Cómo lo guardamos y por cuánto tiempo</h2>
<ul class="sitio">
<li>Los tokens de acceso de Meta se guardan cifrados y solo los usa el servidor del producto.</li>
<li>Mensajes, comentarios y estadísticas se guardan mientras tengas el servicio, para mostrártelos y para tu reporte; el aviso de cada producto dice el plazo exacto.</li>
<li>Si desconectas la cuenta, borramos su token de inmediato. Si dejas el servicio o pides el borrado, borramos los datos de Meta a más tardar en 30 días.</li>
</ul>
</section>
<section aria-labelledby="borrar-h">
<h2 id="borrar-h">Cómo borrar tus datos</h2>
<p>Sigue los pasos en <a href="/legal/borrar-datos/">Cómo borrar tus datos</a>. También puedes quitar la app «Neuri» desde la configuración de Facebook o Instagram: Meta nos avisa y borramos tus conexiones automáticamente.</p>
</section>
<section aria-labelledby="avisos-h">
<h2 id="avisos-h">Avisos de privacidad de cada producto</h2>
<nav aria-label="Avisos por producto">
<a href="/sigue-disponible/privacidad/">neuri.bots <span aria-hidden="true">→</span></a>
<a href="/bazar/privacidad/">neuri.bazar <span aria-hidden="true">→</span></a>
<a href="https://marketing.neuri.tech/privacidad">Neuri Marketing <span aria-hidden="true">→</span></a>
<a href="/legal/">Todos los avisos y términos <span aria-hidden="true">→</span></a>
</nav>
</section>
<p class="en" lang="en"><a href="/en/legal/meta/" hreflang="en">Read this page in English <span aria-hidden="true">→</span></a></p>
<p>Neuri LLC · Phoenix, Arizona</p>
"""

META_EN = """<div class="code">NEURI LLC · LEGAL · META</div>
<h1>Facebook, Instagram and WhatsApp data</h1>
<p>This policy explains what the Meta app “Neuri” does with the data it receives when you connect your Facebook Page, Instagram professional account or WhatsApp Business number to a Neuri LLC product. It complements each product’s privacy notice. Last updated: {fecha}.</p>
<section aria-labelledby="who-h">
<h2 id="who-h">Who is responsible</h2>
<p>Neuri LLC, 5818 W Raymond St, Phoenix, AZ 85043, USA. Contact: <a href="mailto:hola@neuri.tech">hola@neuri.tech</a>.</p>
</section>
<section aria-labelledby="what-h">
<h2 id="what-h">What each product uses and why</h2>
<ul class="sitio">
<li><b>neuri.bots</b> — answers your customers’ questions for you. With your permission it receives the messages people send you on Instagram, Messenger and WhatsApp (text, name or username and ID of the sender, date), replies on your behalf using the product information you uploaded, and tells you when a person needs to step in. Permissions: instagram_business_basic, instagram_business_manage_messages, pages_show_list, pages_manage_metadata, pages_messaging, whatsapp_business_management, whatsapp_business_messaging.</li>
<li><b>Neuri Marketing</b> — publishes what you approve to your Page and Instagram and helps you not miss customers. It reads your list of Pages and their Instagram account, publishes approved photos, carousels and reels, receives comments and direct messages to show them in one inbox and flag people asking about prices, and reads post insights (reach, saves, shares) for your monthly report. Permissions: pages_show_list, pages_read_engagement, pages_manage_posts, pages_manage_metadata, pages_messaging, business_management, instagram_basic, instagram_content_publish, instagram_manage_comments, instagram_manage_messages, instagram_manage_insights.</li>
<li><b>neuri.bazar</b> — publishes the posts a market owner schedules to the market’s Page and Instagram and sends WhatsApp notices to its vendors. It uses the same publishing and WhatsApp permissions listed above.</li>
<li><b>neuri.consulting</b> does not connect to Facebook, Instagram or WhatsApp.</li>
</ul>
<p>We only request the permissions the product you use needs, and we only act on the Pages and accounts you pick when connecting.</p>
</section>
<section aria-labelledby="never-h">
<h2 id="never-h">What we never do</h2>
<ul class="sitio">
<li>We do not sell, rent or share your Meta data with advertisers or data brokers.</li>
<li>We do not use it to profile people, for targeted advertising or to train AI models.</li>
<li>We never publish anything you did not approve (or switch on as autopilot), and we do not message people who did not write to you first, except Meta-approved WhatsApp templates sent to contacts who opted in.</li>
</ul>
</section>
<section aria-labelledby="vendors-h">
<h2 id="vendors-h">Providers that process data for us</h2>
<ul class="sitio">
<li><b>Anthropic (Claude)</b> and, when the feature is on, <b>Google (Gemini)</b> and <b>OpenAI</b> (voice-note transcription): they draft replies, captions or images. They receive only what that task needs and, under their business terms, do not use it to train their models.</li>
<li><b>Railway</b> (servers) and <b>Neon</b> (database), in the USA; <b>Resend</b> for email.</li>
</ul>
</section>
<section aria-labelledby="keep-h">
<h2 id="keep-h">How we store it and for how long</h2>
<ul class="sitio">
<li>Meta access tokens are stored encrypted and used only by the product’s server.</li>
<li>Messages, comments and insights are kept while you have the service, to show them to you and for your report; each product’s notice gives the exact period.</li>
<li>If you disconnect an account, we delete its token right away. If you leave the service or ask for deletion, we delete your Meta data within 30 days.</li>
</ul>
</section>
<section aria-labelledby="delete-h">
<h2 id="delete-h">How to delete your data</h2>
<p>Follow the steps in <a href="/en/legal/data-deletion/">How to delete your data</a>. You can also remove the “Neuri” app from your Facebook or Instagram settings: Meta notifies us and we delete your connections automatically.</p>
</section>
<section aria-labelledby="notices-h">
<h2 id="notices-h">Each product’s privacy notice</h2>
<nav aria-label="Notices by product">
<a href="/sigue-disponible/privacidad/">neuri.bots <span aria-hidden="true">→</span></a>
<a href="/bazar/privacidad/">neuri.bazar <span aria-hidden="true">→</span></a>
<a href="https://marketing.neuri.tech/privacidad?lang=en">Neuri Marketing <span aria-hidden="true">→</span></a>
<a href="/en/legal/">All notices and terms <span aria-hidden="true">→</span></a>
</nav>
</section>
<p class="en" lang="es"><a href="/legal/meta/" hreflang="es">Leer esta página en español <span aria-hidden="true">→</span></a></p>
<p>Neuri LLC · Phoenix, Arizona</p>
"""

DEL_ES = """<div class="code">NEURI LLC · LEGAL · BORRADO</div>
<h1>Cómo borrar tus datos</h1>
<p>Puedes pedir que borremos los datos que Neuri guarda de ti, incluidos los que llegaron de Facebook, Instagram o WhatsApp. Elige la forma que te quede más cómoda. Última actualización: {fecha}.</p>
<section aria-labelledby="op1-h">
<h2 id="op1-h">1. Quita la app desde Facebook o Instagram</h2>
<ul class="sitio">
<li><b>Facebook</b>: Configuración y privacidad → Configuración → Apps y sitios web → «Neuri» → Quitar.</li>
<li><b>Instagram</b>: Configuración → Apps y sitios web → Activas → «Neuri» → Quitar.</li>
</ul>
<p>Meta nos avisa en automático: borramos el token y las conexiones de esa cuenta y te damos un código para consultar el estado del borrado.</p>
</section>
<section aria-labelledby="op2-h">
<h2 id="op2-h">2. Desde el producto</h2>
<ul class="sitio">
<li><b>neuri.bots</b>: en «Mi asistente» → «Desconectar», y para borrar todo, «Borrar mis datos».</li>
<li><b>Neuri Marketing</b>: en tu panel → «Tus datos» → «Borrar mis datos».</li>
<li><b>neuri.bazar</b>: en tu cuenta → «Borrar mis datos».</li>
<li><b>neuri.consulting</b>: en el portal → «Tus datos y privacidad» → «Pedir el borrado».</li>
</ul>
</section>
<section aria-labelledby="op3-h">
<h2 id="op3-h">3. Por correo</h2>
<p>Escribe a <a href="mailto:hola@neuri.tech?subject=Borrar%20mis%20datos">hola@neuri.tech</a> con el asunto «Borrar mis datos» desde el correo de tu cuenta, o di qué página de Facebook o cuenta de Instagram conectaste.</p>
</section>
<section aria-labelledby="que-h">
<h2 id="que-h">Qué borramos y cuándo</h2>
<ul class="sitio">
<li>Tokens de acceso de Meta: de inmediato.</li>
<li>Mensajes, comentarios, estadísticas, contenido y datos de tu cuenta: a más tardar en 30 días. Te confirmamos por correo.</li>
<li>Solo conservamos lo que la ley nos obliga a guardar, como registros de pagos.</li>
</ul>
</section>
<p><a href="/legal/meta/">Qué datos de Facebook, Instagram y WhatsApp usamos <span aria-hidden="true">→</span></a></p>
<p class="en" lang="en"><a href="/en/legal/data-deletion/" hreflang="en">Read this page in English <span aria-hidden="true">→</span></a></p>
<p>Neuri LLC · Phoenix, Arizona</p>
"""

DEL_EN = """<div class="code">NEURI LLC · LEGAL · DELETION</div>
<h1>How to delete your data</h1>
<p>You can ask us to delete the data Neuri keeps about you, including data that came from Facebook, Instagram or WhatsApp. Pick whichever way is easiest. Last updated: {fecha}.</p>
<section aria-labelledby="o1-h">
<h2 id="o1-h">1. Remove the app from Facebook or Instagram</h2>
<ul class="sitio">
<li><b>Facebook</b>: Settings &amp; privacy → Settings → Apps and websites → “Neuri” → Remove.</li>
<li><b>Instagram</b>: Settings → Apps and websites → Active → “Neuri” → Remove.</li>
</ul>
<p>Meta notifies us automatically: we delete that account’s token and connections and give you a code to check the deletion status.</p>
</section>
<section aria-labelledby="o2-h">
<h2 id="o2-h">2. From the product</h2>
<ul class="sitio">
<li><b>neuri.bots</b>: in “My assistant” → “Disconnect”; to delete everything, “Delete my data”.</li>
<li><b>Neuri Marketing</b>: in your dashboard → “Your data” → “Delete my data”.</li>
<li><b>neuri.bazar</b>: in your account → “Delete my data”.</li>
<li><b>neuri.consulting</b>: in the portal → “Your data and privacy” → “Request deletion”.</li>
</ul>
</section>
<section aria-labelledby="o3-h">
<h2 id="o3-h">3. By email</h2>
<p>Email <a href="mailto:hola@neuri.tech?subject=Delete%20my%20data">hola@neuri.tech</a> with the subject “Delete my data” from your account email, or tell us which Facebook Page or Instagram account you connected.</p>
</section>
<section aria-labelledby="w-h">
<h2 id="w-h">What we delete and when</h2>
<ul class="sitio">
<li>Meta access tokens: immediately.</li>
<li>Messages, comments, insights, content and account data: within 30 days. We confirm by email.</li>
<li>We only keep what the law requires, such as payment records.</li>
</ul>
</section>
<p><a href="/en/legal/meta/">What Facebook, Instagram and WhatsApp data we use <span aria-hidden="true">→</span></a></p>
<p class="en" lang="es"><a href="/legal/borrar-datos/" hreflang="es">Leer esta página en español <span aria-hidden="true">→</span></a></p>
<p>Neuri LLC · Phoenix, Arizona</p>
"""

PAGES = [
    # (plantilla, ruta, alterna, es_path, en_path, título, descripción, contenido)
    ("legal/index.html", "legal/meta", "/en/legal/meta/", "/legal/meta/", "/en/legal/meta/",
     "Datos de Facebook, Instagram y WhatsApp | Neuri",
     "Qué datos de Facebook, Instagram y WhatsApp usa cada producto de Neuri LLC, para qué, con quién y cómo borrarlos.",
     META_ES.format(fecha=FECHA_ES)),
    ("en/legal/index.html", "en/legal/meta", "/legal/meta/", "/legal/meta/", "/en/legal/meta/",
     "Facebook, Instagram and WhatsApp data | Neuri",
     "What Facebook, Instagram and WhatsApp data each Neuri LLC product uses, why, who processes it and how to delete it.",
     META_EN.format(fecha=FECHA_EN)),
    ("legal/index.html", "legal/borrar-datos", "/en/legal/data-deletion/", "/legal/borrar-datos/", "/en/legal/data-deletion/",
     "Cómo borrar tus datos | Neuri",
     "Cómo pedir que Neuri LLC borre tus datos, incluidos los de Facebook, Instagram y WhatsApp.",
     DEL_ES.format(fecha=FECHA_ES)),
    ("en/legal/index.html", "en/legal/data-deletion", "/legal/borrar-datos/", "/legal/borrar-datos/", "/en/legal/data-deletion/",
     "How to delete your data | Neuri",
     "How to ask Neuri LLC to delete your data, including Facebook, Instagram and WhatsApp data.",
     DEL_EN.format(fecha=FECHA_EN)),
]


def build(tpl, out, alt, es, en, title, desc, body):
    html = (ROOT / tpl).read_text(encoding="utf-8")
    html = re.sub(r'<link rel="alternate" hreflang="es" href="[^"]*">', f'<link rel="alternate" hreflang="es" href="https://neuri.tech{es}">', html)
    html = re.sub(r'<link rel="alternate" hreflang="en" href="[^"]*">', f'<link rel="alternate" hreflang="en" href="https://neuri.tech{en}">', html)
    html = re.sub(r'<link rel="alternate" hreflang="x-default" href="[^"]*">', f'<link rel="alternate" hreflang="x-default" href="https://neuri.tech{es}">', html)
    html = re.sub(r"<title>[^<]*</title>", f"<title>{title}</title>", html, count=1)
    html = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', html, count=1)
    # Botón de idioma y link «English/Español» del pie → la página hermana.
    html = re.sub(r'(class="nb-lang" href=")[^"]*(")', rf"\g<1>{alt}\2", html)
    html = re.sub(r'(<a href=")/(?:en/)?legal/(" hreflang="(?:en|es)" lang="(?:en|es)">(?:English|Español)</a>)', rf"\g<1>{alt}\2", html)
    head, rest = html.split("<!--contenido-->", 1)
    _, tail = rest.split("<!--/contenido-->", 1)
    html = f"{head}<!--contenido-->\n{body}<!--/contenido-->{tail}"
    html = html.replace("https://neuri-marketing-production.up.railway.app", "https://marketing.neuri.tech")
    dest = ROOT / out / "index.html"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(html, encoding="utf-8")
    print("ok", dest.relative_to(ROOT))


if __name__ == "__main__":
    for p in PAGES:
        build(*p)
