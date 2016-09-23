var functions = require('./functions');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var L = require('leaflet');
var io = require('socket.io-client');
var socket = io.connect("http://localhost:3000");
var Pokemon = require('./basictypes');
var config = require('./config');
require('leaflet.locatecontrol');
require('leaflet-routing-machine');
require('leaflet-control-geocoder');

var mymap = null;
var apiURL={};
var getAllSightingsURL = "/api/pokemon/sighting";
var getAllSightingsByTimeRangeURL = "/api/pokemon/sighting/ts/";
var getAllPokemon = "/api/pokemon";
var getPokemonById = "/api/pokemon/id/";
var getAllPredictions = {};

var PokeMap = function(htmlElement, options={filter : {pokemonIds: 0, sightingsSince: 0, predictionsUntil: 0}, tileLayer: config.currentMap,apiEndpoint : 'http://pokedata.c4e3f8c7.svc.dockerapp.io:65014'}) {
  this.htmlElement = htmlElement;
  apiURL = options.apiEndpoint;

  // which pokemons should be shown; if null show all pokemons; otherwise only pokemons with ids in the list
  this.filterPokemons = null;

  this.markers = [];
  this.currentOpenPokemon = null;

  this.setUpMap(options.tileLayer);
  this.filter(options.filter);

  //console.log(mymap.getBounds().getNorthWest(), mymap.getBounds().getSouthEast());
};

// extend EventEmitter class
util.inherits(PokeMap, EventEmitter);

PokeMap.prototype.setUpMap = function(tileLayer) {
  L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';
  mymap = L.map(this.htmlElement).fitWorld();//.setView(this.coordinates, this.zoomLevel);
  window.map = mymap; // Set map as a global variable

  L.tileLayer(tileLayer, {
    maxZoom: 18
  }).addTo(mymap);

  L.control.locate().addTo(map);

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


};


PokeMap.prototype.goTo = function({coordinates, zoomLevel}) {
  //mymap.panTo([params.coordinates.latitude, params.coordinates.longitude],params.zoomLevel);
  mymap.setView([coordinates.latitude, coordinates.longitude],zoomLevel);
};

PokeMap.prototype.emitMove = function(coordinates,zoomLevel) {
  console.log("Move emitted");
    this.emit('move', {coordinates,zoomLevel});
};

PokeMap.prototype.emitClick = function(pokePOI) {
  console.log("Click emitted!", "Sending data: ", pokePOI);
  this.emit('click', pokePOI);
};

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

    onEachFeature: function onEachFeature(feature, layer) {
      layer.on({
        click: function(e) {
          var URL= "http://pokedata.c4e3f8c7.svc.dockerapp.io:65014/api/pokemon/id/" + feature.id;
          functions.loadJson(URL, function(pokePOI) {
            PokeMap.prototype.emitClick(pokePOI);
          });

        }
      });
    },

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
   var URL= "http://pokedata.c4e3f8c7.svc.dockerapp.io:65014/api/pokemon/sighting";
  console.log("Fetching data from ", URL);
  functions.loadJson(URL, function(response) {
    console.log("Data fetched. Generating map data.");
    var sightingsData = (JSON.parse(response))["data"];
    pokemonMapData = PokeMap.prototype.generatePokemonSightingsMapData(sightingsData);
    setPokemonOnMap();
  });
};

// Not implemented! Copy Timo's or Elma's data from one of the previous commits
PokeMap.prototype.showPokemonPredictions = function(predictionsUntil) {
//  var URL = apiURL + getAllPredictions + this.getFromForAPI() + "/range/" + this.getToForAPI();
//  functions.loadJson(URL, function(response) {
//    var predictedData = (JSON.parse(response))["data"];
//    pokemonMapData = PokeMap.prototype.generatePokemonPredictionsMapData(predictedData);
//    setPokemonOnMap();
//  });
};

PokeMap.prototype.showPokemonMobs = function() {
};

PokeMap.prototype.updateTimeRange = function(timeRange) {
  this.sliderFrom = timeRange.from;
  this.sliderTo = timeRange.to;

  this.showPokemonSightings();
  this.showPokemonPrediction();
};

PokeMap.prototype.generatePokemonSightingsMapData = function(sightingsData) {
  console.log("Generating pokemon sightings map data");
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
      "pokePOI": sightingsData[i],
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [sightingsData[i].location.coordinates[0], sightingsData[i].location.coordinates[1]]
      },
      "properties": {
        "img": "http://pokedata.c4e3f8c7.svc.dockerapp.io:65014/api/pokemon/id/" + sightingsData[i].pokemonId +"/icon/gif",
        "time": sightingsData[i].appearedOn
      }
    });
  }

  return pokemonMapData
};



var route;
PokeMap.prototype.navigate = function(start, destination) {
  route = L.Routing.control({
    waypoints: [{
      lat: start.latitude,
      lng: start.longitude
    }, {
      lat: destination.latitude,
      lng: destination.longitude
    }],
    geocoder: L.Control.Geocoder.nominatim()
  }).addTo(map);
};

PokeMap.prototype.clearRoutes = function() {
  if(typeof route !== 'undefined') {
    route.setWaypoints([]);
    var routingContainer = document.getElementsByClassName('leaflet-routing-container')[0];
    routingContainer.parentNode.removeChild(routingContainer);
    console.log('Success: cleared route.');
  } else {
    console.log('Error: no route defined.');
  }
};

module.exports = PokeMap;
