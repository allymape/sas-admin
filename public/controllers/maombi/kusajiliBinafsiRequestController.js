require("dotenv").config();
const express = require("express");
const request = require("request");
const kusajiliBinafsiRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const maousajiliShuleListAPI = API_BASE_URL + "maombi-usajili-shule";
const ombiKusajiliDetails = API_BASE_URL + "view-ombi-kusajili-details";
const sajiliReply = API_BASE_URL + "tuma-sajili-majibu";
// Display
kusajiliBinafsiRequestController.get(
  "/MaombiKusajiliShule",
  isAuthenticated,
  can("view-school-registration-private"),
  function (req, res) {
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
      status: req.query.status,
    };
    const obj = [];
    sendRequest(
      req,
      res,
      maousajiliShuleListAPI,
      "POST",
      formData,
      (jsonData) => {
                  
                  var data = jsonData.dataList;
                    for (var i = 0; i < data.length; i++) {
                      var tracking_number = data[i].tracking_number;
                      var user_id = data[i].user_id;
                      var LgaName = data[i].LgaName;
                      var RegionName = data[i].RegionName;
                      var school_name = data[i].school_name;
                      var created_at = data[i].created_at;
                      var remain_days = data[i].remain_days;
                      var folio = data[i].folio;
                      req.session.TrackingNumber = tracking_number;
                      obj.push({
                        tracking_number: tracking_number,
                        user_id: user_id,
                        school_name: school_name,
                        LgaName: LgaName,
                        RegionName: RegionName,
                        created_at: created_at,
                        remain_days: remain_days,
                        folio
                      });
                    }
                    console.log(
                      new Date() +
                        " " +
                        req.session.userName +
                        ": /MaombiKusajiliShule"
                    );
                    res.render(
                      path.join(__dirname + "/../../design/maombi/usajili"),
                      {
                        req: req,
                        summary: jsonData.dataSummary,
                        maombi: obj,
                      }
                    );
                  
      }
    );
  }
);

kusajiliBinafsiRequestController.get("/SajiliOmbi/:id", 
  isAuthenticated,
  can("view-school-registration-private"), function (req, res) {
  // var obj = [];
    var TrackingNumber = req.params.id;
    sendRequest(req, res , ombiKusajiliDetails, "POST" , {TrackingNumber: TrackingNumber} , (jsonData) => {
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
            var numberOfTeachers = data[0].numberOfTeachers;
            var TeacherRatioStudent = data[0].TeacherRatioStudent;
            var schoolCategoryID = data[0].schoolCategoryID;
            var Certificate = data[0].Certificate;
            var WardName = data[0].WardName;
            var teacherInformation = data[0].teacherInformation;
            var structure = data[0].structure;
            var subcategory = data[0].subcategory;
            var count = jsonData.maoni[0].count;
            var objAttachment = jsonData.objAttachment;
            var objAttachment1 = jsonData.objAttachment1;
            var Maoni = jsonData.Maoni;
            // var maoni = JSON.parse(jsonData.maoni)
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliOmbi"
            );
            
            res.render(
              path.join(
                __dirname +
                  "/../../design/maombi/details/view-ombi-sajili-details"
              ),
              {
                req: req,
                UserLevel: req.user.cheo,
                muda_ombi: remain_days,
                created_at: created_at,
                tracking_number: tracking_number,
                schoolOpeningDate: schoolOpeningDate,
                school_name: school_name,
                LgaName: LgaName,
                RegionName: RegionName,
                RegionNameMtu: RegionNameMtu,
                fullname: fullname,
                schoolCategory: schoolCategory,
                genderType: genderType,
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
                subcategory: subcategory,
                count: count,
                staffs: jsonData.staffs,
                numberOfStudents: numberOfStudents,
                status: jsonData.status,
                objAttachment: objAttachment,
                objAttachment1: objAttachment1,
                Maoni: Maoni,
              }
            );
          
      }
    );

});


// // original
// kusajiliBinafsiRequestController.post("/SajiliComment", function (req, res) {
//   // console.log(req.body)
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var coments = req.body.coments;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//      sendRequest(
//       req,
//       res,
//       sajiliReply,
//       "POST",
//       {
//           trackerId: trackerId,
//           from_user: from_user,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           haliombi: haliombi,
//           replyType: 1,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//       },
//       (jsonData) => {
//        const { error, statusCode, message } = jsonData;
//        // var data = jsonData.data;
//          console.log(
//            new Date() + " " + req.session.userName + ": /SajiliComment"
//          );
//          res.send({
//           statusCode : statusCode,
//           message : message
//          });
      
//       }
//     );
 
// });

module.exports = kusajiliBinafsiRequestController;
