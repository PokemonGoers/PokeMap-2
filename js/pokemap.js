var functions = require('./functions');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var L = require('leaflet');
var io = require('socket.io-client');
var socket = io.connect("http://localhost:3000");
var Pokemon = require('./basictypes');
var config = require('./config');
require('leaflet.locatecontrol');

var mymap = null;
var apiURL={};
var getAllSightingsURL = "/api/pokemon/sighting";
var getAllSightingsByTimeRangeURL = "/api/pokemon/sighting/ts/";
var getAllPokemon = "/api/pokemon";
var getPokemonById = "/api/pokemon/id/";
var getAllPredictions = {};

var PokeMap = function(htmlElement, options={filter : {pokemonIds: 0, sightingsSince: 0, predictionsUntil: 0}, tileLayer: config.currentMap,apiEndPoint : 'http://pokedata.c4e3f8c7.svc.dockerapp.io:65014'}) {
  this.htmlElement = htmlElement;
  apiURL = options.apiEndPoint;


  // which pokemons should be shown; if null show all pokemons; otherwise only pokemons with ids in the list
  this.filterPokemons = null;

  //this.socket = io.connect('http://localhost:3000');

  this.markers = [];
  this.currentOpenPokemon = null;
  
  this.setUpMap(options.tileLayer);
  this.filter(options.filter);
    
  //console.log(mymap.getBounds().getNorthWest(), mymap.getBounds().getSouthEast());
}

util.inherits(PokeMap, EventEmitter);

PokeMap.prototype.setUpMap = function(tileLayer) {
  L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';
  mymap = L.map(this.htmlElement).fitWorld();//.setView(this.coordinates, this.zoomLevel);
  window.map = mymap; // Set map as a global variable

  L.tileLayer(tileLayer, {
    maxZoom: 18
  }).addTo(mymap);

  L.control.locate().addTo(map);

  var MyControl = L.Control.extend({
    options: {
      position: 'bottomright'
    },

    onAdd: function(map) {
      var controlContainer = L.DomUtil.create('div', 'leaflet-time-slider-container');
      var sliderContainer = L.DomUtil.create('div', 'leaflet-time-slider', controlContainer);
      L.DomUtil.create('div', 'leaflet-time-slider-bar', sliderContainer);
      var dateContainer = L.DomUtil.create('div', 'leaflet-time-slider-dates', sliderContainer);
      L.DomUtil.create('div', 'leaflet-time-slider-from', dateContainer);
      L.DomUtil.create('div', 'leaflet-time-slider-to', dateContainer);
      var hideContainer = L.DomUtil.create('div', 'leaflet-time-slider-hide-container', sliderContainer);
      var hideLink = L.DomUtil.create('a', 'leaflet-time-slider-hide-link', hideContainer);
      L.DomUtil.create('span', 'fa fa-angle-double-right', hideLink);
      var showContainer = L.DomUtil.create('div', 'leaflet-time-slider-show-container', controlContainer);
      var showLink = L.DomUtil.create('a', 'leaflet-time-slider-show-link', showContainer);
      L.DomUtil.create('span', 'fa fa-angle-double-left', showLink);
      sliderContainer.title = 'change time range';
      hideContainer.title = 'hide slider';
      showContainer.title = 'show slider';
      return controlContainer;
    }
  });
  map.addControl(new MyControl());
  document.getElementsByClassName('leaflet-time-slider-hide-link')[0].onclick = function(e) {
    document.getElementsByClassName('leaflet-time-slider')[0].style.display = 'none';
    document.getElementsByClassName('leaflet-time-slider-show-container')[0].style.display = 'block';
  }
  document.getElementsByClassName('leaflet-time-slider-show-link')[0].onclick = function(e) {
    document.getElementsByClassName('leaflet-time-slider-show-container')[0].style.display = 'none';
    document.getElementsByClassName('leaflet-time-slider')[0].style.display = 'block';
  }
  // Emit "move" event when the map is moved
  mymap.on('move', function(e) {
    PokeMap.prototype.emitMove(mymap.getCenter(), mymap.getZoom());
  });
  socket.on("connect", function () {
    console.log("Connected to server, sending geo settings..");
    socket.emit("settings", {mode: "geo", lat: mymap.getCenter().lat, lon: mymap.getCenter().lon, radius: 5000000});
  });

  socket.on('mob', function (data) {
    console.log("New mob! ", data);
    var mob = (data);
    console.log(mob.coordinates);
    var mobCircle = L.circle(mob.coordinates, 100, {
      color: '#808080',
      fillColor: 'red',
      fillOpacity: 0.1
    }).addTo(mymap);
    mobCircle.bindPopup("PokeMob detected here! Date: " + mob.date);
    mobCircle.on('click', function(e) { this.emitClick(event.data); });
  });


}


PokeMap.prototype.goTo = function({coordinates, zoomLevel}) {
  //mymap.panTo([params.coordinates.latitude, params.coordinates.longitude],params.zoomLevel);
  mymap.setView([coordinates.latitude, coordinates.longitude],zoomLevel);
}

PokeMap.prototype.emitMove = function(coordinates,zoomLevel) {
    this.emit('move', {coordinates,zoomLevel});
}

