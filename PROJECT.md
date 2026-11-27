# Projektstand und Entscheidungen

Stand ist der 27. November 2026. Grundlage sind der Gesprächsverlauf, die lokalen Quell- und Ausgabedateien und die unten dokumentierte erneute Bestandsaufnahme.

## Version 0.5.0 – aktuelle Implementierung

Veröffentlichung am 27.11.2026 vom Nutzer ausdrücklich genehmigt und erfolgreich durchgeführt: main wurde über die verbundene GitHub-Schnittstelle auf den exakt lokal getesteten Dateibaum aktualisiert. Der Pages-Build für Commit 9f3f3ee86e8cd8666a0ac38eb0ae10aac43ef21b war erfolgreich (Actions-Lauf 45964080959). https://ormondsacker.github.io/klassenampel/ antwortet mit HTTP 200 und dem Titel KlassenAmpel 0.5.0. Die ausgelieferte HTML stimmt bytegenau mit der getesteten Datei überein (Git-Blob 92e6e7060c75e64c501de71992c148cc6ee8255f). VERSION5_ONLY war direkt auf der Live-Seite erfolgreich. Der Nutzer meldete zuvor nach Durchführung des Praxistests keine aufgefallenen Probleme; konkrete Geräte- und Browserangaben wurden nicht genannt.

Nachtrag: Die Bildschirmschoner-Steuerung liegt innerhalb „Spielwelt wählen“ und erscheint ausschließlich bei ausgewähltem Neutral-Modus. Der separate Menüpunkt wurde entfernt. Start wechselt nicht mehr selbstständig aus einer anderen Welt zu Neutral. Der gezielte SCREENSAVER_ONLY-Lauf bestätigt die bedingte Anzeige, Animation, reduzierte Bewegung, Rückwege und HTML-Wiederherstellung.

Am 27.11.2026 auf Nutzerauftrag umgesetzt. Die Oberfläche trägt 0.5.0; der vollständige Ansichtssnapshot ergänzt appVersion. Die angekündigte Vorabbezeichnung 0.5.0-dev.1 wird nicht verwendet.

Es gibt fünf data-board-Gruppen: mainScreen (Spielwelt mit HUD, Fortschritt, Weltaktion und Rundensteuerung), microphone, task, countdown und whiteboard. Die bisher separat beweglichen Status- und Einstellungsbereiche sind feste Bestandteile der Spielgruppe beziehungsweise des zentralen Menüs. Keine Mikrofon-, Spiel-, Countdown-, Konsequenz- oder Weltlogik wurde entfernt.

Das breite Menü enthält Mehrfachauswahl, Unterricht, Darstellung und Speichern/Teilen. Öffnen und Aufklappen verändert die Position der Arbeitsmodule nicht. Tafel ist bei neuer Einrichtung ausgeschaltet und über die Auswahl zugänglich. Aufgabe und Uhr stehen zunächst außerhalb der Szene. Die Tafel besitzt weiterhin Texte, Stift/Radierer, lokale Fotos, Einzellöschen, Undo, unabhängige Fotoskalierung und Objekttransparenz. Texteigenschaften werden bei Auswahl sichtbar.

Die Anordnung packt ganze Gruppen in ein bis drei Spalten. Mindestmaße sichern Lesbarkeit; zu kleine Innenflächen begrenzen eingebettete Module. Seitliches Andocken richtet die Oberkante aus, ohne fremde Höhen zu erzwingen; oben/unten kann die Breite angeglichen werden. Aufgaben-, Countdown- und Tafelgruppen können bewusst in die markierte Spielszene gezogen werden. Andere Überdeckungen erzeugen keine Gruppenzugehörigkeit. Drei Vorlagen ändern die Priorität der Packung. Fixierte Gruppen werden ausgelassen, die übrigen Gruppen darunter angeordnet. Layoutänderungen haben einen eigenen Rückgängig-Verlauf von maximal 20 Schritten. Öffnen von Spielrundendetails vergrößert nicht automatisch die äußere Gruppe; bei begrenzter Höhe bleibt der Inhalt scrollbar.

moduleLayout verwendet Version 2 mit items, appearance, colors, locked, visible, preset und automatic. Version-1-Anordnungen aus 0.4 behalten die unterstützten fünf Modulpositionen; frühere einzelne HUD-, Status- und Einstellungspositionen entfallen zugunsten fester Gruppen. Spielstand, Steuerungswerte und Tafelobjekte bleiben über den bestehenden Ansichtssnapshot erhalten. Der alte Snapshot-Außenrahmen bleibt version:1. HTML-Export entfernt generierte Bedienelemente, setzt die Modulstruktur zurück und rekonstruiert anschließend die gespeicherte Version-2-Anordnung. Der Online-Link bleibt eine Momentaufnahme.

Die Browserprüfung VERSION5_ONLY deckt fünf Gruppen, Menüauswahl, stabile Arbeitsfläche beim Aufklappen, automatische Packung, fixierte Positionen, Akzentfarbe/Transparenz, Einbetten und Mitbewegen, Layout-Undo, HTML/Link, 0.4-Migration und die schmale Ansicht ab. Der bisherige Packtest für 18 unabhängige Teile wurde durch diesen fachlichen Gruppentest ersetzt. Am 27.11.2026 erfolgreich: VERSION5_ONLY, MODULES_ONLY (einschließlich lokalem Foto und simuliertem Touch), TEXT_INPUT_ONLY (echte Maus-/Tastatureingabe), DOCK_TEXT_ONLY, ALARM_ONLY und SCREENSAVER_ONLY. Der vollständige bestehende Edge-Lauf bestätigt zehn animierte Szenen, 360-Pixel-Ansicht, alte Spielstände, Timer, Demo, simuliertes Mikrofon mit Testton, Kalibrierung, Punkte, Konsequenzen und Reset. Reale Unterrichtsgeräte und Veröffentlichung sind weiterhin offen.

## Historie bis einschließlich 0.4

Die folgenden Bestandsaufnahmen und Zwischenstände beschreiben die Entwicklung vor 0.5.0. Bei Widersprüchen hat der aktuelle Abschnitt Vorrang.

## Bestandsaufnahme nach dem Wechsel zu Codex

### Adaptive Anordnung und einzelne Tafelobjekte

Implementiert am 26.11.2026: Magnetisches Andocken gleicht die gemeinsame Kantenlänge an (seitlich Höhe, oben/unten Breite) und führt diese bei Größenänderung nach. Der Fangbereich bleibt 18 Pixel, der Abstand 12 Pixel. Für das erstmalige Andocken werden Größenverhältnisse zwischen 1:2 und 2:1 berücksichtigt; Alt umgeht das Einrasten. Die frühere Ablösung allein wegen einer Größenabweichung ist damit ersetzt.

