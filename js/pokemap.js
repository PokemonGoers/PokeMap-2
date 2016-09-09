var functions = require('./functions');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var L = require('leaflet');
require('leaflet.locatecontrol');

var mymap=null;
var sliderFrom = null;
var sliderTo = null;

var PokeMap = function(htmlElement, coordinates = [48.264673,11.671434], zoomLevel = 17) {
	this.htmlElement = htmlElement;
	this.coordinates = coordinates;
	this.zoomLevel = zoomLevel;

	this.setUpMap();
}

util.inherits(PokeMap, EventEmitter);


PokeMap.prototype.setSliderValues = function(from,to)
{
    sliderFrom = from;
    sliderTo = to;
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

		onAdd: function (map) {
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
	document.getElementsByClassName('leaflet-time-slider-hide-link')[0].onclick = function(e){
		document.getElementsByClassName('leaflet-time-slider')[0].style.display = 'none';
		document.getElementsByClassName('leaflet-time-slider-show-container')[0].style.display = 'block';
	}
	document.getElementsByClassName('leaflet-time-slider-show-link')[0].onclick = function(e){
		document.getElementsByClassName('leaflet-time-slider-show-container')[0].style.display = 'none';
		document.getElementsByClassName('leaflet-time-slider')[0].style.display = 'block';
	}

}


PokeMap.prototype.displayPokePOIs = function(pokePOIs) {

    var pokemonsPrediction = "[";
    var pokemonsSightings = null;
    var pokemonsMops = null;

	for(var i = 0; i < pokePOIs.length; i++) {

		if(pokePOIs[i] instanceof PokemonSighting) {

		}
		else if(pokePOIs[i] instanceof PokemonPrediction) {


            console.log("Prediction: " + pokePOIs[i].pokemonname);
            pokemonsPrediction += "{";

            pokemonsPrediction += '"name":"' + pokePOIs[i].pokemonname + '"';
            pokemonsPrediction +=",";
          pokemonsPrediction += '"latitude":' + pokePOIs[i].latitude;
            pokemonsPrediction +=",";
          pokemonsPrediction +=  '"longitude":' + pokePOIs[i].longitude;

            pokemonsPrediction += "}";


		}
		else if(pokePOIs[i] instanceof PokeMob) {

		}

         if(i!=pokePOIs.length-1)
                pokemonsPrediction +=",";
	}

    pokemonsPrediction +="]";

    var pokemonJson = JSON.parse(pokemonsPrediction);
    var mapData = generatePokemonPOIMapData(pokemonJson);

    	sliderFrom = new Date();
        sliderTo = new Date();
    	sliderTo.setHours(sliderFrom.getHours() + 3);

        setPokePOIsOnMap(mapData, sliderFrom, sliderTo);

}

var currentPokemonMapData = null;
setPokePOIsOnMap = function(pokemonMapData,from,to) {
	if(mymap==null) return;

    if(pokemonMapData == null)
        pokemonMapData = currentPokemonMapData;
    else
        currentPokemonMapData = pokemonMapData;

	if(typeof pokemonLayer !== "undefined") {
		map.removeLayer(pokemonLayer);
	}

	var pokemonIcon = L.Icon.extend(
	{
		options:{
			iconSize: [35,35]
		}
	});

	pokemonLayer = L.geoJson(pokemonMapData, {

		onEachFeature: onEachFeature,

		pointToLayer: function (feature, latlng) {
			var pokemon = new pokemonIcon({iconUrl: feature.properties.img});
			var pokname = feature.properties.name;
			return L.marker(latlng, {icon: pokemon, title:pokname,rinseOnHover:true});
		},

		filter: function(feature, layer) {
			var pokemonTime = new Date(feature.properties.time);

			if(pokemonTime < from) return false;
			if(to < pokemonTime) return false;

			return true;

		}
	}).addTo(map);
}

generatePokemonPOIMapData = function(predictedData) {
	var pokemonMapData = {
		"type": "FeatureCollection",
		"features": []
	};
    var now = new Date();
	for(var i = 0, n = predictedData.length; i < n; ++i) {
		now.setHours(now.getHours() + Math.floor((Math.random() * 12) - 6), Math.floor(Math.random() * 60));
		pokemonMapData.features.push({
			"id": i,
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [predictedData[i].longitude, predictedData[i].latitude]
			},
			"properties": {
				"name": predictedData[i].name,
				"type": predictedData[i].type,
				"time":  now.toISOString(),
				"probability": predictedData[i].probability,
				"img": "img/" + predictedData[i].name.toLowerCase() + ".png"
			}
		});
		console.log("generated map data for " + predictedData[i].name);
	}
	return pokemonMapData;
}


