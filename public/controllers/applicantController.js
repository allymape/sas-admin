require("dotenv").config();
const express = require("express");
const request = require("request");
const applicantController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, isAuthenticated, can, activeHandover } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
const allApplicantsAPI = API_BASE_URL + "all-applicants";
const findApplicantAPI = API_BASE_URL + "find-applicant";
const editApplicantAPI = API_BASE_URL + "edit-applicant";
const lookForApplicantsAPI = API_BASE_URL + "look_for_applicants";
const changeSchoolApplicantAPI = API_BASE_URL + "change-school-applicant";
// Get all Applicants
applicantController.get(
  "/Waombaji",
  isAuthenticated,
  can("view-applicants"),
  activeHandover,
  function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    var url = allApplicantsAPI + "?page=" + page + "&per_page=" + per_page;
    var formData = {
      is_paginated: req.query.is_paginated,
      search: req.query.tafuta,
    };
    sendRequest(req, res, url, "GET", formData, (jsonData) => {
      var statusCode = jsonData.statusCode;
      var data = jsonData.data;
      var numRows = jsonData.numRows;
      res.render(path.join(__dirname + "/../design/waombaji"), {
        req: req,
        statusCode: statusCode,
        applicants: data,
        pagination: {
          total: numRows,
          current: page,
          per_page: per_page,
          url: "Waombaji",
          pages: Math.ceil(numRows / per_page),
        },
      });
    });
  }
);
// look for applicants
applicantController.get(
  "/LookForApplicants",
  isAuthenticated,
  function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    var search = req.query.q;
    var exclude = req.query.exclude;
    sendRequest(
      req,
      res,
      lookForApplicantsAPI + "?page=" + page + "&per_page=" + per_page,
      "GET",
      { search: search, exclude: exclude },
      (jsonData) => {
        var data = jsonData.data;
        res.send({
          statusCode: data.statusCode,
          message: data.message,
          data: data,
        });
      }
    );
  }
);

// show applicant by id
applicantController.get("/Mwombaji/:id", isAuthenticated, can("view-applicants"),activeHandover, function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var formData = {
    search: req.query.tafuta,
  };
  sendRequest(
    req,
    res,
    findApplicantAPI +
      "/" +
      req.params.id +
      "?page=" +
      page +
      "&per_page=" +
      per_page,
    "GET",
    formData,
    (jsonData) => {
      var statusCode = jsonData.statusCode;
      var data = jsonData.data;
      var applicationNumRows = data.applicationsNumRows;
      var schoolsNumRows = data.schoolsNumRows;
      var attachmentsNumRows = data.attachmentsNumRows;
      res.render(path.join(__dirname + "/../design/waombaji/view_mwombaji"), {
        req: req,
        statusCode: statusCode,
        applicant: data.applicant,
        applications: data.applications,
        schools: data.schools,
        attachments: data.attachments,
        applications_pagination: {
          total: applicationNumRows,
          current: page,
          per_page: per_page,
          url: "Mwombaji/" + req.params.id,
          pages: Math.ceil(applicationNumRows / per_page),
        },
        schools_pagination: {
          total: schoolsNumRows,
          current: page,
          per_page: per_page,
          url: "Mwombaji/" + req.params.id,
          pages: Math.ceil(schoolsNumRows / per_page),
        },
        attachments_pagination: {
          total: attachmentsNumRows,
          current: page,
          per_page: per_page,
          url: "Mwombaji/" + req.params.id,
          pages: Math.ceil(attachmentsNumRows / per_page),
        },
      });
    }
  );
});
// edit applicant by id
applicantController.get(
  "/Mwombaji/:id/badili",
  isAuthenticated,
  can("update-applicants"),
  activeHandover,
  function (req, res) {
    sendRequest(
      req,
      res,
      editApplicantAPI + "/" + req.params.id + '/edit',
      "GET",
      {},
      (jsonData) => {
        var statusCode = jsonData.statusCode;
        var data = jsonData.data;
        // console.log(data);
        res.render(path.join(__dirname + "/../design/waombaji/edit_mwombaji"), {
          req: req,
          statusCode: statusCode,
          applicant: data,
        });
      }
    );
  }
);
// Transfer Ownership
applicantController.post(
  "/BadiliMwombaji",
  isAuthenticated,
  can("update-applicants"),
  activeHandover,
  function (req, res) {
    sendRequest(
      req,
      res,
      changeSchoolApplicantAPI,
      "POST",
      req.body,
      (response) => {
        res.send({
          statusCode: response.statusCode,
          message: response.message,
        });
      }
    );
  }
);
module.exports = applicantController;
