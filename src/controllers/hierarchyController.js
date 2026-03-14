require("dotenv").config();
const express = require("express");
const request = require("request");
const hierarchyController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allHierarchiesAPI = API_BASE_URL + "all_hierarchies";
var hierarchiesAPI = API_BASE_URL + "hierarchies_by_ranks";
var tengenezaHierarchyAPI = API_BASE_URL + "add_hierarchy";
var editHierarchyAPI   = API_BASE_URL + "edit_hierarchy";
var updateHierarchyAPI = API_BASE_URL + "update_hierarchy";
var deleteHierarchyAPI = API_BASE_URL + "delete_hierarchy";

hierarchyController.get("/Uongozi", isAuthenticated, can('view-hierarchies'), function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    var formData = {
          is_paginated: true,
      };
  sendRequest(
    req,
    res,
    allHierarchiesAPI + "?page=" + page + "&per_page=" + per_page,
    "GET",
    formData,
    (body) => {
      if (body !== undefined) {
        var jsonData = body;
        var statusCode = jsonData.statusCode;
        var numRows = jsonData.numRows;
        if (statusCode == 300) {
          res.render(path.join(__dirname + "/../views/uongozi"), {
            req: req,
            hierarchies: jsonData.hierarchies,
            ranks: jsonData.ranks,
            pagination: {
              total: Number(numRows),
              current: Number(page),
              per_page: Number(per_page),
              url: "Uongozi",
              pages: Math.ceil(Number(numRows) / Number(per_page)),
            },
          });
        }
      }
    }
  );
});



// Get all hierarchies (Vyeo)
hierarchyController.get("/LookupHierarchies",  isAuthenticated, function (req, res) {
    var formData = {
          rank_id : req.query.rank_id
      };
    sendRequest(req, res, hierarchiesAPI, "GET", formData, (jsonData) => {
            res.send({
              statusCode: jsonData.statusCode,
              data: jsonData.hierarchies,
              message: jsonData.message,
            });
    });
//   getAllHierarchies(req, res);
});

// Store Hierarchy
hierarchyController.post("/tengenezaHierarchy",  isAuthenticated, can('create-hierarchies'),function (req, res) {
    
    sendRequest(req, res, tengenezaHierarchyAPI, "POST", req.body, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        res.send({
          statusCode : statusCode,
          message : message
        })
    });
});

// Edit Hierarchy
hierarchyController.get("/Hierarchy/:id",  isAuthenticated, can('update-hierarchies'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editHierarchyAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllHierarchies(req, res, true, jsonData.data);
  });
});

// Update Hierarchy
hierarchyController.post("/badiliHierarchy/:id",  isAuthenticated, can('update-hierarchies'),function (req, res) {
  var id = Number(req.params.id);
  
  sendRequest(req, res, updateHierarchyAPI + "/" + id, "PUT", req.body , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        res.send({
          statusCode: statusCode,
          message: message,
        });
  });
});

// Delete Hierarchy
hierarchyController.post("/futaHierarchy/:id",  isAuthenticated, can('delete-hierarchies'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteHierarchyAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Uongozi");
  });
});

function getAllHierarchies(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allHierarchiesAPI + "?page=" + page + "&per_page=" + per_page;
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
         res.render(path.join(__dirname + "/../views/hierarchies"), {
           req: req,
           data: data,
           useLev: req.session.UserLevel,
           userName: req.session.userName,
           HierarchyManage: req.session.HierarchyManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           eHierarchy: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "Hierarchies",
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
module.exports = hierarchyController;
