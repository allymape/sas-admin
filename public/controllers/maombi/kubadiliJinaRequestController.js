require("dotenv").config();
const express = require("express");
const request = require("request");
const kubadiliJinaRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var badiliJinaShule = API_BASE_URL + "maombi-badili-jina-shule";

kubadiliJinaRequestController.get(
  "/BadiliJina", 
  isAuthenticated,
  can("view-school-registration-private"),
  function (req, res) {
  var obj = [];

  request(
    {
      url: badiliJinaShule,
      method: "POST",
      headers: {
        Authorization: "Bearer" + " " + req.session.Token,
        "Content-Type": "application/json",
      },
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        UserLevel: req.session.UserLevel,
        Office: req.session.office,
      },
    },
    function (error, response, body) {
      if (error) {
        console.log(
          new Date() + ": fail to MaombiKuanzishaShuleList " + error
        );
        res.send("failed");
      }
      console.log("bodya");
      console.log(body);
      if (body !== undefined) {
        // var jsonData = JSON.parse(body)
        var jsonData = body;
        var message = jsonData.message;
        var statusCode = jsonData.statusCode;
        var data = jsonData.dataList;
        var dataSummary = jsonData.dataSummary;
        if (statusCode == 300) {
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
            new Date() + " " + req.session.userName + ": /BadiliJina"
          );
          res.render(
            path.join(__dirname + "/../../design/maombi/jina_shule"),
            {
              req: req,
              total_month: dataSummary,
              maombi: obj,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
    RoleManage: req.session.RoleManage,
userID: req.session.userID,
              cheoName: req.session.cheoName,
            }
          );
        }
        if (statusCode == 209) {
          res.redirect("/");
        }
      }
    }
  );

});

module.exports = kubadiliJinaRequestController;