„Automatisch anordnen“ verteilt sichtbare Hauptmodule mit zwölf Pixel Abstand in ein bis drei Spalten. Es wählt den jeweils niedrigsten verfügbaren Spaltenbereich; Hauptscreen und Tafel dürfen zwei Spalten belegen. Innenmodule werden passend angeordnet. Dies ist eine heuristische Packung, keine mathematisch lückenlose Flächenoptimierung. Solange automatic aktiv ist, führen Fenstergrößenänderungen und aufklappende Einstellungen zu einer neuen Packung. Manuelles Verschieben, Skalieren oder Reset beendet dieses Nachordnen. Der Zustand wird mitgespeichert.

Vollständig eingebettete freie Module erhalten eine gespeicherte parent-Beziehung mit relativen Innenkoordinaten. Beim Bewegen und Skalieren des Elternmoduls folgen sie und werden auf dessen Fläche begrenzt. Native DOM-Kinder bewegen sich bereits mit. Beim Aufnehmen eines größeren Moduls werden geometrisch enthaltene freie Module übernommen; ein herausgezogenes Kind löst sich. Kinder bleiben über der Elternfläche bedienbar. Der Hauptscreen bleibt auf der Hintergrundebene.

Jedes Modul hat unter ◐ eine Hintergrundtransparenz. Tafelobjekte besitzen unabhängig davon eine eigene Transparenz. „Auswahl löschen“ löscht einzelne ausgewählte Fotos, Striche oder Texte; Textfelder haben zusätzlich ×. Fotos besitzen einen proportionalen Größenregler und einen Ziehpunkt unten rechts. Löschen und Skalieren sind rückgängig zu machen. Ältere Objekte ohne opacity werden vollständig deckend übernommen. parent, appearance und opacity werden lokal und im vollständigen Ansichtssnapshot gespeichert und exportiert.

LAYOUT_OBJECTS_ONLY prüft enthaltene Module, überlappungsfreie äußere Packung, automatisches Nachordnen bei schmaler Ansicht und geöffneten Einstellungen, Modultransparenz, unabhängige proportionale Fotoskalierung, Fototransparenz, Einzellöschen für alle Objektarten, Rückgängig, lokale Speicherung und HTML-/Link-Wiederherstellung. DOCK_TEXT_ONLY wurde auf die neue Größenanpassung aktualisiert. Die Sichtprüfung führte zusätzlich zur Innenanordnung auf schmalen Displays. Die Prüfungen verwenden lokalen Edge; reale Unterrichtsgeräte bleiben ungeprüft.

### Leere Flächen nach Modulbewegungen

Nach Rückmeldung zu einer leeren Fläche außerhalb der Module wurde die Platzhalterlogik korrigiert. Der frühere Platz eines bewegten oder skalierten Moduls reserviert keine sichtbare Höhe mehr. Es bleibt nur eine unsichtbare Rückkehrmarke für Reset und Export. Die normale Anordnung rückt nach. Die Texteingabe auf der Tafel wurde zusätzlich über echte Maus- und Tastaturereignisse geprüft.

### Magnetisches Andocken und direkte Tafel-Textfelder

Historischer erster Stand: Gleich große Module konnten an den Außenkanten eines Nachbarn andocken. Ein Fangbereich von 18 Pixeln und eine Größentoleranz von 12 Pixeln unterstützten die Bedienung. Zwischen den Modulen blieben 12 Pixel Abstand. Die gespeicherte Verbindung nannte Nachbar und Kante. Beim Verschieben wurde die Position nachgeführt, bei abweichender Größe die Verbindung gelöst. Diese Größenregel wurde durch die oben beschriebene adaptive Verbindung ersetzt.

Das Andocken ist eine Ergänzung zur freien Platzierung. Das bewusste Anordnen von Modulen über dem Hauptscreen bleibt verfügbar. Andockverbindungen werden im moduleLayout mitgespeichert und exportiert.

Tafeltext wird jetzt in echten, mehrzeiligen Textfeldern direkt auf der Zeichenfläche eingegeben. Ein Feld hat eigene Verschiebe- und Größengriffe. Der frühere Editor oberhalb der Tafel ist entfernt. Textgröße und Farbe werden über die Werkzeugleiste auf das ausgewählte Feld angewendet. Ältere Textobjekte werden beim Öffnen in Textfelder umgewandelt. Breite und Höhe gehören zum gespeicherten Textobjekt.

Beim HTML-Export wird die erzeugte Textfeld-Oberfläche entfernt und nach dem Öffnen aus den gespeicherten Textobjekten rekonstruiert. So entstehen keine doppelten Felder. Zeichnungen, Fotos und Rückgängig bleiben Teil der Tafel.

Der damalige DOCK_TEXT_ONLY bestätigte das äußere Einrasten, Nachführen und die Wiederherstellung aus HTML. Der aktuelle Test erwartet die automatische Größenanpassung. Direkte mehrzeilige Eingabe, Textfeldgröße und duplikatfreier Export wurden ebenfalls geprüft. MODULES_ONLY und der vollständige vorhandene Browserlauf waren erfolgreich.

### Korrektur des Tafelverständnisses am 26.11.2026

Der Nutzer hat die separate Tafelansicht ausdrücklich als Missverständnis korrigiert. Der Stand aus Commit cc6bf7f ist damit als Ansatz verworfen.

Aktuell haben alle 18 Module direkt in der normalen Oberfläche Verschiebe- und Größengriffe. Erst eine manuelle Bewegung oder Größenänderung löst ein Modul aus seinem normalen Layout. Frei platzierte Module können über dem Hauptscreen liegen. Ein separater Modusschalter ist entfernt.

Die Tafel ist ein eigenes Teilmodul für mehrzeiligen Freitext, Stiftzeichnungen, Radierer und lokal eingefügte Fotos. Text und Fotos lassen sich auf der Tafel verschieben. Text kann nach Auswahl bearbeitet werden. Rückgängig und Leeren sind vorhanden. Fotos werden im Browser auf höchstens 1280 Pixel Kantenlänge verkleinert und als JPEG eingebettet. Die Auswahl ist auf PNG/JPEG/WebP bis 12 MB ausgelegt.

src/modules.js ersetzt src/board.js. src/whiteboard.js verwaltet die Tafelobjekte. Die Speicherung verwendet klassenampel-modules und klassenampel-whiteboard sowie die Felder moduleLayout und whiteboard im vollständigen Ansichtssnapshot. Ältere exportierte board-Anordnungen werden beim Wiederherstellen als freie Modulpositionen übernommen.

Die Tafelobjekte werden lokal gespeichert und im HTML-Export eingebettet. Ein Ansichtslink kann die eingebetteten Fotos enthalten und dadurch sehr lang werden. Der Browser-Speicher kann bei mehreren großen Fotos sein Limit erreichen. Dann wird ein Hinweis zum HTML-Export angezeigt. Es gibt keinen Foto-Upload an einen Dienst.

