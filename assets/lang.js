/* Idioma por país (neuri.tech es sitio estático en GitHub Pages: no hay IP del visitante,
   QA #8 4ª vuelta: NUNCA redirige por zona horaria; solo ofrece una barra con el otro idioma.
   así que el país se deduce de la zona horaria del dispositivo).
   - México → español; Estados Unidos → inglés; otro país → se queda la página que abrió.
   - Una URL con idioma se muestra siempre en ese idioma si la persona ya eligió uno con «English»/«Español»
     (se guarda en localStorage y apaga la regla de zona horaria; QA #8). En EE. UU. el inglés automático
     solo aplica si el teléfono está en inglés.
   - ?lang=es|en en la URL también fija la elección. Buscadores y bots no se redirigen. */
(() => {
  // data-solo-param: la portada solo obedece ?lang explícito (no redirige por zona horaria).
  const soloParam = document.currentScript?.hasAttribute("data-solo-param");
  try {
    const KEY = "neuri-lang";
    const alt = {};
    for (const l of document.querySelectorAll('link[rel="alternate"][hreflang]')) {
      const h = l.getAttribute("hreflang");
      if (h === "es" || h === "en") alt[h] = new URL(l.href, location.href);
    }
    const store = (v) => {
      try {
        localStorage.setItem(KEY, v);
      } catch (_) {}
    };
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "es" || q === "en") store(q);

    // Recordar la elección cuando la persona cambia de idioma con el link.
    document.addEventListener(
      "click",
      (e) => {
        const a = e.target?.closest?.("a[hreflang]");
        const h = a?.getAttribute("hreflang");
        if (h === "es" || h === "en") store(h);
      },
      true,
    );

    if (!alt.es || !alt.en) return;
    // Barra «Ver esta página en …» (no redirige: QA #8, 4ª vuelta — la URL con idioma manda siempre).
    const suggest = (to) => {
      const en = to === "en";
      const show = () => {
        if (document.getElementById("neuri-lang-sug")) return;
        // Barra juguetona (18-nov): saludo que se mueve, cambio con un toque; se cierra y no vuelve.
        if (!document.getElementById("neuri-lang-css")) {
          const st = document.createElement("style");
          st.id = "neuri-lang-css";
          st.textContent =
            "#neuri-lang-sug{position:relative;z-index:50;display:flex;gap:10px 14px;align-items:center;justify-content:center;flex-wrap:wrap;padding:8px 16px;background:linear-gradient(90deg,rgba(143,224,180,.16),rgba(243,179,143,.14)),#0B0F14;color:#F2F5F7;font:500 14.5px/1.4 Geist,system-ui,sans-serif;border-bottom:1px solid rgba(143,224,180,.28);animation:nls-in .5s cubic-bezier(.2,.8,.2,1) both}" +
            "#neuri-lang-sug .wave{display:inline-block;transform-origin:70% 80%;animation:nls-wave 1.8s ease-in-out .4s 2}" +
            "#neuri-lang-sug .go{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 16px;border-radius:999px;background:#8FE0B4;color:#04060A;font-weight:600;text-decoration:none;transition:transform .2s,box-shadow .2s}" +
            "#neuri-lang-sug .go:hover{transform:translateY(-1px);box-shadow:0 8px 24px -6px rgba(143,224,180,.6);color:#04060A}" +
            "#neuri-lang-sug .stay{background:transparent;color:#C9D2D9;border:0;min-height:44px;padding:0 8px;font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(201,210,217,.4)}" +
            "#neuri-lang-sug .stay:hover{color:#F2F5F7}" +
            "@keyframes nls-in{from{transform:translateY(-100%);opacity:0}to{transform:none;opacity:1}}" +
            "@keyframes nls-wave{0%,60%,100%{transform:rotate(0)}10%,30%{transform:rotate(16deg)}20%,40%{transform:rotate(-8deg)}}" +
            "@media(prefers-reduced-motion:reduce){#neuri-lang-sug,#neuri-lang-sug .wave{animation:none}}";
          document.head.appendChild(st);
        }
        const bar = document.createElement("div");
        bar.id = "neuri-lang-sug";
        bar.setAttribute("role", "region");
        bar.setAttribute("aria-label", en ? "Language" : "Idioma");
        bar.lang = to;
        const hi = document.createElement("span");
        hi.innerHTML = '<span class="wave" aria-hidden="true">👋</span> ' + (en ? "Hi there! This page speaks English too." : "¡Hola! Esta página también habla español.");
        const a = document.createElement("a");
        a.className = "go";
        a.href = alt[to].pathname + "?lang=" + to + location.hash;
        a.hreflang = to;
        a.textContent = en ? "Switch to English →" : "Cambiar a español →";
        const x = document.createElement("button");
        x.type = "button";
        x.className = "stay";
        x.lang = en ? "es" : "en";
        x.textContent = en ? "Seguir en español" : "Stay in English";
        x.addEventListener("click", () => {
          store(en ? "es" : "en");
          bar.remove();
        });
        bar.append(hi, a, x);
        document.body.prepend(bar);
      };
      if (document.body) show();
      else document.addEventListener("DOMContentLoaded", show);
    };
    const forzar = new URLSearchParams(location.search).get("banner");
    if (forzar === "es" || forzar === "en") {
      suggest(forzar);
      return;
    }
    // T15: un ?lang=es|en explícito siempre lleva a su par (también en navegadores automatizados y vistas previas).
    const here0 = location.pathname.replace(/index\.html$/, "");
    if ((q === "es" || q === "en") && here0 !== alt[q].pathname && (here0 === alt.es.pathname || here0 === alt.en.pathname)) {
      location.replace(alt[q].pathname + location.search + location.hash);
      return;
    }
    // 572: quien ya eligió otro idioma y vuelve a una URL en este: se le ofrece su idioma (sin redirigir, QA #8).
    if (!/bot|crawl|spider|slurp|lighthouse|preview|facebookexternalhit/i.test(navigator.userAgent) && !navigator.webdriver) {
      let elegido = null;
      try {
        elegido = localStorage.getItem(KEY);
      } catch (_) {}
      const aqui = here0 === alt.en.pathname ? "en" : here0 === alt.es.pathname ? "es" : null;
      if ((elegido === "es" || elegido === "en") && aqui && aqui !== elegido) {
        suggest(elegido);
        return;
      }
    }
    if (soloParam) {
      // Auditoría bazar 18-oct (B-A6): la portada no redirige, pero a un navegador en inglés sin elección guardada
      // le ofrece «View in English» arriba (se cierra y se recuerda; bots y pruebas automatizadas no lo ven).
      let saved = null;
      try {
        saved = localStorage.getItem(KEY);
      } catch (_) {}
      const nl = (navigator.languages && navigator.languages[0]) || navigator.language || "";
      if (saved || q || !/^en\b/i.test(nl) || /bot|crawl|spider|slurp|lighthouse|preview|facebookexternalhit/i.test(navigator.userAgent) || navigator.webdriver) return;
      const here1 = location.pathname.replace(/index\.html$/, "");
      if (here1 !== alt.es.pathname) return;
      suggest("en");
      return;
    }
    if (/bot|crawl|spider|slurp|lighthouse|preview|facebookexternalhit/i.test(navigator.userAgent) || navigator.webdriver) return;

    const here = location.pathname.replace(/index\.html$/, "");
    const cur = here === alt.en.pathname ? "en" : here === alt.es.pathname ? "es" : null;
    if (!cur) return;

    // QA #8 (2ª vuelta, 25-oct): una URL con idioma (/sigue-disponible/ o /en/still-available/) se muestra SIEMPRE en
    // ese idioma, venga de donde venga: los links internos ya apuntan al idioma correcto y el botón EN/ES lleva al par.
    // La elección guardada solo evita que la zona horaria cambie el idioma (no redirige por sí sola).
    let saved = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch (_) {}
    if (saved === "es" || saved === "en") return;
    // QA #8 (3ª vuelta): sin elección guardada, la zona horaria decide solo en la primera página de la sesión;
    // después, la URL que se abre (/sigue-disponible/ o /en/still-available/) se queda en su idioma.
    try {
      if (sessionStorage.getItem("neuri-lang-auto")) return;
      sessionStorage.setItem("neuri-lang-auto", "1");
    } catch (_) {}
    // A234: un link que armó Neuri en este idioma (tarjeta/QR impresos, correos, referidos, demo precargado) se queda en
    // ese idioma: a un vendedor que lee español en Phoenix la zona horaria lo mandaría al inglés.
    const sp = new URLSearchParams(location.search);
    const made = ["src", "negocio", "productos", "business", "products", "alta", "ref", "moneda", "giro", "utm_source", "utm_campaign"].some((k) => sp.has(k));
    if (made) return;
    let want = null;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const nl = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    if (/^es\b/i.test(nl) || /^America\/(Mexico_City|Cancun|Merida|Monterrey|Matamoros|Chihuahua|Ciudad_Juarez|Ojinaga|Mazatlan|Bahia_Banderas|Hermosillo|Tijuana|Ensenada|Santa_Isabel)$/.test(tz)) want = "es";
    // En EE. UU. solo pasa al inglés si el teléfono también está en inglés: quien lo tiene en español se queda en español.
    else if (/^en\b/i.test(nl) && /^(America\/(New_York|Detroit|Kentucky\/.+|Indiana\/.+|Louisville|Chicago|Menominee|North_Dakota\/.+|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak)|Pacific\/Honolulu|US\/.+)$/.test(tz)) want = "en";
    if (!want || want === cur) return;
    // QA #8 (4ª vuelta, 28-oct): ya no redirige; un link en español se abre en español y se ofrece el otro idioma.
    suggest(want);
  } catch (_) {}
})();
