require("dotenv").config();
const express = require("express");
const request = require("request");
const userController = express.Router();
const requestIp = require("request-ip");
var path = require("path");
const device = require('express-device');
userController.use(device.capture());

const {
  sendRequest,
  isAuthenticated,
  redirectIfAuthenticated,
  can,
  validePassword,
  activeHandover,
  validateUserInput,
} = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var loginAPI = API_BASE_URL + "login";
var baruaAuthAPI = API_BASE_URL + "authenticate-barua";
var watumiajiAPI = API_BASE_URL + "users";
var createUserAPI = API_BASE_URL + "create-user";
var updateUserAPI = API_BASE_URL + "update-user";
var activateDeactivateUserAPI = API_BASE_URL + "activate-deactivate-user";
var sendMailAPI = API_BASE_URL + "reset-user-password";
const myProfileAPI = API_BASE_URL + "my-profile";
const changeMyPasswordAPI = API_BASE_URL+ "change-my-password"
const updateMyProfileAPI = API_BASE_URL+"update-my-profile"

// Login Page
userController.get("/", redirectIfAuthenticated, (req, res) => {
  res.render(path.join(__dirname + "/../design/login"), {
    req: req,
    message: "",
  });
});
// User Profile
userController.get("/Profile", isAuthenticated , can('view-profile') , (req, res) => {
    sendRequest(req , res , myProfileAPI , "POST" , {} , (jsonData) => {
      const { user, activities , staffs} = jsonData;
      res.render(path.join(__dirname + "/../design/profile"), {
        req: req,
        user : user,
        staffs : staffs,
        activities : activities,
        message: "",
      });
    })
});

userController.get("/PasswordReset", function (req, res) {
  res.render(path.join(__dirname + "/../design/password_reset") , {req});
});
userController.post("/Reset", function (req, res) {
  request(
    {
      url: sendMailAPI,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      json: req.body,
    },
    (err, jsonData) => {
      if(err){
        req.flash.message = "Kuna hitilafu wasiliana na msimamizi wa mfumo";
        res.redirect(`/PasswordReset`);
      }
      const { statusCode, message } = jsonData.body;
      if (statusCode == 300) {
        req.flash.message = message;
        res.redirect("/");
      } else {
        req.flash.message = message
        res.redirect(`/PasswordReset`);
      }
    }
  );
});
userController.post("/auth", function (req, res) {
  const {username , password} = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.ip;
  const browser = req.headers['user-agent'];
  const device = req.device.type;
  const body = {
    username,
    password,
    clientIp,
    browser,
    device
  }
  // console.log(clientIp);
  request(
    {
      url: loginAPI,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      json: body,
    },
    (err, response, body) => {
      // console.log(loginAPI);
      const errorMessage = `Kuna tatizo, wasiliana na msimamizi wa mfumo.`;
      if (err) {
        console.log("Login Error: ",err);
        req.flash("error", errorMessage);
        res.redirect("/");
      } else {
        if (
          body !== undefined &&
          (response.statusCode == 200 || response.statusCode == 400)
        ) {
          const { statusCode, message, error } = body;
          if (error) {
            req.flash("error", errorMessage);
            res.redirect("/");
          } else {
            if (body == "Too many requests, please try again later.") {
              req.flash(
                "warning",
                "Too many requests, please try again after 10 minutes."
              );
              res.redirect("/");
            } else {
              if (statusCode == 302) {
                req.session.loginAttempt = req.session.loginAttempt + 1;
                req.flash("warning", message);
                res.redirect("/");
              } else if (statusCode == 300) {
                const ip_address = requestIp.getClientIp(req);
                const browser_used = req.headers["user-agent"];
                const { user, RoleManage, token } = body;
                req.session.UserLevel = user.user_level;
                req.session.kanda = user.kanda;
                req.session.office = user.office;
                req.session.officeName = user.office_name;
                req.session.twofa = user.twofa;
                req.session.Token = token;
                req.session.userID = user.id;
                req.session.userName = user.name;
                req.session.cheoName = user.cheo.toUpperCase();
                req.session.jukumu = user.jukumu;
                req.session.email = user.email;
                req.session.ip_address = ip_address;
                req.session.browser_used = browser_used;
                req.session.RoleManage = RoleManage;
                // console.log("out", user.twofa);
                if (user.twofa == 0) {
                  console.log("redirect to dashboard", 0);
                  res.redirect("/Dashboard");
                } else {
                  console.log("redirect to dashboard", "not zero");
                  res.redirect("/Dashboard");
                }
              } else {
                req.flash(
                  "error",
                  errorMessage
                );
                res.redirect("/");
              }
            }
          }
        } else {
          req.flash("error", errorMessage);
          res.redirect("/");
        }
      }
    }
  );
});
// Get TOKEN for barua
userController.post('/BaruaAuthentication' , (req , res) =>{
  request(
    {
      url: baruaAuthAPI,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      json: req.body,
    },
    (err, response, body) => {
      // console.log(response)
      if(err) console.log(err);
      if(body != undefined){
        const {success , statusCode , message , token} = body;
          res.send({
            success,
            message,
            statusCode,
            token
          })
      }else{
         res.send({
           success : false,
           message : "No content",
           statusCode : 404,
         });
      }
    })
});
userController.get(
  "/Watumiaji",
  isAuthenticated,
  can("view-users"),
  activeHandover,
  function (req, res) {
    res.render(path.join(__dirname + "/../design/watumiaji"), {
      req: req,
    });
  }
);
// get list of users
userController.post(
  "/UserList",
  isAuthenticated,
  can("view-users"),
  function (req, res) {
    let draw = req.body.draw;
    let start = req.body.start;
    let length = req.body.length;
    var per_page = Number(length || 10);
    var page = Number(start / length) + 1;
    sendRequest(
      req,
      res,
      watumiajiAPI + "?page=" + page + "&per_page=" + per_page,
      "GET",
      req.body,
      (jsonData) => {
        let totalRecords = jsonData.numRows;
        const dataToSend = jsonData.data.map((item) => ({
          ...item,
          login_user_id: req.user.id, // Add the user ID to each data row
        }));
        res.send({
          draw: draw,
          recordsTotal: totalRecords,
          recordsFiltered: totalRecords,
          data: dataToSend,
        });
      }
    );
  });

