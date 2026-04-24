// src/routes/auth.js
const express = require("express");
const router = express.Router();

// Import your controllers
const authController = require("../controllers/authController");
const { redirectIfAuthenticated } = require("../../util");


// GET login page
router.get(["/", "/login"], redirectIfAuthenticated, authController.showLogin);

// Auth routes
router.post("/auth", authController.login);

// Logout route (compatibility for legacy links/buttons)
router.post(["/logout", "/Logout"], authController.logout);
router.delete(["/logout", "/Logout"], authController.logout);
router.get(["/logout", "/Logout"], authController.logout);

module.exports = router;
