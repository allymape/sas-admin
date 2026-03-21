require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const aiSupportController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const aiChatAPI = API_BASE_URL + "ai-support/chat";

const toText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const safeTrim = (value) => toText(value, "").trim();

aiSupportController.get("/AISupport", isAuthenticated, can("view-dashboard"), function (req, res) {
  return res.render(path.join(__dirname + "/../views/ai_support"), {
    req,
  });
});

aiSupportController.post("/AISupportChat", isAuthenticated, can("view-dashboard"), function (req, res) {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const model = safeTrim(req.body?.model);

  sendRequest(
    req,
    res,
    aiChatAPI,
    "POST",
    { messages, model },
    (jsonData) => {
      res.send({
        statusCode: Number(jsonData?.statusCode || 306),
        data: jsonData?.data || null,
        message: jsonData?.message || "Imeshindikana kupata majibu ya AI.",
      });
    },
  );
});

module.exports = aiSupportController;

