require("dotenv").config();
const express = require("express");
const districtController = express.Router();

const { sendRequest, isAuthenticated, can } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var lgaListAPI = API_BASE_URL + "allDistricts";
var lgaAPI = API_BASE_URL + "lookup-districts";
var VutaWilayaListAPI = API_BASE_URL + "usajiliWilaya";
var updateWilayaAPI = API_BASE_URL + "update-district";

districtController.get(
  "/HalmashauriList",
  isAuthenticated,
  can("view-districts"),
  function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);

    sendRequest(
      req,
      res,
      lgaListAPI + "?page=" + page + "&per_page=" + per_page,
      "GET",
      req.query,
      (jsonData) => {
        var data = jsonData.data;
        var numRows = jsonData.numRows;
        res.send({
          councils: data,
          statusCode: jsonData.statusCode,
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
