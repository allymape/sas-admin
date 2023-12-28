require("dotenv").config();
const express = require("express");
const request = require("request");
const ongezaDahaliaRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var badiliDahalia = API_BASE_URL + "maombi-ongeza-dahalia";
var badiliDahaliaDetalis = API_BASE_URL + "view-badili-dahalia";

// Display
ongezaDahaliaRequestController.get(
  "/KuongezaDahalia",
  isAuthenticated,
  can("view-change-of-hostel"),
  function (req, res) {
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
    };
    sendRequest(
      req,
      res,
      badiliDahalia,
      "POST",
      formData,
      (jsonData) => {
        var message = jsonData.message;
        var statusCode = jsonData.statusCode;
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
        console.log(
          new Date() + " " + req.session.userName + ": /MaombiKusajiliShule"
        );
        res.render(path.join(__dirname + "/../../design/maombi/dahalia"), {
          req: req,
          summary: jsonData.dataSummary,
          maombi: obj,
        });
      }
    );
  }
);

ongezaDahaliaRequestController.get(
  "/BadiliDahalia/:id",
  isAuthenticated,
  can("view-change-of-combinations"),
  function (req, res) {
    var obj = [];
    // console.log(req.params)
    var TrackingNumber = req.params.id;
    sendRequest(
      req,
      res,
      badiliDahaliaDetalis,
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
          var subcategory = data[0].subcategory;
          // var count = jsonData.maoni[0].count;
          var objAttachment = jsonData.objAttachment;
          var objAttachment1 = jsonData.objAttachment1;
          // var objAttachment2 = jsonData.objAttachment2;
          var Maoni = jsonData.Maoni;
        // var maoni = JSON.parse(jsonData.maoni)
        // console.log(attachment_path)
        console.log(new Date() + " " + req.session.userName + ": /BadiliDahalia");
        res.render(path.join(__dirname + "/../../design/maombi/details/view-badili-dahalia"), {
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
        });
      }
    );
  }
);

// BadiliComment in KuongezaMikondoController is handling comments for this module that's why it's not here

module.exports = ongezaDahaliaRequestController;
