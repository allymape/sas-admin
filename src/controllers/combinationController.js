require("dotenv").config();
const express = require("express");
const request = require("request");
const combinationController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allCombinationAPI = API_BASE_URL + "allCombinations";
var tengenezaCombinationAPI = API_BASE_URL + "addCombination";
var editCombinationAPI   = API_BASE_URL + "editCombination";
var updateCombinationAPI = API_BASE_URL + "updateCombination";
var deleteCombinationAPI = API_BASE_URL + "deleteCombination";

// Display combination page
combinationController.get("/Tahasusi", isAuthenticated, function (req, res) {
      var per_page = Number(req.query.per_page || 10);
      var page = Number(req.query.page || 1);
      var formData = {
        is_paginated: true,
      };
      sendRequest(
        req,
        res,
        allCombinationAPI + "?page=" + page + "&per_page=" + per_page,
        "GET",
        formData,
        (body) => {
          if (body !== undefined) {
            var jsonData = body;
            var statusCode = jsonData.statusCode;
            var numRows = jsonData.numRows;
            if (statusCode == 300) {
              res.render(path.join(__dirname + "/../views/tahasusilist"), {
                req: req,
                data: jsonData.combinationes,
                michepuo: jsonData.specializations,
                pagination: {
                  total: Number(numRows),
                  current: Number(page),
                  per_page: Number(per_page),
                  url: "Tahasusi",
                  pages: Math.ceil(Number(numRows) / Number(per_page)),
                },
              });
            }
          }
        }
      );
});

// Get all combination
combinationController.get("/Combination",  isAuthenticated, can('view-combination'),function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
    var formData = {
         is_paginated: req.query.is_paginated,
    };
    sendRequest(req, res, allCombinationAPI+ "?page=" + page + "&per_page=" + per_page, "GET", formData, (jsonData) => {
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
//   getAllCombination(req, res);
});


// Store Combination
combinationController.post("/TengenezaCombination",  isAuthenticated, can('create-combinations'), function (req, res) {
  
  sendRequest(req, res, tengenezaCombinationAPI, "POST", req.body, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        res.send({
          statusCode: statusCode,
          message: message,
        });
    });
});

// Edit Combination
combinationController.get("/Combination/:id",  isAuthenticated, can('update-combination'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editCombinationAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllCombination(req, res, true, jsonData.data);
  });
});

// Update Combination
combinationController.post("/BadiliCombination/:id",  isAuthenticated, can('update-combinations'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, updateCombinationAPI + "/" + id, "PUT", req.body , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        res.send({
              statusCode : statusCode,
              message : message
        });
  });
});

// Delete Combination
combinationController.post("/FutaCombination/:id",  isAuthenticated, can('delete-combinations'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteCombinationAPI + "/" + id, "PUT", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
         res.send({
           statusCode: statusCode,
           message: message,
         });
  });
});

function getAllCombination(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allCombinationAPI + "?page=" + page + "&per_page=" + per_page;
  var formData = {
            browser_used: req.session.browser_used,
            ip_address: req.session.ip_address,
            useCombination: req.session.UserCombination,
            office: req.session.office,
   };

  sendRequest(req, res, url, "GET", formData, (jsonData) => {
     if (jsonData !== undefined) {
       var statusCode = jsonData.statusCode;
       var data = jsonData.data;
       var numRows = jsonData.numRows;
       if (statusCode == 300) {
         res.render(path.join(__dirname + "/../views/combination"), {
           req: req,
           data: data,
           useLev: req.session.UserCombination,
           userName: req.session.userName,
           CombinationManage: req.session.CombinationManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           eCombination: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "Combination",
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
module.exports = combinationController;
