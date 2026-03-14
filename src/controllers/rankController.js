require("dotenv").config();
const express = require("express");
const request = require("request");
const rankController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allRanksAPI = API_BASE_URL + "allRanks";
var ranksAPI = API_BASE_URL + "ranks";
var tengenezaRankAPI = API_BASE_URL + "addRank";
var editRankAPI   = API_BASE_URL + "editRank";
var updateRankAPI = API_BASE_URL + "updateRank";
var deleteRankAPI = API_BASE_URL + "deleteRank";

// Display ranks page
rankController.get("/Ngazi", isAuthenticated, function (req, res) {
        res.render(path.join(__dirname + "/../views/ngazi"), {
          req: req,
        });
});

// Get all ranks
rankController.get("/Ranks",  isAuthenticated, can('view-ranks'),function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
    var formData = {
         is_paginated: req.query.is_paginated,
    };
    sendRequest(req, res, allRanksAPI+ "?page=" + page + "&per_page=" + per_page, "GET", formData, (jsonData) => {
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
//   getAllRanks(req, res);
});

rankController.post("/LookupRanks",  isAuthenticated,function (req, res) {
  
    sendRequest(req, res, ranksAPI, "GET", {}, (jsonData) => {
            // console.log(jsonData);
            res.send({
              statusCode: jsonData.statusCode,
              data: jsonData.data,
              message: jsonData.message,
            });
    });
//   getAllRanks(req, res);
});


// Store Rank
rankController.post("/TengenezaRank",  isAuthenticated, can('create-ranks'), function (req, res) {
  
  sendRequest(req, res, tengenezaRankAPI, "POST", req.body, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        res.send({
          statusCode: statusCode,
          message: message,
        });
    });
});

// Edit Rank
rankController.get("/Ranks/:id",  isAuthenticated, can('update-ranks'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editRankAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllRanks(req, res, true, jsonData.data);
  });
});

// Update Rank
rankController.post("/BadiliRank/:id",  isAuthenticated, can('update-ranks'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, updateRankAPI + "/" + id, "PUT", req.body , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        res.send({
              statusCode : statusCode,
              message : message
        });
  });
});

// Delete Rank
rankController.post("/FutaRank/:id",  isAuthenticated, can('delete-ranks'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteRankAPI + "/" + id, "PUT", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
         res.send({
           statusCode: statusCode,
           message: message,
         });
  });
});

function getAllRanks(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allRanksAPI + "?page=" + page + "&per_page=" + per_page;
  var formData = {
            browser_used: req.session.browser_used,
            ip_address: req.session.ip_address,
            useRank: req.session.UserRank,
            office: req.session.office,
   };

  sendRequest(req, res, url, "GET", formData, (jsonData) => {
     if (jsonData !== undefined) {
       var statusCode = jsonData.statusCode;
       var data = jsonData.data;
       var numRows = jsonData.numRows;
       if (statusCode == 300) {
         res.render(path.join(__dirname + "/../views/ranks"), {
           req: req,
           data: data,
           useLev: req.session.UserRank,
           userName: req.session.userName,
           RankManage: req.session.RankManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           eRank: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "Ranks",
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
module.exports = rankController;
