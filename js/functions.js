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
        if(object_2.hasOwnProperty(property)) continue;
        console.log("konstruktor: " + object_2[property].constructor);
        if(object_2[property].constructor == Object) {
            object_1[property] = mergeObjects(object_1[property], object_2[property]);
        } else {
            object_1[property] = object_2[property];
        }
    }
    return object_1;
}