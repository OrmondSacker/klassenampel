# KlassenAmpel

Version 0.6.0, Stand 27. November 2026. Die bisherige Version 0.4 wurde in fünf zusammengehörige Arbeitsmodule und ein zentrales Menü überführt.

Die KlassenAmpel ist eine deutschsprachige Web-App für den Unterricht. Sie verbindet eine Mikrofon-Lautstärkeampel mit einer Spielrunde, gemeinsamem Fortschritt, Aufgabenfeld und unabhängigem Aufgaben-Countdown. Sie richtet sich an unterschiedliche Lerngruppen und soll auf Unterrichtsrechnern, interaktiven Tafeln sowie mobilen Geräten nutzbar sein.

## Übergabe lesen

- [AGENTS.md](AGENTS.md) enthält die verbindlichen Projektvorgaben und die Präferenzen des Nutzers.
- [PROJECT.md](PROJECT.md) beschreibt Entscheidungen, aktuelle Implementierung, Regeln, Datenhaltung und bekannte Grenzen.
- [ROADMAP.md](ROADMAP.md) unterscheidet verbindliche offene Anforderungen, technische Prüfaufgaben und unverbindliche Ideen.

Die Dokumentation basiert auf dem bisherigen Gespräch und den tatsächlich vorhandenen lokalen Dateien. Seit dem 27.11.2026 werden die freigegebenen Versionen auf GitHub Pages veröffentlicht. Die aktuelle Bestandsaufnahme steht am Anfang von PROJECT.md, die daraus abgeleitete Arbeitsreihenfolge am Anfang von ROADMAP.md.

## Sofort ausprobieren

Öffne die mitgelieferte [index.html](index.html) in einem aktuellen Browser. Die ausgelieferte App besteht aus dieser einen HTML-Datei. CSS, JavaScript und Grafikberechnung sind darin enthalten. Die App benötigt zur Laufzeit keine installierten Pakete und lädt selbst keine externen Medien oder Schriftdateien.

1. Öffne „Module & Einstellungen“. Wähle unter Darstellung eine Spielwelt.
2. Starte für einen ersten Test die Demo. Grün, Gelb und Rot lassen sich dort manuell setzen.
3. Starte zusätzlich eine Spielrunde, wenn Punkte und Rundenzeit laufen sollen.
4. Trage eine Aufgabe ein und stelle den separaten Aufgaben-Countdown ein. Start/Pause und ±1 Minute sind direkt erreichbar. Unter „Uhr einstellen“ gibt es Vorgaben für 2, 5, 10 und 15 Minuten sowie einen abschaltbaren Restzeitbalken. Die Vorgaben sind während des Laufens gesperrt; ±1 Minute erhält den laufenden oder pausierten Zustand.
5. Wähle im Menü die sichtbaren Arbeitsmodule. Aufgabe und Uhr stehen zunächst neben der Spielwelt; am Griff lassen sie sich auch in die Szene ziehen.

Die Arbeitsform erscheint bei der Aufgabe als Symbol mit Text. Unter „Module & Einstellungen → Anzeigen → Anzeigen im Detail“ kannst du sie ausblenden und den Zusatzauftrag „Fertig? Dann …“ einschalten. Der Zusatzauftrag ist innerhalb der Aufgabenbox aufklappbar und wird mitgespeichert.

In der Kopfzeile tauscht „Tafel im Mittelpunkt“ beziehungsweise „Spielwelt im Mittelpunkt“ beide Module direkt. Der Schalter bleibt beim Scrollen erreichbar und führt zur oberen Arbeitsfläche zurück. Runde, Mikrofon und Countdown werden dabei nicht pausiert.

Die Arbeitsform bei der Aufgabe lässt sich per Klick durch Stillarbeit, Partnerarbeit und Gruppenarbeit wechseln. Dabei werden dieselben Pegelprofile wie bei der bisherigen Auswahl unter Unterricht angewendet.

