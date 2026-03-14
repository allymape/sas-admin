require("dotenv").config();
const express = require("express");
const { isAuthenticated, sendRequest } = require("../../util");
const notificationController = express.Router();
const API_BASE_URL = process.env.API_BASE_URL;
const notificationsAPI = API_BASE_URL + "my-notifications";

// original
notificationController.post("/MyNotifications", isAuthenticated, function (req, res) {
 
     sendRequest(req,res,notificationsAPI,"POST",{},(jsonData) => {
       const { statusCode, data ,counter } = jsonData;
         console.log(
           new Date() + " " + req.session.userName + ": /Notifications"
         );
         res.send({
              statusCode : statusCode,
              data : data,
              counter : counter
         });
      
      }
    );
 
});

// v2 alias endpoint
notificationController.post("/v2-MyNotifications", isAuthenticated, function (req, res) {
     sendRequest(req,res,notificationsAPI,"POST",{},(jsonData) => {
       const { statusCode, data ,counter } = jsonData;
         res.send({
              statusCode : statusCode,
              data : data,
              counter : counter
         });
      }
    );
});

module.exports = notificationController;
