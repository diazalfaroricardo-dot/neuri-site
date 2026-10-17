// A212: «Escanéalo con tu teléfono» — en la visita (laptop/tablet) el dueño escanea un QR y se lleva SU demo al celular.
// Toma el mismo link del demo precargado que A209 (a[data-a209]) y cambia src=demo-wa → src=demo-qr. Requiere /assets/qrcode.js.
(function () {
  var en = /^\/en\//.test(location.pathname);
  var T = en
    ? { title: 'Scan it with your phone', sub: 'Your demo, with your products, opens on your phone.', close: 'Close' }
    : { title: 'Escanéalo con tu teléfono', sub: 'Tu demo, con tus productos, se abre en tu celular.', close: 'Cerrar' };
  function demoUrl() {
    var a = document.querySelector('a[data-a209]');
    if (!a) return '';
    try {
      var txt = decodeURIComponent(a.getAttribute('href').split('text=')[1] || '');
      var m = txt.match(/https:\/\/neuri\.tech\/\S+/);
      return m ? m[0].replace('src=demo-wa', 'src=demo-qr') : '';
    } catch (e) { return ''; }
  }
  var last = null;
  function close() {
    var d = document.getElementById('nb-qr');
    if (d) d.remove();
    if (last) { try { last.focus(); } catch (e) {} }
  }
  function open(btn) {
    var url = demoUrl();
    if (!url || typeof qrcode !== 'function') return;
    last = btn;
    close();
    var q = qrcode(0, 'M'); q.addData(url); q.make();
    var d = document.createElement('div');
    d.id = 'nb-qr'; d.setAttribute('data-url', url); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'nb-qr-t');
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(5,8,13,.82);display:flex;align-items:center;justify-content:center;padding:16px';
    d.innerHTML = '<div style="background:#fff;color:#05080D;border-radius:20px;padding:24px;max-width:340px;width:100%;text-align:center;font-family:inherit">'
      + '<h3 id="nb-qr-t" style="margin:0 0 6px;font-size:20px">' + T.title + '</h3>'
      + '<p style="margin:0 0 14px;font-size:15px;color:#33413A">' + T.sub + '</p>'
      + '<div data-qr style="width:240px;max-width:100%;margin:0 auto">' + q.createSvgTag({ cellSize: 6, margin: 2, scalable: true, alt: T.title }) + '</div>'
      + '<button type="button" data-close style="margin-top:16px;min-height:44px;padding:0 22px;border-radius:999px;border:0;background:#05080D;color:#fff;font:inherit;font-weight:700;cursor:pointer">' + T.close + '</button></div>';
    d.addEventListener('click', function (e) { if (e.target === d || e.target.hasAttribute('data-close')) close(); });
    document.body.appendChild(d);
    d.querySelector('[data-close]').focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-a212]');
    if (b) { e.preventDefault(); open(b); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.getElementById('nb-qr')) close(); });
})();
