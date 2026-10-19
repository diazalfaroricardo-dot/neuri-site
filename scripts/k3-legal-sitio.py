#!/usr/bin/env python3
"""B-K3 neuri.tech: agrega a /legal/ la sección «Este sitio (neuri.tech)» ES/EN. Idempotente."""
from pathlib import Path

p = Path(__file__).resolve().parent.parent / "legal/index.html"
t = p.read_text(encoding="utf-8")
if 'id="sitio-h"' in t:
    print("ya estaba"); raise SystemExit(0)

CSS = ".sitio{color:var(--sub);font-size:16px;line-height:1.5;padding-left:20px;margin:0 0 8px}.sitio li{margin:0 0 10px}.sitio b{color:var(--fg)}\n</style>"
ES = """<section aria-labelledby="sitio-h">
<h2 id="sitio-h">Este sitio (neuri.tech)</h2>
<p>Las páginas de neuri.tech no tienen cuentas ni cobros propios. Al visitarlas pasa esto:</p>
<ul class="sitio">
<li><b>Analítica anónima con PostHog</b> (servidores en EE. UU.): cuenta visitas y clics en botones sin cookies ni almacenamiento en tu navegador, sin grabar la sesión y sin nombres, correos ni teléfonos. Si tu navegador pide «No rastrear», no se activa.</li>
<li><b>Google Fonts</b>: algunas páginas descargan tipografías de servidores de Google, que reciben tu dirección IP al entregarlas.</li>
<li><b>Tu idioma</b>: si eliges English o Español, lo guardamos solo en tu navegador (almacenamiento local) para recordarlo. No es una cookie y lo puedes borrar desde tu navegador.</li>
<li><b>Asistente de IA</b>: cuando el globo de ayuda aparece, lo que le escribas se procesa con Claude (Anthropic) como explica el aviso de privacidad de neuri.consulting. Si no aparece, está apagado y no se envía nada.</li>
<li><b>Formularios de alta o lista de espera</b>: lo que envíes lo guarda el producto en el que te registras, según su aviso de arriba.</li>
<li><b>Hospedaje</b>: el sitio se sirve desde GitHub Pages, que puede registrar tu dirección IP por seguridad.</li>
</ul>
</section>
"""
EN = """<h2 id="site-h">This site (neuri.tech)</h2>
<p>neuri.tech pages have no accounts or payments of their own. When you visit them:</p>
<ul class="sitio">
<li><b>Anonymous analytics with PostHog</b> (US servers): counts visits and button clicks with no cookies or browser storage, no session recording and no names, emails or phone numbers. If your browser sends “Do Not Track”, it stays off.</li>
<li><b>Google Fonts</b>: some pages download fonts from Google servers, which receive your IP address when serving them.</li>
<li><b>Your language</b>: if you pick English or Español, we keep that choice only in your browser (local storage) to remember it. It is not a cookie and you can clear it from your browser.</li>
<li><b>AI assistant</b>: when the help bubble shows up, what you type is processed with Claude (Anthropic) as the neuri.consulting privacy policy explains. If it doesn’t show up, it is off and nothing is sent.</li>
<li><b>Sign-up or waitlist forms</b>: what you send is kept by the product you sign up for, under its policy above.</li>
<li><b>Hosting</b>: the site is served from GitHub Pages, which may log your IP address for security.</li>
</ul>
"""
assert t.count("</style>") >= 1
t = t.replace("</style>", CSS, 1)
anchor = '<section lang="en" aria-labelledby="en-h">'
assert anchor in t
t = t.replace(anchor, ES + anchor, 1)
end = "</nav>\n</section>\n<p class=\"en\">Neuri LLC"
assert end in t
t = t.replace(end, "</nav>\n" + EN + "</section>\n<p class=\"en\">Neuri LLC", 1)
p.write_text(t, encoding="utf-8")
print("ok")
