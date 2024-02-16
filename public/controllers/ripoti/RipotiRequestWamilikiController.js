require("dotenv").config();
const express = require("express");
const request = require("request");
const reportWamilikiRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, createLetter, formatDate, exportJSONToExcel, activeHandover } = require("../../../util");
// const { sendRequest, isAuthenticated, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
const requestRiportKuanzishaAPI = API_BASE_URL + "ripoti-wamiliki-shule";


// Display
reportWamilikiRequestController.get(
  "/RipotiWamiliki",
  isAuthenticated,
  can("view-school-owners-report"),
  activeHandover,
  function (req, res) {
    const per_page =
      req.query.export == "true" && req.query.max
        ? Number(req.query.max)
        : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number;
    const date_range = req.query.date_range;
    const category = req.query.category;
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;

    const formData = {
      page,
      per_page,
      tracking_number,
      status,
      date_range,
      category,
      ownership,
      structure,
      region,
      district,
      ward,
      street,
    };

    sendRequest(
      req,
      res,
      requestRiportKuanzishaAPI,
      "GET",
      formData,
      (jsonData) => {
        const { data, numRows, categories, structures, ownerships, regions } =
          jsonData;
        if (req.query.export == "true") {
          data.forEach((item) => {
            delete item.status;
          });
          exportJSONToExcel(res, data);
        } else {
          res.render(path.join(__dirname + "/../../design/reports/wamiliki"), {
            req: req,
            data: data,
            categories,
            structures,
            ownerships,
            regions,
            pagination: {
              total: numRows,
              current: page,
              per_page: per_page,
              url: "RipotiWamiliki",
              pages: Math.ceil(numRows / per_page),
            },
          });
        }
      }
    );
  }
);

module.exports = reportWamilikiRequestController;
