		
		//Our Location
		//var x = 48.16;
		//var y = 11.6;

		var mymap=null;

		function setUpMap(x,y) {
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

		function setUpLocation(x,y) {
			if(mymap==null) return;

			L.marker([x,y]).addTo(mymap).bindPopup("Your location.");

			L.circle([x, y], 200, {
				color: '#808080',
				fillColor: 'red',
				fillOpacity: 0.1
			}).addTo(mymap).bindPopup("Pokemons appear here!");
		}

		/* filter Pokemon by passing from & to as date-objects */
		function loadPokemonData(callback, from, to) {
			if(typeof from === "undefined" || !(from instanceof Date)) {
				from = new Date();
				console.log("parameter 'from' is no date-object and will be changed to " + from.toString());
			}
			if(typeof to === "undefined" || !(to instanceof Date)) {
				to = new Date(from.getTime());
				to.setMonth(to.getMonth() + 1);
				console.log("parameter 'to' is no date-object and will be changed to " + to.toString());
			}
			loadJson("json/predicted-data.json", function(response) {
				var predictedData = JSON.parse(response);
				console.log("loaded predicted pokemon (" + predictedData.length + " found)");
				loadJson("json/pokemonbasicinfo.json", function(response) {
					var staticData = JSON.parse(response);
					for(var i = 0, n = predictedData.length; i < n; ++i) {
						predictedData[i] = mergeObjects(predictedData[i], staticData[predictedData[i].name]);
						console.log("added static data for " + predictedData[i].name);
					}
					predictedData = predictedData.filter(function(pokemon) {
						var pokemonTime = new Date(pokemon.time);
						if(pokemonTime < from) return false;
						if(to < pokemonTime) return false;
						return true;
					});
					console.log("filtered pokemon from " + from.toString() + " to " + to.toString() + " (" + predictedData.length + " found)");
					callback(predictedData);
				});
			});
		}

		function generatePokemonMapData(predictedData) {
			var id = 0;
			var pokemonMapData = {
				"type": "FeatureCollection",
				"features": []
			};
			for(var i = 0, x = predictedData.length; i < x; ++i) {
				pokemonMapData.features.push({
					"id": i,
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [predictedData[i].longitude, predictedData[i].latitude]
					},
					"properties": {
						"name": predictedData[i].name,
						"type": typeToString(predictedData[i].type),
						"evolution": evolutionToString(predictedData[i].evolution),
						"probability": predictedData[i].probability,
						"img": "img/" + predictedData[i].name.toLowerCase() + ".png",
					}
				});
				console.log("generated map data for " + predictedData[i].name);
				id++;
			}
			return pokemonMapData
		}


		function setPokemonOnMap(predictedData) {
			var pokemonMapData = generatePokemonMapData(predictedData);
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

				var popupContent = "<div id='pokemonInfo'><div id='pokemonname'>"+ pokemonName + "</div>" + "<a href='#' id='pokemonmore'></a></div>";
				popupContent += "<div id='pokemonbox'><div id='pokemonprobability'>" + pokemonProbability * 100 + "%</div></div>";
				popupContent += "<div id='pokemontype'><span id='poklabel'>Type: </span>" + pokemonType + "</div>";
				popupContent += "<div id='pokemonevolution'><span id='poklabel'>Evolution: </span>" + pokemonEvolution + "</div>";


				layer.bindPopup(popupContent);
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
