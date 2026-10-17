#!/usr/bin/env python3
"""Genera la landing de neuri.marketing: /marketing/index.html (ES) y /en/marketing/index.html (EN).
Uso: python3 scripts/marketing-landing.py   (desde la raíz de neuri-site)
Regla de Ricardo: sin claims falsos. Toda función del producto dice «Pronto»; solo las herramientas
gratis (que ya existen en la app) se marcan como disponibles. Sin precios hasta que él los apruebe."""
import html, json, pathlib

APP = "https://neuri-marketing-production.up.railway.app"
ROOT = pathlib.Path(__file__).resolve().parent.parent
e = html.escape

C = {
  "es": dict(
    path="/marketing/", other="/en/marketing/", other_label="English", other_lang="en", locale="es_MX",
    title="Neuri Marketing — Tus redes con IA, aprobadas por ti | Neuri",
    desc="Próximamente: Neuri Marketing prepara los posts y reels del mes de tu negocio con tu estilo y tú los apruebas con un toque. Lista de espera abierta.",
    skip="Saltar al contenido", nav=[("#como","Cómo funciona"),("#funciones","Funciones"),("#gratis","Gratis")], nav_cta="Entrar a la lista",
    pill="Pronto · lista de espera abierta",
    h1a="Tus redes, al día.|Tú solo ", h1b="apruebas.",
    lead="Neuri Marketing aprende el estilo de tu negocio, arma los posts y reels del mes y te los entrega listos. Tú revisas, apruebas con un toque y se publican. Lo estamos construyendo: apúntate y entras primero.",
    cta1="Quiero entrar primero", cta2="Autodiagnóstico gratis",
    trust=["Nada se publica sin tu visto bueno","Instagram y Facebook primero","Para negocios en México y EE. UU."],
    ig=dict(handle="cafe.ejemplo", name="Café de ejemplo", bio="Café de especialidad · Pide por DM", posts="publicaciones", fol="seguidores", fing="seguidos",
            tiles=["<em>Latte de temporada</em>","Lunes de reel","<em>3 tips</em> para tu mañana","Nuevo en la vitrina","<em>¿Café o té?</em>","Detrás de la barra","Así nace tu café","<em>Hoy</em> abrimos a las 8","Te esperamos ♥"]),
    ap_t="Tu semana está lista", ap_s="3 posts · 1 reel · con tus fotos", ap_b="Aprobar todo",
    cal_t="Mié 10:30", cal_s="Carrusel programado", note="Ilustración del producto en construcción",
    ribbon=["Cafeterías","Bazares","Restaurantes","Boutiques","Salones de belleza","Panaderías","Tiendas","Servicios"],
    how_eb="Cómo va a funcionar", how_h="Tres pasos y <span class=soft>tu mes queda listo.</span>",
    steps=[("Cuéntanos tu marca","Colores, tipografía, tono y de 10 a 30 fotos reales de tu negocio. Se guarda una vez y se usa en todo.","sw"),
           ("Tu mes, armado","Eliges cuántas publicaciones quieres. Neuri arma el calendario de 30 días con ideas de tu giro y tus fotos.","cal"),
           ("Apruebas con un toque","Revisas la semana desde el celular: apruebas, cambias el texto o descartas. Nada sale sin tu visto bueno.","ap")],
    step_ap=("Semana 1 · 4 piezas","Aprobada"),
    f_eb="Lo que estamos construyendo", f_h="Todo tu marketing en un lugar. <span class=soft>Sin agencia y sin perseguir a nadie.</span>",
    f_sub="Cada función dice «Pronto» hasta que de verdad exista.", soon="Pronto",
    feats=[("🎨","Kit de marca","Tu identidad guardada una vez: colores, letras, tono, logo y banco de fotos. De ahí sale cada pieza.",True),
           ("🗓️","Calendario de 30 días","Ideas por giro y fechas que importan; tres posts y un reel por semana para empezar.",False),
           ("✍️","Posts y reels con tus fotos","Textos, carruseles e ideas de reels con tu estilo. Tú eliges cuántos al mes.",False),
           ("✅","Aprobación con un toque","Apruebas la semana completa o pieza por pieza desde el celular.",False),
           ("⏰","Programación en Instagram y Facebook","Con el inicio de sesión oficial de Meta, a la hora que conviene.",False),
           ("💬","Comentarios y mensajes","Conectado con neuri.bots para que ningún cliente se quede sin respuesta.",False),
           ("📈","Reporte semanal","Mensajes y ventas, no solo likes, para saber qué sí funciona.",False)],
    t_eb="Gratis y ya disponible", t_h="Mientras abrimos, <span class=soft>úsalas hoy.</span>", t_sub="Cinco herramientas que ya funcionan, sin registro.", t_tag="Gratis", t_go="Abrir",
    tools=[("10","Guía 2026","Las 10 reglas para que tu negocio salga en Explorar, con ideas por giro.","/guia"),
           ("2 min","Autodiagnóstico","10 preguntas sobre tu perfil y tus 3 arreglos prioritarios.","/diagnostico"),
           ("×5","Plantillas por giro","Una semana de publicaciones de ejemplo para café, bazar y servicios.","/plantillas"),
           ("Aa","Ficha de marca","Revisa tus colores, tu tono, tu bio y tus hashtags en un minuto.","/marca"),
           ("24","Ideas de reels","24 ideas por giro con guion de 3 tomas y texto listo para copiar.","/ideas-reels")],
    j_eb="Lista de espera", j_h="Entra primero.", j_sub="Sin costo y sin compromiso. Te escribimos solo cuando abramos lugares.",
    perks=[("✉️","Te avisamos primero","Un correo cuando abramos. Nada de spam."),("🤝","Sin tarjeta, sin compromiso","Apuntarte no te obliga a nada."),("🔒","Tus datos, cuidados","Solo para avisarte del lanzamiento. No los vendemos ni los compartimos.")],
    fName="Tu nombre", fBusiness="Nombre del negocio", fEmail="Correo", fWhatsapp="WhatsApp (opcional)", fSector="Giro",
    sectors=["Café / restaurante","Bazar / tianguis","Tienda","Servicios","Otro"], fNetworks="¿Qué redes usas?", submit="Apuntarme",
    privacy="Al apuntarte aceptas que te escribamos sobre el lanzamiento. Puedes darte de baja cuando quieras.",
    faq_eb="Preguntas", faq_h="Lo que nos preguntan.",
    faq=[("¿Ya puedo usar Neuri Marketing?","Todavía no. Lo estamos construyendo y probando con un negocio piloto. Mientras tanto, las herramientas gratis ya funcionan."),
         ("¿Cuánto va a costar?","Aún no publicamos precios. Quienes estén en la lista los conocerán primero."),
         ("¿Va a publicar algo sin que yo lo vea?","No. Cada pieza pasa por tu aprobación antes de salir."),
         ("¿Qué redes va a manejar?","Instagram y Facebook primero, con el inicio de sesión oficial de Meta. TikTok y LinkedIn vendrán después."),
         ("¿Necesito saber de diseño?","No. Con tus fotos y tu kit de marca, Neuri arma las piezas; tú solo revisas y apruebas."),
         ("¿Qué tiene que ver con neuri.bots?","neuri.bots contesta los mensajes de tus clientes; Neuri Marketing prepara lo que publicas. Están pensados para trabajar juntos.")],
    cl_h="Tu próximo mes de contenido, listo para aprobar.", cl_p="Apúntate a la lista y te avisamos en cuanto abramos.",
    ft_copy="© 2026 Neuri LLC · Phoenix, AZ · Neuri Marketing está en construcción.",
    ft_nav=[("/","neuri.tech"),("/sigue-disponible/","neuri.bots"),("/bazar/","neuri.bazar"),("/consultoria/","neuri.consulting"),("mailto:hola@neuri.tech","hola@neuri.tech")],
  ),
  "en": dict(
    path="/en/marketing/", other="/marketing/", other_label="Español", other_lang="es", locale="en_US",
    title="Neuri Marketing — AI social media you approve | Neuri",
    desc="Coming soon: Neuri Marketing drafts your business's posts and reels for the month in your style, and you approve them with one tap. Waitlist open.",
    skip="Skip to content", nav=[("#como","How it works"),("#funciones","Features"),("#gratis","Free tools")], nav_cta="Join the waitlist",
    pill="Coming soon · waitlist open",
    h1a="Your socials, always fresh.|You just ", h1b="approve.",
    lead="Neuri Marketing learns your business's style, drafts the month's posts and reels and hands them to you ready to go. You review, approve with one tap, and they go live. We're building it now: join the list and get in first.",
    cta1="Get early access", cta2="Free profile check",
    trust=["Nothing goes live without your OK","Instagram and Facebook first","For businesses in the US and Mexico"],
    ig=dict(handle="cafe.example", name="Example Café", bio="Specialty coffee · DM to order", posts="posts", fol="followers", fing="following",
            tiles=["<em>Seasonal latte</em>","Reel Monday","<em>3 tips</em> for your morning","New in the case","<em>Coffee or tea?</em>","Behind the bar","How your coffee is made","<em>Today</em> we open at 8","See you soon ♥"]),
    ap_t="Your week is ready", ap_s="3 posts · 1 reel · with your photos", ap_b="Approve all",
    cal_t="Wed 10:30", cal_s="Carousel scheduled", note="Illustration of the product in progress",
    ribbon=["Cafés","Markets","Restaurants","Boutiques","Salons","Bakeries","Shops","Services"],
    how_eb="How it will work", how_h="Three steps and <span class=soft>your month is done.</span>",
    steps=[("Tell us your brand","Colors, fonts, tone and 10 to 30 real photos of your business. Saved once, used everywhere.","sw"),
           ("Your month, planned","Pick how many posts you want. Neuri builds a 30-day calendar with ideas for your type of business and your photos.","cal"),
           ("Approve with one tap","Review the week from your phone: approve, edit the caption or skip. Nothing goes out without your OK.","ap")],
    step_ap=("Week 1 · 4 pieces","Approved"),
    f_eb="What we're building", f_h="All your marketing in one place. <span class=soft>No agency, no chasing anyone.</span>",
    f_sub="Every feature says “Soon” until it really exists.", soon="Soon",
    feats=[("🎨","Brand kit","Your identity saved once: colors, fonts, tone, logo and photo bank. Every piece starts there.",True),
           ("🗓️","30-day calendar","Ideas by business type and dates that matter; three posts and one reel a week to start.",False),
           ("✍️","Posts and reels with your photos","Captions, carousels and reel ideas in your style. You choose how many each month.",False),
           ("✅","One-tap approval","Approve the whole week or piece by piece from your phone.",False),
           ("⏰","Instagram and Facebook scheduling","Through Meta's official sign-in, at the right time.",False),
           ("💬","Comments and messages","Linked with neuri.bots so no customer goes unanswered.",False),
           ("📈","Weekly report","Messages and sales, not just likes, so you know what works.",False)],
    t_eb="Free and live today", t_h="While we build, <span class=soft>use these today.</span>", t_sub="Five tools that already work, no sign-up.", t_tag="Free", t_go="Open",
    tools=[("10","2026 guide","The 10 rules to get your business on Explore, with ideas by business type.","/guia"),
           ("2 min","Profile self-check","10 questions about your profile and your top 3 fixes.","/diagnostico"),
           ("×5","Templates by business","A sample week of posts for cafés, markets and services.","/plantillas"),
           ("Aa","Brand sheet","Check your colors, tone, bio and hashtags in a minute.","/marca"),
           ("24","Reel ideas","24 ideas by business type with a 3-shot script and a caption to copy.","/ideas-reels")],
    j_eb="Waitlist", j_h="Get in first.", j_sub="Free, no commitment. We'll only email you when spots open.",
    perks=[("✉️","Hear first","One email when we open. No spam."),("🤝","No card, no commitment","Joining doesn't bind you to anything."),("🔒","Your data, protected","Only used to tell you about the launch. Never sold or shared.")],
    fName="Your name", fBusiness="Business name", fEmail="Email", fWhatsapp="WhatsApp (optional)", fSector="Business type",
    sectors=["Café / restaurant","Market / bazaar","Shop","Services","Other"], fNetworks="Which networks do you use?", submit="Join",
    privacy="By joining you agree to hear from us about the launch. Unsubscribe anytime.",
    faq_eb="Questions", faq_h="What people ask us.",
    faq=[("Can I use Neuri Marketing yet?","Not yet. We're building it and testing it with a pilot business. Meanwhile, the free tools already work."),
         ("How much will it cost?","We haven't published pricing yet. People on the list will see it first."),
         ("Will it post anything without me seeing it?","No. Every piece needs your approval before it goes out."),
         ("Which networks will it handle?","Instagram and Facebook first, through Meta's official sign-in. TikTok and LinkedIn later."),
         ("Do I need design skills?","No. With your photos and brand kit, Neuri drafts the pieces; you just review and approve."),
         ("How does it relate to neuri.bots?","neuri.bots answers your customers' messages; Neuri Marketing prepares what you post. They're designed to work together.")],
    cl_h="Your next month of content, ready to approve.", cl_p="Join the list and we'll tell you as soon as we open.",
    ft_copy="© 2026 Neuri LLC · Phoenix, AZ · Neuri Marketing is under construction.",
    ft_nav=[("/","neuri.tech"),("/en/still-available/","neuri.bots"),("/en/","neuri.bazar"),("/en/ai-consulting/","neuri.consulting"),("mailto:hola@neuri.tech","hola@neuri.tech")],
  ),
}
NETWORKS = ["Instagram", "Facebook", "TikTok", "LinkedIn", "WhatsApp"]
FAV = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 30 30%22%3E%3Crect width=%2230%22 height=%2230%22 rx=%228%22 fill=%22%2315102A%22/%3E%3Ccircle cx=%2215%22 cy=%2215%22 r=%226%22 fill=%22%23FF5B45%22/%3E%3Ccircle cx=%2223%22 cy=%228%22 r=%222.4%22 fill=%22%236D5BFF%22/%3E%3C/svg%3E"


