require("dotenv").config();
const express = require("express");
const request = require("request");
const sample = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
const example = API_BASE_URL + "example"

// Display
sample.get(
  "/MaombiMmilikiShule",
  isAuthenticated,
  can("view-initiate-schools"),
  function (req, res) {
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
    };
    sendRequest(
      req,
      res,
      example,
      "GET",
      formData,
      (jsonData) => {
        const { data } = jsonData;
        res.render(
          path.join(__dirname + "/../../design/maombi/mmiliki"),
          {
            req: req,
            total_month: data,
          }
        );
      }
    );
  }
);



module.exports = sample;
