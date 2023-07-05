require("dotenv").config();
const express = require("express");
const request = require("request");
const attachmentTypeController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allAttachmentTypesAPI   = API_BASE_URL + "all-attachment-types";
var tengenezaAttachmentTypeAPI = API_BASE_URL + "add-attachment-type";
var editAttachmentTypeAPI   = API_BASE_URL + "edit-attachment-type";
var updateAttachmentTypeAPI = API_BASE_URL + "update-attachment-type";
var deleteAttachmentTypeAPI = API_BASE_URL + "delete-attachment-type";


// Get all attachmentTypes
attachmentTypeController.get("/AttachmentTypes", function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var url = allAttachmentTypesAPI + "?page=" + page + "&per_page=" + per_page;
   var formData = {
     is_paginated: req.query.is_paginated,
   };
  sendRequest(req, res, url, "GET", formData, (jsonData) => {
            var statusCode = jsonData.statusCode;
            var data = jsonData.data;
            var numRows = jsonData.numRows;
            // console.log(data , numRows);
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

// Store AttachmentType
attachmentTypeController.post("/tengenezaAttachmentType", function (req, res) {
  console.log('controller' , req.body)
    sendRequest(req, res, tengenezaAttachmentTypeAPI, "POST", req.body, (jsonData) => {
       res.send({
         statusCode: jsonData.statusCode,
         message: jsonData.message,
       });
    });
});

// Edit AttachmentType
attachmentTypeController.get("/AttachmentTypes/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, editAttachmentTypeAPI + "/" + id, "GET", {}, (jsonData) => {
    //   getAllAttachmentTypes(req, res, true, jsonData.data);
  });
});

// Update AttachmentType
attachmentTypeController.post("/badiliAttachmentType/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, updateAttachmentTypeAPI + "/" + id, "PUT", req.body , (jsonData) => {
        res.send({
          statusCode: jsonData.statusCode,
          message: jsonData.message,
        });
  });
});

// Delete AttachmentType
attachmentTypeController.post("/futaAttachmentType/:id", function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deleteAttachmentTypeAPI + "/" + id, "DELETE", {}, (jsonData) => {
        res.send({
          statusCode: jsonData.statusCode,
          message: jsonData.message,
        });
  });
});


module.exports = attachmentTypeController;