Die fünf Arbeitsmodule sind Spielwelt, Lautstärkeampel, Aufgabe, Countdown und Tafel. Punkte, Rundenrestzeit, Fortschritt, Weltaktion und Rundensteuerung bleiben fest im Spielmodul. Einstellungen besitzen keine eigenen Verschiebegriffe. Die Tafel lässt sich im Menü zuschalten.

„Module & Einstellungen“ enthält eine Mehrfachauswahl der Arbeitsmodule sowie Unterricht, Darstellung und Speichern/Teilen. Das Menü bleibt bei mehreren Auswahlklicks geöffnet. Änderungen an aufgeklappten Einstellungen verschieben die Arbeitsfläche nicht.

Arbeitsmodule lassen sich am Griff ⠿ bewegen und am Pfeil ↘ skalieren. Griffe erscheinen bei Auswahl, Hover oder Tastaturfokus und bleiben auf Touchgeräten sichtbar. „⋯“ öffnet die zentralen Eigenschaften für Akzentfarbe, Hintergrundtransparenz und Positionsfixierung. „Positionen zurücksetzen“ stellt die normale Anordnung wieder her.

„Automatisch anordnen“ verteilt ausschließlich ganze Gruppen in ein bis drei Spalten und passt sie bei Fenstergrößenänderung an. Innenmodule bleiben bei ihrem Elternmodul. Die Vorlagen „Spielwelt im Mittelpunkt“, „Aufgabe & Uhr“ und „Tafel im Mittelpunkt“ priorisieren die entsprechenden Arbeitsmodule. „Anordnung zurück“ nimmt Layoutänderungen zurück; eine Positionsfixierung schützt ein Modul vor Bewegung und automatischem Anordnen.

Magnetische Außenkanten halten zwölf Pixel Abstand. Oben/unten wird die Breite angeglichen; seitlich bleiben inhaltsgerechte Höhen erhalten. Alt unterdrückt das Einrasten. Aufgabe, Countdown und Tafel können bewusst vollständig in der Spielszene abgelegt werden; die Zielmarkierung zeigt das Einbetten an. Zufällige Überdeckung anderer Module erzeugt keine neue Gruppe.

Das eigenständige Modul „Tafel“ bietet Stift, Radierer, Textfelder direkt auf der Tafel und lokale Fotos. „Textfeld hinzufügen“ oder das Textfeldwerkzeug erzeugt ein bearbeitbares Feld auf der Zeichenfläche. Darin lässt sich mehrzeilig schreiben. Eigene Griffe verschieben und vergrößern die Felder. Ein separates Texteingabefeld oberhalb der Tafel gibt es nicht. „Verschieben“ wählt Bilder und Striche aus. „Auswahl löschen“ entfernt einzelne Objekte; Textfelder haben zusätzlich ein ×. Ein ausgewähltes Foto lässt sich mit „Fotogröße“ oder seiner unteren rechten Ecke proportional skalieren. „Transparenz“ wirkt auf das ausgewählte Tafelobjekt. Rückgängig stellt auch gelöschte Objekte wieder her.

Die Tafel bietet zusätzlich Schnellfarben, Textmarker und Kreide. Unter „Objekte & Text gestalten“ lassen sich auch verdeckte Objekte auswählen, nach vorne/hinten legen und nachträglich skalieren. Ausgewählter Text kann fett, kursiv, unterstrichen sowie links, mittig oder rechts ausgerichtet werden; Schriftart und Textgröße sind separat änderbar.

„PDF einfügen“ öffnet eine lokale PDF bis 20 MB mit Seitenauswahl. „Seite auf Tafel einfügen“ übernimmt die gewählte Seite als Bild; weitere Seiten können einzeln ergänzt werden. Die eingefügten Seiten sind verschiebbar, skalierbar und beschreibbar, ihr ursprünglicher PDF-Text wird nicht als bearbeitbarer Tafeltext übernommen. PDF-Verarbeitung und HTML-Export funktionieren ohne Upload und ohne externe Bibliotheksabrufe. PDF.js 6.5.438 samt Worker und Apache-2.0-Lizenz liegt in `vendor/pdfjs/` und wird beim Build in die Einzeldatei eingebettet. Daher ist die HTML jetzt ungefähr 2,7 MB groß. Für einen eigenen Build muss auch der vendor-Ordner vorhanden sein.

