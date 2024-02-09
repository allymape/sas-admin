require("dotenv").config();
const express = require("express");
const request = require("request");
const kuongezaTahasusiRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const requestIp = require("request-ip");
const { isAuthenticated, sendRequest, can, modifiedUrl } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var badiliTahasusi = API_BASE_URL + "maombi-badili-tahasusi";
var ongezatahasusiDetails = API_BASE_URL + "view-ongeza-tahasusi-details";
var ongezaReply = API_BASE_URL + "tuma-ongeza-tahasusi";
// Display

kuongezaTahasusiRequestController.get(
  "/KuongezaTahasusi",
  isAuthenticated,
  can("view-school-registration-private"),
  function (req, res) {
    var obj = [];
    const per_page = Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const formData = {
      page,
      per_page,
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
      status: req.query.status,
    };

    sendRequest(req, res, badiliTahasusi, "POST", formData, (jsonData) => {
      var message = jsonData.message;
      var statusCode = jsonData.statusCode;
      var data = jsonData.dataList;
      const {numRows} = jsonData
      // console.log(data, statusCode);

      var dataSummary = jsonData.dataSummary;
      if (statusCode == 300) {
        console.log(
          new Date() + " " + req.session.userName + ": /KuongezaTahasusi"
        );
        res.render(path.join(__dirname + "/../../design/maombi/tahasusi"), {
          req: req,
          summary: dataSummary,
          maombi: data,
          pagination: {
            total: Number(numRows),
            current: Number(page),
            per_page: Number(per_page),
            url: modifiedUrl(req),
            pages: Math.ceil(Number(numRows) / Number(per_page)),
          },
        });
      }
      if (statusCode == 209) {
        res.redirect("/");
      }
    });
  }
);

kuongezaTahasusiRequestController.get(
  "/BadiliTahasusi/:id",
  isAuthenticated,
  can("view-school-registration-private"),
  function (req, res) {
    var obj = [];
    var TrackingNumber = req.params.id;
    console.log(TrackingNumber);
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
      browser_used: req.session.browser_used,
      ip_address: req.session.ip_address,
      TrackingNumber: TrackingNumber,
      userLevel: req.session.UserLevel,
      office: req.session.office,
    };
    sendRequest(
      req,
      res,
      ongezatahasusiDetails,
      "POST",
      formData,
      (jsonData) => {
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
          var school_id = data[0].school_id;
          var establishId = data[0].establishId;
          var WardName = data[0].WardName;
          var structure = data[0].structure;
          var subcategory = data[0].subcategory;
          var is_approved = data[0].is_approved;
          // var count = jsonData.maoni[0].count;
          var objAttachment = jsonData.objAttachment;
          var objAttachment1 = jsonData.objAttachment1;
          // var objAttachment2 = jsonData.objAttachment2;
          // console.log(objAttachment)
          var Maoni = jsonData.Maoni;
          // console.log(new Date() + " " + req.session.userName +  ": /BadiliMkondo")
          console.info(
            new Date() +
              ": " +
              req.session.userName +
              " with IP: " +
              requestIp.getClientIp(req) +
              " view details of change Tahasusi application with TrackingNumber " +
              TrackingNumber
          );
          res.render(
            path.join(
              __dirname + "/../../design/maombi/details/view_ongeza_tahasusi"
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
              streamNew: streamNew,
              streamOld: streamOld,
              language: language,
              school_size: school_size,
              userLevel: req.user.cheo,
              area: area,
              WardName: WardName,
              structure: structure,
              establishId: school_id,
              LgaNameMtu: LgaNameMtu,
              WardNameMtu: WardNameMtu,
              school_id: school_id,
              subcategory: subcategory,
              count: 0,
              staffs: jsonData.staffs,
              status: jsonData.status,
              objAttachment: objAttachment,
              objAttachment1: objAttachment1,
              Maoni: Maoni,
              commentUrl: "/KuongezaTahasusiComment",
              commentRedirectUrl: "/KuongezaTahasusi",
            }
          );
        
      }
    );
  }
);

kuongezaTahasusiRequestController.post(
  "/KuongezaTahasusiComment",
  isAuthenticated,
  can("create-comments"),
  function (req, res) {
    console.log(req.body)
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
    sendRequest(
      req,
      res,
      ongezaReply,
      "POST",
      {
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
        const { statusCode, message } = jsonData;
        // var data = jsonData.data;
        console.log(
          new Date() + " " + req.session.userName + ": /OngezaComment"
        );
        res.send({
          statusCode: statusCode,
          message: message,
        });
      }
    );
  }
);

module.exports = kuongezaTahasusiRequestController;
