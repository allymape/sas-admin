require("dotenv").config();
const express = require("express");
const request = require("request");
const reportUsajiliRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, createLetter, formatDate, exportJSONToExcel, activeHandover } = require("../../../util");
// const { sendRequest, isAuthenticated, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
const requestRiportUsajiliAPI = API_BASE_URL + "ripoti-usajili-shule";
const thibitishaUsajiliAPI = API_BASE_URL + "thibitisha-usajili-shule";
const rekebishaUsajiliAPI = API_BASE_URL + "rekebisha-usajili-shule";


// Display
reportUsajiliRequestController.get(
  "/RipotiZilizosajiliwa",
  isAuthenticated,
  can("view-registered-school-report"),
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
    const verified = req.query.verified;
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
      verified,
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
      requestRiportUsajiliAPI,
      "GET",
      formData,
      (jsonData) => {
        const { data, numRows, categories, structures, ownerships, regions } =
          jsonData;
        if (req.query.export == "true") {
          data.forEach((item) => {
            delete item.status;
            delete item.is_verified;
            delete item.registration_id;
            delete item.approved_at;
            delete item.approved;
            delete item.corrected;
            delete item.description;
          });
          const csvData = data.map((item) => ({
            ...item,
            registration_date : item.registration_date ? formatDate(item.registration_date, "DD-MM-YYYY") : '',
          }));
          console.log("Export to Excel...")
          exportJSONToExcel(res, csvData);
        } else {
          res.render(path.join(__dirname + "/../../design/reports/usajili"), {
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
              url: "RipotiZilizosajiliwa",
              pages: Math.ceil(numRows / per_page),
            },
          });
        }
      }
    );
  }
);

reportUsajiliRequestController.post(`/RekebishaUsajili/:tracking_number`,isAuthenticated,(req, res) => {
    sendRequest(req, res , rekebishaUsajiliAPI+`/${req.params.tracking_number}` , "POST" , req.body , (jsonData) => {
          const {statusCode , message} = jsonData
          res.send({
            statusCode,
            message
          });
    })
  }
);
reportUsajiliRequestController.post(
  `/ThibitishaUsajili/:tracking_number`,
  isAuthenticated,
  (req, res) => {
     sendRequest(req, res , thibitishaUsajiliAPI+`/${req.params.tracking_number}` , "POST" , req.body , (jsonData) => {
          const {statusCode , message} = jsonData
          res.send({
            statusCode,
            message
          });
    })
  }
);
module.exports = reportUsajiliRequestController;
