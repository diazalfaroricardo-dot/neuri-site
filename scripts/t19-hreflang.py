#!/usr/bin/env python3
"""T19 — reescribe de forma determinista los hreflang del <head> de neuri.tech (idempotente).

Para cada index.html público que no es redirección (meta refresh):
  - toma su par del hreflang del otro idioma que ya declara (o del que lo declara a él);
  - reemplaza todos sus <link rel="alternate" hreflang> por el bloque
      es → URL ES, en → URL EN, x-default → URL ES
    en el lugar del primero (o tras el canonical);
  - el selector de idioma visible («English»/«Español»/EN/ES con lang=, o data-idioma)
    que apunte al inicio del otro idioma en vez del par se cambia al par (solo el href).
No toca textos visibles ni nada fuera de esas etiquetas. Luego: python3 scripts/seo.py
(sitemap) y node scripts/t19-hreflang-test.mjs.
Uso: python3 scripts/t19-hreflang.py [--dry]
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://neuri.tech"
SKIP = {"node_modules", ".git", "scripts", "docs", "tools", "tmp", "assets", "img"}
ALT = re.compile(r'[ \t]*<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">[ \t]*\n?')
DRY = "--dry" in sys.argv


def files():
    out = []
    for d, ds, fs in os.walk(ROOT):
        ds[:] = sorted(x for x in ds if x not in SKIP and not x.startswith(".") and not x.startswith("preview-"))
        if "index.html" in fs:
            out.append(os.path.relpath(os.path.join(d, "index.html"), ROOT))
    return sorted(out)


def url_of(rel):
    return BASE + "/" + rel[: -len("index.html")]


def head_span(h):
    a = h.index("<head>")
    return a, h.index("</head>", a)


def main():
    pages = {}
    for rel in files():
        h = open(os.path.join(ROOT, rel), encoding="utf-8").read()
        if re.search(r'http-equiv=["\']refresh', h, re.I):
            continue
        a, b = head_span(h)
        pages[rel] = (h, dict((l, u) for l, u in ALT.findall(h[a:b])))
    by_url = {url_of(r): r for r in pages}

    # Par de cada página: el que declara, o quien la declara a ella.
    pair = {}
    for rel, (_, alts) in pages.items():
        lang = "en" if rel.startswith("en/") else "es"
        other = "es" if lang == "en" else "en"
        if alts.get(other) in by_url:
            pair[rel] = by_url[alts[other]]
    for rel, p in list(pair.items()):
        pair.setdefault(p, rel)

    touched = []
    for rel, (h, alts) in pages.items():
        own = url_of(rel)
        lang = "en" if rel.startswith("en/") else "es"
        a, b = head_span(h)
        head = h[a:b]
        if rel in pair:
            es, en = (own, url_of(pair[rel])) if lang == "es" else (url_of(pair[rel]), own)
            want = [("es", es), ("en", en), ("x-default", es)]
        elif alts:
            want = [(lang, own)] + ([("x-default", own)] if "x-default" in alts else [])
        else:
            continue
        m = ALT.search(head)
        if ALT.findall(head) == want:
            new_head = head  # ya está bien: no se toca el formato
        elif m:
            indent = re.match(r"[ \t]*", m.group(0)).group(0)
            block = "".join(f'{indent}<link rel="alternate" hreflang="{l}" href="{u}">\n' for l, u in want)
            new_head = head[: m.start()] + "\x00" + ALT.sub("", head[m.start():])
        else:
            c = re.search(r'<link rel="canonical"[^>]*>\n?', head)
            pos = c.end() if c else len(head)
            block = "".join(f'<link rel="alternate" hreflang="{l}" href="{u}">\n' for l, u in want)
            new_head = head[:pos] + "\x00" + head[pos:]
        new_head = new_head.replace("\x00", block) if new_head is not head else head
        new = h[:a] + new_head + h[b:]

        # Selector visible → par (solo el href; se respeta ?lang= y #).
        if rel in pair:
            other = "es" if lang == "en" else "en"
            target = url_of(pair[rel])[len(BASE):]

            def fix(mo):
                attrs, text = mo.group(1), mo.group(2)
                if f'hreflang="{other}"' not in attrs:
                    return mo.group(0)
                if not ("data-idioma" in attrs or (re.search(r'\blang="(en|es)"', attrs) and re.fullmatch(r"\s*(English|Español|EN|ES)\s*", text))):
                    return mo.group(0)
                hm = re.search(r'\bhref="([^"]+)"', attrs)
                if not hm or re.sub(r"[?#].*$", "", hm.group(1)) == target:
                    return mo.group(0)
                return "<a" + attrs.replace(hm.group(0), f'href="{target}"') + ">" + text

            body_at = new.index("</head>")
            new = new[:body_at] + re.sub(r"<a\b([^>]*)>([^<]*)", fix, new[body_at:])

        if new != h:
            touched.append(rel)
            if not DRY:
                open(os.path.join(ROOT, rel), "w", encoding="utf-8").write(new)
    es_pairs = sorted((r, pair[r]) for r in pair if not r.startswith("en/"))
    print(f"{len(pages)} páginas, {len(es_pairs)} pares, {len(pages) - len(pair)} sin par")
    print(f"{'cambiarían' if DRY else 'cambiadas'} {len(touched)}: {', '.join(touched) or '-'}")


if __name__ == "__main__":
    main()
