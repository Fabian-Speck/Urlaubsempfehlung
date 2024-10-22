document.getElementById("urlaubsForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Verhindert das normale Abschicken des Formulars

  // Eingaben sammeln
  const budget = document.getElementById("budget").value;
  const dauer = document.getElementById("dauer").value;
  const personen = document.getElementById("personen").value;
  const kinder = document.getElementById("kinder").value;

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

      // Filtern nach Budget, Klima, Sicherheit und Reisearten
      const passendeZiele = urlaubsziele.filter((ziel) => {
        return (
          ziel.budget <= budget &&
          klimas.includes(ziel.klima) &&
          reisearten.some((art) => ziel.reisearten.includes(art)) &&
          (ziel.sicherheit === sicherheit || sicherheit === "egal")
        );
      });

      // Wenn es passende Ziele gibt, zeige das am besten passende Ziel
      if (passendeZiele.length > 0) {
        const bestesZiel = passendeZiele[0]; // Das erste passende Ziel anzeigen
        document.getElementById(
          "ergebnis"
        ).innerHTML = `<h2>Wir empfehlen: ${bestesZiel.name}</h2>
          <p>Beschreibung: ${bestesZiel.beschreibung}</p>`;
      } else {
        document.getElementById("ergebnis").innerHTML =
          "<h2>Keine passenden Urlaubsziele gefunden</h2>";
      }
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Urlaubsziele:", error);
    });
});
