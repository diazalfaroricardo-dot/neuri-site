/* Vendedor de IA de neuri.tech: un globo en todas las páginas que platica con el visitante,
   le recomienda el producto que de verdad le sirve y le da el siguiente paso con su link.
   - Contesta Claude desde consulting.neuri.tech/api/vendedor con la hoja de productos de Neuri y
     sus tres principios: Autónomo, Honesto, Bajo tu mando. La conversación se guarda allá y
     Ricardo la ve en consulting.neuri.tech/panel/vendedor.
   - Aquí solo vive la vista: Shadow DOM (no choca con el CSS de cada página), hereda la letra de la
     página y toma el color del producto. Conversación en sessionStorage para seguirla entre páginas.
   - Analítica sin texto libre: vendedor_open {page} · vendedor_message {page, n} · vendedor_cta {host}.
   - Pregunta primero a /api/vendedor/estado: si la IA no contesta, el globo no aparece.
   - ?vendedor=0 lo oculta (capturas, pruebas). window.__NEURI_VENDEDOR_API cambia el servidor. */
(() => {
  try {
    if (window.__neuriVendedor) return;
    window.__neuriVendedor = true;
    const qs = new URLSearchParams(location.search);
    if (qs.get("vendedor") === "0") return;
    if (/bot|crawl|spider|slurp|lighthouse|facebookexternalhit/i.test(navigator.userAgent)) return;

    const API = window.__NEURI_VENDEDOR_API || "https://consulting.neuri.tech/api/vendedor";
    // En consulting.neuri.tech las rutas son /precios, /ejemplo…: se presentan como /consultoria/… para
    // que el saludo, el color y la hoja de productos sean los de neuri.consulting.
    const sub = /^consulting\./.test(location.hostname) ? "/consultoria" : "";
    const path = sub + location.pathname.replace(/index\.html$/, "");
    const lang = (document.documentElement.lang || "es").slice(0, 2) === "en" ? "en" : "es";
    const es = lang === "es";
    const KEY = "neuri-vendedor";

    // Color y saludo por producto (cada página conserva su marca).
    const P = [
      {
        re: /^\/(en\/)?(sigue-disponible|still-available)/,
        th: "bots",
        es: "¡Hola! Soy el asistente de Neuri (una IA). ¿Te ayudo a ver si neuri.bots le sirve a tu negocio?",
        en: "Hi! I'm Neuri's assistant (an AI). Want help seeing if neuri.bots fits your business?",
        qes: ["¿Cuánto cuesta?", "¿Ya funciona con Instagram?", "Vendo en Marketplace"],
        qen: ["How much is it?", "Does it work with Instagram yet?", "I sell on Marketplace"],
      },
      {
        re: /^\/(en\/)?bazar/,
        th: "bazar",
        es: "¡Hola! Soy el asistente de Neuri (una IA). ¿Cuántos vendedores tiene tu bazar? Te digo qué plan te toca.",
        en: "Hi! I'm Neuri's assistant (an AI). How many vendors does your market have? I'll tell you which plan fits.",
        qes: ["Tengo unos 40 vendedores", "¿Cómo es la prueba gratis?", "Quiero ver una demo"],
        qen: ["I have about 40 vendors", "How does the free trial work?", "I'd like a demo"],
      },
      {
        re: /^\/(consultoria|en\/ai-consulting)/,
        th: "consult",
        es: "Hola, soy el asistente de Neuri Consulting (una IA). Cuéntame qué hace tu empresa y te digo por dónde empezar con IA.",
        en: "Hi, I'm Neuri Consulting's assistant (an AI). Tell me what your company does and I'll suggest where to start with AI.",
        qes: ["¿Qué incluye el diagnóstico?", "Queremos automatizar ventas", "¿Cuánto cuesta?"],
        qen: ["What's in the assessment?", "We want to automate sales", "How much is it?"],
      },
      {
        re: /^\/(en\/)?marketing/,
        th: "mkt",
        es: "¡Hola! Soy el asistente de Neuri (una IA). Neuri Marketing arma los posts y reels del mes con tu estilo y tú los apruebas desde el celular. ¿Te cuento cuál plan te queda y cómo apartar tu lugar?",
        en: "Hi! I'm Neuri's assistant (an AI). Neuri Marketing prepares your month of posts and reels in your style, and you approve them from your phone. Want help picking a plan and saving your spot?",
        qes: ["¿Cuánto cuesta?", "¿Publica sin que yo lo vea?", "Tengo una cafetería"],
        qen: ["How much is it?", "Does it post without my OK?", "I run a coffee shop"],
      },
    ];
    const home = {
      th: "home",
      es: "¡Hola! Soy el asistente de Neuri (una IA). Cuéntame qué negocio tienes y te digo qué te sirve, sin rodeos.",
      en: "Hi! I'm Neuri's assistant (an AI). Tell me about your business and I'll tell you what fits, straight up.",
      qes: ["Vendo por Instagram", "Tengo un bazar", "Quiero usar IA en mi empresa"],
      qen: ["I sell on Instagram", "I run a flea market", "I want AI in my company"],
    };
    const prod = P.find((p) => p.re.test(path)) || home;
    // Paleta de cada landing (mismos hex que sus :root). a = acento · ai = acento al pasar · on = texto sobre acento ·
    // bg = hoja · cv = fondo de la plática · ink/sub = texto · ln = líneas · tint = chips · dot = punto «en línea» ·
    // ttl = letra del título (consulting usa su serif).
    const TH = {
      home: { a: "#8FE0B4", ai: "#B5EDCD", on: "#05080D", bg: "#0B1118", cv: "#05080D", ab: "#111922", ink: "#E9EEF2", sub: "#9AA6B2", ln: "rgba(233,238,242,.12)", tint: "rgba(143,224,180,.12)", dot: "#8FE0B4", ring: "#F3B38F", pl: ["#05080D", "#B4441A", "#C2341D"] },
      bots: { a: "#0B5E3A", ai: "#084A2D", on: "#FFFFFF", bg: "#FFFFFF", cv: "#F6F4EE", ab: "#FFFFFF", ink: "#05080D", sub: "#56635C", ln: "#E1E3DC", tint: "#E3EFE7", dot: "#0B5E3A", ring: "#8FE0B4" },
      bazar: { a: "#B4441A", ai: "#8A3313", on: "#FFFFFF", bg: "#FFFFFF", cv: "#F7F1E8", ab: "#FFFFFF", ink: "#05080D", sub: "#5E554C", ln: "#E6DBC9", tint: "#F6E7DA", dot: "#B4441A", ring: "#F3B38F" },
      consult: { a: "#1F7A52", ai: "#145C3C", on: "#FFFFFF", bg: "#FFFFFF", cv: "#FBFAF7", ab: "#FFFFFF", ink: "#0A1A14", sub: "#4B5B54", ln: "#E4E1DA", tint: "#EAF3EE", dot: "#1F7A52", ring: "#8FE0B4", ttl: '"Instrument Serif",Georgia,serif' },
      mkt: { a: "#C2341D", ai: "#9E2914", on: "#FFFFFF", bg: "#FFFFFF", cv: "#FFF8F2", ab: "#FFFFFF", ink: "#0B1118", sub: "#5B6670", ln: "#F0E4DA", tint: "#F4ECE4", dot: "#C2341D", ring: "#FFC857" },
    };
    const C = TH[prod.th] || TH.home;
    // Los «planetas» que giran alrededor de Neuri: un color por producto (menta, durazno, sol).
    const PL = ["#8FE0B4", "#F3B38F", "#FFC857"];
    const A = C.a;

    // Estado (sigue entre páginas en la misma pestaña).
    let st = { id: "", msgs: [], open: false };
    try {
      st = Object.assign(st, JSON.parse(sessionStorage.getItem(KEY) || "{}"));
    } catch (_) {}
    const save = () => {
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ id: st.id, msgs: st.msgs.slice(-40), open: st.open }));
      } catch (_) {}
    };
    const newId = () => {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    };
    if (!st.id) st.id = newId();
    const track = (ev, props) => {
      try {
        window.posthog && window.posthog.capture && window.posthog.capture(ev, props);
      } catch (_) {}
    };

    const T = es
      ? {
          launch: "¿Te ayudo a elegir?",
          title: "Asistente de Neuri",
          sub: "IA · En línea · Solo info de Neuri",
          ph: "Escribe tu pregunta…",
          send: "Enviar",
          close: "Cerrar",
          open: "Abrir el asistente de ventas de Neuri",
          note: "Es una IA. No inventa precios: si no sabe algo, te pasa con Ricardo. No compartas datos de tarjeta.",
          err: "No pude conectarme. Escríbenos a hola@neuri.tech y te contestamos.",
          typing: "Escribiendo…",
          reset: "Empezar de nuevo",
        }
      : {
          launch: "Need help choosing?",
          title: "Neuri assistant",
          sub: "AI · Online · Neuri info only",
          ph: "Type your question…",
          send: "Send",
          close: "Close",
          open: "Open Neuri's sales assistant",
          note: "This is an AI. It won't make up prices: if it doesn't know, it hands you to Ricardo. Don't share card details.",
          err: "I couldn't connect. Email hola@neuri.tech and we'll get back to you.",
          typing: "Typing…",
          reset: "Start over",
        };

    const host = document.createElement("div");
    host.id = "neuri-vendedor";
    host.style.cssText = "position:fixed;right:0;bottom:0;z-index:2147483000;width:0;height:0";
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `<style>
:host{all:initial}
*{box-sizing:border-box;font-family:inherit;margin:0}
.w{--p1:${(C.pl || PL)[0]};--p2:${(C.pl || PL)[1]};--p3:${(C.pl || PL)[2]};--a:${C.a};--ai:${C.ai};--on:${C.on};--bg:${C.bg};--cv:${C.cv};--ab:${C.ab};--ink:${C.ink};--sub:${C.sub};--ln:${C.ln};--tint:${C.tint};--dot:${C.dot};--ring:${C.ring};--f:"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;--mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace;--ttl:${C.ttl || "var(--f)"};font-family:var(--f);color:var(--ink);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.l{position:fixed;right:16px;bottom:calc(16px + var(--nv-lift,0px));display:flex;align-items:center;gap:10px;height:52px;padding:0 20px 0 7px;border:0;border-radius:999px;background:var(--a);color:var(--on);font:600 15px/1 var(--f);letter-spacing:-.015em;box-shadow:0 18px 40px -14px color-mix(in srgb,var(--a) 70%,#000),0 2px 6px rgba(5,8,13,.16),inset 0 1px 0 rgba(255,255,255,.18);cursor:pointer;transition:transform .25s cubic-bezier(.22,1,.36,1),box-shadow .25s ease,bottom .2s ease,background .2s ease}
.l:hover{transform:translateY(-2px);background:var(--ai)}
.l:focus-visible,.x:focus-visible,.s:focus-visible,.q:focus-visible,.c:focus-visible,.r:focus-visible{outline:3px solid var(--ring);outline-offset:2px}
.l .av{width:38px;height:38px;border-radius:50%;background:color-mix(in srgb,var(--on) 14%,transparent);display:grid;place-items:center;flex:none;position:relative}
.av svg{display:block}
.core{position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:var(--on);box-shadow:0 0 0 3px color-mix(in srgb,var(--on) 22%,transparent),0 0 12px color-mix(in srgb,var(--on) 45%,transparent)}
.o{position:absolute;border-radius:50%;border:1px solid color-mix(in srgb,var(--on) 26%,transparent);animation:spin 14s linear infinite}
.o1{inset:8px;animation-duration:6s}
.o2{inset:1px;animation-duration:15s;animation-direction:reverse}
.o i{position:absolute;left:50%;top:0;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:var(--p1);box-shadow:0 0 0 1.5px var(--a),0 0 6px var(--p1)}
.o2 i{width:5px;height:5px;margin:-2.5px 0 0 -2.5px;background:var(--p2);box-shadow:0 0 0 1.5px var(--a),0 0 6px var(--p2)}
.o2 i+i{top:100%;background:var(--p3);box-shadow:0 0 0 1.5px var(--a),0 0 6px var(--p3)}
.w.busy .o1{animation-duration:1.4s}
.w.busy .o2{animation-duration:3s}
.l:hover .o1{animation-duration:2.4s}
.l:hover .o2{animation-duration:6s}
@keyframes spin{to{transform:rotate(360deg)}}
.l .av::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:2px solid var(--ring);opacity:0;animation:pulse 2.8s cubic-bezier(.22,1,.36,1) 1.2s 3}
@keyframes pulse{0%{opacity:.7;transform:scale(.85)}100%{opacity:0;transform:scale(1.35)}}
.l.mini{padding:0;width:52px;justify-content:center}
.l.mini .tx{display:none}
.l.mini .av{background:transparent}
.l[hidden]{display:none}
.p{position:fixed;right:16px;bottom:16px;width:min(392px,calc(100vw - 32px));height:min(600px,calc(100dvh - 32px));display:flex;flex-direction:column;background:var(--bg);color:var(--ink);border-radius:24px;overflow:hidden;box-shadow:0 40px 90px -30px rgba(5,8,13,.5),0 12px 28px -16px rgba(5,8,13,.22),0 0 0 1px var(--ln);transform-origin:bottom right;animation:in .32s cubic-bezier(.22,1,.36,1)}
.p[hidden]{display:none}
@keyframes in{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
@keyframes up{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes dot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
@media (prefers-reduced-motion:reduce){.p,.b,.c,.qs{animation:none}.l{transition:none}.l .av::after,.dots i,.o{animation:none}}
@media (max-width:480px){.p{right:0;bottom:0;width:100vw;height:100dvh;border-radius:0}}
.h{display:flex;align-items:center;gap:12px;padding:14px 10px 14px 16px;background:var(--bg);color:var(--ink);border-bottom:1px solid var(--ln)}
.h .av{width:40px;height:40px;border-radius:50%;background:var(--a);color:var(--on);display:grid;place-items:center;flex:none;position:relative}
.h .av em{position:absolute;right:-2px;bottom:-2px;width:11px;height:11px;border-radius:50%;background:#8FE0B4;border:2px solid var(--bg)}
.h b{display:block;font:600 16px/1.15 var(--ttl);letter-spacing:-.02em}
.h b.sf{font:400 21px/1.05 var(--ttl);letter-spacing:-.01em}
.h small{display:flex;align-items:center;gap:6px;font:500 10.5px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--sub);margin-top:4px}
.h .sp{flex:1;min-width:0}
.x{width:44px;height:44px;border:0;border-radius:14px;background:transparent;color:var(--sub);cursor:pointer;display:grid;place-items:center;transition:background .15s ease,color .15s ease}
.x:hover{background:var(--tint);color:var(--ink)}
.m{flex:1;overflow-y:auto;padding:20px 16px 10px;display:flex;flex-direction:column;gap:10px;background:var(--cv);overscroll-behavior:contain;scrollbar-width:thin}
.b{max-width:86%;padding:11px 14px;border-radius:18px;font:400 15px/1.5 var(--f);letter-spacing:-.005em;white-space:pre-wrap;overflow-wrap:anywhere;animation:up .28s cubic-bezier(.22,1,.36,1)}
.b.a{align-self:flex-start;background:var(--ab);color:var(--ink);box-shadow:0 0 0 1px var(--ln),0 1px 2px rgba(5,8,13,.04);border-bottom-left-radius:6px}
.b.u{align-self:flex-end;background:var(--a);color:var(--on);border-bottom-right-radius:6px}
.b.t{padding:14px 16px}
.dots{display:flex;gap:5px}
.dots i{width:7px;height:7px;border-radius:50%;background:var(--sub);animation:dot 1.2s ease-in-out infinite}
.dots i:nth-child(2){animation-delay:.15s}
.dots i:nth-child(3){animation-delay:.3s}
.c{align-self:flex-start;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 18px;margin:0 0 4px;border-radius:999px;background:var(--a);border:0;color:var(--on);font:600 14px/1 var(--f);letter-spacing:-.01em;text-decoration:none;box-shadow:0 8px 20px -10px color-mix(in srgb,var(--a) 80%,#000);animation:up .28s cubic-bezier(.22,1,.36,1);transition:background .15s ease,transform .15s ease}
.c:hover{background:var(--ai);transform:translateY(-1px)}
.qs{display:flex;flex-wrap:wrap;gap:8px;padding:4px 0 6px;animation:up .32s cubic-bezier(.22,1,.36,1)}
.q{min-height:44px;padding:0 15px;border-radius:999px;border:1px solid var(--ln);background:var(--ab);color:var(--ink);font:500 14px/1 var(--f);letter-spacing:-.01em;cursor:pointer;transition:background .15s ease,border-color .15s ease,color .15s ease}
.q:hover{background:var(--tint);border-color:var(--a);color:var(--ink)}
.f{display:flex;align-items:flex-end;gap:6px;margin:10px 12px 6px;padding:5px 5px 5px 6px;border:1px solid var(--ln);border-radius:20px;background:var(--ab);transition:border-color .15s ease,box-shadow .15s ease}
.f:focus-within{border-color:var(--a);box-shadow:0 0 0 4px var(--tint)}
.i{flex:1;min-width:0;min-height:44px;max-height:120px;padding:11px 10px;border:0;border-radius:14px;font:400 16px/1.35 var(--f);color:var(--ink);resize:none;background:transparent;outline:none}
.i::placeholder{color:var(--sub);opacity:.85}
.s{width:44px;height:44px;flex:none;border:0;border-radius:15px;background:var(--a);color:var(--on);cursor:pointer;display:grid;place-items:center;transition:background .15s ease,transform .15s ease}
.s:hover{background:var(--ai)}
.s:active{transform:scale(.94)}
.s:disabled{opacity:.4;cursor:default}
.n{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 16px 8px;background:var(--bg);font:400 11.5px/1.4 var(--f);color:var(--sub)}
.r{border:0;background:none;padding:0 2px;min-height:44px;color:var(--sub);font:500 11.5px/1 var(--f);text-decoration:underline;text-underline-offset:3px;cursor:pointer;white-space:nowrap}
.r:hover{color:var(--ink)}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
</style>
<div class="w">
<button class="l" type="button" aria-label="${T.launch} ${T.open}"><span class="av" aria-hidden="true"><span class="core"></span><span class="o o1"><i></i></span><span class="o o2"><i></i><i></i></span></span><span class="tx">${T.launch}</span></button>
<section class="p" role="dialog" aria-modal="false" aria-label="${T.title}" hidden>
<header class="h"><span class="av" aria-hidden="true"><span class="core"></span><span class="o o1"><i></i></span><span class="o o2"><i></i><i></i></span></span><span class="sp"><b${C.ttl ? ' class="sf"' : ""}>${T.title}</b><small>${T.sub}</small></span>
<button class="x" type="button" aria-label="${T.close}"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></header>
<div class="m" aria-live="polite"></div>
<form class="f"><label class="sr" for="nv-i">${T.ph}</label><textarea id="nv-i" class="i" rows="1" maxlength="1200" placeholder="${T.ph}"></textarea>
<button class="s" type="submit" aria-label="${T.send}"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h11M10 4.5L14.5 9 10 13.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>
<div class="n"><span>${T.note}</span><button class="r" type="button">${T.reset}</button></div>
</section></div>`;

    const $ = (s) => root.querySelector(s);
    const launch = $(".l"),
      panel = $(".p"),
      list = $(".m"),
      form = $(".f"),
      input = $(".i"),
      sendBtn = $(".s");

    const bubble = (role, text) => {
      const d = document.createElement("div");
      d.className = `b ${role === "user" ? "u" : "a"}`;
      d.textContent = text;
      list.appendChild(d);
      return d;
    };
    const ctaLink = (cta) => {
      if (!cta || !cta.url || !cta.texto) return;
      if (!/^(https:\/\/(neuri\.tech|consulting\.neuri\.tech|calendly\.com)\/|mailto:hola@neuri\.tech$)/.test(cta.url)) return;
      const a = document.createElement("a");
      a.className = "c";
      a.href = cta.url;
      a.textContent = `${cta.texto} →`;
      if (!/^https:\/\/neuri\.tech\//.test(cta.url) && !cta.url.startsWith("mailto:")) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      a.addEventListener("click", () => {
        let h = "mail";
        try {
          h = new URL(cta.url).host || "mail";
        } catch (_) {}
        track("vendedor_cta", { host: h, page: path });
        st.open = false;
        save();
      });
      list.appendChild(a);
    };
    const quick = () => {
      const box = document.createElement("div");
      box.className = "qs";
      for (const q of es ? prod.qes : prod.qen) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "q";
        b.textContent = q;
        b.addEventListener("click", () => {
          box.remove();
          ask(q);
        });
        box.appendChild(b);
      }
      list.appendChild(box);
    };
    const render = () => {
      list.textContent = "";
      bubble("assistant", es ? prod.es : prod.en);
      if (!st.msgs.length) quick();
      for (const m of st.msgs) {
        bubble(m.role, m.text);
        if (m.cta) ctaLink(m.cta);
      }
      list.scrollTop = list.scrollHeight;
    };

    let busy = false;
    const ask = async (text) => {
      text = (text || "").trim().slice(0, 1200);
      if (!text || busy) return;
      busy = true;
      root.querySelector(".w").classList.add("busy");
      sendBtn.disabled = true;
      root.querySelector(".qs")?.remove();
      st.msgs.push({ role: "user", text });
      save();
      bubble("user", text);
      const typing = bubble("assistant", "");
      typing.classList.add("t");
      typing.innerHTML = `<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr">${T.typing}</span>`;
      list.scrollTop = list.scrollHeight;
      track("vendedor_message", { page: path, n: st.msgs.filter((m) => m.role === "user").length });
      let reply = { respuesta: T.err, cta: { texto: "hola@neuri.tech", url: "mailto:hola@neuri.tech" } };
      try {
        const ctl = new AbortController();
        const to = setTimeout(() => ctl.abort(), 35000);
        const r = await fetch(API, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: st.id, lang, page: path, text }),
          signal: ctl.signal,
        });
        clearTimeout(to);
        const j = await r.json();
        if (j && typeof j.respuesta === "string") reply = j;
      } catch (_) {}
      typing.remove();
      st.msgs.push({ role: "assistant", text: reply.respuesta, cta: reply.cta || null });
      save();
      bubble("assistant", reply.respuesta);
      ctaLink(reply.cta);
      list.scrollTop = list.scrollHeight;
      busy = false;
      root.querySelector(".w").classList.remove("busy");
      sendBtn.disabled = false;
      if (st.open && matchMedia("(hover:hover)").matches) input.focus();
    };

    const setOpen = (o, focus) => {
      st.open = o;
      save();
      panel.hidden = !o;
      launch.hidden = o;
      if (o) {
        render();
        if (focus !== false) setTimeout(() => input.focus(), 30);
      } else if (focus !== false) launch.focus();
    };
    launch.addEventListener("click", () => {
      track("vendedor_open", { page: path });
      setOpen(true);
    });
    $(".x").addEventListener("click", () => setOpen(false));
    $(".r").addEventListener("click", () => {
      st = { id: newId(), msgs: [], open: true };
      save();
      render();
      input.focus();
    });
    root.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) setOpen(false);
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = input.value;
      input.value = "";
      input.style.height = "";
      ask(v);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
    input.addEventListener("input", () => {
      input.style.height = "";
      input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    });

    // No tapar las barras fijas de cada página (botón «Quiero mi asistente», «Prueba gratis»…).
    let raf = 0;
    const lift = () => {
      raf = 0;
      let px = 0;
      for (const el of document.querySelectorAll(".sticky, .cta-fijo")) {
        const r = el.getBoundingClientRect();
        if (r.height && r.top < innerHeight && r.bottom > innerHeight - 140 && getComputedStyle(el).opacity !== "0")
          px = Math.max(px, innerHeight - r.top + 4);
      }
      host.style.setProperty("--nv-lift", `${Math.round(px)}px`);
    };
    const onMove = () => {
      if (!raf) raf = requestAnimationFrame(lift);
    };
    addEventListener("scroll", onMove, { passive: true });
    addEventListener("resize", onMove);

    const mount = () => {
      document.body.appendChild(host);
      lift();
      if (st.msgs.length) launch.classList.add("mini");
      if (st.open) setOpen(true, false);
      // Ya vio la página un rato sin abrirlo: el globo se hace pequeño para no estorbar.
      else setTimeout(() => launch.classList.add("mini"), 25000);
    };
    // Solo aparece si la IA contesta de verdad (si la llave falla, nadie ve un asistente roto).
    const start = () =>
      fetch(`${API}/estado`, { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => {
          if (j && j.activo) mount();
        })
        .catch(() => {});
    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start);
  } catch (_) {}
})();
