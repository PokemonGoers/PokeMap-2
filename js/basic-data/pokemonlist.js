var pokemons = [];
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		var text = xhttp.responseText;
		var regex = /<h3 class="slide-title">(.*?)<\/h3>/g;

		while (match = regex.exec(text)) {
			var pokemon = match[1];
			pokemon = pokemon.replace(/\d+/g, '').replace(/\.\ /g, '').replace(/\ .*$/, '');
			pokemons.push(pokemon);
		}

		console.log(pokemons);
	}
};

xhttp.open("GET", "http://www.techinsider.io/every-pokemon-in-pokemon-go-full-list-2016-7", true);
xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
xhttp.setRequestHeader('Access-Control-Allow-Methods', 'GET');
xhttp.send();