def page(lang: str) -> str:
    c = C[lang]
    q = "" if lang == "es" else "?lang=en"
    url = "https://neuri.tech" + c["path"]
    og = f"https://neuri.tech/assets/og/marketing-{lang}.png"
    ig = c["ig"]
    tiles = "".join(f'<div class="t t{i+1}"><span class="pat"></span>{"<span class=r>▶</span>" if i==1 else ""}<span style="position:relative">{t}</span></div>' for i, t in enumerate(ig["tiles"]))
    nav = "".join(f'<a class="hide" href="{h}">{e(t)}</a>' for h, t in c["nav"])
    rib = "".join(f"<span>{e(r)}</span>" for r in c["ribbon"] * 2)

    def mini(kind):
        if kind == "sw":
            return '<div class="sw"><i style="background:#3B2A20"></i><i style="background:#FFC857"></i><i style="background:#F3E7DA"></i><i style="background:#FF5B45"></i><i style="background:#6D5BFF"></i></div>'
        if kind == "cal":
            cells = "a,,b,,c,,a,,b,,a,,c,".split(",")
            return '<div class="cal7">' + "".join(f'<i class="{x}"></i>' for x in cells[:14]) + "</div>"
        return f'<div class="appr">{e(c["step_ap"][0])}<span>✓ {e(c["step_ap"][1])}</span></div>'

    steps = "".join(f'<div class="step rv"><span class="n">{i+1}</span><h3>{e(h)}</h3><p>{e(p)}</p><div class="mini">{mini(k)}</div></div>' for i, (h, p, k) in enumerate(c["steps"]))
    feats = "".join(f'<div class="feat rv{" wide" if w else ""}"><span class="ico" aria-hidden="true">{ic}</span><h3>{e(h)}</h3><p>{e(p)}</p><span class="soon mono">{e(c["soon"])}</span></div>' for ic, h, p, w in c["feats"])
    tools = "".join(f'<a class="tool rv" href="{APP}{p}{q}" data-cta="marketing tool {p[1:]}"><span class="tag mono">{e(c["t_tag"])}</span><span class="big" aria-hidden="true">{e(b)}</span><h3>{e(h)}</h3><p>{e(d)}</p><span class="go">{e(c["t_go"])} →</span></a>' for b, h, d, p in c["tools"])
    perks = "".join(f'<li><i aria-hidden="true">{ic}</i><span><b>{e(h)}</b>{e(p)}</span></li>' for ic, h, p in c["perks"])
    nets = "".join(f'<label><input type="checkbox" name="networks" value="{n}"> {n}</label>' for n in NETWORKS)
    sectors = "".join(f"<option>{e(s)}</option>" for s in c["sectors"])
    faq = "".join(f"<details><summary>{e(qq)}</summary><p>{e(a)}</p></details>" for qq, a in c["faq"])
    fnav = "".join(f'<a href="{h}">{e(t)}</a>' for h, t in c["ft_nav"])
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": qq, "acceptedAnswer": {"@type": "Answer", "text": a}} for qq, a in c["faq"]]}

    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(c['title'])}</title>
