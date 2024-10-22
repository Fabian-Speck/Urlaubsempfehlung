document.getElementById("urlaubsForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Verhindert das normale Abschicken des Formulars

  // Eingaben sammeln und in Zahlen umwandeln
  const budget = parseInt(document.getElementById("budget").value);
  const dauer = parseInt(document.getElementById("dauer").value);
  const personen = parseInt(document.getElementById("personen").value);
  const kinder = parseInt(document.getElementById("kinder").value);

  // Reisearten und Klima sammeln (Checkboxen)
  const reisearten = Array.from(
    document.querySelectorAll("#reiseart input:checked")
  ).map((input) => input.value);
  const klimas = Array.from(
    document.querySelectorAll("#klima input:checked")
  ).map((input) => input.value);

  // Sicherheit
  const sicherheit = document.querySelector(
    'input[name="sicherheit"]:checked'
  ).value;

  // Urlaubsziele aus JSON laden
  fetch("urlaubsziele.json")
    .then((response) => response.json())
    .then((data) => {
      const urlaubsziele = data.urlaubsziele;

      // Filtern nach harten Kriterien: Budget, Sicherheit, und Reisedauer (+- 2 Tage)
      const passendeZiele = urlaubsziele.filter((ziel) => {
        return (
          ziel.budget <= budget &&
          (ziel.sicherheit === sicherheit || sicherheit === "egal") &&
          Math.abs(ziel.dauer - dauer) <= 2
        );
      });

      // Debugging-Informationen für passende Ziele
      console.log("Passende Ziele:", passendeZiele);

      // Sortieren nach wie gut die weichen Kriterien (Klima und Reiseart) erfüllt sind
      const bewerteteZiele = passendeZiele.map((ziel) => {
        // Punkte für passende Reisearten
        let punkte = 0;

        // Überprüfen, wie viele der gewünschten Reisearten übereinstimmen
        if (reisearten.length > 0) {
          const matchingReisearten = reisearten.filter((art) =>
            ziel.reisearten.includes(art)
          );
          punkte += matchingReisearten.length; // Punkte für jede übereinstimmende Reiseart
        }

        // Punkte für passendes Klima
        if (klimas.length > 0 && klimas.includes(ziel.klima)) {
          punkte += 1; // 1 Punkt, wenn das Klima übereinstimmt
        }

        return { ziel, punkte };
      });

      // Ziele sortieren: Die mit den meisten Punkten zuerst
      bewerteteZiele.sort((a, b) => b.punkte - a.punkte);

      // Ausgabe des besten Ziels
      if (bewerteteZiele.length > 0) {
        const bestesZiel = bewerteteZiele[0].ziel; // Das Ziel mit den meisten Punkten anzeigen
        document.getElementById("ergebnis").innerHTML = `
          <h2>Wir empfehlen: ${bestesZiel.name}</h2>
          <p>Beschreibung: ${bestesZiel.beschreibung}</p>`;
      } else {
        document.getElementById("ergebnis").innerHTML =
          "<h2>Keine passenden Urlaubsziele gefunden</h2>";
      }
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Urlaubsziele:", error);
      document.getElementById("ergebnis").innerHTML =
        "<h2>Fehler beim Laden der Urlaubsziele</h2>";
    });
});
