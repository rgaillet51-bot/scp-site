const PLACEHOLDER_TXT = "Visuel classifié — Niveau 4 requis";

let currentFilter = "all";
let currentQuery = "";

const grid = document.getElementById("grid");
const searchInput = document.getElementById("search");
const overlay = document.getElementById("modal-overlay");
const modalBody = document.getElementById("modal-body");

function threatDots(level) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= level ? "on" : ""}">■</span>`;
  }
  return html;
}

function placeholderHTML(scp) {
  return `
    <div class="placeholder">
      <div class="scpnum">${scp.id}</div>
      <div class="txt">${PLACEHOLDER_TXT}</div>
    </div>`;
}

function imgHTML(scp) {
  if (!scp.image) return placeholderHTML(scp);
  return `<img src="${scp.image}" alt="${scp.id} — ${scp.nom}" loading="lazy"
    data-fallback-id="${scp.id}">`;
}

document.addEventListener("error", e => {
  const img = e.target;
  if (img.tagName !== "IMG" || !img.dataset.fallbackId) return;
  const scp = SCP_DATA.find(s => s.id === img.dataset.fallbackId);
  if (scp) img.outerHTML = placeholderHTML(scp);
}, true);

function render() {
  const q = currentQuery.trim().toLowerCase();
  const list = SCP_DATA.filter(scp => {
    const matchClass = currentFilter === "all" || scp.classe === currentFilter;
    const matchQuery = !q
      || scp.id.toLowerCase().includes(q)
      || scp.nom.toLowerCase().includes(q)
      || scp.description.toLowerCase().includes(q);
    return matchClass && matchQuery;
  });

  if (!list.length) {
    grid.innerHTML = `<div class="empty">AUCUN DOCUMENT CORRESPONDANT — REFORMULEZ VOTRE REQUÊTE</div>`;
    return;
  }

  grid.innerHTML = list.map(scp => `
    <article class="card" data-id="${scp.id}">
      <div class="card-img">${imgHTML(scp)}</div>
      <div class="card-body">
        <div class="card-id">${scp.id}</div>
        <div class="card-name">${scp.nom}</div>
        <div class="card-desc">${scp.description.replace(/<[^>]*>/g, "")}</div>
        <div class="card-foot">
          <span class="badge ${scp.classe}">${scp.classe}</span>
          <span class="threat" title="Niveau de menace">${threatDots(scp.menace)}</span>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => openModal(card.dataset.id));
  });
}

function openModal(id) {
  const scp = SCP_DATA.find(s => s.id === id);
  if (!scp) return;

  modalBody.innerHTML = `
    <div class="doc-title">
      <span class="id">${scp.id}</span>
      <span class="nom">${scp.nom}</span>
    </div>
    <div class="doc-meta">
      <span class="meta-chip classe ${scp.classe}">Classe : ${scp.classe}</span>
      <span class="meta-chip">Site : ${scp.site}</span>
      <span class="meta-chip">Menace : ${threatDots(scp.menace)}</span>
    </div>
    <figure class="doc-img">
      ${imgHTML(scp)}
      <figcaption>${scp.legende}</figcaption>
    </figure>
    <div class="doc-section">
      <h3>Procédures Spéciales de Confinement</h3>
      <p>${scp.procedures}</p>
    </div>
    <div class="doc-section">
      <h3>Description</h3>
      <p>${scp.description}</p>
    </div>
    <div class="doc-section addendum">
      <h3>Addendum</h3>
      <p>${scp.addendum}</p>
    </div>
    <div class="doc-source">
      Source : <a href="https://scp-wiki.wikidot.com/${scp.id.toLowerCase()}" target="_blank" rel="noopener">page officielle de ${scp.id} sur le Wiki SCP</a> — CC BY-SA 3.0
    </div>
  `;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  overlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("modal-close").addEventListener("click", closeModal);
overlay.addEventListener("click", e => {
  if (e.target === overlay) closeModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

searchInput.addEventListener("input", e => {
  currentQuery = e.target.value;
  render();
});

document.getElementById("filters").addEventListener("click", e => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.classe;
  render();
});

document.getElementById("stat-objets").textContent = SCP_DATA.length;
document.getElementById("stat-keter").textContent = SCP_DATA.filter(s => s.classe === "Keter").length;
document.getElementById("stat-sites").textContent = new Set(SCP_DATA.map(s => s.site)).size;

render();
