let correctStructure = {};  // Variabile per contenere la struttura dell'albero

// Funzione per caricare il JSON
function loadTreeStructure() {
  fetch('albero.json')
    .then(response => response.json())
    .then(data => {
      correctStructure = data;  // Salva la struttura dell'albero caricata
      generateTree(correctStructure);  // Crea l'albero visivamente sulla pagina
    })
    .catch(error => console.error('Errore nel caricamento del JSON:', error));
}

// Funzione per generare visivamente l'albero nella pagina
function generateTree(structure, container = document.getElementById('tree-container')) {
  for (let node in structure) {
    const div = document.createElement('div');
    div.classList.add('level');
    div.innerHTML = `<strong>${node}</strong>`;  // Aggiungi il nome del nodo
    container.appendChild(div);

    // Se il nodo ha sotto-nodi (oggetti), crea un albero a livello successivo
    if (Object.keys(structure[node]).length > 0) {
      generateTree(structure[node], div);  // Chiamata ricorsiva per il sotto-albero
    }
  }
}

// Funzione per verificare la struttura dell'albero
function checkTree() {
  let correct = 0;
  let total = 0;

  // Creazione della mappa dei livelli corretti
  const levelMap = {};
  function buildLevelMap(structure, level = 1) {
    for (let node in structure) {
      if (!levelMap[level]) levelMap[level] = [];
      levelMap[level].push(node);
      buildLevelMap(structure[node], level + 1);  // Chiamata ricorsiva per i sotto-nodi
    }
  }

  buildLevelMap(correctStructure);

  // Verifica l'albero costruito dall'utente
  const levels = document.querySelectorAll("#tree-container > div");
  levels.forEach((levelEl, levelIndex) => {
    const userLabels = Array.from(levelEl.children).map(el => el.textContent.trim());
    const expectedLabels = levelMap[levelIndex + 1] || [];  // Aggiungi +1 per allineare l'indice del livello

    total += expectedLabels.length;

    userLabels.forEach(label => {
      const labelEl = Array.from(levelEl.children).find(child => child.textContent.trim() === label);

      if (expectedLabels.includes(label)) {
        correct++;
        labelEl.style.backgroundColor = "lightgreen";
      } else {
        labelEl.style.backgroundColor = "lightblue";
      }
    });
  });

  // Suono di feedback (alta frequenza se corretto, bassa se errato)
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(correct === total ? 880 : 220, context.currentTime);
  oscillator.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.3);

  // Visualizza il riepilogo sotto il bottone
  const summaryElement = document.getElementById("summary");
  summaryElement.textContent = `${correct} su ${total} corretti`;
}

// Funzione per ricaricare la pagina (dopo che si clicca su "Riprova")
function reloadPage() {
  location.reload();
}

// Carica la struttura dell'albero quando la pagina è pronta
window.onload = loadTreeStructure;
