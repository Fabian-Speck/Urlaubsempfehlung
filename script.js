fetch('urlaubsziele.json')
  .then(response => response.json())
  .then(data => {
    // Verarbeite die geladenen JSON-Daten
    const urlaubsziele = data.urlaubziele;
    console.log(urlaubsziele); // Hier kannst du die Ziele verarbeiten
  });