require("dotenv").config();
const express = require("express");
const request = require("request");
const hamishaRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
// var maousajiliShuleListAPI = API_BASE_URL + "maombi-usajili-shule";
const HamishaShule = API_BASE_URL + "maombi-hamisha-shule";
const hamishaShuleDetails = API_BASE_URL + "view-hamisha-shule-details";
var badiliHReply = API_BASE_URL + "tuma-badili-hamisha";
// Display
hamishaRequestController.get(
  "/Hamisha",
  isAuthenticated,
  can("view-change-school-location"),
  function (req, res) {
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
    };
    sendRequest(req, res, HamishaShule, "POST", formData, (jsonData) => {
      var data = jsonData.dataList;
      const obj = [];
      for (var i = 0; i < data.length; i++) {
        var tracking_number = data[i].tracking_number;
        var user_id = data[i].user_id;
        var LgaName = data[i].LgaName;
        var RegionName = data[i].RegionName;
        var school_name = data[i].school_name;
        var created_at = data[i].created_at;
        var remain_days = data[i].remain_days;
        req.session.TrackingNumber = tracking_number;
        obj.push({
          tracking_number: tracking_number,
          user_id: user_id,
          school_name: school_name,
          LgaName: LgaName,
          RegionName: RegionName,
          created_at: created_at,
          remain_days: remain_days,
        });
      }
      console.log(new Date() + " " + req.session.userName + ": /BadiliJina");
      res.render(path.join(__dirname + "/../../design/maombi/hamisha_shule"), {
        req: req,
        summary: jsonData.dataSummary,
        maombi: obj,
      });
    });
  }
);


hamishaRequestController.get(
  "/HamishaShuleDetails/:id",
  isAuthenticated,
  can("view-change-school-location"),
  function (req, res) {
    var obj = [];
    var TrackingNumber = req.params.id; 
        sendRequest(req, res, hamishaShuleDetails, "POST", {TrackingNumber: TrackingNumber}, (jsonData) => {
            var data = jsonData.data;
              var remain_days = data[0].remain_days;
              var created_at = data[0].created_at;
              var tracking_number = data[0].tracking_number;
              var school_name = data[0].school_name;
              var LgaName = data[0].LgaName;
              var registryTypeId = data[0].registry_type_id;
              var WardNameMtu = data[0].WardNameMtu;
              var LgaNameMtu = data[0].LgaNameMtu;
              var RegionName = data[0].RegionName;
              var WardNameNew = data[0].WardNameNew;
              var LgaNameNew = data[0].LgaNameNew;
              var RegionNameNew = data[0].RegionNameNew;
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
              var streamOld = data[0].streamOld;
              var WardIdNew = data[0].WardIdNew;
              var WardIdOld = data[0].WardIdOld;
              var streamNew = data[0].streamNew;
              var establishId = data[0].establishId;
              var WardName = data[0].WardName;
              var school_name_new = data[0].school_name_new;
              var structure = data[0].structure;
              var subcategory = data[0].subcategory;
              var count = "";
              var objAttachment = jsonData.objAttachment;
              var objAttachment1 = jsonData.objAttachment1;
              var objAttachment2 = jsonData.objAttachment2;
              var Maoni = jsonData.Maoni;
              console.log(
                new Date() + " " + req.session.userName + ": /BadiliShule"
              );
              res.render(
                path.join(
                  __dirname + "/../../design/maombi/details/view-hamisha-shule"
                ),
                {
                  req: req,
                  muda_ombi: remain_days,
                  created_at: created_at,
                  tracking_number: tracking_number,
                  school_name: school_name,
                  LgaName: LgaName,
                  WardNameNew: WardNameNew,
                  RegionName: RegionName,
                  RegionNameMtu: RegionNameMtu,
                  LgaNameNew: LgaNameNew,
                  fullname: fullname,
                  schoolCategory: schoolCategory,
                  RegionNameNew: RegionNameNew,
                  registry: registry,
                  school_name_new: school_name_new,
                  WardIdNew: WardIdNew,
                  WardIdOld: WardIdOld,
                  occupation: occupation,
                  mwombajiAddress: mwombajiAddress,
                  registryTypeId: registryTypeId,
                  mwombajiPhoneNo: mwombajiPhoneNo,
                  baruaPepe: baruaPepe,
                  streamNew: streamNew,
                  streamOld: streamOld,
                  language: language,
                  school_size: school_size,
                  userLevel: req.user.cheo,
                  area: area,
                  WardName: WardName,
                  structure: structure,
                  establishId: establishId,
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
      );
   
});

hamishaRequestController.post("/HamishaComment", function (req, res) {
  console.log(req.body);
  var trackerId = req.body.trackerId;
  var from_user = req.session.userID;
  var staff = req.body.staffs;
  var coments = req.body.coments;
  var haliombi = req.body.haliombi;
  var attachment = req.body.attachment;
  var kiambatisho = req.body.kiambatisho;
  var attach_length = req.body.attach_length;
  var newstream = req.body.newstream;
  var oldstream = req.body.oldstream;
  var establishId = req.body.establishId;
  var schoolCategoryID = req.body.schoolCategoryID;
  var ombitype = req.body.ombitype;
  var staffDet = staff.split("-");
  var department = staffDet[1];
  var staffs = staffDet[0];
  // console.log(department + " and " + staffs)
    sendRequest(req, res , badiliHReply , "POST" , {
          trackerId: trackerId,
          from_user: from_user,
          staffs: staffs,
          coments: coments,
          ombitype: ombitype,
          newstream: newstream,
          haliombi: haliombi,
          replyType: 1,
          oldstream: oldstream,
          department: department,
          schoolCategoryID: schoolCategoryID,
          establishId: establishId,
        },
      function (jsonData) {
        const {statusCode, message } = jsonData;
          console.log(
            new Date() + " " + req.session.userName + ": /HamishaComment ..."
          );
          res.send({
            statusCode: statusCode,
            message: message,
          });
      });    
});
module.exports = hamishaRequestController;
