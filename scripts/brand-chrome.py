#!/usr/bin/env python3
"""Marca en páginas secundarias de neuri.tech (legales, ayudas, recorridos, /legal/, 404).

Cada página toma el encabezado (candado logo + nav), pie (banda oscura con domicilio legal),
tipografía Geist, paleta, favicon, imagen OG y vendedor.js de la landing de SU producto, vía
/assets/brand.css (tema por <html data-brand>). El texto legal no se toca: solo la presentación.

Idempotente: la primera vez extrae el contenido de la página vieja y lo deja entre
<!--contenido--> … <!--/contenido-->; las siguientes solo regenera el chrome alrededor.
Después de cambiar assets/brand.css, vuelve a correrlo: el CSS se copia en línea a cada página.
Uso: python3 scripts/brand-chrome.py
"""
import pathlib
import re

R = pathlib.Path(__file__).resolve().parent.parent

# path → (marca, idioma, contraparte en el otro idioma, tipo)
PAGES = {
    "sigue-disponible/privacidad/": ("bots", "es", "/en/still-available/privacy/", "doc"),
    "sigue-disponible/terminos/": ("bots", "es", "/en/still-available/terms/", "doc"),
    "sigue-disponible/hoja/": ("bots", "es", "/en/still-available/sheet/", "steps"),
    "en/still-available/privacy/": ("bots", "en", "/sigue-disponible/privacidad/", "doc"),
    "en/still-available/terms/": ("bots", "en", "/sigue-disponible/terminos/", "doc"),
    "en/still-available/sheet/": ("bots", "en", "/sigue-disponible/hoja/", "steps"),
    "bazar/privacidad/": ("bazar", "es", "/en/bazar/privacy/", "doc"),
    "bazar/terminos/": ("bazar", "es", "/en/bazar/terms/", "doc"),
    "bazar/borrar-mis-datos/": ("bazar", "es", "/en/bazar/delete-my-data/", "doc"),
    "bazar/recorrido/": ("bazar", "es", "/en/bazar/tour/", "tour"),
    "en/bazar/privacy/": ("bazar", "en", "/bazar/privacidad/", "doc"),
    "en/bazar/terms/": ("bazar", "en", "/bazar/terminos/", "doc"),
    "en/bazar/delete-my-data/": ("bazar", "en", "/bazar/borrar-mis-datos/", "doc"),
    "en/bazar/tour/": ("bazar", "en", "/bazar/recorrido/", "tour"),
    "bazar/vs-quail/": ("bazar", "es", "/en/bazar/vs-quail/", "doc"),
    "en/bazar/vs-quail/": ("bazar", "en", "/bazar/vs-quail/", "doc"),
    "legal/": ("home", "es", "/en/legal/", "hub"),
    "en/legal/": ("home", "en", "/legal/", "hub"),
    "404.html": ("home", "es", "/en/home/", "hub"),
    # en/home/ ya no sale de aquí (25-oct-2026): es la portada EN con el diseño v2 (órbita + GSAP),
    # gemela de index.html y con /assets/portada.js; editarla a mano junto con la ES.
}

ICON = {
    "bots": "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22%3E%3Cpath d=%22M20 3C10.6 3 3 9.9 3 18.4c0 4.6 2.2 8.7 5.7 11.5L7 37l8.2-4.1c1.5.4 3.1.6 4.8.6 9.4 0 17-6.9 17-15.1S29.4 3 20 3z%22 fill=%22%230B5E3A%22/%3E%3C/svg%3E",
    "bazar": "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 34 22%22%3E%3Cpath d=%22M9 0h21a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H9L0 11z%22 fill=%22%23B4441A%22/%3E%3Ccircle cx=%229%22 cy=%2211%22 r=%222.6%22 fill=%22%23F7F1E8%22/%3E%3C/svg%3E",
    "home": "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 30 30%22%3E%3Crect width=%2230%22 height=%2230%22 rx=%228%22 fill=%22%2304060A%22/%3E%3Ccircle cx=%2215%22 cy=%2215%22 r=%225%22 fill=%22%238FE0B4%22/%3E%3Ccircle cx=%2223%22 cy=%229%22 r=%222%22 fill=%22%23E9EEF2%22/%3E%3C/svg%3E",
}
THEME = {"bots": "#0B5E3A", "bazar": "#B4441A", "home": "#04060A"}
SCHEME = {"bots": "light", "bazar": "light", "home": "dark"}
OG = {("bots", "es"): "bots-es", ("bots", "en"): "bots-en", ("bazar", "es"): "bazar-es", ("bazar", "en"): "bazar-en",
      ("home", "es"): "neuri", ("home", "en"): "neuri"}