Der korrigierte MODULES_ONLY-Prüflauf deckt allgemeine Verschiebe-/Größenbedienung, Tafeltext, Stiftzeichnung, lokales Foto, Objektbewegung, Leeren/Rückgängig, Speicherung und Wiederherstellung über HTML sowie Link ab. Der vollständige bestehende Browserlauf und der neutrale Bildschirmschoner wurden ebenfalls erfolgreich geprüft. Echte Schulhardware ist weiterhin ungeprüft.

Die folgenden Absätze dokumentieren den zuvor implementierten und anschließend verworfenen separaten Modus.

### Historischer Zwischenstand des separaten Tafelmodus

Ein neuer Tafelmodus stellt eine freie Arbeitsfläche mit 17 eigenständig verschiebbaren Modulen bereit. Dazu gehören Hauptscreen, Aufgabe, Countdown, Ampelstatus, Spielstand, Entdeckungen, Mikrofon-/Spielrundensteuerung, Weltwahl und sämtliche Einstellungsblöcke.

Module lassen sich mit Maus, Touch oder Pfeiltasten verschieben und am unteren rechten Griff vergrößern. Die Module können direkt über dem Hauptscreen angeordnet werden. Der Hauptscreen bleibt als Hintergrundebene hinter den übrigen Modulen. Auf schmalen Displays ist die mindestens 960 Pixel breite Arbeitsfläche scrollbar.

Die bisherige normale Darstellung wird beim Beenden wiederhergestellt. Eine laufende Spielrunde und der unabhängige Countdown werden beim Moduswechsel nicht pausiert. Die Tafelansicht hat eigene normalisierte horizontale Koordinaten, vertikale Positionen, Größen und Ebenen. Sie wird unter klassenampel-board lokal sowie als board-Objekt im Ansichtssnapshot gespeichert.

src/board.js verwaltet diese Anordnung. Beim HTML-Export werden die tatsächlich verschobenen DOM-Elemente in der exportierten Kopie zuerst in ihre normale Struktur zurückgesetzt. Nach dem Laden wird der gespeicherte Tafelzustand wiederhergestellt. Dadurch bleiben die bisherigen Startabläufe und älteren Ansichten kompatibel.

Offene Details-Bereiche werden ergänzend nach Kennung gespeichert. Der ältere positionsbezogene Exportwert wird für die Rückwärtskompatibilität weiterhin gelesen. Die Normalansicht behält die bisherige Innen-/Außenplatzierung von Aufgabe und Uhr.

Der gezielte BOARD_ONLY-Prüflauf bestätigte alle registrierten Module, Platzierung über dem Hauptscreen, Verschieben mit Maus und simuliertem Touch, Tastatur, Größenänderung, fortlaufende Spielrunde, Speichern, HTML-Export, Ansichtslink und Rückkehr. Der vollständige vorhandene Browserlauf und die Bildschirmschonerprüfung waren ebenfalls erfolgreich. Eine echte interaktive Schultafel wurde dabei nicht verwendet.

### Zusammenführung des Projekts am 26.11.2026

Phase 1 der Roadmap wurde auf Nutzerauftrag umgesetzt. Das bestehende lokale Git-Repository unter `work/klassenampel/` ist jetzt der maßgebliche Entwicklungsort.

| Bestandteil | Neuer Ort relativ zur Repository-Wurzel |
| --- | --- |
| Unveränderte fünf Quellcodedateien | src/ |
| Buildskript mit angepassten Verzeichnispfaden | scripts/build.cjs |
| Vorhandener Browserprüflauf mit angepasstem HTML-Pfad | tests/browser-check.cjs |
| Fertige App für GitHub Pages | index.html |
| README, AGENTS, PROJECT und ROADMAP | Repository-Wurzel |

Die Zusammenführung übernimmt den Funktionsstand unverändert. Die fünf Quellcodedateien und die gebaute HTML werden per SHA-256 mit dem vorherigen Stand verglichen. Die Referenz der HTML ist `c49839e528e52396a0978dde8d3be194c16d698bbfb9f7cae62393aae9913fe0`.

Build und Prüfskript erhalten ausschließlich die für den neuen Aufbau erforderlichen Pfadanpassungen. Eine .gitignore schließt Testprofile, generierte Bilder und Test-HTML aus. Eine .gitattributes hält Textdateien mit LF-Zeilenenden reproduzierbar.

Die alten Quellen direkt in work bleiben außerhalb des Repositorys als Vergleich erhalten. Weitere Entwicklung erfolgt in src. Ein lokaler Ausgangscommit sichert diesen Stand. GitHub-main und Pages bleiben bis zu einem gesonderten Veröffentlichungsauftrag auf ihrem bisherigen Stand.

Für die Zusammenführung wurden der vollständige Browserlauf sowie ALARM_ONLY, LAVA_ONLY, SCREENSAVER_ONLY, PREVIEW_ONLY, BACKGROUND_ONLY, FONTS_ONLY, CITY_ONLY und WORLDS_ONLY im neuen Repository-Aufbau erfolgreich ausgeführt. Der Hashvergleich bestätigt die bytegenaue Erhaltung aller fünf Quelldateien und der gebauten HTML.

Beim parallelen Start der Zusatzprüfungen griff der Lavalampe-Prüflauf einmal auf eine noch nicht geladene Seite zu. Die unveränderte Einzelprüfung war anschließend erfolgreich. Dies ist eine Grenze der festen Wartezeiten im Prüfharness und bleibt ein Wartungspunkt für Phase 2.

### Gesamtbewertung

Die Anwendung ist eine funktionsreiche, lokal lauffähige Basis. Der aktuelle vollständige Edge-Prüflauf und sechs ergänzende Prüfmodi sind erfolgreich. Der nächste Schwerpunkt ist ein gemeinsamer, versionierter Entwicklungsstand mit reproduzierbaren Prüfungen und anschließender Erprobung auf Unterrichtsgeräten.

| Bereich | Befund am 26.11.2026 | Einordnung |
| --- | --- | --- |
| Funktionen | Fünf Spielwelten, Neutral, Bildschirmschoner, Raketen-Lavalampe, Aufgabenmodule, Timer, Signalton, Export und Vorschau im Code vorhanden | Implementiert |
| Spielmechanik | Mikrofon-/Demo-Eingabe, Punkte, 30er-Freischaltungen und Konsequenzen im Gesamtlauf erfolgreich | Aktuell lokal geprüft |
| Build | Aus den Quellen zusammengesetzte HTML stimmt exakt mit outputs/index.html überein | Reproduzierbar |
| Syntax | app.js, classroom.js und worlds.js bestehen node --check | Aktuell geprüft |
| Quellorganisation | Quellen, Build, Prüfskript, HTML und Dokumente im lokalen Repository zusammengeführt | Phase 1 umgesetzt |
| Agentenanweisungen | AGENTS.md liegt an der Repository-Wurzel | Umgesetzt |
| GitHub main | HEAD ist weiterhin 4fc5bbc vom 15.11.2026 und enthält nur README.md sowie eine ältere index.html | Lokale Erweiterungen dort nicht enthalten |
| Zielgeräte | Neuester Stand noch nicht auf realer Schultafel und mehreren mobilen Browsern nachgewiesen | Geräteabnahme offen |
| Schulische Freigabe | Bundesland, konkrete Einsatzbedingungen und Datenschutzfreigabe weiterhin unbekannt | Klärung offen |

