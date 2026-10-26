/*
 * Consentimiento + retargeting de neuri.tech (Meta Pixel).
 * APAGADO: con ENABLED=false no muestra banner ni carga nada. El sitio sigue igual que hoy
 * (solo PostHog anónimo, sin cookies). Ver docs/RETARGETING.md para encenderlo.
 *
 * Reglas:
 * - Nada de anuncios se carga hasta que la persona pulsa «Aceptar». «Rechazar» pesa lo mismo.
 * - Do Not Track / Global Privacy Control = rechazo automático, sin banner.
 * - La elección dura 12 meses (localStorage, solo para recordar la respuesta).
 * - Cualquier enlace con [data-consent-open] vuelve a abrir el banner (pie de página).
 * - Vista previa sin cargar el pixel: agrega ?consent_preview=1 a cualquier URL.
 */
(function () {
  var ENABLED = false;      // ← encender aquí (ver docs/RETARGETING.md)
  var PIXEL_ID = '';        // ← ID del dataset de Meta (Events Manager)
  var KEY = 'neuri_consent_v1';
  var MAX_AGE = 365 * 24 * 3600 * 1000;

  var w = window, d = document, l = location;
  var preview = /[?&]consent_preview=1/.test(l.search);
  if (!preview && (!ENABLED || !PIXEL_ID)) return;

  var optOut = navigator.doNotTrack === '1' || w.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  var en = /^en/i.test(d.documentElement.lang || '') || /^\/en\//.test(l.pathname);
  var T = en ? {
    title: 'Can we show you Neuri ads later?',
    body: 'With your OK we use Meta’s pixel to remember you visited, so Neuri ads can reach you on Facebook and Instagram. Our anonymous analytics doesn’t depend on this.',
    yes: 'Accept', no: 'Decline', more: 'Privacy', href: '/en/legal/#site-h'
  } : {
    title: '¿Te podemos mostrar anuncios de Neuri después?',
    body: 'Si aceptas, usamos el pixel de Meta para recordar que nos visitaste y que los anuncios de Neuri te lleguen en Facebook e Instagram. Nuestra analítica anónima no depende de esto.',
    yes: 'Aceptar', no: 'Rechazar', more: 'Privacidad', href: '/legal/#sitio-h'
  };

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (v && (Date.now() - v.t) < MAX_AGE) return v.c;
    } catch (e) {}
    return null;
  }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify({ c: c, t: Date.now() })); } catch (e) {} }

  var loaded = false;
  function loadPixel() {
    if (loaded || !PIXEL_ID || preview) return;
    loaded = true;
    /* Snippet oficial de Meta Pixel */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(w, d, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    w.fbq('consent', 'grant');
    w.fbq('init', PIXEL_ID);
    w.fbq('track', 'PageView');
  }
  // analytics.js llama esto en signup_submitted; sin consentimiento no hace nada.
  w.neuriAdsTrack = function (ev, props) {
    if (loaded && w.fbq) try { w.fbq('track', ev, props || {}); } catch (e) {}
  };

  var css = '' +
    '.nc-bar{position:fixed;z-index:9999;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;' +
    'background:var(--nc-bg);color:var(--nc-ink);border:1px solid var(--nc-line);border-radius:20px;' +
    'padding:20px 20px 16px;box-shadow:0 18px 50px rgba(0,0,0,.28);font:400 15px/1.5 "Geist",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
    'transform:translateY(16px);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .45s}' +
    '.nc-bar.on{transform:none;opacity:1}' +
    '@media (prefers-reduced-motion:reduce){.nc-bar{transition:none}}' +
    '.nc-k{display:flex;align-items:center;gap:8px;font:500 11.5px/1 "Geist Mono",ui-monospace,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--nc-acc);margin:0 0 10px}' +
    '.nc-k i{width:8px;height:8px;border-radius:50%;background:var(--nc-acc);box-shadow:0 0 0 4px var(--nc-glow)}' +
    '.nc-bar h2{margin:0 0 6px;font-size:18px;line-height:1.25;font-weight:700;letter-spacing:-.02em;color:var(--nc-ink)}' +
    '.nc-bar p{margin:0 0 16px;color:var(--nc-text)}' +
    '.nc-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
    '.nc-btn{flex:1 1 120px;min-height:46px;border-radius:999px;font:600 15px/1 inherit;font-family:inherit;cursor:pointer;border:1.5px solid var(--nc-ink);transition:background .2s,color .2s,border-color .2s}' +
    '.nc-yes{background:var(--nc-ink);color:var(--nc-bg)}.nc-yes:hover{background:var(--nc-acc);border-color:var(--nc-acc);color:var(--nc-on-acc)}' +
    '.nc-no{background:transparent;color:var(--nc-ink)}.nc-no:hover{border-color:var(--nc-acc);color:var(--nc-acc)}' +
    '.nc-more{flex-basis:100%;text-align:center;font-size:13px;color:var(--nc-muted);margin-top:4px;min-height:32px;display:inline-flex;align-items:center;justify-content:center}' +
    '.nc-more:hover{color:var(--nc-acc)}' +
    '.nc-btn:focus-visible,.nc-more:focus-visible{outline:3px solid var(--nc-acc);outline-offset:3px}';

  // Paleta por producto (misma fuente que assets/brand.css).
  var P = {
    home:       ['#0B1118', '#E9EEF2', '#B7C2CC', '#9AA6B2', '#1B2530', '#8FE0B4', '#04060A'],
    bots:       ['#FFFFFF', '#05080D', '#3D4A44', '#56635C', '#E1E3DC', '#0B5E3A', '#FFFFFF'],
    bazar:      ['#FFFFFF', '#05080D', '#4E463E', '#5E554C', '#E6DBC9', '#B4441A', '#FFFFFF'],
    consulting: ['#FFFFFF', '#0A1A14', '#4B5B54', '#5E6B64', '#E4E1DA', '#1F7A52', '#FFFFFF'],
    marketing:  ['#FFFFFF', '#0B1118', '#34404A', '#5B6670', '#EADFD5', '#C2341D', '#FFFFFF']
  };
  function brand() {
    var b = d.documentElement.getAttribute('data-brand');
    if (P[b]) return b;
    var p = l.pathname.replace(/^\/en/, '');
    if (/^\/(bazar)/.test(p)) return 'bazar';
    if (/^\/(sigue-disponible|still-available|bots)/.test(p)) return 'bots';
    if (/^\/(consultoria|ai-consulting)/.test(p)) return 'consulting';
    if (/^\/marketing/.test(p)) return 'marketing';
    return 'home';
  }

  var bar;
  function show() {
    if (bar) { bar.classList.add('on'); return; }
    var c = P[brand()];
    var st = d.createElement('style'); st.textContent = css; d.head.appendChild(st);
    bar = d.createElement('section');
    bar.className = 'nc-bar';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-labelledby', 'nc-t');
    bar.setAttribute('aria-describedby', 'nc-d');
    bar.style.cssText = '--nc-bg:' + c[0] + ';--nc-ink:' + c[1] + ';--nc-text:' + c[2] + ';--nc-muted:' + c[3] + ';--nc-line:' + c[4] + ';--nc-acc:' + c[5] + ';--nc-on-acc:' + c[6] + ';--nc-glow:' + c[5] + '33';
    bar.innerHTML = '<div class="nc-k"><i></i>Neuri</div>' +
      '<h2 id="nc-t">' + T.title + '</h2><p id="nc-d">' + T.body + '</p>' +
      '<div class="nc-row"><button type="button" class="nc-btn nc-no" data-c="no">' + T.no + '</button>' +
      '<button type="button" class="nc-btn nc-yes" data-c="yes">' + T.yes + '</button>' +
      '<a class="nc-more" href="' + T.href + '">' + T.more + '</a></div>';
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('[data-c]'); if (!b) return;
      var c = b.getAttribute('data-c') === 'yes' ? 'granted' : 'denied';
      if (!preview) save(c);
      if (c === 'granted') loadPixel();
      else if (w.fbq) try { w.fbq('consent', 'revoke'); } catch (e2) {}
      bar.classList.remove('on');
    });
    d.body.appendChild(bar);
    requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add('on'); }); });
  }
  w.neuriConsent = { open: show };

  function start() {
    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-consent-open]');
      if (a) { e.preventDefault(); show(); }
    });
    if (preview) { show(); return; }
    if (optOut) return;
    var c = read();
    if (c === 'granted') loadPixel();
    else if (c === null) setTimeout(show, 1200);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', start); else start();
})();
