const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/applications/applicationController");
const { isAuthenticated, activeHandover } = require("../../util");

router.get(["", "/"], isAuthenticated, activeHandover, applicationController.index);
router.get("/list", isAuthenticated, activeHandover, applicationController.list);
router.post("/:trackingNumber/start", isAuthenticated, activeHandover, applicationController.startWorkflow);

module.exports = router;
