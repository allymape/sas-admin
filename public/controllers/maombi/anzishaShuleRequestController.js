require("dotenv").config();
const express = require("express");
const request = require("request");
const anzishaShuleRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
// const { sendRequest, isAuthenticated, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
const requestSummariesAPI = API_BASE_URL + "request_summaries";
var maoanzishaShuleListAPI = API_BASE_URL +"maombi-kuanzisha-shule";
var ombiDetails = API_BASE_URL + "view-ombi-details";
var ombiReply = API_BASE_URL + "tuma-ombi-majibu";

// Display
anzishaShuleRequestController.get(
  "/MaombiKuanzishaShule",
  isAuthenticated,
  can("view-initiate-schools"),
  function (req, res) {
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
    };
    sendRequest(req, res, requestSummariesAPI+"/1", "GET", formData, (jsonData) => {
      const { dataSummary } = jsonData;
      res.render(path.join(__dirname + "/../../design/maombi/kuanzishashule"), {
        req: req,
        summary: dataSummary,
      });
    });
  }
);

// List
anzishaShuleRequestController.get("/MaombiKuanzishaShuleList", isAuthenticated , 
(req, res) => {
      sendRequest(req, res, maoanzishaShuleListAPI , 'POST' , {} , (jsonData) => {
        const {message , statusCode , data} = jsonData
        console.log(data);
          res.send({
            message,
            statusCode,
            data
          });
      });
});

anzishaShuleRequestController.get("/TaarifaOmbi/:id", isAuthenticated, function (req, res) {
       var TrackingNumber = req.params.id;
        sendRequest(req, res, ombiDetails , 'POST' , {TrackingNumber: TrackingNumber} , (jsonData) => {
                    if (jsonData.error) {
                      console.log(
                        new Date() +
                          ": fail to MaombiKuanzishaShuleJumla " +
                          error
                      );
                      res.send("failed");
                    }

                    if (jsonData !== undefined) {
                      // var jsonData = JSON.parse(body)
                      // var jsonData = body;

                      // console.log(jsonData)
                      var message = jsonData.message;
                      var statusCode = jsonData.statusCode;
                      var data = jsonData.data;
                      if (statusCode == 300) {
                        var remain_days = data[0].remain_days;
                        var created_at = data[0].created_at;
                        var tracking_number = data[0].tracking_number;
                        var school_name = data[0].school_name;
                        var LgaName = data[0].LgaName;
                        var registryTypeId = data[0].registry_type_id;
                        var WardNameMtu = data[0].WardNameMtu;
                        var LgaNameMtu = data[0].LgaNameMtu;
                        var RegionName = data[0].RegionName;
                        var RegionNameMtu = data[0].RegionNameMtu;
                        var fullname = data[0].fullname;
                        var schoolCategory = data[0].schoolCategory;
                        var registry = data[0].registry;
                        var occupation = data[0].occupation;
                        var mwombajiAddress = data[0].mwombajiAddress;
                        var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
                        var baruaPepe = data[0].baruaPepe;
                        var language = data[0].language;
                        var school_size = data[0].school_size;
                        var area = data[0].area;
                        var WardName = data[0].WardName;
                        var structure = data[0].structure;
                        var subcategory = data[0].subcategory;
                        var count = jsonData.maoni[0].count;
                        var objAttachment = jsonData.objAttachment;
                        var objAttachment1 = jsonData.objAttachment1;
                        var objAttachment2 = jsonData.objAttachment2;
                        var Maoni = jsonData.Maoni;
                        console.log(
                          new Date() +
                            " " +
                            req.session.userName +
                            ": /TaarifaOmbi"
                        );
                        res.render(
                          path.join(
                            __dirname +
                              "/../../design/maombi/details/view-ombi-details"
                          ),
                          {
                            req: req,
                            muda_ombi: remain_days,
                            // useLev: req.session.UserLevel,
                            // userName: req.session.userName,
                            // RoleManage: req.session.RoleManage,
                            // userID: req.session.userID,
                            // cheoName: req.session.cheoName,
                            created_at: created_at,
                            tracking_number: tracking_number,
                            school_name: school_name,
                            LgaName: LgaName,
                            RegionName: RegionName,
                            RegionNameMtu: RegionNameMtu,
                            fullname: fullname,
                            schoolCategory: schoolCategory,
                            registry: registry,
                            occupation: occupation,
                            mwombajiAddress: mwombajiAddress,
                            registryTypeId: registryTypeId,
                            mwombajiPhoneNo: mwombajiPhoneNo,
                            baruaPepe: baruaPepe,
                            language: language,
                            school_size: school_size,
                            userLevel: req.user.cheo,
                            area: area,
                            WardName: WardName,
                            structure: structure,
                            LgaNameMtu: LgaNameMtu,
                            WardNameMtu: WardNameMtu,
                            subcategory: subcategory,
                            count: count,
                            staffs: jsonData.staffs,
                            status: jsonData.status,
                            objAttachment: objAttachment,
                            objAttachment1: objAttachment1,
                            Maoni: Maoni,
                            objAttachment2: objAttachment2,
                          }
                        );
                      }
                      if (statusCode == 209) {
                        res.redirect("/");
                      }
                    }
                        
                  });
});

anzishaShuleRequestController.post("/TumaComment", isAuthenticated ,function (req, res) {
  // console.log(req.body);
  var trackerId = req.body.trackerId;
  var from_user = req.session.userID;
  var staff = req.body.staffs;
  var coments = req.body.coments;
  var haliombi = req.body.haliombi;
  var attachment = req.body.attachment;
  var kiambatisho = req.body.kiambatisho;
  var attach_length = req.body.attach_length;
  var schoolCategoryID = req.body.schoolCategoryID;
  var ombitype = req.body.ombitype;
  var staffDet = staff.split("-");
  var department = staffDet[1];
  var staffs = staffDet[0];

  // return;
  // console.log(department + " and " + staffs)
        sendRequest(req , res , ombiReply , "POST" , 
         {
          trackerId: trackerId,
          from_user: from_user,
          staffs: staffs,
          coments: coments,
          ombitype: ombitype,
          haliombi: haliombi,
          replyType: 1,
          department: department,
          schoolCategoryID: schoolCategoryID
        } , (jsonData) => {
          const {statusCode , message } = jsonData;
          // var data = jsonData.data;
          console.log(
            new Date() + " " + req.session.userName + ": /TumaComment"
          );
          res.send({
            statusCode : statusCode,
            message : message
          })
      });
  
});

module.exports = anzishaShuleRequestController;
