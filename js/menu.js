// Mobiles Navigationsmenü ein-/ausblenden
document.addEventListener('DOMContentLoaded', function () {
  var button = document.querySelector('.menu-button');
  var menu = document.querySelector('.nav-menu');
  if (!button || !menu) return;

  button.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Menü schließen, wenn ein Link angeklickt wird
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      menu.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    });
  });
});
