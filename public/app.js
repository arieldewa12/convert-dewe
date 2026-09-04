const dropEl = document.getElementById("drop");
const fileInputEl = document.getElementById("file-input");
const fromLabelEl = document.getElementById("from-label");
const toSelectEl = document.getElementById("to-select");
const convertBtnEl = document.getElementById("convert-btn");
const statusEl = document.getElementById("status");

let formats = [];
let selectedFile = null;

async function loadFormats() {
  const res = await fetch("/api/formats");
  formats = await res.json();
}

const EXTENSION_ALIASES = { jpeg: "jpg" };

function extOf(filename) {
  const raw = filename.split(".").pop().toLowerCase();
  return EXTENSION_ALIASES[raw] ?? raw;
}

function populateToOptions(fromExt) {
  const matches = formats.filter((f) => f.from === fromExt);
  toSelectEl.innerHTML = "";

  if (matches.length === 0) {
    toSelectEl.disabled = true;
    convertBtnEl.disabled = true;
    statusEl.textContent = `No converter available for .${fromExt} files.`;
    return;
  }

  for (const m of matches) {
    const opt = document.createElement("option");
    opt.value = m.to;
    opt.textContent = m.label;
    toSelectEl.appendChild(opt);
  }

  toSelectEl.disabled = false;
  convertBtnEl.disabled = false;
  statusEl.textContent = "";
}

function handleFile(file) {
  selectedFile = file;
  const ext = extOf(file.name);
  fromLabelEl.textContent = `.${ext}`;
  populateToOptions(ext);
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
  if (!selectedFile) return;

  const from = extOf(selectedFile.name);
  const to = toSelectEl.value;

  statusEl.textContent = "Converting…";
  convertBtnEl.disabled = true;

  const form = new FormData();
  form.append("file", selectedFile);
  form.append("from", from);
  form.append("to", to);

  try {
    const res = await fetch("/api/convert", { method: "POST", body: form });

    if (!res.ok) {
      const err = await res.json();
      statusEl.textContent = `Error: ${err.error}`;
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted.${to}`;
    a.click();
    URL.revokeObjectURL(url);
    statusEl.textContent = "Done — download started.";
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
  } finally {
    convertBtnEl.disabled = false;
  }
});

loadFormats();
