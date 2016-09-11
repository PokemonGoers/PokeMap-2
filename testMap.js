
var functions = require('./js/functions');
var PokeMap = require('./js/pokemap');

var sidebarHTML = '<div id="sidebar">\
		<!--<div id="close"><a href="#" onclick="hideAdditionalInformation()">×</a></div>-->\
		<div class="avatarhelper"><div id="avatar"></div></div>\
		<div class="titlehelper"><div id="name">Pokemon Name</div><div class="closehelper fa fa-times-circle" onclick="hideAdditionalInformation()"></div></div>\
		<h2><span class="fa fa-info-circle"></span> Information</h2>\
		<table>\
			<tr><td class="labelpok">Evolution:</td><td class="infopok"><span id="evolution"></span></td></tr>\
			<tr><td class="labelpok">Category:</td><td class="infopok"><span id="category"></span></td></tr>\
			<tr><td class="labelpok"><span id="typetitle"></span>:</td><td class="infopok"><span id="type"></span></td></tr>\
			<tr><td class="labelpok"><span id="weaknessestitle"></span>:</td><td class="infopok"><span id="weaknesses"></span></td></tr>\
			<tr><td class="labelpok">Height:</td><td class="infopok"><span id="height"></span></td></tr>\
			<tr><td class="labelpok">Weight:</td><td class="infopok"><span id="weight"></span></td></tr>\
		</table>\
		<h2><span class="fa fa-check-square-o"></span> <span id="abilitiestitle"></span></h2>\
		<span id="abilities"></span>\
		<h2><span class="fa fa-bar-chart"></span> Stats</h2>\
		<table class="stats">\
			<tr class="labelstats"><td rowspan="2">HP</td><td colspan="2" style="border: 0;">Attack</td><td colspan="2" style="border: 0;">Defense</td><td rowspan="2">Speed</td></tr>\
			<tr class="labelstats"><td>normal</td><td>special</td><td>normal</td><td>special</td></tr>\
			<tr class="labelstats"><td><span id="hp"></span></td><td><span id="attack"></span></td><td><span id="defense"></span></td><td><span id="specialattack"></span></td><td><span id="specialdefense"></span></td><td><span id="speed"></span></td></tr>\
		</table>\
	</div>';


var elemDiv = document.createElement('div');
elemDiv.innerHTML = sidebarHTML;
document.body.appendChild(elemDiv);


var poke = new PokeMap('map', [[48.264673,11.671434], [2,5], "http://pokedata.c4e3f8c7.svc.dockerapp.io:65014"]);
var from = new Date("2016-08-01T00:00:00.000Z");
var to = new Date("2016-10-01T00:00:00.000Z");
poke.loadPokemonData(poke.initializePokemonLayer, from, to);
functions.initializeSlider();
