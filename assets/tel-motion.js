/* Pantallas con movimiento (portada ES/EN): cada teléfono recorre su captura y una capa muestra,
   con datos de ejemplo, el trabajo que hace ese producto. GSAP + ScrollTrigger: solo corre en pantalla.
   Con prefers-reduced-motion no se agrega nada (se queda la captura fija). */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var en = document.documentElement.lang === 'en';
  var T = en ? {
    bots: ['Is the dresser still available?', 'Yes! $1,800. Want me to hold it until Saturday?', '✓ Answered in <em>2.8 s</em>'],
    bazar: ['Sale · Brass lamp <em>$450</em>', 'Booth 12 · Rosa <em>+$450</em> to her balance', 'Weekly rent <em>−$300</em> taken out automatically'],
    mk: ['<em>30</em> posts ready for the month', 'Approved with one tap ✓'],
    cs: ['AI Score', 'Copy email data to CRM <em>6.5 h/wk</em>', '90-day plan ready ✓']
  } : {
    bots: ['¿Sigue disponible el ropero?', '¡Sí! $1,800. ¿Te lo aparto hasta el sábado?', '✓ Contestado en <em>2.8 s</em>'],
    bazar: ['Venta · Lámpara de latón <em>$450</em>', 'Puesto 12 · Doña Rosa <em>+$450</em> a su saldo', 'Renta semanal <em>−$300</em> descontada sola'],
    mk: ['<em>30</em> posts listos para el mes', 'Aprobado con un toque ✓'],
    cs: ['AI Score', 'Copiar correos al CRM <em>6.5 h/sem</em>', 'Plan de 90 días listo ✓']
  };
  function el(cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; return d; }
  var IN = { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'back.out(1.6)' };

  function build(kind, layer) {
    var tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true });
    var items = [];
    if (kind === 'bots') {
      var q = el('in', T.bots[0]), ty = el('out typing', '<i></i><i></i><i></i>'), a = el('out', T.bots[1]), ok = el('dark', T.bots[2]);
      items = [q, ty, a, ok];
      tl.to(q, IN).to(ty, IN, '+=.35')
        .to(ty.children, { opacity: 1, yoyo: true, repeat: 3, duration: .18, stagger: .08 }, '<')
        .set(ty, { display: 'none' }, '+=.1').to(a, IN).to(ok, IN, '+=.5');
    } else if (kind === 'bazar') {
      var s = el('dark', T.bazar[0]), b = el('dark', T.bazar[1]), r = el('dark peach', T.bazar[2]);
      items = [s, b, r];
      tl.to(s, IN).to(b, IN, '+=.6').to(r, IN, '+=.6');
    } else if (kind === 'mk') {
      var g = el('grid', new Array(10).join('<i></i>')), n = el('dark', T.mk[0]), ap = el('out', T.mk[1]);
      items = [g, n, ap];
      tl.to(g, IN).to(g.children, { opacity: 1, scale: 1, duration: .25, stagger: .08, ease: 'back.out(2)' }, '<.1')
        .to(n, IN, '+=.2').to(ap, IN, '+=.6');
      gsap.set(g.children, { opacity: 0, scale: .4 });
    } else if (kind === 'cs') {
      var ring = el('dark ring', '<svg width="34" height="34" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(233,238,242,.15)" stroke-width="4"/><circle class="arc" cx="18" cy="18" r="15" fill="none" stroke="#8FE0B4" stroke-width="4" stroke-linecap="round" stroke-dasharray="94.2" stroke-dashoffset="94.2" transform="rotate(-90 18 18)"/></svg><span>' + T.cs[0] + ' <em class="sc">0</em></span>');
      var h = el('dark', T.cs[1]), pl = el('out', T.cs[2]), o = { v: 0 };
      items = [ring, h, pl];
      tl.to(ring, IN)
        .to(ring.querySelector('.arc'), { attr: { 'stroke-dashoffset': 94.2 * (1 - .72) }, duration: 1.2, ease: 'power2.out' }, '<.1')
        .to(o, { v: 72, duration: 1.2, ease: 'power2.out', onUpdate: function () { ring.querySelector('.sc').textContent = Math.round(o.v); } }, '<')
        .to(h, IN, '+=.2').to(pl, IN, '+=.6');
    }
    items.forEach(function (i) { layer.appendChild(i); });
    gsap.set(items, { opacity: 0, y: 12, scale: .96 });
    tl.to(items, { opacity: 0, y: -8, duration: .35, stagger: .05 }, '+=2.2')
      .add(function () { items.forEach(function (i) { i.style.display = ''; }); });
    return tl;
  }

  document.querySelectorAll('.shot').forEach(function (shot) {
    var h = shot.getAttribute('href') || '';
    var kind = /bazar/.test(h) ? 'bazar' : /sigue|still/.test(h) ? 'bots' : /marketing/.test(h) ? 'mk' : /consult/.test(h) ? 'cs' : null;
    if (!kind) return;
    var layer = document.createElement('div');
    layer.className = 'tm'; layer.setAttribute('aria-hidden', 'true');
    shot.appendChild(layer);
    var tl = build(kind, layer);
    // La captura se recorre despacio de arriba abajo (ida y vuelta), como si alguien la estuviera usando.
    var tel = shot.querySelector('.tel'), pic = tel && tel.querySelector('picture');
    var pan = pic ? gsap.to(pic, { y: function () { return -Math.max(0, pic.offsetHeight - tel.clientHeight + 40); }, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: 1, paused: true }) : null;
    ScrollTrigger.create({
      trigger: shot, start: 'top 90%', end: 'bottom 10%',
      onToggle: function (st) { [tl, pan].forEach(function (a) { if (a) st.isActive ? a.play() : a.pause(); }); }
    });
  });
})();
