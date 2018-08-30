const got = require('got')
const turf = require('@turf/turf')
const R = require('ramda')

const maxDistance = 2800
const randomPoints = 14

const point = [
  4.9126,
  52.3673
]

const buffered = turf.buffer(turf.point(point), maxDistance / 1000, {
  units: 'kilometers',
  steps: 30
})

if (!process.env.MAPBOX_DIRECTIONS) {
  console.error(`Environment MAPBOX_DIRECTIONS not set 😡!!!`)
  process.exit(1)
}

const accessToken = process.env.MAPBOX_DIRECTIONS
const getUrl = (from, to) => `https://api.mapbox.com/directions/v5/mapbox/walking/${from.join(',')};${to.join(',')}?steps=false&alternatives=true&access_token=${accessToken}&geometries=geojson`

const circleRoutes = turf.coordAll(buffered).map((pointOnCircle) => {
  const line = turf.lineString([point, pointOnCircle])
  const to = turf.along(line, (Math.random() * (maxDistance - .1) + .1) / 1000, {
    units: 'kilometers'
  }).geometry.coordinates

  return got(getUrl(point, to), {
    json: true
  })
})


const randomRoutes = turf.randomPoint(randomPoints, {
  bbox: turf.bbox(buffered)
}).features
  .map((randomPoint) => {
    // console.log(point, randomPoint.geometry.coordinates)
    return got(getUrl(point, randomPoint.geometry.coordinates), {
      json: true
    })
  })

const getRoutesFromResponse = (response) => {
  return response.body.routes.map((route) => route.geometry)
}

Promise.all([...circleRoutes, ...randomRoutes]).then((values) => {
  const routes = R.flatten(values.map(getRoutesFromResponse))

  console.log(JSON.stringify({
    type: 'FeatureCollection',
    features: routes.map((route) => ({
      type: 'Feature',
      properties: {},
      geometry: route
    }))
  }))
})
