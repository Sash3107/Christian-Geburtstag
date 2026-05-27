# 🏔️ Christians 60. Geburtstag – Aprés-Ski Einladungs-Website

Eine hochgradig visuelle, ansprechende und responsive Einladungs- und RSVP-Website für Christians 60. Geburtstag am 13.12.2026 (die Feier findet am **12.12.2026** statt). Das Design ist vollständig an das Motto **Aprés-Ski & Hüttengaudi** angepasst – inklusive interaktivem Schneefall, Countdown, Zusage-System und einer passwortgeschützten Admin-Zentrale.

---

## 🛠️ Funktionen im Überblick

* **Aprés-Ski Design:** Gemütlicher Hütten-Look mit Holzschild-Titel, warmen Lichteffekten (Glassmorphismus), Skifahrer-Details und einem Canvas-basierten interaktiven Schneefall (Schneeflocken reagieren auf Mausbewegung!).
* **Live-Countdown:** Präziser Zähler, der die Tage, Stunden, Minuten und Sekunden bis zum Pistenstart am **12.12.2026 um 18:00 Uhr** anzeigt.
* **Intelligentes RSVP-Formular:**
  * Eingabe des Gästenamens.
  * Dynamische Zu- oder Absage-Buttons ("Bin am Start! 🎿" / "Kann leider nicht... ❄️").
  * Nachricht / Grußtext an Christian.
* **Passwortgeschützte Admin-Zentrale:**
  * Erreichbar über ein dezentes Schloss-Icon im Footer.
  * Passwort: **`Christian`** (Sichtbarkeit per Auge-Icon umschaltbar).
  * **Echtzeit-Statistiken:** Gesamtzahl der Antworten, Anzahl Zusagen, Anzahl Absagen.
  * **Interaktive Gästeliste:** Suchfunktion nach Namen/Nachrichten, Filterung nach Status (Zu-/Absage) und Löschung einzelner Einträge.
  * **Excel-Export:** Lädt die gesamte Gästeliste mit einem Klick als perfekt formatierte, deutsche Excel-kompatible CSV-Datei herunter (Semicolon-separiert und UTF-8 mit BOM, damit Umlaute wie ä, ö, ü in Microsoft Excel sofort fehlerfrei angezeigt werden).
  * **Testdaten-Generator:** Ermöglicht es, mit einem Klick 5 vorgefertigte Aprés-Ski-Gäste zu Testzwecken in das Dashboard zu laden, um alles sofort ausprobieren zu können.
  * **Google Sheets Live-Integration:** Anleitung und Konfiguration zur Verknüpfung mit einer kostenlosen, unlimitierten Google-Tabelle als Datenbank.

---

## 💻 Lokale Vorschau starten

Die Website benötigt keinerlei Installationen oder Server-Frameworks. Du kannst sie direkt lokal starten:
1. Öffne den Ordner `Christians Einladung` auf deinem Computer.
2. Doppelklicke auf die Datei [index.html](file:///c:/Users/V3cur3n/BeeStation/Privat/Christians%20Einladung/index.html), um die Seite direkt in deinem Browser zu öffnen.
3. Zum Testen des Admin-Bereichs: Klicke im Footer ganz unten auf **Lock Admin**, gib das Passwort **`Christian`** ein und klicke auf **Testdaten laden**, um die Liste sofort mit Beispiel-Gästen zu füllen!

---

## 🚀 Live-Schaltung über GitHub Pages (Kostenlos)

Um die Website für deine Gäste über einen Link erreichbar zu machen, kannst du sie in unter 1 Minute kostenlos über **GitHub Pages** hosten:

1. Logge dich in deinen GitHub-Account ein (oder erstelle kostenlos einen auf github.com).
2. Erstelle ein neues Repository (z.B. mit dem Namen `christians-60-geburtstag`).
3. Lade die drei Dateien (`index.html`, `style.css`, `app.js`) in dieses Repository hoch.
4. Gehe im Repository auf **Settings** (Einstellungen) -> **Pages** (linke Menüleiste).
5. Wähle unter *Build and deployment* -> *Source* die Option **Deploy from a branch**.
6. Wähle als Branch **main** (oder `master`) und den Ordner `/ (root)` aus und klicke auf **Save** (Speichern).
7. Nach etwa 1-2 Minuten wird dir oben auf der Seite dein persönlicher Live-Link angezeigt (z.B. `https://deinname.github.io/christians-60-geburtstag/`). Diesen Link kannst du an die Gäste verschicken!

---

## 📊 Google Sheets Datenbank verknüpfen (Option für echten Betrieb)

Standardmäßig speichert die Website alle RSVPs lokal in deinem Browser. Für den Live-Betrieb mit echten Gästen kannst du in 2 Minuten eine **kostenlose Live-Datenbank in Google Sheets** einrichten. Dadurch landen alle Gästedaten sofort in einer Excel-Tabelle in deinem Google Drive und werden live im Admin-Dashboard der Website angezeigt!

### Schritt-für-Schritt-Anleitung:

1. Öffne dein Google Drive und erstelle ein neues **Google Sheet (Google Tabelle)**.
2. Benenne das erste Tabellenblatt unten links von "Tabellenblatt1" in **`Gästeliste`** um (Groß-/Kleinschreibung beachten!).
3. Schreibe in die erste Zeile (A1 bis D1) folgende Spaltenköpfe als Tabellenkopf:
   `Zeitstempel` | `Name` | `Status` | `Nachricht`
4. Klicke im Menü oben auf **Erweiterungen** -> **Apps Script**.
5. Lösche den dortigen Platzhaltercode und füge folgendes Skript ein:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Gästeliste");
  var params = JSON.parse(e.postData.contents);
  
  var timestamp = new Date();
  var name = params.name;
  var status = params.status;
  var message = params.message || "";
  
  sheet.appendRow([timestamp, name, status, message]);
  
  return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Gästeliste");
  var data = sheet.getDataRange().getValues();
  var result = [];
  
  for (var i = 1; i < data.length; i++) {
    result.push({
      timestamp: data[i][0],
      name: data[i][1],
      status: data[i][2],
      message: data[i][3]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```

6. Klicke oben auf das **Speichern-Symbol** (Diskette).
7. Klicke rechts oben auf den blauen Button **Bereitstellen** -> **Neue Bereitstellung**.
8. Klicke auf das Zahnrad-Symbol neben "Typ auswählen" und wähle **Web-App** aus.
9. Nimm folgende Konfigurationen vor:
   * *Beschreibung:* `Christian Party RSVP`
   * *Ausführen als:* `Ich (deine-email@gmail.com)`
   * *Wer hat Zugriff:* **`Jeder`** (Sehr wichtig, damit Gäste ihre Zusage eintragen können!)
10. Klicke auf **Bereitstellen**. Google fragt nach Autorisierung – klicke auf "Zugriff gewähren", wähle dein Google-Konto aus und klicke ggf. auf "Erweitert" -> "Unsicher/Christian Party RSVP (fortfahren)".
11. Kopiere die generierte **Web-App-URL** (endet meist auf `/exec`).
12. Öffne das Admin-Dashboard auf deiner Website (Passwort: `Christian`), füge die kopierte URL in das Feld unter **Live-Speicherung (Google Sheets)** ein und klicke auf **Speichern**.

Ab sofort synchronisiert sich das Admin-Dashboard live mit der Google Tabelle. Du kannst Gästeeinträge entweder direkt in deiner Google Tabelle verwalten oder auf der Website live ansehen!

---

## Viel Spaß beim Feiern von Christians 60. Geburtstag! 🎿❄️🔥
