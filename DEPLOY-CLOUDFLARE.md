# Well Next Door – Hosting auf Cloudflare Pages (kostenlos)

Anleitung zum Veröffentlichen dieser statischen Website über **Cloudflare Pages**.
Kostenlos, mit weltweitem CDN, HTTPS und unbegrenztem Traffic.

Architektur:

```
Besucher  →  Cloudflare Pages (CDN + HTTPS + deine Dateien)
                     ↑
              Cloudflare DNS  ←  Nameserver deiner .de-Domain
```

Das Video bleibt bei **Bunny.net** (Stream im iframe) – unabhängig vom Hosting.

---

## 0. Was du brauchst

- Eine E-Mail-Adresse (für den kostenlosen Cloudflare-Account).
- Zugriff auf die Domain-Verwaltung deiner `.de`-Domain (Registrar-Login),
  um die Nameserver zu ändern.
- **Keine** Kreditkarte nötig.

> Die Domain ist aktuell mit **Webflow** verbunden. `.de` kann man bei Webflow
> nicht registrieren – sie liegt bei einem echten Registrar. Wo, findest du so:
> - Webflow → Site → *Settings* → *Publishing*, **oder**
> - WHOIS: <https://www.denic.de/webwhois/> → Domain eingeben → Feld „Registrar".

---

## 1. Cloudflare-Account erstellen

1. <https://dash.cloudflare.com/sign-up> → E-Mail + Passwort → **Sign up**.
2. E-Mail-Bestätigung anklicken. Fertig (kostenloser Plan).

---

## 2. Website zu Pages hochladen (live in ~2 Minuten)

Wir nutzen **Direct Upload** – kein Git, kein Terminal nötig.