<meta name="description" content="{e(c['desc'])}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="es" href="https://neuri.tech/marketing/">
<link rel="alternate" hreflang="en" href="https://neuri.tech/en/marketing/">
<link rel="alternate" hreflang="x-default" href="https://neuri.tech/marketing/">
<meta property="og:type" content="website"><meta property="og:site_name" content="Neuri"><meta property="og:locale" content="{c['locale']}">
<meta property="og:title" content="{e(c['title'])}"><meta property="og:description" content="{e(c['desc'])}"><meta property="og:url" content="{url}">
<meta property="og:image" content="{og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(c['title'])}"><meta name="twitter:description" content="{e(c['desc'])}"><meta name="twitter:image" content="{og}">
<meta name="theme-color" content="#15102A">
<link rel="icon" href="{FAV}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<script src="/assets/analytics.js" defer></script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&amp;family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&amp;family=DM+Mono:wght@400;500&amp;display=swap">
<link rel="stylesheet" href="/assets/marketing.css?v=1">
</head>
<body>
<a class="skip" href="#main">{e(c['skip'])}</a>
<header class="top"><div class="wrap">
<a class="logo" href="/" aria-label="Neuri"><svg width="28" height="28" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="13" fill="none" stroke="#fff" stroke-width="1.5" opacity=".35"/><circle cx="15" cy="15" r="5.5" fill="#FF5B45"/><circle cx="25" cy="8" r="2.3" fill="#6D5BFF"/></svg><b>neuri<i>.</i>marketing</b></a>
<nav class="main" aria-label="Principal">{nav}<a class="hide" href="{c['other']}" hreflang="{c['other_lang']}" lang="{c['other_lang']}">{e(c['other_label'])}</a><a class="btn pri sm" href="#lista" data-cta="marketing header">{e(c['nav_cta'])}</a></nav>
</div></header>
<main id="main">
<section class="hero"><div class="grain" aria-hidden="true"></div><div class="wrap">
<div>
<span class="pill mono"><span class="dot"></span>{e(c['pill'])}</span>
<h1>{'<br>'.join(e(x) for x in c['h1a'].split('|'))}<span class="hl">{e(c['h1b'])}</span></h1>
<p class="lead">{e(c['lead'])}</p>
<div class="ctas"><a class="btn pri" href="#lista" data-cta="marketing hero">{e(c['cta1'])} <span aria-hidden="true">→</span></a><a class="btn ghost" href="{APP}/diagnostico{q}" data-cta="marketing hero diagnostico">{e(c['cta2'])}</a></div>
<div class="trust">{''.join(f'<span>{e(t)}</span>' for t in c['trust'])}</div>
</div>
<div class="stage" role="img" aria-label="{e(c['note'])}">
<div class="phone" aria-hidden="true"><div class="screen"><div class="notch"></div>
<div class="ig-head"><div class="av"><span>{e(ig['name'][:1])}{e(ig['name'].split()[-1][:1])}</span></div><div class="ig-stats"><span><b>48</b>{e(ig['posts'])}</span><span><b>2.3k</b>{e(ig['fol'])}</span><span><b>180</b>{e(ig['fing'])}</span></div></div>
<div class="ig-name"><b>{e(ig['handle'])}</b><br>{e(ig['bio'])}</div>
<div class="grid9">{tiles}</div><div class="igbar"><span>⌂</span><span>⌕</span><span>⊕</span><span>▶</span><span>◯</span></div></div></div>
<div class="float f-cal" aria-hidden="true"><span class="mono">{e(c['cal_t'])}</span><br><b>{e(c['cal_s'])}</b><div class="bar"><i class="on"></i><i></i><i class="co"></i><i></i><i class="su"></i><i></i><i class="on"></i></div></div>
<div class="float f-approve" aria-hidden="true"><div class="row"><span class="ic">✦</span><span><b>{e(c['ap_t'])}</b>{e(c['ap_s'])}</span></div><div class="ok"><span>{e(c['ap_b'])} ✓</span></div></div>
<p class="note mono">{e(c['note'])}</p>
</div>
</div></section>
<div class="ribbon" aria-hidden="true"><div class="track">{rib}</div></div>

