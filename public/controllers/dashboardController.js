require("dotenv").config();
const express = require("express");
const request = require("request");
const dashboardController = express.Router();
// var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated, greating } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var dashboardAPI = API_BASE_URL + "dashboard";
var schoolByCategoriesAPI = API_BASE_URL+ "schools-summary-by-regions-and-categories"
var schoolSummariesAPI = API_BASE_URL + "school-summaries";
var numberOfSchoolByYearsAPI = API_BASE_URL + "number-of-schools-by-year-of-regitration";

dashboardController.get(
  "/Dashboard2",
  isAuthenticated,
  can("view-dashboard"),
  function (req, res) {
    const date = new Date().getHours();
    var majira;
    if (date < 12) {
      majira = "Habari za Asubuhi";
    } else if (date < 18) {
      majira = "Habari za Mchana";
    } else if (date > 18) {
      majira = "Habari za Jioni";
    }
    sendRequest(req, res, dashboardAPI, "GET", {}, (body) => {
      if (body !== undefined) {
        var jsonData = body;
        var statusCode = jsonData.statusCode;
        var data = jsonData.data;
        var count = jsonData.count;
        var kauntibilamajengo = jsonData.kauntibilamajengo;
        var kauntimajengo = jsonData.kauntimajengo;
        var tahasusiCount = jsonData.tahasusiCount;
        var kauntimmiliki = jsonData.kauntimmiliki;
        var kauntibadilijina = jsonData.kauntibadilijina;
        var kauntibweni = jsonData.kauntibweni;
        var totalApplications = jsonData.totalApplications;
        var successApplications = jsonData.successApplications;
        var kauntidahalia = jsonData.kauntidahalia;
        var kauntiainausajili = jsonData.kauntiainausajili;
        var sajiliwa = jsonData.sajiliwa;
        var mikoa = jsonData.mikoa;
        var ngazi = jsonData.ngazi;
        var zisizosajiliwa = totalApplications - successApplications;
        var wastani = (successApplications / totalApplications) * 100;
        if (statusCode == 300) {
          res.render(
            path.join(__dirname + "/../design/dashboard/dashboard"),
            {
              req: req,
              salamu: majira,
              name: data,
              count: count,
              kauntibilamajengo: kauntibilamajengo,
              kauntimajengo: kauntimajengo,
              kauntibadilijina: kauntibadilijina,
              kauntibweni: kauntibweni,
              tahasusiCount: tahasusiCount,
              successApplications: successApplications,
              zisizosajiliwa: zisizosajiliwa,
              wastani: wastani.toFixed(2),
              kauntimmiliki: kauntimmiliki,
              kauntidahalia: kauntidahalia,
              totalApplications: totalApplications,
              kauntiainausajili: kauntiainausajili,
              sajiliwa: sajiliwa,
              mikoa: mikoa,
              ngazi: ngazi,
            }
          );
        }
      }
    });
  }
);

// Comprehensive dashboard
dashboardController.get("/Dashboard" , isAuthenticated , can('view-dashboard') , (req, res) => {
    sendRequest(req, res, schoolSummariesAPI , "GET" , {} , (jsonData) => {
          const {registrations , owners , categories , applications , structures} = jsonData.data;
          // console.log(jsonData);
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
dashboardController.get("/SchoolsSummaryByRegionAndCategories" , isAuthenticated , can("view-dashboard") , function(req , res){
    sendRequest(req, res, schoolByCategoriesAPI, "GET", {}, (jsonData) => {
      let statusCode = jsonData.statusCode
      let {data ,minValue, maxValue} = jsonData.data
      res.send({
        statusCode: statusCode,
        data: data,
        maxValue : maxValue,
        minValue : minValue
      });
    });
})
// Registered Schools by Year of Registration + Trend
dashboardController.get("/NumberOfSchoolByYearOfRegistration" , isAuthenticated , can('view-dashboard') , (req, res) => {
    sendRequest(req, res, numberOfSchoolByYearsAPI , 'GET' , {} , (jsonData) => {
         const {data , statusCode , message} = jsonData
         const {cumulativeData , individualData} = data
         res.send({
           statusCode : statusCode,
           data : {
                 cumulativeData,
                 individualData
           },
           message : message
         })
    });
})

module.exports = dashboardController;
// dashboardController.get(
//   "/Dashboardxxx",
//   isAuthenticated,
//   can("view-dashboard"),
//   function (req, res) {
//     // if(req.session.userName){

//     if (
//       typeof req.session.userName !== "undefined" ||
//       req.session.userName === true
//     ) {
//       const date = new Date().getHours();
//       var majira;
//       if (date < 12) {
//         majira = "Habari za Asubuhi";
//       } else if (date < 18) {
//         majira = "Habari za Mchana";
//       } else if (date > 18) {
//         majira = "Habari za Jioni";
//       }
//       //  console.log(req.session.Token)
//       request(
//         {
//           url: activeUserAPI,
//           method: "GET",
//           headers: {
//             Authorization: "Bearer" + " " + req.session.Token,
//             "Content-Type": "application/json",
//           },
//         },
//         function (error, response, body) {
//           if (error) {
//             res.send("failed");
//           }
//           if (body !== undefined) {
//             var jsonData = JSON.parse(body);
//             var message = jsonData.message;
//             var statusCode = jsonData.statusCode;
//             var data = jsonData.data;
//             var count = jsonData.count;
//             var kauntibilamajengo = jsonData.kauntibilamajengo;
//             var kauntimajengo = jsonData.kauntimajengo;
//             var tahasusiCount = jsonData.tahasusiCount;
//             var kauntimmiliki = jsonData.kauntimmiliki;
//             var kauntibadilijina = jsonData.kauntibadilijina;
//             var kauntibweni = jsonData.kauntibweni;
//             var totalApplications = jsonData.totalApplications;
//             var successApplications = jsonData.successApplications;
//             var kauntidahalia = jsonData.kauntidahalia;
//             var kauntiainausajili = jsonData.kauntiainausajili;
//             var sajiliwa = jsonData.sajiliwa;
//             var mikoa = jsonData.mikoa;
//             var ngazi = jsonData.ngazi;
//             var zisizosajiliwa = totalApplications - successApplications;
//             var wastani = (successApplications / totalApplications) * 100;
//             if (statusCode == 300) {
//               res.render(
//                 path.join(__dirname + "/public/design/dashboard/dashboard"),
//                 {
//                   req: req,
//                   salamu: majira,
//                   name: data,
//                   count: count,
//                   useLev: req.session.UserLevel,
//                   userName: req.session.userName,
//                   RoleManage: req.session.RoleManage,
//                   userID: req.session.userID,
//                   cheoName: req.session.cheoName,
//                   kauntibilamajengo: kauntibilamajengo,
//                   kauntimajengo: kauntimajengo,
//                   kauntibadilijina: kauntibadilijina,
//                   kauntibweni: kauntibweni,
//                   tahasusiCount: tahasusiCount,
//                   successApplications: successApplications,
//                   zisizosajiliwa: zisizosajiliwa,
//                   wastani: wastani.toFixed(2),
//                   kauntimmiliki: kauntimmiliki,
//                   kauntidahalia: kauntidahalia,
//                   totalApplications: totalApplications,
//                   kauntiainausajili: kauntiainausajili,
//                   sajiliwa: sajiliwa,
//                   mikoa: mikoa,
//                   ngazi: ngazi,
//                 }
//               );
//             }
//             if (statusCode == 209) {
//               res.redirect("/");
//             }
//           }
//         }
//       );
//     } else {
//       res.redirect("/");
//     }
//   }
// );
