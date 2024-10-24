require("dotenv").config();
const express = require("express");
const attachmentController = express.Router();
var path = require("path");
const { sendRequest, can, isAuthenticated } = require("../../util");
const FRONTEND_URL = process.env.FRONTEND_URL;
const pdf2base64 = require("pdf-to-base64");
var API_BASE_URL = process.env.API_BASE_URL;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// var pandishaHatiAPI = API_BASE_URL + "upload-attachment";
var pandishaHatiAPI = FRONTEND_URL + "api/school-establishment/upload-attachments";
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const https = require("https");
const fs = require("fs");
const axios = require("axios");
const request = require("request");
// Custom HTTPS agent with SSL verification
const agent = new https.Agent({
  // ca: fs.readFileSync("sas_certificate.crt"),
  rejectUnauthorized: false, // Ensures SSL verification
});

attachmentController.get(
  "/View-Attachment/:path",
  isAuthenticated,
  async function (req, res) {
    const file_path = req.params.path;
    if (file_path) {
      try {
        // const url = `https://accredit.moe.go.tz:8009/attachments/20240821130537bxsaM29zy.pdf`;
        const url = `${FRONTEND_URL}attachments/${file_path}`;
        console.log(url);
        const response = await axios.get(url, {
          responseType: "stream", // Stream the PDF file directly
          httpsAgent: agent,
        });
        // Set the response headers for PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline"); // Inline to view in browser; change to 'attachment' to force download
        // Pipe the response directly to the client
        response.data.pipe(res);
      } catch (error) {
        console.error("Error downloading or serving PDF:", error.message);
        // Send a beautiful error message as HTML
        res.render(path.join(__dirname + "/../design/errors/download/500"), {error});
      }
    } else {
        res.render(path.join(__dirname + "/../design/errors/download/404"));
    }
  }
);
attachmentController.post(
  "/TumaAttachment",
  isAuthenticated,
  can("upload-attachments"),
  function (req, res) {
    // const formData = {
    //   keyString: req.body.keyString,
    //   trackerId: req.body.trackerId,
    //   attachment: req.body.attachment,
    //   kiambatisho: req.body.kiambatisho,
    // };
    // console.log(formData);
    // sendRequest(req, res, pandishaHatiAPI, "POST", formData, (jsonData) => {
    //   console.log(jsonData);
    //   var { statusCode, message, success } = jsonData;
    //   return res.send({
    //     success,
    //     statusCode,
    //     message,
    //   });
    // });
    
    try {
      const formData = {
        // keyString: req.body.keyString,
        tracking_number: req.body.trackerId,
        staff_id: req.user.id,
        attachments: [
          {
            attachment_type: req.body.attachment,
            attachment_path: req.body.kiambatisho,
          },
        ],
        // kiambatisho: req.body.kiambatisho,
      };
      const token = process.env.FRONT_END_TOKEN;
      console.log("url", pandishaHatiAPI);
      request(
        {
          url: pandishaHatiAPI,
          method: "POST",
          headers: {
            Authorization: "Bearer" + " " + token,
            "Content-Type": "application/json",
          },
          json: formData,
        },
        (error, response, body) => {
          console.log("Code: ", response.statusCode);
          if (error) {
            console.log("error", error);
            return res.status(response.statusCode).send({
              success: false,
              statusCode: 306,
              message: "Kuna tatizo wasiliana na Msimamizi wa mfumo ......",
            });
          }else{
            if (response.statusCode == 200) {
              const { statusCode, message } = body;
              return res.status(response.statusCode).send({
                success: statusCode ? true : false,
                statusCode: statusCode ? 300 : 306,
                message: message
                  ? message
                  : "Kuna shida tafadhali hakiki ukubwa wa faili lako.",
              });
            } else {
              return res.status(response.statusCode).send({
                success: false,
                statusCode: 306,
                message: "Kuna tatizo wasiliana na Msimamizi wa mfumo.",
              });
            }
          }
          
        }
      );
    } catch (error) {
        return res.status(response.statusCode).send({
          success: false,
          statusCode:306,
          message : 'Kuna tatizo wasiliana na Msimamizi wa mfumo.',
        });
    }
  }
);

module.exports = attachmentController;
