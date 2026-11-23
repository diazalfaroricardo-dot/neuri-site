/* Cierre: 3,000 puntos en caos que se ponen de acuerdo y escriben «hola». */
(function () {
  var cv = document.getElementById('hola'); if (!cv) return;
  var sec = cv.parentNode, cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1);
  var N = 3000, W, H, X, Y, VX, VY, TX, TY, C, S, mode = 0, t = 0, last = 0, phaseT = 0, vis = false, px = -1e4, py = -1e4;
  var COL = ['143,224,180', '143,224,180', '143,224,180', '246,244,238', '252,233,220', '60,170,115'];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function targets() {
    var o = document.createElement('canvas'), g = o.getContext('2d');
    var narrow = W < 700, fs = narrow ? Math.min(W * .42, 170) : Math.min(W * .3, 300);
    var top = narrow ? 40 : 50, boxH = fs * 1.15;
    o.width = W; o.height = top + boxH + 20; var g0 = g;
    var word = (document.documentElement.lang || '').indexOf('en') === 0 ? 'hello' : 'hola';
    g.font = '500 ' + fs + 'px Geist, system-ui, sans-serif'; var mw = g.measureText(word).width; if (mw > W * .8) { fs = fs * W * .8 / mw; }
    g.fillStyle = '#000'; g.font = '500 ' + fs + 'px Geist, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillText(word, W / 2, top);
    var d = g.getImageData(0, 0, o.width, o.height).data, pts = [], step = narrow ? 3 : 4;
    for (var y = 0; y < o.height; y += step) for (var x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 128) pts.push(x, y);
    var n = pts.length / 2;
    for (var i = 0; i < N; i++) { var k = (i * 7919) % n; TX[i] = pts[k * 2] + (Math.random() - .5) * step; TY[i] = pts[k * 2 + 1] + (Math.random() - .5) * step; }
  }
  function size() {
    var r = sec.getBoundingClientRect(); W = Math.round(r.width); H = Math.round(r.height);
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!X) { X = new Float32Array(N); Y = new Float32Array(N); VX = new Float32Array(N); VY = new Float32Array(N); TX = new Float32Array(N); TY = new Float32Array(N); C = new Uint8Array(N); S = new Float32Array(N);
      for (var i = 0; i < N; i++) { X[i] = Math.random() * W; Y[i] = Math.random() * H; C[i] = (Math.random() * COL.length) | 0; S[i] = 1.1 + Math.random() * 1.2; } }
    targets();
  }
  function step(dt) {
    t += dt; phaseT += dt;
    if (mode === 0 && phaseT > 3.2) { mode = 1; phaseT = 0; }
    else if (mode === 1 && phaseT > 7.5) { mode = 2; phaseT = 0; }
    else if (mode === 2 && phaseT > 1.6) { mode = 0; phaseT = 0; }
    for (var i = 0; i < N; i++) {
      var x = X[i], y = Y[i], ax, ay;
      if (mode === 1) {
        var k = Math.min(1, phaseT / 1.8), dx = TX[i] - x, dy = TY[i] - y;
        ax = dx * (2 + 10 * k) ; ay = dy * (2 + 10 * k);
        var br = Math.sin(t * 1.6 + i) * 6; ax += Math.cos(i) * br; ay += Math.sin(i * 1.3) * br;
        VX[i] = (VX[i] + ax * dt) * (1 - Math.min(.95, 5.5 * dt)); VY[i] = (VY[i] + ay * dt) * (1 - Math.min(.95, 5.5 * dt));
      } else {
        var a = Math.sin(x * .0045 + t * .35) * 2.4 + Math.cos(y * .0052 - t * .28) * 2.4 + (i % 2 ? .6 : -.6);
        var sp = mode === 2 ? 240 : 90;
        ax = Math.cos(a) * sp; ay = Math.sin(a) * sp;
        if (mode === 2) { ax += (x - W / 2) * .9; ay += (y - H * .3) * .9; }
        VX[i] += (ax - VX[i]) * Math.min(1, 2.2 * dt); VY[i] += (ay - VY[i]) * Math.min(1, 2.2 * dt);
      }
      var qx = x - px, qy = y - py, q = qx * qx + qy * qy;
      if (q < 14400) { var f = (1 - q / 14400) * 1600; var dd = Math.sqrt(q) || 1; VX[i] += qx / dd * f * dt; VY[i] += qy / dd * f * dt; }
      x += VX[i] * dt; y += VY[i] * dt;
      if (mode !== 1) { if (x < -10) x = W + 10; else if (x > W + 10) x = -10; if (y < -10) y = H + 10; else if (y > H + 10) y = -10; }
      X[i] = x; Y[i] = y;
    }
  }
  function draw() {
    cx.clearRect(0, 0, W, H);
    for (var c = 0; c < COL.length; c++) {
      cx.fillStyle = 'rgba(' + COL[c] + ',' + (c === 3 ? .8 : .95) + ')'; cx.beginPath();
      for (var i = 0; i < N; i++) if (C[i] === c) cx.rect(X[i], Y[i], S[i], S[i]);
      cx.fill();
    }
    if (mode === 1 && phaseT > 1.2) {
      cx.strokeStyle = 'rgba(143,224,180,' + (.08 * Math.min(1, (phaseT - 1.2) / 1.5)) + ')'; cx.lineWidth = .5; cx.beginPath();
      for (var i = 0; i < N; i += 9) { var j = (i * 31 + 17) % N, dx = X[j] - X[i], dy = Y[j] - Y[i]; if (dx * dx + dy * dy < 2500) { cx.moveTo(X[i], Y[i]); cx.lineTo(X[j], Y[j]); } }
      cx.stroke();
    }
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!vis || document.hidden) { last = now; return; }
    var dt = Math.min(.033, (now - (last || now)) / 1000); last = now; step(dt); draw();
  }
  function start() {
    size();
    if (reduce) { for (var i = 0; i < N; i++) { X[i] = TX[i]; Y[i] = TY[i]; } mode = 1; phaseT = 9; draw(); return; }
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && mode === 0 && phaseT === 0) phaseT = 0; }, { threshold: .05 }).observe(sec);
    sec.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
    sec.addEventListener('pointerleave', function () { px = py = -1e4; });
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
    requestAnimationFrame(loop);
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
