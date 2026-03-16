require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const systemLogController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const systemLogsAPI = API_BASE_URL + "system-logs";
const systemLogsSummaryAPI = API_BASE_URL + "system-logs-summary";

const sanitizeFilter = (value = "") => String(value || "").trim();
const resolveLogsRefreshMs = () => {
  const parsed = Number(process.env.SYSTEM_LOGS_REFRESH_MS || 5000);
  if (!Number.isFinite(parsed)) return 5000;
  return Math.max(1000, Math.floor(parsed));
};

const extractFilters = (body = {}) => ({
  level: sanitizeFilter(body.level),
  module: sanitizeFilter(body.module),
  event_type: sanitizeFilter(body.event_type),
  search_text: sanitizeFilter(body.search_text),
  from_date: sanitizeFilter(body.from_date),
  to_date: sanitizeFilter(body.to_date),
});

systemLogController.get("/SystemLogs", isAuthenticated, can("view-audit"), function (req, res) {
  return res.render(path.join(__dirname + "/../views/system_logs"), {
    req,
    logsRefreshMs: resolveLogsRefreshMs(),
  });
});

systemLogController.post("/SystemLogsList", isAuthenticated, can("view-audit"), function (req, res) {
  const draw = Number(req.body.draw || 1);
  const start = Number(req.body.start || 0);
  const length = Number(req.body.length || 20);
  const per_page = length > 0 ? length : 20;
  const page = Math.floor(start / per_page) + 1;
  const filters = extractFilters(req.body);

  sendRequest(
    req,
    res,
    systemLogsAPI,
    "GET",
    {
      page,
      per_page,
      is_paginated: true,
      level: filters.level,
      module: filters.module,
      event_type: filters.event_type,
      search: filters.search_text,
      from: filters.from_date,
      to: filters.to_date,
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
    }
  );
});

systemLogController.post("/SystemLogsSummary", isAuthenticated, can("view-audit"), function (req, res) {
  const filters = extractFilters(req.body);

  sendRequest(
    req,
    res,
    systemLogsSummaryAPI,
    "GET",
    {
      level: filters.level,
      module: filters.module,
      event_type: filters.event_type,
      search: filters.search_text,
      from: filters.from_date,
      to: filters.to_date,
    },
    (jsonData) => {
      res.send({
        statusCode: Number(jsonData?.statusCode || 306),
        data: jsonData?.data || {},
        message: jsonData?.message || "Imeshindikana kupata summary ya logs.",
      });
    }
  );
});

systemLogController.get("/SystemLogDetails/:id", isAuthenticated, can("view-audit"), function (req, res) {
  const id = Number(req.params.id || 0);
  sendRequest(req, res, `${systemLogsAPI}/${id}`, "GET", {}, (jsonData) => {
    res.send({
      statusCode: Number(jsonData?.statusCode || 306),
      data: jsonData?.data || null,
      message: jsonData?.message || "Imeshindikana kupata detail ya log.",
    });
  });
});

// Collect frontend/browser runtime errors from any authenticated user.
systemLogController.post("/SystemLogsClientError", isAuthenticated, function (req, res) {
  const payload = req.body || {};
  const forwarded = {
    level: sanitizeFilter(payload.level || "error"),
    module: "ui-browser",
    event_type: sanitizeFilter(payload.event_type || "client-runtime-error"),
    message: sanitizeFilter(payload.message || "Frontend runtime error"),
    source: sanitizeFilter(payload.source || "sas-admin/browser"),
    tracking_number: sanitizeFilter(payload.tracking_number || ""),
    context: payload.context || null,
    error_details: payload.error_details || null,
  };

  sendRequest(req, res, systemLogsAPI, "POST", forwarded, (jsonData) => {
    res.send({
      statusCode: Number(jsonData?.statusCode || 306),
      message: jsonData?.message || "Imeshindikana kuwasilisha client log.",
    });
  });
});

module.exports = systemLogController;
