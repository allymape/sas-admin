require("dotenv").config();
const express = require("express");
const request = require("request");
const workflowController = express.Router();
var session = require("express-session");
var path = require("path");
const url = require('url');
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allWorkflowAPI = API_BASE_URL + "all-workflows";
var tengezaWorkflowAPI = API_BASE_URL + "createworkflow";
var editWorkflowAPI   = API_BASE_URL + "editworkflow";
var updateWorkflowAPI = API_BASE_URL + "updateworkflow";
var deleteWorkflowAPI = API_BASE_URL + "deleteworkflow";
const workflowLookupAPI = API_BASE_URL + "workflow-lookup";


// Display workflow page
workflowController.get("/Workflow", isAuthenticated, can('view-workflow') , function (req, res) {
        return getWorkflow(req , res);
});

function getWorkflow(req, res , eWorkflow = null){
  sendRequest(req, res, workflowLookupAPI, "GET", {}, (jsonData) => {
    const { categories, hierarchies } = jsonData;
    res.render(path.join(__dirname + "/../design/workflow"), {
      req: req,
      categories: categories,
      hierarchies: hierarchies,
      eWorkflow : eWorkflow
    });
  });
}

// Get all workflow
workflowController.get("/All-workflows",  isAuthenticated, can('view-workflow'),function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var application_category_id = req.query.application_category_id;

    var formData = {
         is_paginated: req.query.is_paginated,
         application_category_id
    };
    
    sendRequest(req, res, allWorkflowAPI+ "?page=" + page + "&per_page=" + per_page, "GET", formData, (jsonData) => {
            // console.log(jsonData);
            var numRows = jsonData.numRows;
            res.send({
              statusCode: jsonData.statusCode,
              data: jsonData.data,
              message: jsonData.message,
              pagination: {
                total: numRows,
                current: page,
                per_page: per_page,
                pages: Math.ceil(numRows / per_page),
              },
            });
    });
//   getAllworkflow(req, res);
});


// Store workflow
workflowController.post(
  "/Tengenezaworkflow",
  isAuthenticated,
  can("create-workflow"),
  function (req, res) {
    const { from, to , order } = req.body;
    if (Number(from) !== Number(to)) {
      sendRequest(
        req,
        res,
        tengezaWorkflowAPI,
        "POST",
        req.body,
        (jsonData) => {
          const { message, success } = jsonData;
          if(success){
            req.flash("successMessage", message);
          }else{
            req.flash("to", to);
            req.flash("from", from);
            req.flash("order", order);
            req.flash('errorMessage' , message);
          }
          res.redirect(
            url.format({
              pathname: "/Workflow",
              query: {
                application_category_id: req.body.application_category_id,
              },
            })
          );
        }
      );
    } else {
      req.flash(
        "errorMessage",
        "Tafadhali sehemu ya kutoka na kwenda hazipaswi kufanana."
      );
      req.flash('to' , to)
      req.flash('from' , from)
      req.flash('order' , order)
      res.redirect(
        url.format({
          pathname: "/Workflow",
          query: {
            application_category_id: req.body.application_category_id,
          },
        })
      );
    }
  }
);

// Edit workflow
workflowController.get("/workflow/:id",  isAuthenticated, can('update-workflow'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editWorkflowAPI + "/" + id, "GET", {}, (jsonData) => {
      // getAllworkflow(req, res, true, jsonData.data);
      const eWorkflow = jsonData.data;
      return getWorkflow(req , res , eWorkflow);
  });
});

// Update workflow
workflowController.post("/Badiliworkflow/:id",  isAuthenticated, can('update-workflow'), function (req, res) {
  const id = Number(req.params.id);
   const { from, to, order } = req.body;
   if (Number(from) !== Number(to)) {
    sendRequest(req, res, updateWorkflowAPI + "/" + id, "PUT", req.body , (jsonData) => {
       const { message, success } = jsonData;
       if (success) {
         req.flash("successMessage", message);
       } else {
         req.flash("to", to);
         req.flash("from", from);
         req.flash("order", order);
         req.flash("errorMessage", message);
       }
       res.redirect(
         url.format({
           pathname: "/Workflow/"+id,
           query: {
             application_category_id: req.body.application_category_id,
           },
         })
       );
     });
   } else {
     req.flash(
       "errorMessage",
       "Tafadhali sehemu ya kutoka na kwenda hazipaswi kufanana."
     );
     req.flash("to", to);
     req.flash("from", from);
     req.flash("order", order);
     res.redirect(
       url.format({
         pathname: "/Workflow/"+id,
         query: {
           application_category_id: req.body.application_category_id,
         },
       })
     );
   }
  // sendRequest(req, res, updateWorkflowAPI + "/" + id, "PUT", req.body , (jsonData) => {
  //       var statusCode = jsonData.statusCode;
  //       var message = jsonData.message;
  //       res.send({
  //             statusCode : statusCode,
  //             message : message
  //       });
  // });
});

// Delete workflow
workflowController.post("/Futaworkflow/:id",  isAuthenticated, can('delete-workflow'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteWorkflowAPI + "/" + id, "PUT", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
         res.send({
           statusCode: statusCode,
           message: message,
         });
  });
});

function getAllworkflow(req, res, edit = false, editedData = null) {
  var obj = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allWorkflowAPI + "?page=" + page + "&per_page=" + per_page;
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
         res.render(path.join(__dirname + "/../design/workflow"), {
           req: req,
           data: data,
           useLev: req.session.UserLevel,
           userName: req.session.userName,
           workflowManage: req.session.workflowManage,
           userID: req.session.userID,
           cheoName: req.session.cheoName,
           edit: edit,
           eworkflow: editedData,
           pagination: {
             total: Number(numRows),
             current: Number(page),
             per_page: Number(per_page),
             url: "workflow",
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
module.exports = workflowController;
