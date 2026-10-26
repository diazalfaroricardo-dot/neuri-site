/*
 * Analítica de neuri.tech con PostHog (US cloud, proyecto 659231).
 * - Sin cookies ni localStorage (persistence: 'memory'): cuenta visitas de forma anónima, sin banner.
 * - Sin grabación de sesiones, respeta Do Not Track, no corre en localhost.
 * - Eventos propios SIN datos personales: nunca nombres, correos, teléfonos, @usuarios ni texto libre.
 *   cta_click {label, page} · signup_step {step, giro, product} · signup_submitted {giro, product}
 *   language_switch {from, to} · outbound_click {host} · demo_scenario {value} (pestañas de la demo de neuri.bots)
 */
(function () {
  var w = window, d = document, l = location;
  // Consentimiento/retargeting (apagado por defecto en assets/consent.js; ver docs/RETARGETING.md).
  (function () { var c = d.createElement('script'); c.src = '/assets/consent.js'; c.defer = true; (d.head || d.documentElement).appendChild(c); })();
  var dnt = navigator.doNotTrack === '1' || w.doNotTrack === '1' || navigator.msDoNotTrack === '1';
  var local = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(l.hostname) || l.protocol === 'file:';
  if (dnt || (local && !w.__NEURI_ANALYTICS_FORCE)) return;

  // Snippet oficial de posthog-js (carga array.js desde us-assets.i.posthog.com).
  // A224: array.js (~100 KB) se pide DESPUÉS de que la página terminó de cargar (load + idle), para no
  // competir con la página en señal mala (bazares). Los eventos se encolan en el stub y no se pierden.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(function(){var go=function(){(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r)};var idle=function(){(window.requestIdleCallback||function(f){setTimeout(f,1)})(go,{timeout:3000})};"complete"===t.readyState?idle():window.addEventListener("load",idle)})();var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(d,w.posthog||[]);

  // Parámetros que no deben salir del navegador (ids de alta/referido, correos, teléfonos).
  var DROP = /^(alta|ref|email|correo|phone|tel|whatsapp|nombre|name)$/i;
  function cleanUrl(u) {
    if (!u || typeof u !== 'string') return u;
    try {
      var x = new URL(u);
      Array.from(x.searchParams.keys()).forEach(function (k) { if (DROP.test(k)) x.searchParams.delete(k); });
      return x.toString();
    } catch (e) { return u; }
  }
  var PII = /@|\d{6,}|https?:\/\//;

  w.posthog.init('phc_sLLyPxfmbysuUJQrLHoPzCZDuzkUinD7o8ix8EPZvtPo', {
    api_host: 'https://us.i.posthog.com',
    persistence: 'memory',
    person_profiles: 'identified_only',
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: true,
    disable_surveys: true,
    respect_dnt: true,
    ip: false,
    mask_all_text: false,
    mask_all_element_attributes: false,
    before_send: function (ev) {
      if (!ev || !ev.properties) return ev;
      var p = ev.properties;
      ['$current_url', '$referrer', '$initial_referrer', '$pathname'].forEach(function (k) { if (p[k]) p[k] = cleanUrl(p[k]); });
      // Autocapture: si el texto de un elemento parece dato personal, no se manda.
      if (p.$el_text && PII.test(p.$el_text)) delete p.$el_text;
      if (typeof p.$elements_chain === 'string') p.$elements_chain = p.$elements_chain
        .replace(/(mailto|tel|sms):[^"]*/gi, '$1:')
        .replace(/text="[^"]*(@|\d{6,})[^"]*"/g, 'text=""');
      if (p.$external_click_url && /^(mailto|tel|sms):/i.test(p.$external_click_url)) p.$external_click_url = p.$external_click_url.split(':')[0] + ':';
      if (Array.isArray(p.$elements)) p.$elements.forEach(function (el) {
        if (el.$el_text && PII.test(el.$el_text)) delete el.$el_text;
        if (el.attr__href && /^(mailto|tel|sms):/i.test(el.attr__href)) el.attr__href = el.attr__href.split(':')[0] + ':';
        if (el.href && /^(mailto|tel|sms):/i.test(el.href)) el.href = el.href.split(':')[0] + ':';
      });
      return ev;
    }
  });

  var path = l.pathname;
  var product = /^\/(bazar|en)\/?$/.test(path) ? 'bazar' : /^\/(sigue-disponible|en\/still-available)\//.test(path) ? 'bots' : path === '/' ? 'home' : 'other';
  function cap(name, props) {
    try { w.posthog.capture(name, props); } catch (e) {}
    // Meta Pixel solo si la persona aceptó (consent.js); sin datos personales.
    if (name === 'signup_submitted' && w.neuriAdsTrack) w.neuriAdsTrack('Lead', { content_category: props && props.product });
  }
  // Para eventos propios desde las páginas (p. ej. demo_scenario {value}); sin datos personales.
  w.nTrack = function (name, props) { cap(String(name).slice(0, 40), props); };
  function giro() { var g = d.querySelector('input[name=giro]:checked'); return g ? String(g.value).replace(/[^a-z_-]/gi, '').slice(0, 24) : undefined; }
  function label(el) {
    var t = el.getAttribute('data-cta') || el.getAttribute('aria-label') || el.textContent || '';
    t = t.replace(/\s+/g, ' ').trim().slice(0, 60);
    return PII.test(t) ? '' : t;
  }

  function init() {
    // Los formularios no los ve el autocapture: solo nuestros eventos sin datos personales.
    d.querySelectorAll('form, #ok, #resumen').forEach(function (f) { f.classList.add('ph-no-capture'); });

    d.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a, button');
      if (!a) return;
      if (a.tagName === 'A') {
        var href = a.getAttribute('href') || '';
        if (/^(mailto|tel|sms):/i.test(href)) { cap('outbound_click', { host: href.split(':')[0], page: path }); return; }
        var u; try { u = new URL(a.href, l.href); } catch (_) { return; }
        if (u.host && u.host !== l.host) { cap('outbound_click', { host: u.host, page: path }); }
        if (a.hasAttribute('hreflang') && u.host === l.host) {
          cap('language_switch', { from: d.documentElement.lang || '', to: a.getAttribute('hreflang'), page: path });
          return;
        }
      }
      var isCta = a.matches('[data-cta], .btn, .x-btn, .b-btn, [data-plan], a[href*="#alta"], a[href*="#prueba"], a[href*="#asistente"], a[href*="calendly.com"]') ||
        /(^|\s)(btn|cta)/.test(a.className || '');
      // Los botones dentro de formularios (pasos del alta, chat de prueba) ya se miden con signup_step.
      if (isCta && !(a.tagName === 'BUTTON' && a.closest('form'))) cap('cta_click', { label: label(a), page: path, product: product });
    }, true);

    // Alta por pasos: observa los .paso (data-step en neuri.bots, data-paso en neuri.bazar).
    var steps = d.querySelectorAll('.paso[data-step], .paso[data-paso]');
    var last = null, sent = false;
    function check() {
      for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        if (s.hidden || s.offsetParent === null && getComputedStyle(s).display === 'none') continue;
        var n = +(s.getAttribute('data-step') || s.getAttribute('data-paso'));
        if (n === last) return;
        last = n;
        if (s.classList.contains('listo')) { if (!sent) { sent = true; cap('signup_submitted', { giro: giro(), product: product }); } }
        else cap('signup_step', { step: n, giro: giro(), product: product });
        return;
      }
    }
    if (steps.length) {
      var mo = new MutationObserver(check);
      steps.forEach(function (s) { mo.observe(s, { attributes: true, attributeFilter: ['hidden', 'class', 'style'] }); });
    }
    var ok = d.getElementById('ok');
    if (ok) new MutationObserver(function () {
      if (!ok.hidden && !sent) { sent = true; cap('signup_submitted', { giro: giro(), product: product }); }
    }).observe(ok, { attributes: true, attributeFilter: ['hidden'] });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
