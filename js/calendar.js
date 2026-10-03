// Erzeugt beim Klick auf einen "Kalender"-Button eine .ics-Datei
// (kompatibel mit Apple Kalender, Google Kalender, Outlook).
document.addEventListener('DOMContentLoaded', function () {
  var pad = function (n) { return String(n).padStart(2, '0'); };

  var utcStamp = function (d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
      'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  };

  var esc = function (s) {
    return (s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  };

  var buildIcs = function (d) {
    var uid = d.start + '-' + Math.random().toString(36).slice(2) + '@wellnextdoor.de';
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Well Next Door//Live//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Berlin',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'TZNAME:CEST',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'TZNAME:CET',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + utcStamp(new Date()),
      'DTSTART;TZID=Europe/Berlin:' + d.start,
      'DTEND;TZID=Europe/Berlin:' + d.end,
      'SUMMARY:' + esc('Well Next Door – ' + d.title)
    ];
    if (d.location) lines.push('LOCATION:' + esc(d.location));
    lines.push('DESCRIPTION:' + esc('Live-Konzert von Well Next Door'));
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  };

  document.querySelectorAll('.cal-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ics = buildIcs(btn.dataset);
      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'well-next-door-' + (btn.dataset.start || '').slice(0, 8) + '.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    });
  });
});
