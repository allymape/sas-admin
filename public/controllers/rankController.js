require("dotenv").config();
const express = require("express");
const request = require("request");
const rankController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allRanksAPI = API_BASE_URL + "allRanks";
var tengenezaRankAPI = API_BASE_URL + "addRank";
var editRankAPI   = API_BASE_URL + "editRank";
var updateRankAPI = API_BASE_URL + "updateRank";
var deleteRankAPI = API_BASE_URL + "deleteRank";


// Get all ranks
rankController.get("/ranks", function (req, res) {
    var formData = {
         is_paginated: req.query.is_paginated,
    };
    sendRequest(req, res, allRanksAPI, "GET", formData, (jsonData) => {
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
rankController.post("/tengenezaRank", function (req, res) {
    var formData = {
        rankName: req.body.rank_name,
        displayName: req.body.display_name,
        };
    sendRequest(req, res, tengenezaRankAPI, "POST", formData, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Ranks");
    });
});

// Edit Rank
rankController.get("/Ranks/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editRankAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllRanks(req, res, true, jsonData.data);
  });
});

// Update Rank
rankController.post("/badiliRank/:id", function (req, res) {
  var id = Number(req.params.id);
  var formData = {
          rankName: req.body.rank_name,
          displayName: req.body.display_name,
          status: req.body.status,
  }
  sendRequest(req, res, updateRankAPI + "/" + id, "PUT", formData , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        // Make redirection
        statusCode == 300 ? res.redirect("/Ranks"): res.redirect("/Ranks/" + id);
  });
});

// Delete Rank
rankController.post("/futaRank/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteRankAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Ranks");
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
            useLevel: req.session.UserLevel,
            office: req.session.office,
   };

  sendRequest(req, res, url, "GET", formData, (jsonData) => {
     if (jsonData !== undefined) {
       var statusCode = jsonData.statusCode;
       var data = jsonData.data;
       var numRows = jsonData.numRows;
       if (statusCode == 300) {
         res.render(path.join(__dirname + "/../design/ranks"), {
           req: req,
           data: data,
           useLev: req.session.UserLevel,
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
