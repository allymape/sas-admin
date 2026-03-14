require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can, hasPermission } = require("../../util");

const actionTypeController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allActionTypesAPI = API_BASE_URL + "all-action-types";
const createActionTypeAPI = API_BASE_URL + "add-action-type";
const updateActionTypeAPI = API_BASE_URL + "update-action-type";
const deleteActionTypeAPI = API_BASE_URL + "delete-action-type";

actionTypeController.get("/AinaZaHatua", isAuthenticated, can("view-workflow"), function (req, res) {
  return res.render(path.join(__dirname + "/../views/action_types"), {
    req,
    canCreateActionType: hasPermission(req, "create-workflow"),
    canUpdateActionType: hasPermission(req, "update-workflow"),
    canDeleteActionType: hasPermission(req, "delete-workflow"),
  });
});

actionTypeController.post("/AinaZaHatuaList", isAuthenticated, can("view-workflow"), function (req, res) {
  const draw = Number(req.body.draw || 1);
  const start = Number(req.body.start || 0);
  const length = Number(req.body.length || 10);
  const per_page = length > 0 ? length : 10;
  const page = Math.floor(start / per_page) + 1;

  sendRequest(
    req,
    res,
    `${allActionTypesAPI}?page=${page}&per_page=${per_page}`,
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

actionTypeController.post("/tengenezaAinaZaHatua", isAuthenticated, can("create-workflow"), function (req, res) {
  const formData = {
    actionTypeName: req.body.name,
    actionTypeCode: req.body.code,
    actionTypeDescription: req.body.description,
  };

  sendRequest(req, res, createActionTypeAPI, "POST", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

actionTypeController.post("/badiliAinaZaHatua/:id", isAuthenticated, can("update-workflow"), function (req, res) {
  const id = Number(req.params.id || 0);
  const formData = {
    actionTypeName: req.body.name,
    actionTypeCode: req.body.code,
    actionTypeDescription: req.body.description,
  };

  sendRequest(req, res, `${updateActionTypeAPI}/${id}`, "PUT", formData, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

actionTypeController.post("/futaAinaZaHatua/:id", isAuthenticated, can("delete-workflow"), function (req, res) {
  const id = Number(req.params.id || 0);
  sendRequest(req, res, `${deleteActionTypeAPI}/${id}`, "DELETE", {}, (body) => {
    res.send({
      statusCode: body?.statusCode || 306,
      message: body?.message || "Kuna tatizo, tafadhali jaribu tena.",
    });
  });
});

module.exports = actionTypeController;