1. Im Cloudflare-Dashboard links auf **Workers & Pages** → Tab **Pages**.
2. **Create application** → **Pages** → **Upload assets**.
3. **Projektname**: z. B. `well-next-door` → **Create project**.
4. Jetzt die Website-Dateien hochladen. Ziehe **genau diese** Elemente aus dem
   Projektordner ins Upload-Fenster (oder wähle sie per „Select files"):
   - `index.html`
   - `live.html`
   - `privacy-policy.html`
   - `terms-of-use.html`
   - Ordner `css`
   - Ordner `js`
   - Ordner `assets`

   > Die `DEPLOY-*.md`-Dateien **nicht** mit hochladen – sie sind nur Anleitungen.
   > Wichtig ist nur, dass `index.html` direkt oben (in der Wurzel) liegt.
5. **Deploy site**.
6. Nach dem Deploy bekommst du eine Live-URL wie
   `https://well-next-door.pages.dev` → **öffnen und testen**
   (Video, Icons, Unterseiten `/live.html` etc.).

✅ Ab hier ist die Seite bereits **öffentlich online** – nur noch nicht unter
deiner eigenen Domain. Das kommt in Schritt 3.

---

## 3. Eigene Domain verbinden (`wellnextdoor.de`)

Am einfachsten & saubersten: die Domain **komplett zu Cloudflare umziehen**
(DNS-Verwaltung bei Cloudflare). Dann funktioniert auch die nackte Domain
`wellnextdoor.de` problemlos.

### 3a. Domain zu Cloudflare hinzufügen

1. Dashboard → oben **Add a site** (bzw. **Websites** → *Add a site*).
2. `wellnextdoor.de` eingeben → **Continue**.
3. Plan **Free** wählen → **Continue**.
4. Cloudflare scannt die bestehenden DNS-Einträge und zeigt sie an.
   - Prüfe, ob wichtige Einträge dabei sind (v. a. **MX/E-Mail-Einträge**, falls
     du E-Mail über die Domain nutzt!). Fehlende später ergänzen.
5. Cloudflare zeigt dir **2 Nameserver** an, z. B.
   `xy.ns.cloudflare.com` und `zw.ns.cloudflare.com` → **notieren**.

### 3b. Nameserver beim Registrar umstellen

1. Beim **Registrar** deiner .de-Domain einloggen.
2. Die **Verbindung/Nameserver zu Webflow lösen** und stattdessen die
   **2 Cloudflare-Nameserver** aus 3a eintragen.
3. Speichern. Cloudflare prüft das automatisch; die Umstellung ist meist in
   wenigen Minuten bis paar Stunden aktiv (max. 24 h). Du bekommst eine
   Bestätigungs-E-Mail („Great news! Cloudflare is now protecting your site").

> Sobald hier fertig, verwaltet Cloudflare dein DNS – die Domain zeigt aber noch
> nirgends hin. Das verbinden wir jetzt mit dem Pages-Projekt.

### 3c. Domain im Pages-Projekt aktivieren

1. **Workers & Pages** → dein Projekt `well-next-door` → Tab **Custom domains**.
2. **Set up a custom domain** → `wellnextdoor.de` → **Continue** →
   **Activate domain**.
   - Cloudflare legt den passenden DNS-Eintrag automatisch an (weil DNS jetzt
     bei Cloudflare liegt).
3. Wiederholen für `www.wellnextdoor.de`.
   - Für `www` richtet Cloudflare automatisch die Weiterleitung/den Eintrag ein.

Das HTTPS-Zertifikat wird automatisch ausgestellt (kann ein paar Minuten dauern).

---

## 4. Live testen

- <https://wellnextdoor.de> und <https://www.wellnextdoor.de> aufrufen.
- **Grünes Schloss (HTTPS)** vorhanden?
- `http://…` leitet automatisch auf `https://…` um.
- Unterseiten prüfen: `/live.html`, `/privacy-policy.html`, `/terms-of-use.html`.

---

## 5. Website später aktualisieren

Wenn du Dateien änderst:

**Variante A – Dashboard (einfach):**
1. Projekt `well-next-door` → **Create deployment** (bzw. **Upload assets**).
2. Die geänderten Dateien / den Ordner erneut hochladen → **Deploy**.
   Cloudflare erstellt eine neue Version; die alte bleibt als Rollback erhalten.

**Variante B – Terminal (schneller, für Routine):**
```bash
cd "/Users/pascalboehm/Desktop/Well Next Door Website"
npx wrangler pages deploy . --project-name well-next-door
```
(Beim ersten Mal fragt Wrangler nach Login im Browser.)

> Cloudflare hat kein Caching-Problem wie bei manchen CDNs – neue Deployments
> sind sofort aktiv. Kein manuelles Cache-Leeren nötig.

---

## 6. Nicht vergessen: Webflow-Hosting kündigen 💸

Sobald `wellnextdoor.de` über Cloudflare läuft und alles passt:
den **kostenpflichtigen Webflow-Site-Plan kündigen** (spart oft ~14 $/Monat).
Die **Domain-Registrierung NICHT kündigen** – nur das Webflow-Hosting.

---

## 7. Kosten

| Posten | Kosten/Jahr |
|---|---|
| Cloudflare Pages (Hosting, CDN, SSL) | **0 €** |
| Cloudflare DNS | **0 €** |
| Traffic | **0 €** (unbegrenzt im Free-Plan) |
| .de-Domain-Verlängerung (Registrar) | ~10–15 € |
| Bunny.net Video-Stream | wenige €/Jahr (separat) |
| **Gesamt** | **~10–15 €/Jahr** (nur Domain + Video) |

---

## Alternative ohne Domain-Umzug

Wenn du die Domain **nicht** zu Cloudflare umziehen willst, kann man auch beim
aktuellen Registrar bleiben und dort einen CNAME auf `…pages.dev` setzen – aber
die *nackte* Domain `wellnextdoor.de` (ohne `www`) funktioniert dann nur, wenn
der Registrar „CNAME-Flattening/ALIAS" unterstützt. Der Cloudflare-Umzug (Kap. 3)
ist der zuverlässigste und einfachste Weg und kostet nichts.
