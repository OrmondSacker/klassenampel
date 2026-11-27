# Weiterentwicklung

Stand ist der 27. November 2026. Diese Roadmap wurde nach der Bestandsaufnahme in Codex priorisiert. Sie unterscheidet bestehende Nutzeranforderungen, empfohlene Wartungsarbeiten und unverbindliche Ideen.

## Zuletzt umgesetzte Nutzeranforderungen

### Version 0.5.2 – Unterrichtskomfort

Das bestätigte Viererpaket aus Timer-Schnellbedienung, visueller Restzeit, sichtbarer Arbeitsform und optionalem Zusatzauftrag ist umgesetzt. Kein neues Arbeitsmodul und keine neue Spielregel. Vorgaben und Abschaltoptionen befinden sich bei der Uhr beziehungsweise unter „Anzeigen im Detail“. Bei der Prüfung wurde zusätzlich das automatische Nachordnen nach Fenstergrößenwechseln korrigiert.

Die weiteren Vergleichsideen (Vorlagenstart ohne alten Spielstand, komplette Sammlung übertragen, ruhiger Beamerbetrieb, sichtbares Klassenziel, Stundenphasen und Geräteauswahl) sind weiterhin Vorschläge und nicht Teil dieses Auftrags.

### Version 0.5.1 – gespeicherte Inhalte wieder öffnen

Die benannte lokale Ansichtsbibliothek mit Öffnen, Öffnen-Rückgängig, Umbenennen, Ersetzen, Löschen und Übernahme bisheriger Speicherungen ist umgesetzt und geprüft. Cloud-Synchronisierung und die Übertragung einer kompletten Sammlung sind weiterhin keine implementierten Funktionen.

### Version 0.5.0 umgesetzt

Der am 27.11.2026 bestätigte Entwurf ist lokal implementiert: fünf fachliche Arbeitsmodule, zentrales Menü mit Mehrfachauswahl, fest gruppierte Spielanzeigen und Rundensteuerung, ruhige Menübedienung, semantische automatische Anordnung, bewusste Innenplatzierung, drei Layoutvorlagen, Fixierung, Layout-Rückgängig und zentrale Farbe/Transparenz. Die endgültig gewünschte Versionsnummer 0.5.0 ersetzt den früheren Vorschlag 0.5.0-dev.1.

Version-1-Anordnungen aus 0.4 werden auf die unterstützten fünf Gruppen migriert; Einzelpositionen der bisherigen Status- und Einstellungsfelder entfallen. Funktionen und Spielstände bleiben erhalten. VERSION5_ONLY, die betroffenen fachlichen Zusatzprüfungen und der vollständige bestehende Edge-Lauf waren am 27.11.2026 erfolgreich.

Am 27.11.2026 abgeschlossen: Nutzer-Praxistest ohne gemeldete Auffälligkeiten und genehmigte Veröffentlichung auf GitHub Pages mit erfolgreichem Build, Dateivergleich und Live-Browserprüfung. Weiterhin offen: dokumentierte Geräte-/Browserangaben und Verhalten sehr großer Tafel-Fotosammlungen auf Mobilgeräten. Unterschiedliche Farbvoreinstellungen und eine interaktive Layoutvorschau vor dem Anwenden sind mögliche spätere Ideen. Mathematisch lückenlose Packung ist kein zugesagtes Ziel.

### Historischer Zwischenstand 0.4

Adaptive magnetische Kanten, Nachführen von Innenmodulen, „Automatisch anordnen“ für Haupt- und Innenmodule, Modul-Hintergrundtransparenz sowie einzelnes Löschen, proportionale Fotogröße und Objekttransparenz auf der Tafel sind lokal implementiert. Speicherung und HTML-/Link-Wiederherstellung sind geprüft. Die aktive automatische Anordnung reagiert auf Bildschirmbreite und geöffnete Einstellungen, bis wieder manuell verschoben oder skaliert wird. Die reale Bedienung auf Unterrichtsgeräten bleibt Teil der Geräteabnahme; eine Veröffentlichung ist noch offen.

## Empfohlene Reihenfolge ab jetzt

