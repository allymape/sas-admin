const express = require("express");
const router = express.Router();

const controller = require("../controllers/letterAddresseeTemplateController");
const { isAuthenticated, can, activeHandover } = require("../../util");

router.get(["", "/"], isAuthenticated, activeHandover, can("view-letters"), controller.index);
router.get("/new", isAuthenticated, activeHandover, can("view-letters"), controller.createForm);
router.post(["", "/"], isAuthenticated, activeHandover, can("view-letters"), controller.create);
router.get("/:id/edit", isAuthenticated, activeHandover, can("view-letters"), controller.editForm);
router.post("/:id", isAuthenticated, activeHandover, can("view-letters"), controller.update);

module.exports = router;

