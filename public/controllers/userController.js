require("dotenv").config();
const express = require("express");
const request = require("request");
const userController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var watumiajiAPI = API_BASE_URL + "users";
var updateWatumiajiAPI = API_BASE_URL + "update-user";
var sendMailAPI = API_BASE_URL + "reset-user-password";

// get list of users
userController.get("/users", function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  sendRequest(
    req,
    res,
    watumiajiAPI + "?page=" + page + "&per_page=" + per_page,
    "GET",
    {},
    (jsonData) => {
      var data = jsonData.data;
      var numRows = jsonData.numRows;
      res.send({
        statusCode: jsonData.statusCode,
        data: data,
        pagination: {
          total: numRows,
          current: page,
          per_page: per_page,
          pages: Math.ceil(numRows / per_page),
        },
      });
    }
  );
});

userController.get("/findUser/:id", function (req, res) {
    var userId = req.params.id;
    sendRequest(req, res, watumiajiAPI+"/"+userId, "GET", {}, (jsonData) => {
        // console.log(jsonData)
        res.send({
            statusCode: jsonData.statusCode,
            data : jsonData.data,
            message: jsonData.message,
        });
  });
});

userController.post("/UpdateWatumiaji", function (req, res) {
       var userId = req.body.userId;
        var userData = {
          fullname: req.body.name,
          username: req.body.username,
          phoneNumber: req.body.phone,
          email: req.body.email,
          roleId: req.body.roleId,
          password: req.body.password,
          levelId: req.body.levelId,
          lgas: req.body.lgas,
          zone: req.body.zone,
          region: req.body.region,
          sign: req.body.selectedFile,
        };
        sendRequest(req, res, updateWatumiajiAPI+"/"+userId , "PUT", userData, (jsonData) => {
                res.send({
                        statusCode: jsonData.statusCode,
                        data: jsonData.data,
                        message: jsonData.message,
                });
        });
});
// Reset user password from Admin
userController.post("/TumaEmail", function (req, res) {
 
  var userData = {
                browser_used: req.session.browser_used,
                ip_address: req.session.ip_address,
                email: req.body.email,
   }
  sendRequest(req, res, sendMailAPI , 'POST' , userData , (jsonData) => {
         res.send({
                statusCode: jsonData.statusCode,
                data: jsonData.data,
                message: jsonData.message,
         });
  } );
  
//   request(
//     {
//       url: sendMailAPI,
//       method: "POST",
//       json: {
//         browser_used: req.session.browser_used,
//         ip_address: req.session.ip_address,
//         email: email,
//       },
//     },
//     function (error, response, body) {
//       if (error) {
//         console.error(
//           new Date() +
//             ": " +
//             email +
//             " with IP: " +
//             requestIp.getClientIp(req) +
//             " fail to access /TumaEmail " +
//             error
//         );
//         res.send("failed");
//       }
//       if (body !== undefined) {
//         // console.log(body)
//         var message = body.message;
//         var statusCode = body.statusCode;
//         var msg = body.msg;
//         if (statusCode == 302) {
//           res.render(path.join(__dirname + "/public/design/login"), {
//             req: req,
//             message: message,
//           });
//         } else if (statusCode == 300) {
//           // console.log("2FA: " + req.session.twofa);
//           // console.log(new Date() +  ": Successful verified")
//           console.info(
//             new Date() +
//               ": " +
//               email +
//               " with IP: " +
//               requestIp.getClientIp(req) +
//               " able to access  /TumaEmail "
//           );

//           res.send({ msg: msg });
//         }
//         else {
//           res.redirect("/");
//         }
//       }
//     }
//   );
});
module.exports = userController;


// if (
//   typeof req.session.userName !== "undefined" ||
//   req.session.userName === true
// ) {
//   request(
//     {
//       url: updateWatumiajiAPI,
//       method: "POST",
//       headers: {
//         Authorization: "Bearer" + " " + req.session.Token,
//         "Content-Type": "application/json",
//       },
//       json: {
//         browser_used: req.session.browser_used,
//         ip_address: req.session.ip_address,
//         name: name,
//         username: username,
//         phoneNumber: phoneNumber,
//         email: email,
//         roleId: roleId,
//         password: password,
//         cheo: cheo,
//         lgas: lgas,
//         kanda: kanda,
//         sign: sign,
//         userId: userId,
//         roleRMe: roleRMe,
//       },
//     },
//     function (error, response, body) {
//       if (error) {
//         console.log(new Date() + ": fail to TumaComment " + error);
//         res.send("failed");
//       }

//       if (body !== undefined) {
//         var jsonData = body;
//         var message = jsonData.message;
//         var statusCode = jsonData.statusCode;
//         if (statusCode == 300) {
//           console.log(
//             new Date() + " " + req.session.userName + ": /SajiliWatumiaji"
//           );
//           res.send({
//             message: message,
//             statusCode: statusCode,
//             useLev: req.session.UserLevel,
//             userName: req.session.userName,
//             RoleManage: req.session.RoleManage,
//             userID: req.session.userID,
//             cheoName: req.session.cheoName,
//           });
//         }
//         if (statusCode == 209) {
//           res.redirect("/");
//         }
//       }
//     }
//   );
// } else {
//   res.redirect("/");
// }