/* Un día de tu negocio — línea de 24 h. Datos de ejemplo, inventados. */
(function () {
  var top = document.getElementById('top');
  if (top) { var onS = function () { top.classList.toggle('s', window.scrollY > 8); }; onS(); addEventListener('scroll', onS, { passive: true }); }

  var LANES = [
    { k: 'bots', n: 'neuri.bots' }, { k: 'bazar', n: 'neuri.bazar' },
    { k: 'consulting', n: 'neuri.consulting' }, { k: 'marketing', n: 'neuri.marketing' }
  ];
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var EV = [
    { l: 3, h: 6.5, t: (EN ? 'Left 3 posts ready for you to approve' : 'Dejó 3 posts listos para que los apruebes') },
    { l: 0, h: 7.2, t: (EN ? 'Answered “Is the dresser still available?” in 2.8 s' : 'Contestó «¿Sigue disponible el ropero?» en 2.8 s') },
    { l: 1, h: 8.8, t: (EN ? 'Rang up $450 to booth 12’s balance' : 'Cobró $450 al saldo del Puesto 12') },
    { l: 2, h: 11.0, t: (EN ? 'Flagged 3 tasks you can automate' : 'Marcó 3 tareas que puedes automatizar') },
    { l: 0, h: 13.5, t: (EN ? 'Held the coffee table until Saturday' : 'Apartó la mesa de centro hasta el sábado') },
    { l: 1, h: 14.0, t: (EN ? 'Deducted booth 8’s weekly rent' : 'Descontó la renta semanal del Puesto 8') },
    { l: 3, h: 16.0, t: (EN ? 'Prepared this week’s reel' : 'Preparó el reel de la semana') },
    { l: 0, h: 22.8, t: (EN ? 'Answered price and pickup; you were asleep' : 'Contestó precio y entrega; tú ya dormías'), r: 1 },
    { l: 1, h: 23.67, t: (EN ? 'Closed the register: $18,420, balanced' : 'Cerró caja: $18,420, cuadrada'), r: 1 }
  ];
  var Y = [104, 206, 308, 410];
  function hhmm(h) { var m = Math.round(h * 60) % 1440; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }
  function pct(h) { return (h / 24 * 100) + '%'; }
  function el(t, c, s) { var e = document.createElement(t); if (c) e.className = c; if (s) e.setAttribute('style', s); return e; }

  var plot = document.getElementById('plot'), track = document.getElementById('track'), feed = document.getElementById('feed');
  if (!plot || !track) return;

  // noche
  [[0, 7, EN ? 'You were asleep' : 'Tú dormías'], [21, 24, '']].forEach(function (n) {
    var d = el('div', 'night', 'left:' + pct(n[0]) + ';width:' + ((n[1] - n[0]) / 24 * 100) + '%');
    if (n[2]) { var i = el('i'); i.textContent = n[2]; d.appendChild(i); }
    track.appendChild(d);
  });
  for (var h = 0; h <= 24; h += 3) {
    track.appendChild(el('div', 'hr' + (h % 12 === 0 ? ' m' : ''), 'left:' + pct(h)));
    var lb = el('span', 'hl mono', 'left:' + pct(h)); lb.textContent = ('0' + h).slice(-2); track.appendChild(lb);
  }
  LANES.forEach(function (L, i) {
    track.appendChild(el('div', 'lane', 'top:' + Y[i] + 'px'));
    var ll = el('div', 'lane-l', 'top:' + Y[i] + 'px;--c:var(--' + L.k + ')');
    ll.innerHTML = '<i class="dot"></i>' + L.n; plot.appendChild(ll);
  });
  var nodes = EV.map(function (e) {
    var d = el('div', 'ev' + (e.r ? ' r' : ''), 'left:' + pct(e.h) + ';top:' + Y[e.l] + 'px;--c:var(--' + LANES[e.l].k + ')');
    d.innerHTML = '<span class="pin"></span><span class="tag"><span class="mono">' + hhmm(e.h) + '</span>' + e.t + '</span>';
    track.appendChild(d); return d;
  });
  var cur = el('div', 'cursor'), chip = el('b'); cur.appendChild(chip); track.appendChild(cur);

  // lista para celular
  if (feed) EV.slice().sort(function (a, b) { return a.h - b.h; }).forEach(function (e) {
    var li = el('li'), night = e.h < 7 || e.h >= 21;
    li.innerHTML = '<span class="mono">' + hhmm(e.h) + '</span><i class="dot" style="--c:var(--' + LANES[e.l].k + ')"></i><span>' + e.t + (night ? '<span class="nt">' + (EN ? 'While you slept' : 'Mientras dormías') + '</span>' : '') + '</span>';
    feed.appendChild(li);
  });

  function nowPhx() { try { var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Phoenix', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date()); var g = function (t) { return +p.filter(function (x) { return x.type === t; })[0].value; }; return (g('hour') % 24) + g('minute') / 60; } catch (e) { var d = new Date(); return d.getHours() + d.getMinutes() / 60; } }
  function place(h) { cur.style.left = pct(h); chip.textContent = hhmm(h); }
  function rest() { place(nowPhx()); chip.textContent = (EN ? 'Now · ' : 'Ahora · ') + hhmm(nowPhx()); }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || getComputedStyle(plot).display === 'none') { rest(); setInterval(rest, 30000); return; }

  // Un solo momento: el cursor recorre el día y cada evento aparece cuando lo alcanza.
  var played = false;
  function play() {
    if (played) return; played = true;
    gsap.set(nodes, { opacity: 0, y: 6 });
    var o = { h: 0 }, shown = 0, order = nodes.map(function (n, i) { return i; }).sort(function (a, b) { return EV[a].h - EV[b].h; });
    place(0);
    gsap.to(o, {
      h: 24, duration: 6.4, ease: 'power1.inOut',
      onUpdate: function () {
        place(o.h);
        while (shown < order.length && EV[order[shown]].h <= o.h) { gsap.to(nodes[order[shown]], { opacity: 1, y: 0, duration: .7, ease: 'expo.out' }); shown++; }
      },
      onComplete: function () {
        var n = nowPhx(), b = { h: 24 };
        gsap.to(b, { h: n, duration: 1.4, ease: 'expo.inOut', onUpdate: function () { place(b.h); }, onComplete: function () { rest(); setInterval(rest, 30000); } });
      }
    });
  }
  place(0); chip.textContent = '00:00';
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); setTimeout(play, 120); } }, { threshold: .35 });
    io.observe(plot);
  } else play();
})();

