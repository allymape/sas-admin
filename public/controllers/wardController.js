require("dotenv").config();
const express = require("express");
const request = require("request");
const wardController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var wardListAPI = API_BASE_URL + "allwards";
var vutaKataListAPI = API_BASE_URL + "usajiliKata";

// wardController.use(
//   session({
//     secret: "secret",
//     resave: true,
//     saveUninitialized: true,
//   })
// );


wardController.get("/WardList",  isAuthenticated, can('view-wards'), function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  
  sendRequest(
    req,
    res,
    wardListAPI + "?page=" + page + "&per_page=" + per_page,
    "GET",
    req.query,
    (jsonData) => {
      var {data , numRows , statusCode} = jsonData;
      res.send({
        statusCode : statusCode,
        wards: data,
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

wardController.post("/VutaKata",  isAuthenticated, can('create-wards'), function (req, res) {
  sendRequest(req, res, vutaKataListAPI, "POST", {}, (jsonData) => {
        res.send({
            statusCode: jsonData.statusCode,
            message: jsonData.message,
        });
  });
});

module.exports = wardController;
