require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated } = require("../../util");

const applicationCategoryController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allApplicationCategoriesAPI = API_BASE_URL + "all-application-categories";
const createApplicationCategoryAPI = API_BASE_URL + "add-application-category";
const updateApplicationCategoryAPI = API_BASE_URL + "update-application-category";
const deleteApplicationCategoryAPI = API_BASE_URL + "delete-application-category";

// Setup page
applicationCategoryController.get("/AinaZaMaombi", isAuthenticated, function (req, res) {
  return res.render(path.join(__dirname + "/../views/application_categories"), {
    req,
  });
});

// Datatable source for setup page
applicationCategoryController.post("/AinaZaMaombiList", isAuthenticated, function (req, res) {
  const draw = Number(req.body.draw || 1);
  const start = Number(req.body.start || 0);
  const length = Number(req.body.length || 10);
  const per_page = length > 0 ? length : 10;
  const page = Math.floor(start / per_page) + 1;

  sendRequest(
    req,
    res,
    `${allApplicationCategoriesAPI}?page=${page}&per_page=${per_page}`,
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

// Lookup endpoint used by other setup pages (eg. Viambatisho)
applicationCategoryController.get("/AppliciationCategories", isAuthenticated, function (req, res) {
  const per_page = Number(req.query.per_page || 10);
  const page = Number(req.query.page || 1);
  const url = `${allApplicationCategoriesAPI}?page=${page}&per_page=${per_page}`;

  sendRequest(
    req,
    res,
    url,
    "GET",
    { is_paginated: req.query.is_paginated },
    (jsonData) => {
      const numRows = Number(jsonData?.numRows || 0);
      res.send({
        statusCode: jsonData?.statusCode || 306,
        data: Array.isArray(jsonData?.data) ? jsonData.data : [],
        pagination: {
          total: numRows,
          current: page,
          per_page,
          pages: Math.ceil(numRows / per_page),
        },
      });
    }
  );
});

// Create
applicationCategoryController.post("/tengenezaAinaZaMaombi", isAuthenticated, function (req, res) {
  const formData = {
    applicationCategoryName: req.body.app_name,
    applicationCode: req.body.application_code,
  };

  sendRequest(req, res, createApplicationCategoryAPI, "POST", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Update
applicationCategoryController.post("/badiliAinaZaMaombi/:id", isAuthenticated, function (req, res) {
  const id = Number(req.params.id || 0);
  const formData = {
    applicationCategoryName: req.body.app_name,
    applicationCode: req.body.application_code,
  };

  sendRequest(req, res, `${updateApplicationCategoryAPI}/${id}`, "PUT", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Delete
applicationCategoryController.post("/futaAinaZaMaombi/:id", isAuthenticated, function (req, res) {
  const id = Number(req.params.id || 0);
  sendRequest(req, res, `${deleteApplicationCategoryAPI}/${id}`, "DELETE", {}, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

module.exports = applicationCategoryController;
