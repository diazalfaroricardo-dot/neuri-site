"""Material real de Neuri Marketing en /marketing y /en/marketing (27-oct, pedido de Ricardo:
que las funciones recién desplegadas —reel animado con subtítulos, carrusel de texto, composiciones,
crudo→reel, filtro de inspiración— se vean en las piezas apiladas del sitio, con el mejor material).
- Hero «Tu semana»: las 4 piezas pasan de tarjetas de color a material real por giro (post, reel
  animado MK161+MK174, carrusel de texto MK166 que pasa solo, historia con encuesta).
- Sección nueva #material (después de #viralidad): abanicos de reels, carrusel, 5 composiciones,
  crudo → editado y filtro antes/después, con pestañas.
- Funciones: 4 tarjetas nuevas de lo ya construido (MK161/174/175, MK166, MK188, MK34/35).
Idempotente: si ya está aplicado (marca mk-material) no hace nada. Assets en img/mk/.
"""
import re, sys, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARK = "<!-- mk-material -->"
CSS = (ROOT / "scripts/mk-material.css").read_text().strip()
JS = (ROOT / "scripts/mk-material.js").read_text().strip()
T = json.loads((ROOT / "scripts/mk-material.json").read_text())


def section(L, lang):
    s = T[lang]["sec"]
    tabs, panels = [], []
    for i, t in enumerate(s["tabs"]):
        sel = "true" if i == 0 else "false"
        tabs.append(
            f'<button class="mt" role="tab" id="mt{i}" aria-controls="mp{i}" aria-selected="{sel}"'
            + ("" if i == 0 else ' tabindex="-1"')
            + f'><span class="mt-t">{t[0]}</span><span class="mt-d">{t[1]}</span></button>'
        )
    G = ["cafe", "comida", "bazar", "servicios"]
    biz = T[lang]["biz"]
    # 0 reels en abanico
    phones = "".join(
        f'<figure class="mphone" data-k="{k}"><video muted loop playsinline preload="none" poster="/img/mk/{g}-{lang}-reel.webp" width="540" height="960" aria-label="{s["reelAlt"].format(biz=biz[g])}"><source src="/img/mk/{g}-{lang}-reel.mp4" type="video/mp4"></video><figcaption><b>{biz[g]}</b><span>{s["subs"][g]}</span></figcaption></figure>'
        for k, g in enumerate(G)
    )
    panels.append(f'<div class="mfan" data-fan>{phones}</div>')
    # 1 carrusel de texto en baraja
    decks = []
    for g in G:
        sl = "".join(
            f'<img src="/img/mk/{g}-{lang}-tc-{n}.webp" width="540" height="675" loading="lazy" decoding="async" alt="{s["tcAlt"].format(n=n, biz=biz[g])}" style="--n:{n - 1}">'
            for n in range(1, 6)
        )
        decks.append(f'<div class="mdeck" data-deck="{g}"{"" if g == "bazar" else " hidden"}>{sl}</div>')
    gsw = "".join(
        f'<button type="button" class="chip" data-show="{g}" aria-pressed="{str(g == "bazar").lower()}">{biz[g]}</button>' for g in G
    )
    panels.append(f'<div class="mdecks">{"".join(decks)}<div class="mgsw" role="group" aria-label="{s["deckGroup"]}">{gsw}</div></div>')
    # 2 cinco composiciones
    looks = "".join(
        f'<figure class="mlook" style="--n:{n}"><img src="/img/mk/cafe-{lang}-look-{k}.webp" width="640" height="800" loading="lazy" decoding="async" alt="{s["lookAlt"].format(name=s["looks"][k])}"><figcaption>{s["looks"][k]}</figcaption></figure>'
        for n, k in enumerate(["marco", "minimal", "franja", "degradado", "titular"])
    )
    panels.append(f'<div class="mlooks" data-looks>{looks}</div>')
    # 3 crudo -> editado
    panels.append(
        f'<div class="mraw"><figure class="mr-a"><video muted loop playsinline preload="none" poster="/img/mk/comida-crudo.webp" width="480" height="270" aria-label="{s["rawAlt"]}"><source src="/img/mk/comida-crudo.mp4" type="video/mp4"></video><figcaption>{s["rawCap"]}</figcaption></figure>'
        f'<span class="mr-arrow" aria-hidden="true"><svg viewBox="0 0 40 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8h34M30 2l6 6-6 6"/></svg></span>'
        f'<figure class="mr-b"><video muted loop playsinline preload="none" poster="/img/mk/comida-{lang}-editado.webp" width="540" height="960" aria-label="{s["editAlt"]}"><source src="/img/mk/comida-{lang}-editado.mp4" type="video/mp4"></video><figcaption>{s["editCap"]}</figcaption></figure></div>'
    )
    # 4 filtro antes/después
    panels.append(
        f'<div class="mcmp" style="--x:50%"><img src="/img/mk/bazar-filtro.webp" width="640" height="800" loading="lazy" decoding="async" alt="{s["filtAlt"]}"><div class="mc-top"><img src="/img/mk/bazar-raw.webp" width="640" height="800" loading="lazy" decoding="async" alt="{s["rawPhotoAlt"]}"></div>'
        f'<span class="mc-l">{s["before"]}</span><span class="mc-r">{s["after"]}</span><span class="mc-h" aria-hidden="true"></span>'
        f'<input type="range" min="0" max="100" value="50" aria-label="{s["slider"]}"></div>'
    )
    pan = "".join(
        f'<div class="mpanel{" on" if i == 0 else ""}" role="tabpanel" id="mp{i}" aria-labelledby="mt{i}"{"" if i == 0 else " hidden"}>{p}</div>'
        for i, p in enumerate(panels)
    )
    return (
        f'{MARK}\n<section class="sec" id="material" style="padding-top:0"><div class="wrap">\n'
        f'  <div class="sec-head rv"><span class="eyebrow">{s["eyebrow"]}</span><h2 class="h2">{s["h2"]}</h2><p class="lede">{s["lede"]}</p></div>\n'
        f'  <div class="mflow"><div class="mtabs" role="tablist" aria-label="{s["tablist"]}">{"".join(tabs)}</div>\n'
        f'  <div class="mstage">{pan}</div></div>\n'
        f'  <p class="srcnote">{s["note"]}</p>\n'
        f'</div></section>\n\n'
    )


