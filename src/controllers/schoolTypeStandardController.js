require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const schoolTypeStandardController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allSchoolTypeStandardsAPI = API_BASE_URL + "all-school-type-standards";
const createSchoolTypeStandardAPI = API_BASE_URL + "add-school-type-standard";
const updateSchoolTypeStandardAPI = API_BASE_URL + "update-school-type-standard";
const deleteSchoolTypeStandardAPI = API_BASE_URL + "delete-school-type-standard";
const schoolTypeStandardLookupsAPI = API_BASE_URL + "school-type-standard-lookups";

// Setup page
schoolTypeStandardController.get("/ViwangoAinaZaShule", isAuthenticated, can("view-schools"), function (req, res) {
  return res.render(path.join(__dirname + "/../views/school_type_standards"), {
    req,
  });
});

// Datatable source for setup page
schoolTypeStandardController.post("/ViwangoAinaZaShuleList", isAuthenticated, can("view-schools"), function (req, res) {
  const draw = Number(req.body.draw || 1);
  const start = Number(req.body.start || 0);
  const length = Number(req.body.length || 10);
  const per_page = length > 0 ? length : 10;
  const page = Math.floor(start / per_page) + 1;

  sendRequest(
    req,
    res,
    `${allSchoolTypeStandardsAPI}?page=${page}&per_page=${per_page}`,
    "GET",
    { is_paginated: true },
    (jsonData) => {
      const data = Array.isArray(jsonData?.data) ? jsonData.data : [];
      const totalRecords = Number(jsonData?.numRows || 0);
      res.send({
        draw,
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data,
      });
    }
  );
});

// Lookups
schoolTypeStandardController.get("/SchoolTypeStandardLookups", isAuthenticated, can("view-schools"), function (req, res) {
  sendRequest(req, res, schoolTypeStandardLookupsAPI, "GET", {}, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      data: body?.data || {},
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Create
schoolTypeStandardController.post("/tengenezaKiwangoAinaYaShule", isAuthenticated, can("view-schools"), function (req, res) {
  sendRequest(req, res, createSchoolTypeStandardAPI, "POST", req.body, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Update
schoolTypeStandardController.post(
  "/badiliKiwangoAinaYaShule/:id",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const id = Number(req.params.id || 0);
    sendRequest(req, res, `${updateSchoolTypeStandardAPI}/${id}`, "PUT", req.body, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

// Delete
schoolTypeStandardController.post("/futaKiwangoAinaYaShule/:id", isAuthenticated, can("view-schools"), function (req, res) {
  const id = Number(req.params.id || 0);
  sendRequest(req, res, `${deleteSchoolTypeStandardAPI}/${id}`, "DELETE", {}, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

module.exports = schoolTypeStandardController;
