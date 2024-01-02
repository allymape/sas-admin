require("dotenv").config();
const express = require("express");
const request = require("request");
const kubadiliJinaRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var badiliJinaShule = API_BASE_URL + "maombi-badili-jina-shule";
var badiliShuleDetails = API_BASE_URL + "view-badili-shule-details";
var badiliJinaReply = API_BASE_URL + "tuma-badili-jina-majibu";


kubadiliJinaRequestController.get(
  "/BadiliJina", 
  isAuthenticated,
  can("view-school-registration-private"),
  function (req, res) {
  var obj = [];
   var formData = {
          //  is_paginated: req.query.is_paginated,
          //  search: req.query.tafuta,
          status: req.query.status,
        };
sendRequest(req, res, badiliJinaShule, "POST", formData, (jsonData) => {
        const {statusCode , dataSummary } = jsonData;
        const data = jsonData.dataList;
        
        console.log(
          new Date() + " " + req.session.userName + ": /BadiliJina"
        );
        res.render(path.join(__dirname + "/../../design/maombi/jina_shule"), {
              req: req,
              summary: dataSummary,
              maombi: data,
        });
});

});

kubadiliJinaRequestController.get(
  "/BadiliShule/:id",
  isAuthenticated,
  can("view-school-registration-private"),
  function (req, res) {
    var obj = [];
    var TrackingNumber = req.params.id;
      sendRequest(req , res , badiliShuleDetails, "POST",{TrackingNumber: TrackingNumber},
        function (jsonData) {
              var message = jsonData.message;
              var statusCode = jsonData.statusCode;
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
              var streamNew = data[0].streamNew;
              var establishId = data[0].establishId;
              var WardName = data[0].WardName;
              var school_name_new = data[0].school_name_new;
              var structure = data[0].structure;
              var subcategory = data[0].subcategory;
              var count = jsonData.maoni[0].count;
              var objAttachment = jsonData.objAttachment;
              var objAttachment1 = jsonData.objAttachment1;
              var objAttachment2 = jsonData.objAttachment2;
              var Maoni = jsonData.Maoni;
              console.log(
                new Date() + " " + req.session.userName + ": /BadiliShule"
              );
              res.render(
                path.join(
                  __dirname + "/../../design/maombi/details/view-badili-shule"
                ),
                {
                  req: req,
                  muda_ombi: remain_days,
                  useLev: req.session.UserLevel,
                  userName: req.session.userName,
                  RoleManage: req.session.RoleManage,
                  userID: req.session.userID,
                  cheoName: req.session.cheoName,
                  created_at: created_at,
                  tracking_number: tracking_number,
                  school_name: school_name,
                  LgaName: LgaName,
                  RegionName: RegionName,
                  RegionNameMtu: RegionNameMtu,
                  fullname: fullname,
                  schoolCategory: schoolCategory,
                  registry: registry,
                  school_name_new: school_name_new,
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
    
  }
);

kubadiliJinaRequestController.post("/BadiliJinaComment",  isAuthenticated, function (req, res) {
  // console.log(req.body)
  var trackerId = req.body.trackerId;
  var from_user = req.session.userID;
  var staff = req.body.staffs;
  var coments = req.body.coments;
  var haliombi = req.body.haliombi;
  var attachment = req.body.attachment;
  var kiambatisho = req.body.kiambatisho;
  var attach_length = req.body.attach_length;
  var school_name_old = req.body.school_name_old;
  var school_name_new = req.body.school_name_new;
  var newstream = req.body.newstream;
  var oldstream = req.body.oldstream;
  var establishId = req.body.establishId;
  var schoolCategoryID = req.body.schoolCategoryID;
  var ombitype = req.body.ombitype;
  var staffDet = staff.split("-");
  var department = staffDet[1];
  var staffs = staffDet[0];
  // console.log(department + " and " + staffs)
    sendRequest(req , res ,badiliJinaReply, "POST",{
          trackerId: trackerId,
          from_user: from_user,
          school_name_new: school_name_new,
          staffs: staffs,
          coments: coments,
          ombitype: ombitype,
          newstream: newstream,
          haliombi: haliombi,
          replyType: 1,
          oldstream: oldstream,
          school_name_old: school_name_old,
          department: department,
          schoolCategoryID: schoolCategoryID,
          establishId: establishId,
        },
      function (jsonData) {
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
            console.log(
              new Date() + " " + req.session.userName + ": /BadiliJinaComment"
            );
            res.send({
              statusCode: statusCode,
              message: message,
              data : data
            });
      }
    );
  
});
module.exports = kubadiliJinaRequestController;

