require("dotenv").config();
const express = require("express");
const request = require("request");
const userController = express.Router();
const path = require("path");
const device = require("express-device");
userController.use(device.capture());
const {
  sendRequest,
  isAuthenticated,
  redirectIfAuthenticated,
  can,
  validePassword,
  activeHandover,
} = require("../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const baruaAuthAPI = API_BASE_URL + "authenticate-barua";
const watumiajiAPI = API_BASE_URL + "users";
const createUserAPI = API_BASE_URL + "create-user";
const updateUserAPI = API_BASE_URL + "update-user";
const activateDeactivateUserAPI = API_BASE_URL + "activate-deactivate-user";
const sendMailAPI = API_BASE_URL + "reset-user-password";
const myProfileAPI = API_BASE_URL + "my-profile";
const changeMyPasswordAPI = API_BASE_URL + "change-my-password";
const updateMyProfileAPI = API_BASE_URL + "update-my-profile";

const getTablePagination = (body = {}) => {
  const start = Number(body.start || 0);
  const length = Number(body.length || 10);
  const perPage = Number.isFinite(length) && length > 0 ? length : 10;
  const page = Math.floor(start / perPage) + 1;
  return { page, perPage, draw: body.draw };
};

// Login Page
userController.get("/", redirectIfAuthenticated, (req, res) => {
  res.render(path.join(__dirname + "/../views/login"), {
    req: req,
    message: "",
  });
});
// User Profile
userController.get("/Profile", isAuthenticated , can('view-profile') , (req, res) => {
    sendRequest(req , res , myProfileAPI , "POST" , {} , (jsonData) => {
      const { user, activities , staffs} = jsonData;
      res.render(path.join(__dirname + "/../views/profile"), {
        req,
        user,
        staffs,
        activities,
        message: "",
      });
    });
});

userController.get("/PasswordReset", function (req, res) {
  res.render(path.join(__dirname + "/../views/password_reset") , {req});
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
    res.render(path.join(__dirname + "/../views/watumiaji"), { req });
  },
);

// Datatables list
userController.post(
  "/UserList",
  isAuthenticated,
  can("view-users"),
  function (req, res) {
    const { page, perPage, draw } = getTablePagination(req.body);
    sendRequest(
      req,
      res,
      `${watumiajiAPI}?page=${page}&per_page=${perPage}`,
      "GET",
      req.body,
      (jsonData) => {
        const totalRecords = Number(jsonData.numRows || 0);
        const dataToSend = (jsonData.data || []).map((item) => ({
          ...item,
          login_user_id: req.user.id,
        }));
        res.send({
          draw,
          recordsTotal: totalRecords,
          recordsFiltered: totalRecords,
          data: dataToSend,
        });
      },
    );
  },
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
        res.send({
          statusCode: jsonData.statusCode,
          data: jsonData.data,
          message: jsonData.message,
        });
      }
    );
  }
);

// Lowercase alias for frontend consistency
userController.get(
  "/findUser/:id",
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
});
// Change Password
userController.post("/ChangeMyPassword" , isAuthenticated , can('update-profile') , validePassword , (req , res) => {
    const {oldpassword , newpassword} = req.body;
    sendRequest(req , res , changeMyPasswordAPI , "PUT" , {oldpassword , newpassword} , (jsonData) => {
         const {statusCode , message} = jsonData;
         res.send({
             message,
             statusCode
         });
    });
});

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
