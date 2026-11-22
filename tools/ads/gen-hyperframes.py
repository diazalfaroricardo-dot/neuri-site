#!/usr/bin/env python3
"""Generates the neuri.bots HyperFrames ad projects (v1, v2, v3), 1080x1920, 30 fps."""
import json, os, random, shutil, textwrap

ROOT = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1920

FONTS = """
@font-face{font-family:'Geist';src:url('assets/fonts/Geist-Variable.woff2') format('woff2');font-weight:100 900;font-style:normal}
"""

BASE = """
#root{position:absolute;inset:0;overflow:hidden;font-family:'Geist',sans-serif;color:#0F1A14;
  background:radial-gradient(900px 900px at 92% 6%, rgba(143,224,180,.42), rgba(143,224,180,0) 70%),
             radial-gradient(700px 700px at 0% 100%, rgba(255,200,87,.18), rgba(255,200,87,0) 70%), #F5F7F5}
.net{position:absolute;inset:0;pointer-events:none}
.kicker{position:absolute;left:132px;top:300px;font:500 34px 'Geist';letter-spacing:.02em;color:#1F8A5B;
  background:rgba(143,224,180,.35);padding:12px 22px;border-radius:999px}
.big{position:absolute;left:132px;right:240px;font-weight:900;letter-spacing:-.045em;line-height:.98}
.w{display:inline-block}
.mint{color:#1F8A5B}.peach{color:#B4581F}
.phone{position:absolute;left:140px;width:700px;height:840px;border-radius:78px;background:#0F1A14;padding:22px;
  box-shadow:0 40px 80px rgba(15,26,20,.22),0 8px 20px rgba(15,26,20,.12)}
.screen{position:relative;width:100%;height:100%;border-radius:64px;background:#FFFFFF;overflow:hidden}
.chathead{display:flex;align-items:center;gap:20px;padding:44px 36px 22px;border-bottom:2px solid #E9EFEB}
.av{width:78px;height:78px;border-radius:50%;background:linear-gradient(135deg,#FFC857,#FF8A7A)}
.av.b{background:linear-gradient(135deg,#1F8A5B,#8FE0B4)}
.who{font:700 34px 'Geist'}.who small{display:block;font:500 28px 'Geist';color:#5C6963;margin-top:4px}
.msgs{position:absolute;left:0;right:0;top:160px;bottom:0;padding:28px 30px;display:flex;flex-direction:column;gap:18px}
.bub{max-width:80%;padding:22px 28px;border-radius:36px;font:500 34px/1.28 'Geist'}
.bub.in{align-self:flex-start;background:#EEF1EF;border-bottom-left-radius:12px}
.bub.out{align-self:flex-end;background:#1F8A5B;color:#fff;border-bottom-right-radius:12px}
.meta{font:500 28px 'Geist';color:#646F69;margin-top:-10px}
.meta.r{align-self:flex-end}
.chip{display:inline-flex;align-items:center;gap:12px;font:700 34px 'Geist';padding:16px 28px;border-radius:999px;background:#8FE0B4;color:#0A2417}
.typing{align-self:flex-end;background:#E6EDE9;border-radius:40px;padding:26px 30px;display:flex;gap:12px}
.typing i{width:16px;height:16px;border-radius:50%;background:#1F8A5B;display:block}
"""

def net_svg(seed, w=W, h=H, n=34, region=(0.45, 0.0, 1.0, 0.45), color="#1F8A5B", op=0.5):
    r = random.Random(seed)
    x0, y0, x1, y1 = region
    pts = [(r.uniform(x0 * w, x1 * w), r.uniform(y0 * h, y1 * h)) for _ in range(n)]
    lines, dots = [], []
    lim = (0.2 * w) ** 2
    for i in range(n):
        for j in range(i + 1, n):
            dx, dy = pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]
            if dx * dx + dy * dy < lim:
                lines.append(f'<line x1="{pts[i][0]:.0f}" y1="{pts[i][1]:.0f}" x2="{pts[j][0]:.0f}" y2="{pts[j][1]:.0f}"/>')
    for x, y in pts:
        dots.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r.choice([3,4,5,6])}"/>')
    return (f'<svg class="net" data-layout-ignore viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'<g stroke="{color}" stroke-opacity="{op*0.55}" stroke-width="2">{"".join(lines)}</g>'
            f'<g fill="{color}" fill-opacity="{op}">{"".join(dots)}</g></svg>')

