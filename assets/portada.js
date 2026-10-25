/* Portada neuri.tech (ES /, EN /en/home/) — diseño v2 aprobado por Ricardo el 25-oct-2026.
 * Textos de cada idioma: <script type="application/json" id="portada-datos"> en la página.
 * Sin GSAP (o con prefers-reduced-motion) todo queda estático y visible.
 * Carga con defer después de /assets/gsap/gsap.min.js y ScrollTrigger.min.js. */
(function () {
  var D; try { D = JSON.parse(document.getElementById('portada-datos').textContent); } catch (e) { return; }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- órbita: posición inicial ---------- */
  var orb = $('.orb'), planets = $$('.planet');
  var orbitState = { rot: 0 };
  var half = 0, mt = 0;
  function measure() {
    if (!orb) return;
    half = orb.clientWidth / 2; mt = 0;
    planets.forEach(function (p) { mt = Math.max(mt, p.querySelector('.tag').offsetWidth); });
  }
  function placePlanets(rot) {
    if (!orb) return;
    if (!half) measure();
    var Ry = half * 0.94, Rx = Math.max(half * 0.5, Math.min(half * 0.96, half - mt / 2 - 4));
    planets.forEach(function (p) {
      var a = (+p.dataset.a + rot) * Math.PI / 180;
      p.style.transform = 'translate(' + (Math.cos(a) * Rx).toFixed(1) + 'px,' + (Math.sin(a) * Ry).toFixed(1) + 'px)';
    });
  }
  placePlanets(0);
  addEventListener('resize', function () { measure(); placePlanets(orbitState.rot); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); placePlanets(orbitState.rot); });
  // trabajo no urgente: después de load y en un momento libre (no compite con la primera pintura)
  function idle(fn) {
    function go() { (window.requestIdleCallback || function (f) { setTimeout(f, 1); })(fn, { timeout: 1200 }); }
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
  }

  /* ---------- reloj de Phoenix ---------- */
  function tick() { try { $('#clock').textContent = new Date().toLocaleTimeString(D.locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'America/Phoenix' }); } catch (e) {} }
  tick(); setInterval(tick, 1000);

  /* ---------- EEG ---------- */
  (function () {
    var d = 'M0,30', seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var x = 6; x <= 1200; x += 6) {
      if (rnd() < .06) { d += ' L' + x + ',30 L' + (x + 3) + ',' + (4 + rnd() * 6).toFixed(1) + ' L' + (x + 6) + ',' + (52 + rnd() * 6).toFixed(1) + ' L' + (x + 9) + ',30'; x += 9; }
      else d += ' L' + x + ',' + (30 + (rnd() - .5) * 10).toFixed(1);
    }
    for (var i = 0; i < 2; i++) {
      var s = sv('svg', { width: 1200, height: 60, viewBox: '0 0 1200 60', 'aria-hidden': 'true' });
      var g = sv('linearGradient', { id: 'eg' + i, x1: 0, x2: 1 });
      g.appendChild(sv('stop', { offset: '0', 'stop-color': '#8FE0B4' }));
      g.appendChild(sv('stop', { offset: '.5', 'stop-color': '#F3B38F' }));
      g.appendChild(sv('stop', { offset: '1', 'stop-color': '#8FE0B4' }));
      var df = sv('defs', {}); df.appendChild(g); s.appendChild(df);
      s.appendChild(sv('path', { d: d, fill: 'none', stroke: 'url(#eg' + i + ')', 'stroke-width': 1.4, opacity: .85 }));
      $('#eeg').appendChild(s);
    }
  })();

  /* ---------- marquesina y manifiesto ---------- */
  (function () { var h = ''; D.marquee.concat(D.marquee).forEach(function (x, i) { h += '<span' + (i >= D.marquee.length ? ' aria-hidden="true"' : '') + '><i aria-hidden="true">◆</i>' + esc(x) + '</span>'; }); $('#marq').innerHTML = h; })();
  (function () {
    var p = $('#manifesto'); if (!p) return;
    p.innerHTML = p.textContent.trim().split(/\s+/).map(function (w) { return '<span class="mw ' + (D.hl[w] || '') + '">' + esc(w) + ' </span>'; }).join('');
  })();

  /* ---------- red neural ---------- */
  var SIG = D.sig, X = [90, 360, 640, 910], IY = [110, 220, 330], HY = [60, 140, 220, 300, 380];
  var sig = 0, sigAuto = true, net = $('#net');
  function drawNet(anim) {
    var sg = SIG[sig]; net.innerHTML = '';
    net.setAttribute('aria-label', D.netAria.replace('{s}', sg.label).replace('{o}', D.outL[sg.out].toLowerCase()));
    var gE = sv('g', {}), gN = sv('g', {}), gL = sv('g', {}); net.appendChild(gE); net.appendChild(gN); net.appendChild(gL);
    function edge(x1, y1, x2, y2, on, k) { var l = sv('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: on ? sg.color : 'rgba(233,238,242,.10)', 'stroke-width': on ? 2 : 1 }); if (on) { l.setAttribute('class', 'flow on'); l.style.animationDelay = (k * .12) + 's'; } gE.appendChild(l); }
    var i, j;
    for (i = 0; i < 3; i++) for (j = 0; j < 5; j++) edge(X[0], IY[i], X[1], HY[j], i === sg.inp && sg.h1.indexOf(j) > -1, 0);
    for (i = 0; i < 5; i++) for (j = 0; j < 5; j++) edge(X[1], HY[i], X[2], HY[j], sg.h1.indexOf(i) > -1 && sg.h2.indexOf(j) > -1, 1);
    for (i = 0; i < 5; i++) for (j = 0; j < 3; j++) edge(X[2], HY[i], X[3], IY[j], sg.h2.indexOf(i) > -1 && j === sg.out, 2);
    function node(x, y, on, k) {
      if (on) { var h = sv('circle', { class: 'h', cx: x, cy: y, r: 9, fill: 'none', stroke: sg.color, 'stroke-width': 1.5 }); h.style.animationDelay = (k * .3) + 's'; gN.appendChild(h); }
      gN.appendChild(sv('circle', { class: on ? 'n on' : 'n', cx: x, cy: y, r: on ? 9 : 6, fill: on ? sg.color : '#0B1118', stroke: on ? sg.color : 'rgba(233,238,242,.3)', 'stroke-width': 1.5 }));
    }
    for (i = 0; i < 3; i++) node(X[0], IY[i], i === sg.inp, 0);
    for (i = 0; i < 5; i++) node(X[1], HY[i], sg.h1.indexOf(i) > -1, 1);
    for (i = 0; i < 5; i++) node(X[2], HY[i], sg.h2.indexOf(i) > -1, 2);
    for (i = 0; i < 3; i++) node(X[3], IY[i], i === sg.out, 3);
    function lab(x, y, a, t, s, f) { var e = sv('text', { x: x, y: y, 'text-anchor': a, fill: f, 'font-family': 'Geist Mono, monospace', 'font-size': s, 'letter-spacing': 1 }); e.textContent = t; gL.appendChild(e); }
    for (i = 0; i < 3; i++) { lab(X[0] - 20, IY[i] + 4, 'end', D.inL[i], 11, i === sg.inp ? sg.color : '#9AA6B2'); lab(X[3] + 20, IY[i] + 4, 'start', D.outL[i], 11, i === sg.out ? sg.color : '#9AA6B2'); }
    D.cols.forEach(function (c, k) { lab(X[k], 430, 'middle', c, 10, '#9AA6B2'); });
    $('#trace').innerHTML = sg.trace.map(function (t) { return '<div><span class="mono" style="color:' + sg.color + '">' + esc(t[0]) + '</span><span>' + esc(t[1]) + '</span></div>'; }).join('');
    $$('.sig').forEach(function (b, k) { b.setAttribute('aria-pressed', k === sig ? 'true' : 'false'); });
    if (anim && window.gsap && !reduce) {
      gsap.from($$('.n.on', net), { scale: 0, transformOrigin: '50% 50%', duration: .5, stagger: .08, ease: 'back.out(3)' });
      gsap.from($$('line.on', net), { opacity: 0, duration: .4, stagger: .02 });
      gsap.from($$('#trace>div'), { opacity: 0, y: 14, duration: .45, stagger: .09, ease: 'power3.out' });
    }
  }
  SIG.forEach(function (g, k) {
    var b = el('button', { type: 'button', class: 'sig', 'aria-pressed': 'false', style: '--c:' + g.color }, '<i aria-hidden="true"></i>' + esc(g.label));
    b.addEventListener('click', function () { sig = k; sigAuto = false; drawNet(true); });
    $('#sigs').appendChild(b);
  });
  drawNet(false);
  if (!reduce) setInterval(function () { if (sigAuto && !document.hidden) { sig = (sig + 1) % SIG.length; drawNet(true); } }, 5200);

  /* ---------- consola ---------- */
  var toneC = ['#C5CED6', '#8FE0B4', '#F3B38F'], CMD = D.cmds, runT = [], auto = true;
  CMD.forEach(function (c, i) {
    var b = el('button', { type: 'button', class: 'cmd', role: 'option', 'aria-selected': 'false', style: '--ib:' + c.ib + ';--ic:' + c.ic },
      '<span class="ic" aria-hidden="true">' + c.icon + '</span><span class="t"><b>' + esc(c.label) + '</b><small class="mono">' + esc(c.hint) + '</small></span><span class="sc mono" aria-hidden="true">' + c.short + '</span>');
    b.addEventListener('click', function () { run(i, true); });
    $('#cmds').appendChild(b);
  });
  function run(i, manual) {
    runT.forEach(clearTimeout); runT = []; if (manual) auto = false;
    var c = CMD[i];
    $$('.cmd').forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    $('#runkey').textContent = c.key;
    var L = $('#lines'); L.innerHTML = '';
    if (reduce) { $('#query').textContent = c.label; c.log.forEach(function (l) { L.appendChild(el('div', { class: 'ln', style: 'color:' + toneC[l[1]] }, esc(l[0]))); }); return; }
    $('#query').textContent = '';
    for (var k = 1; k <= c.label.length; k++) (function (k) { runT.push(setTimeout(function () { $('#query').textContent = c.label.slice(0, k); }, k * 22)); })(k);
    var base = c.label.length * 22 + 250;
    c.log.forEach(function (l, k) {
      runT.push(setTimeout(function () {
        var d = el('div', { class: 'ln', style: 'color:' + toneC[l[1]] }, esc(l[0])); L.appendChild(d);
        if (window.gsap) gsap.from(d, { opacity: 0, x: -10, duration: .35, ease: 'power2.out' });
      }, base + (k + 1) * 520));
    });
    runT.push(setTimeout(function () { if (auto) run((i + 1) % CMD.length, false); }, base + c.log.length * 520 + 3200));
  }
  run(0, false);

  /* ---------- capa GSAP ---------- */
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('m'); return; }
  gsap.registerPlugin(ScrollTrigger);
  function split(e) {
    var out = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
            var w = el('span', { class: 'w' }), i = el('span', { class: 'wi' }); i.textContent = p; w.appendChild(i); f.appendChild(w); out.push(i);
          });
          c.parentNode.replaceChild(f, c);
        } else if (c.nodeType === 1 && !c.classList.contains('rot')) walk(c);
      });
    })(e);
    return out;
  }

  var mm = gsap.matchMedia();
  mm.add({ ok: '(prefers-reduced-motion: no-preference)', fine: '(hover: hover) and (pointer: fine)' }, function (ctx) {
    if (!ctx.conditions.ok) { root.classList.remove('m'); return; }
    var fine = ctx.conditions.fine;

    /* órbita: gira siempre, se frena con el mouse, se detiene con el foco */
    var orbit = gsap.to(orbitState, { rot: 360, duration: 60, ease: 'none', repeat: -1, onUpdate: function () { placePlanets(orbitState.rot); } });
    orb.addEventListener('pointerenter', function () { gsap.to(orbit, { timeScale: .08, duration: .8 }); });
    orb.addEventListener('pointerleave', function () { gsap.to(orbit, { timeScale: 1, duration: 1.2 }); });
    planets.forEach(function (p) {
      var a = p.querySelector('a'), ball = p.querySelector('.ball');
      a.addEventListener('focus', function () { orbit.timeScale(0); });
      a.addEventListener('blur', function () { gsap.to(orbit, { timeScale: 1, duration: 1 }); });
      a.addEventListener('pointerenter', function () { gsap.to(ball, { scale: 1.5, duration: .4, ease: 'back.out(3)' }); });
      a.addEventListener('pointerleave', function () { gsap.to(ball, { scale: 1, duration: .5 }); });
    });

    /* entrada: el texto del hero entra con CSS desde la primera pintura (.mi, sin esperar a este JS);
       aquí el núcleo, los anillos y los 4 productos que entran en órbita */
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.add(function () { root.classList.remove('m'); }, 0)
      .from('.orb', { opacity: 0, scale: .86, duration: 1.4, ease: 'expo.out' }, 0)
      .from('.coreg', { scale: 0, transformOrigin: '210px 210px', duration: 1.2, ease: 'elastic.out(1,.5)' }, .35)
      .from('.coreart .mesh', { opacity: 0, duration: 1 }, .5)
      .from('.coreart .neur circle', { scale: 0, transformOrigin: 'center', transformBox: 'fill-box', duration: .5, stagger: .06, ease: 'back.out(3)' }, .6)
      .from('.ring', { scale: .6, opacity: 0, duration: 1.2, ease: 'expo.out' }, .45)
      // se escala lo de adentro, no el <a>: el link mide ≥44 px desde el primer momento (A102 / visual.mjs)
      .from($$('.planet a').map(function (a) { return a.children; }).reduce(function (x, c) { return x.concat([].slice.call(c)); }, []), { opacity: 0, scale: .3, duration: .8, stagger: .07, ease: 'back.out(2)' }, .8)
      .from(orbitState, { rot: -120, duration: 2.2, ease: 'expo.out', onUpdate: function () { placePlanets(orbitState.rot); } }, .8)
      .from('.float', { opacity: 0, y: 16, duration: .7, stagger: .12 }, 1.2)
      .from('.clock', { opacity: 0, duration: .6 }, 1.4);
    $$('.coreart .draw').forEach(function (c) { var L = 2 * Math.PI * +c.getAttribute('r'); tl.fromTo(c, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, .45); });

    /* palabra rotativa */
    var list = D.words, wi = 0, rw = $('.rw');
    gsap.delayedCall(2.6, function cycle() {
      wi = (wi + 1) % list.length;
      gsap.timeline().to(rw, { yPercent: -45, opacity: 0, filter: 'blur(8px)', duration: .35, ease: 'power2.in' })
        .add(function () { rw.textContent = list[wi]; })
        .fromTo(rw, { yPercent: 45, filter: 'blur(8px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: .55, ease: 'power3.out' });
      gsap.delayedCall(2.4, cycle);
    });

    /* ambiente */
    gsap.to('.a1', { x: -80, y: 40, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.a2', { x: 60, y: -50, duration: 11, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.a3', { scale: 1.15, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.brand .moon', { rotation: 360, svgOrigin: '15 15', duration: 12, repeat: -1, ease: 'none' });
    gsap.to('#eeg', { xPercent: -50, duration: 14, ease: 'none', repeat: -1 });
    gsap.to('#marq', { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    var sp = { v: 1284 }, spk = $('#spikes');
    setInterval(function () { if (document.hidden) return; gsap.to(sp, { v: 1180 + Math.round(Math.random() * 220), duration: 1.2, ease: 'power2.out', onUpdate: function () { spk.textContent = Math.round(sp.v).toLocaleString('en-US'); } }); }, 1500);

    /* partículas que esquivan el cursor (arrancan después de load) */
    idle(function () {
      var cv = $('canvas.fx'), cx = cv.getContext('2d'), hero = $('.hero'), P = [], W, H, dpr = Math.min(2, devicePixelRatio || 1), mx = -999, my = -999, vis = true;
      function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
      size(); addEventListener('resize', size);
      var n = W < 600 ? 36 : 80;
      for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: -.1 - Math.random() * .3, r: .6 + Math.random() * 1.8, c: Math.random() < .65 ? '143,224,180' : '243,179,143', a: .25 + Math.random() * .55 });
      hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      hero.addEventListener('pointerleave', function () { mx = my = -999; });
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(hero);
      gsap.ticker.add(function () {
        if (!vis) return; cx.clearRect(0, 0, W, H);
        P.forEach(function (p) {
          var dx = p.x - mx, dy = p.y - my, d = dx * dx + dy * dy;
          if (d < 14400) { var f = (14400 - d) / 14400 * .9; p.x += dx / Math.sqrt(d + 1) * f; p.y += dy / Math.sqrt(d + 1) * f; }
          p.x += p.vx; p.y += p.vy;
          if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
          cx.globalAlpha = p.a * .35; cx.fillStyle = 'rgb(' + p.c + ')'; cx.beginPath(); cx.arc(p.x, p.y, p.r * 3, 0, 6.283); cx.fill();
          cx.globalAlpha = p.a; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
        });
        cx.globalAlpha = 1;
      });
    });

    if (fine) {
      var par = $('.coreart .paral'), hero = $('.hero');
      var qx = gsap.quickTo(par, 'x', { duration: 1, ease: 'power3' }), qy = gsap.quickTo(par, 'y', { duration: 1, ease: 'power3' });
      hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); qx(((e.clientX - r.left) / r.width - .5) * -18); qy(((e.clientY - r.top) / r.height - .5) * -18); });
      $$('.mag').forEach(function (b) {
        var x = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), y = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
        b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .3); y((e.clientY - r.top - r.height / 2) * .4); });
        b.addEventListener('pointerleave', function () { gsap.to(b, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,.4)' }); });
      });
      $$('.card').forEach(function (c) {
        c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
        c.addEventListener('pointerenter', function () { gsap.to(c, { y: -6, duration: .4, ease: 'power3' }); });
        c.addEventListener('pointerleave', function () { gsap.to(c, { y: 0, duration: .6, ease: 'power3' }); });
      });
    }

    /* scroll (se arma en un momento libre después de load) */
    idle(function () {
    $$('h2[data-split]').forEach(function (h) { gsap.from(split(h), { yPercent: 115, duration: 1, stagger: .05, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 86%' } }); });
    $$('.rv').forEach(function (e) { gsap.from(e, { opacity: 0, y: 24, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 90%' } }); });
    $$('.stag').forEach(function (g) { gsap.from(g.children, { opacity: 0, y: 50, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: g, start: 'top 85%' } }); });
    // .5 y no menos: aun «apagadas», las palabras del manifiesto (texto grande, también las menta/durazno) quedan con contraste AA ≥3:1
    gsap.fromTo('.mw', { opacity: .5 }, { opacity: 1, stagger: .06, ease: 'none', scrollTrigger: { trigger: '#manifesto', start: 'top 80%', end: 'bottom 45%', scrub: .5 } });
    $$('[data-count]').forEach(function (e) {
      var end = +e.dataset.count, o = { v: 0 }, txt = e.textContent;
      ScrollTrigger.create({ trigger: e, start: 'top 92%', once: true, onEnter: function () { gsap.to(o, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: function () { e.textContent = Math.round(o.v).toLocaleString('en-US'); }, onComplete: function () { e.textContent = txt; } }); } });
    });
    $$('.prin svg path').forEach(function (p) { var L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: p, start: 'top 88%' } }); });
    var rt = gsap.timeline({ scrollTrigger: { trigger: '#road', start: 'top 82%' } });
    rt.from('#road .rail', { scaleX: 0, duration: 1.4, ease: 'power3.inOut' })
      .from($$('#road>div:not(.rail)'), { opacity: 0, y: 24, duration: .7, stagger: .15, ease: 'power3.out' }, .2)
      .from($$('#road .dot'), { scale: 0, duration: .5, stagger: .15, ease: 'back.out(3)' }, .3);
    gsap.from('.term', { rotationX: 10, transformPerspective: 1200, transformOrigin: '50% 0', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.term', start: 'top 85%' } });
    });
  });
})();