Anordnung, Größen und Tafelinhalt werden mit der Ansicht gespeichert und als HTML exportiert. Fotos werden lokal eingelesen, verkleinert und in der Ansicht eingebettet. Ansichtslinks können dadurch sehr lang werden. Für Ansichten mit Fotos ist die HTML-Datei der praktische Übertragungsweg.

Für echte Mikrofonmessung die App vorzugsweise über HTTPS oder localhost öffnen und die Browserberechtigung erteilen. Ob Mikrofonzugriff bei direkt geöffneten lokalen Dateien funktioniert, hängt vom Browser ab.

Die Lavalampe reagiert schon bei aktiver Messung oder Demo auf die Ampelfarbe. Eine gestartete Spielrunde ist dafür nicht erforderlich.

## Darstellungsmodi

| Modus | Inhalt |
| --- | --- |
| Aquarium | Riff, Fische, Korallen und weitere Freischaltungen |
| Städtebau | Stadt mit Bauhaus-inspirierter Architektur |
| Weltraum | Mondlandschaft, Planeten und Stationen |
| Fantasy | Bergtal, Burg, Fluss und magische Elemente |
| Natur | Waldlichtung, Bach, Tiere und Baumhaus |
| Neutral | Ruhige Ansicht; Hintergrundbewegung und Bildschirmschoner direkt bei ausgewähltem Neutral-Modus aktivierbar |
| Lavalampe | Klassische Raketenform mit fließender Lava in der aktuellen Ampelfarbe |

Unter „Darstellung → Spielwelt wählen → Grafikstil“ stehen „Verspielt“ und „Retro“ zur Auswahl. Verspielt behält die bisherige freundliche Gestaltung. Retro verwendet fünf unabhängig komponierte Pixelwelten: Unterwasserstation, nächtliche Hafenstadt, orbitales Dock, RPG-Weltkarte und Waldlichtung. Es wird keine verkleinerte oder verpixelte Kopie der verspielten Welt gezeichnet. Beide Stile nutzen dieselben Spielregeln und Freischaltungen. Neutral und Lavalampe behalten ihre eigene Darstellung.

Die Grafikwahl verändert keine Konsequenzen. Die beiden bisherigen Einstellungsprofile bleiben unter „Konsequenzen → Konsequenzprofil“ als Profil A/B erhalten und lassen sich unabhängig vom Stil wählen. Ältere gespeicherte Ansichten werden automatisch zugeordnet.

## Maßgebliches Repository

Der aktuelle Entwicklungsstand ist im lokalen Repository `work/klassenampel/` zusammengeführt. Alle folgenden Entwicklungsbefehle werden von dessen Wurzel ausgeführt. Die Dateien in `outputs/` des bisherigen Arbeitsverzeichnisses sind Auslieferungs- und Dokumentkopien.

| Pfad relativ zur Repository-Wurzel | Aufgabe |
| --- | --- |
| `src/page.html` | HTML-Struktur und Bedienelemente |
| `src/page.css` | Layout, Schrift, Modulansichten und Präsentationsmodi |
| `src/retro.js` | Eigenständige Retro-Kompositionen, Pixel-Sprites und Animationen |
| `src/worlds.js` | Weltkatalog und Canvas-Grafik einschließlich Lavalampe |
| `src/app.js` | Mikrofon, Ampel, Spielrunde, Punkte, Konsequenzen, Vorschau |
| `src/classroom.js` | Aufgabenmodul, Countdown, Signalton, Drag-and-drop, Export und Einstellungen |
| `src/modules.js` | Allgemeine Modulbedienung, Größenänderung und Export-Normalisierung |
| `src/whiteboard.js` | Tafelinhalt mit Freitext, Zeichnungen und lokalen Fotos |
| `scripts/build.cjs` | Erzeugt die eigenständige HTML-Datei an der Repository-Wurzel |
| `tests/browser-check.cjs` | Vorhandene lokale Edge-Prüfungen |
| `index.html` | Aktueller auslieferbarer Stand und Einstieg für GitHub Pages |
| `AGENTS.md` | Projektanweisungen für Codex an der Repository-Wurzel |
| `.gitignore` | Schließt erzeugte Browserprofile, Testbilder und Test-HTML aus |
| `.gitattributes` | Sichert LF-Zeilenenden für einen reproduzierbaren Einzeldatei-Build |

