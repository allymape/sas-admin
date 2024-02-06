require("dotenv").config();
const express = require("express");
const request = require("request");
const badiliMenejaRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, modifiedUrl } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const maobadilimenejaShuleListAPI = API_BASE_URL + "maombi-badili-meneja-shule";
var badiliMenejaDetails = API_BASE_URL + "view-ombi-badili-meneja-details";
var menejaReply = API_BASE_URL + "tuma-meneja-majibu";
// Display
badiliMenejaRequestController.get(
  "/BadiliMeneja",
  isAuthenticated,
  can("view-change-of-school-manager"),
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
    sendRequest(
      req,
      res,
      maobadilimenejaShuleListAPI,
      "POST",
      formData,
      (jsonData) => {
        const data = jsonData.dataList;
        const {numRows} = jsonData
        const obj = [];
        // for (var i = 0; i < data.length; i++) {
        //   var tracking_number = data[i].tracking_number;
        //   var user_id = data[i].user_id;
        //   var LgaName = data[i].LgaName;
        //   var RegionName = data[i].RegionName;
        //   var school_name = data[i].school_name;
        //   var WardName = data[i].WardName;
        //   var owner_name = data[i].owner_name;
        //   var created_at = data[i].created_at;
        //   var remain_days = data[i].remain_days;
        //   var folio = data[i].folio;
        //   req.session.TrackingNumber = tracking_number;
        //   obj.push({
        //     tracking_number: tracking_number,
        //     user_id: user_id,
        //     WardName: WardName,
        //     school_name: school_name,
        //     LgaName: LgaName,
        //     owner_name: owner_name,
        //     RegionName: RegionName,
        //     created_at: created_at,
        //     remain_days: remain_days,
        //     folio
        //   });
        // }
        console.log(
          new Date() + " " + req.session.userName + ": /BadiliMmiliki"
        );
        res.render(
          path.join(__dirname + "/../../design/maombi/badili_meneja"),
          {
            req: req,
            summary: jsonData.dataSummary,
            maombi: data,
            pagination: {
              total: Number(numRows),
              current: Number(page),
              per_page: Number(per_page),
              url: modifiedUrl(req),
              pages: Math.ceil(Number(numRows) / Number(per_page)),
            },
          }
        );
      }
    );
  }
);

