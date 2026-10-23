"""Copia assets/home.css EN LÍNEA a la portada (/ y /en/home/), igual que brand-chrome.py.
Fuente única: assets/home.css. Córrelo tras editarlo: python3 scripts/home-css.py"""
import pathlib, re
R = pathlib.Path(__file__).resolve().parent.parent
css = (R / "assets/home.css").read_text().strip()
block = f"<!--home-css--><style>\n{css}\n</style><!--/home-css-->"
for f in ["index.html", "en/home/index.html"]:
    p = R / f; t = p.read_text()
    if "<!--home-css-->" in t:
        t = re.sub(r"<!--home-css-->[\s\S]*?<!--/home-css-->", lambda _: block, t)
    else:
        t = t.replace('<link rel="stylesheet" href="/assets/home.css">', block)
    p.write_text(t)
    print("ok", f)