Die Bestandsaufnahme bestätigt einen erfolgreichen lokalen Gesamtlauf und sechs erfolgreiche gezielte Prüfmodi. Die bearbeiteten Quellen liegen jedoch außerhalb des lokalen Git-Checkouts, und auf GitHub-main steht eine ältere HTML. Daraus ergibt sich die folgende Reihenfolge. Sie ist ein Vorschlag für die nächsten Arbeitsaufträge und löst selbst keine Veröffentlichung aus.

### Phase 1 – Einen maßgeblichen Projektstand schaffen

Status ist am 26.11.2026 auf Nutzerauftrag umgesetzt. Quellen, Build, vorhandene Prüfungen, fertige HTML und Dokumentation sind im lokalen Repository `work/klassenampel/` zusammengeführt. Die Entwicklung erfolgt ab jetzt unter `src/`. AGENTS.md liegt an der Repository-Wurzel, generierte Browserdaten sind ignoriert.

Die folgende Aufgabenliste beschreibt den Umfang dieser erledigten Phase.

Priorität ist hoch. Diese Phase sollte vor neuen Produktfunktionen erfolgen.

- Aktuelle Quellen aus work, aktuelle index.html und die vier Projektdokumente kontrolliert in den Repository-Stand übernehmen.
- AGENTS.md an der Repository-Wurzel platzieren.
- Entwicklungscode, auslieferbare HTML und Prüfdateien nachvollziehbar anordnen. Bestehende Buildpfade bei einer Umordnung gezielt aktualisieren.
- Temporäre Browserprofile, erzeugte Testseiten und Zwischenstände vom Versionsverlauf ausschließen.
- Einen überprüfbaren Ausgangscommit mit aktueller Dokumentation erstellen.

Abnahme ist erreicht, wenn ein frischer Checkout die aktuelle HTML erzeugt, die Agentenanweisungen am richtigen Ort liegen und die bekannten Prüfwege dokumentiert sind.

Der Repository-Abgleich und die lokale Übernahme sind erledigt. Die Versionierung erfolgt als lokaler Ausgangscommit. Ein Push oder Pages-Deployment gehört zur späteren Veröffentlichungsphase.

### Phase 2 – Die Prüfungen verlässlich wiederholbar machen

Priorität ist hoch und baut auf dem gesicherten Ausgangsstand auf.

- Erfolgreichen Gesamtlauf und die sechs heute verwendeten Zusatzprüfungen als Baseline festhalten.
- Prüflauf übersichtlich in Spielregeln, Module/Export, Audio und Grafik aufteilen.
- Edge-Pfad und gegebenenfalls Browserwahl konfigurierbar machen.
- Browserprofile und temporäre Ausgaben eindeutig dem jeweiligen Prüflauf zuordnen.
- Aussagekräftige Zeitlimits und Fehlermeldungen für Mikrofon-/Audiofreigaben erhalten.

Abnahme ist erreicht, wenn die beschriebenen Prüfungen aus einem frischen Checkout nachvollziehbar laufen und Fehler einem konkreten Bereich zugeordnet werden können. CI ist eine mögliche spätere Ergänzung, bisher keine Nutzeranforderung.

### Phase 3 – Gezielte Zuverlässigkeitsarbeit

Priorität ist hoch bis mittel. Erst reproduzieren und dann die konkrete Ursache beheben.

| Thema | Nächster Arbeitsschritt | Abnahmekriterium |
| --- | --- | --- |
| Gespeicherte Ansichten | Vorrang einer Gesamtansicht gegenüber späteren Einzeländerungen testen und gewünschtes Verhalten festlegen | Beim Neustart gehen bewusst gespeicherte Änderungen nachvollziehbar auf |
| Geöffnete Einstellungen | Positionsliste der details-Bereiche durch stabile Kennungen ersetzen und ältere Exporte berücksichtigen | Neue oder verschobene Bereiche öffnen nach Restore weiterhin korrekt |
| Hintergrundzeit | Große Zeitlücken über mehrere Freischalt-/Konsequenzschwellen testen | Verhalten ist konsistent und bewertet keine ungemessenen Geräusche |
| Countdown und Mikrofon | Signalton bei offenem Mikrofon auf echter Hardware beobachten | Eigener App-Ton verursacht keine unbeabsichtigte Unterrichtskonsequenz oder wird transparent behandelt |
| Exportumfang | Beide Alters-Konsequenzprofile und fehlende Felder älterer Ansichten gezielt prüfen | Übernommene Einstellungen sind vollständig beschrieben und rückwärtskompatibel |
| Module | Reset, Außenplatzierung, Einklappen und Tastaturbedienung prüfen | Module bleiben erreichbar und der Reset entspricht einer klaren Beschreibung |

