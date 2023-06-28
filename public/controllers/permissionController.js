require("dotenv").config();
const express = require("express");
const request = require("request");
const permissionController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allPermissionsAPI   = API_BASE_URL + "allPermissions";
var tengenezaPermissionAPI = API_BASE_URL + "addPermission";
var editPermissionAPI   = API_BASE_URL + "editPermission";
var updatePermissionAPI = API_BASE_URL + "updatePermission";
var deletePermissionAPI = API_BASE_URL + "deletePermission";


// Get all permissions
permissionController.get("/Permissions", function (req, res) {
  getAllPermissions(req, res);
});

// Store Permission
permissionController.post("/tengenezaPermission", function (req, res) {
    var formData = {
        permissionName: req.body.permission_name,
        displayName: req.body.display_name,
        };
    sendRequest(req, res, tengenezaPermissionAPI, "POST", formData, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Permissions");
    });
});

// Edit Permission
permissionController.get("/Permissions/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editPermissionAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllPermissions(req, res, true, jsonData.data);
  });
});

// Update Permission
permissionController.post("/badiliPermission/:id", function (req, res) {
  var id = Number(req.params.id);
  var formData = {
          permissionName: req.body.permission_name,
          displayName: req.body.display_name,
          status: req.body.status,
  }
  sendRequest(req, res, updatePermissionAPI + "/" + id, "PUT", formData , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        // Make redirection
        statusCode == 300 ? res.redirect("/Permissions"): res.redirect("/Permissions/" + id);
  });
});

// Delete Permission
permissionController.post("/futaPermission/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deletePermissionAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Permissions");
  });
});

function getAllPermissions(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allPermissionsAPI + "?page=" + page + "&per_page=" + per_page;
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
         res.render(path.join(__dirname + "/../design/permissions"), {
           req: req,
           data: data,
           useLev: req.session.UserLevel,
           userName: req.session.userName,
           RoleManage: req.session.RoleManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           ePermission: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "Permissions",
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
module.exports = permissionController;