def patch(path, lang):
    p = ROOT / path
    h = p.read_text()
    if MARK in h:
        print("ya aplicado", path)
        return
    L = T[lang]
    # 1) CSS al final del bloque principal de estilos
    i = h.index("</style>")
    h = h[:i] + "\n/* mk-material */\n" + CSS + "\n" + h[i:]
    # 2) sección nueva antes de #como
    a = '<section class="sec" id="como"'
    assert h.count(a) == 1, "ancla #como"
    h = h.replace(a, section(L, lang) + a)
    # 3) cuarto giro: barbería (servicios) en vez de boutique (no hay material de boutique)
    h, n = re.subn(r'<button type="button" class="chip" data-giro="boutique" aria-pressed="false">[^<]*</button>',
                   f'<button type="button" class="chip" data-giro="barber" aria-pressed="false">{L["chip4"]}</button>', h)
    assert n == 1, "chip boutique"
    # 4) datos de la semana + piezas reales
    h, n = re.subn(r"  var W=\{.*?\n  var grid=", lambda m: L["W"] + "\n  var grid=", h, flags=re.S)
    assert n == 1, "bloque W"
    h, n = re.subn(r"  function swap\(p,i\)\{.*?\n  function draw\(g\)\{", lambda m: JS + "\n  function draw(g){", h, flags=re.S)
    assert n == 1, "swap/art"
    h, n = re.subn(r"d\.innerHTML=art\(it\[0\],it\[1\],w\.h,swap\(w\.p,i\)\)\+", "d.innerHTML=art(g,it,i)+", h)
    assert n == 1, "llamada art"
    h, n = re.subn(r"(title\.textContent=[^;]*;wstatus\.textContent=[^;]*;week\.classList\.remove\('busy'\);)", r"\1mkWake(grid);", h)
    assert n == 1, "despertar piezas"
    h, n = re.subn(r"  var EX=\[[^\n]*\];", lambda m: "  var EX=" + json.dumps(L["EX"], ensure_ascii=False).replace('"', "'") + ";", h)
    assert n == 1, "EX"
    for k, v in L["text"].items():
        assert h.count(k) == 1, f"texto: {k[:40]}"
        h = h.replace(k, v)
    # 5) funciones nuevas, después de la 2.ª tarjeta de la cuadrícula
    fg = h.index('<div class="fgrid">')
    j = fg
    for _ in range(3):
        j = h.index('<div class="feat spot rv">', j + 1)
    h = h[:j] + L["feats"] + "\n    " + h[j:]
    # 6) script de la sección (sin dependencias; respeta movimiento reducido)
    sj = (ROOT / "scripts/mk-material-section.js").read_text().strip()
    i = h.rindex("</body>")
    h = h[:i] + "<script>\n" + sj + "\n</script>\n" + h[i:]
    p.write_text(h)
    print("ok", path)


if __name__ == "__main__":
    patch("marketing/index.html", "es")
    patch("en/marketing/index.html", "en")