Dies sind überwiegend aus dem Code abgeleitete Risiken. Die Bestandsaufnahme hat dafür noch keine neuen reproduzierten Produktfehler bestätigt.

### Phase 4 – Abnahme im Unterrichtskontext

Diese Phase sichert die bestehenden Anforderungen auf den tatsächlichen Geräten ab.

- Mit der konkret eingesetzten interaktiven Tafel bzw. dem Unterrichtsrechner testen.
- Zusätzlich ein tatsächlich verwendetes Mobilgerät prüfen.
- Mikrofonberechtigung, Grundpegel, Tabwechsel, Lautsprecher und Touch-Drag-and-drop über die normalen Bedienelemente testen.
- Einen HTML-Export und einen Ansichtslink auf einem zweiten Gerät öffnen.
- Datenschutz- und Gerätevorgaben der zuständigen Schule klären.

Abnahme ist erreicht, wenn ein kurzes Geräteprotokoll Browser, Betriebssystem, Mikrofon, Lautsprecher und die beobachteten Ergebnisse festhält. Gerätestandby und Browser-Suspendierung bleiben ausdrücklich zu beschreibende Grenzen.

Die Zielgeräte und schulischen Rahmenbedingungen wurden bisher nicht vollständig benannt. Diese Angaben werden vor der realen Geräteabnahme benötigt.

### Phase 5 – Grafikfeinschliff und kontrollierte Veröffentlichung

- Weltstufen, Flugbahnen, Straßen, Flüsse und frei platzierte Module auf den Zielauflösungen visuell kontrollieren.
- Besonders Aquarium als gestalterische Referenz sowie die zuletzt kritisierten Fantasy- und Stadtbereiche beachten.
- Erst nach lokalem und gerätebezogenem Prüfergebnis eine Veröffentlichung des maßgeblichen Stands durchführen.
- Die tatsächlich veröffentlichte GitHub-Pages-Seite nach dem Deployment prüfen.

Abnahme ist erreicht, wenn freigegebene Quelle, gebaute Datei und geprüfte Live-Version zusammengehören. Eine weitere Versionsnummer wird bewusst festgelegt. Dafür existiert bislang keine Nutzerentscheidung.

Zusätzliche Funktionen aus der Ideenliste erst anschließend nach Nutzerpriorität auswählen.

## Verbindlich beschlossen und bereits umgesetzt

Diese Anforderungen gelten weiter und sind bei jeder Weiterentwicklung zu erhalten.

- Fünf lebendige Spielwelten mit Cartoon-/Pixel-Art-Unterscheidung.
- Lokale Mikrofonmessung, Ampel, Rundenzeit, Punktesystem und sichtbarer Fortschritt.
- Abschaltbares Konsequenzmodul mit Vorgaben 5 Sekunden Rot, mittlere Stärke und 20 Sekunden Schutzpause.
- Aufgabenfeld, unabhängiger Countdown und ausklappbare Einstellungen.
- Pfeile zum Einklappen, Drag-and-drop zum Verschieben innerhalb und außerhalb der Spielwelt.
- Modulare Sichtbarkeit und anpassbare Schrift.
- Vollständige Ansichten speichern, als eigenständige HTML exportieren und online per Ansichtslink aufrufen.
- Weiterlaufen bei Tabwechsel.
- Neutraler Modus, dezenter neutraler Bildschirmschoner und eigene Lavalampe.
- Manuelle Vorschau aller zwölf Freischaltungen je Spielwelt.
- Bauhaus-Stadt und überarbeitete übrige Welten.
- Bereinigte Fantasy-Überlappungen, Fluss mit Talbezug und freigelegte Stadtstraße.
- Raketen-Lavalampe mit zähem bis flüssigem Wachsfluss und Lautstärkefarbe.
- Kurzer Signalton beim Ablauf des Aufgaben-Countdowns.
- Allgemein frei verschiebbare und skalierbare Module in der normalen Ansicht, einschließlich Platzierung über dem Hauptscreen.
- Eigenständiges Tafel-Teilmodul für Freitext, Zeichnungen und lokale Fotos.
- Magnetisches Andocken gleich großer Module an den Außenkanten und direkt bearbeitbare Textfelder innerhalb der Tafel.

