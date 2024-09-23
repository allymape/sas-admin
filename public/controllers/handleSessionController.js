require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const handleSessionController = express.Router();
const { isAuthenticated, sendRequest } = require("../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const refreshTokenApi = API_BASE_URL + "refresh_token";

// Check Session
handleSessionController.post(
  "/CheckSessionExpire",
  isAuthenticated,
  function (req, res) {
    const sessionToken = req.session.Token;
    const bodyToken = req.body.token;
    const authorization = "Bearer" + " " + (sessionToken || bodyToken);
    // req.session.previousUrl = req.originalUrl;
    if (authorization) {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || "the-super-strong-secrect",
        (err, decode) => {
          if (err) console.log(err);
          const { exp } = decode;
          const timestamp = Math.round(Date.now() / 1000, 0);
          const remain_seconds = exp - timestamp;
          res.send({
            remain_seconds,
          });
        }
      );
    }
  }
);

handleSessionController.post(
  "/ExtendSession",
  isAuthenticated,
  function (req, res) {
    sendRequest(req, res, refreshTokenApi, "POST", {}, (jsonData) => {
      const { statusCode, token } = jsonData;
      if (statusCode == 300) {
        if (token) req.session.Token = token;
      }
      res.send({
        statusCode,
        message:
          statusCode == 300
            ? "Session extended successfully"
            : "Unable to extend session",
      });
    });
  }
);
module.exports = handleSessionController;
