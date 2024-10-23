require("dotenv").config();
const express = require("express");
const request = require("request");
const dashboardController = express.Router();
// var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated, greating, activeHandover } = require("../../util");
const { dash } = require("pdfkit");
const { send } = require("process");
var API_BASE_URL = process.env.API_BASE_URL;
var mapDataAPI = API_BASE_URL + "map-data";
var dashboardFilterAPI = API_BASE_URL + "dashboard-filters";
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
//Map View
dashboardController.get("/Map", isAuthenticated, can("view-dashboard"), activeHandover, (req, res) => {
 
  sendRequest(req, res, dashboardFilterAPI, "GET", {}, (jsonData) => {
        const { categories, ownerships, regions } = jsonData.data;
        res.render(path.join(__dirname + "/../design/map"), {
          req : req,
          categories,
          ownerships,
          regions
        });
  })
});
//Map data
dashboardController.post("/MapData", isAuthenticated, can("view-dashboard"), activeHandover, (req, res) => { 
  sendRequest(req, res, mapDataAPI, "GET", req.body , (jsonData) => {
    const { data, statusCode, message } = jsonData;
    res.send({
      statusCode: statusCode,
      data: data,
      message: message,
    })
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