badiliMenejaRequestController.get(
  "/ViewOmbiMeneja/:id",
  isAuthenticated,
  can("view-change-of-school-manager"),
  function (req, res) {
    var obj = [];
    console.log(req.params);
    var TrackingNumber = req.params.id;
    // console.log("TrackingNumber")
    // console.log(TrackingNumber)
      sendRequest(
        req,
        res,
        badiliMenejaDetails,
        "POST",
        { TrackingNumber: TrackingNumber,},
      (jsonData) => {
              var data = jsonData.data;
              var manager_full_name = data[0].manager_full_name
              var former_manager_full_name = data[0].former_manager_full_name
              var manager_phone_no = data[0].manager_phone_no;
              var manager_email = data[0].manager_email;
              var manager_cv = data[0].manager_cv;
              var former_manager_phone_no = data[0].former_manager_phone_no;
              var former_manager_email = data[0].former_manager_email;
              var former_manager_cv = data[0].former_manager_cv;
              var manager_full_name = data[0].manager_full_name
              var remain_days = data[0].remain_days;
              var created_at = data[0].created_at;
              var tracking_number = data[0].tracking_number;
              var school_name = data[0].school_name;
              var LgaName = data[0].LgaName;
              var owner_name_old = data[0].owner_name_old;
              var WardNameMtu = data[0].WardNameMtu;
              var LgaNameMtu = data[0].LgaNameMtu;
              var RegionName = data[0].RegionName;
              var RegionNameMtu = data[0].RegionNameMtu;
              var fullname = data[0].fullname;
              var schoolCategory = data[0].schoolCategory;
              var registry = data[0].registry;
              var occupation = data[0].occupation;
              var education_level = data[0].education_level;
              var attachment_path = data[0].attachment_path;
              var occupationManager = data[0].occupationManager;
              var mwombajiAddress = data[0].mwombajiAddress;
              var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
              var manager_email = data[0].manager_email;
              var house_number = data[0].house_number;
              var baruaPepe = data[0].baruaPepe;
              var language = data[0].language;
              var school_size = data[0].school_size;
              var manager_name = data[0].manager_name;
              var area = data[0].area;
              var expertise_level = data[0].expertise_level;
              var old_tracking_number = data[0].old_tracking_number;
              var WardName = data[0].WardName;
              var structure = data[0].structure;
              var authorized_person = data[0].authorized_person;
              var title = data[0].title;
              var subcategory = data[0].subcategory;
              var manager_street = data[0].manager_street;
              var managerRegionName = data[0].managerRegionName;
              var purpose = data[0].purpose;
              var owner_email_old = data[0].owner_email_old;
              var authorized_person_old = data[0].authorized_person_old;
              var owner_name = data[0].owner_name;
              var owner_email = data[0].owner_email;
              var count = jsonData.maoni[0].count;
              var objAttachment = jsonData.objAttachment;
              var objAttachment1 = jsonData.objAttachment1;
              var Maoni = jsonData.Maoni;
              var Refferes = jsonData.Refferes;
              // var maoni = JSON.parse(jsonData.maoni)
              // console.log(attachment_path)
              console.log(
                new Date() + " " + req.session.userName + ": /ViewOmbiMeneja"
              );
              res.render(
                path.join(
                  __dirname +
                    "/../../design/maombi/details/view-ombi-badili-meneja-details"
                ),
                {
                  req: req,
                  manager_full_name : manager_full_name,
                  former_manager_full_name : former_manager_full_name,
                  manager_phone_no: manager_phone_no,
                  manager_email: manager_email,
                  manager_cv : manager_cv,
                  former_manager_phone_no: former_manager_phone_no,
                  former_manager_email: former_manager_email,
                  former_manager_cv : former_manager_cv,
                  muda_ombi: remain_days,
                  owner_email_old: owner_email_old,
                  authorized_person_old: authorized_person_old,
                  owner_name_old: owner_name_old,
                  created_at: created_at,
                  tracking_number: tracking_number,
                  authorized_person: authorized_person,
                  school_name: school_name,
                  LgaName: LgaName,
                  objAttachment: objAttachment,
                  objAttachment1 : objAttachment1,
                  RegionName: RegionName,
                  RegionNameMtu: RegionNameMtu,
                  title: title,
                  fullname: fullname,
                  schoolCategory: schoolCategory,
                  registry: registry,
                  owner_name: owner_name,
                  manager_name: manager_name,
                  occupation: occupation,
                  mwombajiAddress: mwombajiAddress,
                  education_level: education_level,
                  mwombajiPhoneNo: mwombajiPhoneNo,
                  baruaPepe: baruaPepe,
                  manager_street: manager_street,
                  managerRegionName: managerRegionName,
                  owner_email: owner_email,
                  manager_email: manager_email,
                  house_number: house_number,
                  old_tracking_number: old_tracking_number,
                  language: language,
                  school_size: school_size,
                  purpose: purpose,
                  area: area,
                  WardName: WardName,
                  structure: structure,
                  occupationManager: occupationManager,
                  expertise_level: expertise_level,
                  LgaNameMtu: LgaNameMtu,
                  WardNameMtu: WardNameMtu,
                  userLevel: req.user.cheo,
                  subcategory: subcategory,
                  count: count,
                  staffs: jsonData.staffs,
                  attachment_path: attachment_path,
                  status: jsonData.status,
                  Maoni: Maoni,
                  Refferes: Refferes,
                  commentUrl: "/MenejaComment",
                  commentRedirectUrl: "/BadiliMeneja",
                }
              );
            
          
        }
      );
   
  }
);

badiliMenejaRequestController.post(
  "/MenejaComment",
  isAuthenticated,
  can("create-comments"),
  function (req, res) {
    // console.log(req.body)
    var trackerId = req.body.trackerId;
    var from_user = req.session.userID;
    var staff = req.body.staffs;
    var owner_name = req.body.owner_name;
    var authorized_person = req.body.authorized_person;
    var owner_name_old = req.body.owner_name_old;
    var coments = req.body.coments;
    var authorized_person_old = req.body.authorized_person_old;
    var haliombi = req.body.haliombi;
    var attachment = req.body.attachment;
    var kiambatisho = req.body.kiambatisho;
    var attach_length = req.body.attach_length;
    var schoolCategoryID = req.body.schoolCategoryID;
    var ombitype = req.body.ombitype;
    var staffDet = staff.split("-");
    var department = staffDet[1];
    var staffs = staffDet[0];
    // console.log(department + " and " + staffs)

    sendRequest(
      req,
      res,
      menejaReply,
      "POST",
      {
        trackerId: trackerId,
        from_user: from_user,
        owner_name: owner_name,
        authorized_person: authorized_person,
        staffs: staffs,
        coments: coments,
        ombitype: ombitype,
        owner_name_old: owner_name_old,
        authorized_person_old: authorized_person_old,
        haliombi: haliombi,
        replyType: 1,
        department: department,
        schoolCategoryID: schoolCategoryID,
      },
      function (jsonData) {
        const { statusCode, message } = jsonData;
        console.log(
          new Date() + " " + req.session.userName + ": /MenejaComment ..."
        );
        res.send({
          statusCode: statusCode,
          message: message,
        });
      }
    );
  }
);

module.exports = badiliMenejaRequestController;
