require("dotenv").config();
const express = require("express");
const request = require("request");
const biasController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allBiasAPI = API_BASE_URL + "allBiases";
var tengenezaBiasAPI = API_BASE_URL + "addBias";
var editBiasAPI   = API_BASE_URL + "editBias";
var updateBiasAPI = API_BASE_URL + "updateBias";
var deleteBiasAPI = API_BASE_URL + "deleteBias";

// Display biass page
biasController.get("/Michepuo", isAuthenticated, function (req, res) {
       var per_page = Number(req.query.per_page || 10);
       var page = Number(req.query.page || 1);
       var formData = {
         is_paginated: true,
       };
       sendRequest(
         req,
         res,
         allBiasAPI + "?page=" + page + "&per_page=" + per_page,
         "GET",
         formData,
         (body) => {
           if (body !== undefined) {
             var jsonData = body;
             var statusCode = jsonData.statusCode;
             var numRows = jsonData.numRows;
             if (statusCode == 300) {
               res.render(path.join(__dirname + "/../design/michepuolist"), {
                 req: req,
                 michepuo: jsonData.data,
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

// Get all biass
biasController.get("/Bias",  isAuthenticated, can('view-biases'),function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
    var formData = {
         is_paginated: req.query.is_paginated,
    };
    sendRequest(req, res, allBiasAPI+ "?page=" + page + "&per_page=" + per_page, "GET", formData, (jsonData) => {
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
//   getAllBias(req, res);
});


// Store Bias
biasController.post("/TengenezaBias",  isAuthenticated, can('create-biases'), function (req, res) {
  
  sendRequest(req, res, tengenezaBiasAPI, "POST", req.body, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        res.send({
          statusCode: statusCode,
          message: message,
        });
    });
});

// Edit Bias
biasController.get("/Bias/:id",  isAuthenticated, can('update-biases'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editBiasAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllBias(req, res, true, jsonData.data);
  });
});

// Update Bias
biasController.post("/BadiliBias/:id",  isAuthenticated, can('update-biases'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, updateBiasAPI + "/" + id, "PUT", req.body , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        res.send({
              statusCode : statusCode,
              message : message
        });
  });
});

// Delete Bias
biasController.post("/FutaBias/:id",  isAuthenticated, can('delete-biass'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteBiasAPI + "/" + id, "PUT", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
         res.send({
           statusCode: statusCode,
           message: message,
         });
  });
});

function getAllBias(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allBiasAPI + "?page=" + page + "&per_page=" + per_page;
  var formData = {
            browser_used: req.session.browser_used,
            ip_address: req.session.ip_address,
            useBias: req.session.UserBias,
            office: req.session.office,
   };

  sendRequest(req, res, url, "GET", formData, (jsonData) => {
     if (jsonData !== undefined) {
       var statusCode = jsonData.statusCode;
       var data = jsonData.data;
       var numRows = jsonData.numRows;
       if (statusCode == 300) {
         res.render(path.join(__dirname + "/../design/biass"), {
           req: req,
           data: data,
           useLev: req.session.UserBias,
           userName: req.session.userName,
           BiasManage: req.session.BiasManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           eBias: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "Bias",
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
module.exports = biasController;
