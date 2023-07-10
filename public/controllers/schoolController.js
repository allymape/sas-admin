require("dotenv").config();
const express = require("express");
const request = require("request");
const schoolController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var schoolListAPI = API_BASE_URL + "look_for_schools";


schoolController.get("/LookForSchools", isAuthenticated, function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var search = req.query.q;
  sendRequest(
    req,
    res,
    schoolListAPI + "?page=" + page + "&per_page=" + per_page,
    "GET",
    {search : search},
    (jsonData) => {
      var data = jsonData.data;
      console.log(data);
      res.send({
        statusCode: data.statusCode,
        message: data.message,
        data: data,
      });
    }
  );
});



module.exports = schoolController;
