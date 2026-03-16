// src/routes/auth.js
const express = require("express");
const router = express.Router();

// Import your controllers
const authController = require("../controllers/authController");

// Middlewares if needed
const { isAuthenticated } = require("../helpers/requestHelper");


// GET login page
router.get(["/", "/login"], authController.showLogin);

// Auth routes
router.post("/auth", authController.login);

// Logout route (compatibility for legacy links/buttons)
router.post(["/logout", "/Logout"], authController.logout);
router.delete(["/logout", "/Logout"], authController.logout);
router.get(["/logout", "/Logout"], authController.logout);

module.exports = router;
