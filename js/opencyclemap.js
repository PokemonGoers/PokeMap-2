		
		//Our Location
		//var x = 48.16;
		//var y = 11.6;

		var mymap=null;

		function setUpMap(x,y)
		{
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

		function setUpLocation(x,y)
		{
			if(mymap==null) return;

			L.marker([x,y]).addTo(mymap).bindPopup("Your location.");

			L.circle([x, y], 100, {
				color: '#808080',
				fillColor: 'red',
				fillOpacity: 0.1
			}).addTo(mymap).bindPopup("Pokemons appear here!");
		}

		function setPokemonsOnMap(dummyData)
		{
			if(mymap==null) return;

			var pokemonIcon = L.Icon.extend(
			{
				options:{
					iconSize: [35,35]
				}
			});

			function onEachFeature(feature, layer) {
				var pokemonName = feature.properties.name;
				var pokemonType = feature.properties.poktype;
				var pokemonEvolution = feature.properties.evolution;
				var pokemonProbability = feature.properties.probability;

				var popupContent = "<div id='pokemonInfo'><div id='pokemonname'>"+ pokemonName + "</div>" + "<a href='#' id='pokemonmore'></a></div>";
				popupContent += "<div id='pokemonbox'><div id='pokemonprobability'>" + pokemonProbability + "</div></div>";
				popupContent += "<div id='pokemontype'><span id='poklabel'>Type: </span>" + pokemonType + "</div>";
				popupContent += "<div id='pokemonevolution'><span id='poklabel'>Evolution: </span>" + pokemonEvolution + "</div>";


				layer.bindPopup(popupContent);
			}

			L.geoJson(dummyData, {

				onEachFeature: onEachFeature,

				pointToLayer: function (feature, latlng) {
					var pokemon = new pokemonIcon({iconUrl: feature.properties.img});
					var pokname = feature.properties.name;
					return L.marker(latlng, {icon: pokemon, title:pokname,rinseOnHover:true});
				}
			}).addTo(map);

		}