Es ist keine eindeutig noch unimplementierte, ausdrücklich beschlossene neue Produktfunktion aus dem bisherigen Verlauf bekannt. Die Umsetzung der genannten Anforderungen hat technische Grenzen und noch offene Prüfungen, die in PROJECT.md beschrieben sind.

## Verbindliche Qualitätsziele mit weiterer Prüfung

Diese Punkte ergeben sich aus bereits bestehenden Nutzeranforderungen. Sie sind keine Zusage, Browser- oder Betriebssystemgrenzen technisch vollständig aufheben zu können.

| Priorität | Aufgabe | Erkennbares Ergebnis |
| --- | --- | --- |
| Hoch | Hintergrundbetrieb auf den tatsächlich eingesetzten Geräten prüfen | Timer laufen beim Tabwechsel korrekt, Mikrofonunterbrechungen sind erkennbar, fehlende Messungen erzeugen keine erfundenen Bewertungen |
| Hoch | Countdown-Signal auf realer Unterrichtshardware prüfen | Nach bewusstem Start ertönt einmalig der Ton, Stummschaltung und Pause funktionieren |
| Hoch | Drag-and-drop mit Touch prüfen | Module lassen sich auf Mobilgerät und Tafel zuverlässig ein-/auslagern und bleiben erreichbar |
| Hoch | Neueste Gesamtversion im Zielbrowser testen | Mikrofon → Ampel → Spielrunde → Fortschritt → Konsequenz funktioniert über die normalen Bedienelemente |
| Mittel | Visuelle Abnahme aller fünf Welten auf Zielauflösungen | Keine unbeabsichtigten Objekt-, Straßen- oder Flugbahnüberlappungen in allen zwölf Stufen |
| Mittel | Export und Link auf einem zweiten echten Gerät prüfen | Aufgabe, Schrift, Module, Vorschau, Tonoption und pausierte Zeiten werden korrekt übernommen |
| Mittel | Rückwärtskompatibilität alter exportierter Ansichten prüfen | Fehlende neuere Einstellungen erhalten sinnvolle Standards |

## Technische Prüfliste aus dem aktuellen Code

Diese Aufgaben sind als Wartungskandidaten dokumentiert. Umfang und Reihenfolge sollten sich nach dem nächsten Auftrag und reproduzierten Fehlern richten.

- Vor einem späteren Update erneut prüfen, ob GitHub-main seit dem bestätigten Abgleich vom 26.11.2026 geändert wurde.
- Erledigte Phase 1 beibehalten. Neue Dateien entsprechend der Struktur src/scripts/tests einordnen und erzeugte Testdaten weiterhin ausschließen.
- Die Bedeutung von „Positionen zurücksetzen“ bei außerhalb platzierten oder eingeklappten Modulen klären.
- Neue Ansichten verwenden seit dem Tafelmodus zusätzlich Kennungen für offene Details-Bereiche. Die Wiederherstellung sehr alter Exporte weiter prüfen.
- Prüfen, wie eine gespeicherte Gesamtansicht und später einzeln geänderte Einstellungen beim nächsten Laden zusammenwirken sollen.
- Nachgeholte große Zeitintervalle für mehrere Freischaltungen und Konsequenzen testen.
- Prüfen, ob der Countdown-Ton vom offenen Mikrofon erfasst wird und dadurch unerwünschte Spielkonsequenzen entstehen.
- Datenspeicher- und Exportumfang für beide Alters-Konsequenzprofile prüfen.
- Die numerische Anzeige „Entdeckungen“ nach zwölf dauerhaften Stufen verständlich halten.
- Einen Tastaturweg zum Platzieren außerhalb der Welt erwägen, da bisher nur die Bewegung innerhalb per Pfeiltasten möglich ist.
- Den historischen Gesamttest auf den aktuellen Stand bringen und die gezielten Prüfmodi klar trennbar halten.
- Browserpfad, temporäre Profile und eventuelle Aufräumarbeiten des Prüfharness portabler machen.

