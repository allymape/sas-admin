require("dotenv").config();
const express = require("express");
const request = require("request");
const trackApplicationController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can, crypt, modifiedUrl, activeHandover } = require("../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const trackAPI = API_BASE_URL + "track_applications";
const applicationCommentsAPI = API_BASE_URL + "application_comments";
const updatePaymentAPI = API_BASE_URL + "update_payment";
const Cryptr = require("cryptr");

// Display 
trackApplicationController.get(
  "/TrackOmbi",
  isAuthenticated,
  can("view-track-application"),
  activeHandover,
  (req, res) => {
        res.render(path.join(__dirname + "/../views/track"), {
          req: req,
        });
  }
);
trackApplicationController.post(
  "/TrackList",
  isAuthenticated,
  can("view-track-application"),
  (req, res) => {
   let draw = req.body.draw;
   let start = req.body.start;
   let length = req.body.length;
   var per_page = Number(length || 10);
   var page = Number(start / length) + 1;
    // const encrypted_param_id = req.params.id;
    // const decryptedString = crypt().decrypt(encrypted_param_id);
    sendRequest(req,res,trackAPI +"?page=" +page +"&per_page=" +per_page,"GET",req.body,(jsonData) => {
        let totalRecords = jsonData.numRows;
        const dataToSend = jsonData.data;
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
trackApplicationController.post("/ApplicationComments/:tracking_number", isAuthenticated, can('view-track-application'), (req, res) => {
        const tracking_number = req.params.tracking_number
        sendRequest(req, res , applicationCommentsAPI+'/'+tracking_number , "GET" , {}, (jsonData) => {
                   res.render(
                     path.join(__dirname + "/../views/maoni"),
                     { Maoni: jsonData.data },
                     (err, html) => {
                       if (err) {
                         return res.status(500).send(err.message);
                       }
                       res.send({
                         htmlComments: html,
                       });
                     }
                   );
        });
})
trackApplicationController.post("/ChangePayment/:tracking_number", isAuthenticated, can('view-track-application'), (req, res) => {
        const tracking_number = req.params.tracking_number
        sendRequest(req, res , updatePaymentAPI , "PUT" , {tracking_number : tracking_number} , (jsonData) => {
                   const {statusCode , message} = jsonData
                   res.send({
                      statusCode : statusCode,
                      message : message
                   })
        });
})

module.exports = trackApplicationController;
