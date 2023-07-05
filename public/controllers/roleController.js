require("dotenv").config();
const express = require("express");
const request = require("request");
const roleController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allRolesAPI = API_BASE_URL + "allRoles";
var tengenezaRoleAPI = API_BASE_URL + "addRole";
var editRoleAPI   = API_BASE_URL + "editRole";
var updateRoleAPI = API_BASE_URL + "updateRole";
var deleteRoleAPI = API_BASE_URL + "deleteRole";


// Get all roles
roleController.get("/allRoles", function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var formData = {
    is_paginated: req.query.is_paginated,
  };
  sendRequest(req, res, allRolesAPI, "GET", formData, (jsonData) => {
    // console.log(jsonData);
    res.send({
      statusCode: jsonData.statusCode,
      data: jsonData.data,
      message: jsonData.message,
    });
  });
  //   getAllRoles(req, res);
});

// Store Role
roleController.post("/tengenezaRole", function (req, res) {
    var formData = {
        roleName: req.body.role_name,
        displayName: req.body.display_name,
        };
    sendRequest(req, res, tengenezaRoleAPI, "POST", formData, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Roles");
    });
});

// Edit Role
roleController.get("/Roles/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editRoleAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllRoles(req, res, true, jsonData.data);
  });
});

// Update Role
roleController.post("/badiliRole/:id", function (req, res) {
  var id = Number(req.params.id);
  var formData = {
          roleName: req.body.role_name,
          displayName: req.body.display_name,
          status: req.body.status,
          is_default: req.body.is_default,
  }
  sendRequest(req, res, updateRoleAPI + "/" + id, "PUT", formData , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        // Make redirection
        statusCode == 300 ? res.redirect("/Roles"): res.redirect("/Roles/" + id);
  });
});

// Delete Role
roleController.post("/futaRole/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteRoleAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Roles");
  });
});

function getAllRoles(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allRolesAPI + "?page=" + page + "&per_page=" + per_page;
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
         res.render(path.join(__dirname + "/../design/roles"), {
           req: req,
           data: data,
           useLev: req.session.UserLevel,
           userName: req.session.userName,
           RoleManage: req.session.RoleManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           eRole: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "Roles",
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
module.exports = roleController;
