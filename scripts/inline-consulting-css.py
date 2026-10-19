"""T24 (B-O1): mete assets/consulting.css en línea en /consultoria y /en/ai-consulting para que no bloquee el primer pintado.
La fuente sigue siendo assets/consulting.css: después de editarla, corre `python3 scripts/inline-consulting-css.py`."""
import re, sys
css = open("assets/consulting.css").read().strip()
pages = ["consultoria/index.html", "en/ai-consulting/index.html"]
block = "<!-- consulting.css:inicio (generado por scripts/inline-consulting-css.py; edita assets/consulting.css) -->\n<style>" + css + "</style>\n<!-- consulting.css:fin -->"
for p in pages:
    s = open(p).read()
    if "<!-- consulting.css:inicio" in s:
        s2 = re.sub(r"<!-- consulting\.css:inicio.*?<!-- consulting\.css:fin -->", lambda m: block, s, flags=re.S)
    else:
        s2, n = re.subn(r'<link rel="stylesheet" href="/assets/consulting\.css[^"]*">', lambda m: block, s)
        if n != 1: sys.exit(f"{p}: no encontré el link a consulting.css")
    open(p, "w").write(s2); print("ok", p)
