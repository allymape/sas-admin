require("dotenv").config();
const express = require("express");
const request = require("request");
const zoneController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allZonesAPI = API_BASE_URL + "allZones";
var tengenezaZoneAPI = API_BASE_URL + "addZone";
var editZoneAPI   = API_BASE_URL + "editZone";
var updateZoneAPI = API_BASE_URL + "updateZone";
var deleteZoneAPI = API_BASE_URL + "deleteZone";


// Get all zones
zoneController.get("/zones", function (req, res) {
    var formData = {
         is_paginated: req.query.is_paginated,
    };
    sendRequest(req, res, allZonesAPI, "GET", formData, (jsonData) => {
            // console.log(jsonData);
            res.send({
              statusCode: jsonData.statusCode,
              data: jsonData.data,
              message: jsonData.message,
            });
    });
//   getAllZones(req, res);
});

// Store Zone
zoneController.post("/tengenezaZone", function (req, res) {
    var formData = {
        zoneName: req.body.zone_name,
        displayName: req.body.display_name,
        };
    sendRequest(req, res, tengenezaZoneAPI, "POST", formData, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Zones");
    });
});

// Edit Zone
zoneController.get("/Zones/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editZoneAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllZones(req, res, true, jsonData.data);
  });
});

// Update Zone
zoneController.post("/badiliZone/:id", function (req, res) {
  var id = Number(req.params.id);
  var formData = {
          zoneName: req.body.zone_name,
          displayName: req.body.display_name,
          status: req.body.status,
  }
  sendRequest(req, res, updateZoneAPI + "/" + id, "PUT", formData , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        // Make redirection
        statusCode == 300 ? res.redirect("/Zones"): res.redirect("/Zones/" + id);
  });
});

// Delete Zone
zoneController.post("/futaZone/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteZoneAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Zones");
  });
});

function getAllZones(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allZonesAPI + "?page=" + page + "&per_page=" + per_page;
  var formData = {
            browser_used: req.session.browser_used,
            ip_address: req.session.ip_address,
            useLevel: req.session.UserLevel,
            office: req.session.office,
   };

  sendRequest(req, res, url, "GET", formData, (jsonData) => {
     if (jsonData !== undefined) {
       var statusCode = jsonData.statusCode;
       var data = jsonData.data;
       var numRows = jsonData.numRows;
       if (statusCode == 300) {
         res.render(path.join(__dirname + "/../design/zones"), {
           req: req,
           data: data,
           useLev: req.session.UserLevel,
           userName: req.session.userName,
           ZoneManage: req.session.ZoneManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           eZone: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "Zones",
             pages: Math.ceil(Number(numRows) / Number(per_page)),
           },
         });
       }
       if (statusCode == 209) {
         res.redirect("/");
       }
     }
  });
}
module.exports = zoneController;
