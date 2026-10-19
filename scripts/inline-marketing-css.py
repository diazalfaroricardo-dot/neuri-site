"""T24 (B-O1): mete assets/marketing.css en línea en /en/marketing para que no bloquee el primer pintado.
La fuente sigue siendo assets/marketing.css: después de editarla, corre `python3 scripts/inline-marketing-css.py`."""
import re, sys
css = open("assets/marketing.css").read().strip()
pages = ["en/marketing/index.html"]
block = "<!-- marketing.css:inicio (generado por scripts/inline-marketing-css.py; edita assets/marketing.css) -->\n<style>" + css + "</style>\n<!-- marketing.css:fin -->"
for p in pages:
    s = open(p).read()
    if "<!-- marketing.css:inicio" in s:
        s2 = re.sub(r"<!-- marketing\.css:inicio.*?<!-- marketing\.css:fin -->", lambda m: block, s, flags=re.S)
    else:
        s2, n = re.subn(r'<link rel="stylesheet" href="/assets/marketing\.css[^"]*">', lambda m: block, s)
        if n != 1: sys.exit(f"{p}: no encontré el link a marketing.css")
    open(p, "w").write(s2); print("ok", p)
