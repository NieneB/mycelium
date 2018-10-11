if (!mapboxgl.supported()) {
  alert('Your browser does not support Mapbox GL')
}

var distance = 0
var maxDistance = 2000

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

function createPopupHtml (feature) {
  var properties = feature.properties

  return '<h3>' + properties.title + '</h3>'
    + '<a href="' + properties.url + '" target="_blank">'
    + (properties.image ? '<img src="' + properties.image + '"/>' : '')
    + 'Lees verder…'
    + '</a>'
}

function getLineWidth (meters) {
  return ['interpolate',
    ['cubic-bezier',
      0.42,
      0,
      0.5,
      0.7],
    ['get', 'distance'],
    0, 7.5,
    meters, 0
  ]
}

map.on('load', function () {
  fetch('geojson/mycelium-segmentized.geojson')
    .then(function (response) {
      return response.json()
    }).then(function (geojson) {
       map.addSource('geojson', {
        type: 'geojson',
        data: geojson
      })

      var lineWidth = getLineWidth(0)

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
          'line-width': 0,
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
          'line-width': 0,
          'line-blur': 5,
          'line-pattern': 'lijn_4'
        }
      }, 'punten-schaduw')

      // Start animation 2 seconds after map is loaded:
      setTimeout(startAnimation, 2000)
    }).catch(function (err) {
      console.log('parsing failed', err)
    })
})

map.addControl(new mapboxgl.FullscreenControl())

var attribution = new mapboxgl.AttributionControl()
attribution._updateAttributions = function () {
  this._container.innerHTML = '&copy; <a href=\'https://www.bertspaan.nl\' target=\'_blank\'>Bert Spaan</a> &amp;'
   + ' <a href=\'http://nieneb.nl\' target=\'_blank\'>Niene Boeijen</a>'
   + '| Data uit <a href=\'https://github.com/PDOK/vectortiles-bgt-brt\' target=\'_blank\'>PDOK</a>'
}

map.addControl(attribution, 'bottom-left')

function step () {
  distance = distance + 1

  var lineWidth = getLineWidth(distance)

  map.setPaintProperty('geojson-shadow', 'line-width', lineWidth)
  map.setPaintProperty('geojson', 'line-width', lineWidth)

  if (distance <= maxDistance) {
    window.requestAnimationFrame(step)
  }
}

function startAnimation () {
  distance = 0
  window.requestAnimationFrame(step)
}

map.on('click', 'punten', function (event) {
  var coordinates = event.features[0].geometry.coordinates.slice()
  var html = createPopupHtml(event.features[0])

  while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360
  }

  new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: true,
    offset: [0, -20]
  })
    .setLngLat(coordinates)
    .setHTML(html)
    .addTo(map)
})

map.on('mouseenter', 'punten', function () {
  map.getCanvas().style.cursor = 'pointer'
})

map.on('mouseleave', 'punten', function () {
  map.getCanvas().style.cursor = ''
})
