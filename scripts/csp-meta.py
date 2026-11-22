#!/usr/bin/env python3
"""eng-auditoria-8-checks: GitHub Pages no deja poner headers, así que cada página lleva la CSP y la
política de referrer como <meta> justo después de <meta charset>. Idempotente: reemplaza la que haya.
Uso: python3 scripts/csp-meta.py   (después de agregar o generar páginas). Prueba: csp-meta-test.mjs.
Scripts: solo del sitio, PostHog y Meta Pixel (con consentimiento); 'unsafe-inline' por el JSON-LD y
los <script> en línea de las páginas. frame-ancestors no funciona en <meta> (clickjacking: no hay
login en neuri.tech; las apps sí mandan X-Frame-Options).
eng-alm-au-tech-headers: mientras no haya headers (Cloudflare apagado, docs/CLOUDFLARE-HEADERS-ENCENDER.md)
cada página lleva además el frame-buster de OWASP: la página nace oculta y solo se muestra si es la
ventana de arriba; dentro de un iframe intenta salirse y, si el navegador no deja, se queda en blanco.
Ninguna app de Neuri incrusta neuri.tech (revisado 22-nov: repos y Mission Control). Prueba: t67-anti-iframe-test.mjs.
Va en línea (la CSP permite 'unsafe-inline'); NO agregar su hash a script-src: con un hash el navegador
ignora 'unsafe-inline' y se romperían los demás <script> en línea."""
import pathlib, re

CSP = "; ".join([
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    "connect-src 'self' https://*.neuri.tech https://us.i.posthog.com https://us-assets.i.posthog.com https://www.facebook.com https://connect.facebook.net",
    "frame-src 'self' https://www.facebook.com",
    "worker-src 'self' blob:",
    "form-action 'self' https://*.neuri.tech",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
])
TAGS = (f'<meta http-equiv="Content-Security-Policy" content="{CSP}">'
        '<meta name="referrer" content="strict-origin-when-cross-origin">')
ANTIFRAME = ('<style id="antiClickjack">html{display:none!important}</style>'
             '<script>(function(){try{if(self===top){var s=document.getElementById("antiClickjack");'
             's&&s.parentNode.removeChild(s)}else{top.location=self.location}}catch(e){}})()</script>')
TAGS += ANTIFRAME
OLD = re.compile(r'<meta http-equiv="Content-Security-Policy"[^>]*>(<meta name="referrer"[^>]*>)?'
                 r'(<style id="antiClickjack">.*?</style><script>.*?</script>)?')
CHARSET = re.compile(r'(<meta charset="?[^">]+"?\s*/?>)', re.I)

def main():
    root = pathlib.Path(__file__).resolve().parent.parent
    n = 0
    for p in sorted(root.rglob("*.html")):
        rel = p.relative_to(root).parts
        if rel[0] in {"scripts", "tools", "docs", "node_modules", ".git"} or rel[0].startswith("."):
            continue
        s = p.read_text(encoding="utf-8")
        s2 = OLD.sub("", s)
        m = CHARSET.search(s2)
        if not m:
            continue
        s2 = s2[: m.end()] + TAGS + s2[m.end():]
        if s2 != s:
            p.write_text(s2, encoding="utf-8")
            n += 1
    print(f"csp-meta: {n} página(s) actualizadas")

if __name__ == "__main__":
    main()