Die alten Quellen direkt in `work/` des bisherigen Arbeitsverzeichnisses bleiben als Vergleichsstand erhalten. Sie werden ab der Zusammenführung nicht weiter als Entwicklungsquelle verwendet. Das Repository enthält nur die tatsächlich benötigten Quell-, Build-, Prüf- und Dokumentdateien. Erzeugte Browserdaten werden ignoriert.

## Bauen

Von der Repository-Wurzel aus mit Node.js ausführen.

```powershell
node scripts/build.cjs
```

Das Skript liest HTML und CSS ein und fügt die JavaScript-Dateien in dieser Reihenfolge zusammen.

1. `retro.js`
2. `worlds.js`
3. `app.js`
4. `classroom.js`
5. `modules.js`
6. `whiteboard.js`

Die Ausgabe wird nach `index.html` an der Repository-Wurzel geschrieben. Der Build benötigt ausschließlich die Dateien im Repository.

Die Entwicklung wurde mit Node.js 24 auf Windows durchgeführt. Eine Mindestversion wurde bisher nicht definiert. Der Prüflauf benötigt unter anderem globale `fetch`- und `WebSocket`-Unterstützung.

## Prüfen

```powershell
node --check src/app.js
node --check src/classroom.js
node --check src/worlds.js
node --check src/modules.js
node --check src/whiteboard.js
node tests/browser-check.cjs
```

Die Browserprüfungen starten Edge im Hintergrund, einen lokalen HTTP-Server und ein temporäres Browserprofil. Der Edge-Pfad ist derzeit fest auf die Windows-Installation unter `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe` eingestellt.

Beispiel für den zuletzt ergänzten Countdown-Signalton.

```powershell
$env:ALARM_ONLY='1'
node tests/browser-check.cjs
Remove-Item Env:ALARM_ONLY
```

Weitere gezielte Modi sind `RETRO_ONLY`, `BOARD_PLUS_ONLY`, `TIME_TASK_ONLY`, `LIBRARY_ONLY`, `VERSION5_ONLY`, `DOCK_TEXT_ONLY`, `TEXT_INPUT_ONLY`, `MODULES_ONLY`, `LAVA_ONLY`, `SCREENSAVER_ONLY`, `PREVIEW_ONLY`, `WORLDS_ONLY`, `CITY_ONLY`, `BACKGROUND_ONLY` und `FONTS_ONLY`. Nur den gewünschten Schalter setzen und danach wieder entfernen. Das Skript beendet sich beim ersten zutreffenden Modus. Diese Schalter sind Teststeuerung und keine App-Konfiguration.

Der Gesamtlauf ohne Schalter ist historisch gewachsen. Am 26.11.2026 endete er einschließlich simuliertem Mikrofon mit Exitcode 0. Zusätzlich waren ALARM_ONLY, LAVA_ONLY, SCREENSAVER_ONLY, PREVIEW_ONLY, BACKGROUND_ONLY und FONTS_ONLY erfolgreich. Ein älterer Lauf war zuvor bei der simulierten Mikrofonfreigabe stehengeblieben. Die aktuellen Ergebnisse ersetzen keine Erprobung auf realer Unterrichtshardware.

Nach der Zusammenführung wurden der Gesamtlauf und alle acht Zusatzmodi einschließlich CITY_ONLY und WORLDS_ONLY auch aus dem neuen Repository-Aufbau erfolgreich geprüft. Bei gleichzeitigem Browserstart trat einmal ein zu früher Seitenzugriff im Lavalampe-Test auf. Der unveränderte Einzeltest war erfolgreich. Für die zuverlässigste Ausführung die Modi nacheinander starten.

