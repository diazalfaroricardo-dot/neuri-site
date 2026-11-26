/* neuri.bots · pasada premium (aprobada 21-nov-2026): hero C, red de fondo, noche con reloj y
   botones magnéticos. Sin GSAP o con prefers-reduced-motion todo queda visible y quieto. */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches, G = window.gsap, ST = window.ScrollTrigger;
  if (G && ST) G.registerPlugin(ST);
  var EN = (document.documentElement.lang || '').slice(0, 2) === 'en';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var hero = $('#inicio'), stage = $('.np-stage');

  /* ---------- red de fondo: puntos que se acomodan y se conectan ---------- */
  (function () {
    var cv = $('.np-red'); if (!cv) return;
    var ctx = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2), W, H, P = [], vis = true, t0 = performance.now(), raf, mx = -1e4, my = -1e4;
    function size() {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(60 * Math.min(1.3, W * H / (1440 * 820)) + 18); P = [];
      for (var i = 0; i < n; i++) { var hx = Math.random() < .55 ? W * (.5 + Math.random() * .5) : Math.random() * W; P.push({ hx: hx, hy: Math.random() * H, x: W / 2 + (Math.random() - .5) * W * 1.4, y: H / 2 + (Math.random() - .5) * H * 1.4, r: Math.random() < .12 ? 2.4 : 1.2 + Math.random(), ph: Math.random() * 6.28, s: .2 + Math.random() * .5, acc: Math.random() < .07 }); }
    }
    function frame(now) {
      var t = (now - t0) / 1000, e = RM ? 1 : 1 - Math.pow(1 - Math.min(1, t / 2.4), 4);
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) { var p = P[i], tx = p.hx + Math.sin(t * p.s + p.ph) * 10, ty = p.hy + Math.cos(t * p.s * .8 + p.ph) * 8, dx = tx - mx, dy = ty - my, md = dx * dx + dy * dy; if (md < 16000) { var d = Math.sqrt(md) || 1, f = (16000 - md) / 16000 * 26; tx += dx / d * f; ty += dy / d * f; } p.cx = p.x + (tx - p.x) * e; p.cy = p.y + (ty - p.y) * e; }
      for (i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var a = P[i], b = P[j], ex = a.cx - b.cx, ey = a.cy - b.cy, dd = ex * ex + ey * ey; if (dd < 16900) { ctx.strokeStyle = 'rgba(11,94,58,' + ((1 - Math.sqrt(dd) / 130) * .15 * e).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(a.cx, a.cy); ctx.lineTo(b.cx, b.cy); ctx.stroke(); } }
      for (i = 0; i < P.length; i++) { p = P[i]; var pu = p.acc ? .6 + .4 * Math.sin(t * 2 + p.ph) : 1; ctx.fillStyle = p.acc ? '#22A866' : '#0B5E3A'; ctx.globalAlpha = (p.acc ? 1 : .36) * e * pu; ctx.beginPath(); ctx.arc(p.cx, p.cy, p.acc ? 3 : p.r, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1;
      if (!RM && vis) raf = requestAnimationFrame(frame);
    }
    size(); frame(performance.now());
    addEventListener('resize', function () { size(); if (RM) frame(performance.now()); });
    hero.addEventListener('pointermove', function (ev) { var r = cv.getBoundingClientRect(); mx = ev.clientX - r.left; my = ev.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mx = my = -1e4; });
    if (!RM && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } }).observe(cv);
  })();

  /* ---------- hero C: celular 3D que contesta ---------- */
  var IG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  var WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M4 20l1.2-3.9A8.3 8.3 0 1 1 8 19z"/></svg>';
  var FB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3-1.7c.9.3 1.8.4 2.7.4 5 0 9-3.7 9-8.3S17 3 12 3z"/></svg>';
  var CHK = '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  // Solo canales que contestan hoy (Instagram, Facebook y WhatsApp): nada que no exista.
  var CHATS = EN ? [
    ['Laura M.', 'ig', 'Is the white wardrobe still available?', 'Yes, it’s still available. It’s $1,800 and you can pick it up today 5–8 pm. Want me to hold it?', 'Answered · 2.1 s'],
    ['Diego R.', 'fb', 'What’s your lowest? I’ll give you $1,200', 'Mariana decides on price. I’ll pass her your offer.', 'Passed to you', 1],
    ['Sofia L.', 'wa', 'Can you hold the coffee table for me?', 'Done, it’s on hold for you until tomorrow at 8 pm.', 'On hold · 1.9 s'],
    ['Carlos P.', 'fb', 'Do you take bank transfer?', 'Yes: cash or bank transfer. Want me to hold it?', 'Answered · 1.4 s'],
    ['Ana G.', 'ig', 'Where do you do pickups?', 'Pickups at Plaza Cardón, Monday to Saturday, 5–8 pm.', 'Answered · 1.7 s']
  ] : [
    ['Laura M.', 'ig', '¿Sigue disponible el ropero blanco?', 'Sí, sigue disponible. Cuesta $1,800 y lo recoges hoy de 5 a 8 pm. ¿Te lo aparto?', 'Contestada · 2.1 s'],
    ['Diego R.', 'fb', '¿En cuánto me lo dejas? Te doy $1,200', 'Ese precio lo decide Mariana. Le paso tu oferta.', 'Te lo pasó a ti', 1],
    ['Sofía L.', 'wa', 'Apártame la mesa de centro porfa', 'Listo, quedó apartada a tu nombre hasta mañana a las 8 pm.', 'Apartado · 1.9 s'],
    ['Carlos P.', 'fb', '¿Aceptas transferencia?', 'Sí: efectivo o transferencia. ¿Te lo aparto?', 'Contestada · 1.4 s'],
    ['Ana G.', 'ig', '¿Dónde entregas?', 'Entrego en Plaza Cardón de lunes a sábado, de 5 a 8 pm.', 'Contestada · 1.7 s']
  ];
  var TT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.2 4.3 5 4.5"/></svg>';
  var SMS = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M8 21l3-4"/></svg>';
  var ICO = { ig: IG, fb: FB, wa: WA, tt: TT, sms: SMS };
  var AHORA = EN ? 'now' : 'ahora', NAME = { ig: 'Instagram', fb: 'Facebook', wa: 'WhatsApp', tt: 'TikTok', sms: 'SMS' };
  /* Canales con bandera (sd.neuri.tech/estado): al encender TikTok o SMS se quita su «pronto» y entran
     a las notificaciones del celular; si WhatsApp se apaga, vuelve a decir «pronto». Sin respuesta, el
     HTML se queda como está (solo lo que hoy contesta). */
  var EXTRA = {
    tt: EN ? ['Vale T.', 'tt', 'Saw your TikTok, is the lamp still available?', 'Yes, it’s still available: $800. Want me to hold it?', 'Answered · 1.8 s']
           : ['Vale T.', 'tt', 'Vi tu TikTok, ¿sigue la lámpara?', 'Sí, sigue disponible: $800. ¿Te la aparto?', 'Contestada · 1.8 s'],
    sms: EN ? ['Rosa P.', 'sms', 'Hi! Do you deliver on Saturdays?', 'Yes, Saturdays 10 am–2 pm at Plaza Cardón.', 'Answered · 1.6 s']
            : ['Rosa P.', 'sms', '¡Hola! ¿Entregas los sábados?', 'Sí, los sábados de 10 a 2 en Plaza Cardón.', 'Contestada · 1.6 s']
  };
  var SLOT = { tt: 4, sms: 3 }, BASE = CHATS.slice(), hooks = [];
  function canales(st) {
    var on = { wa: st.whatsapp === 'on', tt: st.tiktokDm === 'on' || st.tiktok === 'on', sms: st.sms === 'on' }, cambio = false;
    $$('.np-can').forEach(function (el) {
      var t = (el.firstChild && el.textContent || '').trim(), k = /^WhatsApp/.test(t) ? 'wa' : /^TikTok/.test(t) ? 'tt' : /^SMS/.test(t) ? 'sms' : null;
      if (!k) return;
      var sm = el.querySelector('small');
      if (on[k]) { el.classList.remove('pronto'); if (sm) sm.remove(); }
      else if (k !== 'wa' || st.whatsapp === 'off') { el.classList.add('pronto'); if (!sm) { sm = document.createElement('small'); sm.textContent = EN ? 'soon' : 'pronto'; el.appendChild(sm); } }
    });
    ['tt', 'sms'].forEach(function (k) { var want = on[k] ? EXTRA[k] : BASE[SLOT[k]]; if (CHATS[SLOT[k]] !== want) { CHATS[SLOT[k]] = want; cambio = true; } });
    if (!on.wa) CHATS.forEach(function (c, i) { if (c[1] === 'wa') { CHATS[i] = [c[0], 'ig', c[2], c[3], c[4]]; cambio = true; } });
    if (cambio) hooks.forEach(function (f) { f(); });
  }
  if (window.fetch && /neuri\.tech$|^localhost$|^127\./.test(location.hostname)) {
    var ctl = window.AbortController ? new AbortController() : null; if (ctl) setTimeout(function () { ctl.abort(); }, 5000);
    fetch('https://sd.neuri.tech/estado', { mode: 'cors', credentials: 'omit', signal: ctl ? ctl.signal : undefined }).then(function (r) { return r.ok ? r.json() : null; }).then(function (st) { if (st) canales(st); }, function () {});
  }
  window.npCanales = canales;
  if (stage) (function () {
    var phone = $('.np-phone'), capas = $('.np-capas'), chat = $('.np-chat'), notis = $('.np-notis'), canal = $('.np-canal');
    var POS = [[-90, -300, 160], [180, -240, 90], [-215, 40, 220], [185, 150, 260], [-180, 245, 120]],
      // A 390 solo se ven 3 tarjetas: escalonadas izquierda/derecha para que no se enciman ni se corten.
      POSM = [[-88, -175, 160], [92, -55, 90], [-88, 140, 220]], nEls;
    // Vista previa premium-bots-hero (D-11, sin publicar): en escritorio solo 3 tarjetas con jerarquía —
    // la principal arriba a la izquierda (abajo de la barra), el regateo a la derecha y una pequeña atrás.
    POS = [[150, -215, 200], [175, 95, 110], [-120, 250, 20]];
    var h = ''; for (var i = 1; i <= 14; i++) h += '<i style="transform:translateZ(' + (-i) + 'px)"></i>'; capas.innerHTML = h;
    function notisHtml() { notis.innerHTML = CHATS.map(function (c) { return '<div class="np-noti ok"><span class="ap ' + c[1] + '">' + (ICO[c[1]] || IG) + '</span><b>' + esc(c[0]) + '<span>' + AHORA + '</span></b><span>' + esc(c[2]) + '</span><span class="r">' + CHK + esc(c[4]) + '</span></div>'; }).join(''); nEls = $$('.np-noti', notis); }
    notisHtml(); nEls.forEach(function (n) { n.classList.remove('ok'); });
    hooks.push(function () { notisHtml(); place(); });
    var base = { ry: -18, rx: 6, s: 1 }, tmx = 0, tmy = 0, cmx = 0, cmy = 0, on = false, raf, loopT, k = 0;
    function escala() { return innerWidth < 700 ? .62 : (innerHeight < 820 ? .86 : 1); }
    // Límites horizontales: #inicio recorta con overflow-x:clip, así que cada tarjeta se acota para no salirse (con su perspectiva).
    var escena = $('.np-escena'), room = null;
    function medir() { var e = escena.getBoundingClientRect(), s = hero.getBoundingClientRect(), c = e.left + e.width / 2, m = 12; var b = $('.cta-row > :last-child'), bl = 0; if (b) { var br = b.getBoundingClientRect(); if (br.bottom > e.top && br.right < c) bl = br.right + 4; } room = { r: Math.min(s.right, document.documentElement.clientWidth) - m - c, l: c - Math.max(s.left, bl, 0) - m }; }
    addEventListener('resize', function () { room = null; place(); });
    function fit(x, z, w) { if (!room) medir(); var f = 1600 / (1600 - z), half = w / 2; return Math.max(-(room.l / f - half), Math.min(room.r / f - half, x)); }
    function place() { var mv = innerWidth < 700; nEls.forEach(function (n, i) { var p = mv ? (POSM[i] || [POS[i][0] * .55, POS[i][1] * .55, POS[i][2]]) : POS[i]; n.style.setProperty('--x', fit(p[0] + cmx * p[2] * .25, p[2], n.offsetWidth) + 'px'); n.style.setProperty('--y', (p[1] + cmy * p[2] * .2) + 'px'); n.style.setProperty('--z', p[2] + 'px'); }); }
    function tick() { cmx += (tmx - cmx) * .06; cmy += (tmy - cmy) * .06; phone.style.transform = 'rotateY(' + (base.ry + cmx * 16) + 'deg) rotateX(' + (base.rx - cmy * 10) + 'deg) scale(' + base.s + ')'; place(); if (on) raf = requestAnimationFrame(tick); }
    hero.addEventListener('pointermove', function (ev) { var r = hero.getBoundingClientRect(); tmx = (ev.clientX - r.left) / r.width - .5; tmy = (ev.clientY - r.top) / r.height - .5; });
    function msg(cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; chat.appendChild(d); while (chat.children.length > 7) chat.removeChild(chat.firstChild); if (G && !RM) G.from(d, { y: 14, opacity: 0, duration: .5, ease: 'expo.out' }); return d; }
    function conv() {
      var c = CHATS[k % CHATS.length], n = nEls[k % nEls.length]; k++;
      if (canal) canal.textContent = NAME[c[1]] + (EN ? ' · answered by Neuri' : ' · contesta Neuri');
      msg('m in', esc(c[2])); n.classList.remove('ok');
      if (G && !RM) G.fromTo(n, { scale: .92 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.6)' });
      var t = msg('m esc', '<i></i><i></i><i></i>');
      loopT = setTimeout(function () { t.remove(); msg('m out' + (c[5] ? ' ti' : ''), esc(c[3])); msg('tag', esc(c[4])); n.classList.add('ok'); loopT = setTimeout(conv, 2200); }, 1300);
    }
    function start() {
      base.s = escala(); on = true;
      if (G && !RM) {
        var fin = base.s; base.ry = -75; base.rx = 24; base.s = fin * .7;
        G.to(base, { ry: -18, rx: 6, s: fin, duration: 1.8, ease: 'expo.out' });
        G.from(nEls, { opacity: 0, duration: 1, ease: 'expo.out', stagger: .12, delay: .5 });
        raf = requestAnimationFrame(tick); setTimeout(conv, 900);
      } else { tick(); on = false; var c = CHATS[0]; msg('m in', esc(c[2])); msg('m out', esc(c[3])); msg('tag', esc(c[4])); nEls.forEach(function (n) { n.classList.add('ok'); }); }
    }
    addEventListener('resize', function () { base.s = escala(); if (!on) tick(); });
    if ('IntersectionObserver' in window && !RM) new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !on) { on = true; raf = requestAnimationFrame(tick); } else if (!v) { on = false; cancelAnimationFrame(raf); } }).observe(stage);
    // entrada: el texto sube y luego entra el celular
    if (G && !RM) {
      document.documentElement.classList.add('js-np');
      G.timeline({ delay: .1 }).from('#inicio .hx-copy > *', { y: 18, opacity: 0, duration: .9, ease: 'expo.out', stagger: .07 }).add(start, '-=.7');
    } else start();
  })();

  /* ---------- la noche: el scroll mueve el reloj ---------- */
  (function () {
    var night = $('.night[data-night]'); if (!night || !G || !ST || RM || innerWidth < 900) return;
    var items = $$('.night-items li', night), xs = items.map(function (li) { return parseFloat(li.style.getPropertyValue('--x')) / 100 || 0; });
    var sec = night.closest('section') || night.parentElement, head = sec.querySelector('.sec-head') || sec;
    var reloj = document.createElement('div'); reloj.className = 'np-reloj'; reloj.setAttribute('aria-hidden', 'true'); head.appendChild(reloj); head.classList.add('np-head');
    var fill = $('.night-axis i', night);
    night.classList.remove('pend'); night.classList.add('np-scrub');
    function pinta(p) {
      var min = 22 * 60 + p * 600, h = Math.floor(min / 60) % 24, m = Math.floor(min % 60), hh = h % 12 || 12;
      reloj.innerHTML = hh + ':' + (m < 10 ? '0' : '') + m + '<small>' + (h < 12 ? 'am' : 'pm') + '</small>';
      if (fill) { fill.style.transition = 'none'; fill.style.transform = 'scaleX(' + p + ')'; }
      items.forEach(function (li, i) { li.classList.toggle('on', p >= xs[i] - .02); li.style.opacity = p >= xs[i] - .02 ? '' : '.25'; });
    }
    pinta(0);
    ST.create({ trigger: sec, start: 'top 68px', end: '+=1000', pin: true, scrub: .6, onUpdate: function (s) { pinta(s.progress); } });
  })();

  /* ---------- botones magnéticos (solo puntero fino) ---------- */
  if (G && !RM && matchMedia('(pointer:fine)').matches) $$('.btn-m').forEach(function (b) {
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); G.to(b, { x: (e.clientX - r.left - r.width / 2) * .12, y: (e.clientY - r.top - r.height / 2) * .2, duration: .5, ease: 'expo.out' }); });
    b.addEventListener('pointerleave', function () { G.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.5)' }); });
  });
})();
