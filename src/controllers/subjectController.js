require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const subjectController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allSubjectsAPI = API_BASE_URL + "all-subjects";
const createSubjectAPI = API_BASE_URL + "add-subject";
const updateSubjectAPI = API_BASE_URL + "update-subject";
const deleteSubjectAPI = API_BASE_URL + "delete-subject";

// Setup page
subjectController.get("/Masomo", isAuthenticated, can("view-combinations"), function (req, res) {
  return res.render(path.join(__dirname + "/../views/subjects"), {
    req,
  });
});

// Datatable source for setup page
subjectController.post("/MasomoList", isAuthenticated, can("view-combinations"), function (req, res) {
  const draw = Number(req.body.draw || 1);
  const start = Number(req.body.start || 0);
  const length = Number(req.body.length || 10);
  const per_page = length > 0 ? length : 10;
  const page = Math.floor(start / per_page) + 1;

  sendRequest(
    req,
    res,
    `${allSubjectsAPI}?page=${page}&per_page=${per_page}`,
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
subjectController.get("/Subjects", isAuthenticated, can("view-combinations"), function (req, res) {
  const per_page = Number(req.query.per_page || 10);
  const page = Number(req.query.page || 1);
  const url = `${allSubjectsAPI}?page=${page}&per_page=${per_page}`;

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
subjectController.post("/tengenezaSomo", isAuthenticated, can("view-combinations"), function (req, res) {
  const formData = {
    subjectName: req.body.subject_name,
  };

  sendRequest(req, res, createSubjectAPI, "POST", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Update
subjectController.post("/badiliSomo/:id", isAuthenticated, can("view-combinations"), function (req, res) {
  const id = Number(req.params.id || 0);
  const formData = {
    subjectName: req.body.subject_name,
  };

  sendRequest(req, res, `${updateSubjectAPI}/${id}`, "PUT", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

// Delete
subjectController.post("/futaSomo/:id", isAuthenticated, can("view-combinations"), function (req, res) {
  const id = Number(req.params.id || 0);
  sendRequest(req, res, `${deleteSubjectAPI}/${id}`, "DELETE", {}, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

module.exports = subjectController;
