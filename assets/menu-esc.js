// Menús del encabezado hechos con <details>: «Entrar» (data-entrar), idioma (data-idioma) y,
// en la landing de bazar en el celular, el menú general (data-menu, 574).
var MENUS = 'details[data-entrar], details[data-idioma], details[data-menu]';
var ABIERTOS = 'details[data-entrar][open], details[data-idioma][open], details[data-menu][open]';
// T43: Escape cierra el menú abierto y regresa el foco a su botón.
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  document.querySelectorAll(ABIERTOS).forEach(function (d) {
    d.open = false;
    var s = d.querySelector('summary');
    if (s && d.contains(document.activeElement)) s.focus();
  });
});
// QA #71: abrir un menú (Entrar, idioma o el menú) cierra el otro, para que no se encimen.
// 574: el botón que lleva aria-expanded lo refleja al abrir y cerrar.
document.addEventListener('toggle', function (e) {
  var d = e.target;
  if (!d || !d.matches || !d.matches(MENUS)) return;
  var s = d.querySelector('summary[aria-expanded]');
  if (s) s.setAttribute('aria-expanded', d.open ? 'true' : 'false');
  if (!d.open) return;
  document.querySelectorAll(ABIERTOS).forEach(function (o) {
    if (o !== d) o.open = false;
  });
}, true);
// QA #71 (reabierto): al tocar el botón de un menú cerrado, cerrar el otro en ese mismo momento
// (el evento «toggle» llega después y alguien que revisa justo al tocar veía los dos abiertos).
document.addEventListener('click', function (e) {
  var t = e.target && e.target.closest ? e.target : null;
  if (!t) return;
  var s = t.closest('details[data-entrar] > summary, details[data-idioma] > summary, details[data-menu] > summary');
  if (s) {
    var d = s.parentElement;
    if (d.open) return;
    document.querySelectorAll(ABIERTOS).forEach(function (o) {
      if (o !== d) o.open = false;
    });
    return;
  }
  // 574: el menú general se cierra al elegir una liga o al tocar fuera de él.
  document.querySelectorAll('details[data-menu][open]').forEach(function (m) {
    if (!m.contains(t) || t.closest('a')) m.open = false;
  });
}, true);
