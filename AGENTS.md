# Entwicklungsanweisungen für KlassenAmpel

Diese Datei übergibt die vom Nutzer festgelegten Projektanforderungen. Stand ist der 27. November 2026. Sie ist zusammen mit README.md, PROJECT.md und ROADMAP.md zu lesen.

Diese Datei liegt seit der Zusammenführung am 26. November 2026 an der Repository-Wurzel. Das lokale Repository ist im bisherigen Arbeitsverzeichnis unter `work/klassenampel/` zu finden. Die Fassung in `outputs/` ist eine Dokumentkopie.

## Verbindliche Produktvorgaben

1. Die Anwendung und die Kommunikation mit dem Nutzer sind deutschsprachig und verständlich zu halten.
2. Mikrofonmessung und Ampel sind Kernfunktionen. Grafikänderungen müssen die funktionierende Messung erhalten.
3. Die fünf Spielwelten Aquarium, Städtebau, Weltraum, Fantasy und Natur müssen erhalten bleiben.
4. Grundschule und Berufskolleg verwenden dieselbe Spielmechanik. Grundschule erhält eine freundliche Cartoon-Darstellung, Berufskolleg Pixel-Art.
5. Neutraler Modus und Raketen-Lavalampe ergänzen die Spielwelten. Der Bildschirmschoner ist ausschließlich innerhalb des gewählten neutralen Modus aktivierbar und besitzt keinen eigenen Menüpunkt.
6. Grün bringt während einer laufenden Runde einen Punkt pro Sekunde. Alle 30 Punkte entsteht Fortschritt. Gelb und Rot pausieren die Punktevergabe.
7. Das optionale Konsequenzmodul bleibt abschaltbar und konfigurierbar. Vorgabe sind fünf Sekunden durchgehend Rot, mittlere Stärke und 20 Sekunden Schutzpause.
8. Spielwelt-Rückschritt, Punktabzug und Rückgängigmachen müssen konsistent bleiben. Bestehende Speicherstände und Strafprofile berücksichtigen.
9. Aufgabenfeld und Countdown müssen einzeln ein-/ausblendbar, einklappbar und innerhalb oder außerhalb der Spielwelt platzierbar sein.
10. Einklappen erfolgt über einen Pfeil. Positionierung und Wechsel nach außen erfolgen per Drag-and-drop. Die kleinen Griffe benötigen zugängliche Namen.
11. Einstellungen sind ausklappbar. Das Layout soll möglichst modular bleiben.
12. Schriftart und Größen für Oberfläche, Aufgabe und Uhr sind anpassbar und Teil der übertragbaren Ansicht.
13. Countdown und Spielrunde sollen bei einem Tabwechsel weiterlaufen. Vollständige Browser-/Gerätesuspendierung als Plattformgrenze ehrlich benennen.
14. Der Aufgaben-Countdown gibt am Ende einen kurzen Ton aus. Die aktuelle Stummschaltung erhalten.
15. Ganze Ansichten müssen gespeichert, als eigenständige HTML exportiert und nach Veröffentlichung per Link auf anderen Geräten geöffnet werden können.
16. Freischaltungen müssen manuell als Vorschau angezeigt werden können. Die Vorschau darf den wirklichen Spielstand nicht verändern.
17. Die laufzeitfähige Einzeldatei `index.html` und die Nutzbarkeit über GitHub Pages erhalten.
18. Version 0.5.0 hat fünf bewegliche Arbeitsmodule: Spielwelt, Lautstärkeampel, Aufgabe, Countdown und Tafel. Spielanzeige, Fortschritt und Rundensteuerung bleiben im Spielmodul. Einstellungen bleiben im zentralen Menü. Ein separater Tafelmodus ist verworfen. Tafeltext, Zeichnungen und lokale Fotos einschließlich Export erhalten.
19. Magnetische Außenkanten ausrichten und Beziehungen beim Verschieben erhalten. Oben/unten passende Breiten, seitlich inhaltsgerechte Höhen verwenden. Keine unnötigen Leerhöhen durch erzwungene Höhenangleichung. Tafeltext bleibt in direkt bearbeitbaren Textfeldern auf der Zeichenfläche.
20. „Automatisch anordnen“ verschiebt nur ganze fachliche Gruppen, niemals einzelne Statusanzeigen oder Einstellungen. Bewusst in der Spielszene eingebettete Module mitführen; keine automatische Gruppierung allein aus zufälliger Überdeckung. Keine sichtbaren leeren Platzhalter. Aufklappen im Menü darf die Unterrichtsansicht nicht umordnen.
21. Tafelobjekte einzeln löschbar und Änderungen rückgängig halten. Eingefügte Fotos unabhängig von der Tafel proportional skalierbar halten. Hintergrundtransparenz je Modul und Transparenz je Tafelobjekt einschließlich Speicherung und Export erhalten.
22. Der Nutzer hat Version 0.5.0 beauftragt. Die zuvor vorgeschlagene Bezeichnung 0.5.0-dev.1 ist damit ersetzt. Neue Versionsnummer sichtbar und im Ansichtsexport führen; alte 0.4-Ansichten auf die fünf Gruppen migrieren. Farben, Fixierung, Sichtbarkeit und Layoutvorlagen gehören zur gespeicherten Ansicht.

