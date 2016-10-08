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
  "Nidoran-male",
  "Nidorina",
  "Nidoqueen",
  "Nidoran-female",
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
  "Farfetchd",
  "Doduo",
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
  "Mr-Mime",
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

(function(){
    // Convert array to object
    var convArrToObj = function(array){
        var thisEleObj = new Object();
        if(typeof array == "object"){
            for(var i in array){
                var thisEle = convArrToObj(array[i]);
                thisEleObj[i] = thisEle;
            }
        }else {
            thisEleObj = array;
        }
        return thisEleObj;
    };
    var oldJSONStringify = JSON.stringify;
    JSON.stringify = function(input){
        return oldJSONStringify(convArrToObj(input));
    };
})();

var pokemonInfo = Array();

function getPokemonBasicInfo(pokemonName) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var pokemon = Array();
      
			var el = document.createElement( 'html' );
			el.innerHTML = xhttp.responseText;

			// get evolution data
			var evolutionsList = el.getElementsByClassName('evolution-profile')[0];
			pokemon['evolution'] = {};
			for(var i = 0; i < evolutionsList.children.length; i++) {
				pokemon['evolution'][i] = evolutionsList.children[i].getElementsByTagName('a')[0].href.replace('file:///us/pokedex/', '');
				
			}
			// get weaknesses
			var weaknessesList = el.getElementsByClassName('dtm-weaknesses')[0].children[1].getElementsByTagName('li');
			pokemon['weaknesses'] = {};
			for(var i = 0; i < weaknessesList.length; i++) {
				pokemon['weaknesses'][i] = weaknessesList[i].innerText.trim();
				
			}
			// get type
			var typeList = el.getElementsByClassName('dtm-type')[0].children[1].getElementsByTagName('li');
			pokemon['type'] = {};
			
			for(var i = 0; i < typeList.length; i++) {
				pokemon['type'][i] = typeList[i].innerText.trim();
				
			}

			
			// get stats
			var statsList = el.getElementsByClassName('pokemon-stats-info active')[0].children[1].getElementsByTagName('ul');
			pokemon['stats'] = {};
			pokemon['stats']['HP'] = statsList[0].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon['stats']['Attack'] = statsList[1].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon['stats']['Defense'] = statsList[2].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon['stats']['SpecialAttack'] = statsList[3].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon['stats']['SpecialDefense'] = statsList[4].getElementsByTagName('li')[0].getAttribute('data-value');
			pokemon['stats']['Speed'] = statsList[5].getElementsByTagName('li')[0].getAttribute('data-value');
			
			
			// get height
			var height = el.getElementsByClassName('pokemon-ability-info')[0].getElementsByClassName('column-7')[0].getElementsByTagName('li')[0].children[1].innerText;
			pokemon['height'] = height;

			// get weight
			var weight = el.getElementsByClassName('pokemon-ability-info')[0].getElementsByClassName('column-7')[0].getElementsByTagName('li')[1].children[1].innerText;
			pokemon['weight'] = weight;

			// get category
			var categoryField = el.getElementsByClassName('pokemon-ability-info')[0].getElementsByClassName('column-7')[1].getElementsByTagName('li')[0].children;
			pokemon['category'] = {};
			for(var i = 1; i < categoryField.length; i++) {
				pokemon['category'][i] = categoryField[i].innerText;
			}

			var abilityField = el.getElementsByClassName('pokemon-ability-info-detail match');
			pokemon['ability'] = {};
			for(var i = 0; i < abilityField.length; i++) {
				var abilityName = abilityField[i].getElementsByTagName('h3')[0].innerText;
				var abilityDescription = abilityField[i].getElementsByTagName('p')[0].innerText;
				pokemon['ability'][i] = {name: abilityName, description: abilityDescription};
				
			}
			pokemonInfo[pokemonName] = pokemon;
		}
	};

	xhttp.open("GET", "http://www.pokemon.com/us/pokedex/" + pokemonName, false);
	xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
	xhttp.setRequestHeader('Access-Control-Allow-Methods', 'GET');
	xhttp.send();
}

for(i = 0; i < 151; i++) {
	getPokemonBasicInfo(pokemons[i]);
}

console.log(pokemonInfo);

var a = (JSON.parse(JSON.stringify(pokemonInfo)));