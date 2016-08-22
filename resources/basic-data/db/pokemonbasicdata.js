var pokemons = [
  "Bulbasaur",
  "Ivysaur",
  "Venusaur",
  "Charmander",
  "Charmeleon",
  "Charizard",
  "Squirtle",
  "Wartortle",
  "Blastoise",
  "Caterpie",
  "Metapod",
  "Butterfree",
  "Weedle",
  "Kakuna",
  "Beedrill",
  "Pidgey",
  "Pidgeotto",
  "Pidgeot",
  "Rattata",
  "Raticate",
  "Spearow",
  "Fearow",
  "Ekans",
  "Arbok",
  "Pikachu",
  "Raichu",
  "Sandshrew",
  "Sandslash",
  "Nidoran♀",
  "Nidorina",
  "Nidoqueen",
  "Nidoran♂",
  "Nidorino",
  "Nidoking",
  "Clefairy",
  "Clefable",
  "Vulpix",
  "Ninetales",
  "Jigglypuff",
  "Wigglytuff",
  "Zubat",
  "Golbat",
  "Oddish",
  "Gloom",
  "Vileplume",
  "Paras",
  "Parasect",
  "Venonat",
  "Venomoth",
  "Diglett",
  "Dugtrio",
  "Meowth",
  "Persian",
  "Psyduck",
  "Golduck",
  "Mankey",
  "Primeape",
  "Growlithe",
  "Arcanine",
  "Poliwag",
  "Poliwhirl",
  "Poliwrath",
  "Abra",
  "Kadabra",
  "Alakazam",
  "Machop",
  "Machoke",
  "Machamp",
  "Bellsprout",
  "Weepinbell",
  "Victreebel",
  "Tentacool",
  "Tentacruel",
  "Geodude",
  "Graveler",
  "Golem",
  "Ponyta",
  "Rapidash",
  "Slowpoke",
  "Slowbro",
  "Magnemite",
  "Magneton",
  "Farfetch'd",
  "Duduo",
  "Dodrio",
  "Seel",
  "Dewgong",
  "Grimer",
  "Muk",
  "Shellder",
  "Cloyster",
  "Gastly",
  "Haunter",
  "Gengar",
  "Onix",
  "Drowzee",
  "Hypno",
  "Krabby",
  "Kingler",
  "Voltorb",
  "Electrode",
  "Exeggcute",
  "Exeggutor",
  "Cubone",
  "Marowak",
  "Hitmonlee",
  "Hitmonchan",
  "Lickitung",
  "Koffing",
  "Weezing",
  "Rhyhorn",
  "Rhydon",
  "Chansey",
  "Tangela",
  "Kangaskhan",
  "Horsea",
  "Seadra",
  "Goldeen",
  "Seaking",
  "Staryu",
  "Starmie",
  "MrMime",
  "Scyther",
  "Jynx",
  "Electabuzz",
  "Magmar",
  "Pinsir",
  "Tauros",
  "Magikarp",
  "Gyarados",
  "Lapras",
  "Ditto",
  "Eevee",
  "Vaporeon",
  "Jolteon",
  "Flareon",
  "Porygon",
  "Omanyte",
  "Omastar",
  "Kabuto",
  "Kabutops",
  "Aerodactyl",
  "Snorlax",
  "Articuno",
  "Zapdos",
  "Moltres",
  "Dratini",
  "Dragonair",
  "Dragonite",
  "Mewtwo",
  "Mew"
];

function getPokemonBasicInfo(pokemonName) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var pokemon = {};
			pokemon.name = pokemonName;

			var el = document.createElement( 'html' );
			el.innerHTML = xhttp.responseText;

			// get evolution data
			var evolutionsList = el.getElementsByClassName('evolution-profile')[0];
			pokemon.evolution = [];
			for(var i = 0; i < evolutionsList.children.length; i++) {
				pokemon.evolution.push(evolutionsList.children[i].getElementsByTagName('a')[0].href.replace('file:///us/pokedex/', ''));
				
			}
			// get weaknesses
			var weaknessesList = el.getElementsByClassName('dtm-weaknesses')[0].children[1].getElementsByTagName('li');
			pokemon.weaknesses = [];
			for(var i = 0; i < weaknessesList.length; i++) {
				pokemon.weaknesses.push(weaknessesList[i].innerText.trim());
				
			}
			// get type
			var typeList = el.getElementsByClassName('dtm-type')[0].children[1].getElementsByTagName('li');
			pokemon.type = [];
			
			for(var i = 0; i < typeList.length; i++) {
				pokemon.type.push(typeList[i].innerText.trim());
				
			}

			
			// get stats
			var statsList = el.getElementsByClassName('pokemon-stats-info active')[0].children[1].getElementsByTagName('ul');
			alert(statsList.length);
			console.log(statsList);
			pokemon.stats = [];
			pokemon.stats.HP = statsList[0].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon.stats.Attack = statsList[1].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon.stats.Defense = statsList[2].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon.stats.SpecialAttack = statsList[3].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon.stats.SpecialDefense = statsList[4].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon.stats.Speed = statsList[5].getElementsByTagName('li')[0].getAttribute('data-value');
			

			console.log(pokemon);
		}
	};

	xhttp.open("GET", "http://www.pokemon.com/us/pokedex/" + pokemonName, true);
	xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
	xhttp.setRequestHeader('Access-Control-Allow-Methods', 'GET');
	xhttp.send();
}

for(i = 0; i < 1; i++) {
	console.log(getPokemonBasicInfo(pokemons[i]));
}