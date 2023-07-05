require("dotenv").config();
const express = require("express");
const request = require("request");
const regionController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL      = process.env.API_BASE_URL;
var mikoaListAPI      = API_BASE_URL + "regions";
var VutaMikoaListAPI  = API_BASE_URL + "usajiliMikoa";
var mkoaKandaAPI      = API_BASE_URL + "assign-region-zone";


regionController.get("/MikoaList", function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    var formData = {
      is_paginated: req.query.is_paginated,
      zone_id: req.query.zone_id,
    };
    sendRequest(req, res, mikoaListAPI + "?page=" + page + "&per_page=" + per_page, "GET", formData , (jsonData) => {
        var data = jsonData.data;
        var numRows = jsonData.numRows;
        // console.log(data);
        res.send({
        statusCode: jsonData.statusCode,
        regions: data,
        pagination: {
            total: numRows,
            current: page,
            per_page: per_page,
            pages: Math.ceil(numRows / per_page),
        },
        });
  });
});

regionController.post("/VutaMikoa", function (req, res) {
    sendRequest(req, res, VutaMikoaListAPI, "POST", {}, (jsonData) => {
        res.send({ 
            statusCode: jsonData.statusCode, 
            message: jsonData.message 
        });
    });
});
regionController.post("/MkoaKanda", function (req, res) {
    var formData = {
                    browser_used: req.session.browser_used,
                    ip_address: req.session.ip_address,
                    kanda: req.body.kanda,
                    regionId: req.body.regionId,
                  };
    sendRequest(req, res, mkoaKandaAPI, "POST", formData , (jsonData) => {
          res.send({
                statusCode: jsonData.statusCode,
                message: jsonData.message,
          });
    });
});


module.exports = regionController;