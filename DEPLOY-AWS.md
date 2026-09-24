# Well Next Door – Hosting auf AWS (S3 + CloudFront)

Anleitung für das Hosten dieser statischen Website auf AWS über die
**AWS Management Console** (alles per Klick im Browser).

Architektur:

```
Besucher  →  CloudFront (CDN + HTTPS)  →  S3-Bucket (private, deine Dateien)
                     ↑
              Route 53 (DNS)  ←  Nameserver deiner .de-Domain
```

Das Video bleibt bei **Bunny.net** (Stream im iframe) – hat mit AWS nichts zu tun.

---

## 0. Voraussetzungen / was du brauchst

- Eine Kreditkarte (für die AWS-Konto-Verifizierung; es wird eine
  Mini-Testbuchung ~1 € gemacht und wieder erstattet).
- Handynummer (SMS-Verifizierung).
- Zugriff auf die Domain-Verwaltung deiner `.de`-Domain (Registrar-Login).

> **Wichtig:** Die Domain ist aktuell mit **Webflow** verbunden. `.de`-Domains
> kann man bei Webflow nicht *registrieren* – sie liegt also bei einem echten
> Registrar (z. B. IONOS, Strato, united-domains …) und ist nur zu Webflow
> „verbunden". Wo genau, findest du so heraus:
> - **Webflow** → Site → *Settings* → *Publishing* → dort siehst du die Domain
>   und wie sie verbunden ist.
> - Oder WHOIS-Abfrage: <https://www.denic.de/webwhois/> → Domain eingeben →
>   Feld „Registrar / Provider".

---

## 1. AWS-Konto erstellen

