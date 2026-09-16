# Wordle für Freunde

Eine Version von Wordle zum Spielen mit Freunden. Statt eines zufälligen Tageswortes denkt sich ein Spieler ein Geheimwort aus und lässt es von einem Freund erraten.

## Wie es funktionieren soll

Ein Spieler, der Setter, gibt ein fünfbuchstabiges Wort ein. Das Wort wird gegen eine Wortliste geprüft, damit nur echte Wörter erlaubt sind. Danach erstellt die App einen Link, in dem das Wort kodiert steckt. Diesen Link schickt der Setter an einen Freund, den Guesser.

Öffnet der Guesser den Link, sieht er ein klassisches Wordle Spielbrett mit sechs Versuchen. Jeder Rateversuch wird ebenfalls gegen die Wortliste geprüft und danach mit dem Geheimwort verglichen. Richtige Buchstaben an der richtigen Stelle werden grün markiert, richtige Buchstaben an der falschen Stelle gelb, und Buchstaben, die nicht im Wort vorkommen, grau.

Ist eine Runde vorbei, ob gewonnen oder verloren, wird das Ergebnis gespeichert. Öffnet der Guesser denselben Link erneut, sieht er direkt das aufgelöste Wort statt eines neuen Versuchs. Über einen Button kann dann eine neue Runde mit einem neuen Geheimwort gestartet werden.

Zusätzlich sammelt die App lokal im Browser einfache Statistiken wie Anzahl gespielter Runden, Siege, aktuelle Serie und wie viele Versuche im Schnitt gebraucht wurden.

## Technischer Ansatz

Das Projekt läuft komplett im Browser, ohne eigenen Server, damit es kostenlos bleibt und einfach gehostet werden kann. Das Geheimwort wird nicht an einen Server geschickt, sondern direkt im Link kodiert. Wer technisch versiert genug ist, könnte den Link entschlüsseln und das Wort vorab sehen. Für ein Spiel unter Freunden ist das ein bewusst akzeptierter Kompromiss.

Statistiken werden aktuell nur lokal im Browser des jeweiligen Spielers gespeichert, es gibt also noch keine geteilte Bestenliste zwischen mehreren Freunden. Das kann ein möglicher nächster Ausbauschritt sein.
