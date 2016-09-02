(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports.loadJson = function(file, callback) {
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open('GET', file, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == "200") {
            callback(request.responseText);
        }
    };
    request.send(null);
}

exports.mergeObjects = function(object_1, object_2) {
    for(var property in object_2) {
        try {
            if (object_2[property].constructor == Object) {
                object_1[property] = mergeObjects(object_1[property], object_2[property]);
            } else {
                object_1[property] = object_2[property];
            }
       } catch(e) {
            object_1[property] = object_2[property];
        }
    }
    return object_1;
}

exports.objectToArray = function(object) {
    var array = [];
    for(property in object) {
        array[property] = object[property];
    }
    return array;
}

exports.objectValuesToString = function(object) {
    var string = "";
    for(key in object) {
        string += object[key] + ", ";
    }
    return string.slice(0, -2);
}

exports.evolutionToString = function(evolution, pokemonName) {
    var string = "";
    for(key in evolution) {
        evolutionName = evolution[key].substring(0,1).toUpperCase() + evolution[key].substring(1, evolution[key].length);
        if (pokemonName === evolutionName) {
            string += "<b>";
        }
        string += evolutionName;
        if (pokemonName == evolutionName) {
            string += "</b>";
        }
        string += " <span class='a'></span> ";
    }
    return string.slice(0, -25);
}

exports.abilitiesToTable = function(abilities) {
    string = "<table>";
    for(ability in abilities) {
        string += "<tr><td class='labelpok'>" + abilities[ability].name + "</td><td class='infopok' style='text-align: justify;'>" + abilities[ability].description + "</td></tr>";
    }
    string += "</table>";
    return string;
}

exports.abilitiesTitle = function(abilities) {
    if (Object.keys(abilities).length == 1) {
        return "Ability";
    } else {
        return "Abilities";
    }
}

