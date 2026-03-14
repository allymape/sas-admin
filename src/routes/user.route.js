const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// Reuse existing user controller router in the new route structure.
router.use("/", userController);

module.exports = router;