// Get TOKEN for barua
userController.post('/BaruaAuthentication' , (req , res) =>{
  request(
    {
      url: baruaAuthAPI,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      json: req.body,
    },
    (err, response, body) => {
      // console.log(response)
      if(err) console.log(err);
      if(body != undefined){
        const {success , statusCode , message , token} = body;
          res.send({
            success,
            message,
            statusCode,
            token
          })
      }else{
         res.send({
           success : false,
           message : "No content",
           statusCode : 404,
         });
      }
    })
});
userController.get(
  "/Watumiaji",
  isAuthenticated,
  can("view-users"),
  function (req, res) {
    res.render(path.join(__dirname + "/../design/watumiaji"), {
      req: req,
    });
  }
);
// get list of users
userController.post(
  "/UserList",
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
  validateUserInput,
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
// Disable account
userController.post("/DisableUser/:id", isAuthenticated, can('delete-users'), function (req, res) { 
    const id = req.params.id;
    sendRequest(req, res , activateDeactivateUserAPI + `/${id}` , "PUT" , {} ,(jsonData) => {
          const {statusCode , message} = jsonData;
            res.send({
              message: message,
              statusCode: statusCode
            });        
      }
    );
});


// Update profile
userController.post("/UpdateMyProfile" , isAuthenticated , can('update-profile') , (req , res) => {
    sendRequest(req , res , updateMyProfileAPI , "PUT" , req.body , (jsonData) => {
         const {statusCode , message} = jsonData;
         res.send({
             message,
             statusCode
         })
    });
})
// Change Password
userController.post("/ChangeMyPassword" , isAuthenticated , can('update-profile') , validePassword , (req , res) => {
    const {oldpassword , newpassword} = req.body
    sendRequest(req , res , changeMyPasswordAPI , "PUT" , {oldpassword , newpassword} , (jsonData) => {
         const {statusCode , message} = jsonData;
         res.send({
             message,
             statusCode
         })
    });
})

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
