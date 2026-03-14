require("dotenv").config();
const express = require("express");
const request = require("request");
const algorithmController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can, activeHandover } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allalgorithmAPI = API_BASE_URL + "all-algorithms";
var generateNumbersAPI = API_BASE_URL + "generateNumber";
var editAlgorithmAPI   = API_BASE_URL + "editAlgorithm";
var updateAlgorithmAPI = API_BASE_URL + "updateAlgorithm";
var deleteAlgorithmAPI = API_BASE_URL + "deleteAlgorithm";
const categoriesAPI = API_BASE_URL + "all-school-categories";

// Display algorithm page
algorithmController.get(
  "/Algorithm",
  isAuthenticated,
  can("view-algorithm"),
  activeHandover,
  function (req, res) {
    sendRequest(req, res, categoriesAPI, "GET", {}, (jsonData) => {
      const { data } = jsonData;
      res.render(path.join(__dirname + "/../views/algorithm"), {
        req: req,
        categories: data,
      });
    });
  }
);

// Get all algorithm
algorithmController.get(
  "/All-algorithms",
  isAuthenticated,
  can("view-algorithm"),
  activeHandover,
  function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    var formData = {
      is_paginated: req.query.is_paginated,
    };
    console.log("nipo");
    sendRequest(
      req,
      res,
      allalgorithmAPI + "?page=" + page + "&per_page=" + per_page,
      "GET",
      formData,
      (jsonData) => {
        // console.log(jsonData);
        var numRows = jsonData.numRows;
        res.send({
          statusCode: jsonData.statusCode,
          data: jsonData.data,
          message: jsonData.message,
          pagination: {
            total: numRows,
            current: page,
            per_page: per_page,
            pages: Math.ceil(numRows / per_page),
          },
        });
      }
    );
    //   getAllalgorithm(req, res);
  }
);


// Store Algorithm
algorithmController.post(
  "/TengenezaAlgorithm",
  isAuthenticated,
  can("create-algorithm"),
  activeHandover,
  function (req, res) {
    sendRequest(req, res, generateNumbersAPI, "POST", req.body, (body) => {
      var statusCode = body.statusCode;
      var success = body.success;
      res.send({
        statusCode: statusCode,
        success: success,
      });
    });
  }
);

// Edit Algorithm
algorithmController.get(
  "/Algorithm/:id",
  isAuthenticated,
  can("update-algorithm"),
  activeHandover,
  function (req, res) {
    var id = Number(req.params.id);
    sendRequest(
      req,
      res,
      editAlgorithmAPI + "/" + id,
      "GET",
      {},
      (jsonData) => {
        getAllAlgorithm(req, res, true, jsonData.data);
      }
    );
  }
);

// Update Algorithm
algorithmController.post(
  "/BadiliAlgorithm/:id",
  isAuthenticated,
  can("update-algorithm"),
  activeHandover,
  function (req, res) {
    var id = Number(req.params.id);
    sendRequest(
      req,
      res,
      updateAlgorithmAPI + "/" + id,
      "PUT",
      req.body,
      (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        res.send({
          statusCode: statusCode,
          message: message,
        });
      }
    );
  }
);

// Delete Algorithm
algorithmController.post(
  "/FutaAlgorithm/:id",
  isAuthenticated,
  can("delete-algorithm"),
  activeHandover,
  function (req, res) {
    var id = Number(req.params.id);
    sendRequest(
      req,
      res,
      deleteAlgorithmAPI + "/" + id,
      "PUT",
      {},
      (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        res.send({
          statusCode: statusCode,
          message: message,
        });
      }
    );
  }
);

function getAllAlgorithm(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allalgorithmAPI + "?page=" + page + "&per_page=" + per_page;
  var formData = {
            browser_used: req.session.browser_used,
            ip_address: req.session.ip_address,
            useLevel: req.session.UserLevel,
            office: req.session.office,
   };

  sendRequest(req, res, url, "GET", formData, (jsonData) => {
     if (jsonData !== undefined) {
       var statusCode = jsonData.statusCode;
       var data = jsonData.data;
       var numRows = jsonData.numRows;
       if (statusCode == 300) {
         res.render(path.join(__dirname + "/../views/algorithm"), {
           req: req,
           data: data,
           useLev: req.session.UserLevel,
           userName: req.session.userName,
           AlgorithmManage: req.session.AlgorithmManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           eAlgorithm: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "algorithm",
             pages: Math.ceil(Number(numRows) / Number(per_page)),
           },
         });
       }
       if (statusCode == 209) {
         res.redirect("/");
       }
     }
  });
}
module.exports = algorithmController;
