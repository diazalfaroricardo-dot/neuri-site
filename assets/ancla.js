/* qa #6: las secciones usan content-visibility:auto, así que su alto real aparece hasta que se ven y un salto
   a un ancla (#precios) se queda corto. Antes de saltar mostramos todas las secciones y alineamos al destino. */
(function () {
  var d = document.documentElement;
  function abrir() { if (!d.classList.contains("cv-todo")) { d.classList.add("cv-todo"); void d.offsetHeight; } }
  function ir(h, suave) {
    var t = h && h.length > 1 && document.getElementById(decodeURIComponent(h.slice(1)));
    if (!t) return false;
    abrir();
    t.scrollIntoView({ behavior: suave ? "smooth" : "instant", block: "start" });
    return true;
  }
  if (location.hash) {
    var fijar = function () { ir(location.hash, false); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fijar); else fijar();
    addEventListener("load", function () { setTimeout(fijar, 50); });
  }
  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var h = a.getAttribute("href");
    if (ir(h, !matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      e.preventDefault();
      if (history.pushState) history.pushState(null, "", h); else location.hash = h;
    }
  });
})();
