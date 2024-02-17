require("dotenv").config();
const express = require("express");
const request = require("request");
const trackApplicationController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can, crypt, modifiedUrl } = require("../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const trackAPI = API_BASE_URL + "track_applications";
const updatePaymentAPI = API_BASE_URL + "update_payment";
const Cryptr = require("cryptr");

// Display zones page
trackApplicationController.get("/TrackOmbi/:id", isAuthenticated, can('view-track-application'), (req, res) => {
      var per_page = Number(req.query.per_page || 10);
      var page = Number(req.query.page || 1);
      const searchQuery = req.query;
      const encrypted_param_id =  req.params.id;
      const decryptedString = crypt().decrypt(encrypted_param_id);
      // console.log(decryptedString);
   
      sendRequest(req , res , trackAPI+ '/'+ decryptedString + "?page=" + page + "&per_page=" + per_page , "GET" , searchQuery  , (jsonData) => {
        const { numRows } = jsonData;
        const { applications ,categories } = jsonData.data;
        res.render(path.join(__dirname + "/../design/track"), {
          req: req,
          applications: applications,
          categories: categories,
          decrypted_param_id: decryptedString,
          pagination: {
            total: numRows,
            current: page,
            per_page: per_page,
            pages: Math.ceil(numRows / per_page),
            url: modifiedUrl(req),
          },
        });
      });
});

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
