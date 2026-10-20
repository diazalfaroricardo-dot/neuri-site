// T43: Escape cierra el menú «Entrar»/idioma abierto (<details>) y regresa el foco a su botón.
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('details[data-entrar][open], details[data-idioma][open]').forEach(function (d) {
    d.open = false;
    var s = d.querySelector('summary');
    if (s && d.contains(document.activeElement)) s.focus();
  });
});