## Ansicht auf anderen Geräten verwenden

Unter „Ansicht speichern und teilen“ stehen drei Wege bereit.

- Einen Namen eingeben und „Als neue Ansicht speichern“ wählen.
- Unter „Gespeicherte Ansichten“ eine Ansicht auswählen und mit „Ansicht öffnen“ direkt wieder aufrufen. Aufgabe, Tafel einschließlich Fotos, Layout, Einstellungen und Spielstand werden übernommen; Spielrunde und Countdown pausieren dabei. „Öffnen rückgängig“ bringt die vorherige Arbeitsfläche zurück.
- Unter „Gespeicherte Ansicht verwalten“ lassen sich Einträge umbenennen, ausdrücklich ersetzen oder löschen. Die bisherige einzelne Speicherung wird als „Bisher gespeicherte Ansicht“ übernommen.
- Die Sammlung liegt ausschließlich in diesem Browser auf diesem Gerät. Export und Ansichtslink enthalten jeweils die aktuelle Ansicht, nicht die gesamte Sammlung.
- „Ansicht als HTML exportieren“ erzeugt eine eigenständig nutzbare HTML-Datei mit Aufgabe, Layout, Einstellungen und Spielstand.
- „Online-Link erstellen“ erzeugt auf einer HTTP-/HTTPS-Seite einen Link mit der Einrichtung im URL-Fragment.

Der HTML-Export lässt sich auf ein anderes Gerät übertragen. Beim Öffnen werden Spielrunde und Aufgaben-Countdown pausiert übernommen. Der Online-Link enthält eine Momentaufnahme. Eine laufende geräteübergreifende Synchronisierung ist nicht implementiert.

## GitHub Pages aktualisieren

Das im Gespräch benannte Repository ist [OrmondSacker/klassenampel](https://github.com/OrmondSacker/klassenampel). Die vorgesehene Adresse ist [ormondsacker.github.io/klassenampel](https://ormondsacker.github.io/klassenampel/).

1. Den aktuellen Repository-Stand vor Änderungen lesen und mit der lokalen Auslieferung vergleichen.
2. Die HTML im Repository mit `node scripts/build.cjs` erzeugen. Sie liegt anschließend als `index.html` direkt im Veröffentlichungsordner.
3. Änderung committen und pushen.
4. Bei Veröffentlichung aus einem Branch unter Settings → Pages den vorgesehenen Branch und Ordner prüfen. Historisch wurden `main` und `/ (root)` verwendet.
5. Die Veröffentlichung unter Actions kontrollieren und danach die tatsächliche HTTPS-Seite prüfen.

Am 27.11.2026 wurde Version 0.5.0 mit Genehmigung des Nutzers auf main veröffentlicht. Der GitHub-Pages-Build war erfolgreich; die HTTPS-Seite liefert die geprüfte HTML bytegenau aus. Der Browser-Prüflauf VERSION5_ONLY war zusätzlich direkt auf der Live-Seite erfolgreich. Die offizielle [GitHub-Pages-Anleitung](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) beschreibt die Veröffentlichung aus einem Branch.

## Datenschutz und Einsatz im Unterricht

Die App berechnet den Pegel lokal im Browser. Der geprüfte Code enthält keine Tonaufzeichnung, Spracherkennung, Benutzerkonten oder Übertragung der Mikrofondaten. Aufgaben und Einstellungen werden lokal gespeichert und können in Exporten und Links enthalten sein.

Personenbezogene Aufgabentexte gehören deshalb nicht in öffentlich geteilte Ansichten. Für die konkrete schulische Zulässigkeit sind Bundesland, Schulvorgaben, Endgerät und Hosting zu prüfen. Eine schulische Datenschutzfreigabe wurde nicht dokumentiert. Weitere Einzelheiten stehen in [PROJECT.md](PROJECT.md).

Eine Lizenzentscheidung ist in der bisherigen Entwicklung nicht dokumentiert. Vor einer Weiterverbreitung oder Lizenzkennzeichnung den Repository-Stand und die Rechtefrage prüfen.
