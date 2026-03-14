require("dotenv").config();
const express = require("express");
const request = require("request");
const roleController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated, modifiedUrl, activeHandover } = require("../../util");
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
    res.render(path.join(__dirname + "/../views/roles"), {
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

const lookupRolesHandler = (req, res) => {
  sendRequest(req, res, rolesAPI, "GET", {}, (jsonData) => {
    res.send({
      statusCode: jsonData.statusCode,
      data: jsonData.data,
      message: jsonData.message,
    });
  });
};

roleController.post("/LookupRoles", isAuthenticated, lookupRolesHandler);
roleController.get("/LookupRoles", isAuthenticated, lookupRolesHandler);

const normalizeEditRoleResponse = (jsonData = {}) => {
  const roleRaw = jsonData?.role;
  const role = Array.isArray(roleRaw) ? roleRaw[0] : roleRaw;
  const permissions = Array.isArray(jsonData?.permissions) ? jsonData.permissions : [];
  const rolePermissions = Array.isArray(jsonData?.role_permissions) ? jsonData.role_permissions : [];
  const assignedPermissions = rolePermissions
    .map((item) => Number(item?.permission_id))
    .filter((id) => Number.isFinite(id));

  return {
    statusCode: Number(jsonData?.statusCode || 0),
    message: jsonData?.message || "Imeshindikana kupata taarifa za role.",
    role,
    permissions,
    assignedPermissions,
  };
};

// Store Role
roleController.post("/tengenezaRole",  isAuthenticated, can('create-roles'), activeHandover, function (req, res) {
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
            res.render(path.join(__dirname + "/../views/create_role"), {
              req: req,
              data: data,
            });
      }
    );
});

// Read-only role template for create-role inheritance
roleController.get("/RoleTemplate/:id", isAuthenticated, can("create-roles"), function (req, res) {
  const role_id = Number(req.params.id);
  if (!Number.isInteger(role_id) || role_id <= 0) {
    return res.send({
      statusCode: 306,
      message: "Role haijapatikana.",
      data: {
        role: null,
        assigned_permissions: [],
      },
    });
  }

  sendRequest(req, res, `${editRoleAPI}/${role_id}`, "GET", {}, function (jsonData) {
    const normalized = normalizeEditRoleResponse(jsonData);
    if (normalized.statusCode !== 300 || !normalized.role || !normalized.role.id) {
      return res.send({
        statusCode: 306,
        message: normalized.message || "Role haijapatikana.",
        data: {
          role: null,
          assigned_permissions: [],
        },
      });
    }

    return res.send({
      statusCode: 300,
      message: "Success",
      data: {
        role: normalized.role,
        assigned_permissions: normalized.assignedPermissions,
      },
    });
  });
});
// Edit Role
roleController.get("/EditRole/:id", isAuthenticated, can('update-roles'), function (req, res) {
    const role_id = Number(req.params.id);
    if (!Number.isInteger(role_id) || role_id <= 0) {
      req.flash("error", "Role haijapatikana.");
      return res.redirect("/Roles");
    }

    sendRequest(req, res , editRoleAPI + `/${role_id}`, "GET", {}, function (jsonData) {
      const normalized = normalizeEditRoleResponse(jsonData);
      if (normalized.statusCode !== 300 || !normalized.role || !normalized.role.id) {
        req.flash("error", normalized.message || "Role haijapatikana.");
        return res.redirect("/Roles");
      }

      return res.render(path.join(__dirname + "/../views/edit_role"), {
        req: req,
        permissions: normalized.permissions,
        assigned_permissions: normalized.assignedPermissions,
        role: normalized.role,
      });
    });
});

// Friendly alias: /Roles/3 -> /EditRole/3
roleController.get("/Roles/:id", isAuthenticated, can('update-roles'), function (req, res) {
  const role_id = Number(req.params.id);
  if (!Number.isInteger(role_id) || role_id <= 0) {
    req.flash("error", "Role haijapatikana.");
    return res.redirect("/Roles");
  }
  return res.redirect(`/EditRole/${role_id}`);
});

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
         res.render(path.join(__dirname + "/../views/roles"), {
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
