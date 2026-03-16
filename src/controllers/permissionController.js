require("dotenv").config();
const express = require("express");
const request = require("request");
const permissionController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated, activeHandover } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allPermissionsAPI   = API_BASE_URL + "allPermissions";
var allModulesAPI   = API_BASE_URL + "allModules";
var tengenezaPermissionAPI = API_BASE_URL + "addPermission";
var editPermissionAPI   = API_BASE_URL + "editPermission";
var updatePermissionAPI = API_BASE_URL + "updatePermission";
var deletePermissionAPI = API_BASE_URL + "deletePermission";


// Get all permissions
permissionController.get(
  "/Permissions",
  isAuthenticated,
  can("view-permissions"),
  activeHandover,
  function (req, res) {
    getAllPermissions(req, res);
  }
);

// Store Permission
permissionController.post("/tengenezaPermission",  isAuthenticated, can('create-permissions'), function (req, res) {
    var formData = {
        permissionName: req.body.permission_name,
        displayName: req.body.display_name,
        module_id: Number(req.body.module_id || 0),
        };
    sendRequest(req, res, tengenezaPermissionAPI, "POST", formData, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Permissions");
    });
});

// Edit Permission
permissionController.get("/Permissions/:id",  isAuthenticated, can('update-permissions'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editPermissionAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllPermissions(req, res, true, jsonData.data);
  });
});

// Update Permission
permissionController.post("/badiliPermission/:id",  isAuthenticated, can('update-permissions'), function (req, res) {
  var id = Number(req.params.id);
  var formData = {
          permissionName: req.body.permission_name,
          displayName: req.body.display_name,
          module_id: Number(req.body.module_id || 0),
          status: req.body.status,
          is_default: req.body.is_default,
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
permissionController.post("/futaPermission/:id",  isAuthenticated, can('delete-permissions'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deletePermissionAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Permissions");
  });
});

function getAllPermissions(req, res, edit = false, editedData = null) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var filter = String(req.query.filter || "all").toLowerCase();
  var url = allPermissionsAPI + "?page=" + page + "&per_page=" + per_page;
  if (filter === "active") {
    url += "&status=1";
  } else if (filter === "default") {
    url += "&is_default=1";
  } else {
    filter = "all";
  }
  var formData = {
            browser_used: req.session.browser_used,
            ip_address: req.session.ip_address,
            useLevel: req.session.UserLevel,
            office: req.session.office,
            tafuta : req.query.tafuta
   };

  sendRequest(req, res, url, "GET", formData, (jsonData) => {
     if (jsonData !== undefined) {
       var statusCode = jsonData.statusCode;
       var data = jsonData.data;
       var numRows = jsonData.numRows;
       if (statusCode == 300) {
          const activePermissionsCountUrl = allPermissionsAPI + "?page=1&per_page=1&status=1";
          sendRequest(req, res, activePermissionsCountUrl, "GET", {}, (activeResponse) => {
            const activeTotal =
              activeResponse && activeResponse.statusCode === 300
                ? Number(activeResponse.numRows || 0)
                : 0;

            const defaultPermissionsCountUrl = allPermissionsAPI + "?page=1&per_page=1&is_default=1";
            sendRequest(req, res, defaultPermissionsCountUrl, "GET", {}, (defaultResponse) => {
              const defaultTotal =
                defaultResponse && defaultResponse.statusCode === 300
                  ? Number(defaultResponse.numRows || 0)
                  : 0;

              sendRequest(
                req,
                res,
                allModulesAPI + "?page=1&per_page=500&is_paginated=false&status=1",
                "GET",
                {},
                (moduleResponse) => {
                  const modules =
                    moduleResponse && moduleResponse.statusCode === 300 && Array.isArray(moduleResponse.data)
                      ? moduleResponse.data
                      : [];

                  res.render(path.join(__dirname + "/../views/permissions"), {
                    req: req,
                    data: data,
                    modules: modules,
                    currentFilter: filter,
                    activeTotal: activeTotal,
                    defaultTotal: defaultTotal,
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
                      url: filter === "all" ? "Permissions" : `Permissions?filter=${filter}`,
                      pages: Math.ceil(Number(numRows) / Number(per_page)),
                    },
                  });
                }
              );
            });
          });
       }
       if (statusCode == 209) {
         res.redirect("/");
       }
     }
  });
}
module.exports = permissionController;
