const express = require("express");
const router = express.Router();

const myApplicationController = require("../controllers/applications/myApplicationController");
const { isAuthenticated, activeHandover } = require("../../util");

router.get(["", "/"], isAuthenticated, activeHandover, myApplicationController.index);
router.get("/list", isAuthenticated, activeHandover, myApplicationController.list);
router.get("/:trackingNumber/attend", isAuthenticated, activeHandover, myApplicationController.attend);
router.post("/:trackingNumber/comment", isAuthenticated, activeHandover, myApplicationController.addComment);
router.post("/:trackingNumber/workflow", isAuthenticated, activeHandover, myApplicationController.submitWorkflowAction);

module.exports = router;
