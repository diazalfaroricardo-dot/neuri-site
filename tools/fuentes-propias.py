#!/usr/bin/env python3
"""B-O1 / A286 / T-LH: cambia Google Fonts por Geist servida desde /assets/fonts en todas las páginas de neuri.tech.
Mismas fuentes (fontsource = copia de Google, OFL) y mismo unicode-range que el subset latin de Google.
Idempotente. Uso: python3 tools/fuentes-propias.py"""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALTAR = {"node_modules", ".git", ".t25", "scripts", "tools"}
PAGINAS = sorted(str(f.relative_to(RAIZ)) for f in RAIZ.rglob("*.html")
                 if not SALTAR & set(f.relative_to(RAIZ).parts))
RANGO = ("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,"
         "U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
def caras(fam, arch, pesos):
    # Un @font-face por peso, igual que Google: un peso intermedio (650) cae en el mismo lugar y nada cambia de ancho.
    return "".join(f'@font-face{{font-family:{fam};font-style:normal;font-weight:{w};font-display:swap;'
                   f'src:url(/assets/fonts/{arch}) format("woff2");unicode-range:{RANGO}}}' for w in pesos)
def serif():
    # Afiliados: Instrument Serif, peso 400 normal e itálica, como pedía a Google (ital@0;1).
    return "".join(f'@font-face{{font-family:"Instrument Serif";font-style:{e};font-weight:400;font-display:swap;'
                   f'src:url(/assets/fonts/instrument-serif-latin-400-{e}.woff2) format("woff2");unicode-range:{RANGO}}}'
                   for e in ("normal", "italic"))
def bloque(html):
    m = re.search(r"family=Geist:wght@([\d;]+)&amp;family=Geist\+Mono:wght@([\d;]+)", html)
    sans, mono = m.group(1).split(";"), m.group(2).split(";")
    extra = serif() if "family=Instrument+Serif" in html else ""
    return ('<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/geist-latin-wght.woff2" crossorigin>\n'
            '<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/geist-mono-latin-wght.woff2" crossorigin>\n'
            '<style>' + caras("Geist", "geist-latin-wght.woff2", sans)
            + caras('"Geist Mono"', "geist-mono-latin-wght.woff2", mono) + extra + '</style>\n')
for p in PAGINAS:
    f = RAIZ / p
    html = f.read_text(encoding="utf-8")
    lineas = html.splitlines(keepends=True)
    fuera = [i for i, l in enumerate(lineas) if "fonts.g" in l]
    if not fuera:
        continue
    for i in fuera:
        resto = re.sub(r'<noscript><link[^>]*fonts\.g[^>]*></noscript>|<link[^>]*fonts\.g[^>]*>', "", lineas[i])
        lineas[i] = "" if not resto.strip() else resto
    lineas[fuera[0]] = bloque(html) + lineas[fuera[0]]
    f.write_text("".join(lineas), encoding="utf-8")
    print("listo:", p)
