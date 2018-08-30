// --------------------------------------------------//
var mapboxgl = require('mapbox-gl');
// var d3 = require('d3-selection');
// var d3fetch = require('d3-fetch');
// var syncMove = require('mapbox-gl-sync-move');
// var turf = require('@turf/nearest-point');
var d3 = require("d3");
// --------------------------------------------------//

// MAP 
// Check for mapbox gl support:
if (!mapboxgl.supported()) {
    alert('Your browser does not support mapbox GL');
};
// mapboxgl.accessToken = 'pk.eyJ1IjoibmllbmViIiwiYSI6IlR6NWEzdmMifQ.dRVGdAluvTb9EIXVBREbzw';
// MAP INIT
var map = new mapboxgl.Map({
    container: 'map',
    hash: true,
    style: 'http://localhost:8000/style/style.json',
    zoom: 13.41,
    pitch: 60,
    bearing: -58.4,
    center: [4.89238, 52.37099],
    attributionControl: false
});
//  LOADER
// Loader to check if style is loaded or not:
function isloaded() {
    var id = setInterval(frame, 40);
    function frame() {
        if (map.isStyleLoaded()) {
            d3.select(".loader").style("display", "none");
        } else {
            d3.select(".loader").style("display", "block");
        }
    }
};
isloaded();