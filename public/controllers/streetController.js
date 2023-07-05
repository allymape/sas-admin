require("dotenv").config();
const express = require("express");
const request = require("request");
const streetController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var streetListAPI = API_BASE_URL + "allstreets";
var vutaMitaaListAPI = API_BASE_URL + "usajiliMitaa";

// streetController.use(
//   session({
//     secret: "secret",
//     resave: true,
//     saveUninitialized: true,
//   })
// );

streetController.get("/MitaaList", function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  sendRequest(
    req,
    res,
    streetListAPI + "?page=" + page + "&per_page=" + per_page,
    "GET",
    {},
    (jsonData) => {
      var data = jsonData.data;
      var numRows = jsonData.numRows;
      res.send({
        streets: data,
        pagination: {
          total: numRows,
          current: page,
          per_page: per_page,
          pages: Math.ceil(numRows / per_page),
        },
      });
    }
  );
});

streetController.post("/VutaMitaa", function (req, res) {
  sendRequest(req, res, vutaMitaaListAPI, "POST", {}, (jsonData) => {
    res.send({
      statusCode: jsonData.statusCode,
      message: jsonData.message,
    });
  });
});

module.exports = streetController;
