// T43: Escape cierra el menú «Entrar»/idioma abierto (<details>) y regresa el foco a su botón.
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('details[data-entrar][open], details[data-idioma][open]').forEach(function (d) {
    d.open = false;
    var s = d.querySelector('summary');
    if (s && d.contains(document.activeElement)) s.focus();
  });
});
// QA #71: abrir un menú (Entrar o idioma) cierra el otro, para que no se encimen.
document.addEventListener('toggle', function (e) {
  var d = e.target;
  if (!d || !d.open || !d.matches || !d.matches('details[data-entrar], details[data-idioma]')) return;
  document.querySelectorAll('details[data-entrar][open], details[data-idioma][open]').forEach(function (o) {
    if (o !== d) o.open = false;
  });
}, true);
// QA #71 (reabierto): al tocar el botón de un menú cerrado, cerrar el otro en ese mismo momento
// (el evento «toggle» llega después y alguien que revisa justo al tocar veía los dos abiertos).
document.addEventListener('click', function (e) {
  var s = e.target && e.target.closest && e.target.closest('details[data-entrar] > summary, details[data-idioma] > summary');
  if (!s) return;
  var d = s.parentElement;
  if (d.open) return;
  document.querySelectorAll('details[data-entrar][open], details[data-idioma][open]').forEach(function (o) {
    if (o !== d) o.open = false;
  });
}, true);
