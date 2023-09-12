require("dotenv").config();
const express = require("express");
const request = require("request");
const anzishaShuleRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
// const { sendRequest, isAuthenticated, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var maoanzishaShuleJumlaAPI = API_BASE_URL + "jumla-maombi-kuanzisha-shule";
var maoanzishaShuleListAPI = API_BASE_URL +"maombi-kuanzisha-shule";
// var allZonesAPI = API_BASE_URL + "allZones";
// var tengenezaZoneAPI = API_BASE_URL + "addZone";
// var editZoneAPI = API_BASE_URL + "editZone";
// var updateZoneAPI = API_BASE_URL + "updateZone";
// var deleteZoneAPI = API_BASE_URL + "deleteZone";

// Display
anzishaShuleRequestController.get(
  "/MaombiKuanzishaShule",
  isAuthenticated,
  can("view-initiate-schools"),
  function (req, res) {
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
    };
    sendRequest(
      req,
      res,
      maoanzishaShuleJumlaAPI,
      "GET",
      formData,
      (jsonData) => {
        const { data } = jsonData;
        res.render(
          path.join(__dirname + "/../../design/maombi/kuanzishashule"),
          {
            req: req,
            total_month: data,
          }
        );
      }
    );
  }
);

// List
anzishaShuleRequestController.get("/MaombiKuanzishaShuleList", isAuthenticated , 
(req, res) => {
   sendRequest(req, res, maoanzishaShuleListAPI , 'POST' , {} , (jsonData) => {
     const {message , statusCode , data} = jsonData
     console.log(data);
      res.send({
        message,
        statusCode,
        data
      });
   });
    // request(
    //   {
    //     url: maoanzishaShuleListAPI,
    //     method: "POST",
    //     headers: {
    //       Authorization: "Bearer" + " " + req.session.Token,
    //       "Content-Type": "application/json",
    //     },
    //     json: {
    //       browser_used: req.session.browser_used,
    //       ip_address: req.session.ip_address,
    //       UserLevel: req.session.UserLevel,
    //       Office: req.session.office,
    //     },
    //   },
    //   function (error, response, body) {
    //     if (error) {
    //       console.log(
    //         new Date() + ": fail to MaombiKuanzishaShuleList " + error
    //       );
    //       res.send("failed");
    //     }

    //     if (body !== undefined) {
    //       // var jsonData = JSON.parse(body)
    //       var jsonData = body;
    //       var message = jsonData.message;
    //       var statusCode = jsonData.statusCode;
    //       var data = jsonData.data;
    //       if (statusCode == 300) {
    //         for (var i = 0; i < data.length; i++) {
    //           var tracking_number = data[i].tracking_number;
    //           var user_id = data[i].user_id;
    //           var LgaName = data[i].LgaName;
    //           var RegionName = data[i].RegionName;
    //           var school_name = data[i].school_name;
    //           var created_at = data[i].created_at;
    //           var remain_days = data[i].remain_days;
    //           req.session.TrackingNumber = tracking_number;
    //           obj.push({
    //             tracking_number: tracking_number,
    //             useLev: req.session.UserLevel,
    //             userName: req.session.userName,
    //             RoleManage: req.session.RoleManage,
    //             userID: req.session.userID,
    //             cheoName: req.session.cheoName,
    //             user_id: user_id,
    //             school_name: school_name,
    //             LgaName: LgaName,
    //             RegionName: RegionName,
    //             created_at: created_at,
    //             remain_days: remain_days,
    //           });
    //         }
    //         console.log(
    //           new Date() +
    //             " " +
    //             req.session.userName +
    //             ": /MaombiKuanzishaShuleList"
    //         );
    //         res.send(obj);
    //       }
    //       if (statusCode == 209) {
    //         res.redirect("/");
    //       }
    //     }
    //   }
    // );
});

module.exports = anzishaShuleRequestController;
