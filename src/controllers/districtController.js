require("dotenv").config();
const express = require("express");
const districtController = express.Router();
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var lgaListAPI = API_BASE_URL + "allDistricts";
var lgaAPI = API_BASE_URL + "lookup-districts";
var VutaWilayaListAPI = API_BASE_URL + "usajiliWilaya";
var updateWilayaAPI = API_BASE_URL + "update-district";


districtController.get(
  "/Halmashauri",
  isAuthenticated,
  can("view-districts"),
  function (req, res) {
    res.render(path.join(__dirname + "/../views/halmashauri"), {
      req: req,
    });
  }
);

districtController.post("/HalmashauriList",isAuthenticated,can("view-districts"), function (req, res) {
    let draw = req.body.draw;
    let start = req.body.start;
    let length = req.body.length;
    var per_page = Number(length || 10);
    var page = Number(start/length) + 1;
    sendRequest(
      req,
      res,
      lgaListAPI + "?page=" + page + "&per_page=" + per_page,
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
  }
);

districtController.get("/LookupHalmashauri",isAuthenticated, function (req, res) {
    sendRequest(
      req,
      res,
      lgaAPI,
      "GET",
      req.query,
      (jsonData) => {
        var data = jsonData.data;
        res.send({
          councils: data,
          statusCode: jsonData.statusCode,
        });
      }
    );
  }
);

districtController.post(
  "/VutaWilaya",
  isAuthenticated,
  can("create-districts"),
  function (req, res) {
    sendRequest(req, res, VutaWilayaListAPI, "POST", {}, (jsonData) => {
      res.send({
        statusCode: jsonData.statusCode,
        message: jsonData.message,
      });
    });
  }
);
districtController.post(
  "/UpdateDistrict/:id",
  isAuthenticated,
  can("update-districts"),
  function (req, res) {
    const { id }= req.params;
    sendRequest(req, res, updateWilayaAPI+`/${id}`, "PUT", req.body, (jsonData) => {
      const {success , message , statusCode} = jsonData
      res.send({
        success,
        message,
        statusCode
      });
    });
  }
);

module.exports = districtController;