### Heute erneut geprüfte Abläufe

Der vollständige vorhandene Edge-Prüflauf endete mit Exitcode 0. Er prüft unter anderem animierte Weltansichten, 360-px-Darstellung, alte Spielstände, Timer, Demo, simuliertes Mikrofon mit Testton, Kalibrierung, Punkte, Konsequenzen und Reset.

Zusätzlich endeten diese sechs gezielten Prüfmodi jeweils mit Exitcode 0.

| Modus | Schwerpunkt |
| --- | --- |
| ALARM_ONLY | Dreiklang einmalig bei Ablauf, stumm ohne Ton, Pause und Export der Option |
| LAVA_ONLY | Bewegung, Lautstärkefarben über Demo, Export, Mobilansicht und reduzierte Bewegung |
| SCREENSAVER_ONLY | Animation, reduzierte Bewegung, Rückkehr und HTML-Export |
| PREVIEW_ONLY | Freischaltungsvorschau in fünf Welten ohne Scoreänderung und Wiederherstellung |
| BACKGROUND_ONLY | Zeit und Demo-Punkte ohne Animationsframes, Pause und Countdown-Ende |
| FONTS_ONLY | Schriftart, drei Größen, Zurücksetzen und Übernahme per HTML/Link |

Diese Prüfungen verwenden einen automatisierten lokalen Edge und teilweise virtuelle Zeit bzw. ein simuliertes Audiogerät. Das bestätigt keine Hörbarkeit auf realen Lautsprechern, keine Mobilgeräte-Mikrofonfreigabe und keinen langfristigen Standbybetrieb. Ein neuer visueller Durchgang über jede Weltstufe wurde heute nicht zusätzlich durchgeführt.

### Abgleich mit GitHub

Der verbundene GitHub-Zugang wurde ausschließlich lesend verwendet. main zeigt auf den vollständigen Commit 4fc5bbc8caab1606cf81bfc5db75e2b1f661efc3.

Der Remote-Baum enthält README.md mit 65 Byte und index.html mit 48243 Byte. Die lokale Ausgabe hat 101659 Byte. Ihre Git-Blob-Kennung ist 662e7218e8c11a0702275528183ef02a5290bfb0, die Remote-HTML hat 55cdefcecdc18a133e8aa503eeb5f30ded0fe889.

Damit ist bestätigt, dass der lokale Entwicklungsstand und die index.html auf main voneinander abweichen. Die tatsächlich veröffentlichte GitHub-Pages-Seite und ihre Konfiguration wurden heute nicht geprüft. Eine Aussage zum ausgelieferten Live-Stand bleibt deshalb offen.

### Prioritäten aus der Bestandsaufnahme

1. Erledigt ist die Zusammenführung von Quellen, HTML und Dokumentation im lokalen Repository. Dieser Stand ist die neue Ausgangsbasis.
2. Die erfolgreichen Prüfungen als wiederholbare Ausgangsbasis sichern und den Prüfharness portabler machen.
3. Speicher-/Export-Randfälle, lange Zeitlücken und die Wechselwirkung zwischen Signalton und Mikrofon gezielt untersuchen.
4. Touch, Mikrofon, Hintergrundbetrieb und Signalton auf den tatsächlich eingesetzten Unterrichtsgeräten abnehmen.
5. Danach gezielte visuelle Feinarbeit und erst anschließend zusätzliche Produktfunktionen auswählen.

Die ausführliche Arbeitsreihenfolge mit Abnahmekriterien steht in ROADMAP.md. Die folgenden Kapitel dokumentieren den funktionalen Stand und die Entwicklungsgeschichte.

## Statusbegriffe

| Kennzeichnung | Bedeutung |
| --- | --- |
| Implementiert | Im aktuellen lokalen Code vorhanden |
| Verbindlich beschlossen | Vom Nutzer ausdrücklich gefordert und weiterhin gültig |
| Offen | Umsetzung, Entscheidung oder Prüfung steht noch aus |
| Idee | Vorschlag ohne verbindlichen Entwicklungsauftrag |
| Unklar / möglicherweise veraltet | Aus den verfügbaren Informationen nicht zuverlässig feststellbar |

„Implementiert“ beschreibt den lokalen Stand. Veröffentlichung, Gerätefreigabe und Rechtskonformität folgen daraus nicht.

## Projektidentität und Herkunft

- Name ist KlassenAmpel.
- Die Oberfläche heißt weiterhin Version 0.4, obwohl nach der ersten 0.4-Ausgabe zahlreiche Erweiterungen entstanden sind.
- Ausgangsprojekt ist das im Gespräch benannte Repository `OrmondSacker/klassenampel`.
- Ursprünglicher Referenzchat war „Klassenampel Entwickeln“, Kennung `6af991ab-daf4-83eb-892f-1e8a34393c94`.
- Die erste Überarbeitung basierte auf der damaligen 0.3-HTML aus dem Repository.
- Der Nutzer berichtete vor dieser Weiterentwicklung bereits von funktionierendem Mikrofonzugriff auf Android über GitHub Pages.
- Aktueller lokaler Referenzcheckout unter `work/klassenampel/` hat bei dieser Übergabe HEAD `4fc5bbc8caab1606cf81bfc5db75e2b1f661efc3`, Commitdatum 2026-11-15, Nachricht „Add files via upload“.
- In einer früheren Sitzung wurde ein anderer Remote-HEAD gelesen. Die Entwicklungsgeschichte und Aktualisierung dieses Checkouts wurden hier nicht rekonstruiert.
- Am 26.11.2026 wurde main erneut gelesen. Dort liegt weiterhin der genannte Commit mit einer älteren HTML. Ein möglicherweise abweichender Live-Deployment-Stand wurde nicht geprüft.

## Architektur

Die Anwendung ist eine statische, eigenständig ausführbare HTML-Datei. Es gibt keine Anwendungskonten, Datenbank oder serverseitige App-Logik.

Die bearbeitbaren Quellen liegen im Repository unter `src/` und bestehen aus HTML, CSS und fünf JavaScript-Dateien. `scripts/build.cjs` fügt zuerst `worlds.js`, danach `app.js`, `classroom.js`, `modules.js` und schließlich `whiteboard.js` in die HTML ein.

