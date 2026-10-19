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
        a: "#0B5E3A",
        es: "¡Hola! Soy el asistente de Neuri (una IA). ¿Te ayudo a ver si neuri.bots le sirve a tu negocio?",
        en: "Hi! I'm Neuri's assistant (an AI). Want help seeing if neuri.bots fits your business?",
        qes: ["¿Cuánto cuesta?", "¿Ya funciona con Instagram?", "Vendo en Marketplace"],
        qen: ["How much is it?", "Does it work with Instagram yet?", "I sell on Marketplace"],
      },
      {
        re: /^\/(en\/)?bazar/,
        a: "#B4441A",
        es: "¡Hola! Soy el asistente de Neuri (una IA). ¿Cuántos vendedores tiene tu bazar? Te digo qué plan te toca.",
        en: "Hi! I'm Neuri's assistant (an AI). How many vendors does your market have? I'll tell you which plan fits.",
        qes: ["Tengo unos 40 vendedores", "¿Cómo es la prueba gratis?", "Quiero ver una demo"],
        qen: ["I have about 40 vendors", "How does the free trial work?", "I'd like a demo"],
      },
      {
        re: /^\/(consultoria|en\/ai-consulting)/,
        a: "#1F7A52",
        es: "Hola, soy el asistente de Neuri Consulting (una IA). Cuéntame qué hace tu empresa y te digo por dónde empezar con IA.",
        en: "Hi, I'm Neuri Consulting's assistant (an AI). Tell me what your company does and I'll suggest where to start with AI.",
        qes: ["¿Qué incluye el diagnóstico?", "Queremos automatizar ventas", "¿Cuánto cuesta?"],
        qen: ["What's in the assessment?", "We want to automate sales", "How much is it?"],
      },
      {
        re: /^\/(en\/)?marketing/,
        a: "#B8321C",
        es: "¡Hola! Soy el asistente de Neuri (una IA). Neuri Marketing está en construcción; te cuento qué hará y qué puedes usar gratis hoy.",
        en: "Hi! I'm Neuri's assistant (an AI). Neuri Marketing is still being built; I can tell you what it will do and what's free today.",
        qes: ["¿Cuándo abre?", "¿Qué herramientas gratis hay?", "Tengo una cafetería"],
        qen: ["When does it open?", "What free tools are there?", "I run a coffee shop"],
      },
    ];
    const home = {
      a: "#0E1726",
      es: "¡Hola! Soy el asistente de Neuri (una IA). Cuéntame qué negocio tienes y te digo qué te sirve, sin rodeos.",
      en: "Hi! I'm Neuri's assistant (an AI). Tell me about your business and I'll tell you what fits, straight up.",
      qes: ["Vendo por Instagram", "Tengo un bazar", "Quiero usar IA en mi empresa"],
      qen: ["I sell on Instagram", "I run a flea market", "I want AI in my company"],
    };
    const prod = P.find((p) => p.re.test(path)) || home;
    const A = prod.a;

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
          sub: "IA · contesta solo con la información de Neuri",
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
          sub: "AI · answers only with Neuri's information",
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
*{box-sizing:border-box;font-family:inherit}
.w{font-family:var(--nv-font);color:#14161A;-webkit-font-smoothing:antialiased}
.l{position:fixed;right:16px;bottom:calc(16px + var(--nv-lift,0px));display:flex;align-items:center;gap:10px;height:52px;padding:0 18px 0 8px;border:0;border-radius:999px;background:${A};color:#fff;font:600 15px/1 var(--nv-font);letter-spacing:-.01em;box-shadow:0 12px 30px -10px rgba(10,14,20,.55),0 2px 6px rgba(10,14,20,.18),inset 0 0 0 1px rgba(255,255,255,.22);cursor:pointer;transition:transform .2s ease,opacity .2s ease,bottom .2s ease}
.l:hover{transform:translateY(-2px)}
.l:focus-visible,.x:focus-visible,.s:focus-visible,.q:focus-visible,.c:focus-visible,.r:focus-visible{outline:3px solid #8FB8FF;outline-offset:2px}
.l .av{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;flex:none}
.l .av i{width:10px;height:10px;border-radius:50%;background:#7CF3C3;box-shadow:0 0 0 4px rgba(124,243,195,.25)}
.l.mini{padding:0;width:52px;justify-content:center}
.l.mini .tx{display:none}
.l.mini .av{background:transparent}
.l[hidden]{display:none}
.p{position:fixed;right:16px;bottom:16px;width:min(380px,calc(100vw - 32px));height:min(580px,calc(100dvh - 32px));display:flex;flex-direction:column;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 30px 70px -20px rgba(10,14,20,.45),0 0 0 1px rgba(10,14,20,.08);transform-origin:bottom right;animation:in .22s ease}
.p[hidden]{display:none}
@keyframes in{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.p{animation:none}.l{transition:none}}
@media (max-width:480px){.p{right:0;bottom:0;width:100vw;height:100dvh;border-radius:0}}
.h{display:flex;align-items:center;gap:12px;padding:14px 14px 14px 18px;background:${A};color:#fff}
.h .av{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;flex:none}
.h .av i{width:9px;height:9px;border-radius:50%;background:#7CF3C3}
.h b{display:block;font:600 15px/1.2 var(--nv-font)}
.h small{display:block;font:400 12px/1.3 var(--nv-font);opacity:.82;margin-top:2px}
.h .sp{flex:1;min-width:0}
.x{width:40px;height:40px;border:0;border-radius:12px;background:transparent;color:#fff;cursor:pointer;display:grid;place-items:center}
.x:hover{background:rgba(255,255,255,.14)}
.m{flex:1;overflow-y:auto;padding:18px 16px 8px;display:flex;flex-direction:column;gap:10px;background:#F6F7F8;overscroll-behavior:contain}
.b{max-width:86%;padding:10px 13px;border-radius:16px;font:400 15px/1.45 var(--nv-font);white-space:pre-wrap;overflow-wrap:anywhere}
.b.a{align-self:flex-start;background:#fff;border:1px solid #E6E8EB;border-bottom-left-radius:6px}
.b.u{align-self:flex-end;background:${A};color:#fff;border-bottom-right-radius:6px}
.b.t{color:#6B7280;font-style:italic}
.c{align-self:flex-start;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;margin:-2px 0 4px;border-radius:999px;background:#fff;border:1.5px solid ${A};color:${A};font:600 14px/1 var(--nv-font);text-decoration:none}
.c:hover{background:${A};color:#fff}
.qs{display:flex;flex-wrap:wrap;gap:8px;padding:2px 0 6px}
.q{min-height:36px;padding:0 13px;border-radius:999px;border:1px solid #D7DBE0;background:#fff;color:#14161A;font:500 13.5px/1 var(--nv-font);cursor:pointer}
.q:hover{border-color:${A};color:${A}}
.f{display:flex;gap:8px;padding:10px 12px 6px;border-top:1px solid #ECEEF0;background:#fff}
.i{flex:1;min-width:0;min-height:44px;max-height:120px;padding:11px 14px;border:1px solid #D7DBE0;border-radius:14px;font:400 16px/1.35 var(--nv-font);color:#14161A;resize:none;background:#fff}
.i:focus{outline:none;border-color:${A};box-shadow:0 0 0 3px color-mix(in srgb,${A} 18%,transparent)}
.s{width:44px;height:44px;flex:none;border:0;border-radius:14px;background:${A};color:#fff;cursor:pointer;display:grid;place-items:center}
.s:disabled{opacity:.45;cursor:default}
.n{display:flex;justify-content:space-between;gap:10px;padding:2px 14px 12px;background:#fff;font:400 11.5px/1.4 var(--nv-font);color:#6B7280}
.r{border:0;background:none;padding:0;color:#6B7280;font:inherit;text-decoration:underline;cursor:pointer;white-space:nowrap}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
</style>
<div class="w">
<button class="l" type="button" aria-label="${T.launch} ${T.open}"><span class="av"><i></i></span><span class="tx">${T.launch}</span></button>
<section class="p" role="dialog" aria-modal="false" aria-label="${T.title}" hidden>
<header class="h"><span class="av"><i></i></span><span class="sp"><b>${T.title}</b><small>${T.sub}</small></span>
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
    host.style.setProperty("--nv-font", getComputedStyle(document.body).fontFamily || "system-ui, sans-serif");

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
      sendBtn.disabled = true;
      root.querySelector(".qs")?.remove();
      st.msgs.push({ role: "user", text });
      save();
      bubble("user", text);
      const typing = bubble("assistant", T.typing);
      typing.classList.add("t");
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
