# Custom Turf build

See http://turfjs.org/getting-started.

First, run:

    npm install @turf/meta @turf/line-chunk @turf/point-to-line-distance

Then:

    browserify main.js -s turf | uglifyjs > turf.modules.min.js
