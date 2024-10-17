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
     res.render(path.join(__dirname + "/../../public/design/audits/audit"), {
          req: req,
        });
      }
);
auditTrailController.post(
  "/AuditTrailList",
  isAuthenticated,
  can("view-audit"),
  activeHandover,
  (req, res) => {
    let draw = req.body.draw;
    let start = req.body.start;
    let length = req.body.length;
    var per_page = Number(length || 10);
    var page = Number(start / length) + 1;
    sendRequest(req,res,auditAPI + "?page=" + page + "&per_page=" + per_page,"GET",req.body,(jsonData) => {
        let dataToSend = jsonData.data;
        let totalRecords = jsonData.numRows;
        res.send({
          draw: draw,
          recordsTotal: totalRecords,
          recordsFiltered: totalRecords,
          data: dataToSend,
        });
      }
    );
  }
);

module.exports = auditTrailController;
