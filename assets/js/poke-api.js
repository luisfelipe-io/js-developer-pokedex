import Pokemon from "./pokemon-model";

const pokeApi = {};

function convertPokeApiDetailToPokemon(pokeDetail) {
  const pokemon = new Pokemon();
  pokemon.number = pokeDetail.id;
  pokemon.name = pokeDetail.name;

  const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
  const [type] = types;

  pokemon.types = types;
  pokemon.type = type;

  pokemon.image = pokeDetail.sprites.other.dream_world.front_default;

  const speciesUrl = pokeDetail.species.url;
  fetch(speciesUrl)
    .then((res) => res.json())
    .then((speciesData) => {
      const genderRate = speciesData.gender_rate;
      if (genderRate === -1) {
        pokemon.genderless = true;
      } else if (genderRate === 0) {
        pokemon.genderInfo.malePercent = "100%";
        pokemon.genderInfo.femalePercent = "0%";
      } else if (genderRate === 8) {
        pokemon.genderInfo.malePercent = "0%";
        pokemon.genderInfo.femalePercent = "100%";
      } else {
        const femalePercent = (genderRate / 8) * 100;
        const malePercent = 100 - femalePercent;
        pokemon.genderInfo.malePercent = `${malePercent}%`;
        pokemon.genderInfo.femalePercent = `${femalePercent}%`;
      }

      const generaArray = speciesData.genera;
      pokemon.eggGroups = speciesData.egg_groups.map((item) => item.name);
      const englishGenus = generaArray.find(
        (item) => item.language.name === "en"
      );
      pokemon.species = englishGenus.genus;

      pokemon.eggCycle = speciesData.hatch_counter;
    });

  pokemon.height = pokeDetail.height;
  pokemon.weight = pokeDetail.weight;

  pokemon.abilities = pokeDetail.abilities.map(
    (ability) => ability.ability.name
  );

  return pokemon;
}

pokeApi.getPokemonDetail = (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => response.json())
    .then(convertPokeApiDetailToPokemon);
};

pokeApi.getPokemons = (offset = 0, limit = 5) => {
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  return fetch(url)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.results)
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
    .then((detailRequests) => Promise.all(detailRequests))
    .then((pokemonsDetails) => pokemonsDetails);
};

export default pokeApi;
