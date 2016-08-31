function loadJson(file, callback) {
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

function mergeObjects(object_1, object_2) {
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

function objectToArray(object) {
    var array = [];
    for(property in object) {
        array[property] = object[property];
    }
    return array;
}

function objectValuesToString(object) {
    var string = "";
    for(key in object) {
        string += object[key] + ", ";
    }
    return string.slice(0, -2);
}

function evolutionToString(evolution, pokemonName) {
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

function abilitiesToTable(abilities) {
    string = "<table>";
    for(ability in abilities) {
        string += "<tr><td class='labelpok'>" + abilities[ability].name + "</td><td class='infopok' style='text-align: justify;'>" + abilities[ability].description + "</td></tr>";
    }
    string += "</table>";
    return string;
}

function abilitiesTitle(abilities) {
    if (Object.keys(abilities).length == 1) {
        return "Ability";
    } else {
        return "Abilities";
    }
}

function initializeCountdown(id, time) {
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
            countdownSpan.innerHTML = "Pokémon already appeared!";
        }
    }
    updateCountdown();
    var interval = setInterval(updateCountdown, 1000);
}