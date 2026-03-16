require("dotenv").config();
const express = require("express");
const request = require("request");
const { isAuthenticated, can, modifiedUrl, activeHandover } = require("../../util");
var path = require("path");
const auditTrailController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const auditAPI = String(API_BASE_URL || "") + "audit-trail";
const auditAPIFallback = String(API_BASE_URL || "").includes("/api/v2/")
  ? String(API_BASE_URL || "").replace("/api/v2/", "/api/") + "audit-trail"
  : "";

const toDataTableResponse = (draw = 1, rows = [], total = 0) => ({
  draw,
  recordsTotal: Number(total || 0),
  recordsFiltered: Number(total || 0),
  data: Array.isArray(rows) ? rows : [],
});

const parseAuditApiBody = (body = {}) => {
  const directRows = Array.isArray(body?.data) ? body.data : null;
  const nestedRows = Array.isArray(body?.data?.data) ? body.data.data : null;
  const rows = directRows || nestedRows || [];
  const total = Number(body?.numRows ?? body?.data?.numRows ?? rows.length);
  return { rows, total };
};

const fetchAuditTrail = (url, token, payload) =>
  new Promise((resolve) => {
    const headers = {
      "Content-Type": "application/json",
    };
    const safeToken = String(token || "").trim();
    if (safeToken) {
      headers.Authorization = "Bearer " + safeToken;
    }

    request(
      {
        url,
        method: "POST",
        headers,
        timeout: 15000,
        json: payload,
      },
      (error, response, body) => {
        resolve({
          error,
          statusCode: Number(response?.statusCode || 0),
          body,
        });
      }
    );
  });

const handleAuditTrailList = async (req, res) => {
  const source = req.method === "GET" ? req.query : req.body;
  const draw = Number(source?.draw || 1);
  const start = Number(source?.start || 0);
  const length = Number(source?.length || 10);
  const per_page = length > 0 ? length : 10;
  const page = Math.floor(start / per_page) + 1;
  const token = req?.session?.Token || req?.body?.token || "";

  const payload = {
    ...(source || {}),
    page,
    per_page,
  };

  const primary = await fetchAuditTrail(auditAPI, token, payload);
  let finalResult = primary;

  if (
    (primary.error || primary.statusCode === 404) &&
    auditAPIFallback &&
    auditAPIFallback !== auditAPI
  ) {
    finalResult = await fetchAuditTrail(auditAPIFallback, token, payload);
  }

  if (finalResult.error || finalResult.statusCode !== 200) {
    console.log("[AuditTrailList][API_FAILED]", {
      status: finalResult.statusCode || null,
      error: finalResult.error?.message || null,
      body: finalResult.body || null,
      url: finalResult === primary ? auditAPI : auditAPIFallback,
    });
    return res.send(toDataTableResponse(draw, [], 0));
  }

  const { rows, total } = parseAuditApiBody(finalResult.body || {});
  return res.send(toDataTableResponse(draw, rows, total));
};

auditTrailController.get(
  "/AuditTrail",
  isAuthenticated,
  can("view-audit"),
  activeHandover,
  (req, res) => {
     res.render(path.join(__dirname + "/../views/audits/audit"), {
          req: req,
        });
      }
);
auditTrailController.post(
  "/AuditTrailList",
  handleAuditTrailList
);

auditTrailController.get(
  "/AuditTrailList",
  handleAuditTrailList
);

module.exports = auditTrailController;