23. Benannte Ansichten direkt auf der Seite speichern, öffnen und verwalten können. Vorhandene einzelne Speicherung übernehmen; Tafel-Fotos, Layout und Einstellungen erhalten. Beim Öffnen Zeiten pausieren und die vorherige Arbeitsfläche über Rückgängig erreichbar halten. Die lokale Sammlung nicht ungefragt in HTML-Exporte oder Links aufnehmen.

24. Version 0.5.2 ergänzt ±1 Minute ohne Neustart/Pause, Zeitvorgaben, abschaltbare visuelle Restzeit, sichtbare Arbeitsform und einen optionalen aufklappbaren Zusatzauftrag „Fertig? Dann …“. Diese Elemente innerhalb der bestehenden Aufgabe/Uhr halten und in allen Speicherwegen berücksichtigen.

25. Version 0.5.3: Direkter Tausch von Tafel/Spielwelt in der stets erreichbaren Kopfzeile, ohne Einstellungen und ohne Zeitpause. Arbeitsform per Klick wechseln. Textformatierung, Pinsel, nachträgliche Objektgrößen und echte Ebenen für Text/Bilder/Striche erhalten. PDF-Seiten lokal einfügen; PDF.js samt Lizenz für offline nutzbare Einzeldateien einbetten.

Neue eigenständige Module mit einer stabilen data-board-Kennung für die allgemeine Modulbedienung registrieren. Der frei positionierte Hauptscreen bleibt auf der Hintergrundebene, damit überlagerte Module beim Verschieben erreichbar bleiben.

## Gestaltung und Nutzerpräferenzen

- Der Nutzer bevorzugt klare, zusammenhängende Szenen mit räumlicher Tiefe und sichtbarer Entwicklung.
- Die überarbeitete Bauhaus-Stadt wurde ausdrücklich als deutlich besser bewertet. Flachdächer, Fensterbänder, räumliche Fassaden, Cremeweiß, Rot, Blau und Ocker bilden dafür die akzeptierte Richtung.
- Das Aquarium war unter den bisherigen Welten am besten bewertet. Seine ruhigen Farben, schwimmenden Tiere, Lichtstrahlen und das zusammenhängende Riff sind eine wichtige Referenz.
- Gebäude, Landschaft und Bewegungsbahnen müssen räumlich zueinander passen. Flüsse brauchen nachvollziehbare Quellen und Talverläufe.
- Straßen müssen zwischen den Gebäuden erkennbar und frei bleiben. Statusanzeigen dürfen die Fahrbahn nicht verdecken.
- Prüfe alle Ausbaustufen und bewegte Figuren. Die maximale Stufe allein genügt für eine Kollisionsprüfung nicht.
- Große Weltüberschriften innerhalb der Szene sind unerwünscht. Der Nutzer verlangte insbesondere die Entfernung von „Aquarium“ aus der Spielwelt.
- Wenige notwendige Bedienelemente und kompakte Symbole bevorzugen. Bei Aufgabe und Uhr sind Textkacheln zum Einklappen oder Heraussetzen ausdrücklich verworfen.
- Die Lavalampe soll wie eine klassische alte Lampe mit Raketenform wirken. Metallspitze, Glas, Standfuß und langsam wechselnd zäher/flüssiger Wachsfluss sind verbindlich. Die Leuchtfarbe folgt der Lautstärkeampel.

## Verworfene Ansätze respektieren