- `worlds.js` definiert den Weltkatalog und zeichnet mit Canvas 2D. Die Stadt verwendet `bauhausCity`, vier weitere Spielwelten `sculptedWorld`, die Lavalampe `lavaLamp`.
- `app.js` verwaltet Messung, Ampel, Rundenstatus, Score, Konsequenzen und Vorschau.
- `classroom.js` verwaltet Aufgabenfeld, Countdown, Signalton, Layout, Schrift, Bildschirmschoner und Ansichtsexport.
- `modules.js` ergänzt die allgemeine Verschiebe- und Größenbedienung aller Module.
- `whiteboard.js` verwaltet Freitext, Stift-/Radiererstriche und lokale Fotos.
- `window.klassenampel.snapshot()/restore()` ist die Schnittstelle für Spielzustände.
- `window.classroomView.snapshot()/exportHtml()` stellt Ansichts-Snapshot und HTML-Export bereit.

Canvas-Grafiken entstehen im Browser aus Formen und Berechnungen. Es werden keine Bildpakete oder externen Assets nachgeladen.

## Implementierte Ansichten

| Kennung | Ansicht | Stand |
| --- | --- | --- |
| `aquarium` | Aquarium | Lichtstrahlen, Blasen, Sand, Felsen, zusammenhängendes Riff und schwimmende Tiere |
| `city` | Städtebau | Bauhaus-inspirierte Flachdachbauten, Fensterbänder, räumliche Seitenflächen, Straßen und Stadtpark |
| `space` | Weltraum | Ringplanet, Mondlandschaft, verbundene Basen, Satelliten und Flugbewegung |
| `fantasy` | Fantasy | Bergtal, dort entspringender Fluss, Burg, Pilzdorf, Brücken, Kristalle, Tor und Drache |
| `nature` | Natur | Waldlichtung, Obstbaum, Blumen, Bach, Teich, Bienen, Fuchs und Baumhaus |
| `neutral` | Neutral | Ruhige Fläche, optional langsam bewegte dezente Formen |
| `lava` | Lavalampe | Raketenförmige alte Lavalampe mit Metallspitze, Glasreflexen, Standfuß und fließender Masse |

Für Grundschule wird glatt und freundlich gezeichnet. Berufskolleg verwendet eine reduzierte Canvas-Auflösung und pixelige Darstellung. Lavalampe bleibt in beiden Unterrichtsmodi glatt.

Die Betriebssystemeinstellung für reduzierte Bewegung wird berücksichtigt. Dann steht die Bewegung still. Die Ampelfarbe der Lavalampe kann weiterhin reagieren.

## Mikrofon und Ampel

Implementiert ist lokale Messung über `getUserMedia` und Web Audio. Der Analyser verwendet 2048 Zeitbereichssamples. Aus dem RMS-Wert entstehen ein relativer Pegel von 0 bis 100 und eine geglättete Ampelfarbe.

- Verstärkung ist zwischen 1 und 12 in 0,5er-Schritten einstellbar. Vorgabe ist 5.
- Fünf Sekunden Kalibrierung erfassen den Grundpegel. Der gespeicherte Basiswert dieser Sitzung ist 65 Prozent des gemessenen RMS-Mittels.
- Stillarbeit verwendet zunächst Grenzwerte 35 und 65.
- Partnerarbeit verwendet 48 und 78.
- Gruppenarbeit verwendet 60 und 88.
- Grün gilt unter der unteren Grenze, Gelb zwischen den Grenzen, Rot ab der oberen Grenze.
- Demo bietet feste Zustände Grün, Gelb und Rot. Die Demo und das echte Mikrofon schließen sich gegenseitig aus.
- Unterbrochene, stumme oder beendete Mikrofontracks werden berücksichtigt.
- Der Pegel ist relativ und nicht als geeichter Dezibelwert zu behandeln.

Die Lavalampe verwendet dieselbe Ampelfarbe mit weichen Farbübergängen. Ohne aktuelle Eingabe ist ihre Farbe gedämpft blaugrau. Ihre Farbsteuerung funktioniert auch ohne gestartete Spielrunde.

## Spielrunde und Fortschritt

Verbindlich beschlossen und implementiert sind folgende Regeln.

- Eine Spielrunde wird ausdrücklich gestartet. Mikrofonstart allein startet sie nicht.
- Eine Runde lässt sich pausieren, fortsetzen oder zurücksetzen.
- Wählbare Dauer sind 5, 10, 15, 20, 30, 45 und 60 Minuten. Anfangswert ist 15 Minuten.
- Bei laufender Runde und Grün gibt es einen Punkt pro Sekunde. Bruchteile grüner Sekunden werden gesammelt.
- Gelb und Rot stoppen das Sammeln. Der Rundentimer läuft weiter.
- Eine Entdeckung entspricht jeweils 30 Punkten. Die sichtbare Zahl ergibt sich aus `floor(score / 30)`.
- Score wird auf maximal 999999 begrenzt.
- Weltwechsel und Altersmoduswechsel verwenden denselben gemeinsamen Score. Es gibt keine getrennten Spielstände je Welt.
- Neue Runde nach Ablauf setzt den Rundentimer und die Rundenzähler zurück. Punkte bleiben erhalten.
- „Zurücksetzen“ mit Bestätigung setzt auch den Score und damit die Weltelemente zurück.
- Grünzeit wird als Anteil an der verstrichenen Rundenzeit angezeigt.

Neutral und Lavalampe blenden Spielobjekte, Entdeckungsbereich und Punkteanzeigen aus. Wenn eine Runde weiterläuft, bleibt die Spielrechnung im Hintergrund aktiv. Dies ist der tatsächliche Codezustand. Eine abweichende Regel für diese beiden Ansichten wurde nicht ausdrücklich beschlossen.

## Alle dauerhaften Freischaltungen

Für die fünf Spielwelten gibt es je zwölf dauerhafte Stufen. Beide Unterrichtsmodi verwenden dieselbe Reihenfolge.

| Punkte | Aquarium | Städtebau | Weltraum | Fantasy | Natur |
| --- | --- | --- | --- | --- | --- |
| 30 | Clownfisch | Wohnhaus | Ringplanet | Zauberturm | Obstbaum |
| 60 | Korallengarten | Bäckerei | Mondbasis | Pilzdorf | Blumenwiese |
| 90 | Qualle | Stadtpark | Satellit | Kristallhain | Teich |
| 120 | Schildkröte | Schule | Observatorium | Burg | Bienenstock |
| 150 | Schatztruhe | Rathaus | Komet | Drache | Fuchs |
| 180 | Mantarochen | Hochhaus | Raumstation | Sternentor | Baumhaus |
| 210 | Seegraswiese | Straßenlaternen | Landebaken | Weglaternen | Frühlingsblüten |
| 240 | Korallenbogen | Stadtbäume | Mondkrater | Pilzlichtung | Gewässerpflanzen |
| 270 | Perlenpfad | Zebrastreifen | Sternbild | Kristallbrücke | Trittsteine |
| 300 | Muschelbank | Marktstände | Eisfeld | Burgbanner | Wilder Kräutergarten |
| 330 | Riffhöhle | Brunnen | Frachtkapseln | Drachennest | Fuchsbau |
| 360 | Leuchtplankton | Lichterkette | Nordlicht | Sternenpfad | Glühwürmchen |

