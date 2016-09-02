var functions = require('./js/functions');
var opencyclemap = require('./js/opencyclemap');

var xhr= new XMLHttpRequest();
xhr.open('GET', 'css/sidebar.html', true);
xhr.onreadystatechange= function() {
    if (this.readyState!==4) return;
    if (this.status!==200) return; // or whatever error handling you want
    //	document.body.innerHTML += this.responseText;
    var elemDiv = document.createElement('div');
	elemDiv.innerHTML = this.responseText;
	document.body.appendChild(elemDiv);
    
};
xhr.send();

opencyclemap.setUpMap(48.264673,11.671434);
opencyclemap.setUpLocation(48.264673,11.671434);
var from = new Date("2016-08-01T00:00:00.000Z");
var to = new Date("2016-09-01T00:00:00.000Z");
opencyclemap.loadPokemonData(opencyclemap.setPokemonOnMap, from, to);