- Die alten Welten aus nebeneinandergestellten Emojis oder isolierten primitiven Objekten nicht erneut als Zielbild verwenden.
- Screenshots und PNG-Galerien lösen den gewünschten Ansichtsexport nicht. Dieser frühere Ansatz wurde vom Nutzer ausdrücklich korrigiert und entfernt.
- „Außerhalb platzieren“ als Textschalter für Module wurde durch direktes Ziehen ersetzt.
- Automatisches Pausieren beim Verlassen des sichtbaren Tabs wurde auf Wunsch entfernt.
- Die ältere flächige Lavablasen-Animation wurde durch die klassische Raketen-Lavalampe ersetzt.
- Fantasy mit überlappenden Kristallen, Pilzhäusern, Burg und Drachenflug wurde beanstandet. Den aktuellen Abstand nicht durch neue Dekoration wieder verlieren.
- Die hintere Querstraße der Stadt wurde nach wiederholter Kritik entfernt. Eine erneute Einführung braucht eine bewusst kollisionsfreie Gestaltung und einen passenden Auftrag.
- Die separate Tafelansicht aus Commit cc6bf7f beruhte auf einem Missverständnis und ist verworfen. Allgemeine Modulbedienung und ein eigenes Tafel-Teilmodul sind die korrigierte Anforderung.

## Arbeitsweise

- Vor Änderungen den aktuellen Code und die Dokumentation lesen. Maßgeblich sind die jüngste Nutzerentscheidung und der tatsächliche Code. Widersprüche offen dokumentieren.
- Die Dateien in `src/` sind die bearbeiteten Quellen. `node scripts/build.cjs` erzeugt daraus die `index.html` an der Repository-Wurzel. Änderungen an der Ausgabe allein würden beim nächsten Build verschwinden.
- Das lokale Repository `work/klassenampel/` enthält seit dem 26.11.2026 den zusammengeführten Entwicklungsstand. Die alten Dateien direkt in `work/` des bisherigen Arbeitsverzeichnisses dienen nur als Vergleichsstand.
- Vor Veröffentlichungen den aktuellen Remote-Stand prüfen. Ein lokaler Commit bedeutet noch keine Veröffentlichung.
- Prüfungen werden mit `node tests/browser-check.cjs` von der Repository-Wurzel gestartet. Erzeugte Profile, Bilder und Testseiten sind ignoriert und gehören nicht in Commits.
- Bestehende Logik und Darstellungshilfen wiederverwenden, Änderungen lesbar halten und unnötige Framework- oder Infrastrukturwechsel vermeiden.
- Bei einer neuen Funktion zuerst passende vorhandene Zustände, Speicherwege und Exportlogik nutzen.
- Neue Einstellungen müssen bei lokalem Speichern, HTML-Export und Ansichtslink geprüft werden. Fehlende Felder älterer Ansichten müssen sinnvolle Standardwerte erhalten.
- Begrenzungen klar benennen. Keine ungeprüften Aussagen zu Datenschutzfreigabe, Veröffentlichung, realer Mikrofonfunktion auf einem bestimmten Schulgerät oder Live-Synchronisierung machen.
- Keine neue Pflicht zu Nutzerkonten, Cloudspeicherung oder persönlichen Schülerdaten einführen.
- Zusätzliche Funktionen in ROADMAP.md als Idee kennzeichnen, solange sie nicht vom Nutzer beschlossen wurden.
- Nach Codeänderungen die HTML neu bauen und die unmittelbar betroffenen normalen Bedienwege testen.
- Für Grafikänderungen visuelle Browserprüfungen durchführen. Cartoon, Pixel-Art, schmale Ansicht, Vollausbau und relevante Animationen berücksichtigen.
- Für Timer, Strafmodul, Ton und Export gezielt Wiederholung, Pause, Reset, Fehlerfälle und Wiederherstellung prüfen.
- Historische Testausgaben sind kein Nachweis, dass ein heute geänderter Stand vollständig geprüft ist.
- Bestehende Dokumentation bei fachlichen Änderungen gezielt aktualisieren. Keine unaufgeforderten umfassenden Umstrukturierungen.

## Abschluss eines Entwicklungsauftrags

- Eine aktuelle, nutzbare HTML bereitstellen.
- Tatsächlich durchgeführte Prüfungen und relevante Grenzen knapp nennen.
- Bei Deployment-Aufträgen den Remote-Stand und das Veröffentlichungsergebnis prüfen.
- Offene Entscheidungen und ungeprüfte Annahmen ausdrücklich kennzeichnen.
- Keine bereits erledigte Funktion erneut als bloßes Angebot stehenlassen.

Diese Vorgaben sind keine pauschale Erlaubnis für irreversible Veröffentlichungen oder die Verarbeitung personenbezogener Schülerdaten. Für solche Schritte gilt der konkrete Nutzerauftrag.
