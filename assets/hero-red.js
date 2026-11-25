/* Hero: la red de puntos del cierre, en claro. Verde y terracota sobre papel #F6F4EE, detrás del titular.
   Mismo campo de flujo que hola.js (deriva lenta, el puntero aparta), sin formar palabra; hilos finos entre vecinos.
   prefers-reduced-motion: un cuadro quieto. Se pausa fuera de pantalla o con la pestaña oculta. */
(function () {
  var cv = document.getElementById('red'); if (!cv || !cv.getContext) return;
  var hero = cv.parentNode, day = document.getElementById('dia'), cx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COL = ['11,94,58', '11,94,58', '31,122,82', '180,68,26', '180,68,26'];
  var N = 0, W = 0, H = 0, X, Y, VX, VY, C, S, t = 0, last = 0, vis = true, px = -1e4, py = -1e4, lw = -1;
  function size() {
    var r = hero.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    var top = 60, bottom = day ? day.getBoundingClientRect().top - r.top + 120 : r.height;
    W = Math.round(r.width); H = Math.round(Math.max(320, bottom + top));
    cv.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    N = Math.max(70, Math.min(300, Math.round(W * H / 4800)));
    X = new Float32Array(N); Y = new Float32Array(N); VX = new Float32Array(N); VY = new Float32Array(N); C = new Uint8Array(N); S = new Float32Array(N);
    for (var i = 0; i < N; i++) { X[i] = Math.random() * W; Y[i] = Math.random() * H; C[i] = (Math.random() * COL.length) | 0; S[i] = 1.3 + Math.random() * .9; }
    if (reduce) draw();
  }
  function step(dt) {
    t += dt;
    for (var i = 0; i < N; i++) {
      var x = X[i], y = Y[i];
      var a = Math.sin(x * .0045 + t * .35) * 2.4 + Math.cos(y * .0052 - t * .28) * 2.4 + (i % 2 ? .6 : -.6);
      VX[i] += (Math.cos(a) * 18 - VX[i]) * Math.min(1, 1.6 * dt); VY[i] += (Math.sin(a) * 18 - VY[i]) * Math.min(1, 1.6 * dt);
      var qx = x - px, qy = y - py, q = qx * qx + qy * qy;
      if (q < 14400) { var f = (1 - q / 14400) * 900, dd = Math.sqrt(q) || 1; VX[i] += qx / dd * f * dt; VY[i] += qy / dd * f * dt; }
      x += VX[i] * dt; y += VY[i] * dt;
      if (x < -10) x = W + 10; else if (x > W + 10) x = -10; if (y < -10) y = H + 10; else if (y > H + 10) y = -10;
      X[i] = x; Y[i] = y;
    }
  }
  function draw() {
    cx.clearRect(0, 0, W, H);
    cx.lineWidth = .7;
    for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
      var dx = X[j] - X[i], dy = Y[j] - Y[i], q = dx * dx + dy * dy;
      if (q < 12100) { cx.strokeStyle = 'rgba(11,94,58,' + ((1 - Math.sqrt(q) / 110) * .22).toFixed(3) + ')'; cx.beginPath(); cx.moveTo(X[i], Y[i]); cx.lineTo(X[j], Y[j]); cx.stroke(); }
    }
    for (var c = 0; c < COL.length; c++) {
      cx.fillStyle = 'rgba(' + COL[c] + ',' + (c > 2 ? .55 : .6) + ')'; cx.beginPath();
      for (var k = 0; k < N; k++) if (C[k] === c) { cx.moveTo(X[k] + S[k], Y[k]); cx.arc(X[k], Y[k], S[k], 0, 6.2832); }
      cx.fill();
    }
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!vis || document.hidden) { last = now; return; }
    var dt = Math.min(.033, (now - (last || now)) / 1000); last = now; step(dt); draw();
  }
  function start() {
    lw = hero.getBoundingClientRect().width; size();
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var w = hero.getBoundingClientRect().width; if (Math.abs(w - lw) > 1) { lw = w; size(); } }, 200); });
    if (reduce) return;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(cv);
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { px = py = -1e4; });
    requestAnimationFrame(loop);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
