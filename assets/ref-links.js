// I5: el ?ref= con que llega el visitante (firma «Hecho con Neuri», afiliados) viaja en la URL al
// pasar a otra página de neuri.tech o a las apps. Sin cookies ni almacenamiento en este sitio
// (el aviso de privacidad lo promete); la cookie la pone la app al llegar. Se aplica al hacer clic
// porque varias páginas reescriben sus links de alta con JS (país, plan).
(function () {
  var r = new URLSearchParams(location.search).get("ref");
  if (!r || !/^[a-z0-9_-]{1,64}$/i.test(r)) return;
  r = r.toLowerCase();
  var HOSTS = /^(neuri\.tech|www\.neuri\.tech|bazar\.neuri\.tech|sd\.neuri\.tech|marketing\.neuri\.tech|consulting\.neuri\.tech)$/;
  function pone(e) {
    var a = e.target && e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    try {
      var u = new URL(a.href, location.href);
      if (!/^https?:$/.test(u.protocol) || !(HOSTS.test(u.hostname) || u.hostname === location.hostname) || u.searchParams.has("ref")) return;
      if (u.pathname === location.pathname && u.hostname === location.hostname && u.hash) return;
      // A mano: searchParams reescribiría «?signup» como «?signup=».
      u.search += (u.search ? "&" : "?") + "ref=" + r;
      a.href = u.toString();
    } catch (_) {}
  }
  document.addEventListener("click", pone, true);
  document.addEventListener("auxclick", pone, true);
})();
