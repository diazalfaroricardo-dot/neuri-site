#!/usr/bin/env python3
"""seo-geo-formato: formato que citan las IA en las 22 páginas de producto (idempotente).

1. Fecha «Actualizado» visible en el pie (junto a «© 2026 Neuri LLC») con <time datetime>.
2. dateModified en el nodo principal del JSON-LD (SoftwareApplication; si no hay, WebPage).
3. FAQPage = exactamente las preguntas visibles (<details><summary>) en las landings de bazar,
   para que Google no vea FAQ oculto ni preguntas distintas a las de la página.

Uso: python3 scripts/seo-geo.py [AAAA-MM-DD]   (por omisión, hoy en Phoenix)
"""
import datetime, html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
PAGINAS = [
    "sigue-disponible/", "sigue-disponible/citas/", "sigue-disponible/comida/", "sigue-disponible/creadores/",
    "sigue-disponible/vs-manychat/",
    "en/still-available/", "en/still-available/appointments/", "en/still-available/food/",
    "en/still-available/creators/", "en/still-available/vs-manychat/",
    "bazar/", "bazar/recorrido/", "bazar/vs-quail/", "bazar/vs-ricochet/",
    "en/bazar/", "en/bazar/tour/", "en/bazar/vs-quail/", "en/bazar/vs-ricochet/",
    "marketing/", "marketing/vs-predis/", "en/marketing/", "en/marketing/vs-predis/",
    # seo-herramientas-gratis (vista previa en la rama seo/herramientas-gratis)
    "sigue-disponible/calculadora-dms/", "bazar/calculadora-renta-comision/",
]
FAQ_DESDE_DETAILS = {"bazar/", "en/bazar/"}
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre",
         "octubre", "noviembre", "diciembre"]
LD = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)
SELLO = re.compile(r' · <span data-actualizado>.*?</span>')


def fecha():
    if len(sys.argv) > 1:
        return datetime.date.fromisoformat(sys.argv[1])
    return (datetime.datetime.utcnow() - datetime.timedelta(hours=7)).date()


def sello(d, en):
    if en:
        txt = f"Updated {d.strftime('%b')} {d.day}, {d.year}"
        return f' · <span data-actualizado>Updated <time datetime="{d.isoformat()}">{d.strftime("%B")} {d.day}, {d.year}</time></span>'
    return f' · <span data-actualizado>Actualizado el <time datetime="{d.isoformat()}">{d.day} de {MESES[d.month-1]} de {d.year}</time></span>'


def texto(h):
    h = re.sub(r"<[^>]+>", "", h)
    return re.sub(r"\s+", " ", html.unescape(h)).strip()


def faq_visible(s):
    out = []
    for m in re.finditer(r"<details[^>]*>\s*<summary>(.*?)</summary>\s*<p>(.*?)</p>\s*</details>", s, re.S):
        out.append({"@type": "Question", "name": texto(m.group(1)),
                    "acceptedAnswer": {"@type": "Answer", "text": texto(m.group(2))}})
    return out


def main():
    d = fecha()
    for p in PAGINAS:
        f = p + "index.html"
        s = open(f, encoding="utf-8").read()
        en = p.startswith("en/")
        orig = s
        # 1. sello visible (una sola vez, dentro del pie)
        s = SELLO.sub("", s)
        i = s.rfind("<footer")
        j = s.find("© 2026 Neuri LLC", i)
        assert i > -1 and j > -1, f"{f}: sin pie con © 2026 Neuri LLC"
        k = j + len("© 2026 Neuri LLC")
        s = s[:k] + sello(d, en) + s[k:]

        # 2 y 3. JSON-LD
        def sub(m):
            data = json.loads(m.group(2))
            g = data.get("@graph", [data])
            main_node = next((n for n in g if n.get("@type") == "SoftwareApplication"), None) or \
                next((n for n in g if n.get("@type") == "WebPage"), None)
            if main_node is not None:
                main_node["dateModified"] = d.isoformat()
            if p in FAQ_DESDE_DETAILS:
                faq = next((n for n in g if n.get("@type") == "FAQPage"), None)
                vis = faq_visible(s)
                if faq is not None and vis:
                    faq["mainEntity"] = vis
            return m.group(1) + json.dumps(data, ensure_ascii=False) + m.group(3)

        s = LD.sub(sub, s, count=1)
        if s != orig:
            open(f, "w", encoding="utf-8").write(s)
            print("✓", f)


if __name__ == "__main__":
    main()
