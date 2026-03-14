require("dotenv").config();
const express = require("express");
const request = require("request");
const registrationTypeController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allRegistrationTypesAPI   = API_BASE_URL + "all-registration-types";
var tengenezaRegistrationTypeAPI = API_BASE_URL + "add-registration-type";
var editRegistrationTypeAPI   = API_BASE_URL + "edit-registration-type";
var updateRegistrationTypeAPI = API_BASE_URL + "update-registration-type";
var deleteRegistrationTypeAPI = API_BASE_URL + "delete-registration-type";


// Get all RegistrationTypees
registrationTypeController.get("/RegistrationTypes", function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allRegistrationTypesAPI + "?page=" + page + "&per_page=" + per_page;
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

// Store RegistrationTypee
registrationTypeController.post("/tengenezaRegistrationType", function (req, res) {
    var formData = {
        registrationTypeName: req.body.registrationType_name,
        displayName: req.body.display_name,
        };
    sendRequest(req, res, tengenezaRegistrationTypeAPI, "POST", formData, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/RegistrationTypes");
    });
});

// Edit RegistrationTypee
registrationTypeController.get("/RegistrationTypes/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editRegistrationTypeAPI + "/" + id, "GET", {}, (jsonData) => {
    //   getAllRegistrationTypes(req, res, true, jsonData.data);
  });
});

// Update RegistrationTypee
registrationTypeController.post("/badiliRegistrationType/:id", function (req, res) {
  var id = Number(req.params.id);
  var formData = {
          registrationTypeName: req.body.registrationType_name,
          displayName: req.body.display_name,
          status: req.body.status,
  }
  sendRequest(req, res, updateRegistrationTypeAPI + "/" + id, "PUT", formData , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        // Make redirection
        statusCode == 300 ? res.redirect("/RegistrationTypes"): res.redirect("/RegistrationTypes/" + id);
  });
});

// Delete RegistrationTypee
registrationTypeController.post("/futaRegistrationType/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteRegistrationTypeAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/RegistrationTypes");
  });
});


module.exports = registrationTypeController;
