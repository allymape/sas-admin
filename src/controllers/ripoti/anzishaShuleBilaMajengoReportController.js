require("dotenv").config();
const express = require("express");
const request = require("request");
const anzishaShuleBilaMajengoReportController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, activeHandover } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const maousajiliShuleListAPI = API_BASE_URL + "maombi-usajili-shule";
const ombiKusajiliDetails = API_BASE_URL + "view-ombi-kusajili-details";
const sajiliReply = API_BASE_URL + "tuma-sajili-majibu";
var anzishaShuleBilaMajAPI = API_BASE_URL + "bila-majengo-shule";
// Display
anzishaShuleBilaMajengoReportController.get(
  "/RipotiAnzishaBilaMajengo",
  isAuthenticated,
  can("view-school-registration-private"),
  activeHandover,
  function (req, res) {
    var formData = {
      //  is_paginated: req.query.is_paginated,
      //  search: req.query.tafuta,
    };
    var obj = [];
    var objlist = [];
    var objtotal = [];
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    var today = new Date();
    sendRequest(
      req,
      res,
      anzishaShuleBilaMajAPI,
      "POST",
      formData,
      (jsonData) => {
        var message = jsonData.message;
        var statusCode = jsonData.statusCode;
        var data = jsonData.data;
        for (var i = 0; i < data.length; i++) {
          var tracking_number = data[i].tracking_number;
          var user_id = data[i].user_id;
          var LgaName = data[i].LgaName;
          var RegionName = data[i].RegionName;
          var WardName = data[i].WardName;
          var school_name = data[i].school_name;
          var created_at = data[i].created_at;
          var remain_days = data[i].remain_days;
          var updated_at = data[i].updated_at;
          var schoolCategory = data[i].schoolCategory;
          var subcategory = data[i].subcategory;
          req.session.TrackingNumber = tracking_number;
          var gender_type = data[i].gender_type;
          var school_phone = data[i].school_phone;
          var level = data[i].level;
          var school_email = data[i].school_email;
          var po_box = data[i].po_box;
          obj.push({
            tracking_number: tracking_number,
            WardName: WardName,
            useLev: req.session.UserLevel,
            schoolCategory: schoolCategory,
            subcategory: subcategory,
            userName: req.session.userName,
            RoleManage: req.session.RoleManage,
            userID: req.session.userID,
            cheoName: req.session.cheoName,
            po_box: po_box,
            user_id: user_id,
            level: level,
            school_phone: school_phone,
            school_email: school_email,
            school_name: school_name,
            LgaName: LgaName,
            RegionName: RegionName,
            updated_at: updated_at,
            created_at: created_at,
            remain_days: remain_days,
            gender_type: gender_type,
          });
        }
        console.log(
          new Date() +
            " " +
            req.session.userName +
            ": /MaombiKuanzishaShuleList"
        );
        res.render(
          path.join(
            path.join(__dirname, "../../views/reports/ripotianzishabilamajengo")
          ),
          {
            req: req,
            total_month: data,
            list: obj,
            useLev: req.session.UserLevel,
            userName: req.session.userName,
            RoleManage: req.session.RoleManage,
            userID: req.session.userID,
            cheoName: req.session.cheoName,
          }
        );
      }
    );
  }
);

