if (!mapboxgl.supported()) {
  alert('Your browser does not support Mapbox GL')
}

var distance = 0
var maxDistance = 1000

var map = new mapboxgl.Map({
  container: 'map',
  style: 'style/style.json',
  center: [
    4.9126,
    52.3673
  ],
  zoom: 13,
  minZoom: 12,
  maxZoom: 17,
  hash: true
})

var lineStyle = (meters) => ['interpolate',
  ['cubic-bezier',
    0.42,
    0,
    0.5,
    0.7],
  ['get', 'distance'],
  0, 7.5,
  meters, 0
]

map.on('load', function () {
  fetch('geojson/mycelium-segmentized.geojson')
    .then(function (response) {
      return response.json()
    }).then(function (geojson) {
       map.addSource('geojson', {
        type: 'geojson',
        data: geojson
      })

       map.addLayer({
        id: 'geojson-shadow',
        type: 'line',
        source: 'geojson',
        minzoom: 12,
        maxzoom: 22,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-translate': [3, 3],
          'line-color': '#535353',
          'line-opacity': 0.2,
          'line-width': 4,
          'line-blur': 5
        }
      }, 'punten-schaduw')

      map.addLayer({
        id: 'geojson',
        type: 'line',
        source: 'geojson',
        minzoom: 12,
        maxzoom: 22,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ee0000',
          'line-opacity': 0.8,
          'line-width': 1,
          'line-blur': 5,
          'line-pattern': 'lijn_4'
        }
      }, 'punten-schaduw')

      startAnimation()
    }).catch(function (err) {
      console.log('parsing failed', err)
    })
})

map.addControl(new mapboxgl.FullscreenControl())

var attribution = new mapboxgl.AttributionControl()
attribution._updateAttributions = function () {
  this._container.innerHTML = "&copy; <a href=\'http://www.bertspaan.nl\' target=\'_blank\'>Bert</a> &#38; <a href=\'http://nieneb.nl\' target=\'_blank\'>Niene</a> | Data <a href=\'https://github.com/PDOK/vectortiles-bgt-brt\' target=\'_blank\'>PDOK</a>"
}

map.addControl(attribution, 'bottom-left')

function step () {
  distance = distance += 25

  map.setPaintProperty('geojson-shadow', 'line-width', lineStyle(distance))
  map.setPaintProperty('geojson', 'line-width', lineStyle(distance))

  if (distance <= maxDistance) {
    window.requestAnimationFrame(step)
  }
}

function startAnimation () {
  distance = 0
  window.requestAnimationFrame(step)
}

// When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with description HTML from its properties.
map.on('click', 'punten', function (e) {
  var coordinates = e.features[0].geometry.coordinates.slice()
  var description = e.features[0].properties.titel
  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
  }

  new mapboxgl.Popup({
    // anchor: 'bottom-left',
    closeButton: false,
    closeOnClick: true,
    offset: [0, -10]
  })
    .setLngLat(coordinates)
    .setHTML(description)
    .addTo(map)
})

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'punten', function () {
  map.getCanvas().style.cursor = 'pointer'
})

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'punten', function () {
  map.getCanvas().style.cursor = ''
})
