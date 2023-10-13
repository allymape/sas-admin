require("dotenv").config();
const express = require("express");
const request = require("request");
const zoneController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allZonesAPI = API_BASE_URL + "allZones";
var zonesAPI = API_BASE_URL + "lookup-zones";
var tengenezaZoneAPI = API_BASE_URL + "addZone";
var editZoneAPI   = API_BASE_URL + "editZone";
var updateZoneAPI = API_BASE_URL + "updateZone";
var deleteZoneAPI = API_BASE_URL + "deleteZone";

// Display zones page
zoneController.get("/Zoni", isAuthenticated, function (req, res) {
        res.render(path.join(__dirname + "/../design/kanda"), {
          req: req,
        });
});

// Get all zones
zoneController.get("/Zones",  isAuthenticated, can('view-zones'),function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
    var formData = {
         is_paginated: req.query.is_paginated,
    };
    sendRequest(req, res, allZonesAPI+ "?page=" + page + "&per_page=" + per_page, "GET", formData, (jsonData) => {
            // console.log(jsonData);
            var numRows = jsonData.numRows;
            res.send({
              statusCode: jsonData.statusCode,
              data: jsonData.data,
              message: jsonData.message,
              pagination: {
                total: numRows,
                current: page,
                per_page: per_page,
                pages: Math.ceil(numRows / per_page),
              },
            });
    });
//   getAllZones(req, res);
});

zoneController.get("/LookupZones",  isAuthenticated,function (req, res) {
  
    sendRequest(req, res, zonesAPI, "GET", {}, (jsonData) => {
            res.send({
              statusCode: jsonData.statusCode,
              data: jsonData.data,
              message: jsonData.message,
            });
    });
//   getAllZones(req, res);
});


// Store Zone
zoneController.post("/TengenezaZone",  isAuthenticated, can('create-zones'), function (req, res) {
    sendRequest(req, res, tengenezaZoneAPI, "POST", req.body, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        res.send({
          statusCode: statusCode,
          message: message,
        });
    });
});

// Edit Zone
zoneController.get("/Zones/:id",  isAuthenticated, can('update-zones'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editZoneAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllZones(req, res, true, jsonData.data);
  });
});

// Update Zone
zoneController.post("/BadiliZone/:id",  isAuthenticated, can('update-zones'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, updateZoneAPI + "/" + id, "PUT", req.body , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        res.send({
              statusCode : statusCode,
              message : message
        });
  });
});

// Delete Zone
zoneController.post("/FutaZone/:id",  isAuthenticated, can('delete-zones'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteZoneAPI + "/" + id, "PUT", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
         res.send({
           statusCode: statusCode,
           message: message,
         });
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
