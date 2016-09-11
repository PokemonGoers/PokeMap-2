
class Pokemon 
{
    constructor(pokemonJSON)
    {
        this.pokemonname = pokemonJson['name'];
        this.type = pokemonJson['type'];
    }
}


class PokePOI 
{
    constructor(pokemonJSON)
    {
        this.latitude = pokemonJSON['latitude'];
        this.longitude = pokemonJSON['longitude'];
    }
}

class PokemonSighting extends PokePOI{
    
    constructor(pokemonJson)
        { 
        super(pokemonJson);
         this.date = pokemonJson['date'];
         this.pokemon = new Pokemon(pokemonJson);
    }
}

class PokemonPrediction extends PokePOI{
    
    constructor(pokemonJson)
    { 
        super(pokemonJson);
        this.date = pokemonJson['date'];
        this.accuracy = pokemonJson['accuracy'];
        this.pokemon = new Pokemon(pokemonJson);
    }
}

class PokeMob extends PokePOI{
    
    constructor(pokemonJson)
    { 
        super(pokemonJson);
        this.date = pokemonJson['date'];
    }
}