def words(text, cls=""):
    out = []
    mode = None
    for line in text.split("\n"):
        ws = []
        for w in line.split(" "):
            if not w: continue
            m = mode
            if w.startswith("*"): m = mode = "mint"; w = w[1:]
            elif w.startswith("~"): m = mode = "peach"; w = w[1:]
            end = False
            if w.endswith("*") or w.endswith("~"): w = w[:-1]; end = True
            c = (cls + " " + m).strip() if m else cls
            ws.append(f'<span class="w {c}">{w}</span>')
            if end: mode = None
        out.append(" ".join(ws))
    return "<br>".join(out)

def scene(sid, body, css, js, dur):
    return f"""<template>
  <style>{FONTS}{BASE}{css}</style>
  <div id="root" data-composition-id="{sid}" data-width="{W}" data-height="{H}">
{body}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
{js}
    window.__timelines["{sid}"] = tl;
  </script>
</template>
"""

EXIT = lambda sel, at: f'    tl.to("{sel}", {{ opacity: 0, filter: "blur(10px)", duration: 0.2, ease: "power3.in" }}, {at});'

def wordin(sel, at, stagger=0.08):
    return (f'    tl.fromTo("{sel}", {{ opacity: 0, filter: "blur(8px)", y: 18 }}, '
            f'{{ opacity: 1, filter: "blur(0px)", y: 0, duration: 0.32, ease: "expo.out", stagger: {stagger} }}, {at});')

# ------------------------------------------------------------------ END CARD (shared)
def endcard(sid, line1, line2, seed):
    css = """
  .logo{position:absolute;left:132px;top:300px;display:flex;align-items:center;gap:22px;font:800 64px 'Geist';letter-spacing:-.03em}
  .logo i{width:62px;height:62px;border-radius:50%;background:#1F8A5B;position:relative;display:block}
  .logo i:after{content:"";position:absolute;inset:18px;border-radius:50%;background:#8FE0B4}
  .ec1{top:450px;font-size:96px}
  .ec2{position:absolute;left:132px;right:240px;top:790px;font:500 44px/1.35 'Geist';color:#36443D}
  .cta{position:absolute;left:132px;top:990px;display:flex;flex-direction:column;align-items:flex-start;gap:22px}
  .btn{font:700 50px 'Geist';background:#0F1A14;color:#fff;padding:32px 52px;border-radius:999px}
  .url{font:500 38px 'Geist';color:#1F8A5B}
"""
    body = f"""    {net_svg(seed, region=(0.0, 0.62, 1.0, 1.0), op=0.55)}
    <div class="logo" id="{sid}-logo"><i></i><span>neuri.bots</span></div>
    <div class="big ec1" id="{sid}-l1">{words(line1, sid + "-w")}</div>
    <div class="ec2" id="{sid}-l2">{line2}</div>
    <div class="cta" id="{sid}-cta"><span class="btn">Pruébalo gratis →</span><span class="url">neuri.tech/bots</span></div>"""
    js = "\n".join([
        f'    tl.fromTo("#{sid}-logo", {{ opacity: 0, x: -30, filter: "blur(6px)" }}, {{ opacity: 1, x: 0, filter: "blur(0px)", duration: 0.5, ease: "expo.out" }}, 0.05);',
        wordin(f"#{sid}-l1 .w", 0.2, 0.07),
        f'    tl.fromTo("#{sid}-l2", {{ opacity: 0, y: 24 }}, {{ opacity: 1, y: 0, duration: 0.5, ease: "power4.out" }}, 0.75);',
        f'    tl.fromTo("#{sid}-cta", {{ opacity: 0, scale: 0.92 }}, {{ opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)" }}, 1.0);',
        f'    tl.fromTo("#{sid}-cta .btn", {{ boxShadow: "0 0 0 0 rgba(31,138,91,.0)" }}, {{ boxShadow: "0 0 0 22px rgba(31,138,91,.18)", duration: 0.5, ease: "power2.out" }}, 1.6);',
    ])
    return scene(sid, body, css, js, 3)

