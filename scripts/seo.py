#!/usr/bin/env python3
"""SEO de neuri.tech en un comando (idempotente).

1. Canonical: agrega <link rel="canonical"> a toda página indexable que no lo tenga.
2. sitemap.xml: lo regenera desde las páginas reales (sin noindex), con lastmod
   = fecha del último commit de cada página y sus pares hreflang ES/EN.

Uso: python3 scripts/seo.py   (luego: node scripts/seo-test.mjs)
"""
import glob, re, subprocess, os
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
BASE = "https://neuri.tech"
SKIP = ("node_modules/", "docs/", "tools/", "scripts/", "preview-", ".t25/", "assets/", "img/")


def pages():
    out = []
    for f in sorted(glob.glob("**/index.html", recursive=True)):
        if f.startswith(SKIP):
            continue
        out.append(f)
    return out


def url_of(f):
    p = f[: -len("index.html")]
    return BASE + "/" + p


def head(html):
    m = re.search(r"<head>(.*?)</head>", html, re.S)
    return m.group(1) if m else ""


def noindex(html):
    m = re.search(r'<meta\s+name="robots"\s+content="([^"]*)"', head(html))
    return bool(m and "noindex" in m.group(1))


def lastmod(f):
    d = subprocess.run(["git", "log", "-1", "--format=%cs", "--", f],
                       capture_output=True, text=True).stdout.strip()
    return d or None


def alternates(html):
    alts = re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', head(html))
    seen, out = set(), []
    for lang, href in alts:
        if lang not in seen:
            seen.add(lang)
            out.append((lang, href))
    return out


def add_canonical(f, html):
    if re.search(r'rel="canonical"', head(html)):
        return html, False
    tag = f'<link rel="canonical" href="{url_of(f)}">\n'
    m = re.search(r'<link rel="alternate" hreflang=', html)
    if m:
        html = html[: m.start()] + tag + html[m.start():]
    else:
        html = html.replace("</head>", tag + "</head>", 1)
    return html, True


PRIORITY = {"/": "1.0"}


def priority(u):
    path = u[len(BASE):]
    if path in PRIORITY:
        return PRIORITY[path]
    if path.count("/") <= 2 or path in ("/en/home/",):
        return "0.9"
    return "0.6"


def main():
    fixed, entries = [], []
    for f in pages():
        html = open(f, encoding="utf-8").read()
        if noindex(html):
            continue
        html2, changed = add_canonical(f, html)
        if changed:
            open(f, "w", encoding="utf-8").write(html2)
            fixed.append(f)
        entries.append((url_of(f), lastmod(f), alternates(html2)))

    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
           'xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for u, lm, alts in entries:
        xml.append("  <url>")
        xml.append(f"    <loc>{escape(u)}</loc>")
        if lm:
            xml.append(f"    <lastmod>{lm}</lastmod>")
        xml.append(f"    <priority>{priority(u)}</priority>")
        for lang, href in alts:
            xml.append(f'    <xhtml:link rel="alternate" hreflang="{lang}" href="{escape(href)}"/>')
        xml.append("  </url>")
    xml.append("</urlset>")
    open("sitemap.xml", "w", encoding="utf-8").write("\n".join(xml) + "\n")
    print(f"canonical agregado en {len(fixed)}: {', '.join(fixed) or '-'}")
    print(f"sitemap.xml: {len(entries)} URLs")


if __name__ == "__main__":
    main()
