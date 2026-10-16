/* Idioma por país (neuri.tech es sitio estático en GitHub Pages: no hay IP del visitante,
   así que el país se deduce de la zona horaria del dispositivo).
   - México → español; Estados Unidos → inglés; otro país → se queda la página que abrió.
   - Si la persona elige idioma con el link «English»/«Español», esa elección manda
     (se guarda en localStorage y se respeta en todas las páginas).
   - ?lang=es|en en la URL también fija la elección. Buscadores y bots no se redirigen. */
(() => {
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
    if (/bot|crawl|spider|slurp|lighthouse|preview|facebookexternalhit/i.test(navigator.userAgent) || navigator.webdriver) return;

    const here = location.pathname.replace(/index\.html$/, "");
    const cur = here === alt.en.pathname ? "en" : here === alt.es.pathname ? "es" : null;
    if (!cur) return;

    let want = null;
    try {
      want = localStorage.getItem(KEY);
    } catch (_) {}
    if (want !== "es" && want !== "en") {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (/^America\/(Mexico_City|Cancun|Merida|Monterrey|Matamoros|Chihuahua|Ciudad_Juarez|Ojinaga|Mazatlan|Bahia_Banderas|Hermosillo|Tijuana|Ensenada|Santa_Isabel)$/.test(tz)) want = "es";
      else if (/^(America\/(New_York|Detroit|Kentucky\/.+|Indiana\/.+|Louisville|Chicago|Menominee|North_Dakota\/.+|Denver|Boise|Phoenix|Los_Angeles|Anchorage|Juneau|Sitka|Metlakatla|Yakutat|Nome|Adak)|Pacific\/Honolulu|US\/.+)$/.test(tz)) want = "en";
    }
    if (!want || want === cur) return;
    const to = alt[want];
    location.replace(to.pathname + location.search + location.hash);
  } catch (_) {}
})();