// app.get("/RipotiAnzishaBilaMajengo", function (req, res) {
//   var obj = [];
//   // console.log("jjdjdjd " + req.session.UserLevel)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: anzishaShuleBilaMajAPI,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           UserLevel: req.session.UserLevel,
//           Office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleList " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;
//           console.log(jsonData);
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             for (var i = 0; i < data.length; i++) {
//               var tracking_number = data[i].tracking_number;
//               var user_id = data[i].user_id;
//               var LgaName = data[i].LgaName;
//               var RegionName = data[i].RegionName;
//               var WardName = data[i].WardName;
//               var school_name = data[i].school_name;
//               var created_at = data[i].created_at;
//               var remain_days = data[i].remain_days;
//               var updated_at = data[i].updated_at;
//               var schoolCategory = data[i].schoolCategory;
//               var subcategory = data[i].subcategory;
//               req.session.TrackingNumber = tracking_number;
//               var gender_type = data[i].gender_type;
//               var school_phone = data[i].school_phone;
//               var level = data[i].level;
//               var school_email = data[i].school_email;
//               var po_box = data[i].po_box;
//               obj.push({
//                 tracking_number: tracking_number,
//                 WardName: WardName,
//                 useLev: req.session.UserLevel,
//                 schoolCategory: schoolCategory,
//                 subcategory: subcategory,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 po_box: po_box,
//                 user_id: user_id,
//                 level: level,
//                 school_phone: school_phone,
//                 school_email: school_email,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 updated_at: updated_at,
//                 created_at: created_at,
//                 remain_days: remain_days,
//                 gender_type: gender_type,
//               });
//             }
//             console.log(
//               new Date() +
//                 " " +
//                 req.session.userName +
//                 ": /MaombiKuanzishaShuleList"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/reports/ripotianzishabilamajengo"),
//               {
//                 req: req,
//                 total_month: data,
//                 list: obj,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//               }
//             );
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

anzishaShuleBilaMajengoReportController.get("/SajiliOmbi/:id", 
  isAuthenticated,
  can("view-school-registration-private"), function (req, res) {
  // var obj = [];
    var TrackingNumber = req.params.id;
    sendRequest(req, res , ombiKusajiliDetails, "POST" , 
    {TrackingNumber: TrackingNumber} , (jsonData) => {
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
                  "//../views/maombi/details/view-ombi-sajili-details"
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


// request(
//   {
//     url: anzishaShuleBilaMajAPI,
//     method: "POST",
//     headers: {
//       Authorization: "Bearer" + " " + req.session.Token,
//       "Content-Type": "application/json",
//     },
//     json: {
//       browser_used: req.session.browser_used,
//       ip_address: req.session.ip_address,
//       UserLevel: req.session.UserLevel,
//       Office: req.session.office,
//     },
//   },
//   function (error, response, body) {
//     if (error) {
//       console.log(
//         new Date() + ": fail to MaombiKuanzishaShuleList " + error
//       );
//       res.send("failed");
//     }

//     if (body !== undefined) {
//       // var jsonData = JSON.parse(body)
//       var jsonData = body;
//       console.log(jsonData);
//       var message = jsonData.message;
//       var statusCode = jsonData.statusCode;
//       var data = jsonData.data;
//       if (statusCode == 300) {
//         for (var i = 0; i < data.length; i++) {
//           var tracking_number = data[i].tracking_number;
//           var user_id = data[i].user_id;
//           var LgaName = data[i].LgaName;
//           var RegionName = data[i].RegionName;
//           var WardName = data[i].WardName;
//           var school_name = data[i].school_name;
//           var created_at = data[i].created_at;
//           var remain_days = data[i].remain_days;
//           var updated_at = data[i].updated_at;
//           var schoolCategory = data[i].schoolCategory;
//           var subcategory = data[i].subcategory;
//           req.session.TrackingNumber = tracking_number;
//           var gender_type = data[i].gender_type;
//           var school_phone = data[i].school_phone;
//           var level = data[i].level;
//           var school_email = data[i].school_email;
//           var po_box = data[i].po_box;
//           obj.push({
//             tracking_number: tracking_number,
//             WardName: WardName,
//             useLev: req.session.UserLevel,
//             schoolCategory: schoolCategory,
//             subcategory: subcategory,
//                               userName: req.session.userName,
//           RoleManage: req.session.RoleManage,
// userID: req.session.userID,
//             cheoName: req.session.cheoName,
//             po_box: po_box,
//             user_id: user_id,
//             level: level,
//             school_phone: school_phone,
//             school_email: school_email,
//             school_name: school_name,
//             LgaName: LgaName,
//             RegionName: RegionName,
//             updated_at: updated_at,
//             created_at: created_at,
//             remain_days: remain_days,
//             gender_type: gender_type,
//           });
//         }
//         console.log(
//           new Date() +
//             " " +
//             req.session.userName +
//             ": /MaombiKuanzishaShuleList"
//         );
//         res.render(
//           path.join(__dirname + "/public/design/reports/ripotianzishabilamajengo"),
//           {
//             req: req,
//             total_month: data,
//             list: obj,
//             useLev: req.session.UserLevel,
//                               userName: req.session.userName,
//           RoleManage: req.session.RoleManage,
// userID: req.session.userID,
//             cheoName: req.session.cheoName,
//           }
//         );
//       }
//       if (statusCode == 209) {
//         res.redirect("/");
//       }
//     }
//   }
// );


module.exports = anzishaShuleBilaMajengoReportController;
