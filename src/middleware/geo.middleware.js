const turf = require("@turf/turf");
const { tanzaniaBoundary, waterBodies } = require("../config/tanzaniaBoundary");

module.exports = {
  isInTanzaniaAndNotInWater: (lat, long) => {
    /* ...turf checks... */
  },
  validateGeoLocation: (req, res, next) => {
    /* ...check req.body coords... */
  },
};