/* Historia: el día avanza con el scroll. */
(function () {
  var story = document.querySelector('.story'), stage = document.getElementById('stage');
  if (!story || !stage) return;
  var lis = [].slice.call(document.querySelectorAll('#chapters li')), arts = [].slice.call(document.querySelectorAll('.art .a'));
  var clock = document.getElementById('clock');
  var T = lis.map(function (l) { return +l.dataset.t; });
  var BG = ['#FCE9DC', '#F6F4EE', '#FFFFFF', '#E3EFE7', '#05080D'];
  var FG = ['#05080D', '#05080D', '#05080D', '#05080D', '#F6F4EE'];
  function hhmm(h) { var m = Math.round(h * 60) % 1440; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, narrow = matchMedia('(max-width: 760px)').matches;
  if (reduce || narrow || !window.gsap || !window.ScrollTrigger) {
    story.classList.add('flat');
    lis.forEach(function (l, i) { if (arts[i]) l.appendChild(arts[i]); });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  var cur = -1, n = lis.length, mix = gsap.utils.interpolate;
  function show(i) {
    if (i === cur) return; cur = i;
    lis.forEach(function (l, k) { l.classList.toggle('on', k === i); });
    arts.forEach(function (a, k) { a.classList.toggle('on', k === i); });
    var a = arts[i];
    if (a) gsap.fromTo(a.querySelectorAll('.bub,.post,.tk-r,.bars div,.tasks span,.ct-r,.ct-ok,.appr'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out', stagger: .09, overwrite: true });
  }
  // dz-h-20261125-tech-reloj-no-cuadra: el reloj se queda en la hora de la escena mientras su texto está en pantalla
  // y solo corre en la transición; durante ese tramo la escena se va, así hora y texto nunca se contradicen.
  // premium-arreglo-tech-1126: el tramo sin escena era 30 % del scroll (pantallas casi vacías, solo el reloj);
  // ahora es 12 %: el reloj corre rápido entre horas y la escena siguiente entra casi enseguida.
  var HOLD = .88;
  function set(p) {
    var x = Math.min(n - 1, p * n), i = Math.min(n - 1, Math.floor(x)), f = x - i;
    var t1 = T[i], t2 = T[Math.min(n - 1, i + 1)];
    var e = i < n - 1 ? Math.max(0, (f - HOLD) / (1 - HOLD)) : 0;
    show(e > 0 ? -1 : i);
    clock.textContent = hhmm(t1 + (t2 - t1) * e);
    stage.style.setProperty('--bg', mix(BG[i], BG[Math.min(n - 1, i + 1)], e));
    stage.style.setProperty('--fg', mix(FG[i], FG[Math.min(n - 1, i + 1)], e > .5 ? 1 : 0));
  }
  set(0);
  ScrollTrigger.create({ trigger: story, start: 'top top', end: '+=' + (n * 90) + '%', pin: stage, scrub: .4, onUpdate: function (s) { set(s.progress); } });
})();

/* Luz del cielo del hero según la hora del cursor; contadores. */
(function () {
  var sky = document.getElementById('sky'); if (!sky) return;
  var cur = document.querySelector('.cursor');
  var stops = [[0, '#E2E8E4'], [6, '#E2E8E4'], [7.5, '#FCE9DC'], [12, '#FFFFFF'], [18.5, '#FCE9DC'], [21, '#E2E8E4'], [24, '#E2E8E4']];
  function col(h) { for (var i = 1; i < stops.length; i++) if (h <= stops[i][0]) { var a = stops[i - 1], b = stops[i], f = (h - a[0]) / (b[0] - a[0] || 1); return window.gsap ? gsap.utils.interpolate(a[1], b[1], f) : b[1]; } return stops[0][1]; }
  var nums = [].slice.call(document.querySelectorAll('[data-n]')), mx = 0;
  function tick() {
    if (!cur) return; var l = parseFloat(cur.style.left) || 0, h = l / 100 * 24;
    mx = Math.max(mx, h); sky.style.setProperty('--sun', col(h)); sky.style.setProperty('--sun2', col((h + 12) % 24));
    nums.forEach(function (e) { var n = +e.dataset.n; e.textContent = Math.round(n * Math.min(1, mx / 23.7)); });
  }
  var pl = document.getElementById('plot');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || (pl && getComputedStyle(pl).display === 'none')) return;
  var t0 = performance.now();
  (function loop(now) { tick(); if (now - t0 < 12000) requestAnimationFrame(loop); else nums.forEach(function (e) { e.textContent = e.dataset.n; }); })(t0);
})();
