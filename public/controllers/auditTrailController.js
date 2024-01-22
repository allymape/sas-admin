require("dotenv").config();
const express = require("express");

const auditTrailController = express.Router();

var session = require("express-session");
const { isAuthenticated, sendRequest,  generateLetter, bodyContent, formatDate, decodeSignature } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const baruaDetailsAPI = API_BASE_URL + "barua";

auditTrailController.get("AuditTrail", isAuthenticated, function (req, res) {
  
});

module.exports = auditTrailController;