Nach zwölf dauerhaften Stufen entstehen keine weiteren permanenten Objekte. Die numerische Zahl der Entdeckungen kann dennoch weiter steigen.

## Weltaktionen und manuelle Vorschau

| Welt | Aktion |
| --- | --- |
| Aquarium | Fischschwarm rufen |
| Städtebau | Stadtlichter einschalten und zusätzlichen Abendverkehr zeigen |
| Weltraum | Flugmanöver mit Leuchtspur |
| Fantasy | Drachenzeichen senden |
| Natur | Schmetterlinge locken |

Diese Aktionen sind per Schalter jederzeit verfügbar. Bei regulärem Fortschritt werden sie bei 180 und 360 Punkten sowie anschließend alle 30 Punkte ausgelöst. Sie dauern ungefähr 6,2 Sekunden.

Unter „Freischaltungen ansehen“ lassen sich eine leere Welt und die Stufen 1 bis 12 auswählen. Die Vorschau zeigt die gewählte Ausbaustufe und verändert den Score nicht. „Aktueller Spielstand“ beendet sie. Ein Weltwechsel beendet ebenfalls die aktuelle Vorschau.

Die Vorschau wird beim vollständigen Ansichtsexport als Spielzustandsfeld `previewCount` übernommen. Neutral und Lavalampe haben keine Freischaltungsvorschau.

## Konsequenzmodul

Das Modul ist optional und abschaltbar. In einer frischen Installation ist es aktuell eingeschaltet.

| Einstellung | Vorgabe | Auswahl |
| --- | --- | --- |
| Durchgehend Rot | 5 Sekunden | 3, 5 oder 10 Sekunden |
| Stärke | Mittel | Mild 5, Mittel 15, Streng 30 Punkte |
| Schutzpause | 20 Sekunden | 10, 20 oder 30 Sekunden |
| Punktabzug | Ein | Separat abschaltbar |
| Weltrückschritt | Ein | Separat abschaltbar |

Profile werden je Altersmodus gespeichert. Nach einer Konsequenz startet die Schutzpause. Bei anhaltendem Rot kann danach erneut eine Konsequenz folgen. Gelb oder Grün unterbricht den durchgehenden Rotzähler.

Weltrückschritt funktioniert über den Score. Bei mindestens einer Entdeckung wird nötigenfalls so viel abgezogen, dass die zuletzt erreichte 30er-Schwelle unterschritten wird. Wenn beide Optionen aktiv sind, gilt der größere erforderliche Abzug, keine Addition beider Beträge.

Beispiel bei 45 Punkten und mittlerer Stärke mit Weltrückschritt sind 16 Punkte Abzug nötig. Der Score fällt auf 29 und die erste Entdeckung verschwindet. Ohne Weltrückschritt wären es 15 Punkte Abzug auf 30.

Die letzte Konsequenz kann einmal rückgängig gemacht werden. Der verlorene Betrag wird auf den dann aktuellen Score addiert, sodass inzwischen gewonnene Punkte erhalten bleiben.

## Aufgabe, Uhr und modulare Bedienung

- Das Aufgabenfeld erlaubt bis zu 2000 Zeichen und speichert den Text lokal.
- Der Aufgaben-Countdown ist unabhängig von der Spielrunde, benötigt kein Mikrofon und bietet 1 bis 180 ganze Minuten.
- Start, Pause, Neustart und Neusetzen sind vorhanden.
- Ein Pfeil klappt das jeweilige Modul ein oder aus.
- Ziehen am Griff positioniert die Module innerhalb der Spielwelt. Loslassen außerhalb verschiebt sie in den Bereich oberhalb der Welt.
- Die Position wird relativ zur Weltgröße gespeichert und an die verfügbaren Grenzen angepasst.
- Pointer Events unterstützen Maus und Touch. Tatsächliche Touchtests auf Schulhardware sind nicht dokumentiert.
- Pfeiltasten können Module innerhalb der Welt verschieben. Ein Tastaturweg zum Wechsel zwischen Innen- und Außenbereich ist bislang nicht implementiert.
- Aufgabe, Countdown, HUD und Entdeckungsbereich können separat ein-/ausgeblendet werden.
- „Positionen zurücksetzen“ setzt die Innenkoordinaten zurück. Es setzt aktuell weder Einklappzustände noch Außenplatzierung zurück.
- Die Weltüberschrift ist visuell verborgen. Die Weltwahl erfolgt im ausklappbaren Menü.

Schriftarten sind Systemschrift, Arial, Verdana, Georgia und Consolas. Die tatsächliche Verfügbarkeit ist geräteabhängig.

Die Oberfläche bietet 12 bis 24 px, der Aufgabentext 12 bis 48 px und der Countdown 20 bis 96 px. Die Uhr wird bei schmalem Modul zusätzlich an die verfügbare Breite angepasst, damit die Zeit in einer Zeile bleibt.

## Countdown-Signalton

Die zuletzt umgesetzte Nutzeranforderung ist der Ton beim Ablauf des Aufgaben-Countdowns.

- Der Ton ist ein kurzer, aufsteigender Dreiklang aus Web-Audio-Sinusoszillatoren.
- Frequenzen sind 659,25 Hz, 830,61 Hz und 987,77 Hz.
- Der Ton wird beim Übergang einer laufenden Uhr auf null einmal ausgelöst.
- In „Uhr einstellen“ ist „Signalton bei Ablauf“ standardmäßig eingeschaltet und abschaltbar.
- Pause, stummer Ablauf und wiederholtes Rendern lösen keine zusätzlichen Töne aus.
- Neusetzen oder Stummschalten beendet einen gerade vorbereiteten bzw. laufenden Alarm.
- Die Einstellung wird lokal und im vollständigen Ansichtsexport gespeichert.
- Die Audiofreigabe wird beim Start der Uhr vorbereitet. Browserrichtlinien, stummgeschaltete Geräte und suspendierte AudioContexts können die Ausgabe verhindern.
- Ein Signalton am Ende der Spielrunde wurde nicht ausdrücklich angefordert und ist nicht implementiert.

## Hintergrundbetrieb

Verbindliches Ziel ist das Weiterlaufen bei Tabwechsel.