# ------------------------------------------------------------------ V1: 2:14 a. m.
def v1():
    sc = {}
    notes = [("Ana", "¿Todavía tienes la talla M? 🙏"), ("Luis", "¿Cuánto con envío a Culiacán?"), ("Sofi", "Hola, ¿sigue disponible?")]
    cards = "".join(f'<div class="nt" id="v1a-n{i}"><span class="ap"></span><div><b>{n}</b><span>{t}</span></div><em>ahora</em></div>' for i, (n, t) in enumerate(notes))
    css = """
  .lock{position:absolute;inset:0;background:radial-gradient(800px 900px at 50% 20%, #24362C 0%, #0F1A14 70%)}
  .time{position:absolute;left:132px;right:240px;top:300px;text-align:center;color:#F5F7F5;font:400 200px 'Geist';letter-spacing:-.05em}
  .date{position:absolute;left:132px;right:240px;top:540px;text-align:center;color:#B9C6BF;font:500 38px 'Geist'}
  .stack{position:absolute;left:132px;right:240px;top:620px;display:flex;flex-direction:column;gap:22px}
  .nt{display:flex;align-items:center;gap:20px;background:rgba(245,247,245,.92);border-radius:36px;padding:22px 26px}
  .nt .ap{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#1F8A5B,#8FE0B4);flex:none}
  .nt b{display:block;font:700 32px 'Geist'} .nt span{font:500 30px/1.3 'Geist';color:#36443D} .nt em{margin-left:auto;font:500 28px 'Geist';color:#646F69;font-style:normal;align-self:flex-start}
  .hook{position:absolute;left:132px;right:240px;top:1110px;color:#F5F7F5;font:900 76px/1 'Geist';letter-spacing:-.04em}
  .hook .mint{color:#8FE0B4}
"""
    body = f"""    <div class="lock"></div>
    <div class="date" id="v1a-date">sábado</div>
    <div class="time" id="v1a-time">2:14</div>
    <div class="stack">{cards}</div>
    <div class="hook" id="v1a-hook">{words("3 clientes preguntando.\n*Tú, dormido.*")}</div>"""
    js = "\n".join([
        '    tl.fromTo("#v1a-n0", { opacity: 1, y: 0 }, { opacity: 1, y: 0, duration: 0.01 }, 0);',
        '    tl.fromTo("#v1a-n1", { opacity: 0, y: -60, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "expo.out" }, 0.55);',
        '    tl.fromTo("#v1a-n2", { opacity: 0, y: -60, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "expo.out" }, 1.05);',
        '    tl.fromTo("#v1a-hook .w", { opacity: 0.25 }, { opacity: 1, duration: 0.12, stagger: 0.07, ease: "none" }, 0.1);',
        '    tl.fromTo("#v1a-time", { scale: 1 }, { scale: 0.94, duration: 2.6, ease: "power2.inOut" }, 0.4);',
        EXIT("#root > *", 3.0),
    ])
    sc["v1a"] = (scene("v1a", body, css, js, 3.2), 3.2)

    css = """
  .phone{top:470px}
  .label{position:absolute;left:132px;right:240px;top:300px;font:900 72px/1.02 'Geist';letter-spacing:-.04em}
  .sold{align-self:flex-end}
  #v1b-m2{margin-top:-90px}
"""
    body = f"""    {net_svg(5, region=(0.0, 0.66, 1.0, 1.0), op=0.45)}
    <div class="phone" id="v1b-phone"><div class="screen">
      <div class="chathead"><div class="av"></div><div class="who">Ana<small>Instagram · ahora</small></div></div>
      <div class="msgs">
        <div class="bub in" id="v1b-m1">¿Todavía tienes la talla M? 🙏</div>
        <div class="typing" id="v1b-ty"><i></i><i></i><i></i></div>
        <div class="bub out" id="v1b-m2">¡Sí! Talla M en negro, $480 con envío. ¿Te la aparto? 🖤</div>
        <div class="meta r" id="v1b-t2">2:14 a. m. · al instante</div>
        <div class="bub in" id="v1b-m3">¡Sí! Apártamela 🙌</div>
        <div class="sold" id="v1b-sold"><span class="chip">✓ Apartado</span></div>
      </div></div></div>
    <div class="label" id="v1b-label">{words("Contestó *solo.*\nA las 2 a. m.")}</div>"""
    js = "\n".join([
        '    tl.fromTo("#v1b-phone", { opacity: 0, y: 120, scale: .94, filter: "blur(10px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, 0);',
        '    tl.fromTo("#v1b-m1", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, 0.25);',
        '    tl.fromTo("#v1b-ty", { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.6)" }, 0.6);',
        '    tl.fromTo("#v1b-ty i", { y: 0 }, { y: -10, duration: 0.18, ease: "power2.out", stagger: { each: 0.08, yoyo: true, repeat: 3 } }, 0.65);',
        '    tl.to("#v1b-ty", { opacity: 0, duration: 0.12, ease: "power2.in" }, 1.25);',
        '    tl.fromTo("#v1b-m2", { opacity: 0, y: 30, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.3)" }, 1.32);',
        '    tl.fromTo("#v1b-t2", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 1.6);',
        '    tl.fromTo("#v1b-m3", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, 2.35);',
        '    tl.fromTo("#v1b-sold", { opacity: 0, scale: .5 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, 2.9);',
        wordin("#v1b-label .w", 0.1, 0.09),
        EXIT("#root > *", 4.4),
    ])
    sc["v1b"] = (scene("v1b", body, css, js, 4.6), 4.6)

    css = """
  .b1{top:340px;font-size:120px}
  .sub{position:absolute;left:132px;right:240px;top:900px;font:500 46px/1.35 'Geist';color:#36443D}
"""
    body = f"""    {net_svg(9, op=0.5)}
    <div class="big b1" id="v1c-t">{words("Tú dormías.\nTu *Instagram,*\n*no.*")}</div>
    <div class="sub" id="v1c-s">Contesta lo que tú contestarías, a cualquier hora.</div>"""
    js = "\n".join([
        wordin("#v1c-t .w", 0.05, 0.11),
        '    tl.fromTo("#v1c-s", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power4.out" }, 0.9);',
        EXIT("#root > *", 3.2),
    ])
    sc["v1c"] = (scene("v1c", body, css, js, 3.4), 3.4)
    sc["v1d"] = (endcard("v1d", "Que tu negocio\n*nunca deje en visto.*", "Instagram, Messenger y WhatsApp, 24/7.", 31), 3.8)
    return sc

