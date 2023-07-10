require("dotenv").config();
const express = require("express");
const request = require("request");
const zoneController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allZonesAPI = API_BASE_URL + "allZones";
var tengenezaZoneAPI = API_BASE_URL + "addZone";
var editZoneAPI   = API_BASE_URL + "editZone";
var updateZoneAPI = API_BASE_URL + "updateZone";
var deleteZoneAPI = API_BASE_URL + "deleteZone";

zoneController.get("/Zoni", isAuthenticated, function (req, res) {
        res.render(path.join(__dirname + "/../design/kanda"), {
          req: req,
        });
});

// Get all zones
zoneController.get("/zones",  isAuthenticated, can('view-zones'),function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
    var formData = {
         is_paginated: req.query.is_paginated,
    };
    sendRequest(req, res, allZonesAPI+ "?page=" + page + "&per_page=" + per_page, "GET", formData, (jsonData) => {
            // console.log(jsonData);
            var numRows = jsonData.numRows;
            console.log(jsonData.data)
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



// zoneController.get("/KandaList", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: kandaListAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to KandaList " + error);
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           // console.log(body)
//           var jsonData = JSON.parse(body);
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;

//           if (statusCode == 300) {
//             //

//             if (data.length <= 0) {
//               var zoneCode = "";
//               var zoneName = "";
//               var zoneId = "";
//               obj.push({
//                 zoneId: zoneId,
//                 zoneCode: zoneCode,
//                 zoneName: zoneName,
//               });
//             } else {
//               for (var i = 0; i < data.length; i++) {
//                 console.log(data);
//                 var zoneId = data[i].zoneId;
//                 var zoneCode = data[i].zoneCode;
//                 var zoneName = data[i].zoneName;
//                 obj.push({
//                   zoneId: zoneId,
//                   zoneCode: zoneCode,
//                   zoneName: zoneName,
//                 });
//               }
//             }
//             console.log(obj);
//             console.log(new Date() + ": Successful KandaList");
//             res.send(obj);
//             //
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

// Store Zone
zoneController.post("/tengenezaZone",  isAuthenticated, can('create-zones'), function (req, res) {
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
zoneController.get("/Zones/:id",  isAuthenticated, can('update-zones'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editZoneAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllZones(req, res, true, jsonData.data);
  });
});

// Update Zone
zoneController.post("/badiliZone/:id",  isAuthenticated, can('update-zones'), function (req, res) {
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
zoneController.post("/futaZone/:id",  isAuthenticated, can('delete-zones'), function (req, res) {
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