<section class="s" id="como"><div class="wrap">
<p class="eyebrow mono">{e(c['how_eb'])}</p><h2 class="rv">{c['how_h']}</h2>
<div class="steps">{steps}</div>
</div></section>

<section class="s dark" id="funciones"><div class="wrap">
<p class="eyebrow mono">{e(c['f_eb'])}</p><h2 class="rv">{c['f_h']}</h2><p class="sub">{e(c['f_sub'])}</p>
<div class="feats">{feats}</div>
</div></section>

<section class="s" id="gratis"><div class="wrap">
<p class="eyebrow mono">{e(c['t_eb'])}</p><h2 class="rv">{c['t_h']}</h2><p class="sub">{e(c['t_sub'])}</p>
<div class="tools">{tools}</div>
</div></section>

<section class="s" id="lista" style="padding-top:20px"><div class="wrap join">
<div><p class="eyebrow mono">{e(c['j_eb'])}</p><h2>{e(c['j_h'])}</h2><p class="sub">{e(c['j_sub'])}</p><ul class="perks">{perks}</ul></div>
<div class="formcard">
<form method="post" action="{APP}/lista?src=neuri-tech" data-form="marketing"><input type="hidden" name="lang" value="{lang}">
<label class="hp" aria-hidden="true">Web <input name="website" tabindex="-1" autocomplete="off"></label>
<div class="two"><label>{e(c['fName'])}<input name="name" required maxlength="120" autocomplete="name"></label>
<label>{e(c['fBusiness'])}<input name="business" required maxlength="160" autocomplete="organization"></label></div>
<label>{e(c['fEmail'])}<input name="email" type="email" required maxlength="200" autocomplete="email"></label>
<div class="two"><label>{e(c['fWhatsapp'])}<input name="whatsapp" type="tel" maxlength="30" autocomplete="tel"></label>
<label>{e(c['fSector'])}<select name="sector">{sectors}</select></label></div>
<fieldset><legend>{e(c['fNetworks'])}</legend><div class="nets">{nets}</div></fieldset>
<button class="btn dark" type="submit" data-cta="marketing submit">{e(c['submit'])} <span aria-hidden="true">→</span></button>
<p class="fine">{e(c['privacy'])}</p>
</form></div>
</div></section>

