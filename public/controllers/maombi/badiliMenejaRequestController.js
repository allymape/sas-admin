require("dotenv").config();
const express = require("express");
const request = require("request");
const badiliMenejaRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var maousajiliShuleListAPI = API_BASE_URL + "maombi-usajili-shule";
// Display
badiliMenejaRequestController.get(
  "/BadiliMeneja",
  isAuthenticated,
  can("view-school-registration-private"),
  function (req, res) {
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
    };
    sendRequest(
      req,
      res,
      maousajiliShuleListAPI,
      "POST",
      formData,
      (jsonData) => {
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                    for (var i = 0; i < data.length; i++) {
                      var tracking_number = data[i].tracking_number;
                      var user_id = data[i].user_id;
                      var LgaName = data[i].LgaName;
                      var RegionName = data[i].RegionName;
                      var school_name = data[i].school_name;
                      var created_at = data[i].created_at;
                      var remain_days = data[i].remain_days;
                      req.session.TrackingNumber = tracking_number;
                      obj.push({
                        tracking_number: tracking_number,
                        user_id: user_id,
                        school_name: school_name,
                        LgaName: LgaName,
                        RegionName: RegionName,
                        created_at: created_at,
                        remain_days: remain_days,
                      });
                    }
                    console.log(
                      new Date() +
                        " " +
                        req.session.userName +
                        ": /MaombiKusajiliShule"
                    );
                    res.render(
                      path.join(__dirname + "/../../design/maombi/usajili"),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                      }
                    );
                  
      }
    );
  }
);

module.exports = badiliMenejaRequestController;
