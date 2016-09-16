
var functions = require('./js/functions');
var PokeMap = require('./js/pokemap');
var pokeType = require('./js/basictypes');
var io = require('socket.io-browserify');

var sidebarHTML = '<div id="sidebar">\
		<!--<div id="close"><a href="#" onclick="hideAdditionalInformation()">×</a></div>-->\
		<div class="avatarhelper"><div id="avatar"></div></div>\
		<div class="titlehelper"><div id="name">Pokemon Name</div><div class="closehelper fa fa-times-circle" onclick="hideAdditionalInformation()"></div></div>\
		<h2><span class="fa fa-info-circle"></span> Information</h2></div>';

 var showAdditionalInformation = function(pokemon) {

        document.getElementById("map").style.width = "calc(100% - 410px)";
        document.getElementById("sidebar").style.display = "block";
        document.getElementById("avatar").style.backgroundImage = 'url("img/bulbasaur.png")';
        document.getElementById("avatar").style.backgroundSize = 'contain';
        document.getElementById("avatar").style.width = "250px";
        document.getElementById("avatar").style.height = "250px";
        document.getElementById("name").innerHTML = pokemon.pokemon.pokemonname;
   };

hideAdditionalInformation = function() {
    document.getElementById("map").style.width = "100%";
    document.getElementById("sidebar").style.display = "none";

}

var map = document.getElementById('map');

var elemDiv = document.createElement('div');
elemDiv.innerHTML = sidebarHTML;
document.body.appendChild(elemDiv);

var options = 
{
    pokemonIds: null, 
    sightingsSince: 100000, 
    predictionsUntil: 10,
    tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png'

};

var poke = new PokeMap(map, options, "http://pokedata.c4e3f8c7.svc.dockerapp.io:65014");
//var poke = new PokeMap(map, {latitude: 48.264673, longitude: 11.671434}, {from: -83000, to: 5});

functions.initializeSlider();


//var pokeTypeInsance = new pokeType();
//
//var pJSON = "[";
//pJSON += "'latitude':2,'longitude':3]";
//
//var p = new pokeTypeInsance.PokePOI("dlk");
//
// poke.on('click', function(poke)
// {
//     if(poke instanceof pokeType.PokemonSighting)
//     {
//         console.log("It is a pokemonSighting with pokemon: " + poke.pokemon.pokemonname);
//     }
//     else if (poke instanceof pokeType.PokemonPrediction)
//     {
//         console.log("It is a pokemonPrediction: " +  poke.pokemon.pokemonname);
//     }
//
//    showAdditionalInformation(poke);
// });