<section class="s" style="padding-top:30px"><div class="wrap">
<p class="eyebrow mono">{e(c['faq_eb'])}</p><h2>{e(c['faq_h'])}</h2><div class="faq">{faq}</div>
</div></section>

<section class="closer"><div class="wrap"><h2 class="rv">{e(c['cl_h'])}</h2><p>{e(c['cl_p'])}</p><a class="btn" href="#lista" data-cta="marketing closer">{e(c['cta1'])} <span aria-hidden="true">→</span></a></div></section>
</main>
<footer class="ft"><div class="wrap"><span>{e(c['ft_copy'])}</span><nav aria-label="Neuri">{fnav}<a href="{c['other']}" hreflang="{c['other_lang']}">{e(c['other_label'])}</a></nav></div></footer>
<script>
(function(){{var s=new URLSearchParams(location.search).get('src');var f=document.querySelector('[data-form]');if(f&&s&&/^[a-z0-9_-]{{1,40}}$/.test(s))f.action='{APP}/lista?src='+s;
var els=document.querySelectorAll('.rv');if(!('IntersectionObserver' in window)){{els.forEach(function(x){{x.classList.add('on')}});return}}
var io=new IntersectionObserver(function(es){{es.forEach(function(en){{if(en.isIntersecting){{en.target.classList.add('on');io.unobserve(en.target)}}}})}},{{threshold:0,rootMargin:'0px 0px -10% 0px'}});els.forEach(function(x){{io.observe(x)}});}})();
</script>
</body>
</html>
"""


for lang in ("es", "en"):
    out = ROOT / C[lang]["path"].strip("/") / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page(lang), encoding="utf-8")
    print("ok", out.relative_to(ROOT))
