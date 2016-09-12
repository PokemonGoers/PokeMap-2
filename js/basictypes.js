var util = require('util');

exports.Pokemon = function(pokemonJson) {
  console.log(pokemonJson);
  this.pokemonname = pokemonJson['name'];
  this.types = pokemonJson['types'];
}


exports.PokePOI = function(pokemonJson) {
  this.latitude = pokemonJson['latitude'];
  this.longitude = pokemonJson['longitude'];
}

exports.PokemonSighting = function(pokemonJson) {
//  this.super_.apply(this, pokemonJson);
  this.date = pokemonJson['date'];
  this.pokemon = new exports.Pokemon(pokemonJson);
}


exports.PokemonSighting.prototype = Object.create(exports.PokePOI.prototype);
util.inherits(exports.PokemonSighting, exports.PokePOI);


exports.PokemonPrediction = function(pokemonJson) {
//  this.super_.apply(this, pokemonJson);
  this.date = pokemonJson['date'];
  this.accuracy = pokemonJson['accuracy'];
  this.pokemon = new exports.Pokemon(pokemonJson);
}

exports.PokemonPrediction.prototype = Object.create(exports.PokePOI.prototype);
util.inherits(exports.PokemonPrediction, exports.PokePOI);

exports.PokeMob = function(pokemonJson) {
//  this.super_.apply(this, pokemonJson);
  this.date = pokemonJson['date'];
}

exports.PokeMob.prototype = Object.create(exports.PokePOI.prototype);
util.inherits(exports.PokeMob, exports.PokePOI);
