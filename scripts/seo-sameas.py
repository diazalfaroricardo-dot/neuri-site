#!/usr/bin/env python3
"""sameAs de la entidad Neuri (neuri.tech) en todo el sitio (idempotente).

Lee docs/seo/perfiles.json y deja en CADA nodo Organization de Neuri (@id https://neuri.tech/#org)
de cada página HTML: "alternateName": "neuri.tech" y "sameAs": [urls de los perfiles, en orden].
Si una página tiene SoftwareApplication/WebSite con publisher {"@id": ".../#org"} pero ningún
nodo Organization, no la toca (el @id ya apunta a la portada, que sí lo trae).

Uso: python3 scripts/seo-sameas.py [--check]    (--check: sale 1 si algo no está al día)
Cómo sumar un perfil: docs/seo/sameas.md
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SKIP = ("node_modules/", "docs/", "tools/", "scripts/", ".t25/", "assets/", "img/")
ORG_ID = "https://neuri.tech/#org"
PERFILES = [p["url"] for p in json.load(open("docs/seo/perfiles.json"))["perfiles"]]
LD = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)


def es_neuri(n):
    return n.get("@type") == "Organization" and (n.get("@id") == ORG_ID or n.get("name") in ("Neuri", "Neuri LLC") or n.get("url") == "https://neuri.tech/")


def arregla(x):
    cambio = False
    if isinstance(x, list):
        for v in x:
            cambio |= arregla(v)
    elif isinstance(x, dict):
        if es_neuri(x) and len(x) > 1:  # no tocar referencias {"@id": ...}
            if x.get("sameAs") != PERFILES:
                x["sameAs"] = list(PERFILES); cambio = True
            if "alternateName" not in x:
                x["alternateName"] = "neuri.tech"; cambio = True
        for v in x.values():
            cambio |= arregla(v)
    return cambio


def main():
    check = "--check" in sys.argv
    pendientes = []
    for f in sorted(glob.glob("**/*.html", recursive=True)):
        if f.startswith(SKIP):
            continue
        s = open(f, encoding="utf-8").read()
        nuevo_total = s

        def sub(m):
            t = m.group(2)
            if "Organization" not in t:
                return m.group(0)
            d = json.loads(t)
            if not arregla(d):
                return m.group(0)
            return m.group(1) + json.dumps(d, ensure_ascii=False) + m.group(3)

        nuevo_total = LD.sub(sub, s)
        if nuevo_total != s:
            pendientes.append(f)
            if not check:
                open(f, "w", encoding="utf-8").write(nuevo_total)
    print(("pendientes: " if check else "actualizadas: ") + str(len(pendientes)))
    for f in pendientes:
        print("  " + f)
    if check and pendientes:
        sys.exit(1)


if __name__ == "__main__":
    main()
