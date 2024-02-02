require("dotenv").config();
const express = require("express");
const request = require("request");
const schoolController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allSchoolListAPI = API_BASE_URL + "all-schools";
var schoolListAPI = API_BASE_URL + "look_for_schools";
var editSchoolAPI = API_BASE_URL + "edit-school";
var addSchoolAPI = API_BASE_URL + "add-school";
var updateSchoolAPI = API_BASE_URL + "update-school";
var vutaExistingSchoolsAPI = API_BASE_URL + "existing_schools";
var schoolFiltersAPI = API_BASE_URL + "school-filters";
var changeShuleAPI = API_BASE_URL + "change-shule";

// Page
schoolController.get('/Shule' , isAuthenticated , can('view-schools') , (req , res) => {
    sendRequest(req , res , schoolFiltersAPI , "GET" , {}, (jsonData) => {
        var {ownerships , categories} = jsonData.data;
        res.render(path.join(__dirname + "/../design/schools"), {
            req,
            categories : categories,
            ownerships : ownerships
        });
    } );
    
});

// List of Schools
schoolController.get(
  "/SchoolList",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    sendRequest(
      req,
      res,
      allSchoolListAPI + "?page=" + page + "&per_page=" + per_page,
      "GET",
      req.query,
      (jsonData) => {
        var data = jsonData.data;
        var numRows = jsonData.numRows;
        res.send({
          schools: data,
          pagination: {
            total: numRows,
            current: page,
            per_page: per_page,
            pages: Math.ceil(numRows / per_page),
          },
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
schoolController.post("/UpdateShule/:id" , isAuthenticated , function(req , res){
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

schoolController.post("/changeshule", isAuthenticated, function (req, res) {
  const trackingId = req.body.trackingId;
  const from_user = req.session.userID;
  const newName = req.body.newName;
    sendRequest(req , res , changeShuleAPI, "POST",{  trackingId: trackingId, from_user: from_user, newName: newName},
      (jsonData) => {
          const {message , statusCode , success} = jsonData
          res.send({
            message,
            statusCode,
            success
          });
        }
    );
 
});


module.exports = schoolController;
