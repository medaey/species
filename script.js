const DEFAULT_SPECIMENS = [
  { id: "ID_005", name: "SPÉCIMEN 005", progress: [2, 4, 1], description: "Déverrouillez l’accès à la salle de spécimen ID_005 et gardez une trace de votre connaissance de l’inconnu." },
  { id: "ID_006", name: "SPÉCIMEN 006", progress: [3, 4, 1], description: "Déverrouillez l’accès à la salle de spécimen ID_006 et gardez une trace de votre connaissance de l’inconnu." },
  { id: "ID_007", name: "SPÉCIMEN 007", progress: [4, 4, 1], description: "Déverrouillez l’accès à la salle de spécimen ID_007 et gardez une trace de votre connaissance de l’inconnu." },
  { id: "ID_008", name: "SPÉCIMEN 008", progress: [4, 4, 1], description: "Déverrouillez l’accès à la salle de spécimen ID_008 et gardez une trace de votre connaissance de l’inconnu." },
  { id: "ID_009", name: "MONSTRE DE CHAIR", progress: [4, 3, 1], description: "Déverrouillez l’accès à la salle de spécimen ID_009 et gardez une trace de votre connaissance de l’inconnu." },
  { id: "ID_010", name: "SPÉCIMEN 010", progress: [1, 2, 0], description: "Déverrouillez l’accès à la salle de spécimen ID_010 et gardez une trace de votre connaissance de l’inconnu." }
];

const STORAGE_KEY = "specimen-zone-v1";
const TASKS = ["Extraire les données du spécimen", "Tuer le spécimen", "Capturer le spécimen"];
const TOTAL_DOTS = [4, 4, 1];

let data = load();
let selected = 4;

const buttonsEl = document.querySelector("#specimenButtons");
const idEl = document.querySelector("#specimenId");
const nameEl = document.querySelector("#specimenName");
const descriptionEl = document.querySelector("#description");
const progressEl = document.querySelector("#progressText");
const tasksEl = document.querySelector("#tasks");
const dialog = document.querySelector("#nameDialog");
const input = document.querySelector("#nameInput");

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved) || saved.length !== DEFAULT_SPECIMENS.length) return structuredClone(DEFAULT_SPECIMENS);
    return saved;
  } catch {
    return structuredClone(DEFAULT_SPECIMENS);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function percentage(item) {
  const done = item.progress.reduce((a, b) => a + b, 0);
  const total = TOTAL_DOTS.reduce((a, b) => a + b, 0);
  return Math.round(done / total * 100);
}

function renderList() {
  buttonsEl.innerHTML = "";
  data.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "specimen-btn" + (index === selected ? " active" : "");
    button.innerHTML = `
      <span class="id">${item.id}</span>
      <span class="name">${escapeHtml(item.name)}</span>
      <span class="pct">${percentage(item)}%</span>
    `;
    button.addEventListener("click", () => {
      selected = index;
      render();
    });
    buttonsEl.appendChild(button);
  });
}

function renderDetails() {
  const item = data[selected];
  idEl.textContent = item.id;
  nameEl.textContent = item.name;
  descriptionEl.textContent = item.description;
  progressEl.textContent = `${percentage(item)}%`;

  tasksEl.innerHTML = TASKS.map((label, taskIndex) => {
    const count = TOTAL_DOTS[taskIndex];
    const done = Math.min(item.progress[taskIndex], count);
    const dots = Array.from({ length: count }, (_, dotIndex) => `
      <button class="dot ${dotIndex < done ? "done" : ""}"
        aria-label="${label} : ${dotIndex + 1}/${count}"
        data-task="${taskIndex}" data-dot="${dotIndex}"></button>
    `).join("");
    return `<div class="task"><span>${label}</span><span class="dots">${dots}</span></div>`;
  }).join("");

  tasksEl.querySelectorAll(".dot").forEach(dot => {
    dot.addEventListener("click", () => {
      const task = Number(dot.dataset.task);
      const clicked = Number(dot.dataset.dot) + 1;
      data[selected].progress[task] = clicked === data[selected].progress[task] ? clicked - 1 : clicked;
      save();
      render();
    });
  });
}

function render() {
  renderList();
  renderDetails();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelector("#editNameBtn").addEventListener("click", () => {
  const item = data[selected];
  document.querySelector("#dialogId").textContent = item.id;
  input.value = item.name;
  dialog.showModal();
  setTimeout(() => input.select(), 0);
});

document.querySelector("#nameForm").addEventListener("submit", event => {
  if (event.submitter?.value !== "save") return;
  const value = input.value.trim();
  if (value) {
    data[selected].name = value.toUpperCase();
    save();
    render();
  }
});

document.querySelector("#resetBtn").addEventListener("click", () => {
  if (!confirm("Réinitialiser tous les noms et la progression ?")) return;
  data = structuredClone(DEFAULT_SPECIMENS);
  save();
  selected = 4;
  render();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !dialog.open) history.back();
});

render();
