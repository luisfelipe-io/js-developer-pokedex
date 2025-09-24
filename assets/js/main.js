import pokeApi from "./poke-api";

const pokemonList = document.getElementById("pokemonList");
const loadMoreButton = document.getElementById("loadMoreButton");
const modalOverlay = document.getElementById("modalOverlay");
const modalCard = document.getElementById("modalCard");
const backButton = document.getElementById("backButton");
const modalTitle = document.getElementById("modalTitle");
const modalNumber = document.getElementById("modalNumber");
const pokemonTypes = document.getElementById("pokemonTypes");
const modalImage = document.getElementById("modalImage");
const pokemonHeight = document.getElementById("pokemonHeight");
const pokemonWeight = document.getElementById("pokemonWeight");
const pokemonAbilities = document.getElementById("pokemonAbilities");
const pokemonSpecies = document.getElementById("pokemonSpecies");
const pokemonGenderRatio = document.getElementById("pokemonGenderRatio");
const pokemonMalePercent = document.getElementById("pokemonMalePercent");
const pokemonFemalePercent = document.getElementById("pokemonFemalePercent");
const pokemonEggGroups = document.getElementById("pokemonEggGroups");
const pokemonEggCycle = document.getElementById("pokemonEggCycle");

const maxRecords = 151;
const limit = 10;
let offset = 0;
const pokemonModels = [];

function convertPokemonToLi(pokemon) {
  return `
        <li class="pokemon-card pokemon-card--${pokemon.type}">
            <span class="pokemon-card__number">#${pokemon.number}</span>
            <span class="pokemon-card__name">${pokemon.name}</span>

            <div class="pokemon-card__detail">
                <ol class="pokemon-card__types">
                    ${pokemon.types
                      .map(
                        (type) =>
                          `<li class="pokemon-card__type pokemon-card__type--${type}">${type}</li>`
                      )
                      .join("")}
                </ol>

                <img src="${pokemon.image}"
                     class="pokemon-card__image"
                     alt="${pokemon.name}"
                     loading="lazy"
                     >                     
            </div>
        </li>
    `;
}

function loadPokemonItens(offset, limit) {
  pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
    pokemonModels.push(...pokemons);
    const newHtml = pokemons.map(convertPokemonToLi).join("");
    pokemonList.innerHTML += newHtml;
  });
}

loadPokemonItens(offset, limit);

loadMoreButton.addEventListener("click", () => {
  offset += limit;
  const qtdRecordsWithNexPage = offset + limit;

  if (qtdRecordsWithNexPage >= maxRecords) {
    const newLimit = maxRecords - offset;
    loadPokemonItens(offset, newLimit);

    loadMoreButton.parentElement.removeChild(loadMoreButton);
  } else {
    loadPokemonItens(offset, limit);
  }
});

pokemonList.addEventListener("click", function (event) {
  const card = event.target.closest(".pokemon-card");

  if (card && pokemonList.contains(card)) {
    const cardId = parseInt(
      card
        .querySelector(".pokemon-card__number")
        .textContent.replace(/\D/g, ""),
      10
    );

    openModal(cardId);
  }
});

let pokemonDetails;

function openModal(cardId) {
  pokemonDetails = pokemonModels.find((pokemon) => pokemon.number === cardId);

  if (pokemonDetails) {
    modalCard.classList.add(`pokemon-card__type--${pokemonDetails.type}`);
    modalTitle.textContent = pokemonDetails.name;
    modalNumber.textContent = `#${pokemonDetails.number}`;
    pokemonTypes.innerHTML = pokemonDetails.types
      .map((type) => {
        return `
        <li class="modal-card__type-badge">${type}</li>
      `;
      })
      .join("");
    modalImage.src = pokemonDetails.image;

    pokemonSpecies.textContent = pokemonDetails.species;

    function convertHeightToFeetInches(decimeters) {
      const totalInches = (decimeters * 10) / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round((totalInches % 12) * 10) / 10;
      return { feet, inches };
    }

    function convertWeightToPounds(hectograms) {
      const pounds = hectograms * 0.1 * 2.20462;
      return Math.round(pounds * 10) / 10;
    }

    const { feet, inches } = convertHeightToFeetInches(pokemonDetails.height);
    const weightInLbs = convertWeightToPounds(pokemonDetails.weight);

    const heightCm = pokemonDetails.height * 10;
    const weightKg = pokemonDetails.weight / 10;

    pokemonHeight.textContent = `${feet}'${inches}" (${heightCm} cm)`;
    pokemonWeight.textContent = `${weightInLbs} lbs (${weightKg} kg)`;

    pokemonAbilities.textContent = pokemonDetails.abilities
      .map((ability) => ability)
      .join(" ");

    if (pokemonDetails.genderless) {
      pokemonGenderRatio.innerHTML = "<p>Genderless</p>";
    } else {
      pokemonMalePercent.textContent = pokemonDetails.genderInfo.malePercent;
      pokemonFemalePercent.textContent =
        pokemonDetails.genderInfo.femalePercent;
    }

    pokemonEggGroups.textContent = pokemonDetails.eggGroups
      .map((eggGroup) => eggGroup)
      .join(" ");

    pokemonEggCycle.textContent = pokemonDetails.eggCycle;
  }

  document.body.classList.add("no-scroll");

  modalOverlay.classList.add("active");
}

function closeModal() {
  modalCard.classList.remove(`pokemon-card__type--${pokemonDetails.type}`);
  modalOverlay.classList.remove("active");

  document.body.classList.remove("no-scroll");
}

backButton.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
    closeModal();
  }
});
