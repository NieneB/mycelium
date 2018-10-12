if (!mapboxgl.supported()) {
  alert('Your browser does not support Mapbox GL')
}

var FPS = 16
var animationDuration = 20000
var maxDistance = 1200
var animationWait = 500 // wait with playing animation after loading map, in milliseconds

var map = new mapboxgl.Map({
  container: 'map',
  style: 'style/style.json',
  center: [
    4.90706,
    52.35663
  ],
  zoom: 13.2,
  bearing: 10,
  pitch: 58,
  minZoom: 12,
  maxZoom: 17,
  hash: true
})

function createPopupHtml (feature) {
  var properties = feature.properties

  return (properties.area ? '<div>' + properties.area + ':</div>' : '')
    + '<h3>' + properties.title + '</h3>'
    + '<a href="' + properties.url + '" target="_blank">'
    + (properties.image ? '<img src="' + properties.image + '"/>' : '')
    + 'Lees verder…'
    + '</a>'
}

function getLineWidth (meters) {
  return ["interpolate",
      [
        "linear"
      ],
      [
        "zoom"
      ],
      12,
      ['interpolate',
        ['cubic-bezier', .68, 0, .71, .14],
        ['get', 'distance'],
        0, 1,
        meters, 0
      ],
      15,
      ['interpolate',
        ['cubic-bezier', .68, 0, .71, .14],
        ['get', 'distance'],
        0, 7.5,
        meters, 0
      ],
      17,
      ['interpolate',
        ['cubic-bezier', .68, 0, .71, .14],
        ['get', 'distance'],
        0, 10,
        meters, 0
      ]
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
      }, 'punten')

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
      }, 'punten')

      // Start animation after map is loaded:
      setTimeout(function () {
        startAnimation(FPS)
      }, animationWait)
      setTimeout(showMarkers, animationWait + 8000)
    }).catch(function (err) {
      console.log('parsing failed', err)
    })
})


function AnimationControl () {
  this.onAdd = function (map) {
    this.map = map

    this.container = document.createElement('div')
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'

    var button = document.createElement('button')
    button.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-animation'
    button.setAttribute('aria-label', 'Replay animation')

    button.addEventListener('click', function () {
      startAnimation(FPS)
    })

    this.container.appendChild(button)
    return this.container
  }
  this.onRemove = function () {
    this.container.parentNode.removeChild(this.container)
    this.map = undefined
  }
}

map.addControl(new mapboxgl.FullscreenControl())
map.addControl(new mapboxgl.NavigationControl())
map.addControl(new AnimationControl())

var attribution = new mapboxgl.AttributionControl()
attribution._updateAttributions = function () {
  this._container.innerHTML = '&copy; <a href=\'https://www.bertspaan.nl\' target=\'_blank\'>Bert Spaan</a> &amp;'
   + ' <a href=\'http://nieneb.nl\' target=\'_blank\'>Niene Boeijen</a>'
   + ' | Data uit <a href=\'https://github.com/PDOK/vectortiles-bgt-brt\' target=\'_blank\'>PDOK</a>'
}

map.addControl(attribution, 'bottom-left')

var startTime
var then
var fpsInterval
var animating = false

var currentDistance = 0
function animate (interval) {
  if (currentDistance <= maxDistance) {
    window.requestAnimationFrame(function () {
      animate(interval)
    })
  } else {
    animating = false
  }

  var now = Date.now()
  var elapsed = now - then

  if (elapsed > interval) {
    then = now - (elapsed % interval)

    var increment = maxDistance / (animationDuration / interval)
    currentDistance = currentDistance + increment

    var lineWidth = getLineWidth(currentDistance)

    map.setPaintProperty('geojson-shadow', 'line-width', lineWidth)
    map.setPaintProperty('geojson', 'line-width', lineWidth)
  }
}

function startAnimation (fps) {
  var interval = 1000 / fps

  currentDistance = 0

  then = Date.now()
  startTime = then

  if (!animating) {
    animating = true
    animate(interval)
  }
}

function showMarkers () {
  map.setPaintProperty('punten', 'icon-opacity', 1)
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
