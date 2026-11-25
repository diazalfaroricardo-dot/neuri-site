/* bots · precios: tarjetas entran con desenfoque escalonado, el precio cuenta hasta su cifra y una red de puntos se asienta detrás.
   Sin JS o con prefers-reduced-motion todo queda visible y quieto. */
(function(){
  var sec = document.getElementById("precios"); if (!sec || !sec.classList.contains("pz")) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var plans = [].slice.call(sec.querySelectorAll(".pz-plan"));
  function count(el){
    var orig = el.textContent, m = orig.match(/^(\D*)([\d,]+)(.*)$/); if (!m) return;
    var t = +m[2].replace(/,/g, ""), st = performance.now(), d = 900;
    (function f(n){ var p = Math.min(1, (n - st) / d), e = 1 - Math.pow(1 - p, 4);
      if (p < 1) { el.textContent = m[1] + Math.round(t * (.6 + .4 * e)).toLocaleString("en-US") + m[3]; requestAnimationFrame(f); }
      else el.textContent = orig; })(st);
  }
  if (!reduce && "IntersectionObserver" in window) {
    plans.forEach(function(p){ p.classList.add("pre"); });
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (!e.isIntersecting) return;
      e.target.classList.remove("pre"); var a = e.target.querySelector(".pn"); if (a) count(a); io.unobserve(e.target); }); }, { threshold: .2 });
    plans.forEach(function(p){ io.observe(p); });
  }
  var c = sec.querySelector(".pz-net"); if (!c || !c.getContext) return;
  var x = c.getContext("2d"), W, H, pts = [], t0 = performance.now(), on = false, raf = 0;
  function size(){ var r = c.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
    c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(140, Math.round(W * H / 16000)); pts = [];
    for (var i = 0; i < n; i++) { var tx = Math.random() * W, ty = Math.random() * H;
      pts.push({ tx: tx, ty: ty, x: tx + (Math.random() - .5) * 160, y: ty - 60 - Math.random() * 120, ph: Math.random() * 6.28 }); }
    t0 = performance.now(); if (reduce) draw(t0 + 1e6); }
  function draw(n){ var k = reduce ? 1 : Math.min(1, (n - t0) / 2600), e = 1 - Math.pow(1 - k, 4), i, j, a, b, d;
    x.clearRect(0, 0, W, H);
    for (i = 0; i < pts.length; i++) { a = pts[i]; var w = reduce ? 0 : 1;
      a.cx = a.x + (a.tx - a.x) * e + Math.sin(n / 2600 + a.ph) * 2 * w; a.cy = a.y + (a.ty - a.y) * e + Math.cos(n / 3000 + a.ph) * 2 * w; }
    x.lineWidth = 1;
    for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) { a = pts[i]; b = pts[j]; d = Math.hypot(a.cx - b.cx, a.cy - b.cy);
      if (d < 120) { x.strokeStyle = "rgba(11,94,58," + ((1 - d / 120) * .28 * e).toFixed(3) + ")"; x.beginPath(); x.moveTo(a.cx, a.cy); x.lineTo(b.cx, b.cy); x.stroke(); } }
    x.fillStyle = "rgba(11,94,58," + (.22 + .3 * e).toFixed(3) + ")";
    for (i = 0; i < pts.length; i++) { a = pts[i]; x.beginPath(); x.arc(a.cx, a.cy, 1.6, 0, 6.28); x.fill(); }
    if (!reduce && on) raf = requestAnimationFrame(draw); }
  var lw = 0, seen = false; function rs(){ var w = c.getBoundingClientRect().width; if (Math.abs(w - lw) > 1) { lw = w; size(); } }
  rs(); addEventListener("resize", rs);
  if (reduce) return;
  new IntersectionObserver(function(es){ var v = es[0].isIntersecting; if (v && !on) { if (!seen) { seen = true; t0 = performance.now(); } on = true; raf = requestAnimationFrame(draw); } else if (!v) { on = false; cancelAnimationFrame(raf); } }).observe(sec);
})();
