require("dotenv").config();
const express = require("express");
const request = require("request");
const feeController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allFeesAPI = API_BASE_URL + "allFees";
var tengenezaFeeAPI = API_BASE_URL + "addFee";
var editFeeAPI   = API_BASE_URL + "editFee";
var updateFeeAPI = API_BASE_URL + "updateFee";
var deleteFeeAPI = API_BASE_URL + "deleteFee";

// Display fees page
feeController.get("/Malipo", isAuthenticated, function (req, res) {
      var per_page = Number(req.query.per_page || 10);
      var page = Number(req.query.page || 1);
      var formData = {
        is_paginated: true,
      };
      sendRequest(
        req,
        res,
        allFeesAPI + "?page=" + page + "&per_page=" + per_page,
        "GET",
        formData,
        (body) => {
          if (body !== undefined) {
            var jsonData = body;
            var statusCode = jsonData.statusCode;
            var numRows = jsonData.numRows;
            if (statusCode == 300) {
              res.render(path.join(__dirname + "/../views/malipo"), {
                req: req,
                data: jsonData.data,
                pagination: {
                  total: Number(numRows),
                  current: Number(page),
                  per_page: Number(per_page),
                  url: "Malipo",
                  pages: Math.ceil(Number(numRows) / Number(per_page)),
                },
              });
            }
          }
        }
      );
});

// Get all fees
feeController.get("/Fees",  isAuthenticated, can('view-fees'),function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
    var formData = {
         is_paginated: req.query.is_paginated,
    };
    sendRequest(req, res, allFeesAPI+ "?page=" + page + "&per_page=" + per_page, "GET", formData, (jsonData) => {
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
    });
//   getAllFees(req, res);
});


// Store Fee
feeController.post("/TengenezaFee",  isAuthenticated, can('create-fees'), function (req, res) {
  
  sendRequest(req, res, tengenezaFeeAPI, "POST", req.body, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        res.send({
          statusCode: statusCode,
          message: message,
        });
    });
});

// Edit Fee
feeController.get("/Fees/:id",  isAuthenticated, can('update-fees'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editFeeAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllFees(req, res, true, jsonData.data);
  });
});

// Update Fee
feeController.post("/BadiliFee/:id",  isAuthenticated, can('update-fees'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, updateFeeAPI + "/" + id, "PUT", req.body , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        res.send({
              statusCode : statusCode,
              message : message
        });
  });
});

// Delete Fee
feeController.post("/FutaFee/:id",  isAuthenticated, can('delete-fees'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteFeeAPI + "/" + id, "PUT", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
         res.send({
           statusCode: statusCode,
           message: message,
         });
  });
});

function getAllFees(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allFeesAPI + "?page=" + page + "&per_page=" + per_page;
  var formData = {
            browser_used: req.session.browser_used,
            ip_address: req.session.ip_address,
            useFee: req.session.UserFee,
            office: req.session.office,
   };

  sendRequest(req, res, url, "GET", formData, (jsonData) => {
     if (jsonData !== undefined) {
       var statusCode = jsonData.statusCode;
       var data = jsonData.data;
       var numRows = jsonData.numRows;
       if (statusCode == 300) {
         res.render(path.join(__dirname + "/../views/fees"), {
           req: req,
           data: data,
           useLev: req.session.UserFee,
           userName: req.session.userName,
           FeeManage: req.session.FeeManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           eFee: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "Fees",
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
module.exports = feeController;
