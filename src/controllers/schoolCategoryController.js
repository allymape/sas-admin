require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const schoolCategoryController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allSchoolCategoriesAPI = API_BASE_URL + "all-school-categories";
const createSchoolCategoryAPI = API_BASE_URL + "add-school-category";
const updateSchoolCategoryAPI = API_BASE_URL + "update-school-category";
const deleteSchoolCategoryAPI = API_BASE_URL + "delete-school-category";

// Setup page
schoolCategoryController.get("/AinaZaShule", isAuthenticated, can("view-schools"), function (req, res) {
  return res.render(path.join(__dirname + "/../views/school_categories"), {
    req,
  });
});

// Datatable source for setup page
schoolCategoryController.post("/AinaZaShuleList", isAuthenticated, can("view-schools"), function (req, res) {
  const draw = Number(req.body.draw || 1);
  const start = Number(req.body.start || 0);
  const length = Number(req.body.length || 10);
  const per_page = length > 0 ? length : 10;
  const page = Math.floor(start / per_page) + 1;

  sendRequest(
    req,
    res,
    `${allSchoolCategoriesAPI}?page=${page}&per_page=${per_page}`,
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

// Lookup endpoint
schoolCategoryController.get("/SchoolCategories", isAuthenticated, can("view-schools"), function (req, res) {
  const per_page = Number(req.query.per_page || 10);
  const page = Number(req.query.page || 1);
  const url = `${allSchoolCategoriesAPI}?page=${page}&per_page=${per_page}`;

  sendRequest(req, res, url, "GET", { is_paginated: req.query.is_paginated }, (jsonData) => {
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
  });
});

// Create
schoolCategoryController.post("/tengenezaAinaZaShule", isAuthenticated, can("view-schools"), function (req, res) {
  const formData = {
    schoolCategoryName: req.body.category,
    schoolCategoryCode: req.body.code,
  };

  sendRequest(req, res, createSchoolCategoryAPI, "POST", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Update
schoolCategoryController.post("/badiliAinaZaShule/:id", isAuthenticated, can("view-schools"), function (req, res) {
  const id = Number(req.params.id || 0);
  const formData = {
    schoolCategoryName: req.body.category,
    schoolCategoryCode: req.body.code,
  };

  sendRequest(req, res, `${updateSchoolCategoryAPI}/${id}`, "PUT", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Delete
schoolCategoryController.post("/futaAinaZaShule/:id", isAuthenticated, can("view-schools"), function (req, res) {
  const id = Number(req.params.id || 0);
  sendRequest(req, res, `${deleteSchoolCategoryAPI}/${id}`, "DELETE", {}, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

module.exports = schoolCategoryController;
