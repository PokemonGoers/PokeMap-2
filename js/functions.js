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
        }
    }

    updateCountdown();
    var interval = setInterval(updateCountdown, 1000);
}