require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const schoolInfrastructureStandardController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;

const allSchoolInfrastructureStandardsAPI = API_BASE_URL + "all-school-infrastructure-standards";
const createSchoolInfrastructureStandardAPI = API_BASE_URL + "add-school-infrastructure-standard";
const updateSchoolInfrastructureStandardAPI = API_BASE_URL + "update-school-infrastructure-standard";
const deleteSchoolInfrastructureStandardAPI = API_BASE_URL + "delete-school-infrastructure-standard";
const schoolInfrastructureStandardLookupsAPI = API_BASE_URL + "school-infrastructure-standard-lookups";

const allInfrastructureItemsAPI = API_BASE_URL + "all-infrastructure-items";
const createInfrastructureItemAPI = API_BASE_URL + "add-infrastructure-item";
const updateInfrastructureItemAPI = API_BASE_URL + "update-infrastructure-item";
const deleteInfrastructureItemAPI = API_BASE_URL + "delete-infrastructure-item";

// Setup page
schoolInfrastructureStandardController.get(
  "/ViwangoMiundombinu",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    return res.render(path.join(__dirname + "/../views/school_infrastructure_standards"), {
      req,
    });
  }
);

// Datatable source for standards
schoolInfrastructureStandardController.post(
  "/ViwangoMiundombinuList",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const draw = Number(req.body.draw || 1);
    const start = Number(req.body.start || 0);
    const length = Number(req.body.length || 10);
    const per_page = length > 0 ? length : 10;
    const page = Math.floor(start / per_page) + 1;

    sendRequest(
      req,
      res,
      `${allSchoolInfrastructureStandardsAPI}?page=${page}&per_page=${per_page}`,
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
  }
);

// Datatable source for infrastructure items
schoolInfrastructureStandardController.post(
  "/MiundombinuItemsList",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const draw = Number(req.body.draw || 1);
    const start = Number(req.body.start || 0);
    const length = Number(req.body.length || 10);
    const per_page = length > 0 ? length : 10;
    const page = Math.floor(start / per_page) + 1;

    sendRequest(
      req,
      res,
      `${allInfrastructureItemsAPI}?page=${page}&per_page=${per_page}`,
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
  }
);

// Lookups
schoolInfrastructureStandardController.get(
  "/SchoolInfrastructureStandardLookups",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    sendRequest(req, res, schoolInfrastructureStandardLookupsAPI, "GET", {}, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        data: body?.data || {},
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

// Standards CRUD
schoolInfrastructureStandardController.post(
  "/tengenezaKiwangoMiundombinu",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    sendRequest(req, res, createSchoolInfrastructureStandardAPI, "POST", req.body, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

schoolInfrastructureStandardController.post(
  "/badiliKiwangoMiundombinu/:id",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const id = Number(req.params.id || 0);
    sendRequest(req, res, `${updateSchoolInfrastructureStandardAPI}/${id}`, "PUT", req.body, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

schoolInfrastructureStandardController.post(
  "/futaKiwangoMiundombinu/:id",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const id = Number(req.params.id || 0);
    sendRequest(req, res, `${deleteSchoolInfrastructureStandardAPI}/${id}`, "DELETE", {}, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

// Infrastructure items CRUD
schoolInfrastructureStandardController.post(
  "/tengenezaKipengeleMiundombinu",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    sendRequest(req, res, createInfrastructureItemAPI, "POST", req.body, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

schoolInfrastructureStandardController.post(
  "/badiliKipengeleMiundombinu/:id",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const id = Number(req.params.id || 0);
    sendRequest(req, res, `${updateInfrastructureItemAPI}/${id}`, "PUT", req.body, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

schoolInfrastructureStandardController.post(
  "/futaKipengeleMiundombinu/:id",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const id = Number(req.params.id || 0);
    sendRequest(req, res, `${deleteInfrastructureItemAPI}/${id}`, "DELETE", {}, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

module.exports = schoolInfrastructureStandardController;