## Datenschutz und Veröffentlichung

Offen ist die konkrete schulische Einordnung. Bundesland, zuständige Schule, genehmigtes Gerät, Hosting und verantwortliche Datenschutzstelle wurden nicht abschließend genannt.

Vor einer behaupteten schulischen Freigabe sind diese Angaben und die tatsächlichen Datenflüsse im vorgesehenen Betrieb zu prüfen. Die bisherige Codeprüfung ersetzt diese Freigabe nicht.

Der Nutzer hat bislang keine eigene Datenschutzerklärung, ein Löschkonzept oder einen bestimmten Hostinganbieter außerhalb des bestehenden GitHub-Pages-Wegs verbindlich beauftragt.

GitHub-main enthält am 26.11.2026 eine ältere HTML. Die neueste lokale Ausgabe wurde dort nicht gefunden. Die Pages-Konfiguration und Live-Seite wurden nicht geprüft. Deployment bleibt eine gesondert zu überprüfende Tätigkeit.

## Unverbindliche Ideen

Die folgenden Möglichkeiten sind Vorschläge für spätere Entscheidungen und bisher keine beauftragten Funktionen.

- Ein eigener Knopf zum vollständigen Löschen lokaler Aufgaben, Ansichten und Profile.
- Benannte Ansichtsvorlagen für mehrere Unterrichtsphasen.
- Weitere dauerhafte Ausbaustufen nach den vorhandenen zwölf.
- Zusätzliche Auswahl für Signalton oder Lautstärke des Countdowns.
- Ein eigener Lavalampe-Bildschirmschoner.
- Import einer separat gespeicherten Konfigurationsdatei.
- Automatische Kollisionshinweise für frei platzierte Aufgaben- und Uhrmodule.
- Eine verständlichere Trennung zwischen aktivem Spielfortschritt und ruhigen Ansichten.

Geräteübergreifende Live-Synchronisierung, Schülerkonten, Cloudspeicherung, Multiplayer, Benotung oder individuelle Verhaltensprofile wurden nicht als Ziele festgelegt. Solche Funktionen würden neue fachliche und datenschutzrechtliche Entscheidungen erfordern.

## Langfristige Richtung

Aus dem bisherigen Nutzerfeedback ergibt sich als gemeinsames Ziel eine optisch ausgereifte, zuverlässige und ruhig bedienbare Unterrichts-App. Die Bauhaus-Stadt und das Aquarium sind akzeptierte gestalterische Referenzen. Auch bei weiteren Erweiterungen sollen die Welten zusammenhängend wirken, die Bedienung modular bleiben und die Übertragung als eigenständige HTML möglich sein.

Eine nächste Versionsnummer, feste Veröffentlichungstermine, Budget, Lizenz, verbindliche Browser-Mindestversionen oder ein Migrationsplan zu einem Framework wurden nicht beschlossen.

## Nicht erneut vorschlagen

- Die entfernte Screenshot-/PNG-Galerie als Lösung für den Ansichtsexport.
- Textkacheln zum Einklappen oder Heraussetzen von Aufgabe und Uhr.
- Automatische Tabwechsel-Pause als Standard.
- Reine Emojireihen oder unverbundene Objektansammlungen als fertige Spielwelt.
- Die alte flächige Blasenanimation anstelle der gewünschten Raketen-Lavalampe.
- Eine hintere Stadtquerstraße ohne kollisionsfreien Entwurf.
- Einen separaten Tafelmodus. Dieser Ansatz wurde ausdrücklich korrigiert und durch allgemeine Modulbedienung plus Tafel-Teilmodul ersetzt.
- Pauschale Aussagen über eine bereits vorliegende Datenschutzfreigabe oder eine bereits erfolgte Veröffentlichung.
