require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const schoolSubCategoryController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allSchoolSubCategoriesAPI = API_BASE_URL + "all-school-sub-categories";
const createSchoolSubCategoryAPI = API_BASE_URL + "add-school-sub-category";
const updateSchoolSubCategoryAPI = API_BASE_URL + "update-school-sub-category";
const deleteSchoolSubCategoryAPI = API_BASE_URL + "delete-school-sub-category";

// Setup page
schoolSubCategoryController.get("/AinaYaMalazi", isAuthenticated, can("view-schools"), function (req, res) {
  return res.render(path.join(__dirname + "/../views/school_sub_categories"), {
    req,
  });
});

// Datatable source for setup page
schoolSubCategoryController.post("/AinaYaMalaziList", isAuthenticated, can("view-schools"), function (req, res) {
  const draw = Number(req.body.draw || 1);
  const start = Number(req.body.start || 0);
  const length = Number(req.body.length || 10);
  const per_page = length > 0 ? length : 10;
  const page = Math.floor(start / per_page) + 1;

  sendRequest(
    req,
    res,
    `${allSchoolSubCategoriesAPI}?page=${page}&per_page=${per_page}`,
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
schoolSubCategoryController.get("/SchoolSubCategories", isAuthenticated, can("view-schools"), function (req, res) {
  const per_page = Number(req.query.per_page || 10);
  const page = Number(req.query.page || 1);
  const url = `${allSchoolSubCategoriesAPI}?page=${page}&per_page=${per_page}`;

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
schoolSubCategoryController.post("/tengenezaAinaYaMalazi", isAuthenticated, can("view-schools"), function (req, res) {
  const formData = {
    schoolSubCategoryName: req.body.subcategory,
    schoolSubCategoryCode: req.body.code,
  };

  sendRequest(req, res, createSchoolSubCategoryAPI, "POST", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Update
schoolSubCategoryController.post("/badiliAinaYaMalazi/:id", isAuthenticated, can("view-schools"), function (req, res) {
  const id = Number(req.params.id || 0);
  const formData = {
    schoolSubCategoryName: req.body.subcategory,
    schoolSubCategoryCode: req.body.code,
  };

  sendRequest(req, res, `${updateSchoolSubCategoryAPI}/${id}`, "PUT", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Delete
schoolSubCategoryController.post("/futaAinaYaMalazi/:id", isAuthenticated, can("view-schools"), function (req, res) {
  const id = Number(req.params.id || 0);
  sendRequest(req, res, `${deleteSchoolSubCategoryAPI}/${id}`, "DELETE", {}, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

module.exports = schoolSubCategoryController;
