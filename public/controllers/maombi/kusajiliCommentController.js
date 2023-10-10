require("dotenv").config();
const express = require("express");
const request = require("request");
const kusajiliCommentController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const sajiliReply = API_BASE_URL + "tuma-sajili-majibu";

// original
kusajiliCommentController.post("/SajiliComment", isAuthenticated, function (req, res) {
  // console.log(req.body)
  var trackerId = req.body.trackerId;
  var from_user = req.session.userID;
  var staff = req.body.staffs;
  var coments = req.body.coments;
  var haliombi = req.body.haliombi;
  var attachment = req.body.attachment;
  var kiambatisho = req.body.kiambatisho;
  var schoolCategoryID = req.body.schoolCategoryID;
  var ombitype = req.body.ombitype;
  var staffDet = staff.split("-");
  var department = staffDet[1];
  var staffs = staffDet[0];
  // console.log(department + " and " + staffs)
     sendRequest(
      req,
      res,
      sajiliReply,
      "POST",
      {
          trackerId: trackerId,
          from_user: from_user,
          staffs: staffs,
          coments: coments,
          ombitype: ombitype,
          haliombi: haliombi,
          replyType: 1,
          department: department,
          schoolCategoryID: schoolCategoryID,
      },
      (jsonData) => {
       const { error, statusCode, message } = jsonData;
       // var data = jsonData.data;
         console.log(
           new Date() + " " + req.session.userName + ": /SajiliComment"
         );
         res.send({
          statusCode : statusCode,
          message : message
         });
      
      }
    );
 
});

module.exports = kusajiliCommentController;
