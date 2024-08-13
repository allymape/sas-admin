require("dotenv").config();
const express = require("express");
const { isAuthenticated, can, sendRequest, modifiedUrl, activeHandover } = require("../../util");
var path = require("path");
const auditTrailController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const auditAPI = API_BASE_URL + "audit-trail";

auditTrailController.get(
  "/AuditTrail",
  isAuthenticated,
  can("view-audit"),
  activeHandover,
  (req, res) => {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    sendRequest(
      req,
      res,
      auditAPI + "?page=" + page + "&per_page=" + per_page,
      "GET",
      {},
      (jsonData) => {
        const { data, numRows } = jsonData;
        res.render(path.join(__dirname + "/../../public/design/audits/audit"), {
          req: req,
          data: data,
          pagination: {
            total: Number(numRows),
            current: Number(page),
            per_page: Number(per_page),
            url: modifiedUrl(req),
            pages: Math.ceil(Number(numRows) / Number(per_page)),
          },
        });
      }
    );
  }
);

module.exports = auditTrailController;
