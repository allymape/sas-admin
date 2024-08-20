require("dotenv").config();
const express = require("express");
const request = require("request");
const attachmentController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated } = require("../../util");
const FRONTEND_URL = process.env.FRONTEND_URL;
const pdf2base64 = require("pdf-to-base64");
var API_BASE_URL = process.env.API_BASE_URL;
var pandishaHatiAPI = API_BASE_URL + "upload-attachment";
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const https = require("https");
const fs = require("fs");
const axios = require("axios");
// Custom HTTPS agent with SSL verification
const agent = new https.Agent({
  // ca: fs.readFileSync("certs/sas_certificate.crt"),
  rejectUnauthorized: false, // Ensures SSL verification
});

async function pdfbase64(url) {
  try {
    console.log(url);
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      httpsAgent: agent,
    });
    const base64 = Buffer.from(response.data).toString("base64");
    return base64;
  } catch (error) {
    console.error(
      "Error downloading or converting PDF to base64:",
      error.message
    );
    throw error;
  }
}
attachmentController.post(
  "/View-Attachment",
  isAuthenticated,
  function (req, res) {
    const file_path = req.body.file_path;
    if (file_path) {
      pdfbase64(`${FRONTEND_URL + file_path}`)
        .then((response) => {
          // console.log(response);
          res.send({
            statusCode: 300,
            data: response,
          });
        })
        .catch((error) => {
          res.send({
            statusCode: 500,
            data: error,
          });
        });
    } else {
      res.send({
        statusCode: 404,
        data: null,
      });
    }
  }
);
attachmentController.post(
  "/TumaAttachment",
  isAuthenticated,
  can("create-attachments"),
  function (req, res) {
    const formData = {
      keyString: req.body.keyString,
      trackerId: req.body.trackerId,
      attachment: req.body.attachment,
      kiambatisho: req.body.kiambatisho,
    };
    sendRequest(req, res, pandishaHatiAPI, "POST", formData, (jsonData) => {
      var { statusCode, message, success } = jsonData;
      return res.send({
        success,
        statusCode,
        message,
      });
    });
  }
);

module.exports = attachmentController;
