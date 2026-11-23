/* neuri.bazar landing — una venta de punta a punta. Datos de ejemplo. */
(function () {
  var EN = (document.documentElement.lang || '').indexOf('en') === 0;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var top = document.getElementById('top');
  if (top) { var s = function () { top.classList.toggle('s', scrollY > 8); }; s(); addEventListener('scroll', s, { passive: true }); }

  /* Estado del lunes: los renglones llegan uno por uno, una sola vez. */
  var st = document.getElementById('stmt');
  if (st && window.gsap && !reduce) {
    var rows = st.querySelectorAll('.stmt-l li, .stmt-t div, .stmt-f');
    gsap.from(rows, { opacity: 0, y: 8, duration: .7, ease: 'expo.out', stagger: .14, delay: .25 });
    var li = st.querySelectorAll('.stmt-l li');
    li.forEach(function (l, i) { setTimeout(function () { l.classList.add('ding'); }, 400 + i * 140); });
    var stamp = document.getElementById('stamp'), deck = document.querySelectorAll('.deck i');
    if (stamp) gsap.fromTo(stamp, { opacity: 0, scale: 1.6, rotate: -4 }, { opacity: 1, scale: 1, rotate: -12, duration: .5, delay: 2.7, ease: 'back.out(2.2)' });
    if (deck.length) { gsap.set(deck, { opacity: 0 }); gsap.to(deck, { opacity: 1, rotate: function (i) { return [-7, 5, -3][i]; }, x: function (i) { return [-38, 34, -12][i]; }, y: function (i) { return [14, 10, 22][i]; }, duration: .9, delay: 3.0, stagger: .08, ease: 'expo.out' }); gsap.to(deck, { rotate: 0, x: 0, y: 0, duration: 1, delay: 4.6, ease: 'expo.inOut', stagger: .05 }); }
    st.querySelectorAll('.stmt-t .mono').forEach(function (m) {
      var txt = m.textContent, neg = txt.indexOf('−') === 0, v = parseFloat(txt.replace(/[^0-9.]/g, '')), o = { v: 0 };
      gsap.to(o, { v: v, duration: 1.6, delay: 1.0, ease: 'expo.out', onUpdate: function () { m.textContent = (neg ? '−$' : '$') + o.v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } });
    });
  }

  /* Plano de puestos: 32 puestos, 3 abiertos; el 8 se renta. */
  var grid = document.getElementById('grid');
  if (grid) {
    var open = { 8: 1, 15: 1, 27: 1 };
    for (var i = 1; i <= 32; i++) { var b = document.createElement('span'); b.className = 'bt' + (open[i] ? ' o' : ''); b.textContent = i; b.dataset.n = i; grid.appendChild(b); }
    var b8 = grid.querySelector('[data-n="8"]'), mary = document.getElementById('mary');
    var rentIt = function () {
      if (reduce || !window.gsap || !mary) { b8.className = 'bt new'; return; }
      var a = mary.querySelector('.av').getBoundingClientRect(), t = b8.getBoundingClientRect();
      var f = document.createElement('span'); f.className = 'fly'; f.textContent = 'Mary'; document.body.appendChild(f);
      gsap.set(f, { left: a.left, top: a.top });
      gsap.to(f, { left: t.left + t.width / 2 - 26, top: t.top + t.height / 2 - 14, duration: 1.1, ease: 'power3.inOut', onComplete: function () {
        f.remove(); b8.className = 'bt new'; gsap.fromTo(b8, { scale: 1.35 }, { scale: 1, duration: .8, ease: 'elastic.out(1,.5)' }); } });
    };
    if (reduce || !('IntersectionObserver' in window)) { b8.className = 'bt new'; }
    else new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); setTimeout(rentIt, 700); } }, { threshold: .6 }).observe(grid);
  }

  /* Historia fijada con scroll. */
  var story = document.querySelector('.story'), stage = document.getElementById('stage');
  if (story && stage) {
    var lis = [].slice.call(document.querySelectorAll('#chapters li')), arts = [].slice.call(document.querySelectorAll('.art .a'));
    var D = EN ? ['SAT', 'SAT', 'SAT', 'MON', 'MON'] : ['SÁB', 'SÁB', 'SÁB', 'LUN', 'LUN'];
    var T = EN ? ['2:14 PM', '2:14 PM', '6:00 PM', '6:00 AM', '9:00 AM'] : ['2:14 pm', '2:14 pm', '6:00 pm', '6:00 am', '9:00 am'];
    var BG = ['#FCE9DC', '#F6F4EE', '#F3EADF', '#FFFFFF', '#FBF1E8'];
    var narrow = matchMedia('(max-width: 760px)').matches;
    if (reduce || narrow || !window.gsap || !window.ScrollTrigger) {
      story.classList.add('flat'); lis.forEach(function (l, i) { if (arts[i]) l.appendChild(arts[i]); });
    } else {
      gsap.registerPlugin(ScrollTrigger);
      var cur = -1, n = lis.length, d = document.getElementById('clk-d'), t = document.getElementById('clk-t');
      var show = function (i) {
        if (i === cur) return; cur = i;
        lis.forEach(function (l, k) { l.classList.toggle('on', k === i); });
        arts.forEach(function (a, k) { a.classList.toggle('on', k === i); });
        d.textContent = D[i]; t.textContent = T[i];
        var a = arts[i];
        if (a) gsap.fromTo(a.querySelectorAll('.reg-i,.reg-tot,.charge,.scan,.ph-new,.ph-r,.ct-r,.ct-ok,.lg-r,.lg-n,.po-r,.po-b,.po-ok'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .6, ease: 'expo.out', stagger: .08, overwrite: true });
      };
      var mix = gsap.utils.interpolate;
      var set = function (p) {
        var x = Math.min(n - 1, p * n), i = Math.min(n - 1, Math.floor(x)), f = Math.max(0, (x - i - .55) / .45);
        show(i); stage.style.setProperty('--bg', mix(BG[i], BG[Math.min(n - 1, i + 1)], f));
      };
      set(0);
      ScrollTrigger.create({ trigger: story, start: 'top top', end: '+=' + (n * 85) + '%', pin: stage, scrub: .4, onUpdate: function (s) { set(s.progress); } });
    }
  }

  /* Cierre: 40 puestos que se pagan uno por uno, en ola. */
  var cv = document.getElementById('malla');
  if (cv) {
    var sec = cv.parentNode, cx = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1), W, H, cells = [], t0 = 0, vis = false;
    var size = function () {
      var r = sec.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var cols = W < 700 ? 8 : 10, rows = 4, gap = W < 700 ? 8 : 12, cw = Math.min(64, (Math.min(W, 1100) - 40 - gap * (cols - 1)) / cols), ch = cw * .72;
      var gw = cols * cw + (cols - 1) * gap, x0 = (W - gw) / 2, y0 = W < 700 ? 64 : 80;
      cells = []; for (var r2 = 0; r2 < rows; r2++) for (var c = 0; c < cols; c++) cells.push({ x: x0 + c * (cw + gap), y: y0 + r2 * (ch + gap), w: cw, h: ch, d: (c + r2 * 1.6) * .12 + Math.random() * .25 });
    };
    var draw = function (tt) {
      cx.clearRect(0, 0, W, H);
      cells.forEach(function (c, i) {
        var k = Math.max(0, Math.min(1, (tt - c.d) / .5));
        cx.fillStyle = '#FFFFFF'; rr(c.x, c.y, c.w, c.h, 7); cx.fill(); cx.strokeStyle = 'rgba(5,8,13,.08)'; cx.lineWidth = 1; cx.stroke();
        if (k > 0) {
          cx.fillStyle = 'rgba(180,68,26,' + (.12 + .88 * k) + ')'; rr(c.x, c.y, c.w, c.h, 7); cx.fill();
          cx.strokeStyle = 'rgba(255,255,255,' + k + ')'; cx.lineWidth = 1.8; cx.beginPath();
          var mx = c.x + c.w / 2, my = c.y + c.h / 2, s = Math.min(c.w, c.h) * .18;
          cx.moveTo(mx - s, my); cx.lineTo(mx - s * .25, my + s * .7); cx.lineTo(mx + s * 1.1, my - s * .7); cx.stroke();
        }
        cx.fillStyle = 'rgba(5,8,13,.35)'; cx.font = '500 10px "Geist Mono", monospace'; cx.fillText(String(i + 1), c.x + 6, c.y + 14);
      });
    };
    function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
    var loop = function (now) {
      requestAnimationFrame(loop);
      if (!vis) return;
      if (!t0) t0 = now;
      var tt = ((now - t0) / 1000) % 9;
      draw(tt < 7.4 ? tt : 7.4 - (tt - 7.4) * 4.6);
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      size(); addEventListener('resize', function () { size(); if (reduce) draw(99); });
      if (reduce) { draw(99); return; }
      new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) t0 = 0; }, { threshold: .1 }).observe(sec);
      requestAnimationFrame(loop);
    });
  }

  /* El piso del bazar en vivo: cada venta prende su puesto y suma. */
  var fc = document.getElementById('floorcv');
  if (fc) {
    var fx = fc.getContext('2d'), fd = Math.min(2, devicePixelRatio || 1), FW, FH, B = [], pops = [], sales = 0, tick = 0, bal = {}, fvis = false, last = 0, acc = 0;
    var ks = document.getElementById('k-s'), kt = document.getElementById('k-t'), kd = document.getElementById('k-d');
    var fsize = function () {
      FW = fc.clientWidth; FH = fc.clientHeight; fc.width = FW * fd; fc.height = FH * fd; fx.setTransform(fd, 0, 0, fd, 0, 0);
      var cols = FW < 600 ? 6 : 10, rows = FW < 600 ? 5 : 4, pad = FW < 600 ? 16 : 36, aisle = FW < 600 ? 10 : 18;
      var bw = (FW - pad * 2 - aisle * (cols - 1)) / cols, bh = Math.min(64, (FH - 120 - aisle * (rows - 1)) / rows);
      B = []; var n = 1;
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) B.push({ n: n++, x: pad + c * (bw + aisle), y: 28 + r * (bh + aisle), w: bw, h: bh, glow: 0 });
    };
    var reg = function () { return { x: FW / 2, y: FH - 46 }; };
    var rr2 = function (x, y, w, h, r) { fx.beginPath(); fx.moveTo(x + r, y); fx.arcTo(x + w, y, x + w, y + h, r); fx.arcTo(x + w, y + h, x, y + h, r); fx.arcTo(x, y + h, x, y, r); fx.arcTo(x, y, x + w, y, r); fx.closePath(); };
    var fdraw = function () {
      fx.clearRect(0, 0, FW, FH);
      var R = reg();
      B.forEach(function (b) {
        var g = b.glow;
        fx.fillStyle = g > 0 ? 'rgba(180,68,26,' + (.1 + .8 * g) + ')' : (bal[b.n] ? '#F6EEE6' : '#F3F1EC'); rr2(b.x, b.y, b.w, b.h, 8); fx.fill();
        fx.fillStyle = g > .4 ? '#FFFFFF' : '#5A5F59'; fx.font = '500 11px "Geist Mono", monospace'; fx.fillText(String(b.n), b.x + 8, b.y + 16);
        if (bal[b.n] && b.w > 58) { fx.fillStyle = g > .4 ? '#FFFFFF' : '#0B5E3A'; fx.font = '500 11px "Geist Mono", monospace'; var t = '$' + bal[b.n]; fx.fillText(t, b.x + b.w - fx.measureText(t).width - 8, b.y + b.h - 9); }
      });
      // register
      fx.fillStyle = '#05080D'; rr2(R.x - 54, R.y - 16, 108, 32, 16); fx.fill();
      fx.fillStyle = '#fff'; fx.font = '500 12px Geist, sans-serif'; var lab = EN ? 'Register' : 'Caja'; fx.fillText(lab, R.x - fx.measureText(lab).width / 2, R.y + 4);
      pops.forEach(function (p) {
        var k = Math.min(1, p.t / .55), b = p.b, tx = b.x + b.w / 2, ty = b.y + b.h / 2;
        var cx2 = (R.x + tx) / 2, cy2 = Math.min(R.y, ty) - 60;
        if (k < 1) { var x = (1 - k) * (1 - k) * R.x + 2 * (1 - k) * k * cx2 + k * k * tx, y = (1 - k) * (1 - k) * R.y + 2 * (1 - k) * k * cy2 + k * k * ty;
          fx.strokeStyle = 'rgba(180,68,26,.25)'; fx.lineWidth = 1; fx.beginPath(); fx.moveTo(R.x, R.y - 16); fx.quadraticCurveTo(cx2, cy2, x, y); fx.stroke();
          fx.fillStyle = '#B4441A'; fx.beginPath(); fx.arc(x, y, 4, 0, 6.283); fx.fill(); }
        else { var u = (p.t - .55) / 1.1, a = Math.max(0, 1 - u); fx.fillStyle = 'rgba(11,94,58,' + a + ')'; fx.font = '500 13px "Geist Mono", monospace'; fx.fillText('+$' + p.v, tx - 18, ty - 10 - u * 26); }
      });
    };
    var sale = function () {
      var b = B[(Math.random() * B.length) | 0], v = [12, 18, 24, 35, 38, 45, 60, 75, 110, 145][(Math.random() * 10) | 0];
      pops.push({ b: b, v: v, t: 0, hit: false }); tick++; sales += v;
      kt.textContent = tick; ks.textContent = '$' + sales.toLocaleString('en-US');
    };
    var floop = function (now) {
      requestAnimationFrame(floop);
      if (!fvis) { last = now; return; }
      var dt = Math.min(.05, (now - (last || now)) / 1000); last = now; acc += dt;
      if (acc > .42) { acc = 0; sale(); }
      pops.forEach(function (p) { p.t += dt; if (!p.hit && p.t >= .55) { p.hit = true; p.b.glow = 1; bal[p.b.n] = (bal[p.b.n] || 0) + p.v; kd.textContent = Object.keys(bal).length; } });
      pops = pops.filter(function (p) { return p.t < 1.7; });
      B.forEach(function (b) { b.glow = Math.max(0, b.glow - dt * 1.4); });
      fdraw();
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      fsize(); addEventListener('resize', fsize);
      if (reduce) { for (var i = 0; i < 60; i++) { var b = B[i % B.length]; bal[b.n] = (bal[b.n] || 0) + 38; } ks.textContent = '$2,280'; kt.textContent = '60'; kd.textContent = B.length; fdraw(); return; }
      new IntersectionObserver(function (es) { fvis = es[0].isIntersecting; }, { threshold: .15 }).observe(fc);
      requestAnimationFrame(floop);
    });
  }

  /* Avisos en el celular del vendedor. */
  var tw = document.getElementById('toasts');
  if (tw && !reduce) {
    var N2 = EN ? [['Brass lamp', 'Register 1', 45], ['Glassware set', 'Register 2', 145], ['Gilded mirror', 'Register 1', 110], ['Tin sign', 'Register 3', 24], ['Vinyl record', 'Register 1', 18]]
               : [['Lámpara de latón', 'Caja 1', 45], ['Juego de vasos', 'Caja 2', 145], ['Espejo dorado', 'Caja 1', 110], ['Letrero de lámina', 'Caja 3', 24], ['Disco de vinilo', 'Caja 1', 18]];
    var ti = 0, tvis = false;
    new IntersectionObserver(function (es) { tvis = es[0].isIntersecting; }, { threshold: .3 }).observe(tw.parentNode);
    setInterval(function () {
      if (!tvis || document.hidden) return;
      var d = N2[ti++ % N2.length], el = document.createElement('div'); el.className = 'toast';
      el.innerHTML = '<i>$</i><div><b>' + (EN ? 'Sold: ' : 'Vendida: ') + d[0] + '</b><small>' + d[1] + (EN ? ' · just now' : ' · ahora') + '</small></div><span class="mono">+$' + d[2] + '</span>';
      tw.prepend(el); if (window.gsap) gsap.from(el, { y: -14, opacity: 0, duration: .6, ease: 'expo.out' });
      while (tw.children.length > 3) tw.lastChild.remove();
    }, 2300);
  }

  /* Cierre: cuánto se pagó. */
  var paid = document.getElementById('paid');
  if (paid) {
    var go = function () { if (!window.gsap || reduce) { paid.textContent = '$48,210'; return; } var o = { v: 0 }; gsap.to(o, { v: 48210, duration: 2.6, ease: 'expo.out', onUpdate: function () { paid.textContent = '$' + Math.round(o.v).toLocaleString('en-US'); } }); };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); go(); } }, { threshold: .4 }).observe(paid.closest('section')); else go();
  }

  /* Antes y después: la cuenta del lunes. */
  var iN = document.getElementById('i-n'), iR = document.getElementById('i-r');
  if (iN && iR) {
    var oN = document.getElementById('o-n'), oR = document.getElementById('o-r'), oHb = document.getElementById('o-hb'), oHa = document.getElementById('o-ha'), oV = document.getElementById('o-v'), bB = document.getElementById('bar-b'), bA = document.getElementById('bar-a');
    var cur2 = { hb: 0, ha: 0, v: 0 };
    var calc = function (anim) {
      var n = +iN.value, r = +iR.value, hb = n * 13 * 4.33 / 60, haMin = (10 + n * .05) * 4.33, v = Math.max(0, (hb - haMin / 60) * r);
      oN.textContent = n; oR.textContent = '$' + r;
      var put = function () { oHb.textContent = Math.round(cur2.hb) + ' h'; oHa.textContent = Math.round(cur2.ha) + ' min'; oV.textContent = '$' + Math.round(cur2.v).toLocaleString('en-US'); };
      if (window.gsap && !reduce && anim) gsap.to(cur2, { hb: hb, ha: haMin, v: v, duration: .9, ease: 'expo.out', onUpdate: put, overwrite: true });
      else { cur2.hb = hb; cur2.ha = haMin; cur2.v = v; put(); }
      bB.style.width = '100%'; bA.style.width = Math.max(2, haMin / 60 / hb * 100) + '%';
    };
    iN.addEventListener('input', function () { calc(true); }); iR.addEventListener('input', function () { calc(true); });
    calc(false);
    if (!reduce && 'IntersectionObserver' in window) { cur2.hb = cur2.ha = cur2.v = 0; oHb.textContent = '0 h'; oHa.textContent = '0 min'; oV.textContent = '$0';
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); calc(true); } }, { threshold: .4 }).observe(iN.closest('section')); }
  }

  /* Barra fija para empezar la prueba. */
  var sk = document.getElementById('sticky'), hero = document.getElementById('inicio'), pr = document.getElementById('prueba'), fin = document.getElementById('cierre'), pc = document.getElementById('precios'), pbx = document.getElementById('pruebalo'), flx = document.getElementById('piso');
  if (sk && hero && 'IntersectionObserver' in window) {
    var past = false, busy = false, upd = function () { sk.classList.toggle('on', past && !busy); };
    new IntersectionObserver(function (es) { past = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; upd(); }).observe(hero);
    var bz = new Set();
    var ob = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) bz.add(e.target); else bz.delete(e.target); }); busy = bz.size > 0; upd(); });
    [pr, fin, pc, pbx, flx, document.getElementById('web')].forEach(function (el) { if (el) ob.observe(el); });
  }

  var fmt = function (v) { return '$' + Math.round(v).toLocaleString('en-US'); };
  /* Pruébalo: cobra una venta y mira a quién le toca. */
  var pl = document.getElementById('pruebalo');
  if (pl) {
    var list = document.getElementById('pr-l'), tot = document.getElementById('pr-t'), cnt = document.getElementById('pr-n'), chg = document.getElementById('pr-c'), rst = document.getElementById('pr-r');
    var base = { 12: 1550, 7: 305 }, bal2 = { 12: 1550, 7: 305 }, items = [], empty = cnt.textContent;
    var setBal = function (b, v, anim) { var el = pl.querySelector('[data-bal="' + b + '"]'); if (window.gsap && anim && !reduce) { var o = { v: bal2[b] }; gsap.to(o, { v: v, duration: .9, ease: 'expo.out', onUpdate: function () { el.textContent = fmt(o.v); } }); } else el.textContent = fmt(v); bal2[b] = v; };
    var redraw = function () {
      var sum = items.reduce(function (a, x) { return a + x.v; }, 0);
      tot.textContent = fmt(sum); chg.disabled = !items.length;
      cnt.textContent = items.length ? items.length + (EN ? (items.length > 1 ? ' items' : ' item') : (items.length > 1 ? ' piezas' : ' pieza')) : empty;
      chg.textContent = items.length ? (EN ? 'Charge ' : 'Cobrar ') + fmt(sum) : (EN ? 'Charge' : 'Cobrar');
    };
    pl.querySelectorAll('.tg').forEach(function (t) {
      t.addEventListener('click', function () {
        t.classList.remove('scan'); void t.offsetWidth; t.classList.add('scan', 'in');
        setTimeout(function () {
          var it = { n: t.querySelector('b').textContent, w: t.querySelector('small').textContent, v: +t.dataset.v, b: t.dataset.b };
          items.push(it);
          var li = document.createElement('li'); li.innerHTML = '<span></span><span class="mono"></span><small></small>';
          li.children[0].textContent = it.n; li.children[1].textContent = fmt(it.v); li.children[2].textContent = it.w;
          list.appendChild(li); if (window.gsap && !reduce) gsap.from(li, { x: -14, opacity: 0, duration: .5, ease: 'expo.out' });
          redraw();
        }, reduce ? 0 : 380);
      });
    });
    chg.addEventListener('click', function () {
      if (!items.length) return;
      var r0 = chg.getBoundingClientRect(), by = {};
      items.forEach(function (it, k) {
        by[it.b] = (by[it.b] || 0) + it.v;
        var m = pl.querySelector('.mini[data-b="' + it.b + '"]').getBoundingClientRect();
        if (window.gsap && !reduce) {
          var c = document.createElement('span'); c.className = 'chip'; c.textContent = '+' + fmt(it.v); document.body.appendChild(c);
          gsap.set(c, { left: r0.left + r0.width / 2 - 24, top: r0.top });
          gsap.to(c, { left: m.left + m.width / 2 - 24, top: m.top + 20, duration: .9, delay: k * .12, ease: 'power3.inOut', onComplete: function () { c.remove(); } });
        }
      });
      setTimeout(function () {
        Object.keys(by).forEach(function (b) {
          setBal(b, bal2[b] + by[b], true);
          var e = pl.querySelector('[data-new="' + b + '"]'); e.textContent = '+' + fmt(by[b]);
          if (window.gsap && !reduce) gsap.fromTo(e, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .5, ease: 'expo.out' }); else e.style.opacity = 1;
          var mm = pl.querySelector('.mini[data-b="' + b + '"]'); if (window.gsap && !reduce) gsap.fromTo(mm, { scale: 1.04 }, { scale: 1, duration: .7, ease: 'elastic.out(1,.5)' });
        });
        items = []; list.innerHTML = ''; pl.querySelectorAll('.tg').forEach(function (t) { t.classList.remove('in'); });
        redraw(); cnt.textContent = EN ? 'Paid out to each dealer ✓' : 'Repartido a cada vendedor ✓';
      }, reduce ? 0 : 950 + items.length * 120);
    });
    rst.addEventListener('click', function () { items = []; list.innerHTML = ''; [12, 7].forEach(function (b) { setBal(b, base[b], false); pl.querySelector('[data-new="' + b + '"]').style.opacity = 0; }); pl.querySelectorAll('.tg').forEach(function (t) { t.classList.remove('in'); }); redraw(); });
  }

  /* Titulares de sección que suben palabra por palabra. */
  if (window.gsap && !reduce && 'IntersectionObserver' in window) {
    document.querySelectorAll('.sh h2, #prueba h2, #ia h2, #preguntas h2').forEach(function (h) {
      var walk = function (node) {
        [].slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var f = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; } var o = document.createElement('span'); o.className = 'ln'; var i = document.createElement('span'); i.className = 'lw'; i.textContent = w; o.appendChild(i); f.appendChild(o); });
            n.parentNode.replaceChild(f, n);
          } else if (n.nodeType === 1 && n.className !== 'ln') walk(n);
        });
      };
      h.classList.add('rv'); walk(h);
      var ws = h.querySelectorAll('.lw'); gsap.set(ws, { yPercent: 110 });
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); gsap.to(ws, { yPercent: 0, duration: .9, ease: 'expo.out', stagger: .045 }); } }, { threshold: .6 }).observe(h);
    });
  }

  /* Los cinco dolores se tachan. */
  var row = document.querySelector('.pain-row');
  if (row) { if (reduce || !('IntersectionObserver' in window)) row.classList.add('go'); else new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); setTimeout(function () { row.classList.add('go'); }, 300); } }, { threshold: .7 }).observe(row); }

  /* Luz que sigue al cursor en los planes. */
  document.querySelectorAll('.plan').forEach(function (p) { p.addEventListener('pointermove', function (e) { var r = p.getBoundingClientRect(); p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px'); }); });

  /* Plano: quién está en cada puesto. */
  if (grid) {
    var names = ['Ana', 'Bob', 'Carla', 'Dale', 'Eve', 'Frank', 'Gina', 'Hector', 'Iris', 'Jack', 'Kim', 'Luis', 'Mae', 'Nick', 'Olga', 'Pat', 'Quinn', 'Rosa', 'Sam', 'Tina', 'Uma', 'Vic', 'Wes', 'Xena', 'Yoli', 'Zoe', 'Abe', 'Bea', 'Cruz', 'Dina', 'Eli', 'Fay'];
    grid.querySelectorAll('.bt').forEach(function (b, i) {
      var n = +b.dataset.n;
      if (n === 12) b.dataset.tip = 'Rosa · $1,550';
      else if (b.classList.contains('o')) b.dataset.tip = (EN ? 'Open · $75/wk' : 'Libre · $75/sem');
      else b.dataset.tip = names[i] + ' · $' + (120 + (n * 137) % 900);
    });
  }

  /* Tu bazar en internet: venta en caja que sale del sitio y pieza apartada en línea. */
  (function () {
    var web = document.getElementById('web'); if (!web) return;
    var EN3 = (document.documentElement.lang || '').indexOf('en') === 0;
    var P = [['olivetti','Máquina de escribir Olivetti','Olivetti typewriter',14,'Rosa',85],['talavera','Plato de cerámica pintada','Hand-painted plate',22,'Lupe',65],['espejo','Espejo ovalado','Oval wall mirror',8,'Mary',110],['radio','Radio de los años 50','1950s tabletop radio',17,'Tony',120],['mimbre','Silla de mimbre','Wicker armchair',3,'Sophie',95],['quinque','Quinqué de latón','Brass oil lamp',9,'Rosa',75],['oleo','Óleo de paisaje','Landscape oil painting',19,'Ana',480],['garrafa','Botella de barro','Clay flask',31,'Tony',140],['espejo-mano','Espejo de mano esmaltado','Enameled hand mirror',12,'Lupe',210],['maceta','Maceta de barro','Terracotta planter',27,'Sophie',38],['sombrero','Sombrero de palma','Shell-trimmed palm hat',5,'Mary',45],['silla-tallada','Silla tallada antigua','Carved antique armchair',33,'Tony',650],['tarro','Tarro de cerámica','Stoneware crock',11,'Rosa',55],['plato','Plato pintado a mano','Painted serving plate',22,'Lupe',90],['vaso','Vaso de cristal pintado','Painted glass tumbler',6,'Ana',28],['botellones','Par de botellones','Pair of clay flasks',31,'Tony',160]];
    var L = EN3 ? { sold: 'Sold', hold: 'Held', nw: 'New', bo: 'Booth' } : { sold: 'Vendido', hold: 'Apartado', nw: 'Nuevo', bo: 'Puesto' };
    var nm = function (i) { return EN3 ? P[i][2] : P[i][1]; };
    var sub = function (i) { return L.bo + ' ' + P[i][3] + ' · ' + P[i][4]; };
    var src = function (i) { var im = web.querySelector('img'); return im.getAttribute('src').replace(/[^\/]+\.webp$/, P[i][0] + '.webp'); };
    var $ = function (id) { return document.getElementById(id); };
    var g = $('sfG'), cards = [].slice.call(g.children), slot = [0,1,2,3,4,5,6,7], nxt = 8;
    var reg = $('reg'), buy = $('buy'), path = $('bmP'), dot = $('bmD'), cur = $('cur'), nEl = $('sfN'), count = 1248;
    var fill = function (c, i, isNew) {
      c.querySelector('img').src = src(i); c.querySelector('b').textContent = nm(i); c.querySelector('small').textContent = sub(i);
      c.querySelector('em').textContent = '$' + P[i][5].toLocaleString('en-US'); c.className = 'pc';
      var st = c.querySelector('.pc-st'); st.className = 'pc-st'; st.style.opacity = 0;
      var o = c.querySelector('.bdg'); if (o) o.remove();
      if (isNew) { o = document.createElement('span'); o.className = 'bdg'; o.textContent = L.nw; c.querySelector('.pc-i').appendChild(o); }
    };
    var setReg = function (i) { $('rgI').src = src(i); $('rgN').textContent = nm(i); $('rgB').textContent = sub(i); $('rgP').textContent = '$' + P[i][5].toLocaleString('en-US'); };
    var setBuy = function (i) { $('byI').src = src(i); $('byN').textContent = nm(i); $('byB').textContent = sub(i); $('byP').textContent = '$' + P[i][5].toLocaleString('en-US'); };
    setReg(1); setBuy(2);
    if (reduce || !window.gsap || !('IntersectionObserver' in window)) { $('byOk').style.opacity = 1; return; }
    var G = gsap, vis = false, started = false, turn = 0;
    var cnt = function (d) { count += d; nEl.textContent = count.toLocaleString('en-US'); G.fromTo(nEl, { color: d < 0 ? '#B4441A' : '#0B5E3A' }, { color: '#05080D', duration: 1.2 }); };
    var rel = function (el) { var a = el.getBoundingClientRect(), w = web.getBoundingClientRect(); return { x: a.left - w.left, y: a.top - w.top, w: a.width, h: a.height }; };
    var visCards = function () { return cards.filter(function (c) { return c.offsetParent !== null; }); };
    var beam = function (from, to, done) {
      var d = 'M' + from.x + ' ' + from.y + ' C' + from.x + ' ' + (from.y - 140) + ' ' + to.x + ' ' + (to.y + 160) + ' ' + to.x + ' ' + to.y;
      path.setAttribute('d', d); var L2 = path.getTotalLength(); var o = { t: 0 };
      G.set(path, { strokeDasharray: L2, strokeDashoffset: L2, opacity: 1 }); G.set(dot, { opacity: 1 });
      G.to(path, { strokeDashoffset: 0, duration: .8, ease: 'power2.inOut' });
      G.to(o, { t: 1, duration: .8, ease: 'power2.inOut', onUpdate: function () { var p = path.getPointAtLength(o.t * L2); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); }, onComplete: function () { G.to([path, dot], { opacity: 0, duration: .5, delay: .1 }); done(); } });
    };
    var stamp = function (c, hold) { var st = c.querySelector('.pc-st'); st.textContent = hold ? L.hold : L.sold; st.className = 'pc-st' + (hold ? ' hold' : ''); c.classList.add('sold');
      G.fromTo(st, { opacity: 0, scale: 2.4, rotate: -16, xPercent: -50, yPercent: -50 }, { opacity: 1, scale: 1, rotate: -10, xPercent: -50, yPercent: -50, duration: .42, ease: 'back.out(2)' });
      G.fromTo(c, { x: 0 }, { x: 2, duration: .05, repeat: 5, yoyo: true, delay: .25 }); };
    var swap = function (k, c) { G.to(c, { opacity: 0, scale: .9, y: 8, duration: .45, delay: 1.1, ease: 'power2.in', onComplete: function () {
      var i = nxt; nxt = (nxt + 1) % P.length; while (slot.indexOf(nxt) > -1) nxt = (nxt + 1) % P.length; slot[k] = i; fill(c, i, true); cnt(1);
      G.fromTo(c, { opacity: 0, scale: .92, y: -14 }, { opacity: 1, scale: 1, y: 0, duration: .7, ease: 'back.out(1.6)' });
      G.fromTo(c.querySelector('.bdg'), { scale: 0 }, { scale: 1, duration: .5, delay: .3, ease: 'back.out(3)' }); } }); };
    var pick = function () { var vc = visCards(); return vc[Math.floor(Math.random() * vc.length)]; };
    var sale = function (next) {
      var c = pick(), k = cards.indexOf(c), i = slot[k]; setReg(i);
      var t = $('rgT'), m = 14 + (turn % 40); t.textContent = '2:' + (m < 10 ? '0' : '') + m + ' pm';
      G.fromTo(reg, { y: 0 }, { y: -6, duration: .25, yoyo: true, repeat: 1, ease: 'power2.out' });
      G.fromTo('.rg-l', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: .45, ease: 'expo.out' });
      G.fromTo('.rg-las', { opacity: 1, top: 44 }, { top: 96, opacity: 0, duration: .7, ease: 'power1.inOut' });
      G.fromTo('#rgS', { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, delay: .55, ease: 'back.out(3)' });
      G.fromTo('#rgY', { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: .4, delay: .9 });
      G.delayedCall(1.15, function () { var a = rel(reg), b = rel(c); beam({ x: a.x + a.w - 40, y: a.y + 4 }, { x: b.x + b.w / 2, y: b.y + b.w / 2 }, function () { stamp(c, false); cnt(-1); swap(k, c); G.delayedCall(2.6, next); }); });
    };
    var hold = function (next) {
      if (buy.offsetParent === null || getComputedStyle(buy).display === 'none') return sale(next);
      var c = pick(), k = cards.indexOf(c), i = slot[k], b = rel(c), s = rel(buy);
      G.set(cur, { x: s.x - 60, y: b.y + 40, opacity: 0 });
      G.timeline({ onComplete: function () {
        c.classList.add('pick'); G.fromTo(c, { scale: 1 }, { scale: .97, duration: .12, yoyo: true, repeat: 1 });
        G.delayedCall(.3, function () { var b2 = rel(c); beam({ x: b2.x + b2.w / 2, y: b2.y + 10 }, { x: s.x + 20, y: s.y + 70 }, function () {
          setBuy(i); G.set('#byOk', { opacity: 0 }); G.fromTo(['.by-i', '#byN', '#byB', '#byP'], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, stagger: .06, ease: 'expo.out' });
          G.to(cur, { opacity: 0, duration: .3 });
          G.fromTo('#byBtn', { scale: 1 }, { scale: .93, duration: .14, delay: .9, yoyo: true, repeat: 1 });
          G.fromTo('#byOk', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, delay: 1.25, ease: 'back.out(2)', onComplete: function () { c.classList.remove('pick'); stamp(c, true); cnt(-1); swap(k, c); G.delayedCall(2.8, next); } });
        }); });
      } }).to(cur, { opacity: 1, duration: .3 }).to(cur, { x: b.x + b.w * .55, y: b.y + b.w * .5, duration: 1.1, ease: 'power3.inOut' });
    };
    var like = function () { if (vis) { var c = pick(), h = c.querySelector('.pc-h'), n = h.querySelector('.mono'); n.textContent = (+n.textContent) + 1; h.classList.add('liked'); G.fromTo(h, { scale: 1.5 }, { scale: 1, duration: .5, ease: 'back.out(3)' }); } G.delayedCall(1.4 + Math.random() * 1.4, like); };
    var loop = function () { if (!vis) { started = false; return; } turn++; (turn % 2 ? sale : hold)(loop); };
    var intro = function () {
      var ut = web.querySelector('.url-t'), full = ut.textContent, car = web.querySelector('.caret'); ut.textContent = '';
      G.from('.bw', { y: 70, rotateX: 10, opacity: 0, duration: 1.2, ease: 'expo.out' });
      G.from(reg, { x: -50, opacity: 0, duration: 1, delay: .5, ease: 'expo.out' }); G.from(buy, { x: 50, opacity: 0, duration: 1, delay: .65, ease: 'expo.out' });
      G.set(car, { opacity: 1 }); var o = { n: 0 }; G.to(o, { n: full.length, duration: 1, delay: .4, ease: 'none', onUpdate: function () { ut.textContent = full.slice(0, Math.round(o.n)); }, onComplete: function () { G.to(car, { opacity: 0, duration: .2, repeat: 3, yoyo: true }); } });
      G.from(cards, { opacity: 0, y: 30, scale: .94, duration: .8, stagger: .07, delay: .9, ease: 'expo.out' });
      var c0 = { v: 0 }; G.to(c0, { v: count, duration: 1.6, delay: .9, ease: 'expo.out', onUpdate: function () { nEl.textContent = Math.round(c0.v).toLocaleString('en-US'); } });
      G.delayedCall(2.4, like); G.delayedCall(2.6, function () { started = true; loop(); });
    };
    var done = false;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && !done) { done = true; intro(); } else if (vis && done && !started && nxt) { started = true; G.delayedCall(.6, loop); } }, { threshold: .25 }).observe(web);
  })();
})();
