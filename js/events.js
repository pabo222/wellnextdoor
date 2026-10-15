// Live-Termine: abgelaufene Einträge automatisch entfernen + Wochentag ergänzen.
// Regel: Ein Termin verschwindet, sobald er um REMOVE_AFTER_DAYS Tag(e) abgelaufen
// ist – gemessen ab Mitternacht des Termintags. 1 = am Tag nach dem Termin.
document.addEventListener('DOMContentLoaded', function () {
  var REMOVE_AFTER_DAYS = 1;
  var now = Date.now();

  // Mitternacht (lokal) des Termintags + REMOVE_AFTER_DAYS = Entfernungszeitpunkt
  var cutoffOf = function (iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    var c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    c.setDate(c.getDate() + REMOVE_AFTER_DAYS);
    return c.getTime();
  };

  var isExpired = function (iso) {
    var c = cutoffOf(iso);
    return c !== null && now >= c;
  };

  var weekday = function (iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    try {
      return new Intl.DateTimeFormat('de-DE', { weekday: 'short', timeZone: 'Europe/Berlin' })
        .format(d).replace('.', '');
    } catch (e) { return ''; }
  };

  // 1) Sichtbare Termin-Zeilen: abgelaufene entfernen, sonst Wochentag setzen
  var remaining = 0;
  document.querySelectorAll('.event-row[data-datetime]').forEach(function (row) {
    var iso = row.getAttribute('data-datetime');
    if (isExpired(iso)) {
      row.remove();
      return;
    }
    remaining++;
    var dow = row.querySelector('.dt-dow');
    if (dow && !dow.textContent) {
      var w = weekday(iso);
      if (w) dow.textContent = w + ' · ';
    }
  });

  // 2) Keine kommenden Termine -> Hinweis zeigen, Überschrift ausblenden
  if (remaining === 0) {
    var empty = document.querySelector('.events-empty');
    if (empty) empty.hidden = false;
    document.querySelectorAll('.events-wrap .group-label').forEach(function (el) {
      el.hidden = true;
    });
  }

  // 3) Strukturierte Daten (JSON-LD) synchron halten: abgelaufene Events entfernen
  document.querySelectorAll('script[type="application/ld+json"]').forEach(function (s) {
    var data;
    try { data = JSON.parse(s.textContent); } catch (e) { return; }
    if (!Array.isArray(data)) return;
    var kept = data.filter(function (ev) {
      if (!ev || !ev.startDate) return true;
      return !isExpired(ev.startDate);
    });
    if (kept.length !== data.length) {
      s.textContent = JSON.stringify(kept, null, 2);
    }
  });
});
