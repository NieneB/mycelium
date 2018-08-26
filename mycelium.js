
const got = require('got')
const turf = require('@turf/turf')
const R = require('ramda')

const point = [
  4.9126,
  52.3673
]

const buffered = turf.buffer(turf.point(point), 0.8, {
  units: 'kilometers',
  steps: 30
})

if (!process.env.MAPBOX_DIRECTIONS) {
  console.error(`Environment MAPBOX_DIRECTIONS not set 😡!!!`)
  process.exit(1)
}

const accessToken = process.env.MAPBOX_DIRECTIONS
const getUrl = (from, to) => `https://api.mapbox.com/directions/v5/mapbox/walking/${from.join(',')};${to.join(',')}?steps=false&alternatives=true&access_token=${accessToken}&geometries=geojson`

const promises = turf.coordAll(buffered).map((to) => {
  return got(getUrl(point, to), {
    json: true
  })
})

const getRoutesFromResponse = (response) => {
  return response.body.routes.map((route) => route.geometry)
}

Promise.all(promises).then((values) => {
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
