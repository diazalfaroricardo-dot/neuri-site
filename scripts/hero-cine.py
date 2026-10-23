#!/usr/bin/env python3
"""Hero cinematográfico de neuri.bazar (EN /en/ y ES /bazar/).

Reemplaza <section id="inicio"> (copia estática y la del <template> de dc-lite) por un hero oscuro
a pantalla completa con una escena animada SOLO con CSS (morphdom no la reinicia):
caja escanea 3 piezas de 3 puestos → cobrar → la venta se reparte por puesto → al vendedor le
llega el aviso y sube su saldo en Mi Puesto. Datos de ejemplo, rotulados como tales.
Idempotente: se puede volver a correr. Uso: python3 scripts/hero-cine.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
T = 12  # segundos por vuelta

# ---------- tiempos (en % de la vuelta) ----------
I1, I2, I3 = 8, 20, 32      # entra cada pieza
PRESS, PAID = 42, 45        # cobrar → pagado
FLY0, FLY1 = 47, 56         # vuelan los montos
CHIP1, CHIP2, NOTIF, NEWROW = 56, 58, 56, 61
OUT = 93                    # todo se desvanece y reinicia


def appear(n, t, frm="translateY(.8em)", out=OUT):
    return (f"@keyframes {n}{{0%,{t}%{{opacity:0;transform:{frm}}}{t+3}%,{out}%{{opacity:1;transform:none}}"
            f"{out+4}%,100%{{opacity:0;transform:none}}}}")


def window(n, a, b):
    """visible solo entre a% y b% (estados que se cruzan: totales, cobrar/pagado, saldo)."""
    if a <= 0:
        return f"@keyframes {n}{{0%,{b}%{{opacity:1}}{b+.6}%,{OUT+4}%{{opacity:0}}100%{{opacity:1}}}}"
    return f"@keyframes {n}{{0%,{a-.6}%{{opacity:0}}{a}%,{b}%{{opacity:1}}{b+.6}%,100%{{opacity:0}}}}"


def fly(n, x0, y0, x1, y1):
    return (f"@keyframes {n}{{0%,{FLY0}%{{opacity:0;transform:translate({x0}em,{y0}em) scale(.3)}}"
            f"{FLY0+1.5}%{{opacity:1;transform:translate({x0}em,{y0}em) scale(1)}}"
            f"{FLY1}%{{opacity:1;transform:translate({x1}em,{y1}em) scale(.7)}}"
            f"{FLY1+2.5}%,100%{{opacity:0;transform:translate({x1}em,{y1}em) scale(2.2)}}}}")


def chapter(n, a, b):
    on, off = "#F7F1E8", "rgba(247,241,232,.42)"
    pre = f"0%,{a}%{{color:{off}}}" if a > 0 else ""
    return f"@keyframes {n}{{{pre}{a+.5 if a else 0}%,{b}%{{color:{on}}}{b+.5}%,100%{{color:{off}}}}}"


KF = "\n".join([
    appear("hcR1", I1), appear("hcR2", I2), appear("hcR3", I3),
    window("hcT0", 0, I1), window("hcT1", I1, I2), window("hcT2", I2, I3), window("hcT3", I3, OUT + 3),
    window("hcCh", 0, PAID), window("hcPd", PAID, OUT + 3),
    f"@keyframes hcPress{{0%,{PRESS}%{{transform:none}}{PRESS+1}%{{transform:scale(.95)}}{PRESS+2.5}%,100%{{transform:none}}}}",
    # dot 1 → chip Jim, dot 2 → chip Linda, dot 3 → aviso en el celular de Rosa
    fly("hcF1", 11.5, 28.6, 5, 34.6), fly("hcF2", 11.5, 28.6, 16, 35.6), fly("hcF3", 11.5, 28.6, 29, 6),
    appear("hcP1", CHIP1, "translateY(1em) scale(.9)"), appear("hcP2", CHIP2, "translateY(1em) scale(.9)"),
    appear("hcN", NOTIF, "translateY(-7em)", out=80), f"@keyframes hcNew{{0%,{NEWROW}%{{opacity:0;max-height:0;padding-top:0;padding-bottom:0;transform:translateX(2em)}}{NEWROW+3}%,{OUT}%{{opacity:1;max-height:4em;padding-top:.7em;padding-bottom:.7em;transform:none}}{OUT+4}%,100%{{opacity:0;max-height:4em}}}}",
    window("hcB0", 0, NEWROW), window("hcB1", NEWROW, OUT + 3),
    f"@keyframes hcGlow{{0%,{NEWROW}%{{box-shadow:0 0 0 0 rgba(243,179,143,0)}}{NEWROW+2}%{{box-shadow:0 0 0 .5em rgba(243,179,143,.45)}}{NEWROW+8}%,100%{{box-shadow:0 0 0 0 rgba(243,179,143,0)}}}}",
    f"@keyframes hcFill{{0%{{transform:scaleX(0)}}{OUT}%{{transform:scaleX(1)}}100%{{transform:scaleX(1);opacity:0}}}}",
    chapter("hcC1", 0, PRESS - .5), chapter("hcC2", PRESS - .5, FLY0), chapter("hcC3", FLY0, NEWROW - 1), chapter("hcC4", NEWROW - 1, OUT + 3),
    "@keyframes hcScan{0%,100%{top:12%}50%{top:82%}}",
    "@keyframes hcFloat{0%,100%{translate:0 0}50%{translate:0 -.5em}}",
])

A = f"{T}s cubic-bezier(.2,.8,.2,1) infinite both"
CSS = f"""<style id="hero-cine">
/* Hero cinematográfico (scripts/hero-cine.py). Animación solo CSS: morphdom no la reinicia. */
#dc-a>div>header:first-of-type{{background:#05080D;color:#F7F1E8;box-shadow:0 0 0 100vmax #05080D;clip-path:inset(0 -100vmax);position:relative;z-index:5}}
#dc-a>div>header:first-of-type a{{color:#F7F1E8}}
#dc-a>div>header:first-of-type a[href="#prueba"]{{background:#B4441A!important;color:#FFFFFF!important}}
#dc-a>div>header:first-of-type span[style*="#B4441A"]:not(:has(svg)){{color:#F3B38F!important}}
.hc{{position:relative;background:#05080D;color:#F7F1E8;overflow:hidden;isolation:isolate}}
.hc::before{{content:"";position:absolute;inset:0;z-index:-2;background:radial-gradient(55% 65% at 80% 38%,rgba(180,68,26,.42),transparent 72%),radial-gradient(40% 50% at 4% 105%,rgba(14,107,107,.38),transparent 70%),radial-gradient(30% 30% at 55% 0%,rgba(243,179,143,.10),transparent 70%)}}
.hc::after{{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(rgba(247,241,232,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(247,241,232,.045) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000,transparent 75%);mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000,transparent 75%)}}
.hc-in{{max-width:1200px;margin:0 auto;padding:48px 24px 88px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:48px;align-items:center;min-height:min(760px,calc(100vh - 84px));box-sizing:border-box}}
.hc-tx{{display:flex;flex-direction:column;gap:24px;min-width:0}}
.hc-eb{{align-self:flex-start;display:inline-flex;align-items:center;gap:10px;background:rgba(243,179,143,.10);border:1px solid rgba(243,179,143,.28);color:#F3B38F;font-weight:600;font-size:14px;padding:8px 14px;border-radius:999px}}
.hc-eb i{{width:8px;height:8px;border-radius:50%;background:#F3B38F;box-shadow:0 0 0 4px rgba(243,179,143,.18)}}
.hc h1{{margin:0;font-family:'Geist',system-ui,sans-serif;font-weight:800;font-size:clamp(40px,4.7vw,68px);line-height:1;letter-spacing:-.045em;color:#F7F1E8}}
.hc h1 em{{font-style:normal;color:#F3B38F;background:linear-gradient(100deg,#FFD3BA 0%,#E0A090 55%,#F3B38F 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}}
.hc-lead{{margin:0;font-size:20px;line-height:1.5;color:#CFC4B4;max-width:540px}}
.hc-cta{{display:flex;flex-wrap:wrap;gap:12px}}
.hc-cta a{{text-decoration:none;font-weight:600;font-size:17px;padding:16px 24px;border-radius:14px;display:inline-flex;align-items:center;gap:8px;min-height:52px;box-sizing:border-box}}
.hc-cta .hc-p{{background:#B4441A;color:#FFFFFF;box-shadow:0 14px 34px -12px rgba(180,68,26,.85)}}
.hc-cta .hc-p:hover{{background:#C2341D}}
.hc-cta .hc-s{{background:rgba(247,241,232,.06);color:#F7F1E8;border:1.5px solid rgba(247,241,232,.22)}}
.hc-cta .hc-s:hover{{background:rgba(247,241,232,.12)}}
.hc-trust{{margin:0;font-size:15px;color:#A89C8C}}
.hc-wrap{{container-type:inline-size;width:100%;min-width:0}}
.hc-st{{position:relative;font-size:16px;font-size:min(16px,2.6cqw);width:38em;height:40em;margin:0 auto}}
.hc-st *{{box-sizing:border-box}}
.hc-tag{{position:absolute;left:1em;top:0;display:flex;align-items:center;gap:.5em;font-size:.78em;color:#A89C8C;font-weight:500;letter-spacing:.02em}}
.hc-tag i{{width:.55em;height:.55em;border-radius:50%;background:#F3B38F;animation:hcFloat 2s ease-in-out infinite}}
.hc-reg{{position:absolute;left:1em;top:2.4em;width:21.5em;background:#FFFFFF;color:#05080D;border-radius:1.6em;overflow:hidden;z-index:1;box-shadow:0 3.5em 6em -2em rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.08);transform:perspective(90em) rotateY(9deg) rotateX(2deg)}}
.hc-rh{{background:#05080D;color:#FFFFFF;padding:1em 1.2em;display:flex;justify-content:space-between;align-items:center;gap:.8em}}
.hc-rh b{{font-size:.84em;font-weight:600;display:flex;align-items:center;gap:.55em;white-space:nowrap}}
.hc-rh b::before{{content:"";width:.55em;height:.55em;border-radius:50%;background:#8FE0B4;box-shadow:0 0 0 .25em rgba(143,224,180,.25)}}
.hc-rh span{{font-size:.74em;color:#CFC4B4;white-space:nowrap}}
.hc-rb{{padding:1em 1.2em 1.2em}}
.hc-sc{{position:relative;height:3.6em;border-radius:.9em;background:#F7F1E8;border:1.5px dashed #D9CCB8;display:flex;align-items:center;justify-content:center;gap:.18em;overflow:hidden}}
.hc-sc s{{display:block;height:2.1em;background:#05080D;text-decoration:none}}
.hc-sc u{{position:absolute;left:6%;right:6%;height:2px;background:#C2341D;box-shadow:0 0 .8em .15em rgba(194,52,29,.7);animation:hcScan 1.4s ease-in-out infinite}}
.hc-rows{{height:11.6em;margin-top:.6em}}
.hc-row{{display:grid;grid-template-columns:2.5em minmax(0,1fr) auto;gap:.75em;align-items:center;padding:.6em 0;border-bottom:1px solid #EFE6D8}}
.hc-ic{{width:2.5em;height:2.5em;border-radius:.7em;display:flex;align-items:center;justify-content:center}}
.hc-ic svg{{width:1.3em;height:1.3em}}
.hc-nm{{display:flex;flex-direction:column;gap:.25em;min-width:0}}
.hc-nm b{{font-size:.86em;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.hc-nm span{{align-self:flex-start;font-size:.68em;font-weight:600;padding:.2em .6em;border-radius:99em;background:#DCEDEC;color:#0B5555}}
.hc-row>em{{font-style:normal;font-weight:700;font-size:.92em;font-variant-numeric:tabular-nums}}
.hc-tot{{display:flex;justify-content:space-between;align-items:center;padding-top:.8em}}
.hc-tot>span{{font-weight:600;color:#5E554C;font-size:.9em}}
.hc-tv{{position:relative;height:2.3em;width:9em}}
.hc-tv b{{position:absolute;right:0;top:0;font-weight:800;font-size:2em;letter-spacing:-.03em;font-variant-numeric:tabular-nums;line-height:1.15}}
.hc-btn{{position:relative;height:3.3em;margin-top:.8em}}
.hc-btn b{{position:absolute;inset:0;border-radius:.9em;display:flex;align-items:center;justify-content:center;gap:.5em;font-weight:700;color:#FFFFFF}}
.hc-btn svg{{width:1.1em;height:1.1em}}
.hc-ch{{background:#B4441A}}
.hc-pd{{background:#0E6B6B}}
.hc-ph{{position:absolute;left:21.6em;top:0;width:16em;height:33.5em;background:#0F0D0B;border-radius:2.7em;padding:.55em;z-index:2;box-shadow:0 4em 7em -2em rgba(0,0,0,.85),inset 0 0 0 1px rgba(255,255,255,.14),0 0 0 .14em #2B2520;transform:perspective(90em) rotateY(-11deg) rotateX(3deg)}}
.hc-scr{{position:relative;height:100%;border-radius:2.2em;background:#F7F1E8;overflow:hidden;color:#05080D}}
.hc-isl{{position:absolute;top:.6em;left:50%;width:5.2em;height:1.5em;margin-left:-2.6em;background:#000;border-radius:1em;z-index:6}}
.hc-sb{{position:absolute;top:.75em;left:1.5em;right:1.3em;display:flex;justify-content:space-between;font-size:.7em;font-weight:700;color:#FFFFFF;z-index:5}}
.hc-ah{{background:#0E6B6B;color:#FFFFFF;padding:3.1em 1.1em 1.2em}}
.hc-ah small{{display:block;font-size:.66em;color:#CDE5E4;font-weight:500}}
.hc-ah strong{{display:block;font-size:1.2em;margin-top:.35em;letter-spacing:-.02em}}
.hc-ah p{{margin:.8em 0 0;font-size:.68em;color:#CDE5E4}}
.hc-bal{{position:relative;height:2.6em;margin-top:.1em;border-radius:.6em}}
.hc-bal b{{position:absolute;left:0;top:0;font-size:2.2em;font-weight:800;letter-spacing:-.035em;font-variant-numeric:tabular-nums;line-height:1.15}}
.hc-tabs{{display:flex;gap:.4em;padding:.8em .8em .4em}}
.hc-tabs span{{font-size:.62em;font-weight:600;white-space:nowrap;padding:.55em .8em;border-radius:99em;border:1px solid #D9CCB8}}
.hc-tabs span:first-child{{background:#05080D;color:#FFFFFF;border-color:#05080D}}
.hc-ls{{margin:.3em .8em;background:#FFFFFF;border-radius:1em;border:1px solid #E6DBC9;overflow:hidden}}
.hc-li{{display:flex;justify-content:space-between;align-items:center;gap:.5em;padding:.7em .8em;border-bottom:1px solid #EFE7DA}}
.hc-li:last-child{{border-bottom:0}}
.hc-li span{{display:flex;flex-direction:column;gap:.2em;min-width:0}}
.hc-li b{{font-size:.68em;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
.hc-li small{{font-size:.6em;color:#6F6559}}
.hc-li em{{font-style:normal;font-size:.72em;font-weight:700;white-space:nowrap;font-variant-numeric:tabular-nums}}
.hc-li .up{{color:#0B5E3A}}.hc-li .dn{{color:#8A3313}}
.hc-li.hc-new{{background:#F6E7DA;max-height:4em;overflow:hidden}}
.hc-nt{{position:absolute;top:2.6em;left:.55em;right:.55em;z-index:7;background:rgba(5,8,13,.94);color:#FFFFFF;border-radius:1.1em;padding:.75em .8em;display:flex;gap:.6em;align-items:flex-start;box-shadow:0 1em 2em -.5em rgba(0,0,0,.5)}}
.hc-nt i{{flex-shrink:0;width:1.9em;height:1.9em;border-radius:.5em;background:#B4441A;display:flex;align-items:center;justify-content:center}}
.hc-nt i svg{{width:1.05em;height:1.05em}}
.hc-nt span{{display:flex;flex-direction:column;gap:.2em;min-width:0}}
.hc-nt small{{font-size:.58em;color:#CFC4B4;display:flex;justify-content:space-between}}
.hc-nt b{{font-size:.68em;font-weight:600;line-height:1.3}}
.hc-pay{{position:absolute;display:flex;align-items:center;gap:.65em;background:#FFFFFF;color:#05080D;border-radius:1.1em;padding:.6em 1em .6em .6em;z-index:3;box-shadow:0 1.6em 3em -1em rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.08)}}
.hc-pay i{{width:2.3em;height:2.3em;border-radius:.7em;background:#0E6B6B;color:#FFFFFF;font-style:normal;font-weight:800;font-size:.85em;display:flex;align-items:center;justify-content:center}}
.hc-pay span{{display:flex;flex-direction:column;gap:.15em}}
.hc-pay small{{font-size:.66em;color:#5E554C;font-weight:600}}
.hc-pay b{{font-size:.9em;color:#0B5E3A;font-variant-numeric:tabular-nums}}
.hc-p1{{left:0;top:33.2em}}.hc-p2{{left:11.6em;top:34.4em}}
.hc-dot{{position:absolute;left:0;top:0;width:1em;height:1em;margin:-.5em 0 0 -.5em;border-radius:50%;background:#F3B38F;box-shadow:0 0 1em .35em rgba(243,179,143,.85);z-index:8;opacity:0;pointer-events:none}}
.hc-bar{{position:absolute;left:22em;right:0;top:35.6em;display:flex;flex-direction:column;gap:.7em}}
.hc-trk{{height:2px;background:rgba(247,241,232,.14);border-radius:2px;overflow:hidden}}
.hc-trk i{{display:block;height:100%;background:linear-gradient(90deg,#B4441A,#F3B38F);transform-origin:left}}
.hc-cs{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35em .8em}}
.hc-cs span{{font-size:.72em;font-weight:600;color:#F7F1E8;display:flex;gap:.45em;white-space:nowrap}}
.hc-cs span::before{{content:attr(data-n);color:#F3B38F;font-variant-numeric:tabular-nums}}
/* animaciones (el estado base es el final: con «reducir movimiento» se ve la venta completa) */
.hc-r1{{animation:hcR1 {A}}}.hc-r2{{animation:hcR2 {A}}}.hc-r3{{animation:hcR3 {A}}}
.hc-t0{{opacity:0;animation:hcT0 {A}}}.hc-t1{{opacity:0;animation:hcT1 {A}}}.hc-t2{{opacity:0;animation:hcT2 {A}}}.hc-t3{{animation:hcT3 {A}}}
.hc-ch{{opacity:0;animation:hcCh {A}}}.hc-pd{{animation:hcPd {A}}}.hc-btn{{animation:hcPress {A}}}
.hc-d1{{animation:hcF1 {T}s ease-in-out infinite both}}.hc-d2{{animation:hcF2 {T}s ease-in-out infinite both}}.hc-d3{{animation:hcF3 {T}s ease-in-out infinite both}}
.hc-p1{{animation:hcP1 {A}}}.hc-p2{{animation:hcP2 {A}}}.hc-nt{{animation:hcN {A}}}.hc-new{{animation:hcNew {A}}}
.hc-b0{{opacity:0;animation:hcB0 {A}}}.hc-b1{{animation:hcB1 {A}}}.hc-bal{{animation:hcGlow {A}}}
.hc-trk i{{animation:hcFill {T}s linear infinite both}}
.hc-c1{{animation:hcC1 {T}s linear infinite both}}.hc-c2{{animation:hcC2 {T}s linear infinite both}}.hc-c3{{animation:hcC3 {T}s linear infinite both}}.hc-c4{{animation:hcC4 {T}s linear infinite both}}
.hc-ph{{animation:hcFloat 6s ease-in-out infinite}}
{KF}
@media (max-width:960px){{.hc-in{{grid-template-columns:minmax(0,1fr);gap:36px;padding:24px 16px 56px;min-height:0}}.hc-lead{{font-size:18px}}}}
@media (max-width:480px){{.hc-cta a{{flex:1 1 auto;justify-content:center}}}}
@media (prefers-reduced-motion:reduce){{.hc *,.hc-ph{{animation:none!important}}.hc-dot{{display:none}}.hc-trk i{{transform:none}}}}
</style>"""

ICON = {
    "lamp": '<path d="M8 3h8l3 8H5z"/><path d="M12 11v8"/><path d="M8 21h8"/>',
    "bowl": '<path d="M3 10h18a9 9 0 0 1-18 0z"/><path d="M9 6c0-1 1-2 3-2s3 1 3 2"/>',
    "shirt": '<path d="M8 3l4 3 4-3 5 4-3 4-2-1v10H8V10l-2 1-3-4z"/>',
}
MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>'
CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>'
BARS = "".join(f'<s style="width:{w/16:.3f}em"></s>' for w in [3, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1])

L = {
    "en": dict(
        eb="For antique malls, flea markets and vendor malls",
        h1="Your mall, off the notebook. <em>Your vendors, never guessing.</em>",
        lead="Every sale lands in its vendor's balance, booth rent comes out on its own, and each vendor sees their numbers in My Booth, on their phone. No one has to ask “did my stuff sell?” again.",
        cta1="Start free 14-day trial", cta2="Try it",
        trust="English and Spanish · Dollars and pesos · From $79/month",
        aria="Example sale in neuri.bazar: the register scans three items from three different booths and charges $140. Each booth's share lands in its vendor's balance, and Rosa, the vendor in booth 12, gets an email alert and sees her balance go up in My Booth on her phone.",
        tag="Live example · sample data", reg="Register 1 · Desert Rose Antiques", cashier="Cashier: Anna",
        items=[("lamp", "#F3DCCD", "#8A3313", "Brass table lamp", "Booth 7 · Jim", "$85.00"),
               ("bowl", "#DCEDEC", "#0B5555", "Depression glass bowl", "Booth 12 · Rosa", "$22.00"),
               ("shirt", "#F5E6B8", "#7A5A1E", "Vintage denim jacket", "Booth 3 · Linda", "$33.00")],
        total="Total", tots=["$0.00", "$85.00", "$107.00", "$140.00"], charge="Charge", paid="Paid · split by booth",
        mall="Desert Rose · My Booth", hi="Hi, Rosa", owe="We owe you", bal=["$412.50", "$434.50"],
        tabs=["Activity", "My sales", "My items"],
        new=("Sale · Depression glass bowl", "Today", "+$22.00"),
        rows=[("Sale · Fiesta pitcher", "Tue", "+$38.00", "up"), ("Booth rent · automatic", "Mon", "−$20.00", "dn"), ("Sale · Brass candlesticks", "Sat", "+$64.00", "up")],
        nt_from="neuri.bazar · email", nt_when="now", nt="You sold Depression glass bowl · +$22.00 to your balance",
        p1=("7", "Booth 7 · Jim", "+$85.00"), p2=("3", "Booth 3 · Linda", "+$33.00"),
        ch=["Scan tags", "Charge once", "Split by booth", "Vendor alerted"], time="9:41",
    ),
    "es": dict(
        eb="Para mercaditos, bazares y antique malls",
        h1="Tu bazar, sin libreta. <em>Tus vendedores, sin dudas.</em>",
        lead="Cada venta llega al saldo de su vendedor, la renta del puesto se descuenta sola y cada quien ve sus números en Mi Puesto, desde el celular. Nadie te vuelve a preguntar «¿ya se vendió lo mío?».",
        cta1="Prueba gratis 14 días", cta2="Pruébalo",
        trust="Español e inglés · Pesos y dólares · Desde $499 MXN o US$79 al mes",
        aria="Venta de ejemplo en neuri.bazar: la caja escanea tres piezas de tres puestos distintos y cobra $1,400. Lo de cada puesto llega al saldo de su vendedor, y Rosa, del puesto 12, recibe un aviso por correo y ve subir su saldo en Mi Puesto desde el celular.",
        tag="Ejemplo en vivo · datos de ejemplo", reg="Caja 1 · Bazar Las Palmas", cashier="Cajera: Ana",
        items=[("lamp", "#F3DCCD", "#8A3313", "Lámpara de latón", "Puesto 7 · Jorge", "$850.00"),
               ("bowl", "#DCEDEC", "#0B5555", "Tazón de vidrio prensado", "Puesto 12 · Rosa", "$220.00"),
               ("shirt", "#F5E6B8", "#7A5A1E", "Chamarra de mezclilla", "Puesto 3 · Lupita", "$330.00")],
        total="Total", tots=["$0.00", "$850.00", "$1,070.00", "$1,400.00"], charge="Cobrar", paid="Pagado · repartido por puesto",
        mall="Las Palmas · Mi Puesto", hi="Hola, Rosa", owe="Te debemos", bal=["$4,125.00", "$4,345.00"],
        tabs=["Movimientos", "Mis ventas", "Mis piezas"],
        new=("Venta · Tazón de vidrio prensado", "Hoy", "+$220.00"),
        rows=[("Venta · Jarra de barro", "Mar", "+$380.00", "up"), ("Renta · automática", "Lun", "−$200.00", "dn"), ("Venta · Candeleros de latón", "Sáb", "+$640.00", "up")],
        nt_from="neuri.bazar · correo", nt_when="ahora", nt="Vendiste Tazón de vidrio prensado · +$220.00 a tu saldo",
        p1=("7", "Puesto 7 · Jorge", "+$850.00"), p2=("3", "Puesto 3 · Lupita", "+$330.00"),
        ch=["Escanea", "Cobra una vez", "Reparte por puesto", "Avisa al vendedor"], time="9:41",
    ),
}


def hero(c):
    rows = "".join(
        f'<div class="hc-row hc-r{i+1}"><span class="hc-ic" style="background:{bg}"><svg viewBox="0 0 24 24" fill="none" stroke="{fg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICON[ic]}</svg></span>'
        f'<span class="hc-nm"><b>{nm}</b><span>{bt}</span></span><em>{pr}</em></div>'
        for i, (ic, bg, fg, nm, bt, pr) in enumerate(c["items"]))
    tots = "".join(f'<b class="hc-t{i}">{v}</b>' for i, v in enumerate(c["tots"]))
    lis = "".join(f'<div class="hc-li"><span><b>{a}</b><small>{d}</small></span><em class="{k}">{m}</em></div>' for a, d, m, k in c["rows"])
    n = c["new"]
    chs = "".join(f'<span class="hc-c{i+1}" data-n="{i+1:02d}">{t}</span>' for i, t in enumerate(c["ch"]))
    pay = lambda k, p: f'<div class="hc-pay hc-{k}"><i>{p[0]}</i><span><small>{p[1]}</small><b>{p[2]}</b></span></div>'
    return f"""<section id="inicio" class="hc">
<div class="hc-in">
<div class="hc-tx">
<span class="hc-eb b-rise"><i></i>{c["eb"]}</span>
<h1 class="b-rise b-rise-2">{c["h1"]}</h1>
<p class="hc-lead b-rise b-rise-3">{c["lead"]}</p>
<div class="hc-cta b-rise b-rise-4">
<a class="hc-p b-btn" href="#prueba">{c["cta1"]}</a>
<a class="hc-s" href="#simula"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>{c["cta2"]}</a>
</div>
<p class="hc-trust">{c["trust"]}</p>
</div>
<div class="hc-wrap">
<div class="hc-st" role="img" aria-label="{c["aria"]}">
<span class="hc-tag"><i></i>{c["tag"]}</span>
<div class="hc-reg">
<div class="hc-rh"><b>{c["reg"]}</b><span>{c["cashier"]}</span></div>
<div class="hc-rb">
<div class="hc-sc">{BARS}<u></u></div>
<div class="hc-rows">{rows}</div>
<div class="hc-tot"><span>{c["total"]}</span><span class="hc-tv">{tots}</span></div>
<div class="hc-btn"><b class="hc-ch">{c["charge"]}</b><b class="hc-pd">{CHECK}{c["paid"]}</b></div>
</div>
</div>
<div class="hc-ph"><div class="hc-scr">
<span class="hc-isl"></span><span class="hc-sb"><span>{c["time"]}</span><span>●●● ▮</span></span>
<div class="hc-nt"><i>{MAIL}</i><span><small><span>{c["nt_from"]}</span><span>{c["nt_when"]}</span></small><b>{c["nt"]}</b></span></div>
<div class="hc-ah"><small>{c["mall"]}</small><strong>{c["hi"]}</strong><p>{c["owe"]}</p>
<div class="hc-bal"><b class="hc-b0">{c["bal"][0]}</b><b class="hc-b1">{c["bal"][1]}</b></div></div>
<div class="hc-tabs">{"".join(f"<span>{t}</span>" for t in c["tabs"])}</div>
<div class="hc-ls"><div class="hc-li hc-new"><span><b>{n[0]}</b><small>{n[1]}</small></span><em class="up">{n[2]}</em></div>{lis}</div>
</div></div>
{pay("p1", c["p1"])}{pay("p2", c["p2"])}
<span class="hc-dot hc-d1"></span><span class="hc-dot hc-d2"></span><span class="hc-dot hc-d3"></span>
<div class="hc-bar"><div class="hc-trk"><i></i></div><div class="hc-cs">{chs}</div></div>
</div>
</div>
</div>
</section>"""


SEC = re.compile(r'<section id="inicio".*?</section>', re.S)
for rel, lang in [("en/index.html", "en"), ("bazar/index.html", "es")]:
    p = ROOT / rel
    s = p.read_text(encoding="utf-8")
    new = hero(L[lang])
    s, k = SEC.subn(lambda m: new, s)
    assert k == 2, (rel, k)
    s = re.sub(r'<style id="hero-cine">.*?</style>\n?', "", s, flags=re.S)
    s = s.replace("</head>", CSS + "\n</head>", 1)
    p.write_text(s, encoding="utf-8")
    print(rel, "OK")
