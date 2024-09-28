require("dotenv").config();
const express = require("express");
const request = require("request");
const dashboardController = express.Router();
// var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated, greating, activeHandover } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var dashboardAPI = API_BASE_URL + "dashboard";
var schoolByCategoriesAPI = API_BASE_URL+ "schools-summary-by-regions-and-categories"
var schoolSummariesAPI = API_BASE_URL + "school-summaries";
var numberOfSchoolByYearsAPI = API_BASE_URL + "number-of-schools-by-year-of-regitration";

// Comprehensive dashboard
dashboardController.get("/Dashboard" , 
    isAuthenticated , 
    can('view-dashboard') ,
    activeHandover,
    (req, res) => {
    
    sendRequest(req, res, schoolSummariesAPI , "GET" , {} , (jsonData) => {
          const {registrations , owners , categories , applications , structures} = jsonData.data;
          res.render(path.join(__dirname + "/../design/dashboard"), {
            req,
            greating : greating(req.session.userName),
            schoolSummaryByRegistrations: registrations,
            schoolsSummaryByCategories: categories,
            schoolsSummaryByOwners : owners,
            schoolSummaryByApplications : applications,
            schoolSummaryByStructures :  structures,
          });
    });
      
});

// Registered Schools by Regions by ownership
dashboardController.get(
  "/SchoolsSummaryByRegionAndCategories",
  isAuthenticated,
  can("view-dashboard"),
  activeHandover,
  function (req, res) {
    sendRequest(req, res, schoolByCategoriesAPI, "GET", {}, (jsonData) => {
      let statusCode = jsonData.statusCode;
      let { data, minValue, maxValue } = jsonData.data;
      res.send({
        statusCode: statusCode,
        data: data,
        maxValue: maxValue,
        minValue: minValue,
      });
    });
  }
);
// Registered Schools by Year of Registration + Trend
dashboardController.get(
  "/NumberOfSchoolByYearOfRegistration",
  isAuthenticated,
  can("view-dashboard"),
  activeHandover,
  (req, res) => {
    sendRequest(req, res, numberOfSchoolByYearsAPI, "GET", {}, (jsonData) => {
      const { data, statusCode, message } = jsonData;
      const { cumulativeData, individualData } = data;
      res.send({
        statusCode: statusCode,
        data: {
          cumulativeData,
          individualData,
        },
        message: message,
      });
    });
  }
);

module.exports = dashboardController;
