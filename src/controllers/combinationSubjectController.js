require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const combinationSubjectController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allCombinationSubjectsAPI = API_BASE_URL + "all-combination-subjects";
const combinationSubjectsLookupAPI = API_BASE_URL + "combination-subjects-lookup";
const createCombinationSubjectAPI = API_BASE_URL + "add-combination-subject";
const updateCombinationSubjectAPI = API_BASE_URL + "update-combination-subject";
const deleteCombinationSubjectAPI = API_BASE_URL + "delete-combination-subject";

// Setup page
combinationSubjectController.get(
  "/MasomoYaMichepuo",
  isAuthenticated,
  can("view-combinations"),
  function (req, res) {
    return res.render(path.join(__dirname + "/../views/combination_subjects"), {
      req,
    });
  }
);

// Datatable source for setup page
combinationSubjectController.post(
  "/MasomoYaMichepuoList",
  isAuthenticated,
  can("view-combinations"),
  function (req, res) {
    const draw = Number(req.body.draw || 1);
    const start = Number(req.body.start || 0);
    const length = Number(req.body.length || 10);
    const per_page = length > 0 ? length : 10;
    const page = Math.floor(start / per_page) + 1;

    sendRequest(
      req,
      res,
      `${allCombinationSubjectsAPI}?page=${page}&per_page=${per_page}`,
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

// Lookup data for form
combinationSubjectController.get(
  "/MasomoYaMichepuoLookup",
  isAuthenticated,
  can("view-combinations"),
  function (req, res) {
    sendRequest(req, res, combinationSubjectsLookupAPI, "GET", {}, (jsonData) => {
      res.send({
        statusCode: jsonData?.statusCode || 306,
        data: jsonData?.data || { combinations: [], subjects: [] },
        message: jsonData?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

// Create
combinationSubjectController.post(
  "/tengenezaSomoLaMchepuo",
  isAuthenticated,
  can("view-combinations"),
  function (req, res) {
    const formData = {
      combination_id: req.body.combination_id,
      subject_ids: req.body.subject_ids,
    };

    sendRequest(req, res, createCombinationSubjectAPI, "POST", formData, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

// Update
combinationSubjectController.post(
  "/badiliSomoLaMchepuo/:id",
  isAuthenticated,
  can("view-combinations"),
  function (req, res) {
    const id = Number(req.params.id || 0);
    const formData = {
      combination_id: req.body.combination_id,
      subject_id: req.body.subject_id,
    };

    sendRequest(req, res, `${updateCombinationSubjectAPI}/${id}`, "PUT", formData, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

// Delete
combinationSubjectController.post(
  "/futaSomoLaMchepuo/:id",
  isAuthenticated,
  can("view-combinations"),
  function (req, res) {
    const id = Number(req.params.id || 0);
    sendRequest(req, res, `${deleteCombinationSubjectAPI}/${id}`, "DELETE", {}, (body) => {
      res.send({
        statusCode: body?.statusCode || 306,
        message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
      });
    });
  }
);

module.exports = combinationSubjectController;
