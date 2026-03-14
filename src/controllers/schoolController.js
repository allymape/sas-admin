require("dotenv").config();
const express = require("express");
const request = require("request");
const schoolController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can, activeHandover, hasPermission, validateGeoLocation } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allSchoolListAPI = API_BASE_URL + "all-schools";
var schoolListAPI = API_BASE_URL + "look_for_schools";
var editSchoolAPI = API_BASE_URL + "edit-school";
var addSchoolAPI = API_BASE_URL + "add-school";
var updateSchoolAPI = API_BASE_URL + "update-school";
var vutaExistingSchoolsAPI = API_BASE_URL + "existing_schools";
var schoolFiltersAPI = API_BASE_URL + "school-filters";
var changeShuleAPI = API_BASE_URL + "change-shule";
var deleteShuleAPI = API_BASE_URL + "delete-shule";
var deregisterShuleAPI = API_BASE_URL + "deregister-shule";

// Page
schoolController.get('/Shule' , isAuthenticated , can('view-schools'), activeHandover , (req , res) => {
    sendRequest(req , res , schoolFiltersAPI , "GET" , {}, (jsonData) => {
        var {ownerships , categories} = jsonData.data;
        res.render(path.join(__dirname + "/../views/schools"), {
          req,
          categories: categories,
          ownerships: ownerships,
        });
    } );
    
});

// List of Schools
schoolController.post(
  "/SchoolList",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    let draw = req.body.draw;
    let start = req.body.start;
    let length = req.body.length;
    var per_page = Number(length || 10);
    var page = Number(start / length) + 1;
    sendRequest(req,res,allSchoolListAPI + "?page=" + page + "&per_page=" + per_page,"GET",req.body,
      (jsonData) => {
        let totalRecords = jsonData.numRows;
        const dataToSend = jsonData.data.map((item) => ({
          ...item,
          canEdit: hasPermission(req, "update-schools"),
          canDelete: hasPermission(req, "delete-school"),
          canDeregister: hasPermission(req, "deregister-school"),
          canEditSchoolDetails: hasPermission(req, "edit-school-details"),
        }));
        // console.log(dataToSend)
        res.send({
          draw: draw,
          recordsTotal: totalRecords,
          recordsFiltered: totalRecords,
          data: dataToSend,
        });
      }
    );
  }
);


schoolController.get("/LookForSchools", isAuthenticated, function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var search = req.query.q;
  sendRequest(
    req,
    res,
    schoolListAPI + "?page=" + page + "&per_page=" + per_page,
    "GET",
    {search : search},
    (jsonData) => {
      var data = jsonData.data;
      // console.log(data);
      res.send({
        statusCode: data.statusCode,
        message: data.message,
        data: data,
      });
    }
  );
});

schoolController.post("/VutaShule", isAuthenticated, function (req, res) {
  sendRequest(req, res , vutaExistingSchoolsAPI, "POST", {}, (body) => {
        if(body !== 'undefined'){
            var jsonData = body;
            var message = jsonData.message;
            var statusCode = jsonData.statusCode;
            res.send({
              statusCode: statusCode,
              message: message,
            });
        }
      });
});
// Create School
schoolController.post("/AddShule" , isAuthenticated, function(req , res){
       sendRequest(req, res, addSchoolAPI  , 'POST', req.body , (body) => {
               const {statusCode , message} = body;
               res.send({
                  statusCode : statusCode,
                  message : message,
                  action : 'create'
               });
     });
});
// Edit School
schoolController.get("/EditShule/:id" , isAuthenticated, function(req, res){
     const tracking_number = req.params.id;
     sendRequest(req, res, editSchoolAPI + `/${tracking_number}` , 'GET', {} , (body) => {
           if(body !== 'undefined'){
               const {data , statusCode , message} = body;
               res.send({
                  statusCode : statusCode,
                  data : data,
                  message : message
               });
           }
     });
});
// Update School
schoolController.post("/UpdateShule/:id" , isAuthenticated , validateGeoLocation, function(req , res){
      const id = req.params.id;
       sendRequest(req, res, updateSchoolAPI + `/${id}` , 'PUT', req.body , (body) => {
           if(body !== 'undefined'){
               const {statusCode , message} = body;
               res.send({
                 statusCode: statusCode,
                 message: message,
                 action: "update",
               });
           }
     });
});

schoolController.post("/changeshule", isAuthenticated, can('update-school-name'), function (req, res) {
  const trackingId = req.body.trackingId;
  const from_user = req.session.userID;
  const newName = req.body.newName;
  const application_category = req.body.application_category;
    sendRequest(
      req,
      res,
      changeShuleAPI,
      "POST",
      {
        trackingId: trackingId,
        from_user: from_user,
        newName: newName,
        application_category: application_category,
      },
      (jsonData) => {
        const { message, statusCode, success } = jsonData;
        res.send({
          message,
          statusCode,
          success,
        });
      }
    );
});

schoolController.post(
  "/DeleteSchool/:tracking_number",
  isAuthenticated,
  can("delete-school"),
  function (req, res) {
    const tracking_number = req.params.tracking_number;
    sendRequest(
      req,
      res,
      deleteShuleAPI+'/'+tracking_number,
      "POST",
      req.body,
      (jsonData) => {
        const { message, statusCode, success } = jsonData;
        res.send({
          message,
          statusCode,
          success,
        });
      }
    );
  }
);

schoolController.post(
  "/DeregisterSchool/:tracking_number",
  isAuthenticated,
  can("deregister-school"),
  function (req, res) {
    const tracking_number = req.params.tracking_number;
    sendRequest(
      req,
      res,
      deregisterShuleAPI + "/" + tracking_number,
      "POST",
      req.body,
      (jsonData) => {
        const { message, statusCode, success } = jsonData;
        res.send({
          message,
          statusCode,
          success,
        });
      }
    );
  }
);

module.exports = schoolController;
