require("dotenv").config();
const express = require("express");
const request = require("request");
const kusajiliSerikaliRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, modifiedUrl, activeHandover } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var maousajiliShuleSerListAPI = API_BASE_URL + "maombi-usajili-ser-shule";
var ombiKusajiliSerDetails = API_BASE_URL + "view-ombi-kusajili-ser-details";
// Display
kusajiliSerikaliRequestController.get(
  "/MaombiKusajiliShuleSerikali",
  isAuthenticated,
  can("view-school-registration-government"),
  activeHandover,
  function (req, res) {
    const obj = [];
    const per_page = Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const formData = {
      page,
      per_page,
      // search: req.query.tafuta,
      status: req.query.status,
    };
    sendRequest(
      req,
      res,
      maousajiliShuleSerListAPI,
      "POST",
      formData,
      (jsonData) => {
        const data = jsonData.dataList;
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

        res.render(
          path.join(__dirname + "/../../design/maombi/usajili_serikali"),
          {
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
          }
        );
      }
    );
  }
);

kusajiliSerikaliRequestController.get(
  "/SajiliOmbiSerikali/:id",
  isAuthenticated,
  can("view-school-registration-government"),
  activeHandover,
  function (req, res) {
    const obj = [];
    const TrackingNumber = req.params.id;
    sendRequest(
      req,
      res,
      ombiKusajiliSerDetails,
      "POST",
      {
        TrackingNumber: TrackingNumber,
      },
      (jsonData) => {
        var data = jsonData.data;
        var remain_days = data[0].remain_days;
        var created_at = data[0].created_at;
        var tracking_number = data[0].tracking_number;
        var school_name = data[0].school_name;
        var LgaName = data[0].LgaName;
        var WardNameMtu = data[0].WardNameMtu;
        var LgaNameMtu = data[0].LgaNameMtu;
        var RegionName = data[0].RegionName;
        var RegionNameMtu = data[0].RegionNameMtu;
        var fullname = data[0].fullname;
        var schoolCategory = data[0].schoolCategory;
        var schoolCategoryId = data[0].schoolCategoryId;
        var schoolPhone = data[0].school_phone;
        var genderType = data[0].gender_type;
        var registry = data[0].registry;
        var building = data[0].building;
        var occupation = data[0].occupation;
        var mwombajiAddress = data[0].mwombajiAddress;
        var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
        var isSeminary = data[0].isSeminary;
        var Stream = data[0].Stream;
        var lessons_and_courses = data[0].lessons_and_courses;
        var numberOfStudents = data[0].numberOfStudents;
        var SeminaryTitle = data[0].SeminaryTitle;
        var SeminaryValue = data[0].SeminaryValue;
        var baruaPepe = data[0].baruaPepe;
        var language = data[0].language;
        var school_size = data[0].school_size;
        var schoolOpeningDate = data[0].schoolOpeningDate;
        var schoolAddress = data[0].school_address;
        var school_email = data[0].school_email;
        var Website = data[0].Website;
        var po_box = data[0].po_box;
        var area = data[0].area;
        var is_approved = data[0].is_approved;
        var specialization = data[0].specialization;
        var numberOfTeachers = data[0].numberOfTeachers;
        var TeacherRatioStudent = data[0].TeacherRatioStudent;
        var schoolCategoryID = data[0].schoolCategoryID;
        var Certificate = data[0].Certificate;
        var WardName = data[0].WardName;
        var managerName = data[0].managerName;
        var owner_name = data[0].owner_name;
        var DisabledTitle = data[0].DisabledTitle;
        var teacherInformation = data[0].teacherInformation;
        var structure = data[0].structure;
        var subcategory = data[0].subcategory;
        var count = jsonData.maoni[0].count;
        var objAttachment = jsonData.objAttachment;
        var objAttachment1 = jsonData.objAttachment1;
        var Maoni = jsonData.Maoni;
        // var maoni = JSON.parse(jsonData.maoni)
        // console.log(teacherInformation)
        console.log(
          new Date() + " " + req.session.userName + ": /SajiliOmbiSerikali"
        );
        res.render(
          path.join(
            __dirname +
              "/../../design/maombi/details/view-ombi-sajili-serikali-details"
          ),
          {
            req: req,
            userLevel: req.user.cheo,
            muda_ombi: remain_days,
            specialization: specialization,
            created_at: created_at,
            tracking_number: tracking_number,
            schoolOpeningDate: schoolOpeningDate,
            school_name: school_name,
            LgaName: LgaName,
            RegionName: RegionName,
            RegionNameMtu: RegionNameMtu,
            DisabledTitle: DisabledTitle,
            fullname: fullname,
            schoolCategory: schoolCategory,
            genderType: genderType,
            ownerName: owner_name,
            managerName: managerName,
            registry: registry,
            schoolPhone: schoolPhone,
            schoolCategoryID: schoolCategoryID,
            schoolCategoryId: schoolCategoryId,
            occupation: occupation,
            mwombajiAddress: mwombajiAddress,
            schoolAddress: schoolAddress,
            Certificate: Certificate,
            mwombajiPhoneNo: mwombajiPhoneNo,
            baruaPepe: baruaPepe,
            poBox: po_box,
            teacherInformation: teacherInformation,
            schoolEmail: school_email,
            numberOfTeachers: numberOfTeachers,
            TeacherRatioStudent: TeacherRatioStudent,
            language: language,
            school_size: school_size,
            Website: Website,
            isSeminary: isSeminary,
            Certificate: Certificate,
            area: area,
            WardName: WardName,
            structure: structure,
            SeminaryValue: SeminaryValue,
            lessonsAndCourses: lessons_and_courses,
            LgaNameMtu: LgaNameMtu,
            WardNameMtu: WardNameMtu,
            SeminaryTitle: SeminaryTitle,
            Stream: Stream,
            building: building,
            subcategory: subcategory,
            count: count,
            staffs: jsonData.staffs,
            numberOfStudents: numberOfStudents,
            status: jsonData.status,
            objAttachment: objAttachment,
            objAttachment1: objAttachment1,
            Maoni: Maoni,
            is_approved,
            commentUrl: "/SajiliComment",
            commentRedirectUrl: "/MaombiKusajiliShuleSerikali",
          }
        );
      }
    );
  }
);
module.exports = kusajiliSerikaliRequestController;
