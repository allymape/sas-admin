require("dotenv").config();
const express = require("express");
const request = require("request");
const futaShuleRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, modifiedUrl } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const futaShuleHiari = API_BASE_URL + "maombi-futa-shule";
var ombiFutaDetails = API_BASE_URL + "view-ombi-futa-details";
var futaReply = API_BASE_URL + "futa-sajili";
// Display
futaShuleRequestController.get(
  "/FutaShule",
  isAuthenticated,
  can("view-deregistration-of-schools"),
  function (req, res) {
  const per_page = Number(req.query.per_page || 10);
  const page = Number(req.query.page || 1);
  const formData = {
    page,
    per_page,
    //  is_paginated: req.query.is_paginated,
    //  search: req.query.tafuta,
    status: req.query.status,
  };
    sendRequest(req, res, futaShuleHiari, "POST", formData, (jsonData) => {
      const data = jsonData.dataList;
      const {numRows} = jsonData
      const obj = [];
      for (var i = 0; i < data.length; i++) {
        var tracking_number = data[i].tracking_number;
        var user_id = data[i].user_id;
        var LgaName = data[i].LgaName;
        var RegionName = data[i].RegionName;
        var school_name = data[i].school_name;
        var created_at = data[i].created_at;
        var remain_days = data[i].remain_days;
        var schoolId = data[i].schoolId;
        var folio = data[i].folio;
        var is_approved = data[i].is_approved;
        req.session.TrackingNumber = tracking_number;
        obj.push({
          schoolId: schoolId,
          tracking_number: tracking_number,
          user_id: user_id,
          school_name: school_name,
          LgaName: LgaName,
          RegionName: RegionName,
          created_at: created_at,
          remain_days: remain_days,
          folio,
          is_approved
        });
      }
      console.log(new Date() + " " + req.session.userName + ": /BadiliJina");
      res.render(path.join(__dirname + "/../../design/maombi/futa_shule"), {
        req: req,
        summary: jsonData.dataSummary,
        maombi: obj,
        pagination: {
          total: Number(numRows),
          current: Number(page),
          per_page: Number(per_page),
          url: modifiedUrl(req),
          pages: Math.ceil(Number(numRows) / Number(per_page)),
        },
      });
    });
  }
);

futaShuleRequestController.get("/FutaShuleTaarifa/:id", isAuthenticated, function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
      sendRequest(req, res, ombiFutaDetails, "POST", {TrackingNumber: TrackingNumber}, (jsonData) => {
          var data = jsonData.data;
            var remain_days = data[0].remain_days;
            var created_at = data[0].created_at;
            var is_approved = data[0].is_approved;
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
            var schoolId = data[0].schoolId;
            var WardName = data[0].WardName;
            var structure = data[0].structure;
            var subcategory = data[0].subcategory;
            var count = "";
            var objAttachment = jsonData.objAttachment;
            var objAttachment1 = jsonData.objAttachment1;
            var objAttachment2 = jsonData.objAttachment2;
            var Maoni = jsonData.Maoni;
            // console.log(jsonData.staffs)
            console.log(
              new Date() + " " + req.session.userName + ": /TaarifaOmbi"
            );
            res.render(
              path.join(
                __dirname +
                  "/../../design/maombi/details/view-ombi-futa-details"
              ),
              {
                req: req,
                is_approved,
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
                occupation: occupation,
                mwombajiAddress: mwombajiAddress,
                registryTypeId: registryTypeId,
                mwombajiPhoneNo: mwombajiPhoneNo,
                baruaPepe: baruaPepe,
                schoolId: schoolId,
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
                commentUrl: "/FutaComment",
                commentRedirectUrl: "/FutaShule",
              }
            );
          
      }
    );
  
});

futaShuleRequestController.post(
  "/FutaComment",
  isAuthenticated,
  can("create-comments"),
  function (req, res) {
    // console.log(req.body)
    var trackerId = req.body.trackerId;
    var from_user = req.session.userID;
    var staff = req.body.staffs;
    var coments = req.body.coments;
    var haliombi = req.body.haliombi;
    var attachment = req.body.attachment;
    var kiambatisho = req.body.kiambatisho;
    var schoolCategoryID = req.body.schoolCategoryID;
    var schoolId = req.body.schoolId;
    var ombitype = req.body.ombitype;
    var staffDet = staff.split("-");
    var department = staffDet[1];
    var staffs = staffDet[0];
    // console.log(department + " and " + staffs)

    sendRequest(
      req,
      res,
      futaReply,
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
        schoolId: schoolId,
      },
      (jsonData) => {
        const { statusCode, message } = jsonData;
        console.log(
          new Date() + " " + req.session.userName + ": /FutaComment ..."
        );
        res.send({
          statusCode: statusCode,
          message: message,
        });
      }
    );
  }
);


module.exports = futaShuleRequestController;

