document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("urlaubsForm");

  // Funktion zum Laden der Auswahl aus dem Local Storage
  function loadSelections() {
    // Budget, Dauer, Personen, Kinder laden
    document.getElementById("budget").value =
      localStorage.getItem("budget") || "";
    document.getElementById("dauer").value =
      localStorage.getItem("dauer") || "";
    document.getElementById("personen").value =
      localStorage.getItem("personen") || "";
    document.getElementById("kinder").value =
      localStorage.getItem("kinder") || "";

    // Reisearten-Checkboxen laden
    const reisearten = JSON.parse(localStorage.getItem("reisearten")) || [];
    reisearten.forEach((art) => {
      const checkbox = document.querySelector(
        `#reiseart input[value="${art}"]`
      );
      if (checkbox) checkbox.checked = true;
    });

    // Klima-Checkboxen laden
    const klimas = JSON.parse(localStorage.getItem("klimas")) || [];
    klimas.forEach((klima) => {
      const checkbox = document.querySelector(`#klima input[value="${klima}"]`);
      if (checkbox) checkbox.checked = true;
    });

    // Sicherheit-Radio-Button laden
    const sicherheit = localStorage.getItem("sicherheit");
    if (sicherheit) {
      const radioButton = document.querySelector(
        `#sicherheit input[value="${sicherheit}"]`
      );
      if (radioButton) radioButton.checked = true;
    }
  }

  // Funktion zum Speichern der Auswahl in den Local Storage
  function saveSelections() {
    // Eingabewerte der Felder speichern
    localStorage.setItem("budget", document.getElementById("budget").value);
    localStorage.setItem("dauer", document.getElementById("dauer").value);
    localStorage.setItem("personen", document.getElementById("personen").value);
    localStorage.setItem("kinder", document.getElementById("kinder").value);

    // Reisearten-Checkboxen speichern
    const selectedReisearten = Array.from(
      document.querySelectorAll("#reiseart input:checked")
    ).map((input) => input.value);
    localStorage.setItem("reisearten", JSON.stringify(selectedReisearten));

    // Klima-Checkboxen speichern
    const selectedKlimas = Array.from(
      document.querySelectorAll("#klima input:checked")
    ).map((input) => input.value);
    localStorage.setItem("klimas", JSON.stringify(selectedKlimas));

    // Sicherheit-Radio-Button speichern
    const selectedSicherheit = document.querySelector(
      'input[name="sicherheit"]:checked'
    );
    if (selectedSicherheit) {
      localStorage.setItem("sicherheit", selectedSicherheit.value);
    }
  }

  // Event-Listener zum Speichern der Auswahl bei jeder Änderung im Formular
  form.addEventListener("input", saveSelections);

  // Event-Listener für das Formular-Submit, der das Standardverhalten unterdrückt
  form.addEventListener("submit", function (e) {
    e.preventDefault();


    // Eingaben sammeln und in Zahlen umwandeln
    const budget = parseInt(document.getElementById("budget").value);
    const dauer = parseInt(document.getElementById("dauer").value);
    const personen = parseInt(document.getElementById("personen").value);
    const kinder = parseInt(document.getElementById("kinder").value);

    // Reisearten und Klima sammeln
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

    // Sicherstellen, dass mindestens eine Reiseart und ein Klima ausgewählt sind
    if (reisearten.length === 0) {
      alert("Bitte wählen Sie mindestens eine Reiseart aus.");
      return; 
    }

    if (klimas.length === 0) {
      alert("Bitte wählen Sie mindestens ein Klima aus.");
      return; 
    }

    // Urlaubsziele aus JSON laden
    fetch("urlaubsziele.json")
      .then((response) => response.json())
      .then((data) => {
        const urlaubsziele = data.urlaubsziele;

        // Filtern nach harten Kriterien: Budget, Sicherheit und Reisedauer
        const passendeZiele = urlaubsziele.filter((ziel) => {
          return (
            ziel.budget <= budget &&
            (ziel.sicherheit === sicherheit || sicherheit === "egal") &&
            Math.abs(ziel.dauer - dauer) <= 2
          );
        });

        // Sortieren nach Übereinstimmung mit weichen Kriterien (Klima und Reiseart)
        const bewerteteZiele = passendeZiele.map((ziel) => {
          let punkte = 0;

          // Übereinstimmende Reisearten-Punkte
          if (reisearten.length > 0) {
            const matchingReisearten = reisearten.filter((art) =>
              ziel.reisearten.includes(art)
            );
            punkte += matchingReisearten.length;
          }

          // Übereinstimmendes Klima
          if (klimas.length > 0 && klimas.includes(ziel.klima)) {
            punkte += 1;
          }

          return { ziel, punkte };
        });

        // Ziel mit den meisten Punkten zuerst
        bewerteteZiele.sort((a, b) => b.punkte - a.punkte);

        // Ausgabe des besten Ziels in der Konsole und Popup, ansonsten Default-Wert Balkonien
        if (bewerteteZiele.length > 0) {
          const bestesZiel = bewerteteZiele[0].ziel;
          const resultMessage = `Wir empfehlen ${bestesZiel.name}:\n${bestesZiel.beschreibung}`;

          console.log(resultMessage); 
          alert(resultMessage); 
        } else {
          const noMatchMessage =
            "Wir empfehlen Balkonien: \nErkunde deine Umgebung"; 
          console.log(noMatchMessage);
          alert(noMatchMessage);
        }

        // Eingabefelder zurücksetzen wenn Empfehlung fertig
        form.reset();

        // Local Storage leeren wenn Empfehlung fertig
        localStorage.removeItem("budget");
        localStorage.removeItem("dauer");
        localStorage.removeItem("personen");
        localStorage.removeItem("kinder");
        localStorage.removeItem("reisearten");
        localStorage.removeItem("klimas");
        localStorage.removeItem("sicherheit");
      })
      .catch((error) => {
        console.error("Fehler beim Laden der Urlaubsziele:", error);
        alert("Fehler beim Laden der Urlaubsziele");
      });
  });

  // Initialer Aufruf zum Laden der gespeicherten Auswahl beim Seitenstart
  loadSelections();
});
