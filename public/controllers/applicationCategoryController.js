require("dotenv").config();
const express = require("express");
const request = require("request");
const applicationCategoryController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allAppliciationCategoriesAPI   = API_BASE_URL + "all-application-categories";
var tengenezaAppliciationCategoriesAPI = API_BASE_URL + "add-application-category";
var editAppliciationCategoriesAPI   = API_BASE_URL + "edit-application-category";
var updateAppliciationCategoriesAPI = API_BASE_URL + "update-application-category";
var deleteAppliciationCategoriesAPI = API_BASE_URL + "delete-application-category";


// Get all applicationCategorys
applicationCategoryController.get("/AppliciationCategories", function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allAppliciationCategoriesAPI + "?page=" + page + "&per_page=" + per_page;
   var formData = {
     is_paginated: req.query.is_paginated,
   };
  sendRequest(req, res, url, "GET", formData, (jsonData) => {
            var statusCode = jsonData.statusCode;
            var data = jsonData.data;
            var numRows = jsonData.numRows;
            console.log(data , numRows);
            res.send({
              statusCode: statusCode,
              data: data,
              pagination: {
                total: numRows,
                current: page,
                per_page: per_page,
                pages: Math.ceil(numRows / per_page),
              },
            });
  });
});

// Store AppliciationCategories
applicationCategoryController.post("/tengenezaAppliciationCategories", function (req, res) {
    var formData = {
        applicationCategoryName: req.body.applicationCategory_name,
        displayName: req.body.display_name,
        };
    sendRequest(req, res, tengenezaAppliciationCategoriesAPI, "POST", formData, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/AppliciationCategories");
    });
});

// Edit AppliciationCategories
applicationCategoryController.get("/AppliciationCategories/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editAppliciationCategoriesAPI + "/" + id, "GET", {}, (jsonData) => {
    //   getAllAppliciationCategories(req, res, true, jsonData.data);
  });
});

// Update AppliciationCategories
applicationCategoryController.post("/badiliAppliciationCategories/:id", function (req, res) {
  var id = Number(req.params.id);
  var formData = {
          applicationCategoryName: req.body.applicationCategory_name,
          displayName: req.body.display_name,
          status: req.body.status,
  }
  sendRequest(req, res, updateAppliciationCategoriesAPI + "/" + id, "PUT", formData , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        // Make redirection
        statusCode == 300 ? res.redirect("/AppliciationCategories"): res.redirect("/AppliciationCategories/" + id);
  });
});

// Delete AppliciationCategories
applicationCategoryController.post("/futaAppliciationCategories/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteAppliciationCategoriesAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/AppliciationCategories");
  });
});


module.exports = applicationCategoryController;
