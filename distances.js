const fs = require('fs')
const turf = require('@turf/turf')
const R = require('ramda')

const point = [
  4.9126,
  52.3673
]

const routes = JSON.parse(fs.readFileSync('./test-routes.geojson', 'utf8'))

const features = []

turf.segmentEach(routes, (segment) => {
  const distance = Math.round(turf.pointToLineDistance(turf.point(point), segment, {
    units: 'kilometers'
  }) * 1000)

  features.push({
    type: 'Feature',
    properties: {
      distance
    },
    geometry: segment.geometry
  })
})

console.log(JSON.stringify({
  type: 'FeatureCollection',
  features
}, null, 2))
