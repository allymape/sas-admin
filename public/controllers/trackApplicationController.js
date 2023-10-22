require("dotenv").config();
const express = require("express");
const request = require("request");
const trackApplicationController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var trackAPI = API_BASE_URL + "track_applications";


// Display zones page
trackApplicationController.get("/TrackOmbi", isAuthenticated, can('view-track-application'), (req, res) => {
      var per_page = Number(req.query.per_page || 10);
      var page = Number(req.query.page || 1);
      sendRequest(req , res , trackAPI + "?page=" + page + "&per_page=" + per_page , "GET" , {} , (jsonData) => {
         const { data , numRows } = jsonData;
        res.render(path.join(__dirname + "/../design/track"), {
          req: req,
          applications: data,
          pagination: {
            total: numRows,
            current: page,
            per_page: per_page,
            pages: Math.ceil(numRows / per_page),
            url: "TrackOmbi",
          },
        });
      });
});

module.exports = trackApplicationController;
