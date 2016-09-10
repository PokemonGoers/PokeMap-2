var functions = require('./functions');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var L = require('leaflet');
require('leaflet.locatecontrol');

var mymap = null;

var PokeMap = function(htmlElement, coordinates = [48.264673, 11.671434], zoomLevel = 17) {
    this.htmlElement = htmlElement;
    this.coordinates = coordinates;
    this.zoomLevel = zoomLevel;

    this.setUpMap();
}

util.inherits(PokeMap, EventEmitter);


//PokeMap.prototype.setSliderValues = function(from, to) {
//    sliderFrom = from;
//    sliderTo = to;
//}

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


PokeMap.prototype.displayPokeMob = function(pokeMob) {
    L.circle(pokeMob.coordinates, 100, {
        color: '#808080',
        fillColor: 'red',
        fillOpacity: 0.1
    }).addTo(mymap).bindPopup("PokeMob detected here! Date: " + pokeMob.date);
    console.log("PokeMob displayed at coordinates: ", pokeMob.coordinates);
}

PokeMap.prototype.goTo = function(coordinates, zoomLevel) {
    mymap.panTo(coordinates, zoomLevel);
    console.log("GoTo method executed with params (" + coordinates + "), (" + zoomLevel + ")");
}

PokeMap.prototype.emitMove = function(coordinates, zoomLevel) {
    this.emit('move', coordinates, zoomLevel);
    console.log("Emitted 'move' event with params (" + coordinates + "), (" + zoomLevel + ")");
    this.goTo(coordinates, zoomLevel + 3);
}

//PokeMap.prototype.on('move', function(a, b) {console.log(a + " " + b);})



var pokemonLayer, pokemonMapData;
PokeMap.prototype.initializePokemonLayer = function(predictedData) {
    pokemonMapData = PokeMap.prototype.generatePokemonMapData(predictedData);
    var from = new Date(),
        to = new Date();
    to.setHours(from.getHours() + 3);
    setPokemonOnMap(from, to);
}

setPokemonOnMap = function(from, to) {
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
        },

        filter: function(feature, layer) {
            var pokemonTime = new Date(feature.properties.time);
            if (pokemonTime < from) return false;
            if (to < pokemonTime) return false;
            return true;
        }

    }).addTo(map);
}


PokeMap.prototype.loadPokemonData = function(callback, from, to) {
    if (typeof from === "undefined" || !(from instanceof Date)) {
        from = new Date();
        console.log("parameter 'from' is no date-object and will be changed to " + from.toString());
    }
    if (typeof to === "undefined" || !(to instanceof Date)) {
        to = new Date(from.getTime());
        to.setMonth(to.getMonth() + 1);
        console.log("parameter 'to' is no date-object and will be changed to " + to.toString());
    }
    functions.loadJson("json/predicted-data.json", function(response) {
        var predictedData = JSON.parse(response);
        console.log("loaded predicted pokemon (" + predictedData.length + " found)");
        var predictedData = predictedData.filter(function(pokemon) {
            var pokemonTime = new Date(pokemon.time);
            if (pokemonTime < from) return false;
            if (to < pokemonTime) return false;
            return true;
        });
        console.log("filtered pokemon from " + from.toString() + " to " + to.toString() + " (" + predictedData.length + " found)");
        functions.loadJson("json/pokemonbasicinfo.json", function(response) {
            var staticData = JSON.parse(response);
            for (var i = 0, n = predictedData.length; i < n; ++i) {
                predictedData[i] = functions.mergeObjects(predictedData[i], staticData[predictedData[i].name]);
                console.log("added static data for " + predictedData[i].name);
            }
            callback(predictedData);
        });
    });
}

PokeMap.prototype.generatePokemonMapData = function(predictedData) {
    var pokemonMapData = {
        "type": "FeatureCollection",
        "features": []
    };
    var now = new Date();
    for (var i = 0, n = predictedData.length; i < n; ++i) {
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
                // manipulate time to test the filter function
                "time": now.toISOString(),
                // "time": predictedData[i].time,
                "type": predictedData[i].type,
                "evolution": predictedData[i].evolution,
                "probability": predictedData[i].probability,
                "img": "img/" + predictedData[i].name.toLowerCase() + ".png"
            }
        });
        console.log("generated map data for " + predictedData[i].name);
    }
    return pokemonMapData
}

hideAdditionalInformation = function() {
    document.getElementById("map").style.width = "100%";
    document.getElementById("sidebar").style.display = "none";

}

function onEachFeature(feature, layer) {
    var popupContent = "<div>";
    popupContent += "<div class='pokemonInfo'><div class='probabilityhelper' ><div class='pokemonprobability'>" + feature.properties.probability * 100 + "%</div></div><div class='pokemonname'>" + feature.properties.name + "</div>" + "<span class=''></span><button class='pokemonmore fa fa-book' onclick='showAdditionalInformation(\"" + feature.properties.name + "\")'></button>";
    popupContent += "</div><div class='allinfo'>";
    popupContent += "<div class='pokemontime'><span class='poklabel'>Time of appearance: </span> " + new Date(feature.properties.time).toLocaleString() + "</div>";
    popupContent += "<div class='pokemontime'><span class='poklabel'>Time until appearance: </span> <span id='countdown_" + feature.id + "'></span></div>";
    popupContent += "</div></div>";
    layer.bindPopup(popupContent);

    layer.on({
        click: function(e) {
            functions.initializeCountdown("countdown_" + e.target.feature.id, new Date(e.target.feature.properties.time));
        }
    });
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

//make PokeMap class available
module.exports = PokeMap;