# Geist desde el propio sitio: ninguna página manda la IP del visitante a Google (mismo bloque que tools/fuentes-propias.py).
_RANGO = ("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,"
          "U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
def _caras(fam, arch, pesos):
    return "".join(f'@font-face{{font-family:{fam};font-style:normal;font-weight:{w};font-display:swap;'
                   f'src:url(/assets/fonts/{arch}) format("woff2");unicode-range:{_RANGO}}}' for w in pesos)
FONT_TAGS = ('<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/geist-latin-wght.woff2" crossorigin>\n'
             '<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/geist-mono-latin-wght.woff2" crossorigin>\n'
             '<style>' + _caras("Geist", "geist-latin-wght.woff2", ("400", "500", "600", "700", "800"))
             + _caras('"Geist Mono"', "geist-mono-latin-wght.woff2", ("400", "500")) + '</style>')
ADDR = {"es": "© 2026 Neuri LLC · 5818 W Raymond St, Phoenix, AZ 85043, EE. UU.",
        "en": "© 2026 Neuri LLC · 5818 W Raymond St, Phoenix, AZ 85043, USA"}

TILE = {
    "bots": '<span class="nb-tile"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-5 4z"></path></svg></span>',
    "bazar": '<span class="nb-tile"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"></path><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"></path><path d="M5 13v7h14v-7"></path></svg></span>',
    "home": '<svg aria-hidden="true" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="none" stroke="#8FE0B4" stroke-width="1.5" opacity=".5"></circle><circle cx="15" cy="15" r="5" fill="#8FE0B4"></circle><circle cx="26" cy="9" r="2" fill="#E9EEF2"></circle></svg>',
}


def landing(brand, lang):
    return {("bots", "es"): "/sigue-disponible/", ("bots", "en"): "/en/still-available/",
            ("bazar", "es"): "/bazar/", ("bazar", "en"): "/en/bazar/",
            ("home", "es"): "/", ("home", "en"): "/en/home/"}[(brand, lang)]


def a(href, text, cls="", extra=""):
    c = f' class="{cls}"' if cls else ""
    return f'<a{c} href="{href}"{extra}>{text}</a>'


def header(brand, lang, alt):
    es = lang == "es"
    home = landing(brand, lang)
    other = "en" if es else "es"
    lang_link = a(alt, "EN" if es else "ES", "nb-lang", f' hreflang="{other}" lang="{other}" aria-label="{"EN, English" if es else "ES, Español"}" data-idioma')
    if brand == "bots":
        word = 'neuri<span>.bots</span>'
        nav = [a(home + "#como-funciona", "Cómo funciona" if es else "How it works", "nb-hide-sm"),
               a(home + "#precios", "Precios" if es else "Pricing", "nb-hide-sm"),
               a(home + "#preguntas", "Preguntas" if es else "FAQ", "nb-hide-sm"),
               lang_link,
               a(f"https://sd.neuri.tech/entrar?lang={lang}", "Entrar" if es else "Sign in", "nb-in", " data-entrar"),
               a(home + ("#alta" if es else "#signup"), "Quiero mi asistente" if es else "Get my assistant", "nb-cta")]
    elif brand == "bazar":
        word = 'neuri<span>.bazar</span>'
        nav = [a(home + "#funciones", "Funciones" if es else "Features", "nb-hide-sm"),
               a(home + "#precios", "Precios" if es else "Pricing", "nb-hide-sm"),
               a("/bazar/recorrido/" if es else "/en/bazar/tour/", "Recorrido" if es else "Tour", "nb-hide-sm"),
               lang_link,
               a(f"https://bazar.neuri.tech/login?lang={lang}", "Entrar" if es else "Sign in", "nb-in", " data-entrar"),
               a(home + "#prueba", "Prueba gratis" if es else "Free trial", "nb-cta")]
    else:
        word = "neuri"
        menu = "".join(
            f'<a role="menuitem" href="{h}">{t}</a>' for h, t in [
                (f"https://bazar.neuri.tech/login?lang={lang}", "neuri.bazar"),
                (f"https://consulting.neuri.tech/entrar?lang={lang}", "neuri.consulting"),
                (f"https://sd.neuri.tech/{'' if es else 'en/'}entrar" + ("?lang=es" if es else ""), "neuri.bots"),
                (f"https://marketing.neuri.tech/entrar?lang={lang}", "Neuri Marketing")])
        nav = [a("/sigue-disponible/" if es else "/en/still-available/", "neuri.bots", "nb-hide-sm"),
               a("/bazar/" if es else "/en/bazar/", "neuri.bazar", "nb-hide-sm"),
               a("/consultoria/" if es else "/en/ai-consulting/", "Consultoría IA" if es else "AI consulting", "nb-hide-sm"),
               a("/marketing/" if es else "/en/marketing/", "Marketing", "nb-hide-sm"),
               lang_link,
               f'<details data-entrar class="nb-menu"><summary>{"Entrar" if es else "Sign in"} <span aria-hidden="true">▾</span></summary><div role="menu">{menu}</div></details>']
    label = "Principal" if es else "Main"
    return (f'<a class="nb-skip" href="#contenido">{"Saltar al contenido" if es else "Skip to content"}</a>\n'
            f'<header class="nb-head"><a class="nb-logo" href="{home}" aria-label="{word.replace("<span>", "").replace("</span>", "")}, {"inicio" if es else "home"}">'
            f'{TILE[brand]}<span class="nb-word">{word}</span></a>\n'
            f'<nav class="nb-nav" aria-label="{label}">' + "".join(nav) + "</nav></header>")


def footer(brand, lang, alt):
    es = lang == "es"
    if brand == "bots":
        word, links = 'neuri<span>.bots</span>', [
            ("/" if es else "/en/home/", "neuri.tech"), ("/bazar/" if es else "/en/bazar/", "neuri.bazar"),
            ("/consultoria/" if es else "/en/ai-consulting/", "Neuri Consulting"), ("/marketing/" if es else "/en/marketing/", "Neuri Marketing"),
            ("/sigue-disponible/privacidad/" if es else "/en/still-available/privacy/", "Privacidad" if es else "Privacy"),
            ("/sigue-disponible/terminos/" if es else "/en/still-available/terms/", "Términos" if es else "Terms"),
            ("/sigue-disponible/hoja/" if es else "/en/still-available/sheet/", "Hoja de catálogo" if es else "Catalog sheet"),
            ("mailto:hola@neuri.tech", "hola@neuri.tech")]
    elif brand == "bazar":
        word, links = 'neuri<span>.bazar</span>', [
            ("/" if es else "/en/home/", "neuri.tech"), ("/sigue-disponible/" if es else "/en/still-available/", "neuri.bots"),
            ("/consultoria/" if es else "/en/ai-consulting/", "Neuri Consulting"), ("/marketing/" if es else "/en/marketing/", "Neuri Marketing"),
            ("/bazar/recorrido/" if es else "/en/bazar/tour/", "Recorrido" if es else "Tour"),
            ("/bazar/privacidad/" if es else "/en/bazar/privacy/", "Privacidad" if es else "Privacy"),
            ("/bazar/terminos/" if es else "/en/bazar/terms/", "Términos" if es else "Terms"),
            ("/bazar/borrar-mis-datos/" if es else "/en/bazar/delete-my-data/", "Borrar mis datos" if es else "Delete my data"),
            ("mailto:hola@neuri.tech", "hola@neuri.tech")]
    else:
        word, links = "neuri", [
            ("/sigue-disponible/" if es else "/en/still-available/", "neuri.bots"), ("/bazar/" if es else "/en/bazar/", "neuri.bazar"),
            ("/consultoria/" if es else "/en/ai-consulting/", "Consultoría IA" if es else "AI consulting"),
            ("/marketing/" if es else "/en/marketing/", "Neuri Marketing"),
            ("/legal/" if es else "/en/legal/", "Privacidad y términos" if es else "Privacy & terms"), ("mailto:hola@neuri.tech", "hola@neuri.tech")]
    other = "en" if es else "es"
    alt_href = "/en/home/" if alt.startswith("#") else alt
    links.append((alt_href, "English" if es else "Español"))
    li = "".join(a(h, t, "", f' hreflang="{other}" lang="{other}"' if t in ("English", "Español") else "") for h, t in links)
    return (f'<footer class="nb-foot"><div class="nb-foot-in"><span class="nb-word">{word}</span>'
            f'<nav class="nb-foot-links" aria-label="{"Pie" if es else "Footer"}">{li}</nav>'
            f'<p class="nb-foot-legal">{ADDR[lang]}</p></div></footer>')


def marca_head(brand, lang):
    return ("<!--marca-->\n"
            f'<meta name="color-scheme" content="{SCHEME[brand]}">\n<meta name="theme-color" content="{THEME[brand]}">\n'
            f'<link rel="icon" href="{ICON[brand]}">\n'
            f"{FONT_TAGS}\n"
            # brand.css va en línea (como consulting/marketing): pinta bien desde el primer cuadro.
            f'<style data-brand-css>\n{(R / "assets/brand.css").read_text(encoding="utf-8").strip()}\n</style>\n'
            '<script src="/assets/vendedor.js" defer></script>\n'
            "<!--/marca-->")


STRIP = [
    r"<!--marca-->.*?<!--/marca-->\s*",
    r"<style[^>]*>.*?</style>\s*",
    r'<link rel="preconnect"[^>]*>\s*',
    r'<link rel="preload" as="style"[^>]*>\s*',
    r'<link rel="stylesheet"[^>]*>\s*',
    r"<noscript>\s*<link[^>]*fonts[^>]*>\s*</noscript>\s*",
    r'<link rel="icon"[^>]*>\s*',
    r'<meta name="color-scheme"[^>]*>\s*',
    r'<meta name="theme-color"[^>]*>\s*',
    r'<script src="/assets/vendedor\.js"[^>]*></script>\s*',
    r"<!doctype html>\s*", r"<html[^>]*>\s*", r"</?head>\s*",
]


def extract(rel, kind, body):
    m = re.search(r"<!--contenido-->(.*?)<!--/contenido-->", body, re.S)
    if m:
        return m.group(1).strip("\n")
    if kind == "hub":
        c = re.search(r"<main[^>]*>(.*?)</main>", body, re.S).group(1)
        c = re.sub(r"\s*<footer.*?</footer>", "", c, flags=re.S)
    else:
        if "</header>" in body.split("<footer")[0]:
            start = body.index("</header>") + len("</header>")
        else:
            start = re.search(r'<a class="logo"[^>]*>.*?</a>', body, re.S).end()
        end = body.index("<footer")
        c = body[start:end]
        c = re.sub(r"\s*</div>\s*$", "", c)
    c = c.strip("\n")
    # Presentación: sin estilos en línea fuera de marca.
    c = c.replace(' style="margin-top:8px;color:#5B6683"', ' class="url"')
    c = c.replace(' style="color:#fff;text-decoration:underline"', "")
    c = c.replace('<p style="margin-top:18px">', '<p class="nota" style="margin-top:18px">')
    if kind == "steps":
        c = c.replace("<ol>", '<ol class="nb-steps">', 1)
    # Un solo <section> con muchos h2 → una tarjeta por apartado (como bazar).
    if kind == "doc" and c.count("<section") == 1 and c.count("<h2") > 2:
        first = c.index("<h2", c.index("<section"))
        c = c[:first] + re.sub(r"\n<h2 ", "\n</section>\n<section>\n<h2 ", c[first:])
    return c


def build(rel, cfg):
    brand, lang, alt, kind = cfg
    f = R / (rel if rel.endswith(".html") else rel + "index.html")
    t = f.read_text(encoding="utf-8")
    i = t.index("<body")
    head, body = t[:i], t[t.index(">", i) + 1:]
    body = re.sub(r"</body>\s*</html>.*$", "", body, flags=re.S)
    # Restos fuera de lugar (p. ej. un <link rel="icon"> después de </html>).
    for pat in STRIP:
        head = re.sub(pat, "", head, flags=re.S | re.I)
    head = re.sub(r'(<meta property="og:image" content="https://neuri\.tech/assets/og/)[^"]+(\.png")',
                  lambda m: m.group(1) + OG[(brand, lang)] + m.group(2), head)
    head = re.sub(r'(<meta name="twitter:image" content="https://neuri\.tech/assets/og/)[^"]+(\.png")',
                  lambda m: m.group(1) + OG[(brand, lang)] + m.group(2), head)
    content = extract(rel, kind, body)
    wrap = {"hub": "nb-wrap nb-hub", "tour": "nb-wrap wide", "home": "nb-wrap nb-home"}.get(kind, "nb-wrap")
    # La 404 de GitHub Pages es una sola: bajo /en/ se pasa a inglés con este script (auditoría 2-nov).
    extra = (R / "scripts/404-en.js.html").read_text(encoding="utf-8") if rel == "404.html" else ""
    out = (f'<!doctype html>\n<html lang="{lang}" data-brand="{brand}">\n<head>\n{head.strip()}\n{marca_head(brand, lang)}\n</head>\n<body>\n'
           f"{header(brand, lang, alt)}\n"
           f'<main id="contenido" class="nb-main"><div class="{wrap}">\n<!--contenido-->\n{content}\n<!--/contenido-->\n</div></main>\n'
           f"{footer(brand, lang, alt)}\n{extra}<script src=\"/assets/menu-esc.js\" defer></script>\n</body>\n</html>\n")
    f.write_text(out, encoding="utf-8")
    print("ok", rel)


if __name__ == "__main__":
    for rel, cfg in PAGES.items():
        build(rel, cfg)
