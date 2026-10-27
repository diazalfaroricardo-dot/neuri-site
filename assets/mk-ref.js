// MK160: el ?ref=<kit> con que llega el visitante (desde «Hecho con Neuri» o «Invita a otro negocio») viaja a los botones de alta de Marketing.
(function () {
  var r = new URLSearchParams(location.search).get("ref");
  if (!r || !/^[a-z0-9_-]{1,64}$/i.test(r)) return;
  r = r.toLowerCase();
  document.querySelectorAll('a[href*="marketing.neuri.tech/empezar"]').forEach(function (a) {
    try {
      var u = new URL(a.href);
      u.searchParams.set("ref", r);
      a.href = u.toString();
    } catch (e) {}
  });
})();
