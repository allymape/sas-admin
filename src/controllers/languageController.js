require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const languageController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allLanguagesApi = `${API_BASE_URL}all-languages`;
const addLanguageApi = `${API_BASE_URL}add-language`;
const updateLanguageApi = `${API_BASE_URL}update-language`;
const deleteLanguageApi = `${API_BASE_URL}delete-language`;

const parseDataTablePage = (req) => {
  const draw = Number(req.body.draw || 1);
  const start = Number(req.body.start || 0);
  const length = Number(req.body.length || 10);
  const per_page = length > 0 ? length : 10;
  const page = Math.floor(start / per_page) + 1;
  return { draw, page, per_page };
};

languageController.get("/Languages", isAuthenticated, can("view-schools"), (req, res) => {
  return res.render(path.join(__dirname + "/../views/languages"), { req });
});

languageController.post("/LanguagesList", isAuthenticated, can("view-schools"), (req, res) => {
  const { draw, page, per_page } = parseDataTablePage(req);
  const search = String(req.body?.search?.value || "").trim();

  sendRequest(
    req,
    res,
    allLanguagesApi,
    "GET",
    {
      page,
      per_page,
      is_paginated: true,
      search,
    },
    (jsonData) => {
      const data = Array.isArray(jsonData?.data) ? jsonData.data : [];
      const totalRecords = Number(jsonData?.numRows || 0);

      res.send({
        draw,
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data,
      });
    },
  );
});

languageController.post("/tengenezaLanguage", isAuthenticated, can("view-schools"), (req, res) => {
  const formData = {
    languageName: String(req.body?.language || req.body?.languageName || "").trim(),
  };

  sendRequest(req, res, addLanguageApi, "POST", formData, (body) => {
    res.send({
      statusCode: Number(body?.statusCode || 306),
      message: body?.message || "Failed to create language.",
    });
  });
});

languageController.post("/badiliLanguage/:id", isAuthenticated, can("view-schools"), (req, res) => {
  const id = Number(req.params.id || 0);
  const formData = {
    languageName: String(req.body?.language || req.body?.languageName || "").trim(),
  };

  sendRequest(req, res, `${updateLanguageApi}/${id}`, "PUT", formData, (body) => {
    res.send({
      statusCode: Number(body?.statusCode || 306),
      message: body?.message || "Failed to update language.",
    });
  });
});

languageController.post("/futaLanguage/:id", isAuthenticated, can("view-schools"), (req, res) => {
  const id = Number(req.params.id || 0);

  sendRequest(req, res, `${deleteLanguageApi}/${id}`, "DELETE", {}, (body) => {
    res.send({
      statusCode: Number(body?.statusCode || 306),
      message: body?.message || "Failed to delete language.",
    });
  });
});

module.exports = languageController;

