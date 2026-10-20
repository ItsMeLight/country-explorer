const API_URL =
  "https://restcountries.com/v3.1/all?fields=name,capital,region,subregion,population,area,languages,currencies,flags";
const PAGE_SIZE = 12;
const MAX_POPULATION = 1500000000;

const grid = document.getElementById("grid");
const statusEl = document.getElementById("status");
const showMoreBtn = document.getElementById("showMore");
const nameInput = document.getElementById("nameInput");
const regionSelect = document.getElementById("regionSelect");
const populationInput = document.getElementById("populationInput");

let allCountries = [];
let filtered = [];
let visibleCount = PAGE_SIZE;

async function loadCountries() {
  statusEl.textContent = "Loading countries...";
  showMoreBtn.hidden = true;
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    allCountries = data
      .map((c) => ({
        name: c.name?.common || "Unknown",
        official: c.name?.official || "",
        capital: c.capital?.[0] || "N/A",
        region: c.region || "N/A",
        subregion: c.subregion || "N/A",
        area: c.area || 0,
        languages: Object.values(c.languages || {}).join(", ") || "N/A",
        currencies:
          Object.values(c.currencies || {})
            .map((cur) => cur.name + (cur.symbol ? " (" + cur.symbol + ")" : ""))
            .join(", ") || "N/A",
        population: c.population || 0,
        flag: c.flags?.svg || c.flags?.png || "",
        alt: c.flags?.alt || "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    statusEl.textContent = "";
    applyFilters();
  } catch (err) {
    statusEl.textContent = "Could not load countries. Please check your connection and try again.";
    console.error(err);
  }
}

function applyFilters() {
  const name = nameInput.value.trim().toLowerCase();
  const region = regionSelect.value;
  let pop = populationInput.value === "" ? null : Number(populationInput.value);

  if (pop !== null) {
    pop = Math.min(Math.max(pop, 0), MAX_POPULATION);
  }

  filtered = allCountries.filter((c) => {
    const matchName = !name || c.name.toLowerCase().includes(name);
    const matchRegion = !region || c.region === region;
    // Population filter: countries with up to the entered population
    const matchPop = pop === null || pop === 0 || c.population <= pop;
    return matchName && matchRegion && matchPop;
  });

  visibleCount = PAGE_SIZE;
  render();
}

function render() {
  grid.innerHTML = "";

  if (filtered.length === 0) {
    statusEl.textContent = "No countries match your search.";
    showMoreBtn.hidden = true;
    return;
  }
  statusEl.textContent = "";

  const fragment = document.createDocumentFragment();
  filtered.slice(0, visibleCount).forEach((c) => fragment.appendChild(createCard(c)));
  grid.appendChild(fragment);

  showMoreBtn.hidden = visibleCount >= filtered.length;
}

function createCard(c) {
  const card = document.createElement("article");
  card.className = "card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.addEventListener("click", () => openModal(c));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openModal(c);
    }
  });

  const imgBox = document.createElement("div");
  imgBox.className = "card__img";
  if (c.flag) {
    const img = document.createElement("img");
    img.src = c.flag;
    img.alt = c.alt || "Flag of " + c.name;
    img.loading = "lazy";
    imgBox.appendChild(img);
  }

  const title = document.createElement("h2");
  title.className = "card__name";
  title.textContent = c.name;

  card.append(
    imgBox,
    title,
    infoLine("Population", c.population.toLocaleString()),
    infoLine("Capital", c.capital),
    infoLine("Region", c.region)
  );
  return card;
}

function infoLine(label, value) {
  const p = document.createElement("p");
  p.className = "card__info";
  const b = document.createElement("b");
  b.textContent = label + ":";
  p.append(b, document.createTextNode(value));
  return p;
}

/* Detail card (modal) */
const modal = document.getElementById("modal");
const modalFlag = document.getElementById("modalFlag");
const modalTitle = document.getElementById("modalTitle");
const modalOfficial = document.getElementById("modalOfficial");
const modalDetails = document.getElementById("modalDetails");
let lastFocused = null;

function openModal(c) {
  lastFocused = document.activeElement;
  modalFlag.src = c.flag;
  modalFlag.alt = c.alt || "Flag of " + c.name;
  modalTitle.textContent = c.name;
  modalOfficial.textContent = c.official;

  const rows = [
    ["Population", c.population.toLocaleString()],
    ["Capital", c.capital],
    ["Region", c.region],
    ["Subregion", c.subregion],
    ["Area", c.area ? c.area.toLocaleString() + " km²" : "N/A"],
    ["Languages", c.languages],
    ["Currencies", c.currencies],
  ];
  modalDetails.innerHTML = "";
  rows.forEach(([label, value]) => {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    modalDetails.append(dt, dd);
  });

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modal.querySelector(".modal__close").focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

modal.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});

function debounce(fn, delay = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

nameInput.addEventListener("input", debounce(applyFilters));
populationInput.addEventListener("input", debounce(applyFilters));
regionSelect.addEventListener("change", applyFilters);

showMoreBtn.addEventListener("click", () => {
  visibleCount += PAGE_SIZE;
  render();
});

loadCountries();
