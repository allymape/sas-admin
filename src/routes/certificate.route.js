const express = require("express");
const router = express.Router();

const controller = require("../controllers/certificateController");
const { isAuthenticated, can, activeHandover } = require("../../util");

router.get("/:tracking_number", isAuthenticated, activeHandover, can("view-letters"), controller.pdf);

module.exports = router;

