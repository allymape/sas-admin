// src/routes/auth.js
const express = require("express");
const router = express.Router();

// Import your controllers
const dashboardController = require("../controllers/dashboardController");
// Middlewares if needed

const { can, activeHandover, isAuthenticated, validateGeoLocation } = require("../../util");

//
router.get("/Dashboard", isAuthenticated, can("view-dashboard"), activeHandover, dashboardController.dashboard,);
router.get("/Map", isAuthenticated, can("view-dashboard"), activeHandover, dashboardController.mapView);

router.post("/MapData",isAuthenticated,can("view-dashboard"),activeHandover,dashboardController.getMapData);
router.post("/UpdateMarker",isAuthenticated,validateGeoLocation,can("update-school-marker"),activeHandover,dashboardController.UpdateMarker);

router.get("/SchoolsSummaryByRegionAndCategories", isAuthenticated, can("view-dashboard"), activeHandover, dashboardController.getSchoolsSummaryByRegionAndCategories);
router.get("/NumberOfSchoolByYearOfRegistration", isAuthenticated, can("view-dashboard"), activeHandover, dashboardController.getNumberOfSchoolByYearOfRegistration);


module.exports = router;
