require("dotenv").config();
const express = require("express");
const request = require("request");
const districtController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var lgaListAPI = API_BASE_URL + "allDistricts";
var VutaWilayaListAPI = API_BASE_URL + "usajiliWilaya";

districtController.get("/HalmashauriList", function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
   var formData = {
     is_paginated: req.query.is_paginated,
     region_code: req.query.region_code,
   };
  sendRequest(
    req,
    res,
    lgaListAPI + "?page=" + page + "&per_page=" + per_page,
    "GET",
    formData,
    (jsonData) => {
      var data = jsonData.data;
      var numRows = jsonData.numRows;
      res.send({
        councils: data,
        statusCode: jsonData.statusCode,
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

districtController.post("/VutaWilaya", function (req, res) {
  sendRequest(req, res, VutaWilayaListAPI, "POST", {}, (jsonData) => {
    res.send({
      statusCode: jsonData.statusCode,
      message: jsonData.message,
    });
  });
});


module.exports = districtController;
