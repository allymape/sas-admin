require("dotenv").config();
const express = require("express");
const request = require("request");
const kuongezaMikondoRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, modifiedUrl, activeHandover } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var badiliMkondo = API_BASE_URL + "maombi-badili-mkondo";
var badiliDetails = API_BASE_URL + "view-badili-details";
var badiliReply = API_BASE_URL + "tuma-badili-mikondo";
// Display
kuongezaMikondoRequestController.get(
  "/KuongezaMikondo",
  isAuthenticated,
  can("view-school-registration-private"),
  activeHandover,
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
    sendRequest(req, res, badiliMkondo, "POST", formData, (jsonData) => {
      var message = jsonData.message;
      var statusCode = jsonData.statusCode;
      var data = jsonData.dataList;
      var dataSummary = jsonData.dataSummary;
      const { numRows } = jsonData;
      for (var i = 0; i < data.length; i++) {
        var tracking_number = data[i].tracking_number;
        var user_id = data[i].user_id;
        var LgaName = data[i].LgaName;
        var RegionName = data[i].RegionName;
        var school_name = data[i].school_name;
        var created_at = data[i].created_at;
        var remain_days = data[i].remain_days;
        var folio = data[i].folio;
        var is_approved = data[i].is_approved;
        req.session.TrackingNumber = tracking_number;
        obj.push({
          tracking_number: tracking_number,
          user_id: user_id,
          school_name: school_name,
          LgaName: LgaName,
          RegionName: RegionName,
          created_at: created_at,
          remain_days: remain_days,
          folio,
          is_approved,
        });
      }
      console.log(new Date() + " " + req.session.userName + ": /MaombiMikondo");
      res.render(path.join(__dirname + "/../../design/maombi/mikondo"), {
        req: req,
        summary: dataSummary,
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

kuongezaMikondoRequestController.get(
  "/BadiliMkondo/:id",
  isAuthenticated,
  can("view-school-registration-private"),
  activeHandover,
  function (req, res) {
    var obj = [];
    var TrackingNumber = req.params.id;
    sendRequest(
      req,
      res,
      badiliDetails,
      "POST",
      { TrackingNumber: TrackingNumber },
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
        var establishId = data[0].establishId;
        var WardName = data[0].WardName;
        var structure = data[0].structure;
        var is_approved = data[0].is_approved;
        var subcategory = data[0].subcategory;
        // var count = jsonData.maoni[0].count;
        var objAttachment = jsonData.objAttachment;
        var objAttachment1 = jsonData.objAttachment1;
        // var objAttachment2 = jsonData.objAttachment2;
        console.log(objAttachment);
        var Maoni = jsonData.Maoni;
        console.log(
          new Date() + " " + req.session.userName + ": /BadiliMkondo"
        );
        res.render(
          path.join(
            __dirname + "/../../design/maombi/details/view-badili-ombi"
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
            occupation: occupation,
            mwombajiAddress: mwombajiAddress,
            registryTypeId: registryTypeId,
            mwombajiPhoneNo: mwombajiPhoneNo,
            baruaPepe: baruaPepe,
            streamNew: streamNew,
            streamOld: streamOld,
            language: language,
            is_approved,
            school_size: school_size,
            userLevel: req.user.cheo,
            area: area,
            WardName: WardName,
            structure: structure,
            establishId: establishId,
            LgaNameMtu: LgaNameMtu,
            WardNameMtu: WardNameMtu,
            subcategory: subcategory,
            count: 0,
            staffs: jsonData.staffs,
            status: jsonData.status,
            objAttachment: objAttachment,
            objAttachment1: objAttachment1,
            Maoni: Maoni,
            commentUrl: "/KuongezaMikondoComment",
            commentRedirectUrl: "/KuongezaMikondo",
          }
        );
      }
    );
  }
);

kuongezaMikondoRequestController.post(
  "/KuongezaMikondoComment",
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
      badiliReply,
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
        var message = jsonData.message;
        var statusCode = jsonData.statusCode;
        var data = jsonData.data;
        console.log(
          new Date() + " " + req.session.userName + ": /BadiliComment"
        );
        res.send({
          statusCode: statusCode,
          message: message,
          data: data,
        });
      }
    );
  }
);

module.exports = kuongezaMikondoRequestController;
