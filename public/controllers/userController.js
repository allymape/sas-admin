require("dotenv").config();
const express = require("express");
const request = require("request");
var session = require("express-session");
const userController = express.Router();
const requestIp = require("request-ip");
var path = require("path");
const {
  sendRequest,
  isAuthenticated,
  redirectIfAuthenticated,
  can,
} = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var loginAPI = API_BASE_URL + "login";
var watumiajiAPI = API_BASE_URL + "users";
var createUserAPI = API_BASE_URL + "create-user";
var updateUserAPI = API_BASE_URL + "update-user";
var sendMailAPI = API_BASE_URL + "reset-user-password";

// Login Page
userController.get("/", redirectIfAuthenticated, function (req, res) {
  res.render(path.join(__dirname + "/../design/login"), {
    req: req,
    message: "",
  });
});

userController.post("/auth", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  request(
    {
      url: loginAPI,
      method: "POST",
      json: { username: username, password: password },
    },
    (error ,response ,  body) => {
      if (error) {
        req.flash("error", "Kuna tatizo wasiliana na Msimamizi wa Mfumo");
        res.redirect("/");
      } else {
        const { statusCode , message} = body;
        if (body == "Too many requests, please try again later.") {
          req.flash("warning", 'Too many requests, please try again after 10 minutes.');
          res.redirect("/");
        } else {
          if (statusCode == 302) {
            req.session.loginAttempt = req.session.loginAttempt + 1;
            req.flash("warning", message);
            res.redirect("/");
          } else if (statusCode == 300) {
                
                const ip_address = requestIp.getClientIp(req);
                const browser_used = req.headers["user-agent"];
                const { user, RoleManage , token } = body;
                // console.log("Controller", user);
                req.session.UserLevel = user.user_level;
                req.session.office = user.office;
                req.session.officeName = user.office_name;
                req.session.twofa = user.twofa;
                req.session.Token = token;
                req.session.userID = user.id;
                req.session.userName = user.name;
                req.session.cheoName = user.rank_name;
                req.session.email = user.email;
                req.session.ip_address = ip_address;
                req.session.browser_used = browser_used;
                req.session.RoleManage = RoleManage;
            if (user.twofa == 0) {
              if (Number(user.user_level) == 10) {
                res.redirect("/RipotiZilizosajiliwa");
              } else {
                res.redirect("/BadiliMmiliki");
              }
            } else {
              res.redirect("/Dashboard");
            }
          }else{
             req.flash("error", "Kuna tatizo wasiliana na Msimamizi wa Mfumo");
             res.redirect("/");
          }
        }
      }
    }
  );
});

userController.get(
  "/Watumiaji",
  isAuthenticated,
  can("view-users"),
  function (req, res) {
    res.render(path.join(__dirname + "/../design/watumiaji"), {
      req: req,
      useLev: req.session.UserLevel,
      userName: req.session.userName,
      RoleManage: req.session.RoleManage,
      userID: req.session.userID,
      cheoName: req.session.cheoName,
    });
  }
);
// get list of users
userController.get(
  "/Users",
  isAuthenticated,
  can("view-users"),
  function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    var query = req.query;
    sendRequest(
      req,
      res,
      watumiajiAPI + "?page=" + page + "&per_page=" + per_page,
      "GET",
      query,
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
  }
);
// Create User Account
userController.post(
  "/CreateUser",
  isAuthenticated,
  can("create-users"),
  function (req, res) {
    sendRequest(req, res, createUserAPI, "POST", req.body, (jsonData) => {
      res.send({
        statusCode: jsonData.statusCode,
        data: jsonData.data,
        message: jsonData.message,
      });
    });
  }
);

// Find a User
userController.get(
  "/FindUser/:id",
  isAuthenticated,
  can("update-users"),
  function (req, res) {
    var userId = req.params.id;
    sendRequest(
      req,
      res,
      watumiajiAPI + "/" + userId,
      "GET",
      {},
      (jsonData) => {
        // console.log(jsonData.data)
        res.send({
          statusCode: jsonData.statusCode,
          data: jsonData.data,
          message: jsonData.message,
        });
      }
    );
  }
);

// Update User Account
userController.post(
  "/UpdateUser/:id",
  isAuthenticated,
  can("update-users"),
  function (req, res) {
    var userId = req.params.id;
    sendRequest(
      req,
      res,
      updateUserAPI + "/" + userId,
      "PUT",
      req.body,
      (jsonData) => {
        res.send({
          statusCode: jsonData.statusCode,
          data: jsonData.data,
          message: jsonData.message,
        });
      }
    );
  }
);
// Reset user password from Admin
userController.post(
  "/TumaEmail",
  isAuthenticated,
  can("update-users"),
  function (req, res) {
    var userData = {
      browser_used: req.session.browser_used,
      ip_address: req.session.ip_address,
      email: req.body.email,
    };
    sendRequest(req, res, sendMailAPI, "POST", userData, (jsonData) => {
      res.send({
        statusCode: jsonData.statusCode,
        data: jsonData.data,
        message: jsonData.message,
      });
    });
  }
);
// Logout User
userController.post("/Logout", isAuthenticated, function (req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
    }
    res.redirect("/");
  });
});
module.exports = userController;

// if (
//   typeof req.session.userName !== "undefined" ||
//   req.session.userName === true
// ) {
//   request(
//     {
//       url: updateUserAPI,
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
