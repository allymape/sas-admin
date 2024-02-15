require("dotenv").config();
const express = require("express");
const request = require("request");
const wardController = express.Router();
var session = require("express-session");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var wardListAPI = API_BASE_URL + "allwards";
var wardAPI = API_BASE_URL + "lookup-wards";
var vutaKataListAPI = API_BASE_URL + "usajiliKata";

// wardController.use(
//   session({
//     secret: "secret",
//     resave: true,
//     saveUninitialized: true,
//   })
// );
wardController.get(
  "/Kata",
  isAuthenticated,
  can("view-wards"),
  function (req, res) {
    res.render(path.join(__dirname + "/../design/wards"), {
      req: req,
    });
  }
);


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

wardController.get(
  "/LookupKata",
  isAuthenticated,
  function (req, res) {
    sendRequest(req, res, wardAPI, "GET", req.query, (jsonData) => {
      var { data, statusCode } = jsonData;
      res.send({
        wards: data,
        statusCode: statusCode,
      });
    });
  }
);

wardController.post("/VutaKata",  isAuthenticated, can('create-wards'), function (req, res) {
  sendRequest(req, res, vutaKataListAPI, "POST", {}, (jsonData) => {
        res.send({
            statusCode: jsonData.statusCode,
            message: jsonData.message,
        });
  });
});

module.exports = wardController;