Die Spielrechnung wird durch ein 100-ms-Intervall und zusätzlich aus dem Animationszyklus angestoßen. Verstrichene Rundenzeit verwendet `performance.now()`. Die Darstellung verwendet `requestAnimationFrame`. Ein bloßer Sichtbarkeitswechsel pausiert die Runde nicht.

Der Aufgaben-Countdown verwendet eine mit `Date.now()` berechnete Deadline und aktualisiert die Anzeige alle 200 ms sowie beim Sichtbarkeitswechsel.

Für echte Mikrofonbewertung werden im aktuellen Code nur Abstände von höchstens zwei Sekunden zwischen Rechenschritten berücksichtigt. Bei längeren Lücken laufen die Rundenzeit und der Countdown weiter, ohne dafür im Nachhinein Lautstärkebewertungen zu erfinden. Demo-Grün kann deterministisch auch größere Zeitlücken aufholen.

Beim tatsächlichen Verlassen der Seite über `pagehide` wird das Mikrofon beendet und eine laufende Runde pausiert. Geschlossener Browser oder Gerätestandby sind damit nicht als dauerhaft messender Betrieb zugesichert.

## Präsentation, Bildschirmschoner und Lavalampe

Präsentationsmodus blendet Bedienbereiche aus und vergrößert die Welt. Browser-Vollbild wird angeboten, wenn die Fullscreen-API verfügbar ist.

„Neutraler Bildschirmschoner“ wechselt zu Neutral, schaltet die langsame Hintergrundbewegung ein und nutzt eine bildfüllende, reduzierte Oberfläche. Aufgabe und Uhr folgen ihren Modulzuständen. Der Rückweg erfolgt über ↩ oder Escape. Bildschirmschonerzustand wird im Ansichtsexport übernommen.

Die Lavalampe ist ein eigener Modus. Sie simuliert Wachs mit zusammenfließenden Feldern, einem unteren Reservoir, langsam aufsteigenden Massen, schmalen Verbindungen und Tropfen. Die Verformung variiert zwischen zäher und flüssiger Wirkung. Dies ist eine visuelle Näherung und keine physikalisch validierte Flüssigkeitssimulation.

Die Farbe folgt dem Signal mit weichem Übergang. Die Form mit Metallspitze, Glasreflexen und Standfuß wurde vom Nutzer ausdrücklich als alte Raketen-Lavalampe gewünscht.

Der dedizierte Bildschirmschoner-Schalter aktiviert momentan ausschließlich Neutral. Lavalampe kann mit dem vorhandenen Präsentationsmodus gezeigt werden. Ein eigener Lavalampe-Bildschirmschoner-Schalter wurde nicht beschlossen.

## Speicherung und Übertragung

| localStorage-Schlüssel | Inhalt |
| --- | --- |
| `klassenampel-v02` | Welt, Altersmodus, Arbeitsform und Score |
| `klassenampel-penalties-v03` | Konsequenzprofile für Grundschule und Berufskolleg |
| `klassenampel-task` | Aufgabentext |
| `klassenampel-layout` | Relative Innenpositionen der beiden Module |
| `klassenampel-module-state` | Eingeklappt / außerhalb je Modul |
| `klassenampel-fonts` | Schriftart und Schriftgrößen |
| `klassenampel-view` | Ausdrücklich gespeicherter vollständiger Ansichtssnapshot |
| `klassenampel-countdown-sound` | Signalton an / aus |
| `klassenampel-modules` | Frei platzierte Module, Größen und Ebenen |
| `klassenampel-whiteboard` | Freitext, Zeichnungen und eingebettete Tafel-Fotos |

Die alten Schlüssel mit v02 und v03 werden aus Kompatibilitätsgründen weiterverwendet.

Vollständige Ansichten verwenden Schema `version: 1`. Sie enthalten Aufgabe, Layout, Modulzustände, gewählte Bedieneinstellungen, Countdownrestzeit, Spielzustand, Präsentations-/Bildschirmschonerzustand und eine positionsbezogene Liste geöffneter Details-Bereiche.

Reihenfolge beim Öffnen ist Ansichtslink `#ansicht=...`, dann eingebetteter JSON-Block `viewConfig`, dann lokal gespeicherte vollständige Ansicht. Ohne vollständige Ansicht werden einzelne lokale Einstellungen verwendet.

Der HTML-Export klont das aktuelle Dokument und bettet den Snapshot als JSON ein. Das Zeichen `<` wird beim Einbetten maskiert. Die exportierte Datei enthält die App selbst und kann unabhängig geöffnet werden.

Der Online-Link speichert denselben Snapshot URL-kodiert im Fragment. Er bietet keine Zugriffskontrolle. Jede Person mit dem vollständigen Link kann den enthaltenen Aufgabentext lesen. Der Fragmentinhalt gehört zum geteilten Link, auch wenn er bei einem normalen HTTP-Aufruf nicht als URL-Pfad zum Server übertragen wird.

Beim Wiederherstellen werden beide Timer pausiert übernommen. Mikrofonberechtigung, aktive Audioverbindungen und Demobetrieb werden nicht übertragen.

Nicht enthalten sind unter anderem die Mikrofonkalibrierung, aktive Gerätereferenzen, der grüne Sekundenbruchteil und eine noch rückgängig machbare Konsequenz. Der vollständige Export enthält die gerade sichtbare Konsequenzkonfiguration, nicht ausdrücklich alle separat gespeicherten Altersprofile.

Es gibt keine Live-Synchronisierung und keinen direkten Upload aus der App. Der Nutzer kann die exportierte HTML selbst als Website veröffentlichen.

## Bekannte Grenzen und prüfbedürftige Stellen

### Bestätigte Grenzen

1. Eine gespeicherte Gesamtansicht hat beim nächsten Start Vorrang vor einzelnen inzwischen geänderten lokalen Einstellungen. Für die neueste Gesamtansicht erneut „Ansicht speichern“ verwenden.
2. Ältere exportierte Ansichten speichern offene Details-Bereiche nur nach DOM-Reihenfolge. Neue Exporte verwenden zusätzlich stabile Kennungen. Sehr alte Exporte können bei geänderter Struktur weiterhin abweichende Bereiche öffnen.
3. Rundenreset löscht keine Aufgabentexte, Schriftprofile oder vollständigen gespeicherten Ansichten.
4. Alle Module können nun aus dem normalen Layout gelöst und frei positioniert werden. Bei älteren gespeicherten Ansichten kann zunächst weiterhin die frühere Aufgaben-/Uhrplatzierung verwendet werden.
5. Beliebige manuelle Platzierung kann Aufgabe und Uhr wieder über Inhalte der Welt legen. Es gibt keine allgemeine automatische Kollisionsvermeidung für Benutzerpositionen.
6. Der neutrale Modus und die Lavalampe verbergen Punkte, deaktivieren aber keine bereits laufende Spielrechnung.
7. Anzeige und numerische Anzahl der Entdeckungen können nach Stufe 12 weiter wachsen, obwohl die dauerhafte Grafik bei zwölf Stufen endet.
8. Hintergrundverarbeitung und Audio sind von Browser- und Betriebssystembedingungen abhängig.
9. Die aktuelle lokale HTML ist auf dem geprüften GitHub-main nicht enthalten. Eine abweichende Live-Veröffentlichung, Datenschutzfreigabe, reale Schultafeltests und erneute Android-Prüfung der neuesten Version sind nicht nachgewiesen.