# ------------------------------------------------------------------ V2: ¿Cuánto tardaste?
def v2():
    sc = {}
    css = """
  .q{top:390px;font-size:92px}
  .slot{position:absolute;left:132px;right:240px;top:840px;height:160px;overflow:hidden}
  .slot div{position:absolute;left:0;top:0;font:900 140px/160px 'Geist';letter-spacing:-.045em;color:#B4581F}
  .hl{position:absolute;left:132px;top:1010px;height:14px;width:0;background:#FFC857;border-radius:7px}
"""
    opts = ["5 minutos", "1 hora", "mañana"]
    slot = "".join(f'<div id="v2a-o{i}">{o}</div>' for i, o in enumerate(opts))
    body = f"""    {net_svg(13, op=0.5)}
    <div class="kicker" id="v2a-k">pregunta honesta</div>
    <div class="big q" id="v2a-q">{words("¿Cuánto tardaste en contestar tu último mensaje?")}</div>
    <div class="slot" data-layout-allow-overflow>{slot}</div><div class="hl" id="v2a-hl"></div>"""
    js = ['    tl.fromTo("#v2a-q .w", { opacity: 0.22 }, { opacity: 1, duration: 0.12, stagger: 0.07, ease: "none" }, 0.05);',
          '    tl.fromTo("#v2a-k", { opacity: 1 }, { opacity: 1, duration: 0.01 }, 0);']
    t = 0.9
    for i in range(3):
        js.append(f'    tl.fromTo("#v2a-o{i}", {{ yPercent: 100, opacity: 0, filter: "blur(6px)" }}, {{ yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.28, ease: "expo.out" }}, {t:.2f});')
        if i < 2:
            js.append(f'    tl.to("#v2a-o{i}", {{ yPercent: -100, opacity: 0, filter: "blur(6px)", duration: 0.22, ease: "power3.in" }}, {t+0.55:.2f});')
        t += 0.62
    js.append('    tl.fromTo("#v2a-hl", { width: 0 }, { width: 560, duration: 0.4, ease: "power4.out" }, 2.4);')
    js.append(EXIT("#root > *", 3.1))
    sc["v2a"] = (scene("v2a", body, css, "\n".join(js), 3.3), 3.3)

    css = """
  .phone{top:460px}
  .clock{position:absolute;right:50px;top:50px;font:500 32px 'Geist';color:#646F69}
  .seen{align-self:flex-end;font:500 28px 'Geist';color:#646F69}
  .bub.lost{background:#FF8A7A33;color:#6B1E14}
  .label{position:absolute;left:132px;right:240px;top:300px;font:900 66px/1.04 'Geist';letter-spacing:-.04em}
"""
    body = f"""    <div class="phone" id="v2b-phone"><div class="screen">
      <div class="chathead"><div class="av"></div><div class="who">Mariana<small>Messenger</small></div><div class="clock" id="v2b-clk">9:02</div></div>
      <div class="msgs">
        <div class="bub in" id="v2b-m1">Hola, ¿precio del juego de sala? 🛋️</div>
        <div class="meta" id="v2b-t1">9:02 a. m.</div>
        <div class="seen" id="v2b-seen">Visto</div>
        <div class="bub in lost" id="v2b-m2">Ya no, gracias. Ya compré en otro lado.</div>
        <div class="meta" id="v2b-t2">10:37 a. m.</div>
      </div></div></div>
    <div class="label" id="v2b-label">{words("Tardaste *1 h 35 min.*\nElla, ~5 minutos~ en irse.")}</div>"""
    js = "\n".join([
        '    tl.fromTo("#v2b-phone", { opacity: 0, y: 120, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, 0);',
        '    tl.fromTo(["#v2b-m1","#v2b-t1"], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out", stagger: 0.1 }, 0.3);',
        '    tl.fromTo("#v2b-seen", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.9);',
        '    const clk = { v: 0 }; const steps = ["9:02","9:15","9:31","9:48","10:05","10:22","10:37"];',
        '    tl.fromTo(clk, { v: 0 }, { v: 6, duration: 1.1, ease: "power2.in", onUpdate: () => { document.querySelector("#v2b-clk").textContent = steps[Math.round(clk.v)]; } }, 1.1);',
        '    tl.fromTo(["#v2b-m2","#v2b-t2"], { opacity: 0, y: 30, x: -10 }, { opacity: 1, y: 0, x: 0, duration: 0.4, ease: "expo.out", stagger: 0.1 }, 2.3);',
        '    tl.fromTo("#v2b-m2", { x: 0 }, { x: 0, keyframes: { x: [0, -10, 9, -6, 4, 0] }, duration: 0.4, ease: "none" }, 2.75);',
        wordin("#v2b-label .w", 2.4, 0.07),
        EXIT("#root > *", 4.9),
    ])
    sc["v2b"] = (scene("v2b", body, css, js, 5.1), 5.1)
    sc["v2c"] = (endcard("v2c", "neuri.bots contesta\n*en segundos.*", "Instagram, Messenger y WhatsApp, 24/7.", 41), 3.8)
    return sc

