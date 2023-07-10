require("dotenv").config();
const express = require("express");
const path = require('path');
const errorController = express.Router();


errorController.get("/403" , (req , res , next) => {
    const statusCode = 503;
    let message = "Hauna ruhusa ya kuingia ukurasa huu.";
    let title = "Error " + statusCode;
    if (
      typeof req.session.userName !== "undefined" ||
      req.session.userName === true
    ) {
      res
        .status(statusCode)
        .render(path.join(__dirname + "/../design/errors/auth/error"), {
          req: req,
          title: title,
          statusCode: statusCode,
          message: message,
          useLev: req.session.UserLevel,
          userName: req.session.userName,
          RoleManage: req.session.RoleManage,
          userID: req.session.userID,
          cheoName: req.session.cheoName,
        });
    } else {
      res
        .status(statusCode)
        .render(path.join(__dirname + "/../design/errors/guest/error"), {
          title: title,
          statusCode: statusCode,
          message: message,
        });
    }
});
// Error handling of different status code
errorController.use((req, res,next) => {
    let message = '';
    const statusCode = res.statusCode == 200 ? 404 : res.statusCode;
    let title = statusCode;
    switch (statusCode) {
      case 403:
        message = "Hauna ruhusa ya kuingia ukurasa huu.";
        title = "Error " + title;
        break;
      case 404:
        message = "Ukurasa Haujapatikana.";
        title = "Error " + title;
        break;
      case 429:
        message = "Umetuma maombi mengi.";
        title = "Error " + title;
        break;
      case 503:
        message =
          "Mfumo tunaufanyia marekebisho. Tafadhali jaribu tena baadae.";
        title = "Error " + title;
        break;
      default:
        message = "Kuna tatizo kwenye mfumo.";
        title = "Error " + title;
        break;
    }
    if (
      typeof req.session.userName !== "undefined" ||
      req.session.userName === true
    ) {
      res.status(statusCode).render(path.join(__dirname + "/../design/errors/auth/error"), {
            req: req,
            title: title,
            statusCode: statusCode,
            message : message,
            useLev: req.session.UserLevel,
            userName: req.session.userName,
            RoleManage: req.session.RoleManage,
            userID: req.session.userID,
            cheoName: req.session.cheoName,
      });
    } else {
      res.status(statusCode).render(path.join(__dirname + "/../design/errors/guest/error"), {
        title: title,
        statusCode: statusCode,
        message: message,
      });
    }
    
});
module.exports = errorController;