### Aus dem Code abgeleitete Prüfpunkte

Diese Punkte wurden nicht als Nutzerfehler reproduziert und sollen zunächst gezielt geprüft werden.

- Bei großen nachgeholten Zeitschritten kann die Punktelogik mehrere 30er-Schwellen gleichzeitig überschreiten, aber nur ein Freischaltungsereignis auslösen.
- Langer Demo-Rot-Zeitsprung holt nicht zwangsläufig jede zwischenzeitliche Konsequenz einzeln nach.
- Ein sichtbarer Signalton kann bei offenem Mikrofon selbst in die Lautstärkemessung eingehen. Eine automatische Unterdrückung dafür gibt es nicht.
- Wiederherstellung setzt controls über change-/input-Ereignisse. Das kann auch lokale Profile aktualisieren und bei aktiver Tonoption Audiofreigabe anstoßen.
- Testen, ob anstehende Alarmfreigaben bei mobilen Browsern oder im Hintergrund zuverlässig abgeschlossen bzw. korrekt abgebrochen werden.
- Wiederholte Wechsel von Seitenzuständen, bfcache und sehr langsame Geräte benötigen eine gezielte Hintergrund-/Audio-Prüfung.
- Der Prüfharness verwendet einen fest kodierten Edge-Pfad, temporäre Profile und teilweise eine virtuelle Zeit. Er ist noch keine portable CI-Testsuite.

## Grafische Entscheidungen und zurückgewiesene Zwischenstände

1. Erste Emojireihen wirkten statisch und unausgereift. Dauerhafte Bewegung und zusammenhängende Welten wurden gewünscht.
2. Auch die ersten selbst gezeichneten Objektreihen wirkten zusammenhanglos. Szenen bekamen gemeinsame Landschaften, Wege und Aktionen.
3. Die Bauhaus-Stadt wurde ausdrücklich positiv bewertet. Diese Richtung führte anschließend zur Überarbeitung der anderen vier Welten.
4. Fantasy wurde wiederholt wegen überlappender Objekte kritisiert. Kristalle stehen inzwischen einzeln, Pilzhäuser mit Abstand, der Drachenflug liegt über der Burg.
5. Der Fantasy-Fluss passte zunächst nicht zu den Bergen. Er beginnt jetzt schmal in einem Bergsattel und wird zum Vordergrund hin breiter.
6. In der Stadt wurden die Fahrbahn höher im Bild angeordnet, Marktstände und Fußgänger zurückgesetzt und eine überlappende hintere Querstraße entfernt.
7. Der Wunsch nach „Screens speichern“ meinte vollständige Ansichten auf anderen Geräten. Die zwischenzeitliche PNG-Galerie wurde entfernt.
8. Textschalter zum Einklappen und Heraussetzen wurden durch Pfeile und Drag-and-drop ersetzt.
9. Die erste Lavalampe füllte die ganze Fläche mit Blasen. Der Nutzer verlangte danach ausdrücklich die aktuelle klassische Raketenform und zähen Wachsfluss.

Alte PNG-Vorschauen in `outputs/` können diese Entwicklung nur teilweise abbilden. Die aktuelle HTML ist maßgeblich.

## Prüfstand

In der Entwicklung wurden gezielte lokale Edge-Prüfungen durchgeführt.

- Kernregeln, Timer, Konsequenzen und Rückgängigfunktion.
- Alte Spielstände, lokale Speicherung und Reset.
- Aufgabenmodul, Countdown, Layoutwechsel, Einklappen und Drag-and-drop mit Maus.
- HTML-Export, Ansichtslink und Wiederherstellung.
- Schriftgrößen, Schriftart und Zurücksetzen.
- Hintergrundlogik ohne sichtbare Animationsframes.
- Fünf Spielwelten in beiden Grafikstilen, mehrere bzw. alle Freischaltstufen und 360-px-Ansicht.
- Manuelle Vorschau, neutraler Bildschirmschoner und reduzierte Bewegung.
- Lavalampe, Demo-Farbwechsel, Raketenform und Export.
- Dreiklang genau einmal bei Countdown-Ende, Stummschaltung, Pause und Export der Toneinstellung.

Frühere Mikrofontests mit einem simulierten Gerät und definiertem Testton waren erfolgreich. Ein damaliger zusätzlicher Gesamtlauf blieb bei der simulierten Freigabe hängen. Bei der Bestandsaufnahme am 26.11.2026 lief der vollständige vorhandene Prüflauf einschließlich simuliertem Mikrofon erfolgreich durch. Der reale Mikrofonbetrieb der neuesten Gesamtversion auf Android, Prowise, iOS und verschiedenen Schulbrowsern wurde weiterhin nicht nachgewiesen.

Beim Signalton wurden die erzeugten Audioereignisse im Browser geprüft. Ein erfolgreicher Test bestätigt nicht die Lautstärke und Hörbarkeit an realen Schullautsprechern.

## Datenschutzgespräch

Der Nutzer fragte nach schulischer Zulässigkeit. Der geprüfte App-Code verarbeitet den Pegel lokal, enthält keine Tonaufzeichnung, Spracherkennung, Benutzerkonten, externen Analyseprogramme oder Übertragung der Mikrofonwerte.

Aufgabentexte und Einstellungen liegen jedoch im Browser und in Exporten bzw. Links. Für diese Inhalte besteht keine automatische Löschfrist. Das Mikrofon bleibt bei Tabwechsel aktiv, solange der Browser dies erlaubt.

Bei Onlinehosting fallen Verbindungsdaten beim Hoster an. GitHub beschreibt die Speicherung von Besucher-IP-Adressen für GitHub Pages. Ein lokales HTML vermeidet diesen Hostingaufruf.

Das Bundesland und eine schulische Datenschutzfreigabe sind unbekannt. NRW wurde im Gespräch nur als bedingtes Beispiel behandelt. Daraus darf keine allgemeine Nutzungserlaubnis abgeleitet werden.

Weiterführende Quellen aus der damaligen Prüfung sind die [DSGVO](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32016R0679), [Medienberatung NRW](https://www.medienberatung.schulministerium.nrw.de/de/themen/datenschutz_1/datenschutz_und_informationssicherheit.html) und [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). Bei einer rechtlichen Einsatzentscheidung die aktuellen Vorgaben erneut prüfen.