# ------------------------------------------------------------------ V3: ¿Sigue disponible?
def v3():
    sc = {}
    r = random.Random(3)
    n = 11
    bubs = []
    for i in range(n):
        x = r.choice([110, 160, 220, 280, 340])
        y = 300 + i * 82
        rot = r.uniform(-4, 4)
        bubs.append(f'<div class="qb" id="v3a-b{i}" style="left:{x}px;top:{y}px;--r:{rot:.1f}deg">¿Sigue disponible?</div>')
    css = """
  .qb{position:absolute;font:600 44px 'Geist';background:#FFFFFF;padding:22px 34px;border-radius:40px;border-bottom-left-radius:10px;
     box-shadow:0 10px 30px rgba(15,26,20,.10)}
  .count{position:absolute;right:190px;top:1080px;font:900 150px 'Geist';letter-spacing:-.05em;color:#B4581F}
"""
    body = f"""    {"".join(bubs)}
    <div class="count" id="v3a-c" data-layout-allow-overlap>×11</div>"""
    js = [f'    tl.fromTo("#v3a-b0", {{ opacity: 1, scale: 1, rotation: 0 }}, {{ opacity: 1, scale: 1, rotation: 0, duration: 0.01 }}, 0);']
    for i in range(1, n):
        a0 = 1 if i < 3 else 0
        js.append(f'    tl.fromTo("#v3a-b{i}", {{ opacity: {a0}, scale: {1 if a0 else .6}, rotation: 0 }}, {{ opacity: 1, scale: 1, rotation: {r.uniform(-4,4):.1f}, duration: 0.3, ease: "back.out(1.8)" }}, {0.0 if i < 3 else 0.12 + (i-2)*0.24:.2f});')
    js.append('    tl.fromTo("#v3a-c", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.6)" }, 2.3);')
    js.append(EXIT("#root > *", 3.3))
    sc["v3a"] = (scene("v3a", body, css, "\n".join(js), 3.5), 3.5)

    css = """
  .b1{top:420px;font-size:124px}
"""
    body = f"""    {net_svg(17, op=0.45)}
    <div class="big b1" id="v3b-t">{words("La misma pregunta.\n~Todo~ ~el~ ~día.~")}</div>"""
    js = "\n".join([wordin("#v3b-t .w", 0.05, 0.12), EXIT("#root > *", 1.9)])
    sc["v3b"] = (scene("v3b", body, css, js, 2.1), 2.1)

    pairs = "".join(f'<div class="pr"><div class="bub in" id="v3c-q{i}">¿Sigue disponible?</div><div class="bub out" id="v3c-a{i}">{a}</div></div>'
                    for i, a in enumerate(["¡Sí! Te paso precio y fotos 👇", "¡Sí! Quedan 2. ¿Te aparto una?", "¡Sí! Envío a todo México 📦"]))
    css = """
  .wrapc{position:absolute;left:132px;right:240px;top:300px;display:flex;flex-direction:column;gap:34px}
  .pr{display:flex;flex-direction:column;gap:14px}
  .bub{font-size:36px}
  .tagl{position:absolute;left:132px;right:240px;top:1000px;font:900 84px/1 'Geist';letter-spacing:-.045em}
"""
    body = f"""    {net_svg(23, region=(0.0, 0.72, 1.0, 1.0), op=0.45)}
    <div class="wrapc">{pairs}</div>
    <div class="tagl" id="v3c-t">{words("Le enseñas *una vez.*\nContesta *siempre.*")}</div>"""
    js = []
    for i in range(3):
        js.append(f'    tl.fromTo("#v3c-q{i}", {{ opacity: 0, x: -30 }}, {{ opacity: 1, x: 0, duration: 0.3, ease: "expo.out" }}, {0.05 + i*0.45:.2f});')
        js.append(f'    tl.fromTo("#v3c-a{i}", {{ opacity: 0, x: 40, scale: .92 }}, {{ opacity: 1, x: 0, scale: 1, duration: 0.35, ease: "back.out(1.4)" }}, {0.25 + i*0.45:.2f});')
    js.append(wordin("#v3c-t .w", 1.45, 0.08))
    js.append(EXIT("#root > *", 3.3))
    sc["v3c"] = (scene("v3c", body, css, "\n".join(js), 3.5), 3.5)
    sc["v3d"] = (endcard("v3d", "Deja de contestar\n*lo mismo.*", "Instagram, Messenger y WhatsApp, 24/7.", 51), 3.8)
    return sc

