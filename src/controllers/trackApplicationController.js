require("dotenv").config();

const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can, activeHandover } = require("../../util");
const { sendRequest: sendApiRequest } = require("../helpers/requestHelper");

const trackApplicationController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const trackAPI = `${API_BASE_URL}track_applications`;
const applicationCommentsAPI = `${API_BASE_URL}application_comments`;
const updatePaymentAPI = `${API_BASE_URL}update_payment`;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeSearchValue = (search) => {
  if (search && typeof search === "object") {
    return String(search.value || "").trim();
  }

  return String(search || "").trim();
};

trackApplicationController.get(
  "/TrackOmbi",
  isAuthenticated,
  can("view-track-application"),
  activeHandover,
  (req, res) => {
    res.render(path.join(__dirname, "../views/track"), { req });
  },
);

trackApplicationController.post(
  "/TrackList",
  isAuthenticated,
  can("view-track-application"),
  async (req, res) => {
    const draw = toPositiveInt(req.body.draw, 1);
    const length = toPositiveInt(req.body.length, 10);
    const start = Math.max(0, Number.parseInt(req.body.start, 10) || 0);
    const page = Math.floor(start / length) + 1;
    const searchValue = normalizeSearchValue(req.body.search);
    const filter = String(req.body.filter || req.query.filter || "").trim();

    const jsonData = await sendApiRequest(
      req,
      res,
      `${trackAPI}?page=${page}&per_page=${length}`,
      "GET",
      {
        search_value: searchValue,
        school_id: req.body.school_id,
        filter,
      },
    );

    if (res.headersSent) return;

    const rows = Array.isArray(jsonData?.data) ? jsonData.data : [];
    const totalRecords = Number(jsonData?.numRows || 0);

    return res.send({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: totalRecords,
      data: rows,
      summary: jsonData?.summary || null,
    });
  },
);

trackApplicationController.post(
  "/ApplicationComments/:tracking_number",
  isAuthenticated,
  can("view-track-application"),
  (req, res) => {
    const trackingNumber = req.params.tracking_number;
    sendRequest(req, res, `${applicationCommentsAPI}/${trackingNumber}`, "GET", {}, (jsonData) => {
      res.render(path.join(__dirname, "../views/maoni"), { Maoni: jsonData.data }, (err, html) => {
        if (err) {
          return res.status(500).send(err.message);
        }

        return res.send({
          htmlComments: html,
        });
      });
    });
  },
);

trackApplicationController.post(
  "/ChangePayment/:tracking_number",
  isAuthenticated,
  can("view-track-application"),
  (req, res) => {
    const trackingNumber = req.params.tracking_number;
    sendRequest(req, res, updatePaymentAPI, "PUT", { tracking_number: trackingNumber }, (jsonData) => {
      const { statusCode, message } = jsonData;
      res.send({ statusCode, message });
    });
  },
);

module.exports = trackApplicationController;