exports.initializeCountdown = function(id, time) {
    var countdownSpan = document.getElementById(id);

    function updateCountdown() {
        var t = Date.parse(time) - Date.parse(new Date());
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60* 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));

        countdownSpan.innerHTML = days + " days, " + ('0' + hours).slice(-2) + ":" + ('0' + minutes).slice(-2) + ":" + ('0' + seconds).slice(-2);

        if (t <= 0) {
            clearInterval(interval);
        }
    }

    updateCountdown();
    var interval = setInterval(updateCountdown, 1000);
}
},{}],2:[function(require,module,exports){
		
		//Our Location
		//var x = 48.16;
		//var y = 11.6;
		var functions = require('./functions');

		var mymap=null;

		exports.setUpMap = function(x,y) {
			mymap = L.map('map').setView([x, y], 17);
			window.map = mymap; // Set map as a global variable

			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
			}).addTo(mymap);


			/*var popup = L.popup();

			function onMapClick(e) {
				popup
					.setLatLng(e.latlng)
					.setContent("You clicked the map at " + e.latlng.toString())
					.openOn(mymap);
			}

			mymap.on('click', onMapClick);*/
		}

		exports.setUpLocation = function(x,y) {
			if(mymap==null) return;

			L.marker([x,y]).addTo(mymap).bindPopup("Your location.");

			L.circle([x, y], 200, {
				color: '#808080',
				fillColor: 'red',
				fillOpacity: 0.1
			}).addTo(mymap).bindPopup("Pokemons appear here!");
		}

		/* filter Pokemon by passing from & to as date-objects */
		exports.loadPokemonData = function(callback, from, to) {
			if(typeof from === "undefined" || !(from instanceof Date)) {
				from = new Date();
				console.log("parameter 'from' is no date-object and will be changed to " + from.toString());
			}
			if(typeof to === "undefined" || !(to instanceof Date)) {
				to = new Date(from.getTime());
				to.setMonth(to.getMonth() + 1);
				console.log("parameter 'to' is no date-object and will be changed to " + to.toString());
			}
			functions.loadJson("json/predicted-data.json", function(response) {
				var predictedData = JSON.parse(response);
				console.log("loaded predicted pokemon (" + predictedData.length + " found)");
				var predictedData = predictedData.filter(function(pokemon) {
					var pokemonTime = new Date(pokemon.time);
					if(pokemonTime < from) return false;
					if(to < pokemonTime) return false;
					return true;
				});
				console.log("filtered pokemon from " + from.toString() + " to " + to.toString() + " (" + predictedData.length + " found)");
				functions.loadJson("json/pokemonbasicinfo.json", function(response) {
					var staticData = JSON.parse(response);
					for(var i = 0, n = predictedData.length; i < n; ++i) {
						predictedData[i] = functions.mergeObjects(predictedData[i], staticData[predictedData[i].name]);
						console.log("added static data for " + predictedData[i].name);
					}
					callback(predictedData);
				});
			});
		}

		exports.generatePokemonMapData = function(predictedData) {
			var pokemonMapData = {
				"type": "FeatureCollection",
				"features": []
			};
			for(var i = 0, n = predictedData.length; i < n; ++i) {
				pokemonMapData.features.push({
					"id": i,
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [predictedData[i].longitude, predictedData[i].latitude]
					},
					"properties": {
						"name": predictedData[i].name,
						"time": predictedData[i].time,
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


		exports.setPokemonOnMap = function(predictedData) {
			var pokemonMapData = exports.generatePokemonMapData(predictedData);
			if(mymap==null) return;

			var pokemonIcon = L.Icon.extend(
			{
				options:{
					iconSize: [35,35]
				}
			});

			function onEachFeature(feature, layer) {
				var pokemonName = feature.properties.name;
				var pokemonType = feature.properties.type;
				var pokemonEvolution = feature.properties.evolution;
				var pokemonProbability = feature.properties.probability;
				var pokemonTime = new Date(feature.properties.time);

				var popupContent = "<div>";
                popupContent += "<div class='pokemonInfo'><div class='probabilityhelper' ><div class='pokemonprobability'>" + pokemonProbability * 100 + "%</div></div><div class='pokemonname'>" + pokemonName + "</div>" + "<button class='pokemonmore' onclick='opencyclemap.showAdditionalInformation(\""+ pokemonName + "\")'></button>";
                popupContent+= "</div><div class='allinfo'>";
				//popupContent += "<div class='pokemontype'><span class='poklabel'>Type: </span>" + objectValuesToString(pokemonType) + "</div>";
				//popupContent += "<div class='pokemonevolution'><span class='poklabel'>Evolution: </span>" + evolutionToString(pokemonEvolution, pokemonName) + "</div>";
				popupContent += "<div class='pokemontime'><span class='poklabel'>Time of appearance: </span> " + feature.properties.time.replace("T", " ").slice(0, 16) + "</div>";
				//popupContent += "<div class='pokemontime'><span class='poklabel'>Time until appearance: </span> <span id='countdown" + pokemonName + "'></span></div>";
                popupContent += "</div></div>";
				layer.bindPopup(popupContent);

				//initializeCountdown("countdown" + pokemonName, pokemonTime);

			}

			L.geoJson(pokemonMapData, {

				onEachFeature: onEachFeature,

				pointToLayer: function (feature, latlng) {
					var pokemon = new pokemonIcon({iconUrl: feature.properties.img});
					var pokname = feature.properties.name;
					return L.marker(latlng, {icon: pokemon, title:pokname,rinseOnHover:true});
				}
			}).addTo(map);

		}

		exports.showAdditionalInformation = function(name) {
			loadJson("json/pokemonbasicinfo.json", function(response) {
				var staticData = JSON.parse(response);
				var pokemon = staticData[name];
				document.getElementById("map").style.width = "calc(100% - 410px)";
				document.getElementById("sidebar").style.display = "block";
				document.getElementById("avatar").innerHTML = "<img src='img/" + name.toLowerCase() + ".png'>";
				document.getElementById("name").innerHTML = name;
				document.getElementById("height").innerHTML = pokemon.height;
				document.getElementById("weight").innerHTML = pokemon.weight;
				document.getElementById("type").innerHTML = pokemon.type[0];
				document.getElementById("category").innerHTML = pokemon.category[1];
				document.getElementById("evolution").innerHTML = evolutionToString(pokemon.evolution, name);
				document.getElementById("weaknesses").innerHTML = objectValuesToString(pokemon.weaknesses);
				document.getElementById("hp").innerHTML = pokemon.stats.HP;
				document.getElementById("attack").innerHTML = pokemon.stats.Attack;
				document.getElementById("defense").innerHTML = pokemon.stats.Defense;
				document.getElementById("specialattack").innerHTML = pokemon.stats.SpecialAttack;
				document.getElementById("specialdefense").innerHTML = pokemon.stats.SpecialDefense;
				document.getElementById("speed").innerHTML = pokemon.stats.Speed;
				document.getElementById("abilities").innerHTML = abilitiesToTable(pokemon.ability);
				document.getElementById("abilitiestitle").innerHTML = abilitiesTitle(pokemon.ability);
			});

		}

		exports.hideAdditionalInformation = function() {
			document.getElementById("map").style.width = "100%";
			document.getElementById("sidebar").style.display = "none";
		}
        
    
},{"./functions":1}],3:[function(require,module,exports){
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

},{"./js/functions":1,"./js/opencyclemap":2}]},{},[3]);
