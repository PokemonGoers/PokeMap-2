
var functions = require('./js/functions');
var PokeMap = require('./js/pokemap');
var pokeType = require('./js/basictypes');
var io = require('socket.io-browserify');

var map = document.getElementById('map');

var filter =
    {
       pokemonIds: null,
    sightingsSince: 100000,
    predictionsUntil: 10
    };

var options =
{
    tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    filter : filter,
    apiEndpoint: "http://pokedata.c4e3f8c7.svc.dockerapp.io:65014/api/"

};

var poke = new PokeMap(map, options);
//var poke = new PokeMap(map, {latitude: 48.264673, longitude: 11.671434}, {from: -83000, to: 5});

//var coordinates = {latitude: 48, longitude: 11};
//var zoomLevel = 15;
//poke.goTo({coordinates,zoomLevel});

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
