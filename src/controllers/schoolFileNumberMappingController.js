require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, hasPermission } = require("../../util");

const schoolFileNumberMappingController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allMappingsAPI = API_BASE_URL + "all-school-file-number-mappings";
const lookupAPI = API_BASE_URL + "school-file-number-mappings-lookup";
const createMappingAPI = API_BASE_URL + "add-school-file-number-mapping";
const updateMappingAPI = API_BASE_URL + "update-school-file-number-mapping";
const deleteMappingAPI = API_BASE_URL + "delete-school-file-number-mapping";

const canViewFileNumberMappings = (req, res, next) => {
  const allowed = hasPermission(req, "view-algorithm|view-workflow|view-track-application");
  if (allowed) return next();
  return res.redirect("/403");
};

schoolFileNumberMappingController.get(
  "/FileNumberMappings",
  isAuthenticated,
  canViewFileNumberMappings,
  function (req, res) {
    return res.render(path.join(__dirname + "/../views/school_file_number_mappings"), {
      req,
    });
  }
);

schoolFileNumberMappingController.post(
  "/FileNumberMappingsList",
  isAuthenticated,
  canViewFileNumberMappings,
  function (req, res) {
    const draw = Number(req.body.draw || 1);
    const start = Number(req.body.start || 0);
    const length = Number(req.body.length || 10);
    const per_page = length > 0 ? length : 10;
    const page = Math.floor(start / per_page) + 1;

    sendRequest(
      req,
      res,
      `${allMappingsAPI}?page=${page}&per_page=${per_page}`,
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

schoolFileNumberMappingController.get(
  "/SchoolFileNumberMappingsLookup",
  isAuthenticated,
  canViewFileNumberMappings,
  function (req, res) {
    sendRequest(req, res, lookupAPI, "GET", {}, (jsonData) => {
      res.send({
        statusCode: jsonData?.statusCode || 306,
        data: jsonData?.data || { registries: [], categories: [] },
        message: jsonData?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

schoolFileNumberMappingController.post(
  "/tengenezaFileNumberMapping",
  isAuthenticated,
  canViewFileNumberMappings,
  function (req, res) {
    const formData = {
      registry_type_id: req.body.registry_type_id,
      school_category_id: req.body.school_category_id,
      file_number: req.body.file_number,
      is_active: req.body.is_active,
    };

    sendRequest(req, res, createMappingAPI, "POST", formData, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

schoolFileNumberMappingController.post(
  "/badiliFileNumberMapping/:id",
  isAuthenticated,
  canViewFileNumberMappings,
  function (req, res) {
    const id = Number(req.params.id || 0);
    const formData = {
      registry_type_id: req.body.registry_type_id,
      school_category_id: req.body.school_category_id,
      file_number: req.body.file_number,
      is_active: req.body.is_active,
    };

    sendRequest(req, res, `${updateMappingAPI}/${id}`, "PUT", formData, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

schoolFileNumberMappingController.post(
  "/futaFileNumberMapping/:id",
  isAuthenticated,
  canViewFileNumberMappings,
  function (req, res) {
    const id = Number(req.params.id || 0);
    sendRequest(req, res, `${deleteMappingAPI}/${id}`, "DELETE", {}, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

module.exports = schoolFileNumberMappingController;
