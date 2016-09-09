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

exports.loadJsonTemp = function(file, callback) {
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open('GET', file, false);
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

exports.typeTitle = function(type) {
    if (Object.keys(type).length == 1) {
        return "Type";
    } else {
        return "Types";
    }
}

exports.evolutionToString = function(evolution, pokemonName) {
    var string = "";
    for(key in evolution) {
        evolutionName = evolution[key].substring(0,1).toUpperCase() + evolution[key].substring(1, evolution[key].length);
        if (pokemonName === evolutionName) {
            string += "<b>";
        } else {
            string += "<a href='#' onclick='showAdditionalInformation(\"" + evolutionName + "\")'>";
        }
        string += evolutionName;
        if (pokemonName == evolutionName) {
            string += "</b>";
        } else {
            string += "</a>";
        }
        string += " <span class='a'></span> ";
    }
    return string.slice(0, -25);
}

exports.weaknessesTitle = function(weaknesses) {
    if (Object.keys(weaknesses).length == 1) {
        return "Weakness";
    } else {
        return "Weaknesses";
    }
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
        var daystring = "";
        if(days !== 0) {
            daystring = days + " days, ";
        }
        countdownSpan.innerHTML = daystring + ('0' + hours).slice(-2) + ":" + ('0' + minutes).slice(-2) + ":" + ('0' + seconds).slice(-2);

        if (t <= 0) {
            clearInterval(interval);
            countdownSpan.innerHTML = "Pokémon already appeared!";
        }
    }

    updateCountdown();
    var interval = setInterval(updateCountdown, 1000);
}

exports.initializeSlider = function() {
    document.getElementsByClassName('leaflet-time-slider-bar')[0].id = 'slider';
    document.getElementsByClassName('leaflet-time-slider-from')[0].id = 'slider_from';
    document.getElementsByClassName('leaflet-time-slider-to')[0].id = 'slider_to';

    var offset = new Date().getTimezoneOffset() / 60;

    var mySlider = new dhtmlXSlider({
        parent: "slider",
        linkTo: ["slider_from", "slider_to"],
        step: 0.5,
        min: -12,
        max: 12,
        value: [0, 3],
        range: true,
    });

    updateMap([0, 3]);
    mySlider.setSkin("dhx_terrace");
    mySlider.attachEvent("onSlideEnd", function(value) { updateMap(value); });
};

updateMap = function(value) {
    var now = new Date();
    var from = new Date();
    var from_min = Math.floor(value[0]) === value[0] ? from.getMinutes() : from.getMinutes() + 30;
    var to = new Date();
    var to_min = Math.floor(value[1]) === value[1] ? to.getMinutes() : to.getMinutes() + 30;
    from.setHours(now.getHours() + Math.floor(value[0]), from_min);
    to.setHours(now.getHours() + Math.floor(value[1]), to_min);
    document.getElementById("slider_from").innerHTML = from.toLocaleString();
    document.getElementById("slider_to").innerHTML = to.toLocaleString();
    
    setInterval(from,to);
    setPokePOIsOnMap(null,from,to);
}
