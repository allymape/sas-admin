require("dotenv").config();
const express = require("express");
const request = require("request");
const kubadiliUsajiliRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var badiliAinaUsajili = API_BASE_URL + "maombi-badili-aina-usajili";
var usajiliDetails = API_BASE_URL + "view-aina-usajili-details";
var badiliainaReply = API_BASE_URL + "tuma-badili-aina-majibu";
// Display
kubadiliUsajiliRequestController.get(
  "/BadiliUsajili",
  isAuthenticated,
  can("view-change-registration-type"),
  function (req, res) {
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
    };
    sendRequest(req, res, badiliAinaUsajili, "POST", formData, (jsonData) => {
      var data = jsonData.dataList;
      console.log(jsonData.dataList);
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

      res.render(path.join(__dirname + "/../../design/maombi/aina_usajili"), {
        req: req,
        total_month: jsonData.dataSummary,
        maombi: obj,
        // useLev: req.session.UserLevel,
        // userName: req.session.userName,
        // RoleManage: req.session.RoleManage,
        // userID: req.session.userID,
        // cheoName: req.session.cheoName,
      });
    });
  }
);

kubadiliUsajiliRequestController.get(
  "/BadiliAinaUsajili/:id",
  isAuthenticated,
  can("view-change-registration-type"),
  function (req, res) {
    var obj = [];
    var TrackingNumber = req.params.id;
          sendRequest(
            req,
            res,
            usajiliDetails,
            "POST",
            { TrackingNumber: TrackingNumber },
            (jsonData) => {
            var data = jsonData.data;
            var remain_days = data[0].remain_days;
            var created_at = data[0].created_at;
            var tracking_number = data[0].tracking_number;
            var school_name = data[0].school_name;
            var LgaName = data[0].LgaName;
            var registration_number = data[0].registration_number;
            var registryTypeId = data[0].registry_type_id;
            var school_category_id_old = data[0].school_category_id_old;
            var school_category_id_new = data[0].school_category_id_new;
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
            var schoolCategoryNew = data[0].schoolCategoryNew;
            var establishId = data[0].establishId;
            var WardName = data[0].WardName;
            var structure = data[0].structure;
            var subcategory = data[0].subcategory;
            var count = jsonData.maoni[0].count;
            var objAttachment = jsonData.objAttachment;
            var objAttachment1 = jsonData.objAttachment1;
            var objAttachment2 = jsonData.objAttachment2;
            var Maoni = jsonData.Maoni;
            console.log(
              new Date() + " " + req.session.userName + ": /BadiliAinaUsajili"
            );
            res.render(
              path.join(
                __dirname +
                  "/../../design/maombi/details/view-badili-aina-usajili"
              ),
              {
                req: req,
                muda_ombi: remain_days,
                useLev: req.session.UserLevel,
                UserLevel: req.user.cheo,
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
                school_category_id_old: school_category_id_old,
                occupation: occupation,
                mwombajiAddress: mwombajiAddress,
                registration_number: registration_number,
                registryTypeId: registryTypeId,
                school_category_id_new: school_category_id_new,
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
                schoolCategoryNew: schoolCategoryNew,
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
            });
});


kubadiliUsajiliRequestController.post(
  "/BadiliAinaComment",
  isAuthenticated,
  function (req, res) {
    // console.log(req.body)
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
    var registration_number = req.body.registration_number;
    var school_category_id_old = req.body.school_category_id_old;
    var school_category_id_new = req.body.school_category_id_new;
    var staffDet = staff.split("-");
    var department = staffDet[1];
    var staffs = staffDet[0];
    // console.log(department + " and " + staffs)

    sendRequest(
      req,
      res,
      badiliainaReply,
      "POST",
      {
        trackerId: trackerId,
        from_user: from_user,
        school_category_id_new: school_category_id_new,
        staffs: staffs,
        coments: coments,
        ombitype: ombitype,
        newstream: newstream,
        registration_number: registration_number,
        haliombi: haliombi,
        replyType: 1,
        oldstream: oldstream,
        school_category_id_old: school_category_id_old,
        department: department,
        schoolCategoryID: schoolCategoryID,
        establishId: establishId,
      },
      function (jsonData) {
        var message = jsonData.message;
        var statusCode = jsonData.statusCode;
        console.log(
          new Date() + " " + req.session.userName + ": /BadiliAinaComment"
        );
        res.send({
          statusCode: statusCode,
          message: message,
        });
      }
    );
  }
);

module.exports = kubadiliUsajiliRequestController;
