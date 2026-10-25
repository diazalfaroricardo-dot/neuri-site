/* Idioma por país (neuri.tech es sitio estático en GitHub Pages: no hay IP del visitante,
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
    // T15: un ?lang=es|en explícito siempre lleva a su par (también en navegadores automatizados y vistas previas).
    const here0 = location.pathname.replace(/index\.html$/, "");
    if ((q === "es" || q === "en") && here0 !== alt[q].pathname && (here0 === alt.es.pathname || here0 === alt.en.pathname)) {
      location.replace(alt[q].pathname + location.search + location.hash);
      return;
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
      const show = () => {
        if (document.getElementById("neuri-lang-sug")) return;
        const bar = document.createElement("div");
        bar.id = "neuri-lang-sug";
        bar.setAttribute("role", "region");
        bar.setAttribute("aria-label", "Language");
        bar.lang = "en";
        bar.style.cssText = "display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;padding:6px 16px;background:#0B0F14;color:#F2F5F7;font:500 14px/1.4 system-ui,sans-serif;border-bottom:1px solid #26303A";
        const a = document.createElement("a");
        a.href = alt.en.pathname + "?lang=en";
        a.hreflang = "en";
        a.textContent = "View this page in English →";
        a.style.cssText = "color:#F2F5F7;text-decoration:underline;display:inline-flex;align-items:center;min-height:44px;padding:0 4px";
        const x = document.createElement("button");
        x.type = "button";
        x.textContent = "Seguir en español";
        x.style.cssText = "background:transparent;color:#C9D2D9;border:1px solid #3A4652;border-radius:8px;min-height:44px;padding:0 12px;font:inherit;cursor:pointer";
        x.addEventListener("click", () => {
          store("es");
          bar.remove();
        });
        bar.append(a, x);
        document.body.prepend(bar);
      };
      if (document.body) show();
      else document.addEventListener("DOMContentLoaded", show);
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
    if (/^America\/(Mexico_City|Cancun|Merida|Monterrey|Matamoros|Chihuahua|Ciudad_Juarez|Ojinaga|Mazatlan|Bahia_Banderas|Hermosillo|Tijuana|Ensenada|Santa_Isabel)$/.test(tz)) want = "es";
    // En EE. UU. solo pasa al inglés si el teléfono también está en inglés: quien lo tiene en español se queda en español.
    else if (/^en\b/i.test(nl) && /^(America\/(New_York|Detroit|Kentucky\/.+|Indiana\/.+|Louisville|Chicago|Menominee|North_Dakota\/.+|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak)|Pacific\/Honolulu|US\/.+)$/.test(tz)) want = "en";
    if (!want || want === cur) return;
    const to = alt[want];
    location.replace(to.pathname + location.search + location.hash);
  } catch (_) {}
})();
