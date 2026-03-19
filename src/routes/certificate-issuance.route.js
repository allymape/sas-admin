const express = require("express");
const router = express.Router();

const controller = require("../controllers/certificateIssuanceController");
const { isAuthenticated, can, activeHandover } = require("../../util");

router.get(["", "/"], isAuthenticated, activeHandover, can("view-letters"), controller.index);
router.get("/issue-preview/:tracking_number", isAuthenticated, activeHandover, can("view-letters"), controller.issuePreview);
router.post("/issue/:tracking_number", isAuthenticated, activeHandover, can("view-letters"), controller.issue);

module.exports = router;