function onEachFeature(feature, layer) {
	var popupContent = "<div>";
	popupContent += "<div class='pokemonInfo'><div class='probabilityhelper' ><div class='pokemonprobability'>" + feature.properties.probability * 100 + "%</div></div><div class='pokemonname'>" + feature.properties.name + "</div>" + "<span class=''></span><button class='pokemonmore fa fa-book' onclick='showAdditionalInformation(\""+ feature.properties.name + "\")'></button>";
	popupContent+= "</div><div class='allinfo'>";
	popupContent += "<div class='pokemontime'><span class='poklabel'>Time of appearance: </span> " + new Date(feature.properties.time).toLocaleString() + "</div>";
	popupContent += "<div class='pokemontime'><span class='poklabel'>Time until appearance: </span> <span id='countdown_" + feature.id + "'></span></div>";
	popupContent += "</div></div>";
	layer.bindPopup(popupContent);

	layer.on({click: function(e) {functions.initializeCountdown("countdown_" + e.target.feature.id, new Date(e.target.feature.properties.time));}});
}

showAdditionalInformation = function(name) {
	functions.loadJson("json/pokemonbasicinfo.json", function(response) {
		var staticData = JSON.parse(response);
		var pokemon = staticData[name];
		document.getElementById("map").style.width = "calc(100% - 410px)";
		document.getElementById("sidebar").style.display = "block";
		document.getElementById("avatar").innerHTML = "<img src='img/" + name.toLowerCase() + ".png' alt='Avatar not found'>";
		document.getElementById("name").innerHTML = name;
		document.getElementById("height").innerHTML = pokemon.height;
		document.getElementById("weight").innerHTML = pokemon.weight;
		document.getElementById("typetitle").innerHTML = functions.typeTitle(pokemon.type);
		document.getElementById("type").innerHTML = functions.objectValuesToString(pokemon.type);
		document.getElementById("category").innerHTML = pokemon.category[1];
		document.getElementById("evolution").innerHTML = functions.evolutionToString(pokemon.evolution, name);
		document.getElementById("weaknessestitle").innerHTML = functions.weaknessesTitle(pokemon.weaknesses);
		document.getElementById("weaknesses").innerHTML = functions.objectValuesToString(pokemon.weaknesses);
		document.getElementById("hp").innerHTML = pokemon.stats.HP;
		document.getElementById("attack").innerHTML = pokemon.stats.Attack;
		document.getElementById("defense").innerHTML = pokemon.stats.Defense;
		document.getElementById("specialattack").innerHTML = pokemon.stats.SpecialAttack;
		document.getElementById("specialdefense").innerHTML = pokemon.stats.SpecialDefense;
		document.getElementById("speed").innerHTML = pokemon.stats.Speed;
		document.getElementById("abilities").innerHTML = functions.abilitiesToTable(pokemon.ability);
		document.getElementById("abilitiestitle").innerHTML = functions.abilitiesTitle(pokemon.ability);
	});

}

hideAdditionalInformation = function() {
	document.getElementById("map").style.width = "100%";
	document.getElementById("sidebar").style.display = "none";

}

//make PokeMap class available
module.exports = PokeMap;
