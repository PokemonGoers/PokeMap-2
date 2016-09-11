var functions = require('./functions');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var L = require('leaflet');
require('leaflet.locatecontrol');

var mymap = null;
var apiURL={};
var getAllSightingsURL = "/api/pokemon/sighting";
var getAllSightingsByTimeRangeURL = "/api/pokemon/sighting/ts/";
var getAllPokemon = "/api/pokemon";
var getPokemonById = "/api/pokemon/id/";

var PokeMap = function(htmlElement, coordinates = {latitude: 48.264673, longitude: 11.671434} , timeRange = {from: -200000, to: 30}, apiEndPoint="http://pokedata.c4e3f8c7.svc.dockerapp.io:65014") {
    this.htmlElement = htmlElement;
    this.coordinates = [coordinates.latitude, coordinates.longitude];
    console.log(this.coordinates);
    this.zoomLevel = 5;
    this.sliderFrom = timeRange.from;
    this.sliderTo = timeRange.to;
    this.mobSocket = new WebSocket("ws://www.example.com/socketserver");
    this.mobSocket.onmessage = function (event) {
      console.log("Mob detected!");
      var mob = JSON.parse(event.data);
      L.circle(mob.coordinates, 100, {
          color: '#808080',
          fillColor: 'red',
          fillOpacity: 0.1
      }).addTo(mymap).bindPopup("PokeMob detected here! Date: " + mob.date);
      console.log("PokeMob displayed at coordinates: ", pokeMob.coordinates);
    }

    this.markers = [];
    this.currentOpenPokemon = null;

    console.log("here");
    apiURL = apiEndPoint;
    this.setUpMap();
    this.showPokemonSightings();

    //console.log(mymap.getBounds().getNorthWest(), mymap.getBounds().getSouthEast());
}

util.inherits(PokeMap, EventEmitter);

// pokemon sightings are fetched with two params: from - starting date in UTC format and to - time span in mins
PokeMap.prototype.getFromForAPI = function() {
  console.log(this.sliderFrom);
    console.log(new Date());
    console.log(functions.addMinutes(new Date(), this.sliderFrom).toISOString());
  return functions.addMinutes(new Date(), this.sliderFrom).toISOString();
}

PokeMap.prototype.getToForAPI = function() {
  console.log("SliderTO: " + this.sliderTo);
  return (Math.abs(this.sliderFrom) + this.sliderTo) + "m";
}

PokeMap.prototype.setUpMap = function() {
    L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';
    mymap = L.map(this.htmlElement).setView(this.coordinates, this.zoomLevel);
    window.map = mymap; // Set map as a global variable

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
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
}


PokeMap.prototype.goTo = function(coordinates, zoomLevel) {
    mymap.panTo(coordinates, zoomLevel);
}

PokeMap.prototype.emitMove = function(coordinates, zoomLevel) {
    this.emit('move', coordinates, zoomLevel);
}

//PokeMap.prototype.on('move', function(a, b) {console.log(a + " " + b);})
var pokemonLayer, pokemonMapData;
setPokemonOnMap = function() {
    if (mymap == null) return;

    if (typeof pokemonLayer !== "undefined") {
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

PokeMap.prototype.showPokemonSightings = function() {
  var URL = apiURL + getAllSightingsByTimeRangeURL + this.getFromForAPI() + "/range/" + this.getToForAPI();
  functions.loadJson(URL, function(response) {
    var sightingsData = (JSON.parse(response))["data"];
    pokemonMapData = PokeMap.prototype.generatePokemonSightingsMapData(sightingsData);
    setPokemonOnMap();
  });
}

PokeMap.prototype.showPokemonPrediction = function() {
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
        //If there is no location, then don't show pokemon
        if(sightingsData[i].location == null)
            continue;

        pokemonMapData.features.push({
            "id": sightingsData[i].pokemonId,
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [sightingsData[i].location.coordinates[0], sightingsData[i].location.coordinates[1]]
            },
            "properties": {
                "img": "img/bulbasaur.png",
                "time": sightingsData[i].appearedOn
            }
        });
    }

    return pokemonMapData
}



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
        console.log(pokemonData);
        layer._popup._contentNode.getElementsByClassName("pokemonname")[0].innerHTML = pokemonData[0].name;
        console.log(layer._popup._contentNode);
      });
    }
  });
}

showSideBar = function() {

}

module.exports = PokeMap;
