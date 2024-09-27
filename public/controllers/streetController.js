require("dotenv").config();
const express = require("express");
const request = require("request");
const streetController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var streetListAPI = API_BASE_URL + "allstreets";
var streetAPI = API_BASE_URL + "lookup-streets";
var vutaMitaaListAPI = API_BASE_URL + "usajiliMitaa";

streetController.get(
  "/Mitaa",
  isAuthenticated,
  can("view-streets"),
  function (req, res) {
    res.render(path.join(__dirname + "/../design/streets"), {
      req: req,
    });
  }
);
streetController.post("/MitaaList", isAuthenticated, can('view-streets'), function (req, res) {
  let draw = req.body.draw;
  let start = req.body.start;
  let length = req.body.length;
  var per_page = Number(length || 10);
  var page = Number(start / length) + 1;
  sendRequest(
    req,
    res,
    streetListAPI + "?page=" + page + "&per_page=" + per_page,
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
// streetController.get("/MitaaList", isAuthenticated, can('view-streets'), function (req, res) {
//   var per_page = Number(req.query.per_page || 10);
//   var page = Number(req.query.page || 1);
//   sendRequest(
//     req,
//     res,
//     streetListAPI + "?page=" + page + "&per_page=" + per_page,
//     "GET",
//     req.query,
//     (jsonData) => {
//       const {data , numRows , statusCode} = jsonData;
//       res.send({
//         statusCode : statusCode,
//         streets: data,
//         pagination: {
//           total: numRows,
//           current: page,
//           per_page: per_page,
//           pages: Math.ceil(numRows / per_page),
//         },
//       });
//     }
//   );
// });

streetController.get("/LookupMitaa", isAuthenticated, function (req, res) {
  sendRequest(req, res, streetAPI, "GET", req.query, (jsonData) => {
    var { data, statusCode } = jsonData;
    res.send({
      streets: data,
      statusCode: statusCode,
    });
  });
});

streetController.post("/VutaMitaa",  isAuthenticated, can('create-streets'), function (req, res) {
  sendRequest(req, res, vutaMitaaListAPI, "POST", {}, (jsonData) => {
    res.send({
      statusCode: jsonData.statusCode,
      message: jsonData.message,
    });
  });
});

module.exports = streetController;
