require("dotenv").config();
const express = require("express");
const request = require("request");
const designationController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allDesignationsAPI = API_BASE_URL + "all_designations";
var lookupDesignationsAPI = API_BASE_URL + "lookup_designations";
var designationsAPI = API_BASE_URL + "designations_by_section";
var tengenezaDesignationAPI = API_BASE_URL + "add_designation";
var editDesignationAPI   = API_BASE_URL + "edit_designation";
var updateDesignationAPI = API_BASE_URL + "update_designation";
var deleteDesignationAPI = API_BASE_URL + "delete_designation";


designationController.get("/Vyeo", isAuthenticated, can('view-designations'), function (req, res) {
  sendRequest(
    req,
    res,
    lookupDesignationsAPI,
    "GET",
    {},
    (jsonData) => {
        const { designations, levels } = jsonData;
          res.render(path.join(__dirname + "/../design/vyeolist"), {
            req,
            designations,
            levels,
          });
      }
  );
});


designationController.post(
  "/VyeoList",
  isAuthenticated,
  can("view-designations"),
  function (req, res) {
    let draw = req.body.draw;
    let start = req.body.start;
    let length = req.body.length;
    var per_page = Number(length || 10);
    var page = Number(start / length) + 1;
    sendRequest(
      req,
      res,
      allDesignationsAPI + "?page=" + page + "&per_page=" + per_page,
      "GET",
      req.body,
      (jsonData) => {
        let dataToSend = jsonData.data;
        let totalRecords = jsonData.numRows;
        res.send({
          draw: draw,
          recordsTotal: totalRecords,
          recordsFiltered: totalRecords,
          data: dataToSend,
        });
      }
    );
  });


// Get all designations (Vyeo)
designationController.get("/LookupDesignations",  isAuthenticated, function (req, res) {
  var formData = {
      hierarchy_id: req.query.hierarchy_id,
    };
    sendRequest(req, res, designationsAPI, "GET", formData, (jsonData) => {
            res.send({
                statusCode: jsonData.statusCode,
                data: jsonData.designations,
                message: jsonData.message,
            });
    });
//   getAllDesignations(req, res);
});

// Store Designation
designationController.post("/tengenezaDesignation",  isAuthenticated, can('create-designations'),function (req, res) {
    
    sendRequest(req, res, tengenezaDesignationAPI, "POST", req.body, (body) => {
        var statusCode = body.statusCode;
        var message = body.message;
           res.send({
             statusCode: statusCode,
             message: message,
           });
    });
});

// Edit Designation
designationController.get("/Designation/:id",  isAuthenticated, can('update-designations'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editDesignationAPI + "/" + id, "GET", {}, (jsonData) => {
      getAllDesignations(req, res, true, jsonData.data);
  });
});

// Update Designation
designationController.post("/badiliDesignation/:id",  isAuthenticated, can('update-designations'),function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, updateDesignationAPI + "/" + id, "PUT", req.body , (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        res.send({
          statusCode : statusCode,
          message : message
        });
  });
});

// Delete Designation
designationController.post("/futaDesignation/:id",  isAuthenticated, can('delete-designations'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteDesignationAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
          res.send({
            statusCode: statusCode,
            message: message,
          });
  });
});

function getAllDesignations(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allDesignationsAPI + "?page=" + page + "&per_page=" + per_page;
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
         res.render(path.join(__dirname + "/../design/designations"), {
           req: req,
           data: data,
          //  useLev: req.session.UserLevel,
          //  userName: req.session.userName,
          //  DesignationManage: req.session.DesignationManage,
          //  userID: req.session.userID,
          //  cheoName: req.session.cheoName,
          //  edit: edit,
          //  eDesignation: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "Designations",
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
module.exports = designationController;
