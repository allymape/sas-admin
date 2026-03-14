require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const handleSessionController = express.Router();
const { isAuthenticated, refreshToken } = require("../../util");

// Check Session
handleSessionController.post(
  "/CheckSessionExpire",
  isAuthenticated,
  function (req, res) {
    const sessionToken = req.session.Token;
    const bodyToken = req.body.token;
    const token = sessionToken || bodyToken;
    const authorization = token ? "Bearer" + " " + token : null;
    // req.session.previousUrl = req.originalUrl;
    if (authorization) {
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || "the-super-strong-secrect",
        (err, decode) => {
          if (err || !decode) {
            return res.send({
              remain_seconds: 0,
              statusCode: 402,
              message: "Token is expired",
            });
          }
          const { exp } = decode;
          const timestamp = Math.round(Date.now() / 1000, 0);
          const remain_seconds = exp - timestamp;
          res.send({
            remain_seconds,
            statusCode: 300,
          });
        }
      );
    } else {
      res.send({
        remain_seconds: 0,
        statusCode: 401,
        message: "No session token",
      });
    }
  }
);

handleSessionController.post(
  "/ExtendSession",
  isAuthenticated,
  function (req, res) {
    refreshToken(req, res, (result) => {
      const { statusCode } = result;
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
