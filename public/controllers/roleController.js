require("dotenv").config();
const express = require("express");
const request = require("request");
const roleController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allRolesAPI = API_BASE_URL + "allRoles";
var rolesApi = API_BASE_URL + "roles";
var tengenezaRoleAPI = API_BASE_URL + "addRole";
var editRoleAPI   = API_BASE_URL + "editRole";
var updateRoleAPI = API_BASE_URL + "updateRole";
var deleteRoleAPI = API_BASE_URL + "deleteRole";
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
                    url : '/Roles',
                    pages : Math.ceil( numRows / per_page)
                }
            });
  })

})

// app.get("/Roles", isAuthenticated ,can('view-roles'), function (req, res) {
//   var per_page = Number(req.query.per_page || 10);
//   var page = Number(req.query.page || 1);
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     var hasMatch =false;
//     // for (var index = 0; index < req.session.RoleManage.length; ++index) {
//         // var animal = req.session.RoleManage[index]; 
//     // if(animal.permission_id == 64){ 
//     request(
//       {
//         url: rolesAPI+`?page=${page}&per_page=${per_page}`,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           useLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var numRows = jsonData.numRows;
//             res.render(path.join(__dirname + "/public/design/roles"), {
//               req: req,
//               data: data,
//               useLev: req.session.UserLevel,
//                                 userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//               userID: req.session.userID,
//               cheoName: req.session.cheoName,
//               pagination : {
//                     total : numRows , 
//                     current : page , 
//                     per_page : per_page , 
//                     url : 'Roles',
//                     pages : Math.ceil( numRows / per_page)
//                 }
//             });
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//     // }
//   // }
//   } else {
//     res.redirect("/");
//   }
// });
// Get all roles
roleController.get("/allRoles",  isAuthenticated, can('view-roles'), function (req, res) {
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

roleController.post("/LookupRoles", isAuthenticated, (req, res) => {
  sendRequest(req, res, rolesApi, "GET", {}, (jsonData) => {
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
roleController.get("/Roles/:id",  isAuthenticated, can('update-roles'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editRoleAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllRoles(req, res, true, jsonData.data);
  });
});

// Update Role
roleController.post("/badiliRole/:id",  isAuthenticated, can('update-roles'), function (req, res) {
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
