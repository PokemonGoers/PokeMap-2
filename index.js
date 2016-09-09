(function(root) {
    var Map = require('./js/pokemap');
    var EventEmitter = require('tiny-emitter');

    class PokeMap extends EventEmitter {

        constructor(mapElement, {coordinates, timeRange, apiEndpoint}) {
            this.pokemap = Map(mapElement, coordinates);
            // TODO Center the map around the location and start displaying Pokemon predictions
            // TODO Accept timeRange and apiEndpoint as parameter

            // Bind event emitter
            this.pokemap.emit = this.emit.bind(this);
            // TODO Emit 'click' and 'move' events
        }

        goTo(coordinates) {
            // TODO Animate the map to the designated coordinates
        }

        updateTimeRange(timeRange) {
            // TODO Update the map to display predicted Pokemon in the given time range
        }
    }

    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], function() { return PokeMap; })
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = PokeMap;
    } else {
        // Browser global
        root.PokeMap = PokeMap;
    }
})(this);