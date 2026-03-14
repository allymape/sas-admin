const turf = require("@turf/turf");

const tanzaniaBoundary = turf.polygon([
  /* coordinates... */
]);

const waterBodies = [
  {
    name: "Lake Victoria",
    polygon: turf.polygon([
      /* coords */
    ]),
  },
  {
    name: "Indian Ocean",
    polygon: turf.polygon([
      /* coords */
    ]),
  },
];

module.exports = { tanzaniaBoundary, waterBodies };