def build(name, scenes, title):
    d = os.path.join(ROOT, name)
    if os.path.exists(d): shutil.rmtree(d)
    os.makedirs(os.path.join(d, "compositions")); os.makedirs(os.path.join(d, "assets"))
    shutil.copytree(os.path.join(ROOT, "kit", "fonts"), os.path.join(d, "assets", "fonts"))
    shutil.copy(os.path.join(ROOT, "kit", "gsap.min.js"), os.path.join(d, "assets", "gsap.min.js"))
    hosts, t = [], 0.0
    for i, (sid, (html, dur)) in enumerate(scenes.items()):
        open(os.path.join(d, "compositions", sid + ".html"), "w").write(html)
        hosts.append(f'      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{t:.2f}" data-duration="{dur}" data-track-index="1" data-track-kind="graphics" data-width="{W}" data-height="{H}"></div>')
        t += dur
    total = round(t, 2)
    idx = f"""<!doctype html>
<html lang="es" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <title>{title}</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: {W}px; height: {H}px; overflow: hidden; background: #F5F7F5; }}
      #root {{ position: relative; width: 100%; height: 100%; }}
      #ground {{ position: absolute; inset: 0; background: #F5F7F5; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total}" data-width="{W}" data-height="{H}">
      <div id="ground"></div>
{chr(10).join(hosts)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""
    open(os.path.join(d, "index.html"), "w").write(idx)
    json.dump({"$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": {"blocks": "compositions", "assets": "assets"}, "authoringSkill": "hyperframes"}, open(os.path.join(d, "hyperframes.json"), "w"), indent=2)
    return total

if __name__ == "__main__":
    for name, fn, title in [("v1", v1, "neuri.bots — 2:14 a. m."), ("v2", v2, "neuri.bots — ¿Cuánto tardaste?"), ("v3", v3, "neuri.bots — ¿Sigue disponible?")]:
        print(name, build(name, fn(), title), "s")
