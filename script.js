// Renders country cards into #country-cards-container using data from data.js
const countryCardsContainer = document.getElementById("country-cards-container");
const nameInput = document.getElementById("name");
const regionSelect = document.getElementById("region");
const populationInput = document.getElementById("population");
const showMoreBtn = document.getElementById("showMore");

const PAGE_SIZE = 12;
let displayCount = PAGE_SIZE;
let filteredCountries = countries;

function placeholderIcon() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  const use = document.createElementNS(ns, "use");
  use.setAttribute("href", "#img-icon");
  svg.appendChild(use);
  return svg;
}

function displayCountries(countries) {
  // 1. Clear the container
  countryCardsContainer.innerHTML = "";

  // 2. Nothing to show -> error message
  if (countries.length === 0) {
    countryCardsContainer.innerHTML =
      '<p class="error-message">No countries found. Please adjust your search.</p>';
    showMoreBtn.hidden = true;
    return;
  }

  // 3.1 loopCounter = displayCount or countries.length, whichever is lesser
  const loopCounter = Math.min(displayCount, countries.length);

  // 3.2 For each country from 0 to loopCounter
  for (let i = 0; i < loopCounter; i++) {
    const country = countries[i];

    // card <div> with class "country-card"
    const card = document.createElement("div");
    card.classList.add("country-card");

    // image box
    const imgBox = document.createElement("div");
    imgBox.classList.add("country-card__img");
    const flag = document.createElement("img");
    flag.src = "https://flagcdn.com/w320/" + country.code + ".png";
    flag.alt = "Flag of " + country.name;
    flag.onerror = () => {
      flag.remove();
      imgBox.appendChild(placeholderIcon());
    };
    imgBox.appendChild(flag);

    // text elements
    const name = document.createElement("h2");
    name.classList.add("country-card__name");
    name.innerHTML = country.name;

    const population = document.createElement("p");
    population.classList.add("country-card__info");
    population.innerHTML = "<b>Population:</b>" + country.population.toLocaleString();

    const capital = document.createElement("p");
    capital.classList.add("country-card__info");
    capital.innerHTML = "<b>Capital:</b>" + country.capital;

    const region = document.createElement("p");
    region.classList.add("country-card__info");
    region.innerHTML = "<b>Region:</b>" + country.region;

    // append everything to the card, then the card to the container
    card.append(imgBox, name, population, capital, region);
    countryCardsContainer.appendChild(card);
  }

  showMoreBtn.hidden = displayCount >= countries.length;
}

function applyFilters() {
  const nameValue = nameInput.value.trim().toLowerCase();
  const regionValue = regionSelect.value;
  const popValue = Number(populationInput.value) || 0;

  filteredCountries = countries.filter((c) => {
    const matchName = !nameValue || c.name.toLowerCase().includes(nameValue);
    const matchRegion = !regionValue || c.region === regionValue;
    const matchPop = popValue === 0 || c.population <= popValue;
    return matchName && matchRegion && matchPop;
  });

  displayCount = PAGE_SIZE;
  displayCountries(filteredCountries);
}

nameInput.addEventListener("input", applyFilters);
regionSelect.addEventListener("change", applyFilters);
populationInput.addEventListener("input", applyFilters);

showMoreBtn.addEventListener("click", () => {
  displayCount += PAGE_SIZE;
  displayCountries(filteredCountries);
});

displayCountries(filteredCountries);
