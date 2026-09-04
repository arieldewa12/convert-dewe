const gridEl = document.getElementById("grid");
const panelEl = document.getElementById("panel");
const backBtnEl = document.getElementById("back-btn");
const panelIconEl = document.getElementById("panel-icon");
const panelTitleEl = document.getElementById("panel-title");
const panelSubtitleEl = document.getElementById("panel-subtitle");
const dropEl = document.getElementById("drop");
const dropTextEl = document.getElementById("drop-text");
const dropHintEl = document.getElementById("drop-hint");
const fileInputEl = document.getElementById("file-input");
const selectedFileEl = document.getElementById("selected-file");
const selectedFileNameEl = selectedFileEl.querySelector(".name");
const removeFileEl = document.getElementById("remove-file");
const convertBtnEl = document.getElementById("convert-btn");
const statusEl = document.getElementById("status");

let selectedFile = null;
let current = null; // { from, to, label }

const KNOWN_FORMATS = new Set(["jpg", "png", "webp", "heic", "pdf"]);
const chipFor = (ext) => {
  const cls = KNOWN_FORMATS.has(ext) ? `fmt-${ext}` : "fmt-generic";
  return `<span class="fmt-chip ${cls}">${ext.toUpperCase()}</span>`;
};
const badgeFor = (from, to) => `${chipFor(from)}<span class="arrow">&rarr;</span>${chipFor(to)}`;

const FORMAT_CATEGORY = { jpg: "image", png: "image", webp: "image", heic: "image", pdf: "document" };
const CATEGORY_META = {
  image: { icon: "🖼️", label: "Image converters" },
  document: { icon: "📄", label: "Document converters" },
  other: { icon: "📁", label: "Other converters" },
};
const categoryOf = (f) => FORMAT_CATEGORY[f.to] ?? "other";

function setStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = message ? `active ${kind}` : "";
}

async function loadFormats() {
  const res = await fetch("/api/formats");
  const formats = await res.json();
  renderGrid(formats);
}

function renderGrid(formats) {
  gridEl.innerHTML = "";

  const byCategory = new Map();
  for (const f of formats) {
    const cat = categoryOf(f);
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(f);
  }

  const order = ["image", "document", "other"];
  for (const cat of order) {
    const items = byCategory.get(cat);
    if (!items || items.length === 0) continue;

    const meta = CATEGORY_META[cat];
    const section = document.createElement("section");
    section.className = "section";
    section.innerHTML = `<div class="section-title">${meta.icon} ${meta.label}</div>`;

    const grid = document.createElement("div");
    grid.className = "grid";

    for (const f of items) {
      const card = document.createElement("button");
      card.className = "card";
      card.innerHTML = `
        <div class="badge">${badgeFor(f.from, f.to)}</div>
        <div class="title">${f.label}</div>
        <div class="subtitle">.${f.from} to .${f.to}</div>
      `;
      card.addEventListener("click", () => openPanel(f));
      grid.appendChild(card);
    }

    section.appendChild(grid);
    gridEl.appendChild(section);
  }
}

const EXTENSION_ALIASES = { jpeg: "jpg" };

function extOf(filename) {
  const raw = filename.split(".").pop().toLowerCase();
  return EXTENSION_ALIASES[raw] ?? raw;
}

function clearFile() {
  selectedFile = null;
  fileInputEl.value = "";
  selectedFileEl.classList.remove("active");
  convertBtnEl.disabled = true;
}

function openPanel(format) {
  current = format;
  clearFile();
  setStatus("", null);

  panelIconEl.innerHTML = badgeFor(format.from, format.to);
  panelTitleEl.textContent = format.label;
  panelSubtitleEl.textContent = `.${format.from} → .${format.to}`;
  dropTextEl.textContent = "Drop a file here, or click to choose";
  dropHintEl.textContent = `Accepts .${format.from} files`;

  gridEl.classList.add("hidden");
  panelEl.classList.add("active");
}

function closePanel() {
  current = null;
  gridEl.classList.remove("hidden");
  panelEl.classList.remove("active");
}

backBtnEl.addEventListener("click", closePanel);
removeFileEl.addEventListener("click", clearFile);

function handleFile(file) {
  const actual = extOf(file.name);

  if (actual !== current.from) {
    setStatus(`Expected a .${current.from} file, got .${actual}.`, "error");
    clearFile();
    return;
  }

  selectedFile = file;
  selectedFileNameEl.textContent = file.name;
  selectedFileEl.classList.add("active");
  setStatus("", null);
  convertBtnEl.disabled = false;
}

dropEl.addEventListener("click", () => fileInputEl.click());

fileInputEl.addEventListener("change", () => {
  if (fileInputEl.files[0]) handleFile(fileInputEl.files[0]);
});

dropEl.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropEl.classList.add("hover");
});

dropEl.addEventListener("dragleave", () => {
  dropEl.classList.remove("hover");
});

dropEl.addEventListener("drop", (e) => {
  e.preventDefault();
  dropEl.classList.remove("hover");
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

convertBtnEl.addEventListener("click", async () => {
  if (!selectedFile || !current) return;

  setStatus("Converting…", "info");
  convertBtnEl.disabled = true;

  const form = new FormData();
  form.append("file", selectedFile);
  form.append("from", current.from);
  form.append("to", current.to);

  try {
    const res = await fetch("/api/convert", { method: "POST", body: form });

    if (!res.ok) {
      const err = await res.json();
      setStatus(`Error: ${err.error}`, "error");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${current.to}`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Done — download started.", "success");
  } catch (err) {
    setStatus(`Error: ${err.message}`, "error");
  } finally {
    convertBtnEl.disabled = false;
  }
});

loadFormats();
