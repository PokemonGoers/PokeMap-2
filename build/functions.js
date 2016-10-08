exports.loadJson = function (file, callback) {
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open('GET', file, true);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == "200") {
            callback(request.responseText);
        }
    };
    request.send(null);
};

exports.loadJsonTemp = function (file, callback) {
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open('GET', file, false);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == "200") {
            callback(request.responseText);
        }
    };
    request.send(null);
};

exports.mergeData = function (data1, data2) {
    var staticData = [];
    for (var k = 0; k < data1.length; k++) {
        for (var l = 0; l < data2.length; l++) {
            if (data1[k].pokemonId == data2[l].pokemonId) {
                staticData.push(data2[l]);
            }
        }
    }
    return staticData;
};

exports.mergeObjects = function (object_1, object_2) {
    for (var property in object_2) {
        try {
            if (object_2[property].constructor == Object) {
                object_1[property] = mergeObjects(object_1[property], object_2[property]);
            } else {
                object_1[property] = object_2[property];
            }
        } catch (e) {
            object_1[property] = object_2[property];
        }
    }
    return object_1;
};

exports.addMinutes = function (date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
};

exports.subtractSeconds = function (date, seconds) {
    return new Date(date.getTime() - seconds * 1000);
};