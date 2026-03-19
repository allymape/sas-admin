const express = require("express");
const router = express.Router();

const letterTemplateController = require("../controllers/letterTemplateController");
const { isAuthenticated, can, activeHandover } = require("../../util");

router.get(["", "/"], isAuthenticated, activeHandover, can("view-letters"), letterTemplateController.index);
router.get("/guide", isAuthenticated, activeHandover, can("view-letters"), letterTemplateController.guide);
router.get("/new", isAuthenticated, activeHandover, can("view-letters"), letterTemplateController.createForm);
router.post(["", "/"], isAuthenticated, activeHandover, can("view-letters"), letterTemplateController.create);
router.get("/:template_key/preview", isAuthenticated, activeHandover, can("view-letters"), letterTemplateController.preview);
router.get("/:template_key/edit", isAuthenticated, activeHandover, can("view-letters"), letterTemplateController.editForm);
router.post("/:template_key", isAuthenticated, activeHandover, can("view-letters"), letterTemplateController.update);

module.exports = router;
