/* neuri.bots — final section: a swarm of dots races to answer each question.
   Each question pops up around the copy; the nearest dots rush toward it and the first one to arrive answers it
   (the pill changes to the answer with the real time), the rest scatter and the winner flies back into the core.
   Without motion (prefers-reduced-motion) it draws a still frame with the questions already answered. */
(function () {
  var sec = document.querySelector('#empezar .hx.fin'); if (!sec || !window.requestAnimationFrame) return;
  var EN = (document.documentElement.lang || '').slice(0, 2) === 'en';
  var Q = EN ? [
    ['Still available?', 'Yes, still available'], ['What’s your lowest?', 'Passed to you', 1], ['Can you hold it?', 'On hold until 8 pm'],
    ['Where’s pickup?', 'Pickup on Main St'], ['Do you take Zelle?', 'Cash or Zelle'], ['Got it in black?', 'Also in black'],
    ['Do you ship?', 'Ships in 2 days'], ['Open until when?', 'Open 10 to 8'], ['More photos?', 'Sent you 4 photos'], ['Is it new?', 'Like new, never used']
  ] : [
    ['¿Sigue disponible?', 'Sí, sigue disponible'], ['¿Cuánto lo menos?', 'Te lo paso a ti', 1], ['¿Me lo apartas?', 'Apartado hasta las 8 pm'],
    ['¿Dónde lo recojo?', 'Recoges en la tienda'], ['¿Aceptan transferencia?', 'Efectivo o transferencia'], ['¿Lo tienes en negro?', 'También en negro'],
    ['¿Hacen envíos?', 'Envío en 2 días'], ['¿Hasta qué hora?', 'Abrimos de 10 a 8'], ['¿Más fotos?', 'Te mandé 4 fotos'], ['¿Es nuevo?', 'Como nuevo, sin uso']
  ];
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv = document.createElement('canvas'); cv.className = 'sw-cv'; cv.setAttribute('aria-hidden', 'true');
  var layer = document.createElement('div'); layer.className = 'sw-qs'; layer.setAttribute('aria-hidden', 'true');
  sec.insertBefore(layer, sec.firstChild); sec.insertBefore(cv, sec.firstChild); sec.classList.add('sw-on');
  var ctx = cv.getContext('2d'), copy = sec.querySelector('.fin-in'), core = sec.querySelector('.fin-in .core');
  var W = 0, H = 0, dpr = 1, C = null, K = null, dots = [], qs = [], qi = Math.floor(Math.random() * Q.length), t0 = 0, nextQ = 0, run = false, raf, px = -1e4, py = -1e4;

  function rel(el) { var a = el.getBoundingClientRect(), b = sec.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; }
  function size() {
    var r = sec.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    C = rel(copy); K = core ? rel(core) : { x: W / 2, y: H / 3, w: 0, h: 0 }; K.cx = K.x + K.w / 2; K.cy = K.y + K.h / 2;
    var n = Math.round(Math.max(700, Math.min(2600, W * H / 300)));
    while (dots.length < n) dots.push(dot(Math.random() * W, Math.random() * H));
    dots.forEach(function (p) { if (p.aw === W && p.ah === H) return; p.aw = W; p.ah = H; var t = 8, x, y; do { x = Math.random() * W; y = Math.random() * H; } while (t-- && Math.random() > veil(x, y) * .9 + .1); p.ax = x; p.ay = y; });
    dots.length = n;
  }
  function dot(x, y) { var m = Math.random() < .16; return { x: x, y: y, ax: x, ay: y, ph: Math.random() * 6.283, ox: x, oy: y, vx: 0, vy: 0, r: m ? 1.8 + Math.random() * .9 : .7 + Math.random() * 1.1, w: m, a: .35 + Math.random() * .5, q: null, acc: 0, max: 0, s: 0, home: 0 }; }
  function veil(x, y) { var ex = (x - (C.x + C.w / 2)) / (C.w * .62), ey = (y - (C.y + C.h / 2)) / (C.h * .66), d = ex * ex + ey * ey; return d >= 1 ? 1 : d * d; }
  function inCopy(x, y, pad) { return x > C.x - pad && x < C.x + C.w + pad && y > C.y - pad && y < C.y + C.h + pad; }

  function spawn(now) {
    var pw = W < 620 ? 150 : 190, tries = 40, x, y, ok;
    while (tries--) {
      x = pw / 2 + 14 + Math.random() * (W - pw - 28); y = 46 + Math.random() * (H - 92); var pad = W < 620 ? 14 : 30; ok = !(x + pw / 2 > C.x - pad && x - pw / 2 < C.x + C.w + pad && y + 28 > C.y - pad && y - 28 < C.y + C.h + pad);
      for (var i = 0; ok && i < qs.length; i++) if (Math.abs(qs[i].x - x) < pw + 16 && Math.abs(qs[i].y - y) < 64) ok = false;
      // keep clear of the floating chat button (neuri.vendedor, fixed bottom-right of the screen)
      if (ok && document.getElementById('neuri-vendedor')) { var sr = sec.getBoundingClientRect(), bx = innerWidth - 16 - 300 - sr.left, by = innerHeight - 16 - 52 - 24 - sr.top; if (x + pw / 2 > bx && y + 28 > by) ok = false; }
      if (ok) break;
    }
    if (!ok) return;
    var d = Q[qi++ % Q.length], el = document.createElement('div');
    el.className = 'sw-q'; el.style.left = x + 'px'; el.style.top = y + 'px';
    el.innerHTML = '<span class="sw-t"></span><small class="sw-s"></small>'; el.firstChild.textContent = d[0];
    layer.appendChild(el); requestAnimationFrame(function () { el.classList.add('in'); });
    var q = { x: x, y: y, el: el, d: d, born: now, gate: 1000 + Math.random() * 1400, won: 0, done: 0 };
    // the closest free dots join the race, each with its own "temperament"
    var free = dots.filter(function (p) { var e = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); return !p.q && !p.home && e > 19600 && e < 360000; }).sort(function (a, b) { return (a.x - x) * (a.x - x) + (a.y - y) * (a.y - y) - ((b.x - x) * (b.x - x) + (b.y - y) * (b.y - y)); });
    free.slice(0, Math.min(140, Math.round(free.length * .22))).forEach(function (p) { p.q = q; p.acc = .045 + Math.random() * .06; p.max = 1.6 + Math.random() * 1.6; });
    qs.push(q);
  }
  function win(q, p, now) {
    q.won = now; p.s = 1; p.home = 1; p.q = null;
    var secs = Math.max(.9, (now - q.born) / 1000).toFixed(1);
    q.el.classList.add('ok'); if (q.d[2]) q.el.classList.add('ti');
    q.el.firstChild.textContent = q.d[1];
    q.el.lastChild.textContent = q.d[2] ? (EN ? 'Passed to you' : 'Te lo pasa a ti') : (EN ? 'Answered · ' : 'Contestado · ') + secs + ' s';
    if (q.d[2]) q.el.firstChild.textContent = EN ? 'Mariana decides the price' : 'Mariana decide el precio';
    dots.forEach(function (o) { if (o.q === q) { o.q = null; var dx = o.x - q.x, dy = o.y - q.y, d = Math.sqrt(dx * dx + dy * dy) || 1; o.vx = o.vx * .3 + dx / d * (.5 + Math.random() * .6); o.vy = o.vy * .3 + dy / d * (.5 + Math.random() * .6); } });
  }

  function flow(x, y, t) { return Math.sin(x * .0028 + t * .00012) * 1.3 + Math.cos(y * .0034 - t * .0001) * 1.1 + Math.sin((x + y) * .0015 + t * .00016); }
  function frame(now) {
    if (!t0) { t0 = now; nextQ = now + 500; }
    if (now > nextQ && qs.filter(function (q) { return !q.won; }).length < (W < 620 ? 1 : 2)) { spawn(now); nextQ = now + 2400 + Math.random() * 1400; }
    ctx.clearRect(0, 0, W, H);
    // links between racers: the neural network appears while they compete
    ctx.lineWidth = .6;
    for (var j = 0; j < qs.length; j++) {
      var q = qs[j]; if (q.won) continue; ctx.strokeStyle = 'rgba(143,224,180,.09)'; ctx.beginPath();
      for (var i = 0; i < dots.length; i++) { var p = dots[i]; if (p.q !== q) continue; var dx = p.x - q.x, dy = p.y - q.y; if (dx * dx + dy * dy < 9000) { ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); } }
      ctx.stroke();
    }
    for (var k = 0; k < dots.length; k++) {
      var p = dots[k]; p.ox = p.x; p.oy = p.y;
      if (p.q) {
        var tq = p.q, dx = tq.x - p.x, dy = tq.y - p.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        p.vx += dx / d * p.acc; p.vy += dy / d * p.acc;
        var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy); if (sp > p.max) { p.vx *= p.max / sp; p.vy *= p.max / sp; }
        p.vx *= .97; p.vy *= .97;
        if (d < 9 && !tq.won && now - tq.born > tq.gate) win(tq, p, now);
      } else if (p.home) {
        // the winner returns to the core and the core pulses
        var hx = K.cx - p.x, hy = K.cy - p.y, hd = Math.sqrt(hx * hx + hy * hy) || 1;
        if (p.home === 1 && now - (p.hw || (p.hw = now)) < 1000) { p.vx *= .8; p.vy *= .8; }
        else { p.home = 2; p.vx += hx / hd * .12; p.vy += hy / hd * .12; p.vx *= .96; p.vy *= .96; var s2 = Math.sqrt(p.vx * p.vx + p.vy * p.vy); if (s2 > 3.2) { p.vx *= 3.2 / s2; p.vy *= 3.2 / s2; } }
        if (p.home === 2 && hd < 14) { p.home = 0; p.hw = 0; p.s = 0; if (core) { core.classList.remove('hit'); void core.offsetWidth; core.classList.add('hit'); } p.x = K.cx; p.y = K.cy; p.ox = p.x; p.oy = p.y; p.vx = (Math.random() - .5) * 1.5; p.vy = (Math.random() - .5) * 1.5; }
      } else {
        var a = flow(p.x, p.y, now); p.vx += Math.cos(a) * .018 + (p.ax + Math.sin(now * .00025 + p.ph) * 10 - p.x) * .0009; p.vy += Math.sin(a) * .018 + (p.ay + Math.cos(now * .0002 + p.ph) * 10 - p.y) * .0009;
        
        var mx = p.x - px, my = p.y - py, md = mx * mx + my * my; if (md < 8100) { var f = (1 - md / 8100) * .22, ml = Math.sqrt(md) || 1; p.vx += mx / ml * f; p.vy += my / ml * f; }
        p.vx *= .93; p.vy *= .93;
      }
      p.x += p.vx; p.y += p.vy;
      if (!p.q && !p.home) { if (p.x < -6) p.x = p.ox = W + 6; else if (p.x > W + 6) p.x = p.ox = -6; if (p.y < -6) p.y = p.oy = H + 6; else if (p.y > H + 6) p.y = p.oy = -6; }
      var fast = p.q || p.home === 2, dim = fast ? 1 : .18 + .82 * veil(p.x, p.y);
      if (fast) { ctx.strokeStyle = 'rgba(143,224,180,' + (.28 * p.a) + ')'; ctx.lineWidth = p.r * .8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p.ox - (p.x - p.ox) * 3, p.oy - (p.y - p.oy) * 3); ctx.lineTo(p.x, p.y); ctx.stroke(); }
      ctx.fillStyle = p.s ? '#D9FBE8' : (p.w ? 'rgba(255,255,255,' + (p.a * .8 * dim) + ')' : 'rgba(143,224,180,' + (p.a * dim) + ')');
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s ? 3.4 : p.r, 0, 6.283); ctx.fill();
      if (p.s) { ctx.strokeStyle = 'rgba(143,224,180,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, 8 + Math.sin(now / 260) * 1.5, 0, 6.283); ctx.stroke(); }
    }
    for (var m = qs.length - 1; m >= 0; m--) {
      var qq = qs[m];
      if (!qq.won && now - qq.born > 9000) { var best = null, bd = 1e9; dots.forEach(function (o) { if (o.q === qq) { var e = (o.x - qq.x) * (o.x - qq.x) + (o.y - qq.y) * (o.y - qq.y); if (e < bd) { bd = e; best = o; } } }); if (best) win(qq, best, now); else { qq.won = now; } }
      if (qq.won && !qq.done && now - qq.won > 2800) { qq.done = 1; qq.el.classList.add('out'); (function (el) { setTimeout(function () { el.remove(); }, 600); })(qq.el); }
      if (qq.done && now - qq.won > 3000) qs.splice(m, 1);
    }
    if (run) raf = requestAnimationFrame(frame);
  }
  function still() {
    size(); ctx.clearRect(0, 0, W, H);
    dots.forEach(function (p) { if (inCopy(p.x, p.y, 6)) return; ctx.fillStyle = p.w ? 'rgba(255,255,255,' + p.a * .7 + ')' : 'rgba(143,224,180,' + p.a + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); });
    for (var i = 0; i < 3; i++) { spawn(0); var q = qs[qs.length - 1]; if (q) { q.el.classList.add('in'); win(q, dots[0], 1200 + i * 300); dots[0].home = 0; dots[0].s = 0; } }
  }
  sec.addEventListener('pointermove', function (e) { var r = sec.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
  sec.addEventListener('pointerleave', function () { px = py = -1e4; });
  if (window.ResizeObserver) new ResizeObserver(function () { if (W) size(); }).observe(sec); else addEventListener('resize', size);
  if (RM) { still(); return; }
  size();
  var io = new IntersectionObserver(function (en) {
    var v = en[0].isIntersecting;
    if (v && !run && !document.hidden) { run = true; size(); raf = requestAnimationFrame(frame); }
    else if (!v && run) { run = false; cancelAnimationFrame(raf); }
  }, { threshold: .05 });
  io.observe(sec);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { run = false; cancelAnimationFrame(raf); } else { io.unobserve(sec); io.observe(sec); } });
})();