PokeMap.prototype.emitClick = function(pokePOI) {
  this.emit('click', pokePOI);
}

PokeMap.prototype.filter = function({pokemonIds, sightingsSince, predictionsUntil}) {
  if(sightingsSince > 0) {
    console.log("Calling method to show sightings.");
    this.showPokemonSightings(sightingsSince);
  }
  if(predictionsUntil > 0) {
    console.log("Calling method to show predictions.");
    this. showPokemonPredictions(predictionsUntil);
  }

};

//PokeMap.prototype.on('move', function(a, b) {console.log(a + " " + b);})
var pokemonLayer, pokemonMapData;
function setPokemonOnMap() {
  if (mymap == null) return;

  if (typeof pokemonLayer !== "undefined") {
    this.markers = [];
    map.removeLayer(pokemonLayer);
  }

  var pokemonIcon = L.Icon.extend({
    options: {
      iconSize: [35, 35]
    }
  });

  pokemonLayer = L.geoJson(pokemonMapData, {

    onEachFeature: onEachFeature,

    pointToLayer: function(feature, latlng) {
      var pokemon = new pokemonIcon({
        iconUrl: feature.properties.img
      });
      var pokname = feature.properties.name;
      return L.marker(latlng, {
        icon: pokemon,
        title: pokname,
        rinseOnHover: true
      });
    }

  }).addTo(map);
}

PokeMap.prototype.showPokemonSightings = function(sightingsSince) {
  console.log("Lets show sightings.");
  var dateNow = new Date();
  var startingDate = functions.subtractSeconds(dateNow, sightingsSince);
 // var URL = apiURL + getAllSightingsByTimeRangeURL + startingDate.toISOString() + "/range/" + sightingsSince + "s";
   var URL= "http://pokedata.c4e3f8c7.svc.dockerapp.io:65014/api/pokemon/sighting/source/TWITTER";
  console.log("Fetching data from ", URL);
  functions.loadJson(URL, function(response) {
    console.log("Data fetched. Generating map data.");
    var sightingsData = (JSON.parse(response))["data"];
    pokemonMapData = PokeMap.prototype.generatePokemonSightingsMapData(sightingsData);
    setPokemonOnMap();
  });
}

// Not implemented! Copy Timo's or Elma's data from one of the previous commits
PokeMap.prototype.showPokemonPredictions = function(predictionsUntil) {
//  var URL = apiURL + getAllPredictions + this.getFromForAPI() + "/range/" + this.getToForAPI();
//  functions.loadJson(URL, function(response) {
//    var predictedData = (JSON.parse(response))["data"];
//    pokemonMapData = PokeMap.prototype.generatePokemonPredictionsMapData(predictedData);
//    setPokemonOnMap();
//  });
}

PokeMap.prototype.showPokemonMobs = function() {
}

PokeMap.prototype.updateTimeRange = function(timeRange) {
  this.sliderFrom = timeRange.from;
  this.sliderTo = timeRange.to;

  this.showPokemonSightings();
  this.showPokemonPrediction();
}

PokeMap.prototype.generatePokemonSightingsMapData = function(sightingsData) {
  var pokemonMapData = {
    "type": "FeatureCollection",
    "features": []
  };
  var now = new Date();

  for (var i = 0, n = sightingsData.length; i < n; ++i) {
    if(this.filterPokemons != null && this.filterPokemons.indexOf(sightingsData[i].pokemonId) == -1) continue;
    //If there is no location, then don't show pokemon
    if(sightingsData[i].location == null) continue;

    pokemonMapData.features.push({
      "id": sightingsData[i].pokemonId,
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [sightingsData[i].location.coordinates[0], sightingsData[i].location.coordinates[1]]
      },
      "properties": {
        "img": "http://pokedata.c4e3f8c7.svc.dockerapp.io:65014/api/pokemon/id/" + sightingsData[i].pokemonId +"/icon",
        "time": sightingsData[i].appearedOn
      }
    });
  }

  return pokemonMapData
}


var pokemonForSidebar = {};
function onEachFeature(feature, layer) {
  var popupContent = "<div>";
  popupContent += "<div class='pokemonInfo'><div class='pokemonname'></div>" + "<span class=''></span><button class='pokemonmore fa fa-book' ";
  popupContent += "onclick='showSideBar(" + ")'></button>";
  popupContent += "</div><div class='allinfo'>";
  popupContent += "<div class='pokemontime'><span class='poklabel'>Time of appearance: </span> " + new Date(feature.properties.time).toLocaleString() + "</div>";
  popupContent += "</div></div>";
  layer.bindPopup(popupContent);

  layer.on({
    click: function(e) {
      functions.loadJson(apiURL + getPokemonById + feature.id, function(response) {
        var pokemonData = ((JSON.parse(response))["data"]);
        layer._popup._contentNode.getElementsByClassName("pokemonname")[0].innerHTML = pokemonData[0].name;

        pokemonForSidebar = new Pokemon.PokemonSighting(pokemonData[0]);
        console.log("Pop up for pokemon: " + pokemonForSidebar.pokemon);
      });
    }
  });
}

function showSideBar() {
  PokeMap.prototype.emitClick(pokemonForSidebar);
}

module.exports = PokeMap;
