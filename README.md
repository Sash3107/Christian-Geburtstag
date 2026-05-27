# 🏔️ Christians 60. Geburtstag – Aprés-Ski Einladungs-Website

Eine hochgradig visuelle, ansprechende und responsive Einladungs- und RSVP-Website für Christians 60. Geburtstag am 13.12.2026 (die Feier findet am **12.12.2026** statt). Das Design ist vollständig an das Motto **Aprés-Ski & Hüttengaudi** angepasst – inklusive sanftem interaktivem Schneefall, einem gläsernen Countdown, Zusage-System und einer passwortgeschützten Admin-Zentrale.

---

## 🛠️ Funktionen im Überblick

* **Aprés-Ski Design:** Moderner Look mit sauberer Überschrift, weichen Glassmorphismus-Rahmen, und einem Canvas-basierten interaktiven Schneefall (Flocken reagieren sanft auf Mausbewegungen!).
* **Live-Countdown:** Präziser Zähler, der die Tage, Stunden, Minuten und Sekunden bis zum Pistenstart am **12.12.2026 um 18:00 Uhr** anzeigt.
* **Intelligentes RSVP-Formular:**
  * Eingabe des Gästenamens.
  * Dynamische Zu- oder Absage-Buttons ("Bin am Start! 🎿" / "Kann leider nicht... ❄️").
  * Nachricht / Grußtext an Christian.
  * **Duplikatschutz:** Trägt sich ein Gast mit demselben Namen (Groß-/Kleinschreibung ignorierend) ein zweites Mal ein, wird kein neuer Eintrag erzeugt, sondern seine bestehende Zusage/Nachricht wird in der Liste aktualisiert.
* **Passwortgeschützte Admin-Zentrale:**
  * Erreichbar über ein dezentes Schloss-Icon im Footer.
  * Passwort: **`Christian`**
  * **Echtzeit-Statistiken:** Gesamtzahl der Antworten, Anzahl Zusagen, Anzahl Absagen.
  * **Interaktive Gästeliste:** Suchfunktion nach Namen/Nachrichten, Filterung nach Status (Zu-/Absage) und Löschung einzelner Einträge.
  * **Excel-Export:** Lädt die gesamte Gästeliste mit einem Klick als perfekt formatierte, deutsche Excel-kompatible CSV-Datei herunter (Semicolon-separiert und UTF-8 mit BOM, damit Umlaute wie ä, ö, ü in Microsoft Excel sofort fehlerfrei angezeigt werden).
  * **Testdaten-Generator:** Lädt mit einem Klick 5 Aprés-Ski-Gäste zu Testzwecken in das Dashboard.
  * **Google Sheets Live-Integration:** Anleitung und Konfiguration zur Verknüpfung mit einer kostenlosen Google-Tabelle als echte Live-Datenbank.

---

## 💻 Lokale Vorschau starten

Die Website benötigt keinerlei Installationen oder Server-Frameworks. Du kannst sie direkt lokal starten:
1. Öffne den Ordner `Christians Einladung` auf deinem Computer.
2. Doppelklicke auf die Datei [index.html](file:///c:/Users/V3cur3n/BeeStation/Privat/Christians%20Einladung/index.html), um die Seite direkt in deinem Browser zu öffnen.
3. Zum Testen des Admin-Bereichs: Klicke im Footer ganz unten auf das kleine Schloss-Symbol, gib das Passwort **`Christian`** ein und klicke auf **Testdaten laden**, um die Liste sofort mit Beispiel-Gästen zu füllen!

---

## 🚀 Live-Schaltung über GitHub Pages (Kostenlos)

Um die Website für deine Gäste über einen Link erreichbar zu machen, kannst du sie kostenlos über **GitHub Pages** hosten:

1. Logge dich in deinen GitHub-Account ein.
2. Gehe in dein Repository `Christian-Geburtstag`.
3. Lade die Dateien (`index.html`, `style.css`, `app.js`, `README.md`) in dieses Repository hoch.
4. Gehe im Repository auf **Settings** (Einstellungen) -> **Pages** (linke Menüleiste).
5. Wähle unter *Build and deployment* -> *Source* die Option **Deploy from a branch**.
6. Wähle als Branch **`Christians-Geburtstag`** und den Ordner `/ (root)` aus und klicke auf **Save** (Speichern).
7. Nach etwa 1-2 Minuten wird dir oben auf der Seite dein persönlicher Live-Link angezeigt.

---

## 📊 Google Sheets Datenbank verknüpfen (Für den echten Betrieb)

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
  var name = params.name.trim();
  var status = params.status;
  var message = params.message || "";
  
  var data = sheet.getDataRange().getValues();
  var foundRow = -1;
  
  // Suche nach bereits existierendem Gastnamen (Groß-/Kleinschreibung ignorieren)
  for (var i = 1; i < data.length; i++) {
    if (data[i][1].toString().toLowerCase().trim() === name.toLowerCase()) {
      foundRow = i + 1; // Zeilen-Index in Google Sheets ist 1-basiert
      break;
    }
  }
  
  if (foundRow > -1) {
    // Existierenden Eintrag überschreiben
    sheet.getRange(foundRow, 1).setValue(timestamp);
    sheet.getRange(foundRow, 2).setValue(name);
    sheet.getRange(foundRow, 3).setValue(status);
    sheet.getRange(foundRow, 4).setValue(message);
  } else {
    // Neuen Gast anlegen
    sheet.appendRow([timestamp, name, status, message]);
  }
  
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
8. Klicke auf das Zahnrad-Symbol und wähle **Web-App** aus.
9. Nimm folgende Konfigurationen vor:
   * *Beschreibung:* `Christian Party RSVP`
   * *Ausführen als:* `Ich (deine-email@gmail.com)`
   * *Wer hat Zugriff:* **`Jeder`** (Sehr wichtig!)
10. Klicke auf **Bereitstellen** und gewähre alle Berechtigungen.
11. Kopiere die generierte **Web-App-URL** (endet meist auf `/exec`).
12. Öffne die Datei [app.js](file:///c:/Users/V3cur3n/BeeStation/Privat/Christians%20Einladung/app.js) in deinem Code-Editor. Ganz oben findest du das Feld:
    ```javascript
    const GOOGLE_SHEET_URL = '';
    ```
    Füge dort deine kopierte URL ein (z. B. `const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycb.../exec';`) und speichere die Datei. Pushe diese Änderung auf dein GitHub-Repository. Fertig! Ab jetzt landen alle Einträge live, ohne Duplikate und von jedem Gerät direkt in deiner Tabelle.
