require("dotenv").config();
const express = require("express");
const request = require("request");
const roleController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated, modifiedUrl } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allRolesAPI = API_BASE_URL + "allRoles";
var rolesAPI = API_BASE_URL + "roles";
var createRoleAPI = API_BASE_URL + "roles/create";
var storeRoleAPI = API_BASE_URL + "roles";
var editRoleAPI   = API_BASE_URL + "roles";
var updateRoleAPI = API_BASE_URL + "roles";
var deleteRoleAPI = API_BASE_URL + "roles";
var syncRolesAndPermissions = API_BASE_URL + "generate_roles_permissions";

roleController.get("/Roles", isAuthenticated ,can('view-roles'), function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  sendRequest(req , res , allRolesAPI+`?page=${page}&per_page=${per_page}`, 'GET' , {} , (jsonData) => {
    const {data , numRows} = jsonData;    
    res.render(path.join(__dirname + "/../design/roles"), {
              req: req,
              data: data,
              pagination : {
                    total : numRows , 
                    current : page , 
                    per_page : per_page , 
                    url : modifiedUrl(req),
                    pages : Math.ceil( numRows / per_page)
                }
            });
  })

})

// Get all roles
roleController.get("/allRoles",  isAuthenticated, can('view-roles'), function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var formData = {
    page,
    per_page,
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

roleController.post("/LookupRoles", isAuthenticated, (req, res) => {
  sendRequest(req, res, rolesAPI, "GET", {}, (jsonData) => {
    res.send({
      statusCode: jsonData.statusCode,
      data: jsonData.data,
      message: jsonData.message,
    });
  });
});

// Store Role
roleController.post("/tengenezaRole",  isAuthenticated, can('create-roles'), function (req, res) {
    var formData = {
        roleName: req.body.role_name,
        permissions: req.body.permissions,
        };
    sendRequest(req, res, storeRoleAPI, "POST", formData, (body) => {
      var statusCode = body.statusCode;
      var message = body.message;
      res.send({
        statusCode,
        message
      });
    });
});

// form
roleController.get("/CreateRole", isAuthenticated, function (req, res) {
    sendRequest(req , res , createRoleAPI,"GET", {} , 
    function (jsonData) {
            const {data} = jsonData
            res.render(path.join(__dirname + "/../design/create_role"), {
              req: req,
              data: data,
            });
      }
    );
});
// Edit Role
roleController.get("/EditRole/:id", isAuthenticated, function (req, res) {
    const role_id = req.params.id;
    sendRequest(req, res , editRoleAPI + `/${role_id}`, "GET",{},function (jsonData) {
      const {permissions , role_permissions , role } = jsonData;
      const assigned_permissions = [];
        role_permissions.forEach((role_permission) => {
          assigned_permissions.push(role_permission.permission_id);
        });
        res.render(path.join(__dirname + "/../design/edit_role"), {
          req: req,
          permissions: permissions,
          assigned_permissions: assigned_permissions,
          role: role,
        });
      }
    );
});
// roleController.get("/Roles/:id",  isAuthenticated, can('update-roles'), function (req, res) {
//   var id = Number(req.params.id);
//   sendRequest(req, res, editRoleAPI + "/" + id, "GET", {}, (jsonData) => {
//       getAllRoles(req, res, true, jsonData.data);
//   });
// });

// Update Role
roleController.post("/sasishaRole/:id",  isAuthenticated, can('update-roles'), function (req, res) {
  const id = Number(req.params.id);
  const formData = {
    roleName: req.body.role_name,
    permissions: req.body.permissions,
  };
  sendRequest(req, res, updateRoleAPI + "/" + id, "PUT", formData , (jsonData) => {
        const { message , statusCode} = jsonData
        res.send({ statusCode,message });
  });
});

// Delete Role
roleController.post("/futaRole/:id",  isAuthenticated, can('delete-roles'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteRoleAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Roles");
  });
});
// sync roles and permissions 
roleController.post("/sync_roles_and_permissions" ,  isAuthenticated, can('create-roles') , function(req, res){
     sendRequest(req, res, syncRolesAndPermissions , "POST" , {} , (data) => {
         res.send({
           statusCode: data.statusCode,
           message: data.message,
         });
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