1. <https://aws.amazon.com/> → **Create an AWS Account**.
2. E-Mail + Kontoname (z. B. „Well Next Door") → E-Mail-Code bestätigen.
3. Root-Passwort vergeben.
4. Kontotyp **Personal** → Adresse/Telefon.
5. Kreditkarte hinterlegen (Verifizierungsbuchung, wird erstattet).
6. Identitätsprüfung per SMS/Anruf.
7. Support-Plan: **Basic (Free)** wählen.
8. Fertig → **Sign in to the Console**.

> Tipp: Aktiviere später unter *Account → Security credentials* die
> **MFA (2-Faktor)** für den Root-Login. Für den Alltag legt man normalerweise
> einen IAM-User an – für dieses kleine Projekt reicht der Root-Login zunächst.

---

## 2. S3-Bucket anlegen (dein Datei-Speicher)

1. Oben in der Konsole Region auf **Europe (Frankfurt) `eu-central-1`** stellen.
2. Dienst **S3** öffnen → **Create bucket**.
3. **Bucket name**: z. B. `wellnextdoor-website` (global eindeutig, Kleinbuchstaben).
4. **Region**: Europe (Frankfurt) `eu-central-1`.
5. **Block Public Access**: **alles angehakt lassen** (Bucket bleibt privat –
   der Zugriff läuft ausschließlich über CloudFront). ✅
6. Rest auf Standard → **Create bucket**.

### Dateien hochladen

1. Bucket öffnen → **Upload**.
2. **Add files**: `index.html`, `live.html`, `privacy-policy.html`,
   `terms-of-use.html`
3. **Add folder**: `css/`, `js/`, `assets/`
4. **Upload**. (S3 setzt die Content-Types wie `text/html`, `image/png`
   automatisch anhand der Dateiendung.)

Die Ordnerstruktur im Bucket muss danach so aussehen:

```
index.html
live.html
privacy-policy.html
terms-of-use.html
css/style.css
js/menu.js
assets/…png
```

---

## 3. SSL-Zertifikat anfordern (ACM) — ⚠️ Region us-east-1!

CloudFront akzeptiert Zertifikate **nur aus der Region N. Virginia**.

1. Region oben rechts auf **US East (N. Virginia) `us-east-1`** umstellen.
2. Dienst **Certificate Manager (ACM)** → **Request certificate** →
   *Request a public certificate*.
3. **Domain names** hinzufügen:
   - `wellnextdoor.de`
   - `www.wellnextdoor.de`
4. **Validation method: DNS validation** → **Request**.
5. Das Zertifikat steht auf *Pending validation*. ACM zeigt pro Domain einen
   **CNAME-Record** an (Name + Wert). Diese trägst du in **Schritt 5 (DNS)** ein.
   Sobald DNS aktiv ist, springt das Zertifikat automatisch auf *Issued*.

> Lass diesen Tab offen – die CNAME-Werte brauchst du gleich.

---

## 4. CloudFront-Distribution erstellen (das CDN + HTTPS)

1. Dienst **CloudFront** → **Create distribution**.
2. **Origin domain**: deinen S3-Bucket aus der Liste wählen
   (`wellnextdoor-website.s3.eu-central-1.amazonaws.com`).
3. **Origin access**: **Origin access control settings (recommended)** →
   **Create new OAC** → übernehmen.
   - CloudFront zeigt danach einen Hinweis „You must update the bucket policy".
     Dazu gleich unten mehr (Schritt 4a).
4. **Viewer protocol policy**: **Redirect HTTP to HTTPS**.
5. **Alternate domain names (CNAME)** → hinzufügen:
   - `wellnextdoor.de`
   - `www.wellnextdoor.de`
6. **Custom SSL certificate**: dein ACM-Zertifikat auswählen
   (erscheint hier, weil es in us-east-1 liegt).
7. **Default root object**: `index.html`
8. **Create distribution**. (Ausrollen dauert 5–15 Min → Status *Enabled*.)
9. Notiere dir den **Distribution domain name**, z. B.
   `d123abcd.cloudfront.net`.

### 4a. Bucket-Policy für OAC setzen

Nach dem Erstellen bietet CloudFront einen Button **„Copy policy"** an
(oder Distribution → *Origins* → *Edit* → Copy policy).

1. Policy kopieren.
2. Zu **S3 → dein Bucket → Permissions → Bucket policy → Edit** → einfügen →
   **Save**. (Erlaubt ausschließlich dieser CloudFront-Distribution den
   Lesezugriff.)

**Test:** Öffne `https://d123abcd.cloudfront.net` – die Seite sollte inkl.
Video und Icons erscheinen. Wenn ja, funktioniert alles außer der Domain.

---

## 5. DNS umstellen (Domain von Webflow → auf AWS zeigen)

Ziel: `wellnextdoor.de` und `www` sollen auf CloudFront zeigen statt auf Webflow.
Empfohlener Weg: **DNS zu Route 53 umziehen** (weil nur damit die *nackte*
Domain `wellnextdoor.de` sauber per ALIAS auf CloudFront zeigen kann).

### 5a. Hosted Zone in Route 53 anlegen

1. Dienst **Route 53** → **Hosted zones** → **Create hosted zone**.
2. **Domain name**: `wellnextdoor.de` → Type **Public** → **Create**.
3. Route 53 erzeugt 4 **NS-Records** (Nameserver), z. B.
   `ns-123.awsdns-45.com` … → diese 4 Werte notieren.

### 5b. Nameserver beim Registrar umstellen

1. Beim **Registrar** deiner .de-Domain einloggen (den du in Schritt 0 ermittelt
   hast) und dort die **Verbindung zu Webflow lösen** bzw. die Nameserver ändern.
2. Die 4 Route-53-Nameserver aus 5a als neue Nameserver eintragen.
   → Die Verwaltung des DNS liegt ab jetzt bei AWS.
   (Verbreitung kann bis zu 24–48 h dauern, meist deutlich schneller.)

> Falls dein Registrar keinen Nameserver-Wechsel erlaubt/erwünscht ist, geht auch:
> DNS beim Registrar lassen und dort Records setzen – nur unterstützt nicht jeder
> Registrar ALIAS/ANAME an der nackten Domain. Route 53 ist der problemloseste Weg.

### 5c. Records in Route 53 anlegen

In der Hosted Zone → **Create record**:

1. **ACM-Validierung** (aus Schritt 3): den/die **CNAME**-Records eintragen
   (Name + Wert aus dem ACM-Tab). → ACM-Zertifikat wird *Issued*.
2. **Nackte Domain → CloudFront**:
   - Record name: *(leer)*
   - Type: **A**
   - **Alias: Yes** → *Route traffic to* → **Alias to CloudFront distribution**
     → deine Distribution wählen.
3. **www → CloudFront**:
   - Record name: `www`
   - Type: **A** → **Alias to CloudFront distribution** → gleiche Distribution.
   *(Optional zusätzlich denselben Alias als Type **AAAA** für IPv6.)*

---

## 6. Live testen

- <https://wellnextdoor.de> und <https://www.wellnextdoor.de> aufrufen.
- Auf **grünes Schloss (HTTPS)** achten.
- `http://…` sollte automatisch auf `https://…` umleiten.
- Unterseiten prüfen: `/live.html`, `/privacy-policy.html`, `/terms-of-use.html`.

---

## 7. Website später aktualisieren

Wenn du Dateien änderst:

1. Geänderte Datei(en) im **S3-Bucket** neu hochladen (überschreiben).
2. **CloudFront-Cache leeren**, damit die neue Version sofort ausgeliefert wird:
   CloudFront → Distribution → **Invalidations** → **Create invalidation** →
   Pfad `/*` → **Create**.
   (Die ersten 1.000 Invalidierungspfade pro Monat sind kostenlos.)

---

## 8. Kosten (realistisch, kleine Band-Seite)

| Posten | ~Kosten / Jahr |
|---|---|
| S3 Speicher + Requests | ~0,05 $ |
| CloudFront Traffic | 0 $ (unter 1 TB/Monat Free-Tier) |
| ACM SSL | 0 $ |
| Route 53 Hosted Zone | **6,00 $** (0,50 $/Monat) |
| **AWS gesamt** | **≈ 6 $/Jahr** |
| .de-Domain-Verlängerung (Registrar) | ~10–15 €/Jahr |
| Bunny.net Video-Stream | wenige €/Jahr (separat) |

## 9. Nicht vergessen: Webflow-Hosting kündigen 💸

Sobald AWS live ist und alles läuft: den **kostenpflichtigen Webflow-Site-Plan
kündigen** (oft ~14 $/Monat). Das ist der größte Spar-Effekt beim Umzug.
Die Domain-Registrierung selbst NICHT kündigen – nur das Webflow-Hosting.
