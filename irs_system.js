var session = require("express-session");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var fs = require("fs");
var util = require("util");
const dateFormat = require("dateformat");
const request = require("request");
const { error, exception } = require("console");
const { connect } = require("http2");
const { json } = require("body-parser");
const { application } = require("express");
const { constants } = require("buffer");
let formidable = require("formidable");
const https = require("https");
const axios = require("axios");
const { report, title } = require("process");
var sql = require("mssql");
var http = require("http");
var json2xls = require("json2xls");
const XLSX = require("xlsx");
const PDFDocument = require("pdfkit");
const Jimp = require("jimp");
const doc = new PDFDocument();
const doc1 = new PDFDocument();
const logger = require("./logger");
const requestIp = require("request-ip");
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const flash = require('connect-flash');
const permissionController = require("./public/controllers/permissionController");
const regionController = require("./public/controllers/regionController");
const districtController = require("./public/controllers/districtController");
const wardController = require("./public/controllers/wardController");
const streetController = require("./public/controllers/streetController");
const userController = require("./public/controllers/userController");
const roleController = require("./public/controllers/roleController");
const zoneController = require("./public/controllers/zoneController");
const attachmentTypeController = require("./public/controllers/attachmentTypeController");
const applicationCategoryController = require("./public/controllers/applicationCategoryController");
const registrationTypeController = require("./public/controllers/registrationTypeController");
const errorController = require("./public/controllers/errorController");
const { can, isAuthenticated, titleCase, lowerCase, sumAssociativeArray, formatDate } = require("./util");
const dashboardController = require("./public/controllers/dashboardController");
const designationController = require("./public/controllers/designationController");
const applicantController = require("./public/controllers/applicantController");
const numeral = require('numeral');
const schoolController = require("./public/controllers/schoolController");
const levelController = require("./public/controllers/rankController");
const rankController = require("./public/controllers/rankController");
const hierarchyController = require("./public/controllers/hierarchyController");
const biasController = require("./public/controllers/combinationController");
const combinationController = require("./public/controllers/biasController");
const feeController = require("./public/controllers/feeController");
const anzishaShuleRequestController = require("./public/controllers/maombi/anzishaShuleRequestController");
const umilikinaumenejaRequestController = require("./public/controllers/maombi/umilikinaumenejaRequestController");
const kusajiliBinafsiRequestController = require("./public/controllers/maombi/kusajiliBinafsiRequestController");
const kusajiliSerikaliRequestController = require("./public/controllers/maombi/kusajiliSerikaliRequestController");
const kubadiliJinaRequestController = require("./public/controllers/maombi/kubadiliJinaRequestController");
const kuongezaMikondoRequestController = require("./public/controllers/maombi/kuongezaMikondoRequestController");
const kuongezaTahasusiRequestController = require("./public/controllers/maombi/kuongezaTahasusiRequestController");
const kubadiliUsajiliRequestController = require("./public/controllers/maombi/kubadiliUsajiliRequestController");
const hamishaRequestController = require("./public/controllers/maombi/hamishaRequestController");
const badiliMmilikiRequestController = require("./public/controllers/maombi/badiliMmilikiRequestController");
const badiliMenejaRequestController = require("./public/controllers/maombi/badiliMenejaRequestController");
const kuongezaBweniRequestController = require("./public/controllers/maombi/kuongezaBweniRequestController");
const futaShuleRequestController = require("./public/controllers/maombi/futaShuleRequestController");
const ongezaDahaliaRequestController = require("./public/controllers/maombi/ongezaDahaliaRequestController");
const kusajiliCommentController = require("./public/controllers/maombi/kusajiliCommentController");
const algorithmController = require("./public/controllers/algorithmController");
const notificationController = require("./public/controllers/notificationController");
const trackApplicationController = require("./public/controllers/trackApplicationController");
const attachmentController = require("./public/controllers/attachmentController");
<<<<<<< HEAD
const anzishaShuleBilaMajengoReportController = require("./public/controllers/ripoti/anzishaShuleBilaMajengoReportController");
const usajiliShuleReportController = require("./public/controllers/ripoti/usajiliShuleReportController");
=======
const reportRequestController = require("./public/controllers/ripoti/RipotiRequestController");
>>>>>>> 220dba3ac34ae8f3571ff12e3cc19acc0c7cdc46

var app = express();
app.use(helmet.frameguard())
app.use(cookieParser())
app.use(flash());
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    httpOnly: true,  // dont let browser javascript access cookie ever
    secure: true, // only use cookie over https
    ephemeral: true,
      cookie: {

        // Session expires after 1 min of inactivity.
        // expires: 900000
        maxAge: 20 * 60 * 1000
    }
  })
);

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, "public")));

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// set the view engine to ejs
app.set("view engine", "ejs");

// parse application/json
app.use(bodyParser.json());

app.locals.getCurrentUrl = function (req) {
  const url = req.url.replace(/^\/+/, '')
  return url.indexOf('?') > -1 ? url.split('?')[0] : url;
};


global.sumAssociativeArray = (array) => {
  return sumAssociativeArray(array);
}

global.routeIs =  (url_segments, currentUrl) => {
  // console.log(currentUrl , url_segments)
    if(url_segments){
        var urls = url_segments.split("|");
        if (Array.isArray(urls) && urls.length > 0) {
              for(var i=0; i< urls.length; i++){
                // console.log('cehkakdka ',currentUrl , currentUrl.replace(/^\/+/, '') , urls[i].trim()))
                // console.log(modifyUrl(currentUrl.) === urls[i].trim())
                if(modifyUrl(currentUrl).toLowerCase() == urls[i].trim().toLowerCase()){
                    return true;
                }
              }
        }
    }
  return false;
};

global.permission = (req , permission_name) => {
       if(req && permission_name){
        const pluck = (arr , key) => arr.map(i => i[key].toLowerCase());
        const permissions = req.session.RoleManage;
            if(permissions.length > 0){
              const user_permissions = pluck(permissions , 'permission_name');
              // {{id : 1 , name : 'view-users'} , {id : 2 , name : 'create-users'} }  =>  ['view-users','create-user'];
              // Check permission name has separated by | and loop through to 
              // check if user has at least one permission,
              // | is conjuction or
              if(permission_name.includes("|")){
                 var found = false;
                  permission_name.split('|').forEach( function(p){
                        if(p && user_permissions.includes(p.trim().toLowerCase())){
                            found = true;
                            return true;
                        }
                  });
                  return found;
              }
              return user_permissions.includes(permission_name.toLowerCase());
            }
       }
       return false;
}

var modifyUrl = function(currentUrl){
    var url = currentUrl.split("?").length == 2 ? currentUrl.split("?")[0].split("/") : currentUrl.split("/");
     if(url.length == 2){
        return url[1];
     }
     if(url.length == 3){
        return url[1]+"/*";
     }
     if(url.length == 4){
        return url[1]+"/*/"+url[3];
     }
     return currentUrl;
} 

global.nameCase = (text) => {
  return titleCase(lowerCase(text));
};

global.numberFormat = (number , format = `0,0`) => {
    return numeral(number).format(format);
}

global.dateFormat = (date , format = "DD/MM/YYYY hh:mm:ss") => {
    return formatDate(date , format);
}


var VERURL = "http://41.59.228.17:9010/";
var BASEURL = "http://127.0.0.1:8088/api/";
var loginAPI = BASEURL + "login";
var passResAPI = BASEURL + "passreset";
var thibitishapassAPI = BASEURL + "thibitishapassword";
var scanAPI = BASEURL + "scantrack";
var sendMailAPI = BASEURL + "send";
var wezeshaAPI = BASEURL + "wezesha2fa";
var thibitishaAPI = BASEURL + "thibitisha2fa";
var simulateAPI = BASEURL + "simulatepay";
var sajiliGrahpAPI = BASEURL + "usajiligraph";
var VutaKataListAPI = BASEURL + "usajiliKata";
var VutaMitaaListAPI = BASEURL + "usajiliMitaa";
// var VutaShuleListAPI = BASEURL + "existingSchools"; 
var activeUserAPI = BASEURL + "active-user";
var activeMenuAPI = BASEURL + "active-menu";
var kandaListAPI = BASEURL + "zonilist";
var sajiliZoniAPI = BASEURL + "addZoni";
var tengenezaRoleAPI = BASEURL + "addRole";
var tengenezaPermissionAPI = BASEURL + "addPermission";
var permissionsAPI = BASEURL + "allPermissions";

var sasishaRoleAPI = BASEURL + "updateRole"; 
var updateZoniAPI = BASEURL + "editZoni";
var deleteZoniAPI = BASEURL + "deleteZoni";
var wardListAPI = BASEURL + "allWards";
var streetListAPI = BASEURL + "allStreets";
var rolesAPI = BASEURL + "allRoles";
var editRoleAPI = BASEURL + "editRole";
var watumiajiAPI = BASEURL + "users";
var ongezaReply = BASEURL + "tuma-ongeza-majibu";
var maoanzishaShuleListAPI = BASEURL + "maombi-kuanzisha-shule";
var anzishaShuleBilaMajAPI = BASEURL + "bila-majengo-shule";
var anzishaShuleBilaMajKatAPI = BASEURL + "kataa-bila-majengo-shule";
var anzishaShuleMajAPI = BASEURL + "majengo-shule";
var anzishaShuleMajKatAPI = BASEURL + "kataa-majengo-shule";
var viewBilaMajDetails = BASEURL + "view-bila-majengo-details";
var viewBilaMajKatDetails = BASEURL + "kat-view-bila-majengo-details";
var ongezatahasusiDetails = BASEURL + "view-ongeza-tahasusi-details";
var ripotiongezatahasusiDetails = BASEURL + "view-ripoti-ongeza-tahasusi-details";
var viewMajDetails = BASEURL + "view-majengo-details";
var viewMajKatDetails = BASEURL + "kat-view-majengo-details";
var maoanzishaShuleSerListAPI = BASEURL + "maombi-kuanzisha-shule-serikali";
var maommilikiShuleListAPI = BASEURL + "maombi-mmiliki-shule";
var thibmmilikiShuleListAPI = BASEURL + "thibit-mmiliki-shule";
var maobadilimmilikiShuleListAPI = BASEURL + "maombi-badili-mmiliki-shule";
var ripbadilimmilikiShuleListAPI = BASEURL + "rip-badili-mmiliki-shule";
var maobadilimenejaShuleListAPI = BASEURL + "maombi-badili-meneja-shule";
var ripotibadilimenejaShuleListAPI = BASEURL + "ripoti-badili-meneja-shule";
var ripotibadilimmilikiShuleListAPI = BASEURL + "ripoti-badili-mmiliki-shule";
var maousajiliShuleListAPI = BASEURL + "maombi-usajili-shule";
var maousajiliShuleSerListAPI = BASEURL + "maombi-usajili-ser-shule";
var badiliMkondo = BASEURL + "maombi-badili-mkondo";
var ripotibadiliMkondo = BASEURL + "ripoti-badili-mkondo";
var badiliDahalia = BASEURL + "maombi-ongeza-dahalia";
var ripotiDahalia = BASEURL + "ripoti-ongeza-dahalia";
var badiliBweni = BASEURL + "maombi-badili-bweni";
var ripotibadiliBweni = BASEURL + "ripoti-maombi-badili-bweni";
var badiliTahasusi = BASEURL + "maombi-badili-tahasusi";
var ripotiTahasusi = BASEURL + "ripoti-badili-tahasusi";
var badiliJinaShule = BASEURL + "maombi-badili-jina-shule";
var HamishaShule = BASEURL + "maombi-hamisha-shule";
var futaShuleHiari = BASEURL + "maombi-futa-shule";
var ripotiFutaShuleHiari = BASEURL + "ripoti-futa-shule";
var ripotibadiliJinaShule = BASEURL + "ripoti-badili-jina-shule";
var badiliAinaUsajili = BASEURL + "maombi-badili-aina-usajili";
var badiliMmiliki = BASEURL + "maombi-badili-mmiliki";
var maoanzishaShuleJumlaAPI = BASEURL + "jumla-maombi-kuanzisha-shule";
var maommilikiShuleJumlaAPI = BASEURL + "jumla-maombi-mmiliki-shule";
var thibitshaUmilikiAPI = BASEURL + "jumla-thibitisha-mmiliki-shule";
var maokusajiliShuleJumlaAPI = BASEURL + "jumla-maombi-kusajili-shule";
var anzishaShuleJumlaAPI = BASEURL + "jumla-kuanzisha-shule";
var menejaShuleJumlaAPI = BASEURL + "jumla-meneja-shule";
var sajiliShuleJumlaAPI = BASEURL + "jumla-sajili-shule";
var sajiliShuleJumlaKatAPI = BASEURL + "jumla-sajili-shule-kat";
var sajiliShuleJumlaMikoaAPI = BASEURL + "jumla-sajili-shule-mikoa";
var futaShuleJumlaAPI = BASEURL + "jumla-futa-shule";
var mwombajiListAPI = BASEURL + "mwombaji-kuanzisha-shule";
// var lgaListAPI = BASEURL+"lga-kuanzisha-shule";
var ombiDetails = BASEURL + "view-ombi-details";
var ombiFutaDetails = BASEURL + "view-ombi-futa-details";
var ripotiFutaDetails = BASEURL + "view-ripoti-futa-details";
var badiliDetails = BASEURL + "view-badili-details";
var ripbadiliDetails = BASEURL + "view-rip-badili-details";
var badiliDahaliaDetalis = BASEURL + "view-badili-dahalia";
var ripotibadiliDahaliaDetalis = BASEURL + "ripoti-badili-dahalia";
var bweniDetails = BASEURL + "view-bweni-details";
var badiliShuleDetails = BASEURL + "view-badili-shule-details";
var hamishaShuleDetails = BASEURL + "view-hamisha-shule-details";
var ripotibadiliShuleDetails = BASEURL + "view-ripoti-badili-shule-details";
var usajiliDetails = BASEURL + "view-aina-usajili-details";
var ombiMmilikiDetails = BASEURL + "view-ombi-mmiliki-details";
var ripotiMmilikiDetails = BASEURL + "view-ripoti-mmiliki-details";
var badiliMmilikiDetails = BASEURL + "view-ombi-badili-mmiliki-details";
var badiliMenejaDetails = BASEURL + "view-ombi-badili-meneja-details";
var badiliRipotiMmilikiDetails = BASEURL + "view-ripoti-badili-mmiliki-details";
var ombiKusajiliDetails = BASEURL + "view-ombi-kusajili-details";
var ombiKusajiliSerDetails = BASEURL + "view-ombi-kusajili-ser-details";
var ombiReply = BASEURL + "tuma-ombi-majibu";
var mmilikiReply = BASEURL + "tuma-mmiliki-majibu";
var menejaReply = BASEURL + "tuma-meneja-majibu";
var badiliReply = BASEURL + "tuma-badili-majibu";
var badiliBReply = BASEURL + "tuma-badili-bweni";
var badiliHReply = BASEURL + "tuma-badili-hamisha";
var badiliJinaReply = BASEURL + "tuma-badili-jina-majibu";
var badiliainaReply = BASEURL + "tuma-badili-aina-majibu";
var changeShule = BASEURL + "change-shule";
var sajiliReply = BASEURL + "tuma-sajili-majibu";
var futaReply = BASEURL + "futa-sajili";
var listAttachmentTypeAPI = BASEURL + "all-attachment-types";
// var rolesAPI = BASEURL + "roles";
var waombajiAPI = BASEURL + "applicants";
var vyeoAPI = BASEURL + "vyeolist";
var auditTrailAPI = BASEURL + "auditTrail";
var tahasusiAPI = BASEURL + "taasusilist";
var michepuoAPI = BASEURL + "michepuolist";
var malipoAPI = BASEURL + "malipolist";
var registerWatumiajiAPI = BASEURL + "register";

var updateWaombajiAPI = BASEURL + "update-applicant";
var FutaRoleAPI = BASEURL + "futarole";
var futaTahasusiAPI = BASEURL + "futatahasusi";
var futaMalipoAPI = BASEURL + "futamalipo";
var futaKiambatishoAPI = BASEURL + "futakiambatisho";
var registerCheoAPI = BASEURL + "registerCheo";
var updateCheoAPI = BASEURL + "updateCheo";
var deleteCheoAPI = BASEURL + "deleteCheo";
var registerTahasusiAPI = BASEURL + "registerTahasusi";
var updateTahasusiAPI = BASEURL + "editTahasusi";
var registerMchepuoAPI = BASEURL + "registerMchepuo";
var updateMchepuoAPI = BASEURL + "editMchepuo";
var futaMchepuoAPI = BASEURL + "deleteMchepuo";
var registerAdaAPI = BASEURL + "registerAda";
var registerKumbNaAPI = BASEURL + "registerKumbNa";
var editAdaAPI = BASEURL + "editAda";
var sajiliHatiAPI = BASEURL + "add-attachment";
// var updateHatiAPI = BASEURL + "edit-attachment";
var pandishaHatiAPI = BASEURL + "upload-attachment";
var verify = BASEURL + "verify";
var changepassAPI = BASEURL + "changepass";

app.post("/authOLD", function (req, res) {
  // console.log("url " + req.url);
  var username = req.body.username;
  var password = req.body.password;
  var ip_address = requestIp.getClientIp(req);
  var browser_used = req.headers["user-agent"];
  req.session.loginAttempt = 0;
  request(
    {
      url: loginAPI,
      method: "POST",
      json: {
        browser_used: req.session.browser_used,
        username: username,
        password: password,
        ip_address: ip_address,
        browser_used: browser_used,
      },
    },
    function (error, response, body) {
      if (error) {
        res.redirect("/");
      } else if (body !== undefined) {
        // console.log('body')
        // console.log(body)
        if(body == 'Too many requests, please try again later.'){
          res.render(path.join(__dirname + "/public/design/login"), {
            req: req,
            message: "Too many requests, please try again after 10 minutes.",
          });
        }else{
        var message = body.message;
        var statusCode = body.statusCode;
        if (statusCode == 302) {
          req.session.loginAttempt = req.session.loginAttempt+1
          res.render(path.join(__dirname + "/public/design/login"), {
            req: req,
            message: message,
          });
        } else if (statusCode == 300) {
          var userID = body.id;
          var token = body.token;
          var RoleManage = body.RoleManage;
          var user_level = body.user[0].user_level;
          var userName = body.user[0].name;
          var cheoName = body.user[0].rank_name;
          var office = body.user[0].office;
          var resultcode = body.statusCode;
          var staffID = body.user[0].id;
          var twofa = body.user[0].twofa;
          var email = body.user[0].email;
          req.session.UserLevel = user_level;
          req.session.office = office;
          req.session.twofa = twofa;
          req.session.Token = token;
          req.session.userID = staffID;
          req.session.userName = userName;
          req.session.cheoName = cheoName;
          req.session.email = email;
          req.session.ip_address = ip_address;
          req.session.browser_used = browser_used;
          req.session.RoleManage = RoleManage;
          // for(var i = 0; i < RoleManage.length; i++){
          //   var permmission_id = RoleManage[i].permission_id;
          //   objPerm.push({"permmission_id": permmission_id})
          // }

          // console.info(
          //   new Date() +
          //     ": " +
          //     username +
          //     " with IP: " +
          //     requestIp.getClientIp(req) +
          //     ": Successful login"
          // );
          if (twofa == 0) {
            if (req.session.UserLevel == 10) {
              res.redirect("/RipotiZilizosajiliwa");
            } else {
              res.redirect("/Dashboard");
            }
          } else {
            res.redirect("/TwoFA");
          }
        }
      }
      } else {
        res.render(path.join(__dirname + "/public/design/login"), {
          req: req,
          message: message,
        });
      }
      
    }
  );

});

app.get("/TwoFA", function (req, res) {
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    // console.info(
    //   new Date() +
    //     ": " +
    //     req.session.userName +
    //     " with IP: " +
    //     requestIp.getClientIp(req) +
    //     ": access 2FA"
    // );
    res.render(path.join(__dirname + "/public/design/twofa"), {
      req: req,
      useLev: req.session.UserLevel,
                        userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
      cheoName: req.session.cheoName,
      baruapepe: req.session.email,
    });
  } else {
    res.redirect("/");
  }
});

app.get("/Logs", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    const startPath = "./logs/";
    const filter = ".log";

    console.info(
      new Date() +
        ": " +
        req.session.userName +
        " with IP: " +
        requestIp.getClientIp(req) +
        ": access Audit Trail"
    );
    if (!fs.existsSync(startPath)) {
      console.log("no dir ", startPath);
      return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
      var filename = path.join(startPath, files[i]);
      var stat = fs.lstatSync(filename);
      if (stat.isDirectory()) {
        fromDir(filename, filter); //recurse
      } else if (filename.endsWith(filter)) {
        console.log("-- found: ", filename);
        var fileout = filename.split("/");
        obj.push({ filename: fileout[1] });
      }
    }
    // console.log(obj)
    res.render(path.join(__dirname + "/public/design/audit_trail"), {
      req: req,
      useLev: req.session.UserLevel,
      userName: req.session.userName,
      RoleManage: req.session.RoleManage,
      userID: req.session.userID,
      cheoName: req.session.cheoName,
      baruapepe: req.session.email,
      logs: obj,
    });
  } else {
    res.redirect("/");
  }
});

app.get("/AuditFile/:id", function (req, res) {
  var filename = req.params.id;
  console.info(
    new Date() +
      ": " +
      req.session.userName +
      " with IP: " +
      requestIp.getClientIp(req) +
      ": download Audit Trail with filename " +
      filename
  );
  res.download(__dirname + "/logs/" + filename);
});

app.get("/PasswordReset", function (req, res) {
  res.render(path.join(__dirname + "/public/design/password_reset"));
});

app.post("/WekaNywira", function (req, res) {
  var email = req.body.email;
  request(
    {
      url: passResAPI,
      method: "POST",
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        email: email,
      },
    },
    function (error, response, body) {
      if (error) {
        console.error(
          new Date() +
            ": " +
            email +
            " with IP: " +
            requestIp.getClientIp(req) +
            ": fail to reset password " +
            error
        );
        res.send("failed");
      }
      if (body !== undefined) {
        // console.log(body)
        var message = body.message;
        var statusCode = body.statusCode;
        if (statusCode == 302) {
          res.render(path.join(__dirname + "/public/design/login"), {
            req: req,
            message: message,
          });
        } else if (statusCode == 300) {
          // console.log("2FA: " + req.session.twofa);
          console.info(
            new Date() +
              ": " +
              email +
              " with IP: " +
              requestIp.getClientIp(req) +
              ": reset password successful"
          );

          res.render(path.join(__dirname + "/public/design/badili_nywira"), {
            req: req,
            email: email,
          });
        }
        else {
          res.redirect("/");
        }
      }
    }
  );
});

app.post("/BadiliNywira", function (req, res) {
  console.log(req.body);
  var email = req.body.email;
  var msimbo = req.body.msimbo;
  var password = req.body.password;
  request(
    {
      url: thibitishapassAPI,
      method: "POST",
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        email: email,
        password: password,
        msimbo: msimbo,
      },
    },
    function (error, response, body) {
      if (error) {
        console.error(
          new Date() +
            ": " +
            email +
            " with IP: " +
            requestIp.getClientIp(req) +
            " fail to access  /BadiliNywira Endpoint" +
            error
        );
        // res.send("failed");
      }
      if (body !== undefined) {
        // console.log(body)
        var message = body.message;
        var statusCode = body.statusCode;
        if (statusCode == 302) {
          res.render(path.join(__dirname + "/public/design/login"), {
            req: req,
            message: message,
          });
        } else if (statusCode == 300) {
          // console.log("2FA: " + req.session.twofa);
          console.info(
            new Date() +
              ": " +
              email +
              " with IP: " +
              requestIp.getClientIp(req) +
              " Successful to change password"
          );
          req.flash("error", message);
          res.render(path.join(__dirname + "/public/design/login"), {
            req: req,
            message: message,
          });
        }
        else {
          res.redirect("/");
        }
      }
    }
  );
});

app.post("/BadiliPass", function (req, res) {
  console.log(req.body);
  var userid = req.body.userid;
  var oldpassword = req.body.oldpassword;
  var password = req.body.password;
  request(
    {
      url: changepassAPI,
      method: "POST",
      headers: {
        Authorization: "Bearer" + " " + req.session.Token,
        "Content-Type": "application/json",
      },
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        userid: userid,
        password: password,
        oldpassword: oldpassword,
      },
    },
    function (error, response, body) {
      if (error) {
        console.error(
          new Date() +
            ": " +
            " with IP: " +
            requestIp.getClientIp(req) +
            " fail to access  /BadiliPass Endpoint" +
            error
        );
        res.send("failed");
      }
      if (body !== undefined) {
        console.log(body)
res.send(body)
      }
    }
  );
});

app.post("/Wezesha2FA", function (req, res) {
  var faValue = req.body.faValue;
  request(
    {
      url: wezeshaAPI,
      method: "POST",
      headers: {
        Authorization: "Bearer" + " " + req.session.Token,
        "Content-Type": "application/json",
      },
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        faValue: faValue,
      },
    },
    function (error, response, body) {
      if (error) {
        console.error(new Date() + ": fail to access /Wezesha2FA " + error);
        res.send("failed");
      }
      if (body !== undefined) {
        console.log(body);
        var message = body.message;
        var statusCode = body.statusCode;
        if (statusCode == 300) {
          // console.log("uewrurure " + req.session.userID)
          console.info(
            new Date() + ": " + req.session.userName + "Successful 2FA"
          );
          res.send({ message: message });
        }
        else {
          res.redirect("/");
        }
      }
    }
  );
});

app.post("/Thibitisha2FA", function (req, res) {
  console.log(req.body);
  var faValue = req.body.faValue;
  request(
    {
      url: thibitishaAPI,
      method: "POST",
      headers: {
        Authorization: "Bearer" + " " + req.session.Token,
        "Content-Type": "application/json",
      },
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        faValue: faValue,
      },
    },
    function (error, response, body) {
      if (error) {
        console.error(new Date() + ": fail to access /Thibitisha2FA " + error);
        res.send("failed");
      }
      if (body !== undefined) {
        console.log(body);
        var message = body.message;
        var statusCode = body.statusCode;
        if (statusCode == 300) {
          // console.log("uewrurure " + req.session.userID)
          console.info(new Date() + ": Successful /Thibitisha2FA");
          res.send({ message: message, statusCode: statusCode });
        }
        else {
          res.redirect("/");
        }
      }
    }
  );
});

app.post("/ScanTrackNo", function (req, res) {
  console.log(req.body);
  var trackingNo = req.body.trackno;
  request(
    {
      url: scanAPI,
      method: "POST",
      headers: {
        Authorization: "Bearer" + " " + req.session.Token,
        "Content-Type": "application/json",
      },
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        trackingNo: trackingNo,
      },
    },
    function (error, response, body) {
      if (error) {
        console.error(
          new Date() + ": " + trackno + " fail to access /ScanTrackNo " + error
        );
        res.send("failed");
      }
      if (body !== undefined) {
        console.log(body);
        var message = body.message;
        var jina = body.jina;
        var statusCode = body.statusCode;
        var finalText = message + " - " + jina;
        if (statusCode == 300) {
          // console.log("uewrurure " + req.session.userID)
          console.info(
            new Date() + trackingNo + ": Successful /ScanTrackNo Scanned"
          );
          res.send({ message: finalText });
        }
        else {
          res.redirect("/");
        }
      }
    }
  );
});

app.post("/SimulatePayment", function (req, res) {
  var trackingNo = req.body.trackno;
  request(
    {
      url: simulateAPI,
      method: "POST",
      headers: {
        Authorization: "Bearer" + " " + req.session.Token,
        "Content-Type": "application/json",
      },
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        trackingNo: trackingNo,
      },
    },
    function (error, response, body) {
      if (error) {
        console.error(new Date() + ": fail to login " + error);
        res.send("failed");
      }
      if (body !== undefined) {
        console.log(body);
        var message = body.message;
        var statusCode = body.statusCode;
        if (statusCode == 300) {
          // console.log("uewrurure " + req.session.userID)
          console.info(new Date() + trackingNo + ": Successful Scanned");
          res.send({ message: message });
        }
        if (statusCode == 209) {
          res.redirect("/");
        }
      }
    }
  );
});

// app.get("/UsajiliGraph", function (req, res) {
//   // var trackingNo = req.body.trackno;
//   request(
//     {
//       url: sajiliGrahpAPI,
//       method: "GET",
//       headers: {
//         Authorization: "Bearer" + " " + req.session.Token,
//         "Content-Type": "application/json",
//       },
//       //json: {"browser_used": req.session.browser_used, "ip_address": req.session.ip_address, trackingNo: trackingNo}
//     },
//     function (error, response, body) {
//       if (error) {
//         console.error(new Date() + ": fail to access /UsajiliGraph " + error);
//         res.send("failed");
//       }
//       if (body !== undefined) {
//         // console.log(body)
//         var jsonData = JSON.parse(body);
//         var message = jsonData.message;
//         var statusCode = jsonData.statusCode;
//         var data = jsonData.data;
//         var name = jsonData.name;
//         var type = jsonData.type;
//         if (statusCode == 300) {
//           // console.log(data)
//           console.info(new Date() + ": Successful UsajiliGraph");

//           res.send({ data: data, name: name, type: type });
//         }
//         if (statusCode == 209) {
//           res.redirect("/");
//         }
//       }
//     }
//   );
// });

app.get("/CreateRole", function (req, res) {

  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: permissionsAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
          is_paginated : 'false',
          status : true
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleList " + error
          );
          res.send("failed");
        }
          console.log("here" , body.data);
        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
        
          if (statusCode == 300) {
            // console.log(data);
            // console.log(
            //   new Date() + " " + req.session.userName + ": /KuongezaMikondo"
            // );
            
            res.render(
              path.join(__dirname + "/public/design/create_role"),
              {
                req: req,
                useLev: req.session.UserLevel,
                userName: req.session.userName,
                RoleManage: req.session.RoleManage,
                userID: req.session.userID,
                cheoName: req.session.cheoName,
                data: data,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/EditRole/:id", function (req, res) {
  var role_id = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    // console.log(req.session.office + " jjdjdjd " + req.session.UserLevel);
    request(
      {
        url: editRoleAPI+`/${role_id}`,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
          role_id: role_id,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleList " + error
          );
          res.send("failed");
        }
        console.log(body)
        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var statusCode = jsonData.statusCode;
       
          if (statusCode == 300) {
              var message = jsonData.message;
              var permissions = jsonData.permissions;
              var role_permissions = jsonData.role_permissions;
              var role = jsonData.role;
              var assigned_permissions = [];
              role_permissions.forEach(role_permission =>{
                  assigned_permissions.push(role_permission.permission_id);
              });
            res.render(path.join(__dirname + "/public/design/edit_role"), {
              req: req,
             
              permissions: permissions,
              assigned_permissions: assigned_permissions,
              role : role
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
          if (statusCode == 306) {
            res.redirect("/Roles");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});



app.get("/Kata", function (req, res) {
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
        var hasMatch = false;
        for (var index = 0; index < req.session.RoleManage.length; ++index) {
          var animal = req.session.RoleManage[index];
          if (animal.permission_id == 53) {
            res.render(path.join(__dirname + "/public/design/wards"), {
                    req: req,
                    useLev: req.session.UserLevel,
                    userName: req.session.userName,
                    RoleManage: req.session.RoleManage,
                    userID: req.session.userID,
                    cheoName: req.session.cheoName,
            });
          }
        }
      } else {
        res.redirect("/");
      }
});

// app.get("/BadiliTahasusi/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: ongezatahasusiDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           // console.log(new Date() + ": fail to MaombiKuanzishaShuleJumla " + error)
//           console.error(
//             new Date() +
//               ": " +
//               req.session.userName +
//               " with IP: " +
//               requestIp.getClientIp(req) +
//               " fail to view details for change Tahasusi with TrackingNumber " +
//               TrackingNumber +
//               " error: " +
//               error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           console.log(jsonData);
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;

//           if (statusCode == 300) {
//             var data = jsonData.data;
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var registryTypeId = data[0].registry_type_id;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var area = data[0].area;
//             var streamOld = data[0].streamOld;
//             var streamNew = data[0].streamNew;
//             var school_id = data[0].school_id;
//             var establishId = data[0].establishId;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             // var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             // var objAttachment2 = jsonData.objAttachment2;
//             // console.log(objAttachment)
//             var Maoni = jsonData.Maoni;
//             // console.log(new Date() + " " + req.session.userName +  ": /BadiliMkondo")
//             console.info(
//               new Date() +
//                 ": " +
//                 req.session.userName +
//                 " with IP: " +
//                 requestIp.getClientIp(req) +
//                 " view details of change Tahasusi application with TrackingNumber " +
//                 TrackingNumber
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view_ongeza_tahasusi"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//               userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 registryTypeId: registryTypeId,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 streamNew: streamNew,
//                 streamOld: streamOld,
//                 language: language,
//                 school_size: school_size,
//                 userLevel: req.session.UserLevel,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 establishId: school_id,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 school_id: school_id,
//                 subcategory: subcategory,
//                 count: 0,
//                 staffs: jsonData.staffs,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
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

app.get("/RipotiBadiliTahasusi/:id", function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: ripotiongezatahasusiDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          // console.log(new Date() + ": fail to MaombiKuanzishaShuleJumla " + error)
          console.error(
            new Date() +
              ": " +
              req.session.userName +
              " with IP: " +
              requestIp.getClientIp(req) +
              " fail to view report of change Tahasusi application with TrackingNumber " +
              TrackingNumber +
              " error: " +
              error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;

          if (statusCode == 300) {
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
            var school_id = data[0].school_id;
            var establishId = data[0].establishId;
            var WardName = data[0].WardName;
            var structure = data[0].structure;
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
                __dirname + "/public/design/view_ripoti_ongeza_tahasusi"
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
                school_size: school_size,
                userLevel: req.session.UserLevel,
                area: area,
                WardName: WardName,
                structure: structure,
                establishId: school_id,
                LgaNameMtu: LgaNameMtu,
                WardNameMtu: WardNameMtu,
                school_id: school_id,
                subcategory: subcategory,
                count: 0,
                staffs: jsonData.staffs,
                status: jsonData.status,
                objAttachment: objAttachment,
                objAttachment1: objAttachment1,
                Maoni: Maoni,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/verify/:id", function (req, res) {
  var TrackingNumber = req.params.id;
  request(
    {
      url: verify,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        TrackingNumber: TrackingNumber,
      },
    },
    function (error, response, body) {
      if (error) {
        console.log(
          new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
        );
        res.send("failed");
      }
      if (body !== undefined) {
        var jsonData = body;
        console.log(jsonData);
        var message = jsonData.message;
        var statusCode = jsonData.statusCode;
        console.log(
          new Date() + " " + req.session.userName + ": /Thibitisha acount"
        );
        res.render(path.join(__dirname + "/public/design/thibitisha_acount"), {
          req: req,
          statusCode: statusCode,
          message: message,
        });
      }
    }
  );
});

app.get("/ActiveMenu", function (req, res) {
 
  // if(req.session.userName){
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    const date = new Date().getHours();
    var majira;
    if (date < 12) {
      majira = "Habari za Asubuhi";
    } else if (date < 18) {
      majira = "Habari za Mchana";
    } else if (date > 18) {
      majira = "Habari za Jioni";
    }
    //  console.log(req.session.Token)
    request(
      {
        url: activeMenuAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to activeUserAPI " + error);
          res.send("failed");
        }
        // console.log(body)
        if (body !== undefined) {
          // console.log(body);
          var jsonData = JSON.parse(body);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          var count = jsonData.count;
          var kauntikuanza = jsonData.kauntikuanza;
          // var kauntimajengo = jsonData.kauntimajengo;
          // var kauntimmiliki = jsonData.kauntimmiliki;
          // var kauntibadilijina = jsonData.kauntibadilijina;
          // var kauntibweni = jsonData.kauntibweni;
          // var kauntidahalia = jsonData.kauntidahalia;
          // var kauntiainausajili = jsonData.kauntiainausajili;
          if (statusCode == 300) {
            // console.log("2FA: " + req.session.twofa);
            // console.log(new Date() + ": Successful dashbord");
            res.send({
              salamu: majira,
              name: data,
              count: count,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
              kauntikuanza: kauntikuanza,
              TwoFA: req.session.twofa,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.post("/OngezaComment", function (req, res) {
//   // console.log(req.body)
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var coments = req.body.coments;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var newstream = req.body.newstream;
//   var oldstream = req.body.oldstream;
//   var establishId = req.body.establishId;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: ongezaReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           newstream: newstream,
//           haliombi: haliombi,
//           replyType: 1,
//           oldstream: oldstream,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//           establishId: establishId,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliComment"
//             );
//             res.send("success");
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

app.post("/tengenezaRoles", function (req, res) {
  // for(var i = 0; i < req.body.permissions.length; i++){
  //   console.log(req.body.permissions[i])
  // }
  console.log(req.body)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: tengenezaRoleAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          roleName: req.body.role_name,
          permissions: req.body.permissions,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to login " + error);
          res.send("failed");
        }
        //  console.log(body)
        if (body !== undefined) {
          console.log(body);
          res.send({ statusCode: body.statusCode, message: body.message });
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/sasishaRole/:id", function (req, res) {
  // for(var i = 0; i < req.body.permissions.length; i++){
  //   console.log(req.body.permissions[i])
  // }
  console.log('hiii')
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: sasishaRoleAPI+"/"+req.params.id,
        method: "PUT",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          roleId: req.body.role_id,
          roleName: req.body.role_name,
          permissions: req.body.permissions,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to login " + error);
          res.send("failed");
        }
        //  console.log(body)
        if (body !== undefined) {
          // console.log("permissions zilizochaguliwa: " , req.body.permissions);
          res.send({ statusCode: body.statusCode, message: body.message });
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.post("/saveZone", function (req, res) {
//   // console.log(req.body)
//   var zonecode = req.body.zonecode;
//   var zonename = req.body.zonename;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: sajiliZoniAPI,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           zonecode: zonecode,
//           zonename: zonename,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to login " + error);
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           // console.log(body)
//           res.send({ statusCode: body.statusCode, message: body.message });
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

// app.post("/updateZone", function (req, res) {
//   console.log(req.body);
//   var zoneid = req.body.zoneid;
//   var zonecode = req.body.zonecode;
//   var zonename = req.body.zonename;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: updateZoniAPI,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           zonecode: zonecode,
//           zonename: zonename,
//           zoneid: zoneid,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to login " + error);
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           console.log(body);
//           res.send({ statusCode: body.statusCode, message: body.message });
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

// app.post("/FutaZoni", function (req, res) {
//   console.log(req.body);
//   var zoneid = req.body.name;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: deleteZoniAPI,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           zoneid: zoneid,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to login " + error);
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           console.log(body);
//           res.send({ status: "success" });
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

app.post("/UserProfile", function (req, res) {
  console.log(req.body);
  // var zonecode = req.body.zonecode;
  // var zonename = req.body.zonename;
  // request({
  //   url: sajiliZoniAPI,
  //   method: 'POST',
  //   headers: {
  //     'Authorization': 'Bearer' + " " + req.session.Token,
  //     'Content-Type': 'application/json',
  //   },
  //   json: {"browser_used": req.session.browser_used, "ip_address": req.session.ip_address, zonecode: zonecode, zonename: zonename}
  // }, function(error, response, body){
  //   if(error) {
  //     console.log(new Date() + ": fail to login " + error)
  //     res.send("failed")
  //   }
  //  // console.log(body)
  //   if (body !== undefined) {
  //     console.log(body)
  //     res.send({"status": "success"})
  //     // var message = body.message;
  //     // var userID = body.id;
  //     // var token = body.token;
  //     // var resultcode = body.statusCode;
  //     // req.session.Token = token;
  //     // // var refreshToken = body.refreshToken;

  //   }
  // });
});

app.get("/TaarifaMtumiaji/:id", function (req, res) {
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    res.render(path.join(__dirname + "/public/design/user_profile"), {
      req: req,
      useLev: req.session.UserLevel,
                        userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
      cheoName: req.session.cheoName,
    });
  } else {
    res.redirect("/");
  }
});



// app.get("/ZoneList", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: mikoaListAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to KandaList " + error);
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           // console.log(body)
//           var jsonData = JSON.parse(body);
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var zones = jsonData.zones;

//           if (statusCode == 300) {
//             if (zones.length <= 0) {
//               var zoneCode = "";
//               var zoneName = "";
//               obj.push({ zoneCode: zoneCode, zoneName: zoneName });
//             } else {
//               for (var i = 0; i < zones.length; i++) {
//                 console.log(zones);
//                 var zoneCode = zones[i].zoneCode;
//                 var zoneName = zones[i].zoneName;
//                 obj.push({ zoneCode: zoneCode, zoneName: zoneName });
//               }
//             }
//             // console.log(obj)
//             console.log(new Date() + ": Successful KandaList");
//             res.send(obj);
//             //
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

app.get("/Halmashauri", function (req, res) {
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    var hasMatch =false;
    for (var index = 0; index < req.session.RoleManage.length; ++index) {
        var animal = req.session.RoleManage[index]; 
    if(animal.permission_id == 45){ 
    res.render(path.join(__dirname + "/public/design/halmashauri"), {
      req: req,
      useLev: req.session.UserLevel,
                        userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
      cheoName: req.session.cheoName,
    });
  }
}
  } else {
    res.redirect("/");
  }
});



app.get("/Mitaa", function (req, res) {
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    var hasMatch = false;
    for (var index = 0; index < req.session.RoleManage.length; ++index) {
      var animal = req.session.RoleManage[index];
      if (animal.permission_id == 53) {
        res.render(path.join(__dirname + "/public/design/streets"), {
          req: req,
          useLev: req.session.UserLevel,
          userName: req.session.userName,
          RoleManage: req.session.RoleManage,
          userID: req.session.userID,
          cheoName: req.session.cheoName,
        });
      }
    }
  } else {
    res.redirect("/");
  }
});


// app.get("/MaombiMmilikiShule", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maommilikiShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         //  console.log(body)
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             // console.log("jjdjdjd " + req.session.UserLevel)
//             request(
//               {
//                 url: maommilikiShuleListAPI,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }

//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /MaombiMmilikiShule"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/mmiliki"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

app.get("/RipotiUthibitisho", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: thibitshaUmilikiAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        //  console.log(body)
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message1 = jsonData.message;
          var statusCode1 = jsonData.statusCode;
          var data1 = jsonData.data;
          if (statusCode1 == 300) {
            // console.log("jjdjdjd " + req.session.UserLevel)
            request(
              {
                url: thibmmilikiShuleListAPI,
                method: "POST",
                headers: {
                  Authorization: "Bearer" + " " + req.session.Token,
                  "Content-Type": "application/json",
                },
                json: {
                  browser_used: req.session.browser_used,
                  ip_address: req.session.ip_address,
                  UserLevel: req.session.UserLevel,
                  Office: req.session.office,
                },
              },
              function (error, response, body) {
                if (error) {
                  console.log(
                    new Date() + ": fail to MaombiKuanzishaShuleList " + error
                  );
                  res.send("failed");
                }

                if (body !== undefined) {
                  // var jsonData = JSON.parse(body)
                  var jsonData = body;
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                  if (statusCode == 300) {
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
                      new Date() +
                        " " +
                        req.session.userName +
                        ": /MaombiMmilikiShule"
                    );

                    res.render(
                      path.join(__dirname + "/public/design/reports/thibitishammiliki"),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                        useLev: req.session.UserLevel,
                                          userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                        cheoName: req.session.cheoName,
                      }
                    );
                  }
                  if (statusCode == 209) {
                    res.redirect("/");
                  }
                }
              }
            );
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/BadiliMmiliki", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maommilikiShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         //  console.log(body)
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             // console.log("jjdjdjd " + req.session.UserLevel)
//             request(
//               {
//                 url: maobadilimmilikiShuleListAPI,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }

//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var WardName = data[i].WardName;
//                       var owner_name = data[i].owner_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         WardName: WardName,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         owner_name: owner_name,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /BadiliMmiliki"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/badili_mmiliki"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

// app.get("/BadiliMeneja", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maommilikiShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         //  console.log(body)
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             // console.log("jjdjdjd " + req.session.UserLevel)
//             request(
//               {
//                 url: maobadilimenejaShuleListAPI,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }

//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var WardName = data[i].WardName;
//                       var owner_name = data[i].owner_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         WardName: WardName,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         owner_name: owner_name,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /BadiliMmiliki"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/badili_meneja"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

app.get("/ViewBadilimeneja", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maommilikiShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        //  console.log(body)
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message1 = jsonData.message;
          var statusCode1 = jsonData.statusCode;
          var data1 = jsonData.data;
          if (statusCode1 == 300) {
            // console.log("jjdjdjd " + req.session.UserLevel)
            request(
              {
                url: ripotibadilimenejaShuleListAPI,
                method: "POST",
                headers: {
                  Authorization: "Bearer" + " " + req.session.Token,
                  "Content-Type": "application/json",
                },
                json: {
                  browser_used: req.session.browser_used,
                  ip_address: req.session.ip_address,
                  UserLevel: req.session.UserLevel,
                  Office: req.session.office,
                },
              },
              function (error, response, body) {
                if (error) {
                  console.log(
                    new Date() + ": fail to MaombiKuanzishaShuleList " + error
                  );
                  res.send("failed");
                }

                if (body !== undefined) {
                  // var jsonData = JSON.parse(body)
                  var jsonData = body;
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                  if (statusCode == 300) {
                    for (var i = 0; i < data.length; i++) {
                      var tracking_number = data[i].tracking_number;
                      var user_id = data[i].user_id;
                      var LgaName = data[i].LgaName;
                      var RegionName = data[i].RegionName;
                      var school_name = data[i].school_name;
                      var WardName = data[i].WardName;
                      var owner_name = data[i].owner_name;
                      var created_at = data[i].created_at;
                      var remain_days = data[i].remain_days;
                      req.session.TrackingNumber = tracking_number;
                      obj.push({
                        tracking_number: tracking_number,
                        user_id: user_id,
                        WardName: WardName,
                        school_name: school_name,
                        LgaName: LgaName,
                        owner_name: owner_name,
                        RegionName: RegionName,
                        created_at: created_at,
                        remain_days: remain_days,
                      });
                    }
                    console.log(
                      new Date() +
                        " " +
                        req.session.userName +
                        ": /BadiliMmiliki"
                    );
                    res.render(
                      path.join(
                        __dirname + "/public/design/reports/ripoti_badili_meneja"
                      ),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                        useLev: req.session.UserLevel,
                        userName: req.session.userName,
                        RoleManage: req.session.RoleManage,
                        userID: req.session.userID,
                        cheoName: req.session.cheoName,
                      }
                    );
                  }
                  if (statusCode == 209) {
                    res.redirect("/");
                  }
                }
              }
            );
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/RipotiBadiliMmiliki", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maommilikiShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        //  console.log(body)
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message1 = jsonData.message;
          var statusCode1 = jsonData.statusCode;
          var data1 = jsonData.data;
          console.log("hahahahha" , jsonData)
          if (statusCode1 == 300) {
            // console.log("jjdjdjd " + req.session.UserLevel)
            request(
              {
                url: ripotibadilimmilikiShuleListAPI,
                method: "POST",
                headers: {
                  Authorization: "Bearer" + " " + req.session.Token,
                  "Content-Type": "application/json",
                },
                json: {
                  browser_used: req.session.browser_used,
                  ip_address: req.session.ip_address,
                  UserLevel: req.session.UserLevel,
                  Office: req.session.office,
                },
              },
              function (error, response, body) {
                if (error) {
                  console.log(
                    new Date() + ": fail to MaombiKuanzishaShuleList " + error
                  );
                  res.send("failed");
                }

                if (body !== undefined) {
                  // var jsonData = JSON.parse(body)
                  var jsonData = body;
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                  if (statusCode == 300) {
                    for (var i = 0; i < data.length; i++) {
                      var tracking_number = data[i].tracking_number;
                      var user_id = data[i].user_id;
                      var LgaName = data[i].LgaName;
                      var RegionName = data[i].RegionName;
                      var school_name = data[i].school_name;
                      var WardName = data[i].WardName;
                      var owner_name = data[i].owner_name;
                      var created_at = data[i].created_at;
                      var remain_days = data[i].remain_days;
                      req.session.TrackingNumber = tracking_number;
                      obj.push({
                        tracking_number: tracking_number,
                        user_id: user_id,
                        WardName: WardName,
                        school_name: school_name,
                        LgaName: LgaName,
                        owner_name: owner_name,
                        RegionName: RegionName,
                        created_at: created_at,
                        remain_days: remain_days,
                      });
                    }
                    console.log(
                      new Date() +
                        " " +
                        req.session.userName +
                        ": /BadiliMmiliki"
                    );
                    res.render(
                      path.join(
                        __dirname + "/public/design/reports/ripoti_badili_mmiliki"
                      ),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                        useLev: req.session.UserLevel,
                                          userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                        cheoName: req.session.cheoName,
                      }
                    );
                  }
                  if (statusCode == 209) {
                    res.redirect("/");
                  }
                }
              }
            );
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/MaombiKusajiliShule", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             console.log(
//               req.session.office + " jjdjdjd " + req.session.UserLevel
//             );
//             request(
//               {
//                 url: maousajiliShuleListAPI,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }
//                 console.log(body);
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /MaombiKusajiliShule"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/usajili"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

// app.get("/MaombiKusajiliShuleSerikali", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             console.log(
//               req.session.office + " jjdjdjd " + req.session.UserLevel
//             );
//             request(
//               {
//                 url: maousajiliShuleSerListAPI,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }
//                 console.log(body);
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /MaombiKusajiliShuleSerikali"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/usajili_serikali"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//           if (statusCode1 == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

// app.get("/KuongezaMikondo", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         console.log(body)
//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body);
//           var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             console.log(
//               req.session.office + " jjdjdjd " + req.session.UserLevel
//             );
//             request(
//               {
//                 url: badiliMkondo,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }
//                 console.log(body);
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /KuongezaMikondo"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/mikondo"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//           if (statusCode1 == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

app.get("/RipotiKuongezaMikondo", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maokusajiliShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message1 = jsonData.message;
          var statusCode1 = jsonData.statusCode;
          var data1 = jsonData.data;
          if (statusCode1 == 300) {
            console.log(
              req.session.office + " jjdjdjd " + req.session.UserLevel
            );
            request(
              {
                url: ripotibadiliMkondo,
                method: "POST",
                headers: {
                  Authorization: "Bearer" + " " + req.session.Token,
                  "Content-Type": "application/json",
                },
                json: {
                  browser_used: req.session.browser_used,
                  ip_address: req.session.ip_address,
                  UserLevel: req.session.UserLevel,
                  Office: req.session.office,
                },
              },
              function (error, response, body) {
                if (error) {
                  console.log(
                    new Date() + ": fail to MaombiKuanzishaShuleList " + error
                  );
                  res.send("failed");
                }
                console.log(body);
                if (body !== undefined) {
                  // var jsonData = JSON.parse(body)
                  var jsonData = body;
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                  if (statusCode == 300) {
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
                      new Date() +
                        " " +
                        req.session.userName +
                        ": /KuongezaMikondo"
                    );
                    res.render(
                      path.join(__dirname + "/public/design/reports/ripoti_mikondo"),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                        useLev: req.session.UserLevel,
                        userName: req.session.userName,
                        RoleManage: req.session.RoleManage,
                        userID: req.session.userID,
                        cheoName: req.session.cheoName,
                      }
                    );
                  }
                  if (statusCode == 209) {
                    res.redirect("/");
                  }
                }
              }
            );
          }
          if (statusCode1 == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/KuongezaDahalia", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             console.log(
//               req.session.office + " jjdjdjd " + req.session.UserLevel
//             );
//             request(
//               {
//                 url: badiliDahalia,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }
//                 console.log(body);
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /KuongezaMikondo"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/dahalia"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//           if (statusCode1 == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

app.get("/RipotiDahalia", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maokusajiliShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message1 = jsonData.message;
          var statusCode1 = jsonData.statusCode;
          var data1 = jsonData.data;
          if (statusCode1 == 300) {
            console.log(
              req.session.office + " jjdjdjd " + req.session.UserLevel
            );
            request(
              {
                url: ripotiDahalia,
                method: "POST",
                headers: {
                  Authorization: "Bearer" + " " + req.session.Token,
                  "Content-Type": "application/json",
                },
                json: {
                  browser_used: req.session.browser_used,
                  ip_address: req.session.ip_address,
                  UserLevel: req.session.UserLevel,
                  Office: req.session.office,
                },
              },
              function (error, response, body) {
                if (error) {
                  console.log(
                    new Date() + ": fail to MaombiKuanzishaShuleList " + error
                  );
                  res.send("failed");
                }
                console.log(body);
                if (body !== undefined) {
                  // var jsonData = JSON.parse(body)
                  var jsonData = body;
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                  if (statusCode == 300) {
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
                      new Date() +
                        " " +
                        req.session.userName +
                        ": /KuongezaMikondo"
                    );
                    res.render(
                      path.join(__dirname + "/public/design/reports/ripoti_dahalia"),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                        useLev: req.session.UserLevel,
                                          userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                        cheoName: req.session.cheoName,
                      }
                    );
                  }
                  if (statusCode == 209) {
                    res.redirect("/");
                  }
                }
              }
            );
          }
          if (statusCode1 == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/KuongezaTahasusi", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to KuongezaTahasusi " + error);
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             // console.log(req.session.office + " jjdjdjd " + req.session.UserLevel)
//             request(
//               {
//                 url: badiliTahasusi,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to KuongezaTahasusi " + error
//                   );
//                   res.send("failed");
//                 }
//                 console.log(body);
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /KuongezaTahasusi"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/tahasusi"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//           if (statusCode1 == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

app.get("/RipotiTahasusi", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maokusajiliShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to KuongezaTahasusi " + error);
          res.send("failed");
        }
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message1 = jsonData.message;
          var statusCode1 = jsonData.statusCode;
          var data1 = jsonData.data;
          if (statusCode1 == 300) {
            // console.log(req.session.office + " jjdjdjd " + req.session.UserLevel)
            request(
              {
                url: ripotiTahasusi,
                method: "POST",
                headers: {
                  Authorization: "Bearer" + " " + req.session.Token,
                  "Content-Type": "application/json",
                },
                json: {
                  browser_used: req.session.browser_used,
                  ip_address: req.session.ip_address,
                  UserLevel: req.session.UserLevel,
                  Office: req.session.office,
                },
              },
              function (error, response, body) {
                if (error) {
                  console.log(
                    new Date() + ": fail to KuongezaTahasusi " + error
                  );
                  res.send("failed");
                }
                console.log(body);
                if (body !== undefined) {
                  // var jsonData = JSON.parse(body)
                  var jsonData = body;
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                  if (statusCode == 300) {
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
                      new Date() +
                        " " +
                        req.session.userName +
                        ": /KuongezaTahasusi"
                    );
                    res.render(
                      path.join(__dirname + "/public/design/reports/ripoti_tahasusi"),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                        useLev: req.session.UserLevel,
                                          userName: req.session.userName,
                        RoleManage: req.session.RoleManage,
                        userID: req.session.userID,
                        cheoName: req.session.cheoName,
                      }
                    );
                  }
                  if (statusCode == 209) {
                    res.redirect("/");
                  }
                }
              }
            );
          }
          if (statusCode1 == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/KuongezaBweni", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             // console.log(req.session.office + " jjdjdjd " + req.session.UserLevel)
//             request(
//               {
//                 url: badiliBweni,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(new Date() + ": fail to KuongezaBweni " + error);
//                   res.send("failed");
//                 }
//                 // console.log(body)
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /KuongezaBweni"
//                     );
//                     res.render(path.join(__dirname + "/public/design/maombi/bweni"), {
//                       req: req,
//                       total_month: data1,
//                       maombi: obj,
//                       useLev: req.session.UserLevel,
//                                         userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                       cheoName: req.session.cheoName,
//                     });
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//           if (statusCode1 == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

app.get("/RipotiKuongezaBweni", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maokusajiliShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message1 = jsonData.message;
          var statusCode1 = jsonData.statusCode;
          var data1 = jsonData.data;
          if (statusCode1 == 300) {
            // console.log(req.session.office + " jjdjdjd " + req.session.UserLevel)
            request(
              {
                url: ripotibadiliBweni,
                method: "POST",
                headers: {
                  Authorization: "Bearer" + " " + req.session.Token,
                  "Content-Type": "application/json",
                },
                json: {
                  browser_used: req.session.browser_used,
                  ip_address: req.session.ip_address,
                  UserLevel: req.session.UserLevel,
                  Office: req.session.office,
                },
              },
              function (error, response, body) {
                if (error) {
                  console.log(new Date() + ": fail to KuongezaBweni " + error);
                  res.send("failed");
                }
                // console.log(body)
                if (body !== undefined) {
                  // var jsonData = JSON.parse(body)
                  var jsonData = body;
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                  if (statusCode == 300) {
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
                      new Date() +
                        " " +
                        req.session.userName +
                        ": /KuongezaBweni"
                    );
                    res.render(
                      path.join(__dirname + "/public/design/reports/ripoti_bweni"),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                        useLev: req.session.UserLevel,
                                          userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                        cheoName: req.session.cheoName,
                      }
                    );
                  }
                  if (statusCode == 209) {
                    res.redirect("/");
                  }
                }
              }
            );
          }
          if (statusCode1 == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/BadiliJina", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             console.log(
//               req.session.office + " jjdjdjd " + req.session.UserLevel
//             );
//             request(
//               {
//                 url: badiliJinaShule,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }
//                 console.log(body);
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() + " " + req.session.userName + ": /BadiliJina"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/jina_shule"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//           if (statusCode1 == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

// app.get("/Hamisha", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             console.log(
//               req.session.office + " jjdjdjd " + req.session.UserLevel
//             );
//             request(
//               {
//                 url: HamishaShule,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }
//                 console.log(body);
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() + " " + req.session.userName + ": /BadiliJina"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/hamisha_shule"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//           if (statusCode1 == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

// app.get("/FutaShule", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             console.log(
//               req.session.office + " jjdjdjd " + req.session.UserLevel
//             );
//             request(
//               {
//                 url: futaShuleHiari,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }
//                 console.log(body);
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       var schoolId = data[i].schoolId;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         schoolId: schoolId,
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() + " " + req.session.userName + ": /BadiliJina"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/futa_shule"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//           if (statusCode1 == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

app.get("/RipotiKubadiliJina", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
   
    request(
      {
        url: maokusajiliShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        if (body !== undefined) {
          
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message1 = jsonData.message;
          var statusCode1 = jsonData.statusCode;
          var data1 = jsonData.data;
          console.log(body)
          if (statusCode1 == 300) {
            console.log(
              req.session.office + " jjdjdjd " + req.session.UserLevel
            );
            request(
              {
                url: ripotibadiliJinaShule,
                method: "POST",
                headers: {
                  Authorization: "Bearer" + " " + req.session.Token,
                  "Content-Type": "application/json",
                },
                json: {
                  browser_used: req.session.browser_used,
                  ip_address: req.session.ip_address,
                  UserLevel: req.session.UserLevel,
                  Office: req.session.office,
                },
              },
              function (error, response, body) {
                if (error) {
                  console.log(
                    new Date() + ": fail to MaombiKuanzishaShuleList " + error
                  );
                  res.send("failed");
                }
                
                if (body !== undefined) {
                  // var jsonData = JSON.parse(body)
                  var jsonData = body;
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                  if (statusCode == 300) {
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
                      new Date() + " " + req.session.userName + ": /BadiliJina"
                    );
                    console.log("hiiiiiiii jina")
                    res.render(
                      path.join(__dirname + "/public/design/reports/ripoti_jina_shule"),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                        useLev: req.session.UserLevel,
                                          userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                        cheoName: req.session.cheoName,
                      }
                    );
                  }
                  if (statusCode == 209) {
                    res.redirect("/");
                  }
                }
              }
            );
          }
          if (statusCode1 == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/BadiliUsajili", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maokusajiliShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message1 = jsonData.message;
//           var statusCode1 = jsonData.statusCode;
//           var data1 = jsonData.data;
//           if (statusCode1 == 300) {
//             console.log(
//               req.session.office + " jjdjdjd " + req.session.UserLevel
//             );
//             request(
//               {
//                 url: badiliAinaUsajili,
//                 method: "POST",
//                 headers: {
//                   Authorization: "Bearer" + " " + req.session.Token,
//                   "Content-Type": "application/json",
//                 },
//                 json: {
//                   browser_used: req.session.browser_used,
//                   ip_address: req.session.ip_address,
//                   UserLevel: req.session.UserLevel,
//                   Office: req.session.office,
//                 },
//               },
//               function (error, response, body) {
//                 if (error) {
//                   console.log(
//                     new Date() + ": fail to MaombiKuanzishaShuleList " + error
//                   );
//                   res.send("failed");
//                 }
//                 console.log(body);
//                 if (body !== undefined) {
//                   // var jsonData = JSON.parse(body)
//                   var jsonData = body;
//                   var message = jsonData.message;
//                   var statusCode = jsonData.statusCode;
//                   var data = jsonData.data;
//                   if (statusCode == 300) {
//                     for (var i = 0; i < data.length; i++) {
//                       var tracking_number = data[i].tracking_number;
//                       var user_id = data[i].user_id;
//                       var LgaName = data[i].LgaName;
//                       var RegionName = data[i].RegionName;
//                       var school_name = data[i].school_name;
//                       var created_at = data[i].created_at;
//                       var remain_days = data[i].remain_days;
//                       req.session.TrackingNumber = tracking_number;
//                       obj.push({
//                         tracking_number: tracking_number,
//                         user_id: user_id,
//                         school_name: school_name,
//                         LgaName: LgaName,
//                         RegionName: RegionName,
//                         created_at: created_at,
//                         remain_days: remain_days,
//                       });
//                     }
//                     console.log(
//                       new Date() +
//                         " " +
//                         req.session.userName +
//                         ": /BadiliUsajili"
//                     );
//                     res.render(
//                       path.join(__dirname + "/public/design/maombi/aina_usajili"),
//                       {
//                         req: req,
//                         total_month: data1,
//                         maombi: obj,
//                         useLev: req.session.UserLevel,
//                                           userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                       }
//                     );
//                   }
//                   if (statusCode == 209) {
//                     res.redirect("/");
//                   }
//                 }
//               }
//             );
//           }
//           if (statusCode1 == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });

// app.get("/MaombiKuanzishaShule", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     var hasMatch =false;
//     for (var index = 0; index < req.session.RoleManage.length; ++index) {
//         var animal = req.session.RoleManage[index]; 
//         console.log("cheki hii", animal.permission_id);
//     if(animal.permission_id == 2){ 
//     request(
//       {
//         url: maoanzishaShuleJumlaAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         // json: {"browser_used": req.session.browser_used, "ip_address": req.session.ip_address, "UserLevel": req.session.UserLevel, "Office": req.session.office}
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() +
//                 " " +
//                 req.session.userName +
//                 ": /MaombiKuanzishaShule"
//             );
//             res.render(path.join(__dirname + "/public/design/maombi/kuanzishashule"), {
//               req: req,
//               total_month: data,
             
//             });
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//     }else{
//       // hasMatch == true
//       console.log("no access")
//       // res.redirect("/");
//     }
//   }

//   } else {
//     res.redirect("/");
//   }
// });

app.get("/MaombiKuanzishaSerikali", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    // var hasMatch =false;
    // for (var index = 0; index < req.session.RoleManage.length; ++index) {
    //     var animal = req.session.RoleManage[index]; 
    // if(animal.permission_id == 2){ 
    request(
      {
        url: maoanzishaShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        // json: {"browser_used": req.session.browser_used, "ip_address": req.session.ip_address, "UserLevel": req.session.UserLevel, "Office": req.session.office}
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        // console.log(body)
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            console.log(
              new Date() +
                " " +
                req.session.userName +
                ": /MaombiKuanzishaSerikali"
            );
            res.render(
              path.join(__dirname + "/public/design/kuanzishaserikali"),
              {
                req: req,
                total_month: data,
                useLev: req.session.UserLevel,
                                  userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                cheoName: req.session.cheoName,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/getAinaMaombi", function (req, res) {
//   var obj = [];
//   var per_page = Number(req.query.per_page || 10);
//   var page = Number(req.query.page || 1);
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: listAttachmentTypeAPI +`?page=${page}&per_page=${per_page}`,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         //  console.log(body)
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /getAinaMaombi"
//             );
//             res.send({ data: data });
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

app.post("/sajiliHati", function (req, res) {
  // console.log(req.body)
  var jina_hati = req.body.jina_hati;
  var ukubwa = req.body.ukubwa;
  var file_format = req.body.file_format;
  var aina_ombi = req.body.aina_ombi;
  var aina_mwombaji = req.body.aina_mwombaji;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: sajiliHatiAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          jina_hati: jina_hati,
          ukubwa: ukubwa,
          file_format: file_format,
          aina_ombi: aina_ombi,
          aina_mwombaji: aina_mwombaji,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to login " + error);
          res.send("failed");
        }
        // console.log(body)
        if (body !== undefined) {
          // console.log(body)
          console.log(
            new Date() + " " + req.session.userName + ": /sajiliHati"
          );
          res.send({ statusCode: body.statusCode, message: body.message });
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.post("/updateHati", function (req, res) {
//   console.log(req.body);
//   var jina_hati = req.body.jina_hati;
//   var ukubwa = req.body.ukubwa;
//   var file_format = req.body.file_format;
//   var aina_ombi = req.body.aina_ombi;
//   var aina_mwombaji = req.body.aina_mwombaji;
//   var fileId = req.body.fileId;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: updateHatiAPI,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           jina_hati: jina_hati,
//           ukubwa: ukubwa,
//           file_format: file_format,
//           aina_ombi: aina_ombi,
//           aina_mwombaji: aina_mwombaji,
//           fileId: fileId,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to login " + error);
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           // console.log(body)
//           console.log(
//             new Date() + " " + req.session.userName + ": /sajiliHati"
//           );
//           res.send({ status: "success" });
//         }
//       }
//     );
//   } else {
//     res.redirect("/");
//   }
// });



// app.get("/TaarifaOmbi/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: ombiDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           // console.log(jsonData)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var registryTypeId = data[0].registry_type_id;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var area = data[0].area;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var objAttachment2 = jsonData.objAttachment2;
//             var Maoni = jsonData.Maoni;
//             console.log(
//               new Date() + " " + req.session.userName + ": /TaarifaOmbi"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-ombi-details"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 registryTypeId: registryTypeId,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 language: language,
//                 school_size: school_size,
//                 userLevel: req.session.UserLevel,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
//                 objAttachment2: objAttachment2,
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

// app.get("/FutaShuleTaarifa/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   console.log(TrackingNumber);
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: ombiFutaDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           // console.log(jsonData)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var registryTypeId = data[0].registry_type_id;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var area = data[0].area;
//             var schoolId = data[0].schoolId;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             var count = "";
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var objAttachment2 = jsonData.objAttachment2;
//             var Maoni = jsonData.Maoni;
//             // console.log(jsonData.staffs)
//             console.log(
//               new Date() + " " + req.session.userName + ": /TaarifaOmbi"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-ombi-futa-details"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 registryTypeId: registryTypeId,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 schoolId: schoolId,
//                 language: language,
//                 school_size: school_size,
//                 userLevel: req.session.UserLevel,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
//                 objAttachment2: objAttachment2,
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

app.get("/RipotiFutaShuleTaarifa/:id", function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  // console.log(TrackingNumber)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: ripotiFutaDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          // console.log(jsonData)
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
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
            var schoolId = data[0].schoolId;
            var WardName = data[0].WardName;
            var structure = data[0].structure;
            var subcategory = data[0].subcategory;
            var count = "";
            var objAttachment = jsonData.objAttachment;
            var objAttachment1 = jsonData.objAttachment1;
            var objAttachment2 = jsonData.objAttachment2;
            var Maoni = jsonData.Maoni;
            // console.log(jsonData.staffs)
            console.log(
              new Date() +
                " " +
                req.session.userName +
                ": /RipotiFutaShuleTaarifa"
            );
            res.render(
              path.join(__dirname + "/public/design/view-ripoti-futa-details"),
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
                schoolId: schoolId,
                language: language,
                school_size: school_size,
                userLevel: req.session.UserLevel,
                area: area,
                WardName: WardName,
                structure: structure,
                LgaNameMtu: LgaNameMtu,
                WardNameMtu: WardNameMtu,
                subcategory: subcategory,
                count: count,
                staffs: jsonData.staffs,
                status: jsonData.status,
                objAttachment: objAttachment,
                objAttachment1: objAttachment1,
                Maoni: Maoni,
                objAttachment2: objAttachment2,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/BadiliMkondo/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           console.log(jsonData);
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;

//           if (statusCode == 300) {
//             var data = jsonData.data;
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var registryTypeId = data[0].registry_type_id;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var area = data[0].area;
//             var streamOld = data[0].streamOld;
//             var streamNew = data[0].streamNew;
//             var establishId = data[0].establishId;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             // var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             // var objAttachment2 = jsonData.objAttachment2;
//             console.log(objAttachment);
//             var Maoni = jsonData.Maoni;
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliMkondo"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-badili-ombi"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 registryTypeId: registryTypeId,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 streamNew: streamNew,
//                 streamOld: streamOld,
//                 language: language,
//                 school_size: school_size,
//                 userLevel: req.session.UserLevel,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 establishId: establishId,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 subcategory: subcategory,
//                 count: 0,
//                 staffs: jsonData.staffs,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
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

app.get("/ViewBadiliMkondo/:id", function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: ripbadiliDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;

          if (statusCode == 300) {
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
            var finalFileNumber = data[0].finalFileNumber;
            var structure = data[0].structure;
            var subcategory = data[0].subcategory;
            // var count = jsonData.maoni[0].count;
            var objAttachment = jsonData.objAttachment;
            var objAttachment1 = jsonData.objAttachment1;
            // var objAttachment2 = jsonData.objAttachment2;
            console.log(objAttachment);
            var Maoni = jsonData.Maoni;

            if (fs.existsSync(tracking_number + ".pdf")) {
              console.log("file exists");
            } else {
              console.log("file not found!");
              console.log(
                new Date() + " " + req.session.userName + ": /ViewOmbi"
              );

              doc.pipe(fs.createWriteStream(tracking_number + ".pdf"));

              // Adding functionality
              doc

                .fontSize(12)
                .font("Times-Bold")
                .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);
              doc.text("WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA",210,35,100,100);

              // Adding an image in the pdf.

              //doc.image("arm.png", 280, 50, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text("Mji wa Serikali,", 450, 80, 50, 50);

              doc.text("Mtumba,", 450, 90, 50, 50);

              doc.text("Mtaa wa Afya,", 450, 100, 50, 50);

              doc.text("S. L. P. 10,", 450, 110, 50, 50);

              doc.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text(todaydate, 450, 140, 50, 50);

              doc.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);

              doc.text("Simu: 026 296 35 33,", 100, 90, 50, 50);

              doc.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

              doc
                .fillColor("blue")
                .text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50)
                .link(100, 100, 160, 27, "https://www.moe.go.tz/");

              doc
                .fontSize(10)
                .fillColor("black")
                .text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

              doc
                .font("Times-Bold")
                .text("Kumb. Na. " + finalFileNumber, 100, 150, 50, 50);

              doc.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);

              doc.text(mwombajiAddress + ",", 100, 180, 50, 50);

              doc
                .font("Times-Bold")
                .text(LgaName + " - " + RegionName, 100, 190, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc.text(
                  "YAH: KIBALI CHA KUONGEZA TAHASUSI KATIKA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );
              } else {
                doc.text(
                  "YAH: KIBALI CHA KUONGEZA TAHASUSI KATIKA SHULE YA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );
              }
              doc
                .font("Times-Roman")
                .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc.text(
                  "Ninafurahi kukujulisha kuwa Wizara imekubali ombi lako la kuongeza tahasusi ya " +
                    streamOld +
                    " mkondo mmoja katika " +
                    school_name.toUpperCase() +
                    ".",
                  100,
                  260,
                  50,
                  50
                );
              } else {
                doc.text(
                  "Ninafurahi kukujulisha kuwa Wizara imekubali ombi lako la kuongeza tahasusi ya " +
                    streamOld +
                    " mkondo mmoja katika shule ya " +
                    school_name.toUpperCase() +
                    ".",
                  100,
                  260,
                  50,
                  50
                );
              }
              doc.text(
                "Hata hivyo, unatakiwa kuendelea kuboresha miundombinu ya shule ikiwa ni pamoja na kununua samani na vitabu vya kutosha. Tafadhali wasiliana na Katibu Mtendaji Baraza la Mitihani la Tanzania ukimjulisha ni lini wanafunzi hao watafanya Mtihani wa Taifa wa kidato cha Sita.",
                100,
                290,
                50,
                50
              );

              // doc
              // .text('Unaagizwa kuwasiliana na Katibu Mtendaji, Baraza la Mitihani la Tanzania kumjulisha ni lini wanafunzi walioongezeka watafanya Mtihani wa Taifa.',100, 320, 50, 50);

              // doc
              // .text('Mmiliki wa Shule atatakiwa kuja kuchukua cheti cha usajili wa shule akiwa na kitambulisho chake mwezi mmoja baada ya kupokea barua hii',100, 370, 50, 50);

              doc.text("Nakutakia utekelezaji mwema.", 100, 400, 50, 50);

              // doc.image('arm.png',280, 430, 50, 50);

              doc.text("KAMISHNA WA ELIMU", 280, 520, 50, 50);

              doc
                .font("Times-Bold")
                .text("KAMISHNA WA ELIMU", 250, 540, 50, 50);

              doc.text("Nakala:", 100, 580, 50, 50);

              doc.font("Times-Roman").text("Katibu Mkuu,", 100, 600, 50, 50);

              doc.text("OR – TAMISEMI,", 100, 610, 50, 50);

              doc.text("S.L.P.1923,", 100, 620, 50, 50);

              doc.font("Times-Bold").text("DODOMA.", 100, 630, 50, 50);

              doc
                .font("Times-Roman")
                .text("Katibu Mtendaji,", 100, 650, 50, 50);

              doc.text("Baraza la Mitihani Tanzania,", 100, 660, 50, 50);

              doc.text("S.L.P.2624,", 100, 670, 50, 50);

              doc.font("Times-Bold").text("DAR ES SALAAM.", 100, 680, 50, 50);

              doc
                .addPage()
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);

              // doc
              // .text('Kanda ya Mashariki,',100, 60, 50, 50);

              doc.text("S.L.P.2419,", 100, 70, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu Mkoa,", 100, 100, 50, 50);

              doc.text("Mkoa wa " + RegionName + ",", 100, 110, 50, 50);

              doc.text("S.L.P.315,", 100, 120, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu " + schoolCategory + ",", 100, 150, 50, 50);

              doc.text(LgaName + ",", 100, 160, 50, 50);

              doc.text("S.L.P.384,", 100, 170, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 180, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);

              doc.text(LgaName + ",", 100, 160, 50, 50);

              doc.text("S.L.P.384,", 100, 210, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 220, 50, 50);

              // Finalize PDF file
              doc.end();
            }

            console.log(
              new Date() + " " + req.session.userName + ": /BadiliMkondo"
            );
            res.render(
              path.join(__dirname + "/public/design/view-rip-badili-ombi"),
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
                school_size: school_size,
                userLevel: req.session.UserLevel,
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
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/BadiliDahalia/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliDahaliaDetalis,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           // console.log(jsonData)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;

//           if (statusCode == 300) {
//             var data = jsonData.data;
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var registryTypeId = data[0].registry_type_id;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var area = data[0].area;
//             var streamOld = data[0].streamOld;
//             var streamNew = data[0].streamNew;
//             var establishId = data[0].establishId;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             // var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             // var objAttachment2 = jsonData.objAttachment2;
//             var Maoni = jsonData.Maoni;
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliMkondo"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-badili-dahalia"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 registryTypeId: registryTypeId,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 streamNew: streamNew,
//                 streamOld: streamOld,
//                 language: language,
//                 school_size: school_size,
//                 userLevel: req.session.UserLevel,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 establishId: establishId,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 subcategory: subcategory,
//                 count: 0,
//                 staffs: jsonData.staffs,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
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

app.get("/ViewRipotiDahalia/:id", function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: ripotibadiliDahaliaDetalis,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          // console.log(jsonData)
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;

          if (statusCode == 300) {
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
            console.log(
              new Date() + " " + req.session.userName + ": /BadiliMkondo"
            );
            res.render(
              path.join(__dirname + "/public/design/ripoti-badili-dahalia"),
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
                school_size: school_size,
                userLevel: req.session.UserLevel,
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
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/BadiliBweni/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   // console.log("==========")
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: bweniDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to BadiliBweni " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           console.log(jsonData);
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;

//           if (statusCode == 300) {
//             var data = jsonData.data;
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var registryTypeId = data[0].registry_type_id;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var Newsubcategory = data[0].Newsubcategory;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var area = data[0].area;
//             var streamOld = data[0].streamOld;
//             var streamNew = data[0].streamNew;
//             var establishId = data[0].establishId;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             // var count = jsonData.maoni[0].count
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var objAttachment2 = jsonData.objAttachment2;
//             var Maoni = jsonData.Maoni;
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliBweni"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-badili-bweni"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 registryTypeId: registryTypeId,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 streamNew: streamNew,
//                 streamOld: streamOld,
//                 language: language,
//                 school_size: school_size,
//                 userLevel: req.session.UserLevel,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 establishId: establishId,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 Newsubcategory: Newsubcategory,
//                 subcategory: subcategory,
//                 count: "",
//                 staffs: jsonData.staffs,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
//                 objAttachment2: objAttachment2,
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

// app.get("/HamishaShuleDetails/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: hamishaShuleDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           // console.log(jsonData)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var registryTypeId = data[0].registry_type_id;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var WardNameNew = data[0].WardNameNew;
//             var LgaNameNew = data[0].LgaNameNew;
//             var RegionNameNew = data[0].RegionNameNew;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var area = data[0].area;
//             var streamOld = data[0].streamOld;
//             var WardIdNew = data[0].WardIdNew;
//             var WardIdOld = data[0].WardIdOld;
//             var streamNew = data[0].streamNew;
//             var establishId = data[0].establishId;
//             var WardName = data[0].WardName;
//             var school_name_new = data[0].school_name_new;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             var count = "";
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var objAttachment2 = jsonData.objAttachment2;
//             var Maoni = jsonData.Maoni;
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliShule"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-hamisha-shule"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 WardNameNew: WardNameNew,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 LgaNameNew: LgaNameNew,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 RegionNameNew: RegionNameNew,
//                 registry: registry,
//                 school_name_new: school_name_new,
//                 WardIdNew: WardIdNew,
//                 WardIdOld: WardIdOld,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 registryTypeId: registryTypeId,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 streamNew: streamNew,
//                 streamOld: streamOld,
//                 language: language,
//                 school_size: school_size,
//                 userLevel: req.session.UserLevel,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 establishId: establishId,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
//                 objAttachment2: objAttachment2,
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

// app.get("/BadiliShule/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliShuleDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
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
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var registryTypeId = data[0].registry_type_id;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var area = data[0].area;
//             var streamOld = data[0].streamOld;
//             var streamNew = data[0].streamNew;
//             var establishId = data[0].establishId;
//             var WardName = data[0].WardName;
//             var school_name_new = data[0].school_name_new;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var objAttachment2 = jsonData.objAttachment2;
//             var Maoni = jsonData.Maoni;
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliShule"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-badili-shule"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 school_name_new: school_name_new,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 registryTypeId: registryTypeId,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 streamNew: streamNew,
//                 streamOld: streamOld,
//                 language: language,
//                 school_size: school_size,
//                 userLevel: req.session.UserLevel,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 establishId: establishId,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
//                 objAttachment2: objAttachment2,
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

app.get("/RipotiBadiliShule/:id", function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: ripotibadiliShuleDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        console.log(body);
        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
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
            var finalFileNumber = data[0].finalFileNumber;
            var school_name_new = data[0].school_name_new;
            var structure = data[0].structure;
            var todaydate = data[0].todaydate;
            var subcategory = data[0].subcategory;
            var count = jsonData.maoni[0].count;
            var objAttachment = jsonData.objAttachment;
            var objAttachment1 = jsonData.objAttachment1;
            var objAttachment2 = jsonData.objAttachment2;
            var Maoni = jsonData.Maoni;
            console.log(
              new Date() + " " + req.session.userName + ": /BadiliShule"
            );
            if (fs.existsSync(tracking_number + ".pdf")) {
              console.log("file exists");
            } else {
              doc.pipe(fs.createWriteStream(tracking_number + ".pdf"));

              // Adding functionality
              doc

                .fontSize(12)
                .font("Times-Bold")
                .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);

              doc.text(
                "WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA",
                210,
                35,
                100,
                100
              );

              // Adding an image in the pdf.

              //doc.image("arm.png", 280, 50, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text("Mji wa Serikali,", 450, 80, 50, 50);

              doc.text("Mtumba,", 450, 90, 50, 50);

              doc.text("Mtaa wa Afya,", 450, 100, 50, 50);

              doc.text("S. L. P. 10,", 450, 110, 50, 50);

              doc.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text(todaydate, 450, 140, 50, 50);

              doc.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);

              doc.text("Simu: 026 296 35 33,", 100, 90, 50, 50);

              doc.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

              doc
                .fillColor("blue")
                .text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50)
                .link(100, 100, 160, 27, "https://www.moe.go.tz/");

              doc
                .fontSize(10)
                .fillColor("black")
                .text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

              doc
                .font("Times-Bold")
                .text("Kumb. Na. " + finalFileNumber, 100, 150, 50, 50);

              doc.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);

              doc.text("S.L.P. 05,", 100, 180, 50, 50);

              doc
                .font("Times-Bold")
                .text(LgaName + " - " + RegionName, 100, 190, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc.text(
                  "Yah: KIBALI CHA KUBADILI JINA KUTOKA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name_new.toUpperCase() +
                    " KUWA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );
              } else {
                doc.text(
                  "Yah: KIBALI CHA KUBADILI JINA LA SHULE KUTOKA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name_new.toUpperCase() +
                    " KUWA SHULE YA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );
              }
              // doc
              // .font('Times-Roman')
              // .text('Tafadhali rejea somo la barua hii.',100, 240, 50, 50);
              doc
                .font("Times-Roman")
                .text("Tafadhali rejea somo la barua hii.", 100, 250, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc.text(
                  "Wizara imeridhia ombi lako la kubadili jina la " +
                    schoolCategory +
                    " " +
                    school_name_new +
                    "  kuwa " +
                    schoolCategory +
                    " " +
                    school_name,
                  100,
                  270,
                  50,
                  50
                );
                doc.text(
                  "Kuanzia tarehe ya barua hii, jina la " +
                    schoolCategory +
                    " " +
                    school_name +
                    " limeidhinishwa.",
                  100,
                  300,
                  50,
                  50
                );
              } else {
                doc.text(
                  "Wizara imeridhia ombi lako la kubadili jina la shule la " +
                    schoolCategory +
                    " " +
                    school_name_new +
                    "  kuwa shule ya " +
                    schoolCategory +
                    " " +
                    school_name,
                  100,
                  270,
                  50,
                  50
                );

                doc.text(
                  "Kuanzia tarehe ya barua hii, jina la shule ya " +
                    schoolCategory +
                    " " +
                    school_name +
                    " limeidhinishwa.",
                  100,
                  300,
                  50,
                  50
                );
              }
              doc.text(
                "Unatakiwa kuzifahamisha mamlaka husika za kielimu juu ya mabadiliko hayo.",
                100,
                320,
                50,
                50
              );

              // doc
              // .text('Mmiliki wa Shule atatakiwa kuja kuchukua cheti cha usajili wa shule akiwa na kitambulisho chake mwezi mmoja baada ya kupokea barua hii',100, 370, 50, 50);

              doc.text("Nakutakia utekelezaji mwema.", 100, 340, 50, 50);

              //   doc.image('arm.png',180, 200, 50, 50);

              // doc.text("Venance N. Manori", 280, 380, 50, 50);

              doc
                .font("Times-Bold")
                .text("KAMISHNA WA ELIMU", 250, 510, 50, 50);

              doc.addPage().text("Nakala:", 100, 30, 50, 50);

              doc.font("Times-Roman").text("Katibu Mkuu,", 100, 50, 50, 50);

              doc.text("OR – TAMISEMI,", 100, 70, 50, 50);

              doc.text("S.L.P.1923,", 100, 90, 50, 50);

              doc.font("Times-Bold").text("DODOMA.", 100, 110, 110, 50);

              doc
                .font("Times-Roman")
                .text("Katibu Mtendaji,", 100, 130, 50, 50);

              doc.text("Baraza la Mitihani Tanzania,", 100, 150, 50, 50);

              doc.text("S.L.P.2624,", 100, 170, 50, 50);

              doc.font("Times-Bold").text("DAR ES SALAAM.", 100, 190, 50, 50);

              doc
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);

              // doc
              // .text('Kanda ya Mashariki,',100, 60, 50, 50);

              doc.text("S.L.P.2419,", 100, 70, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu Mkoa,", 100, 100, 50, 50);

              doc.text("Mkoa wa ," + RegionName, 100, 110, 50, 50);

              doc.text("S.L.P.315,", 100, 120, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu ," + schoolCategory, 100, 150, 50, 50);

              doc.text(LgaName + ",", 100, 160, 50, 50);

              doc.text("S.L.P.384,", 100, 170, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 180, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);

              doc.text(LgaName + ",", 100, 160, 50, 50);

              doc.text("S.L.P.384,", 100, 210, 50, 50);

              doc.font("Times-Bold").text(LgaName + ".", 100, 220, 50, 50);

              // Finalize PDF file
              doc.end();
            }
            res.render(
              path.join(__dirname + "/public/design/view-ripoti-badili-shule"),
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
                school_name_new: school_name_new,
                occupation: occupation,
                mwombajiAddress: mwombajiAddress,
                registryTypeId: registryTypeId,
                mwombajiPhoneNo: mwombajiPhoneNo,
                baruaPepe: baruaPepe,
                streamNew: streamNew,
                streamOld: streamOld,
                language: language,
                school_size: school_size,
                userLevel: req.session.UserLevel,
                area: area,
                WardName: WardName,
                structure: structure,
                establishId: establishId,
                LgaNameMtu: LgaNameMtu,
                WardNameMtu: WardNameMtu,
                subcategory: subcategory,
                count: count,
                staffs: jsonData.staffs,
                status: jsonData.status,
                objAttachment: objAttachment,
                objAttachment1: objAttachment1,
                Maoni: Maoni,
                objAttachment2: objAttachment2,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/BadiliAinaUsajili/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: usajiliDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)

//           var jsonData = body;

//           // console.log(jsonData)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var registration_number = data[0].registration_number;
//             var registryTypeId = data[0].registry_type_id;
//             var school_category_id_old = data[0].school_category_id_old;
//             var school_category_id_new = data[0].school_category_id_new;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var area = data[0].area;
//             var streamOld = data[0].streamOld;
//             var streamNew = data[0].streamNew;
//             var schoolCategoryNew = data[0].schoolCategoryNew;
//             var establishId = data[0].establishId;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var objAttachment2 = jsonData.objAttachment2;
//             var Maoni = jsonData.Maoni;
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliAinaUsajili"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-badili-aina-usajili"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 school_category_id_old: school_category_id_old,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 registration_number: registration_number,
//                 registryTypeId: registryTypeId,
//                 school_category_id_new: school_category_id_new,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 streamNew: streamNew,
//                 streamOld: streamOld,
//                 language: language,
//                 school_size: school_size,
//                 userLevel: req.session.UserLevel,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 establishId: establishId,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 schoolCategoryNew: schoolCategoryNew,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
//                 objAttachment2: objAttachment2,
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

app.post("/TumaAttachment", function (req, res) {
  // console.log(req.body)
  var keyString = req.body.keyString;
  var trackerId = req.body.trackerId;
  var attachment = req.body.attachment;
  var kiambatisho = req.body.kiambatisho;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: pandishaHatiAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          keyString: keyString,
          trackerId: trackerId,
          attachment: attachment,
          kiambatisho: kiambatisho,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to login " + error);
          res.send("failed");
        }
        // console.log(body)
        if (body !== undefined) {
          // console.log(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            res.send("Imepakiwa kikamilifu");
          }
          if (statusCode == 302) {
            console.log(
              new Date() + " " + req.session.userName + ": /TumaAttachment"
            );
            res.send("Haijafanikiwa tafadhali jaribu tena");
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/AnzishoTaarifa/:id", function (req, res) {
  var obj = [];
  console.log(req.params);
  var TrackingNumber = req.params.id;
  // console.log("TrackingNumber")
  // console.log(TrackingNumber)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: ombiDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
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
            var WardName = data[0].WardName;
            var structure = data[0].structure;
            var subcategory = data[0].subcategory;
            var count = jsonData.maoni[0].count;
            var objAttachment = jsonData.objAttachment;
            var objAttachment1 = jsonData.objAttachment1;
            var objAttachment2 = jsonData.objAttachment2;
            var Maoni = jsonData.Maoni;
            // var maoni = JSON.parse(jsonData.maoni)
            // console.log(jsonData.maoni[0].count)
            console.log(
              new Date() + " " + req.session.userName + ": /AnzishoTaarifa"
            );
            res.render(
              path.join(__dirname + "/public/design/view-shule-details"),
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
                language: language,
                school_size: school_size,
                area: area,
                WardName: WardName,
                structure: structure,
                LgaNameMtu: LgaNameMtu,
                WardNameMtu: WardNameMtu,
                subcategory: subcategory,
                count: count,
                staffs: jsonData.staffs,
                status: jsonData.status,
                objAttachment: objAttachment,
                objAttachment1: objAttachment1,
                Maoni: Maoni,
                objAttachment2: objAttachment2,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/ViewOmbi/:id", function (req, res) {
//   var obj = [];
//   // console.log(req.params)
//   var TrackingNumber = req.params.id;
//   // console.log("TrackingNumber")
//   // console.log(TrackingNumber)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: ombiMmilikiDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           // console.log(req.session.UserLevel)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var owner_phone_no = data[0].owner_phone_no;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var education_level = data[0].education_level;
//             var attachment_path = data[0].attachment_path;
//             var occupationManager = data[0].occupationManager;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var manager_phone_number = data[0].manager_phone_number;
//             var manager_email = data[0].manager_email;
//             var house_number = data[0].house_number;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var manager_name = data[0].manager_name;
//             var area = data[0].area;
//             var expertise_level = data[0].expertise_level;
//             var old_tracking_number = data[0].old_tracking_number;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var authorized_person = data[0].authorized_person;
//             var title = data[0].title;
//             var subcategory = data[0].subcategory;
//             var manager_street = data[0].manager_street;
//             var managerRegionName = data[0].managerRegionName;
//             var purpose = data[0].purpose;
//             var owner_name = data[0].owner_name;
//             var owner_email = data[0].owner_email;
//             var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var Maoni = jsonData.Maoni;
//             var Refferes = jsonData.Refferes;
//             // var maoni = JSON.parse(jsonData.maoni)
//             // console.log(attachment_path)
//             console.log(
//               new Date() + " " + req.session.userName + ": /ViewOmbi"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-ombi-mmiliki-details"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 authorized_person: authorized_person,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 title: title,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 owner_name: owner_name,
//                 manager_name: manager_name,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 owner_phone_no: owner_phone_no,
//                 education_level: education_level,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 manager_street: manager_street,
//                 managerRegionName: managerRegionName,
//                 owner_email: owner_email,
//                 manager_email: manager_email,
//                 house_number: house_number,
//                 old_tracking_number: old_tracking_number,
//                 language: language,
//                 school_size: school_size,
//                 purpose: purpose,
//                 manager_phone_number: manager_phone_number,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 occupationManager: occupationManager,
//                 expertise_level: expertise_level,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 userLevel: req.session.UserLevel,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 attachment_path: attachment_path,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
//                 Refferes: Refferes,
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

app.get("/RipotiThibitisho/:id", function (req, res) {
  var obj = [];
  // console.log(req.params)
  var TrackingNumber = req.params.id;
  // console.log("TrackingNumber")
  // console.log(TrackingNumber)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: ripotiMmilikiDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          // console.log(req.session.UserLevel)
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            var remain_days = data[0].remain_days;
            var created_at = data[0].created_at;
            var tracking_number = data[0].tracking_number;
            var school_name = data[0].school_name;
            var LgaName = data[0].LgaName;
            var WardNameMtu = data[0].WardNameMtu;
            var LgaNameMtu = data[0].LgaNameMtu;
            var RegionName = data[0].RegionName;
            var RegionNameMtu = data[0].RegionNameMtu;
            var owner_phone_no = data[0].owner_phone_no;
            var fullname = data[0].fullname;
            var schoolCategory = data[0].schoolCategory;
            var registry = data[0].registry;
            var occupation = data[0].occupation;
            var todaydate = data[0].todaydate;
            var education_level = data[0].education_level;
            var attachment_path = data[0].attachment_path;
            var occupationManager = data[0].occupationManager;
            var mwombajiAddress = data[0].mwombajiAddress;
            var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
            var manager_phone_number = data[0].manager_phone_number;
            var manager_email = data[0].manager_email;
            var house_number = data[0].house_number;
            var baruaPepe = data[0].baruaPepe;
            var language = data[0].language;
            var school_size = data[0].school_size;
            var manager_name = data[0].manager_name;
            var area = data[0].area;
            var expertise_level = data[0].expertise_level;
            var finalFileNumber = data[0].finalFileNumber;
            var old_tracking_number = data[0].old_tracking_number;
            var WardName = data[0].WardName;
            var structure = data[0].structure;
            var authorized_person = data[0].authorized_person;
            var title = data[0].title;
            var subcategory = data[0].subcategory;
            var manager_street = data[0].manager_street;
            var managerRegionName = data[0].managerRegionName;
            var purpose = data[0].purpose;
            var owner_name = data[0].owner_name;
            var owner_email = data[0].owner_email;
            var count = jsonData.maoni[0].count;
            var objAttachment = jsonData.objAttachment;
            var Maoni = jsonData.Maoni;
            var Refferes = jsonData.Refferes;
            // var maoni = JSON.parse(jsonData.maoni)
            // console.log(attachment_path)
            if (fs.existsSync(tracking_number + ".pdf")) {
              console.log("file exists ...");
            } else {
              console.log("file not found!");
              console.log(
                new Date() + " " + req.session.userName + ": /ViewOmbi"
              );

              doc.pipe(fs.createWriteStream(tracking_number + ".pdf"));

              // Adding functionality
              doc

                .fontSize(12)
                .font("Times-Bold")
                .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);

              doc.text(
                "WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA",
                210,
                35,
                100,
                100
              );

              // Adding an image in the pdf.

              //doc.image("arm.png", 280, 50, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text("Mji wa Serikali,", 450, 80, 50, 50);

              doc.text("Mtumba,", 450, 90, 50, 50);

              doc.text("Mtaa wa Afya,", 450, 100, 50, 50);

              doc.text("S. L. P. 10,", 450, 110, 50, 50);

              doc.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text(todaydate, 450, 140, 50, 50);

              doc.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);

              doc.text("Simu: 026 296 35 33,", 100, 90, 50, 50);

              doc.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

              doc
                .fillColor("blue")
                .text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50)
                .link(100, 100, 160, 27, "https://www.moe.go.tz/");

              doc
                .fontSize(10)
                .fillColor("black")
                .text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

              doc
                .font("Times-Bold")
                .text("Kumb. Na. " + finalFileNumber, 100, 150, 50, 50);

              doc.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);

              doc.text(mwombajiAddress + ",", 100, 180, 50, 50);

              doc
                .font("Times-Bold")
                .text(LgaName + " - " + RegionName, 100, 190, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc.text(
                  "YAH: UTHIBITISHO WA KUWA MWENYE " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc.text(
                  "Ninafurahi kukufahamisha kuwa Kamishna wa Elimu amemthibitisha  " +
                    owner_name.toUpperCase() +
                    " kumiliki " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase() +
                    ".",
                  100,
                  260,
                  50,
                  50
                );
              } else {
                doc.text(
                  "YAH: UTHIBITISHO WA KUWA MWENYE SHULE YA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc.text(
                  "Ninafurahi kukufahamisha kuwa Kamishna wa Elimu amemthibitisha  " +
                    owner_name.toUpperCase() +
                    " kumiliki shule ya " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase() +
                    ".",
                  100,
                  260,
                  50,
                  50
                );
              }
              doc.text(
                "Uthibitisho huu umetolewa tarehe " +
                  created_at +
                  " kwa mujibu wa Sheria ya Elimu, Sura 353. Utamiliki shule hii kwa kuzingatia Sheria na Miongozo ya Wizara ya Elimu, Sayansi na Teknolojia. Unaagizwa kukamilisha miundombinu yote muhimu ya shule kabla ya kujaza fomu Namba RS 8..",
                100,
                290,
                50,
                50
              );

              // doc
              // .text('Kufuatana na Sheria ya Elimu, Sura 353, cheti cha Usajili kiwekwe bayana na Uongozi wa Shule uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa Kamati ya Shule inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na Waraka wa Elimu Na. 10 wa mwaka 2011 usajili wa shule hii utarudiwa baada ya miaka 4.',100, 320, 50, 50);

              // doc
              // .text('Mmiliki wa Shule atatakiwa kuja kuchukua cheti cha usajili wa shule akiwa na kitambulisho chake mwezi mmoja baada ya kupokea barua hii',100, 370, 50, 50);

              doc.text("Nakutakia utekelezaji mwema.", 100, 400, 50, 50);

              // doc.image('arm.png',280, 430, 50, 50);

              doc.text("KAMISHNA WA ELIMU", 280, 520, 50, 50);

              doc
                .font("Times-Bold")
                .text("KAMISHNA WA ELIMU", 250, 540, 50, 50);

              doc.text("Nakala:", 100, 580, 50, 50);

              doc.font("Times-Roman").text("Katibu Mkuu,", 100, 600, 50, 50);

              doc.text("OR – TAMISEMI,", 100, 610, 50, 50);

              doc.text("S.L.P.1923,", 100, 620, 50, 50);

              doc.font("Times-Bold").text("DODOMA.", 100, 630, 50, 50);

              doc
                .font("Times-Roman")
                .text("Katibu Mtendaji,", 100, 650, 50, 50);

              doc.text("Baraza la Mitihani Tanzania,", 100, 660, 50, 50);

              doc.text("S.L.P.2624,", 100, 670, 50, 50);

              doc.font("Times-Bold").text("DAR ES SALAAM.", 100, 680, 50, 50);

              doc
                .addPage()
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);

              doc.text("Kanda ya Mashariki,", 100, 60, 50, 50);

              doc.text("S.L.P.2419,", 100, 70, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu Mkoa,", 100, 100, 50, 50);

              doc.text("Mkoa wa " + RegionName + ",", 100, 110, 50, 50);

              doc.text("S.L.P.315,", 100, 120, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu " + schoolCategory + ",", 100, 150, 50, 50);

              doc.text(LgaName + ",", 100, 160, 50, 50);

              doc.text("S.L.P.384,", 100, 170, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 180, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);

              doc.text(LgaName + ",", 100, 160, 50, 50);

              doc.text("S.L.P.384,", 100, 210, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 220, 50, 50);

              // Finalize PDF file
              doc.end();
            }

            if (fs.existsSync(tracking_number + "meneja.pdf")) {
              console.log("file exists ...");
            } else {
              console.log("file not found!");
              //barua meneja
              doc1.pipe(fs.createWriteStream(tracking_number + "meneja.pdf"));

              // Adding functionality
              doc1

                .fontSize(12)
                .font("Times-Bold")
                .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);

              doc1.text(
                "WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA",
                210,
                35,
                100,
                100
              );

              // Adding an image in the pdf.

              // doc1.image("arm.png", 280, 50, 50, 50);

              doc1
                .fontSize(10)
                .font("Times-Roman")
                .text("Mji wa Serikali,", 450, 80, 50, 50);

              doc1.text("Mtumba,", 450, 90, 50, 50);

              doc1.text("Mtaa wa Afya,", 450, 100, 50, 50);

              doc1.text("S. L. P. 10,", 450, 110, 50, 50);

              doc1.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);

              doc1
                .fontSize(10)
                .font("Times-Roman")
                .text(todaydate, 450, 140, 50, 50);

              doc1.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);

              doc1.text("Simu: 026 296 35 33,", 100, 90, 50, 50);

              doc1.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

              doc1
                .fillColor("blue")
                .text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50)
                .link(100, 100, 160, 27, "https://www.moe.go.tz/");

              doc1
                .fontSize(10)
                .fillColor("black")
                .text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

              doc1
                .font("Times-Bold")
                .text("Kumb. Na. " + tracking_number, 100, 150, 50, 50);

              doc1.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);

              doc1.text(mwombajiAddress + ",", 100, 180, 50, 50);

              doc1
                .font("Times-Bold")
                .text(LgaName + " - " + RegionName, 100, 190, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc1.text(
                  "YAH: UTHIBITISHO WA KUWA MENEJA WA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc1
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc1.text(
                  "Ninafurahi kukufahamisha kuwa uthibitisho umetolewa kwa " +
                    manager_name.toUpperCase() +
                    " kuwa Meneja wa " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase() +
                    ".",
                  100,
                  260,
                  50,
                  50
                );
              } else {
                doc1.text(
                  "YAH: UTHIBITISHO WA KUWA MENEJA WA SHULE YA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc1
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc1.text(
                  "Ninafurahi kukufahamisha kuwa uthibitisho umetolewa kwa " +
                    manager_name.toUpperCase() +
                    " kuwa Meneja wa shule ya " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase() +
                    ".",
                  100,
                  260,
                  50,
                  50
                );
              }
              doc1.text(
                "Uthibitisho huu umetolewa tarehe " +
                  created_at +
                  " kwa mujibu wa Sheria ya Elimu, Sura 353. Utamiliki shule hii kwa kuzingatia Sheria na Miongozo ya Wizara ya Elimu, Sayansi na Teknolojia. Hakikisha shule ina kasiki kwa ajili ya kuhifadhia nyaraka nyeti.",
                100,
                290,
                50,
                50
              );

              // doc
              // .text('Kufuatana na Sheria ya Elimu, Sura 353, cheti cha Usajili kiwekwe bayana na Uongozi wa Shule uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa Kamati ya Shule inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na Waraka wa Elimu Na. 10 wa mwaka 2011 usajili wa shule hii utarudiwa baada ya miaka 4.',100, 320, 50, 50);

              // doc
              // .text('Mmiliki wa Shule atatakiwa kuja kuchukua cheti cha usajili wa shule akiwa na kitambulisho chake mwezi mmoja baada ya kupokea barua hii',100, 370, 50, 50);

              doc1.text("Nakutakia utekelezaji mwema.", 100, 400, 50, 50);

              // doc1.image("arm.png", 280, 430, 50, 50);

              doc1.text("ke", 280, 520, 50, 50);

              doc1
                .font("Times-Bold")
                .text("KAMISHNA WA ELIMU", 250, 540, 50, 50);

              doc1.text("Nakala:", 100, 580, 50, 50);

              doc1.font("Times-Roman").text("Katibu Mkuu,", 100, 600, 50, 50);

              doc1.text("OR – TAMISEMI,", 100, 610, 50, 50);

              doc1.text("S.L.P.1923,", 100, 620, 50, 50);

              doc1.font("Times-Bold").text("DODOMA.", 100, 630, 50, 50);

              doc1
                .font("Times-Roman")
                .text("Katibu Mtendaji,", 100, 650, 50, 50);

              doc1.text("Baraza la Mitihani Tanzania,", 100, 660, 50, 50);

              doc1.text("S.L.P.2624,", 100, 670, 50, 50);

              doc1.font("Times-Bold").text("DAR ES SALAAM.", 100, 680, 50, 50);

              doc1
                .addPage()
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);

              doc1.text("Kanda ya Mashariki,", 100, 60, 50, 50);

              doc1.text("S.L.P.2419,", 100, 70, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

              doc1
                .font("Times-Roman")
                .text("Afisa Elimu Mkoa,", 100, 100, 50, 50);

              doc1.text("Mkoa wa " + RegionName + ",", 100, 110, 50, 50);

              doc1.text("S.L.P.315,", 100, 120, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc1
                .font("Times-Roman")
                .text("Afisa Elimu " + schoolCategory + ",", 100, 150, 50, 50);

              doc1.text(LgaName + ",", 100, 160, 50, 50);

              doc1.text("S.L.P.384,", 100, 170, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 180, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc1
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);

              doc1.text(LgaName + ",", 100, 160, 50, 50);

              doc1.text("S.L.P.384,", 100, 210, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 220, 50, 50);

              // Finalize PDF file
              doc1.end();
            }

            res.render(
              path.join(
                __dirname + "/public/design/view-ripoti-mmiliki-details"
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
                authorized_person: authorized_person,
                school_name: school_name,
                LgaName: LgaName,
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
                owner_phone_no: owner_phone_no,
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
                manager_phone_number: manager_phone_number,
                area: area,
                WardName: WardName,
                structure: structure,
                occupationManager: occupationManager,
                expertise_level: expertise_level,
                LgaNameMtu: LgaNameMtu,
                WardNameMtu: WardNameMtu,
                userLevel: req.session.UserLevel,
                subcategory: subcategory,
                count: count,
                staffs: jsonData.staffs,
                attachment_path: attachment_path,
                status: jsonData.status,
                objAttachment: objAttachment,
                Maoni: Maoni,
                Refferes: Refferes,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/ViewOmbiMmiliki/:id", function (req, res) {
//   var obj = [];
//   // console.log(req.params)
//   var TrackingNumber = req.params.id;
//   // console.log("TrackingNumber")
//   // console.log(TrackingNumber)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliMmilikiDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         console.log(body);
//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           // console.log(req.session.UserLevel)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var owner_name_old = data[0].owner_name_old;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var owner_phone_no = data[0].owner_phone_no;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var education_level = data[0].education_level;
//             var attachment_path = data[0].attachment_path;
//             var occupationManager = data[0].occupationManager;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var manager_phone_number = data[0].manager_phone_number;
//             var manager_email = data[0].manager_email;
//             var house_number = data[0].house_number;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var manager_name = data[0].manager_name;
//             var area = data[0].area;
//             var expertise_level = data[0].expertise_level;
//             var old_tracking_number = data[0].old_tracking_number;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var authorized_person = data[0].authorized_person;
//             var title = data[0].title;
//             var subcategory = data[0].subcategory;
//             var manager_street = data[0].manager_street;
//             var managerRegionName = data[0].managerRegionName;
//             var purpose = data[0].purpose;
//             var owner_email_old = data[0].owner_email_old;
//             var phone_number_old = data[0].phone_number_old;
//             var authorized_person_old = data[0].authorized_person_old;
//             var owner_name = data[0].owner_name;
//             var owner_email = data[0].owner_email;
//             var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var Maoni = jsonData.Maoni;
//             var Refferes = jsonData.Refferes;
//             // var maoni = JSON.parse(jsonData.maoni)
//             // console.log(attachment_path)
//             console.log(
//               new Date() + " " + req.session.userName + ": /ViewOmbiMmiliki"
//             );
//             res.render(
//               path.join(
//                 __dirname + "/public/design/maombi/details/view-ombi-badili-mmiliki-details"
//               ),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                 phone_number_old: phone_number_old,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 owner_email_old: owner_email_old,
//                 authorized_person_old: authorized_person_old,
//                 owner_name_old: owner_name_old,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 authorized_person: authorized_person,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 objAttachment: objAttachment,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 title: title,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 owner_name: owner_name,
//                 manager_name: manager_name,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 owner_phone_no: owner_phone_no,
//                 education_level: education_level,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 manager_street: manager_street,
//                 managerRegionName: managerRegionName,
//                 owner_email: owner_email,
//                 manager_email: manager_email,
//                 house_number: house_number,
//                 old_tracking_number: old_tracking_number,
//                 language: language,
//                 school_size: school_size,
//                 purpose: purpose,
//                 manager_phone_number: manager_phone_number,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 occupationManager: occupationManager,
//                 expertise_level: expertise_level,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 userLevel: req.session.UserLevel,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 attachment_path: attachment_path,
//                 status: jsonData.status,
//                 Maoni: Maoni,
//                 Refferes: Refferes,
//                 objAttachment1: objAttachment1,
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

// app.get("/ViewOmbiMeneja/:id", function (req, res) {
//   var obj = [];
//   console.log(req.params);
//   var TrackingNumber = req.params.id;
//   // console.log("TrackingNumber")
//   // console.log(TrackingNumber)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliMenejaDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           // console.log(req.session.UserLevel)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var owner_name_old = data[0].owner_name_old;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var owner_phone_no = data[0].owner_phone_no;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var education_level = data[0].education_level;
//             var attachment_path = data[0].attachment_path;
//             var occupationManager = data[0].occupationManager;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var manager_phone_number = data[0].manager_phone_number;
//             var manager_email = data[0].manager_email;
//             var house_number = data[0].house_number;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var manager_name = data[0].manager_name;
//             var area = data[0].area;
//             var expertise_level = data[0].expertise_level;
//             var old_tracking_number = data[0].old_tracking_number;
//             var WardName = data[0].WardName;
//             var structure = data[0].structure;
//             var authorized_person = data[0].authorized_person;
//             var title = data[0].title;
//             var subcategory = data[0].subcategory;
//             var manager_street = data[0].manager_street;
//             var managerRegionName = data[0].managerRegionName;
//             var purpose = data[0].purpose;
//             var owner_email_old = data[0].owner_email_old;
//             var phone_number_old = data[0].phone_number_old;
//             var authorized_person_old = data[0].authorized_person_old;
//             var owner_name = data[0].owner_name;
//             var owner_email = data[0].owner_email;
//             var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var Maoni = jsonData.Maoni;
//             var Refferes = jsonData.Refferes;
//             // var maoni = JSON.parse(jsonData.maoni)
//             // console.log(attachment_path)
//             console.log(
//               new Date() + " " + req.session.userName + ": /ViewOmbiMmiliki"
//             );
//             res.render(
//               path.join(
//                 __dirname + "/public/design/maombi/details/view-ombi-badili-meneja-details"
//               ),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                 phone_number_old: phone_number_old,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 owner_email_old: owner_email_old,
//                 authorized_person_old: authorized_person_old,
//                 owner_name_old: owner_name_old,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 authorized_person: authorized_person,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 objAttachment: objAttachment,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 title: title,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 registry: registry,
//                 owner_name: owner_name,
//                 manager_name: manager_name,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 owner_phone_no: owner_phone_no,
//                 education_level: education_level,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 manager_street: manager_street,
//                 managerRegionName: managerRegionName,
//                 owner_email: owner_email,
//                 manager_email: manager_email,
//                 house_number: house_number,
//                 old_tracking_number: old_tracking_number,
//                 language: language,
//                 school_size: school_size,
//                 purpose: purpose,
//                 manager_phone_number: manager_phone_number,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 occupationManager: occupationManager,
//                 expertise_level: expertise_level,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 userLevel: req.session.UserLevel,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 attachment_path: attachment_path,
//                 status: jsonData.status,
//                 Maoni: Maoni,
//                 Refferes: Refferes,
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

app.get("/ViewRipotiMeneja/:id", function (req, res) {
  var obj = [];
  console.log(req.params);
  var TrackingNumber = req.params.id;
  // console.log("TrackingNumber")
  // console.log(TrackingNumber)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: badiliMenejaDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          // console.log(req.session.UserLevel)
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
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
            var owner_phone_no = data[0].owner_phone_no;
            var fullname = data[0].fullname;
            var schoolCategory = data[0].schoolCategory;
            var registry = data[0].registry;
            var occupation = data[0].occupation;
            var education_level = data[0].education_level;
            var attachment_path = data[0].attachment_path;
            var occupationManager = data[0].occupationManager;
            var mwombajiAddress = data[0].mwombajiAddress;
            var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
            var manager_phone_number = data[0].manager_phone_number;
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
            var phone_number_old = data[0].phone_number_old;
            var authorized_person_old = data[0].authorized_person_old;
            var owner_name = data[0].owner_name;
            var owner_email = data[0].owner_email;
            var count = jsonData.maoni[0].count;
            var objAttachment = jsonData.objAttachment;
            var Maoni = jsonData.Maoni;
            var Refferes = jsonData.Refferes;

            if (fs.existsSync(tracking_number + "meneja.pdf")) {
              console.log("file exists");
            } else {
              console.log("file not found!");
              //barua meneja
              doc1.pipe(fs.createWriteStream(tracking_number + "meneja.pdf"));

              // Adding functionality
              doc1

                .fontSize(12)
                .font("Times-Bold")
                .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);

              doc1.text(
                "WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA",
                210,
                35,
                100,
                100
              );

              // Adding an image in the pdf.

              // doc1.image("arm.png", 280, 50, 50, 50);

              doc1
                .fontSize(10)
                .font("Times-Roman")
                .text("Mji wa Serikali,", 450, 80, 50, 50);

              doc1.text("Mtumba,", 450, 90, 50, 50);

              doc1.text("Mtaa wa Afya,", 450, 100, 50, 50);

              doc1.text("S. L. P. 10,", 450, 110, 50, 50);

              doc1.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);

              doc1
                .fontSize(10)
                .font("Times-Roman")
                .text(new Date(), 450, 140, 50, 50);

              doc1.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);

              doc1.text("Simu: 026 296 35 33,", 100, 90, 50, 50);

              doc1.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

              doc1
                .fillColor("blue")
                .text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50)
                .link(100, 100, 160, 27, "https://www.moe.go.tz/");

              doc1
                .fontSize(10)
                .fillColor("black")
                .text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

              doc1
                .font("Times-Bold")
                .text("Kumb. Na. " + tracking_number, 100, 150, 50, 50);

              doc1.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);

              doc1.text(mwombajiAddress + ",", 100, 180, 50, 50);

              doc1
                .font("Times-Bold")
                .text(LgaName + " - " + RegionName, 100, 190, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc1.text(
                  "YAH: UTHIBITISHO WA KUWA MENEJA WA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc1
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc1.text(
                  "Ninafurahi kukufahamisha kuwa uthibitisho umetolewa kwa " +
                    manager_name.toUpperCase() +
                    " kuwa Meneja wa " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase() +
                    ".",
                  100,
                  260,
                  50,
                  50
                );
              } else {
                doc1.text(
                  "YAH: UTHIBITISHO WA KUWA MENEJA WA SHULE YA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc1
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc1.text(
                  "Ninafurahi kukufahamisha kuwa uthibitisho umetolewa kwa " +
                    manager_name.toUpperCase() +
                    " kuwa Meneja wa shule ya " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase() +
                    ".",
                  100,
                  260,
                  50,
                  50
                );
              }
              doc1.text(
                "Uthibitisho huu umetolewa tarehe " +
                  created_at +
                  " kwa mujibu wa Sheria ya Elimu, Sura 353. Utamiliki shule hii kwa kuzingatia Sheria na Miongozo ya Wizara ya Elimu, Sayansi na Teknolojia. Hakikisha shule ina kasiki kwa ajili ya kuhifadhia nyaraka nyeti.",
                100,
                290,
                50,
                50
              );

              // doc
              // .text('Kufuatana na Sheria ya Elimu, Sura 353, cheti cha Usajili kiwekwe bayana na Uongozi wa Shule uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa Kamati ya Shule inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na Waraka wa Elimu Na. 10 wa mwaka 2011 usajili wa shule hii utarudiwa baada ya miaka 4.',100, 320, 50, 50);

              // doc
              // .text('Mmiliki wa Shule atatakiwa kuja kuchukua cheti cha usajili wa shule akiwa na kitambulisho chake mwezi mmoja baada ya kupokea barua hii',100, 370, 50, 50);

              doc1.text("Nakutakia utekelezaji mwema.", 100, 400, 50, 50);

              // doc1.image("arm.png", 280, 430, 50, 50);

              doc1.text("ke", 280, 520, 50, 50);

              doc1
                .font("Times-Bold")
                .text("KAMISHNA WA ELIMU", 250, 540, 50, 50);

              doc1.text("Nakala:", 100, 580, 50, 50);

              doc1.font("Times-Roman").text("Katibu Mkuu,", 100, 600, 50, 50);

              doc1.text("OR – TAMISEMI,", 100, 610, 50, 50);

              doc1.text("S.L.P.1923,", 100, 620, 50, 50);

              doc1.font("Times-Bold").text("DODOMA.", 100, 630, 50, 50);

              doc1
                .font("Times-Roman")
                .text("Katibu Mtendaji,", 100, 650, 50, 50);

              doc1.text("Baraza la Mitihani Tanzania,", 100, 660, 50, 50);

              doc1.text("S.L.P.2624,", 100, 670, 50, 50);

              doc1.font("Times-Bold").text("DAR ES SALAAM.", 100, 680, 50, 50);

              doc1
                .addPage()
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);

              doc1.text("Kanda ya Mashariki,", 100, 60, 50, 50);

              doc1.text("S.L.P.2419,", 100, 70, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

              doc1
                .font("Times-Roman")
                .text("Afisa Elimu Mkoa,", 100, 100, 50, 50);

              doc1.text("Mkoa wa " + RegionName + ",", 100, 110, 50, 50);

              doc1.text("S.L.P.315,", 100, 120, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc1
                .font("Times-Roman")
                .text("Afisa Elimu " + schoolCategory + ",", 100, 150, 50, 50);

              doc1.text(LgaName + ",", 100, 160, 50, 50);

              doc1.text("S.L.P.384,", 100, 170, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 180, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc1
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);

              doc1.text(LgaName + ",", 100, 160, 50, 50);

              doc1.text("S.L.P.384,", 100, 210, 50, 50);

              doc1.font("Times-Bold").text(RegionName + ".", 100, 220, 50, 50);

              // Finalize PDF file
              doc1.end();
            }

            console.log(
              new Date() + " " + req.session.userName + ": /ViewOmbiMmiliki"
            );
            res.render(
              path.join(
                __dirname +
                  "/public/design/view-ripoti-dit-badili-meneja-details"
              ),
              {
                req: req,
                muda_ombi: remain_days,
                useLev: req.session.UserLevel,
                phone_number_old: phone_number_old,
                                  userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                cheoName: req.session.cheoName,
                owner_email_old: owner_email_old,
                authorized_person_old: authorized_person_old,
                owner_name_old: owner_name_old,
                created_at: created_at,
                tracking_number: tracking_number,
                authorized_person: authorized_person,
                school_name: school_name,
                LgaName: LgaName,
                objAttachment: objAttachment,
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
                owner_phone_no: owner_phone_no,
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
                manager_phone_number: manager_phone_number,
                area: area,
                WardName: WardName,
                structure: structure,
                occupationManager: occupationManager,
                expertise_level: expertise_level,
                LgaNameMtu: LgaNameMtu,
                WardNameMtu: WardNameMtu,
                userLevel: req.session.UserLevel,
                subcategory: subcategory,
                count: count,
                staffs: jsonData.staffs,
                attachment_path: attachment_path,
                status: jsonData.status,
                Maoni: Maoni,
                Refferes: Refferes,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/ViewRipotiMmiliki/:id", function (req, res) {
  var obj = [];
  // console.log(req.params)
  var TrackingNumber = req.params.id;
  // console.log("TrackingNumber")
  // console.log(TrackingNumber)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: badiliRipotiMmilikiDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          // console.log(req.session.UserLevel)
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
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
            var owner_phone_no = data[0].owner_phone_no;
            var fullname = data[0].fullname;
            var schoolCategory = data[0].schoolCategory;
            var registry = data[0].registry;
            var occupation = data[0].occupation;
            var education_level = data[0].education_level;
            var attachment_path = data[0].attachment_path;
            var occupationManager = data[0].occupationManager;
            var mwombajiAddress = data[0].mwombajiAddress;
            var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
            var manager_phone_number = data[0].manager_phone_number;
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
            var phone_number_old = data[0].phone_number_old;
            var authorized_person_old = data[0].authorized_person_old;
            var owner_name = data[0].owner_name;
            var owner_email = data[0].owner_email;
            var count = jsonData.maoni[0].count;
            var objAttachment = jsonData.objAttachment;
            var Maoni = jsonData.Maoni;
            var Refferes = jsonData.Refferes;

            // doc.pipe(fs.createWriteStream(tracking_number+'.pdf'));

            // // Adding functionality
            // doc

            //   .fontSize(12)
            //   .font('Times-Bold')
            //   .text('JAMHURI YA MUUNGANO WA TANZANIA',220, 20, 100, 100);

            //   doc
            //   .text('WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA',210, 35, 100, 100);

            // // Adding an image in the pdf.

            //   doc.image('arm.png',280, 50, 50, 50);

            //   doc
            //   .fontSize(10)
            //   .font('Times-Roman')
            //   .text('Mji wa Serikali,',450, 80, 50, 50);

            //   doc
            //   .text('Mtumba,',450, 90, 50, 50);

            //   doc
            //   .text('Mtaa wa Afya,',450, 100, 50, 50);

            //   doc
            //   .text('S. L. P. 10,',450, 110, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text('40479 DODOMA.',450, 120, 50, 50);

            //   doc
            //   .fontSize(10)
            //   .font('Times-Roman')
            //   .text(new Date(),450, 140, 50, 50);

            //   doc
            //   .text('Anuani ya simu “ELIMU”,',100, 80, 50, 50);

            //   doc
            //   .text('Simu: 026 296 35 33,',100, 90, 50, 50);

            //   doc
            //   .text('Baruapepe: info@moe.go.tz,',100, 100, 50, 50);

            //   doc
            //   .fillColor('blue')
            //   .text('Tovuti: www.moe.go.tz,',100, 110, 50, 50)
            //   .link(100, 100, 160, 27, 'https://www.moe.go.tz/');

            //   doc
            //   .fontSize(10)
            //   .fillColor('black')
            //   .text('Upatapo tafadhali jibu kwa:',100, 130, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text('Kumb. Na. ' + tracking_number,100, 150, 50, 50);

            //   doc
            //   .font('Times-Roman')
            //   .text(fullname+',',100, 170, 170, 50);

            //   doc
            //   .text(mwombajiAddress+',',100, 180, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text(LgaName+' - '+RegionName,100, 190, 50, 50);
            //   if(schoolCategory == 'Chuo cha ualimu'){
            //     doc
            //     .text('YAH: KIBALI CHA KUANZISHA HUDUMA YA BWENI KATIKA ' + schoolCategory.toUpperCase() + ' ' + school_name.toUpperCase(),210, 220, 50, 50);

            //     doc
            //     .font('Times-Roman')
            //     .text('Tafadhali rejea somo la barua hii.',100, 240, 50, 50);

            //     doc
            //     .text('Napenda kukujulisha kuwa maombi yako ya kibali cha kuanzisha huduma ya bweni katika  ' + schoolCategory.toUpperCase() + ' '  + school_name.toUpperCase() + ' yamekubaliwa.',100, 260, 50, 50);

            //   }else{
            //   doc
            //   .text('YAH: KIBALI CHA KUANZISHA HUDUMA YA BWENI KATIKA SHULE YA ' + schoolCategory.toUpperCase() + ' ' + school_name.toUpperCase(),210, 220, 50, 50);

            //   doc
            //   .font('Times-Roman')
            //   .text('Tafadhali rejea somo la barua hii.',100, 240, 50, 50);

            //   doc
            //   .text('Napenda kukujulisha kuwa maombi yako ya kibali cha kuanzisha huduma ya bweni katika shule ya  ' + schoolCategory.toUpperCase() + ' '  + school_name.toUpperCase() + ' yamekubaliwa.',100, 260, 50, 50);
            //   }
            //   doc
            //   .text('Kibali hiki kimetolewa kwa ajili ya kulaza wanafunzi. Kibali kimetolewa kuanzia tarehe ' + created_at + '. Unatakiwa kuendelea kuboresha miundombinu na kuimarisha hali ya usalama wa wanafunzi ndani na nje ya mabweni.',100, 290, 50, 50);

            //   doc
            //   .text('Aidha, Wathibiti Ubora wa Shule watafuatilia kuhusu uwekaji vifaa vya zimamoto, viashiria moto, makabati pamoja na sehemu ya kuteketeza taka (Incinerator). Pia watafuatilia idadi halisi ya wanafunzi wanaolala ndani ya mabweni ili kuepuka msongamano wa wanafunzi.',100, 320, 50, 50);

            //   doc
            //   .text('Aidha, kibali kilichotolewa ni cha daharia na siyo bweni. Wanafunzi wa bweni watahudumiwa na jamii husika na siyo Wizara.',100, 370, 50, 50);

            //   doc
            //   .text('Nakutakia utekelezaji mwema.',100, 400, 50, 50);

            //   doc.image('arm.png',280, 430, 50, 50);

            //   doc
            //   .text("ke",280, 520, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text('KAMISHNA WA ELIMU',250, 540, 50, 50);

            //   doc
            //   .text('Nakala:',100, 580, 50, 50);

            //   doc
            //   .font('Times-Roman')
            //   .text('Katibu Mkuu,',100, 600, 50, 50);

            //   doc
            //   .text('OR – TAMISEMI,',100, 610, 50, 50);

            //   doc
            //   .text('S.L.P.1923,',100, 620, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text('DODOMA.',100, 630, 50, 50);

            //   doc
            //   .font('Times-Roman')
            //   .text('Katibu Mtendaji,',100, 650, 50, 50);

            //   doc
            //   .text('Baraza la Mitihani Tanzania,',100, 660, 50, 50);

            //   doc
            //   .text('S.L.P.2624,',100, 670, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text('DAR ES SALAAM.',100, 680, 50, 50);

            //   doc
            //   .addPage()
            //   .font('Times-Roman')
            //   .text('Mthibiti Mkuu Ubora wa Shule,',100, 50, 50, 50);

            //   // doc
            //   // .text('Kanda ya Mashariki,',100, 60, 50, 50);

            //   doc
            //   .text('S.L.P.2419,',100, 70, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text(RegionName+'.',100, 80, 50, 50);

            //   doc
            //   .font('Times-Roman')
            //   .text('Afisa Elimu Mkoa,',100, 100, 50, 50);

            //   doc
            //   .text('Mkoa wa ' + RegionName+',',100, 110, 50, 50);

            //   doc
            //   .text('S.L.P.315,',100, 120, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text(RegionName+'.',100, 130, 50, 50);

            //   doc
            //   .font('Times-Roman')
            //   .text('Afisa Elimu ' + schoolCategory+',',100, 150, 50, 50);

            //   doc
            //   .text(LgaName+',',100, 160, 50, 50);

            //   doc
            //   .text('S.L.P.384,',100, 170, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text(RegionName+'.',100, 180, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text(RegionName+'.',100, 130, 50, 50);

            //   doc
            //   .font('Times-Roman')
            //   .text('Mthibiti Mkuu Ubora wa Shule,',100, 200, 50, 50);

            //   doc
            //   .text(LgaName+',',100, 160, 50, 50);

            //   doc
            //   .text('S.L.P.384,',100, 210, 50, 50);

            //   doc
            //   .font('Times-Bold')
            //   .text(RegionName+'.',100, 220, 50, 50);

            // // Finalize PDF file
            // doc.end();
          }

          if (fs.existsSync(tracking_number + ".pdf")) {
            console.log("file exists");
          } else {
            console.log("file not found!");
            console.log(
              new Date() + " " + req.session.userName + ": /ViewOmbi"
            );

            doc.pipe(fs.createWriteStream(tracking_number + ".pdf"));

            // Adding functionality
            doc

              .fontSize(12)
              .font("Times-Bold")
              .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);

            doc.text(
              "WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA",
              210,
              35,
              100,
              100
            );

            // Adding an image in the pdf.

            //doc.image("arm.png", 280, 50, 50, 50);

            doc
              .fontSize(10)
              .font("Times-Roman")
              .text("Mji wa Serikali,", 450, 80, 50, 50);

            doc.text("Mtumba,", 450, 90, 50, 50);

            doc.text("Mtaa wa Afya,", 450, 100, 50, 50);

            doc.text("S. L. P. 10,", 450, 110, 50, 50);

            doc.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);

            doc
              .fontSize(10)
              .font("Times-Roman")
              .text(todaydate, 450, 140, 50, 50);

            doc.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);

            doc.text("Simu: 026 296 35 33,", 100, 90, 50, 50);

            doc.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

            doc
              .fillColor("blue")
              .text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50)
              .link(100, 100, 160, 27, "https://www.moe.go.tz/");

            doc
              .fontSize(10)
              .fillColor("black")
              .text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

            doc
              .font("Times-Bold")
              .text("Kumb. Na. " + tracking_number, 100, 150, 50, 50);

            doc.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);

            doc.text(mwombajiAddress + ",", 100, 180, 50, 50);

            doc
              .font("Times-Bold")
              .text(LgaName + " - " + RegionName, 100, 190, 50, 50);
            if (schoolCategory == "Chuo cha ualimu") {
              doc.text(
                "YAH: UTHIBITISHO WA KUWA MWENYE " +
                  schoolCategory.toUpperCase() +
                  " " +
                  school_name.toUpperCase(),
                210,
                220,
                50,
                50
              );

              doc
                .font("Times-Roman")
                .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

              doc.text(
                "Ninafurahi kukufahamisha kuwa Kamishna wa Elimu amemthibitisha  " +
                  owner_name.toUpperCase() +
                  " kumiliki " +
                  schoolCategory.toUpperCase() +
                  " " +
                  school_name.toUpperCase() +
                  ".",
                100,
                260,
                50,
                50
              );
            } else {
              doc.text(
                "YAH: UTHIBITISHO WA KUWA MWENYE SHULE YA " +
                  schoolCategory.toUpperCase() +
                  " " +
                  school_name.toUpperCase(),
                210,
                220,
                50,
                50
              );

              doc
                .font("Times-Roman")
                .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

              doc.text(
                "Ninafurahi kukufahamisha kuwa Kamishna wa Elimu amemthibitisha  " +
                  owner_name.toUpperCase() +
                  " kumiliki shule ya " +
                  schoolCategory.toUpperCase() +
                  " " +
                  school_name.toUpperCase() +
                  ".",
                100,
                260,
                50,
                50
              );
            }
            doc.text(
              "Uthibitisho huu umetolewa tarehe " +
                created_at +
                " kwa mujibu wa Sheria ya Elimu, Sura 353. Utamiliki shule hii kwa kuzingatia Sheria na Miongozo ya Wizara ya Elimu, Sayansi na Teknolojia. Unaagizwa kukamilisha miundombinu yote muhimu ya shule kabla ya kujaza fomu Namba RS 8..",
              100,
              290,
              50,
              50
            );

            // doc
            // .text('Kufuatana na Sheria ya Elimu, Sura 353, cheti cha Usajili kiwekwe bayana na Uongozi wa Shule uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa Kamati ya Shule inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na Waraka wa Elimu Na. 10 wa mwaka 2011 usajili wa shule hii utarudiwa baada ya miaka 4.',100, 320, 50, 50);

            // doc
            // .text('Mmiliki wa Shule atatakiwa kuja kuchukua cheti cha usajili wa shule akiwa na kitambulisho chake mwezi mmoja baada ya kupokea barua hii',100, 370, 50, 50);

            doc.text("Nakutakia utekelezaji mwema.", 100, 400, 50, 50);

            // doc.image('arm.png',280, 430, 50, 50);

            doc.text("KAMISHNA WA ELIMU", 280, 520, 50, 50);

            doc.font("Times-Bold").text("KAMISHNA WA ELIMU", 250, 540, 50, 50);

            doc.text("Nakala:", 100, 580, 50, 50);

            doc.font("Times-Roman").text("Katibu Mkuu,", 100, 600, 50, 50);

            doc.text("OR – TAMISEMI,", 100, 610, 50, 50);

            doc.text("S.L.P.1923,", 100, 620, 50, 50);

            doc.font("Times-Bold").text("DODOMA.", 100, 630, 50, 50);

            doc.font("Times-Roman").text("Katibu Mtendaji,", 100, 650, 50, 50);

            doc.text("Baraza la Mitihani Tanzania,", 100, 660, 50, 50);

            doc.text("S.L.P.2624,", 100, 670, 50, 50);

            doc.font("Times-Bold").text("DAR ES SALAAM.", 100, 680, 50, 50);

            doc
              .addPage()
              .font("Times-Roman")
              .text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);

            doc.text("Kanda ya Mashariki,", 100, 60, 50, 50);

            doc.text("S.L.P.2419,", 100, 70, 50, 50);

            doc.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

            doc.font("Times-Roman").text("Afisa Elimu Mkoa,", 100, 100, 50, 50);

            doc.text("Mkoa wa " + RegionName + ",", 100, 110, 50, 50);

            doc.text("S.L.P.315,", 100, 120, 50, 50);

            doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

            doc
              .font("Times-Roman")
              .text("Afisa Elimu " + schoolCategory + ",", 100, 150, 50, 50);

            doc.text(LgaName + ",", 100, 160, 50, 50);

            doc.text("S.L.P.384,", 100, 170, 50, 50);

            doc.font("Times-Bold").text(RegionName + ".", 100, 180, 50, 50);

            doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

            doc
              .font("Times-Roman")
              .text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);

            doc.text(LgaName + ",", 100, 160, 50, 50);

            doc.text("S.L.P.384,", 100, 210, 50, 50);

            doc.font("Times-Bold").text(RegionName + ".", 100, 220, 50, 50);

            // Finalize PDF file
            doc.end();
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/WamilikiSajiliwa/:id", function (req, res) {
  var obj = [];
  // console.log(req.params)
  var TrackingNumber = req.params.id;
  // console.log("TrackingNumber")
  // console.log(TrackingNumber)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: ombiMmilikiDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          // console.log(req.session.UserLevel)
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            var remain_days = data[0].remain_days;
            var created_at = data[0].created_at;
            var tracking_number = data[0].tracking_number;
            var school_name = data[0].school_name;
            var LgaName = data[0].LgaName;
            var WardNameMtu = data[0].WardNameMtu;
            var LgaNameMtu = data[0].LgaNameMtu;
            var RegionName = data[0].RegionName;
            var RegionNameMtu = data[0].RegionNameMtu;
            var owner_phone_no = data[0].owner_phone_no;
            var fullname = data[0].fullname;
            var schoolCategory = data[0].schoolCategory;
            var registry = data[0].registry;
            var occupation = data[0].occupation;
            var education_level = data[0].education_level;
            var occupationManager = data[0].occupationManager;
            var mwombajiAddress = data[0].mwombajiAddress;
            var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
            var manager_phone_number = data[0].manager_phone_number;
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
            var owner_name = data[0].owner_name;
            var owner_email = data[0].owner_email;
            var count = jsonData.maoni[0].count;
            var objAttachment = jsonData.objAttachment;
            var Maoni = jsonData.Maoni;
            var Refferes = jsonData.Refferes;
            // var maoni = JSON.parse(jsonData.maoni)
            // console.log(jsonData.maoni[0].count)
            console.log(
              new Date() + " " + req.session.userName + ": /WamilikiSajiliwa"
            );
            res.render(
              path.join(
                __dirname + "/public/design/view-taarifa-mmiliki-details"
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
                authorized_person: authorized_person,
                school_name: school_name,
                LgaName: LgaName,
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
                owner_phone_no: owner_phone_no,
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
                manager_phone_number: manager_phone_number,
                area: area,
                WardName: WardName,
                structure: structure,
                occupationManager: occupationManager,
                expertise_level: expertise_level,
                LgaNameMtu: LgaNameMtu,
                WardNameMtu: WardNameMtu,
                userLevel: req.session.UserLevel,
                subcategory: subcategory,
                count: count,
                staffs: jsonData.staffs,
                status: jsonData.status,
                objAttachment: objAttachment,
                Maoni: Maoni,
                Refferes: Refferes,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/SajiliOmbi/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: ombiKusajiliDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           // console.log(jsonData)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var schoolCategoryId = data[0].schoolCategoryId;
//             var schoolPhone = data[0].school_phone;
//             var genderType = data[0].gender_type;
//             var registry = data[0].registry;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var isSeminary = data[0].isSeminary;
//             var Stream = data[0].Stream;
//             var lessons_and_courses = data[0].lessons_and_courses;
//             var numberOfStudents = data[0].numberOfStudents;
//             var SeminaryTitle = data[0].SeminaryTitle;
//             var SeminaryValue = data[0].SeminaryValue;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var schoolOpeningDate = data[0].schoolOpeningDate;
//             var schoolAddress = data[0].school_address;
//             var school_email = data[0].school_email;
//             var Website = data[0].Website;
//             var po_box = data[0].po_box;
//             var area = data[0].area;
//             var numberOfTeachers = data[0].numberOfTeachers;
//             var TeacherRatioStudent = data[0].TeacherRatioStudent;
//             var schoolCategoryID = data[0].schoolCategoryID;
//             var Certificate = data[0].Certificate;
//             var WardName = data[0].WardName;
//             var teacherInformation = data[0].teacherInformation;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var Maoni = jsonData.Maoni;
//             // var maoni = JSON.parse(jsonData.maoni)
//             console.log(
//               new Date() + " " + req.session.userName + ": /SajiliOmbi"
//             );
//             res.render(
//               path.join(__dirname + "/public/design/maombi/details/view-ombi-sajili-details"),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 schoolOpeningDate: schoolOpeningDate,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 UserLevel: req.session.UserLevel,
//                 genderType: genderType,
//                 registry: registry,
//                 schoolPhone: schoolPhone,
//                 schoolCategoryID: schoolCategoryID,
//                 schoolCategoryId: schoolCategoryId,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 schoolAddress: schoolAddress,
//                 Certificate: Certificate,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 poBox: po_box,
//                 teacherInformation: teacherInformation,
//                 schoolEmail: school_email,
//                 numberOfTeachers: numberOfTeachers,
//                 TeacherRatioStudent: TeacherRatioStudent,
//                 language: language,
//                 school_size: school_size,
//                 Website: Website,
//                 isSeminary: isSeminary,
//                 Certificate: Certificate,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 SeminaryValue: SeminaryValue,
//                 lessonsAndCourses: lessons_and_courses,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 SeminaryTitle: SeminaryTitle,
//                 Stream: Stream,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 numberOfStudents: numberOfStudents,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
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

// app.get("/SajiliOmbiSerikali/:id", function (req, res) {
//   var obj = [];
//   var TrackingNumber = req.params.id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: ombiKusajiliSerDetails,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           TrackingNumber: TrackingNumber,
//           userLevel: req.session.UserLevel,
//           office: req.session.office,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;

//           // console.log(jsonData)
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             var remain_days = data[0].remain_days;
//             var created_at = data[0].created_at;
//             var tracking_number = data[0].tracking_number;
//             var school_name = data[0].school_name;
//             var LgaName = data[0].LgaName;
//             var WardNameMtu = data[0].WardNameMtu;
//             var LgaNameMtu = data[0].LgaNameMtu;
//             var RegionName = data[0].RegionName;
//             var RegionNameMtu = data[0].RegionNameMtu;
//             var fullname = data[0].fullname;
//             var schoolCategory = data[0].schoolCategory;
//             var schoolCategoryId = data[0].schoolCategoryId;
//             var schoolPhone = data[0].school_phone;
//             var genderType = data[0].gender_type;
//             var registry = data[0].registry;
//             var building = data[0].building;
//             var occupation = data[0].occupation;
//             var mwombajiAddress = data[0].mwombajiAddress;
//             var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
//             var isSeminary = data[0].isSeminary;
//             var Stream = data[0].Stream;
//             var lessons_and_courses = data[0].lessons_and_courses;
//             var numberOfStudents = data[0].numberOfStudents;
//             var SeminaryTitle = data[0].SeminaryTitle;
//             var SeminaryValue = data[0].SeminaryValue;
//             var baruaPepe = data[0].baruaPepe;
//             var language = data[0].language;
//             var school_size = data[0].school_size;
//             var schoolOpeningDate = data[0].schoolOpeningDate;
//             var schoolAddress = data[0].school_address;
//             var school_email = data[0].school_email;
//             var Website = data[0].Website;
//             var po_box = data[0].po_box;
//             var area = data[0].area;
//             var specialization = data[0].specialization;
//             var numberOfTeachers = data[0].numberOfTeachers;
//             var TeacherRatioStudent = data[0].TeacherRatioStudent;
//             var schoolCategoryID = data[0].schoolCategoryID;
//             var Certificate = data[0].Certificate;
//             var WardName = data[0].WardName;
//             var managerName = data[0].managerName;
//             var owner_name = data[0].owner_name;
//             var DisabledTitle = data[0].DisabledTitle;
//             var teacherInformation = data[0].teacherInformation;
//             var structure = data[0].structure;
//             var subcategory = data[0].subcategory;
//             var count = jsonData.maoni[0].count;
//             var objAttachment = jsonData.objAttachment;
//             var objAttachment1 = jsonData.objAttachment1;
//             var Maoni = jsonData.Maoni;
//             // var maoni = JSON.parse(jsonData.maoni)
//             // console.log(teacherInformation)
//             console.log(
//               new Date() + " " + req.session.userName + ": /SajiliOmbiSerikali"
//             );
//             res.render(
//               path.join(
//                 __dirname + "/public/design/maombi/details/view-ombi-sajili-serikali-details"
//               ),
//               {
//                 req: req,
//                 muda_ombi: remain_days,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 specialization: specialization,
//                 cheoName: req.session.cheoName,
//                 created_at: created_at,
//                 tracking_number: tracking_number,
//                 schoolOpeningDate: schoolOpeningDate,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 RegionNameMtu: RegionNameMtu,
//                 DisabledTitle: DisabledTitle,
//                 fullname: fullname,
//                 schoolCategory: schoolCategory,
//                 UserLevel: req.session.UserLevel,
//                 genderType: genderType,
//                 ownerName: owner_name,
//                 managerName: managerName,
//                 registry: registry,
//                 schoolPhone: schoolPhone,
//                 schoolCategoryID: schoolCategoryID,
//                 schoolCategoryId: schoolCategoryId,
//                 occupation: occupation,
//                 mwombajiAddress: mwombajiAddress,
//                 schoolAddress: schoolAddress,
//                 Certificate: Certificate,
//                 mwombajiPhoneNo: mwombajiPhoneNo,
//                 baruaPepe: baruaPepe,
//                 poBox: po_box,
//                 teacherInformation: teacherInformation,
//                 schoolEmail: school_email,
//                 numberOfTeachers: numberOfTeachers,
//                 TeacherRatioStudent: TeacherRatioStudent,
//                 language: language,
//                 school_size: school_size,
//                 Website: Website,
//                 isSeminary: isSeminary,
//                 Certificate: Certificate,
//                 area: area,
//                 WardName: WardName,
//                 structure: structure,
//                 SeminaryValue: SeminaryValue,
//                 lessonsAndCourses: lessons_and_courses,
//                 LgaNameMtu: LgaNameMtu,
//                 WardNameMtu: WardNameMtu,
//                 SeminaryTitle: SeminaryTitle,
//                 Stream: Stream,
//                 building: building,
//                 subcategory: subcategory,
//                 count: count,
//                 staffs: jsonData.staffs,
//                 numberOfStudents: numberOfStudents,
//                 status: jsonData.status,
//                 objAttachment: objAttachment,
//                 objAttachment1: objAttachment1,
//                 Maoni: Maoni,
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

// app.post("/TumaComment", function (req, res) {
//   console.log(req.body);
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var coments = req.body.coments;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: ombiReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           haliombi: haliombi,
//           replyType: 1,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           // var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /TumaComment"
//             );
//             res.send("success");
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   }
// });

// app.post("/MmilikiComment", function (req, res) {
//   // console.log(req.body)
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var owner_name = req.body.owner_name;
//   var authorized_person = req.body.authorized_person;
//   var owner_name_old = req.body.owner_name_old;
//   var coments = req.body.coments;
//   var authorized_person_old = req.body.authorized_person_old;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: mmilikiReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           owner_name: owner_name,
//           authorized_person: authorized_person,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           owner_name_old: owner_name_old,
//           authorized_person_old: authorized_person_old,
//           haliombi: haliombi,
//           replyType: 1,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /MmilikiComment"
//             );
//             res.send("success");
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   }
// });

// app.post("/MenejaComment", function (req, res) {
//   // console.log(req.body)
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var owner_name = req.body.owner_name;
//   var authorized_person = req.body.authorized_person;
//   var owner_name_old = req.body.owner_name_old;
//   var coments = req.body.coments;
//   var authorized_person_old = req.body.authorized_person_old;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: menejaReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           owner_name: owner_name,
//           authorized_person: authorized_person,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           owner_name_old: owner_name_old,
//           authorized_person_old: authorized_person_old,
//           haliombi: haliombi,
//           replyType: 1,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /MmilikiComment"
//             );
//             res.send("success");
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   }
// });

// app.post("/MmilikiBadiliComment", function (req, res) {
//   // console.log(req.body)
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var owner_name = req.body.owner_name;
//   var authorized_person = req.body.authorized_person;
//   var owner_name_old = req.body.owner_name_old;
//   var coments = req.body.coments;
//   var authorized_person_old = req.body.authorized_person_old;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: mmilikiReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           owner_name: owner_name,
//           authorized_person: authorized_person,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           owner_name_old: owner_name_old,
//           authorized_person_old: authorized_person_old,
//           haliombi: haliombi,
//           replyType: 1,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /MmilikiComment"
//             );
//             res.send("success");
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   }
// });

// app.post("/BadiliComment", function (req, res) {
//   // console.log(req.body)
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var coments = req.body.coments;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var newstream = req.body.newstream;
//   var oldstream = req.body.oldstream;
//   var establishId = req.body.establishId;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           newstream: newstream,
//           haliombi: haliombi,
//           replyType: 1,
//           oldstream: oldstream,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//           establishId: establishId,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliComment"
//             );
//             res.send("success");
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

// app.post("/BadiliBweniComment", function (req, res) {
//   console.log(req.body);
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var coments = req.body.coments;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var newstream = req.body.newstream;
//   var oldstream = req.body.oldstream;
//   var establishId = req.body.establishId;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliBReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           newstream: newstream,
//           haliombi: haliombi,
//           replyType: 1,
//           oldstream: oldstream,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//           establishId: establishId,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to BadiliBweniComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliBweniComment"
//             );
//             res.send("success");
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

// app.post("/HamishaComment", function (req, res) {
//   console.log(req.body);
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var coments = req.body.coments;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var newstream = req.body.newstream;
//   var oldstream = req.body.oldstream;
//   var establishId = req.body.establishId;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliHReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           newstream: newstream,
//           haliombi: haliombi,
//           replyType: 1,
//           oldstream: oldstream,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//           establishId: establishId,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to BadiliBweniComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliBweniComment"
//             );
//             res.send("success");
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

// app.post("/BadiliJinaComment", function (req, res) {
//   // console.log(req.body)
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var coments = req.body.coments;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var school_name_old = req.body.school_name_old;
//   var school_name_new = req.body.school_name_new;
//   var newstream = req.body.newstream;
//   var oldstream = req.body.oldstream;
//   var establishId = req.body.establishId;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliJinaReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           school_name_new: school_name_new,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           newstream: newstream,
//           haliombi: haliombi,
//           replyType: 1,
//           oldstream: oldstream,
//           school_name_old: school_name_old,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//           establishId: establishId,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliJinaComment"
//             );
//             res.send("success");
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//   }
// });

// app.post("/BadiliAinaComment", function (req, res) {
//   // console.log(req.body)
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var coments = req.body.coments;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var attach_length = req.body.attach_length;
//   var newstream = req.body.newstream;
//   var oldstream = req.body.oldstream;
//   var establishId = req.body.establishId;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var ombitype = req.body.ombitype;
//   var registration_number = req.body.registration_number;
//   var school_category_id_old = req.body.school_category_id_old;
//   var school_category_id_new = req.body.school_category_id_new;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: badiliainaReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           school_category_id_new: school_category_id_new,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           newstream: newstream,
//           registration_number: registration_number,
//           haliombi: haliombi,
//           replyType: 1,
//           oldstream: oldstream,
//           school_category_id_old: school_category_id_old,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//           establishId: establishId,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /BadiliAinaComment"
//             );
//             res.send("success");
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

app.post("/changeshule", function (req, res) {
  var trackingId = req.body.trackingId;
  var from_user = req.session.userID;
  var newName = req.body.newName;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: changeShule,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          trackingId: trackingId,
          from_user: from_user,
          newName: newName,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          console.log(body);
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /changeshule"
            );
            res.send("success");
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.post("/SajiliComment", function (req, res) {
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
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: sajiliReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           haliombi: haliombi,
//           replyType: 1,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /SajiliComment"
//             );
//             res.send("success");
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

// app.post("/FutaComment", function (req, res) {
//   // console.log(req.body)
//   var trackerId = req.body.trackerId;
//   var from_user = req.session.userID;
//   var staff = req.body.staffs;
//   var coments = req.body.coments;
//   var haliombi = req.body.haliombi;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   var schoolCategoryID = req.body.schoolCategoryID;
//   var schoolId = req.body.schoolId;
//   var ombitype = req.body.ombitype;
//   var staffDet = staff.split("-");
//   var department = staffDet[1];
//   var staffs = staffDet[0];
//   // console.log(department + " and " + staffs)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: futaReply,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           trackerId: trackerId,
//           from_user: from_user,
//           staffs: staffs,
//           coments: coments,
//           ombitype: ombitype,
//           haliombi: haliombi,
//           replyType: 1,
//           department: department,
//           schoolCategoryID: schoolCategoryID,
//           schoolId: schoolId,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           console.log(body);
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /SajiliComment"
//             );
//             res.send("success");
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

// app.get("/MaombiKuanzishaShuleList", function (req, res) {
//   var obj = [];
//   // console.log("jjdjdjd " + req.session.UserLevel)
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: maoanzishaShuleListAPI,
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
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             for (var i = 0; i < data.length; i++) {
//               var tracking_number = data[i].tracking_number;
//               var user_id = data[i].user_id;
//               var LgaName = data[i].LgaName;
//               var RegionName = data[i].RegionName;
//               var school_name = data[i].school_name;
//               var created_at = data[i].created_at;
//               var remain_days = data[i].remain_days;
//               req.session.TrackingNumber = tracking_number;
//               obj.push({
//                 tracking_number: tracking_number,
//                 useLev: req.session.UserLevel,
//                                   userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 user_id: user_id,
//                 school_name: school_name,
//                 LgaName: LgaName,
//                 RegionName: RegionName,
//                 created_at: created_at,
//                 remain_days: remain_days,
//               });
//             }
//             console.log(
//               new Date() +
//                 " " +
//                 req.session.userName +
//                 ": /MaombiKuanzishaShuleList"
//             );
//             res.send(obj);
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

app.get("/TaarifaSajili/:id", function (req, res) {
  const doc2 = new PDFDocument();
  var obj = [];
  var TrackingNumber = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: ombiKusajiliDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            var remain_days = data[0].remain_days;
            var created_at = data[0].created_at;
            var tracking_number = data[0].tracking_number;
            var school_name = data[0].school_name;
            var LgaName = data[0].LgaName;
            var approved_at = data[0].approved_at;
            var WardNameMtu = data[0].WardNameMtu;
            var LgaNameMtu = data[0].LgaNameMtu;
            var RegionName = data[0].RegionName;
            var RegionNameMtu = data[0].RegionNameMtu;
            var fullname = data[0].fullname;
            var staffname = data[0].staffname;
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
            var finalFileNumber = data[0].finalFileNumber;
            var SeminaryTitle = data[0].SeminaryTitle;
            var SeminaryValue = data[0].SeminaryValue;
            var baruaPepe = data[0].baruaPepe;
            var signature = data[0].signature;
            var language = data[0].language;
            var school_size = data[0].school_size;
            var schoolOpeningDate = data[0].schoolOpeningDate;
            var schoolAddress = data[0].school_address;
            var school_email = data[0].school_email;
            var Website = data[0].Website;
            var po_box = data[0].po_box;
            var area = data[0].area;
            var schoolId = data[0].schoolId;
            var reg_no = data[0].reg_no;
            var todaydate = data[0].todaydate;
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

            console.log("signature: " + signature.length);
            if (signature.length <= 0) {
              signature = "-";
            } else if (signature.length > 0) {
              // const buffer = Buffer.from(signature, "base64");
              // Jimp.read(buffer, (err, res) => {
              //   if (err) {
              //     console.log(err)
              //   }
              //   res.quality(5).write("sign"+tracking_number+".png");
              // });
              // Create Variable with Base64 Image String
              var imageString = "data:image/png;base64," + signature;
              var base64Data = imageString.replace(
                "data:image/png;base64,",
                ""
              );

              // Store Image into Server
              fs.writeFile(
                "sign" + tracking_number + ".png",
                base64Data,
                "base64",
                function (err) {
                  console.log(err);
                }
              );

              console.log("Image Saved Successfully.");
            }

            console.log(signature);

            if (fs.existsSync(tracking_number + ".pdf")) {
              console.log("file exists");
            } else {
              console.log("file not found!");
              doc2.pipe(fs.createWriteStream(tracking_number + ".pdf"));

              // Adding functionality
              doc2

                .fontSize(12)
                .font("Times-Bold")
                .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);

              doc2.text(
                "WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA",
                210,
                35,
                100,
                100
              );

              // Adding an image in the pdf.

              doc2.image("public/assets/images/arm.png", 280, 50, 50, 50);

              doc2
                .fontSize(10)
                .font("Times-Roman")
                .text("Mji wa Serikali,", 450, 80, 50, 50);

              doc2.text("Mtumba,", 450, 90, 50, 50);

              doc2.text("Mtaa wa Afya,", 450, 100, 50, 50);

              doc2.text("S. L. P. 10,", 450, 110, 50, 50);

              doc2.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);

              doc2
                .fontSize(10)
                .font("Times-Roman")
                .text(todaydate, 450, 140, 50, 50);

              doc2.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);

              doc2.text("Simu: 026 296 35 33,", 100, 90, 50, 50);

              doc2.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

              doc2
                .fillColor("blue")
                .text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50)
                .link(100, 100, 160, 27, "https://www.moe.go.tz/");

              doc2
                .fontSize(10)
                .fillColor("black")
                .text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

              doc2
                .font("Times-Bold")
                .text("Kumb. Na. " + finalFileNumber, 100, 150, 50, 50);

              doc2.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);

              doc2.text(mwombajiAddress + ",", 100, 180, 50, 50);

              doc2
                .font("Times-Bold")
                .text(LgaName + " - " + RegionName, 100, 190, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc2.text(
                  "Yah: USAJILI WA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc2
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc2.text(
                  "Ninafurahi kukujulisha kuwa " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase() +
                    "  kimesajiliwa tarehe " +
                    approved_at +
                    " kwa mujibu wa Sheria ya Elimu, Sura ya 353.",
                  100,
                  260,
                  50,
                  50
                );
                if (Stream == 1) {
                  doc2.text(
                    "Chuo kimepewa namba ya Usajili " +
                      reg_no +
                      " kuwa " +
                      subcategory.toUpperCase() +
                      ", " +
                      genderType.toUpperCase() +
                      ", mkondo " +
                      Stream +
                      " na kitatumia Lugha ya " +
                      language.toUpperCase() +
                      " kufundishia na kujifunzia.",
                    100,
                    290,
                    50,
                    50
                  );
                } else {
                  doc2.text(
                    "Chuo kimepewa namba ya Usajili " +
                      reg_no +
                      " kuwa " +
                      subcategory.toUpperCase() +
                      ", " +
                      genderType.toUpperCase() +
                      ", mikondo " +
                      Stream +
                      " na kitatumia Lugha ya " +
                      language.toUpperCase() +
                      " kufundishia na kujifunzia.",
                    100,
                    290,
                    50,
                    50
                  );
                }
                doc2.text(
                  "Kufuatana na Sheria ya Elimu, Sura 353, cheti cha Usajili kiwekwe bayana na Uongozi wa Chuo uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa Kamati ya Shule inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na Waraka wa Elimu Na. 10 wa mwaka 2011 usajili wa chuo hiki utarudiwa baada ya miaka 4.",
                  100,
                  320,
                  50,
                  50
                );

                doc2.text(
                  "Mmiliki wa Chuo atatakiwa kuja kuchukua cheti cha usajili wa chuo akiwa na kitambulisho chake baada ya siku 14 baada ya kupokea barua hii",
                  100,
                  370,
                  50,
                  50
                );
              } else {
                doc2.text(
                  "YAH: USAJILI WA SHULE YA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc2
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc2.text(
                  "Ninafurahi kukujulisha kuwa shule ya  " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase() +
                    "  imesajiliwa tarehe " +
                    approved_at +
                    " kwa mujibu wa Sheria ya Elimu, Sura ya 353.",
                  100,
                  260,
                  50,
                  50
                );
                if (Stream == 1) {
                  doc2.text(
                    "Shule imepewa namba ya Usajili " +
                      reg_no +
                      " kuwa shule ya " +
                      subcategory.toUpperCase() +
                      " na " +
                      genderType.toUpperCase() +
                      ", mkondo " +
                      Stream +
                      "na itakayotumia Lugha ya " +
                      language.toUpperCase() +
                      " kufundishia na kujifunzia.",
                    100,
                    290,
                    50,
                    50
                  );
                } else {
                  doc2.text(
                    "Shule imepewa namba ya Usajili " +
                      reg_no +
                      " kuwa shule ya " +
                      subcategory.toUpperCase() +
                      " na " +
                      genderType.toUpperCase() +
                      ", mikondo " +
                      Stream +
                      "na itakayotumia Lugha ya " +
                      language.toUpperCase() +
                      " kufundishia na kujifunzia.",
                    100,
                    290,
                    50,
                    50
                  );
                }
                doc2.text(
                  "Kufuatana na Sheria ya Elimu, Sura 353, cheti cha Usajili kiwekwe bayana na Uongozi wa Shule uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa Kamati ya Shule inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na Waraka wa Elimu Na. 10 wa mwaka 2011 usajili wa shule hii utarudiwa baada ya miaka 4.",
                  100,
                  320,
                  50,
                  50
                );

                doc2.text(
                  "Mmiliki wa Shule atatakiwa kuja kuchukua cheti cha usajili wa shule akiwa na kitambulisho chake baada ya siku 14 baada ya kupokea barua hii",
                  100,
                  370,
                  50,
                  50
                );
              }

              doc2.text("Nakutakia utekelezaji mwema.", 100, 400, 50, 50);

              if (signature == "-") {
                doc2.text("-", 100, 400, 50, 50);
              } else if (signature.length > 0) {
                doc2.image("sign" + tracking_number + ".png", 280, 430, 50, 50);
              }

              doc2.text(staffname, 280, 520, 50, 50);

              doc2
                .font("Times-Bold")
                .text("KAMISHNA WA ELIMU", 250, 540, 50, 50);

              doc2.text("Nakala:", 100, 580, 50, 50);

              doc2.font("Times-Roman").text("Katibu Mkuu,", 100, 600, 50, 50);

              doc2.text("OR – TAMISEMI,", 100, 610, 50, 50);

              doc2.text("S.L.P.1923,", 100, 620, 50, 50);

              doc2.font("Times-Bold").text("DODOMA.", 100, 630, 50, 50);

              doc2
                .font("Times-Roman")
                .text("Katibu Mtendaji,", 100, 650, 50, 50);

              doc2.text("Baraza la Mitihani Tanzania,", 100, 660, 50, 50);

              doc2.text("S.L.P.2624,", 100, 670, 50, 50);

              doc2.font("Times-Bold").text("DAR ES SALAAM.", 100, 680, 50, 50);

              doc2
                .addPage()
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);

              doc2.text("Kanda ya Mashariki,", 100, 60, 50, 50);

              doc2.text("S.L.P.2419,", 100, 70, 50, 50);

              doc2.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

              doc2
                .font("Times-Roman")
                .text("Afisa Elimu Mkoa,", 100, 100, 50, 50);

              doc2.text("Mkoa wa " + RegionName + ",", 100, 110, 50, 50);

              doc2.text("S.L.P.315,", 100, 120, 50, 50);

              doc2.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc2
                .font("Times-Roman")
                .text("Afisa Elimu " + schoolCategory + ",", 100, 150, 50, 50);

              doc2.text(LgaName + ",", 100, 160, 50, 50);

              doc2.text("S.L.P.384,", 100, 170, 50, 50);

              doc2.font("Times-Bold").text(RegionName + ".", 100, 180, 50, 50);

              doc2.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc2
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);

              doc2.text(LgaName + ",", 100, 160, 50, 50);

              doc2.text("S.L.P.384,", 100, 210, 50, 50);

              doc2.font("Times-Bold").text(RegionName + ".", 100, 220, 50, 50);

              // Finalize PDF file
              doc2.end();
            }

            // var maoni = JSON.parse(jsonData.maoni)
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliOmbi"
            );
            res.render(
              path.join(__dirname + "/public/design/reports/details/view-ripoti-sajili"),
              {
                req: req,
                muda_ombi: remain_days,
                schoolId: schoolId,
                useLev: req.session.UserLevel,
                                  userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                cheoName: req.session.cheoName,
                created_at: created_at,
                tracking_number: tracking_number,
                schoolOpeningDate: schoolOpeningDate,
                school_name: school_name,
                LgaName: LgaName,
                RegionName: RegionName,
                RegionNameMtu: RegionNameMtu,
                approved_at: approved_at,
                fullname: fullname,
                schoolCategory: schoolCategory,
                UserLevel: req.session.UserLevel,
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
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/TaarifaBilaMajengo/:id", function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: viewBilaMajDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            var remain_days = data[0].remain_days;
            var created_at = data[0].created_at;
            var tracking_number = data[0].tracking_number;
            var school_name = data[0].school_name;
            var LgaName = data[0].LgaName;
            var level = data[0].level;
            var approved_at = data[0].approved_at;
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
            var finalFileNumber = data[0].finalFileNumber;
            var language = data[0].language;
            var school_size = data[0].school_size;
            var schoolOpeningDate = data[0].schoolOpeningDate;
            var schoolAddress = data[0].school_address;
            var school_email = data[0].school_email;
            var Website = data[0].Website;
            var po_box = data[0].po_box;
            var area = data[0].area;
            var reg_no = data[0].reg_no;
            var todaydate = data[0].todaydate;
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

            if (fs.existsSync(tracking_number + ".pdf")) {
              console.log("file exists");
            } else {
              console.log("file not found!");

              doc.pipe(fs.createWriteStream(tracking_number + ".pdf"));

              // Adding functionality
              doc

                .fontSize(12)
                .font("Times-Bold")
                .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);

              doc.text(
                "WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA",
                210,
                35,
                100,
                100
              );

              // Adding an image in the pdf.

              doc.image("public/assets/images/arm.png", 280, 50, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text("Mji wa Serikali,", 450, 80, 50, 50);

              doc.text("Mtumba,", 450, 90, 50, 50);

              doc.text("Mtaa wa Afya,", 450, 100, 50, 50);

              doc.text("S. L. P. 10,", 450, 110, 50, 50);

              doc.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text(todaydate, 450, 140, 50, 50);

              doc.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);

              doc.text("Simu: 026 296 35 33,", 100, 90, 50, 50);

              doc.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

              doc
                .fillColor("blue")
                .text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50)
                .link(100, 100, 160, 27, "https://www.moe.go.tz/");

              doc
                .fontSize(10)
                .fillColor("black")
                .text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

              doc
                .font("Times-Bold")
                .text("Kumb. Na. " + finalFileNumber, 100, 150, 50, 50);

              // doc
              //   .font("Times-Roman")
              //   .text("Ester Ladislaus Kiwona,", 100, 170, 170, 50);

              // doc.text("S.L.P. 05,", 100, 180, 50, 50);
              doc.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);

              doc.text(mwombajiAddress + ",", 100, 180, 50, 50);

              doc
                .font("Times-Bold")
                .text(LgaName + " - " + RegionName, 100, 190, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc.text(
                  "YAH: KIBALI CHA KUANZISHA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc.text(
                  "Ninafurahi kukufahamisha kuwa kibali cha kuanzisha " +
                    schoolCategory +
                    " " +
                    school_name +
                    "  kimetolewa ili shule hiyo ianzishwe katika Kata ya " +
                    WardName +
                    " Halmashauri ya Wilaya ya " +
                    LgaName +
                    " Mkoa wa " +
                    RegionName,
                  100,
                  260,
                  50,
                  50
                );
              } else {
                doc.text(
                  "YAH: KIBALI CHA KUANZISHA SHULE YA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  210,
                  220,
                  50,
                  50
                );

                doc
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc.text(
                  "Ninafurahi kukufahamisha kuwa kibali cha kuanzisha shule ya " +
                    schoolCategory +
                    " " +
                    school_name +
                    "  kimetolewa ili shule hiyo ianzishwe katika Kata ya " +
                    WardName +
                    " Halmashauri ya Wilaya ya " +
                    LgaName +
                    " Mkoa wa " +
                    RegionName,
                  100,
                  260,
                  50,
                  50
                );
              }
              // doc
              // .text('Shule imepewa namba ya Usajili ' + reg_no +' kuwa shule ya ' + subcategory +' na ' + genderType + ' yenye mkondo mmoja/mikondo ' + Stream + ', yenye kutumia Lugha ya ' + language + ' kufundishia na kujifunzia.',100, 290, 50, 50);

              doc.text(
                "Kibali hiki kimetolewa kwa mujibu wa Sheria ya Elimu Sura ya 353, kwa masharti kuwa utazingatia mwongozo wa Wizara wa kuanzisha na kusajili shule zisizo za Serikali. Unashauriwa kuwasiliana na Msanifu wa Majengo wa Wilaya kwa ushauri wa kitaalam wa kuendeleza majengo hayo kulingana na mahitaji ya Shule. Aidha, unatakiwa kuhakikisha uwepo wa miundombinu ya walemavu katika shule yako.",
                100,
                290,
                50,
                50
              );

              doc
                .font("Times-Bold")
                .text(
                  "Kibali hiki sio ruhusa ya kuandikisha wanafunzi",
                  100,
                  370,
                  50,
                  50
                );

              doc
                .font("Times-Roman")
                .text("Nakutakia utekelezaji mwema.", 100, 400, 50, 50);

              // doc.image('arm.png',280, 430, 50, 50);

              // doc.text("Venance N. Manori", 280, 520, 50, 50);

              doc
                .font("Times-Bold")
                .text("KAMISHNA WA ELIMU", 250, 540, 50, 50);

              doc.addPage().text("Nakala:", 100, 580, 50, 50);

              // doc
              // .font('Times-Roman')
              // .text('Katibu Mkuu,',100, 600, 50, 50);

              // doc
              // .text('OR – TAMISEMI,',100, 610, 50, 50);

              // doc
              // .text('S.L.P.1923,',100, 620, 50, 50);

              // doc
              // .font('Times-Bold')
              // .text('DODOMA.',100, 630, 50, 50);

              // doc
              // .font('Times-Roman')
              // .text('Katibu Mtendaji,',100, 650, 50, 50);

              // doc
              // .text('Baraza la Mitihani Tanzania,',100, 660, 50, 50);

              // doc
              // .text('S.L.P.2624,',100, 670, 50, 50);

              // doc
              // .font('Times-Bold')
              // .text('DAR ES SALAAM.',100, 680, 50, 50);

              doc
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);

              doc.text("Kanda ya Mashariki,", 100, 60, 50, 50);

              doc.text("S.L.P.2419,", 100, 70, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu Mkoa,", 100, 100, 50, 50);

              doc.text("Mkoa wa " + RegionName + ",", 100, 110, 50, 50);

              doc.text("S.L.P.315,", 100, 120, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu " + schoolCategory + ",", 100, 150, 50, 50);

              doc.text(
                "Halmashauri ya Wilaya ya " + LgaName + ",",
                100,
                160,
                50,
                50
              );

              doc.text("S.L.P.384,", 100, 170, 50, 50);

              doc.font("Times-Bold").text(LgaName + ".", 100, 180, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);

              doc.text(
                "Halmashauri ya Wilaya ya " + LgaName + ",",
                100,
                160,
                50,
                50
              );

              doc.text("S.L.P.384,", 100, 210, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 220, 50, 50);

              // Finalize PDF file
              doc.end();
            }
            // var maoni = JSON.parse(jsonData.maoni)
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliOmbi"
            );
            res.render(
              path.join(__dirname + "/public/design/view-ripoti-majengo"),
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
                schoolOpeningDate: schoolOpeningDate,
                school_name: school_name,
                LgaName: LgaName,
                RegionName: RegionName,
                RegionNameMtu: RegionNameMtu,
                approved_at: approved_at,
                fullname: fullname,
                schoolCategory: schoolCategory,
                UserLevel: req.session.UserLevel,
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
                level: level,
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
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/TaarifaBilaMajengoKat/:id", function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: viewBilaMajKatDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            var remain_days = data[0].remain_days;
            var created_at = data[0].created_at;
            var tracking_number = data[0].tracking_number;
            var school_name = data[0].school_name;
            var LgaName = data[0].LgaName;
            var level = data[0].level;
            var approved_at = data[0].approved_at;
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
            var reg_no = data[0].reg_no;
            var todaydate = data[0].todaydate;
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
              path.join(__dirname + "/public/design/view-ripoti-majengo"),
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
                schoolOpeningDate: schoolOpeningDate,
                school_name: school_name,
                LgaName: LgaName,
                RegionName: RegionName,
                RegionNameMtu: RegionNameMtu,
                approved_at: approved_at,
                fullname: fullname,
                schoolCategory: schoolCategory,
                UserLevel: req.session.UserLevel,
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
                level: level,
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
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/TaarifaMajengo/:id", function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: viewMajDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            var remain_days = data[0].remain_days;
            var created_at = data[0].created_at;
            var tracking_number = data[0].tracking_number;
            var school_name = data[0].school_name;
            var LgaName = data[0].LgaName;
            var level = data[0].level;
            var approved_at = data[0].approved_at;
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
            var finalFileNumber = data[0].finalFileNumber;
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
            var reg_no = data[0].reg_no;
            var todaydate = data[0].todaydate;
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
            if (fs.existsSync(tracking_number + ".pdf")) {
              console.log("file exists");
            } else {
              console.log("file not found!");
              doc.pipe(fs.createWriteStream(tracking_number + ".pdf"));

              // Adding functionality
              doc

                .fontSize(12)
                .font("Times-Bold")
                .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);

              doc.text(
                "WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA",
                210,
                35,
                100,
                100
              );

              // Adding an image in the pdf.

              //doc.image("arm.png", 280, 50, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text("Mji wa Serikali,", 450, 80, 50, 50);

              doc.text("Mtumba,", 450, 90, 50, 50);

              doc.text("Mtaa wa Afya,", 450, 100, 50, 50);

              doc.text("S. L. P. 10,", 450, 110, 50, 50);

              doc.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);

              doc
                .fontSize(10)
                .font("Times-Roman")
                .text(todaydate, 450, 140, 50, 50);

              doc.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);

              doc.text("Simu: 026 296 35 33,", 100, 90, 50, 50);

              doc.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

              doc
                .fillColor("blue")
                .text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50)
                .link(100, 100, 160, 27, "https://www.moe.go.tz/");

              doc
                .fontSize(10)
                .fillColor("black")
                .text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

              doc
                .font("Times-Bold")
                .text("Kumb. Na. " + finalFileNumber, 100, 150, 50, 50);

              doc.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);

              doc.text(mwombajiAddress + ",", 100, 180, 50, 50);

              doc
                .font("Times-Bold")
                .text(LgaName + " - " + RegionName, 100, 190, 50, 50);
              if (schoolCategory == "Chuo cha ualimu") {
                doc.text(
                  "YAH: KIBALI CHA KUTUMIA MAJENGO KUANZISHA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  150,
                  220,
                  50,
                  50
                );

                doc
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc.text(
                  "Ninafurahi kukufahamisha kuwa kibali cha kutumia majengo kuanzisha " +
                    schoolCategory +
                    " " +
                    school_name +
                    "  kimetolewa. Shule hiyo itakuwa katika Kata ya " +
                    WardName +
                    " Halmashauri ya Wilaya ya " +
                    LgaName +
                    " Mkoa wa " +
                    RegionName,
                  100,
                  260,
                  50,
                  50
                );
              } else {
                doc.text(
                  "YAH: KIBALI CHA KUTUMIA MAJENGO KUANZISHA SHULE YA " +
                    schoolCategory.toUpperCase() +
                    " " +
                    school_name.toUpperCase(),
                  150,
                  220,
                  50,
                  50
                );

                doc
                  .font("Times-Roman")
                  .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

                doc.text(
                  "Ninafurahi kukufahamisha kuwa kibali cha kutumia majengo kuanzisha shule ya " +
                    schoolCategory +
                    " " +
                    school_name +
                    "  kimetolewa. Shule hiyo itakuwa katika Kata ya " +
                    WardName +
                    " Halmashauri ya Wilaya ya " +
                    LgaName +
                    " Mkoa wa " +
                    RegionName,
                  100,
                  260,
                  50,
                  50
                );
              }
              doc.text(
                "Kibali hiki kimetolewa kwa mujibu wa Sheria ya Elimu Sura 353, kwa masharti kuwa utazingatia Mwongozo wa Wizara wa kuanzisha na kusajili shule. Unashauriwa kuendelea kuwasiliana na Msanifu wa majengo wa Halmashauri kwa ushauri wa kitaalam.",
                100,
                300,
                50,
                50
              );

              doc.text(
                "Aidha, unatakiwa kuhakikisha uwepo wa miundombinu ya watu/wanafunzi wenye ulemavu",
                100,
                350,
                50,
                50
              );

              doc
                .font("Times-Bold")
                .text(
                  "Hakikisha jina la Mmiliki wa Shule litakalojazwa katika fomu US 2 liwe lile lililoko kwenye Hatimiliki ya ardhi. Aidha Meneja, atakayependekezwa katika fomu US 3 awe mwalimu au aliyepata kozi ya uongozi katika elimu katika chuo kinachotambuliwa na Serikali na awasilishe wasifu binafsi na nakala ya cheti cha taaluma ya ualimu.",
                  100,
                  370,
                  50,
                  50
                );

              doc.text(
                "Kibali hiki sio ruhusa ya kuandikisha wanafunzi.",
                100,
                430,
                50,
                50
              );

              doc
                .font("Times-Roman")
                .text("Nakutakia utekelezaji mwema.", 100, 450, 50, 50);

              // doc.image('arm.png',280, 470, 50, 50);

              // doc.text("Venance N. Manori", 280, 560, 50, 50);

              doc
                .font("Times-Bold")
                .text("KAMISHNA WA ELIMU", 250, 570, 50, 50);

              doc.addPage().text("Nakala:", 100, 30, 50, 50);

              // doc
              // .font('Times-Roman')
              // .text('Katibu Mkuu,',100, 600, 50, 50);

              // doc
              // .text('OR – TAMISEMI,',100, 610, 50, 50);

              // doc
              // .text('S.L.P.1923,',100, 620, 50, 50);

              // doc
              // .font('Times-Bold')
              // .text('DODOMA.',100, 630, 50, 50);

              // doc
              // .font('Times-Roman')
              // .text('Katibu Mtendaji,',100, 650, 50, 50);

              // doc
              // .text('Baraza la Mitihani Tanzania,',100, 660, 50, 50);

              // doc
              // .text('S.L.P.2624,',100, 670, 50, 50);

              // doc
              // .font('Times-Bold')
              // .text('DAR ES SALAAM.',100, 680, 50, 50);

              doc
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);

              doc.text("Kanda ya Mashariki,", 100, 60, 50, 50);

              doc.text("S.L.P.2419,", 100, 70, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu Mkoa,", 100, 100, 50, 50);

              doc.text("Mkoa wa ," + RegionName, 100, 110, 50, 50);

              doc.text("S.L.P.315,", 100, 120, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Afisa Elimu ," + schoolCategory, 100, 150, 50, 50);

              doc.text(LgaName + ",", 100, 160, 50, 50);

              doc.text("S.L.P.384,", 100, 170, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 180, 50, 50);

              doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

              doc
                .font("Times-Roman")
                .text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);

              doc.text(LgaName + ",", 100, 160, 50, 50);

              doc.text("S.L.P.384,", 100, 210, 50, 50);

              doc.font("Times-Bold").text(LgaName + ".", 100, 220, 50, 50);

              // Finalize PDF file
              doc.end();
            }
            // var maoni = JSON.parse(jsonData.maoni)
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliOmbi"
            );
            res.render(
              path.join(__dirname + "/public/design/view-ripoti-majengo"),
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
                schoolOpeningDate: schoolOpeningDate,
                school_name: school_name,
                LgaName: LgaName,
                RegionName: RegionName,
                RegionNameMtu: RegionNameMtu,
                approved_at: approved_at,
                fullname: fullname,
                schoolCategory: schoolCategory,
                UserLevel: req.session.UserLevel,
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
                level: level,
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
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/TaarifaMajengoKat/:id", function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: viewMajKatDetails,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          TrackingNumber: TrackingNumber,
          userLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;

          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            var remain_days = data[0].remain_days;
            var created_at = data[0].created_at;
            var tracking_number = data[0].tracking_number;
            var school_name = data[0].school_name;
            var LgaName = data[0].LgaName;
            var level = data[0].level;
            var approved_at = data[0].approved_at;
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
            var reg_no = data[0].reg_no;
            var todaydate = data[0].todaydate;
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
              path.join(__dirname + "/public/design/view-ripoti-majengo-kat"),
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
                schoolOpeningDate: schoolOpeningDate,
                school_name: school_name,
                LgaName: LgaName,
                RegionName: RegionName,
                RegionNameMtu: RegionNameMtu,
                approved_at: approved_at,
                fullname: fullname,
                schoolCategory: schoolCategory,
                UserLevel: req.session.UserLevel,
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
                level: level,
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
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/MaombiKuanzishaShuleSerList", function (req, res) {
  var obj = [];
  // console.log("jjdjdjd " + req.session.UserLevel)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maoanzishaShuleSerListAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleList " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            for (var i = 0; i < data.length; i++) {
              var tracking_number = data[i].tracking_number;
              var user_id = data[i].user_id;
              var LgaName = data[i].LgaName;
              var RegionName = data[i].RegionName;
              var school_name = data[i].school_name;
              var created_at = data[i].created_at;
              var remain_days = data[i].remain_days;
              req.session.TrackingNumber = tracking_number;
              console.log(
                new Date() +
                  " " +
                  req.session.userName +
                  ": /MaombiKuanzishaShuleSerList"
              );
              obj.push({
                tracking_number: tracking_number,
                useLev: req.session.UserLevel,
                                  userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                cheoName: req.session.cheoName,
                user_id: user_id,
                school_name: school_name,
                LgaName: LgaName,
                RegionName: RegionName,
                created_at: created_at,
                remain_days: remain_days,
              });
            }
            res.send(obj);
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/maoanzishaShuleSerListAPI", function (req, res) {
  var obj = [];
  // console.log("jjdjdjd " + req.session.UserLevel)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maoanzishaShuleSerListAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleList " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            for (var i = 0; i < data.length; i++) {
              var tracking_number = data[i].tracking_number;
              var user_id = data[i].user_id;
              var LgaName = data[i].LgaName;
              var RegionName = data[i].RegionName;
              var school_name = data[i].school_name;
              var created_at = data[i].created_at;
              var remain_days = data[i].remain_days;
              req.session.TrackingNumber = tracking_number;
              console.log(
                new Date() +
                  " " +
                  req.session.userName +
                  ": /maoanzishaShuleSerListAPI"
              );
              obj.push({
                tracking_number: tracking_number,
                useLev: req.session.UserLevel,
                                  userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                cheoName: req.session.cheoName,
                user_id: user_id,
                school_name: school_name,
                LgaName: LgaName,
                RegionName: RegionName,
                created_at: created_at,
                remain_days: remain_days,
              });
            }
            res.send(obj);
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/MaombiKuanzishaShuleJumla", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maoanzishaShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          //console.log(new Date() + ": fail to MaombiKuanzishaShuleJumla " + error)
          res.send("failed");
        }
        // console.log(body)
        if (body !== undefined) {
          // console.log(body)
          var jsonData = JSON.parse(body);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;

          if (statusCode == 300) {
            obj.push({ jumla: data });
            //console.log(new Date() + ": Successful MaombiKuanzishaShuleList")
            //console.log(obj)
            console.log(
              new Date() +
                " " +
                req.session.userName +
                ": /MaombiKuanzishaShuleJumla"
            );
            res.send(obj);
            //
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/ShuleZilizoanzishwa", function (req, res) {
  var obj = [];
  var objlist = [];
  var objtotal = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: anzishaShuleJumlaAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        // console.log(body)
        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          for (var i = 0; i < data.length; i++) {
            var kaunti = data[i].kaunti;
            var category = data[i].category;
            objtotal.push({ kaunti: kaunti, category: category });
          }
          var list = jsonData.list;
          for (var i = 0; i < list.length; i++) {
            var school_name = list[i].school_name;
            var category = list[i].category;
            var approved_at = list[i].approved_at;
            var LgaName = list[i].LgaName;
            var RegionName = list[i].RegionName;
            var tracking_number = list[i].tracking_number;
            var dateDisplay = list[i].dateDisplay;
            var WardName = list[i].WardName;
            console.log(
              new Date() + " " + req.session.userName + ": /ShuleZilizoanzishwa"
            );
            objlist.push({
              school_name: school_name,
              category: category,
              approved_at: approved_at,
              LgaName: LgaName,
              RegionName: RegionName,
              tracking_number: tracking_number,
              dateDisplay: dateDisplay,
              WardName: WardName,
            });
          }
          if (statusCode == 300) {
            res.render(
              path.join(__dirname + "/public/design/shulezilizoanzishwa"),
              {
                req: req,
                objtotal: objtotal,
                list: objlist,
                useLev: req.session.UserLevel,
                                  userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                cheoName: req.session.cheoName,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/MmilikiMeneja", function (req, res) {
  var obj = [];
  var objlist = [];
  var objtotal = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: menejaShuleJumlaAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        //  console.log(body)
        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          for (var i = 0; i < data.length; i++) {
            var kaunti = data[i].kaunti;
            var category = data[i].category;
            objtotal.push({ kaunti: kaunti, category: category });
          }
          var list = jsonData.list;
          for (var i = 0; i < list.length; i++) {
            var school_name = list[i].school_name;
            var category = list[i].category;
            var approved_at = list[i].approved_at;
            var LgaName = list[i].LgaName;
            var RegionName = list[i].RegionName;
            var tracking_number = list[i].tracking_number;
            var dateDisplay = list[i].dateDisplay;
            var WardName = list[i].WardName;
            console.log(
              new Date() + " " + req.session.userName + ": /MmilikiMeneja"
            );
            objlist.push({
              school_name: school_name,
              category: category,
              approved_at: approved_at,
              LgaName: LgaName,
              RegionName: RegionName,
              tracking_number: tracking_number,
              dateDisplay: dateDisplay,
              WardName: WardName,
            });
          }
          if (statusCode == 300) {
            res.render(path.join(__dirname + "/public/design/shulemmiliki"), {
              req: req,
              objtotal: objtotal,
              list: objlist,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/ShuleZilizosajiliwa", function (req, res) {
  var obj = [];
  var objlist = [];
  var objtotal = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: sajiliShuleJumlaAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        //  console.log(body)
        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          for (var i = 0; i < data.length; i++) {
            var kaunti = data[i].kaunti;
            var category = data[i].category;
            objtotal.push({ kaunti: kaunti, category: category });
          }
          var list = jsonData.list;
          for (var i = 0; i < list.length; i++) {
            var school_name = list[i].school_name;
            var category = list[i].category;
            var approved_at = list[i].approved_at;
            var LgaName = list[i].LgaName;
            var RegionName = list[i].RegionName;
            var tracking_number = list[i].tracking_number;
            var dateDisplay = list[i].dateDisplay;
            var WardName = list[i].WardName;
            var reg_no = list[i].reg_no;
            var subcategory = list[i].subcategory;
            var gender_type = list[i].gender_type;
            objlist.push({
              school_name: school_name,
              category: category,
              subcategory: subcategory,
              approved_at: approved_at,
              LgaName: LgaName,
              RegionName: RegionName,
              gender_type: gender_type,
              tracking_number: tracking_number,
              dateDisplay: dateDisplay,
              WardName: WardName,
              reg_no: reg_no,
            });
          }
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /ShuleZilizosajiliwa"
            );
            res.render(
              path.join(__dirname + "/public/design/shulezilizosajiliwa"),
              {
                req: req,
                objtotal: objtotal,
                list: objlist,
                useLev: req.session.UserLevel,
                                  userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                cheoName: req.session.cheoName,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.get("/RipotiZilizosajiliwa", function (req, res) {
//   var obj = [];
//   var objlist = [];
//   var objtotal = [];
//   var per_page =  Number(req.query.per_page || 10);
//   var page = Number(req.query.page || 1);
//   var today = new Date();
//   // today = dateFormat.format(today, "dd/mm/yyyy")
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: sajiliShuleJumlaAPI+`?page=${page}&per_page=${per_page}`,
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
//           console.log(new Date() + ": fail to RipotiZilizosajiliwa " + error);
//           res.send("failed");
//         }
//         console.log(body);
//         if (body !== undefined) {
//           // var jsonData = JSON.parse(body)
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           var numRows = jsonData.numRows;

//           for (var i = 0; i < data.length; i++) {
//             var kaunti = data[i].kaunti;
//             var category = data[i].category;
//             objtotal.push({ kaunti: kaunti, category: category });
//           }
//           var list = jsonData.list;
//           for (var i = 0; i < list.length; i++) {
//             var school_name = list[i].school_name;
//             var category = list[i].category;
//             var approved_at = list[i].approved_at;
//             var LgaName = list[i].LgaName;
//             var RegionName = list[i].RegionName;
//             var tracking_number = list[i].tracking_number;
//             var dateDisplay = list[i].dateDisplay;
//             var WardName = list[i].WardName;
//             var reg_no = list[i].reg_no;
//             var subcategory = list[i].subcategory;
//             var gender_type = list[i].gender_type;
//             var school_phone = list[i].school_phone;
//             var po_box = list[i].po_box;
//             var level = list[i].level;
//             var owner_name = list[i].owner_name;
//             var todaydate = list[i].todaydate;
//             var school_email = list[i].school_email;
//             var stream = list[i].stream;
//             var language = list[i].language;
//             objlist.push({
//               school_name: school_name,
//               category: category,
//               subcategory: subcategory,
//               level: level,
//               po_box: po_box,
//               language: language,
//               approved_at: approved_at,
//               LgaName: LgaName,
//               RegionName: RegionName,
//               gender_type: gender_type,
//               school_phone: school_phone,
//               tracking_number: tracking_number,
//               dateDisplay: dateDisplay,
//               WardName: WardName,
//               reg_no: reg_no,
//               school_email: school_email,
//             });
//             // const data = [
//             //   { name: 'Diary', code: 'diary_code', author: 'Pagorn' },
//             //   { name: 'Note', code: 'note_code', author: 'Pagorn' },
//             //   { name: 'Medium', code: 'medium_code', author: 'Pagorn' },
//             // ]
//           }
//           if (statusCode == 300) {
//             console.log(
//               new Date() +
//                 " " +
//                 req.session.userName +
//                 ": /RipotiZilizosajiliwa"
//             );
//             const workSheet = XLSX.utils.json_to_sheet(objlist);
//             const workBook = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
//             XLSX.writeFile(workBook, "sample.xlsx");
//             // Saving the pdf file in root directory.

<<<<<<< HEAD
//             res.render(
//               path.join(__dirname + "/public/design/reports/ripotizilizosajiliwa"),
//               {
//                 req: req,
//                 objtotal: objtotal,
//                 list: objlist,
//                 useLev: req.session.UserLevel,
//                 userName: req.session.userName,
//                 RoleManage: req.session.RoleManage,
//                 userID: req.session.userID,
//                 cheoName: req.session.cheoName,
//                 pagination : {
//                               total : numRows , 
//                               current : page , 
//                               per_page : per_page , 
//                               url : 'RipotiZilizosajiliwa',
//                               pages : Math.ceil( numRows / per_page)
//                 }
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
=======
            res.render(
              path.join(__dirname + "/public/design/reports/ripotizilizosajiliwa"),
              {
                req: req,
                objtotal: objtotal,
                list: objlist,
                // useLev: req.session.UserLevel,
                // userName: req.session.userName,
                // RoleManage: req.session.RoleManage,
                // userID: req.session.userID,
                // cheoName: req.session.cheoName,
                pagination : {
                              total : numRows , 
                              current : page , 
                              per_page : per_page , 
                              url : 'RipotiZilizosajiliwa',
                              pages : Math.ceil( numRows / per_page)
                }
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});
>>>>>>> 220dba3ac34ae8f3571ff12e3cc19acc0c7cdc46

app.get("/SajiliwaZilizokataliwa", function (req, res) {
  var obj = [];
  var objlist = [];
  var objtotal = [];
  var today = new Date();
  var per_page =  Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  // today = dateFormat.format(today, "dd/mm/yyyy")
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: sajiliShuleJumlaKatAPI+`?page=${page}&per_page=${per_page}`,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to RipotiZilizosajiliwa " + error);
          res.send("failed");
        }
        console.log(body);
        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          var numRows = jsonData.numRows;

          for (var i = 0; i < data.length; i++) {
            var kaunti = data[i].kaunti;
            var category = data[i].category;
            objtotal.push({ kaunti: kaunti, category: category });
          }
          var list = jsonData.list;
          for (var i = 0; i < list.length; i++) {
            var school_name = list[i].school_name;
            var category = list[i].category;
            var approved_at = list[i].approved_at;
            var LgaName = list[i].LgaName;
            var RegionName = list[i].RegionName;
            var tracking_number = list[i].tracking_number;
            var dateDisplay = list[i].dateDisplay;
            var WardName = list[i].WardName;
            var reg_no = list[i].reg_no;
            var subcategory = list[i].subcategory;
            var gender_type = list[i].gender_type;
            var school_phone = list[i].school_phone;
            var po_box = list[i].po_box;
            var level = list[i].level;
            var owner_name = list[i].owner_name;
            var todaydate = list[i].todaydate;
            var school_email = list[i].school_email;
            var stream = list[i].stream;
            var language = list[i].language;
            objlist.push({
              school_name: school_name,
              category: category,
              subcategory: subcategory,
              level: level,
              po_box: po_box,
              language: language,
              approved_at: approved_at,
              LgaName: LgaName,
              RegionName: RegionName,
              gender_type: gender_type,
              school_phone: school_phone,
              tracking_number: tracking_number,
              dateDisplay: dateDisplay,
              WardName: WardName,
              reg_no: reg_no,
              school_email: school_email,
            });
          }
          if (statusCode == 300) {
            console.log(
              new Date() +
                " " +
                req.session.userName +
                ": /RipotiZilizosajiliwa"
            );
            const workSheet = XLSX.utils.json_to_sheet(objlist);
            const workBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
            XLSX.writeFile(workBook, "sample.xlsx");
            // Saving the pdf file in root directory.

            res.render(
              path.join(__dirname + "/public/design/reports/ripotizilizosajiliwa"),
              {
                req: req,
                objtotal: objtotal,
                list: objlist,
                // useLev: req.session.UserLevel,
                // userName: req.session.userName,
                // RoleManage: req.session.RoleManage,
                // userID: req.session.userID,
                // cheoName: req.session.cheoName,
                 pagination : {
                              total : numRows , 
                              current : page , 
                              per_page : per_page , 
                              url : 'RipotiZilizosajiliwa',
                              pages : Math.ceil( numRows / per_page)
                }
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/ShuleMikoa", function (req, res) {
  var obj = [];
  var objlist = [];
  var objtotal = [];
  var today = new Date();
  // today = dateFormat.format(today, "dd/mm/yyyy")
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: sajiliShuleJumlaMikoaAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
          Region: req.body.regionname,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to RipotiZilizosajiliwa " + error);
          res.send("failed");
        }
        //  console.log(body)
        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          for (var i = 0; i < data.length; i++) {
            var kaunti = data[i].kaunti;
            var category = data[i].category;
            objtotal.push({ kaunti: kaunti, category: category });
          }
          var list = jsonData.list;
          for (var i = 0; i < list.length; i++) {
            var school_name = list[i].school_name;
            var category = list[i].category;
            var approved_at = list[i].approved_at;
            var LgaName = list[i].LgaName;
            var RegionName = list[i].RegionName;
            var tracking_number = list[i].tracking_number;
            var dateDisplay = list[i].dateDisplay;
            var WardName = list[i].WardName;
            var reg_no = list[i].reg_no;
            var subcategory = list[i].subcategory;
            var gender_type = list[i].gender_type;
            var school_phone = list[i].school_phone;
            var po_box = list[i].po_box;
            var level = list[i].level;
            var owner_name = list[i].owner_name;
            var todaydate = list[i].todaydate;
            var school_email = list[i].school_email;
            var stream = list[i].stream;
            var language = list[i].language;
            objlist.push({
              school_name: school_name,
              category: category,
              subcategory: subcategory,
              level: level,
              po_box: po_box,
              language: language,
              approved_at: approved_at,
              LgaName: LgaName,
              RegionName: RegionName,
              gender_type: gender_type,
              school_phone: school_phone,
              tracking_number: tracking_number,
              dateDisplay: dateDisplay,
              WardName: WardName,
              reg_no: reg_no,
              school_email: school_email,
            });
            // const data = [
            //   { name: 'Diary', code: 'diary_code', author: 'Pagorn' },
            //   { name: 'Note', code: 'note_code', author: 'Pagorn' },
            //   { name: 'Medium', code: 'medium_code', author: 'Pagorn' },
            // ]
          }
          if (statusCode == 300) {
            console.log(
              new Date() +
                " " +
                req.session.userName +
                ": /RipotiZilizosajiliwa"
            );
            // const workSheet = XLSX.utils.json_to_sheet(objlist);
            // const workBook = XLSX.utils.book_new();
            // XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
            // XLSX.writeFile(workBook, "sample.xlsx");
            // Saving the pdf file in root directory.

            res.render(
              path.join(__dirname + "/public/design/ripotizilizosajiliwa"),
              {
                req: req,
                objtotal: objtotal,
                list: objlist,
                useLev: req.session.UserLevel,
                                  userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
                cheoName: req.session.cheoName,
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/RipotiZilizofutiwa", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: maokusajiliShuleJumlaAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message1 = jsonData.message;
          var statusCode1 = jsonData.statusCode;
          var data1 = jsonData.data;
          if (statusCode1 == 300) {
            console.log(
              req.session.office + " jjdjdjd " + req.session.UserLevel
            );
            request(
              {
                url: ripotiFutaShuleHiari,
                method: "POST",
                headers: {
                  Authorization: "Bearer" + " " + req.session.Token,
                  "Content-Type": "application/json",
                },
                json: {
                  browser_used: req.session.browser_used,
                  ip_address: req.session.ip_address,
                  UserLevel: req.session.UserLevel,
                  Office: req.session.office,
                },
              },
              function (error, response, body) {
                if (error) {
                  console.log(
                    new Date() + ": fail to MaombiKuanzishaShuleList " + error
                  );
                  res.send("failed");
                }
                console.log(body);
                if (body !== undefined) {
                  // var jsonData = JSON.parse(body)
                  var jsonData = body;
                  var message = jsonData.message;
                  var statusCode = jsonData.statusCode;
                  var data = jsonData.data;
                  if (statusCode == 300) {
                    for (var i = 0; i < data.length; i++) {
                      var tracking_number = data[i].tracking_number;
                      var user_id = data[i].user_id;
                      var LgaName = data[i].LgaName;
                      var RegionName = data[i].RegionName;
                      var school_name = data[i].school_name;
                      var created_at = data[i].created_at;
                      var remain_days = data[i].remain_days;
                      var schoolId = data[i].schoolId;
                      req.session.TrackingNumber = tracking_number;
                      obj.push({
                        schoolId: schoolId,
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
                      new Date() + " " + req.session.userName + ": /BadiliJina"
                    );
                    res.render(
                      path.join(__dirname + "/public/design/reports/ripoti_futa_shule"),
                      {
                        req: req,
                        total_month: data1,
                        maombi: obj,
                        useLev: req.session.UserLevel,
                        userName: req.session.userName,
                        RoleManage: req.session.RoleManage,
                        userID: req.session.userID,
                        cheoName: req.session.cheoName,
                      }
                    );
                  }
                  if (statusCode == 209) {
                    res.redirect("/");
                  }
                }
              }
            );
          }
          if (statusCode1 == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

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

app.get("/RipotiAnzishaBilaMajengoKataliwa", function (req, res) {
  var obj = [];
  // console.log("jjdjdjd " + req.session.UserLevel)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: anzishaShuleBilaMajKatAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleList " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
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
                __dirname + "/public/design/reports/ripotianzishabilamajengokat"
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
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/RipotiAnzishaMajengo", function (req, res) {
  var obj = [];
  // console.log("jjdjdjd " + req.session.UserLevel)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: anzishaShuleMajAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleList " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
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
              path.join(__dirname + "/public/design/reports/ripotianzishamajengo"),
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
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/RipotiAnzishaMajengoKataliwa", function (req, res) {
  var obj = [];
  // console.log("jjdjdjd " + req.session.UserLevel)
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: anzishaShuleMajKatAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleList " + error
          );
          res.send("failed");
        }

        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          console.log(jsonData);
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
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
              path.join(__dirname + "/public/design/reports/ripotianzishamajengokat"),
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
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.get("/ExcelSajiliwa", function (req, res) {
  res.download("sample.xlsx");
});

app.get("/Barua/:id", function (req, res) {
  var filename = req.params.id;
  res.download(filename + ".pdf");
});

app.get("/Baruameneja/:id", function (req, res) {
  var filename = req.params.id;
  res.download(filename + "meneja.pdf");
});

// app.get("/Viambatisho", function (req, res) {
//   var obj = [];
  
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//           var hasMatch =false;
//           for (var index = 0; index < req.session.RoleManage.length; ++index) {
//               var animal = req.session.RoleManage[index]; 
//               if(animal.permission_id == 51){ 
//               res.render(path.join(__dirname + "/public/design/viambatisho"), {
//                         req: req,
//                         // data: data,
//                         useLev: req.session.UserLevel,
//                         userName: req.session.userName,
//                         RoleManage: req.session.RoleManage,
//                         userID: req.session.userID,
//                         cheoName: req.session.cheoName,
//                         // listWaombaji: listWaombaji,
//                         // objAttachment: objAttachment,
//                       });
//               }
//             }
//   } else {
//     res.redirect("/");
//   }
// });

// app.get("/Malipo", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: malipoAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           if (statusCode == 300) {
//             console.log(new Date() + " " + req.session.userName + ": /Malipo");
//             res.render(path.join(__dirname + "/public/design/malipo"), {
//               req: req,
//               data: data,
//               useLev: req.session.UserLevel,
//                                 userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//               cheoName: req.session.cheoName,
//             });
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


app.get("/Roles", isAuthenticated ,can('view-roles'), function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    var hasMatch =false;
    // for (var index = 0; index < req.session.RoleManage.length; ++index) {
        // var animal = req.session.RoleManage[index]; 
    // if(animal.permission_id == 64){ 
    request(
      {
        url: rolesAPI+`?page=${page}&per_page=${per_page}`,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          useLevel: req.session.UserLevel,
          office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          if (statusCode == 300) {
            var numRows = jsonData.numRows;
            res.render(path.join(__dirname + "/public/design/roles"), {
              req: req,
              data: data,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
              userID: req.session.userID,
              cheoName: req.session.cheoName,
              pagination : {
                    total : numRows , 
                    current : page , 
                    per_page : per_page , 
                    url : 'Roles',
                    pages : Math.ceil( numRows / per_page)
                }
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
    // }
  // }
  } else {
    res.redirect("/");
  }
});

app.post("/SajiliWatumiaji", function (req, res) {
  // console.log(req.body);
  var name = req.body.name;
  var username = req.body.username;
  var phoneNumber = req.body.phone;
  var email = req.body.email;
  var roleId = req.body.status;
  var password = req.body.password;
  var cheo = req.body.cheo;
  var lgas = req.body.lgas;
  var kanda = req.body.kanda;
  var roleRMe = req.body.roleRMe;
  var sign = req.body.selectedFile;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: registerWatumiajiAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          name: name,
          username: username,
          phoneNumber: phoneNumber,
          email: email,
          roleId: roleId,
          password: password,
          cheo: cheo,
          lgas: lgas,
          kanda: kanda,
          sign: sign,
          ip_address: req.session.ip_address,
          roleRMe: roleRMe,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }
        console.log(body);
        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          // if(statusCode == 300){
          console.log(
            new Date() + " " + req.session.userName + ": /SajiliWatumiaji"
          );
          res.send({
            message: message,
            statusCode: statusCode,
            useLev: req.session.UserLevel,
                              userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
            cheoName: req.session.cheoName,
          });
          // }if(statusCode == 209){
          //   res.redirect('/')
          // }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});



// app.post("/UpdateWaombaji", function (req, res) {
//   console.log(req.body);
//   var name = req.body.name;
//   var username = req.body.email;
//   var phoneNumber = req.body.phone;
//   var email = req.body.email;
//   var password = req.body.password;
//   var userId = req.body.userId;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: updateWaombajiAPI,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           name: name,
//           username: username,
//           phoneNumber: phoneNumber,
//           email: email,
//           password: password,
//           userId: userId,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /UpdateWaombaji"
//             );
//             res.send({
//               message: message,
//               statusCode: statusCode,
//               useLev: req.session.UserLevel,
//                                 userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//               cheoName: req.session.cheoName,
//             });
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

// app.post("/FutaWatumiaji", function (req, res) {
//   //console.log(req.body)
//   var name = req.body.name;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: futaWatumiajiAPI,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           name: name,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           if (statusCode == 300) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /SajiliWatumiaji"
//             );
//             res.send({
//               message: message,
//               statusCode: statusCode,
//               useLev: req.session.UserLevel,
//                                 userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//               cheoName: req.session.cheoName,
//             });
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

app.post("/FutaRole", function (req, res) {
  //console.log(req.body)
  var name = req.body.name;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: FutaRoleAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          name: name,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliWatumiaji"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/FutaTahasusi", function (req, res) {
  //console.log(req.body)
  var fileId = req.body.fileId;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: futaTahasusiAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          fileId: fileId,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliWatumiaji"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/FutaMalipo", function (req, res) {
  //console.log(req.body)
  var malipoId = req.body.malipoId;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: futaMalipoAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          malipoId: malipoId,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliWatumiaji"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/FutaKiambatisho", function (req, res) {
  console.log(req.body);
  var kiambatishoId = req.body.kiambatishoId;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: futaKiambatishoAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          kiambatishoId: kiambatishoId,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliWatumiaji"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});



app.get("/AuditTrail", function (req, res) {
  var obj = [];
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    var hasMatch =false;
    for (var index = 0; index < req.session.RoleManage.length; ++index) {
        var animal = req.session.RoleManage[index]; 
    if(animal.permission_id == 64){ 
    request(
      {
        url: auditTrailAPI,
        method: "GET",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(
            new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
          );
          res.send("failed");
        }
        // console.log(body)
        if (body !== undefined) {
          var jsonData = JSON.parse(body);
          // var jsonData = body
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          var vyeo = jsonData.vyeo;
          // var listWaombaji = jsonData.listWaombaji;
          // var objAttachment = jsonData.objAttachment;
          if (statusCode == 300) {
            console.log(new Date() + " " + req.session.userName + ": /Vyeo");
            res.render(path.join(__dirname + "/public/design/audits/audit"), {
              req: req,
              data: data,
              vyeo: vyeo,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
    }
  }
  } else {
    res.redirect("/");
  }
});

// app.get("/Tahasusi", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     var hasMatch =false;
//     for (var index = 0; index < req.session.RoleManage.length; ++index) {
//         var animal = req.session.RoleManage[index]; 
//     if(animal.permission_id == 61){ 
//     request(
//       {
//         url: tahasusiAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           var michepuo = jsonData.michepuo;
//           // var listWaombaji = jsonData.listWaombaji;
//           // var objAttachment = jsonData.objAttachment;
//           if (statusCode == 300) {
//             console.log(new Date() + " " + req.session.userName + ": /Vyeo");
//             res.render(path.join(__dirname + "/public/design/taasusilist"), {
//               req: req,
//               data: data,
//               michepuo: michepuo,
//               useLev: req.session.UserLevel,
//                                 userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//               cheoName: req.session.cheoName,
//             });
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//     }
//   }
//   } else {
//     res.redirect("/");
//   }
// });

// app.get("/Michepuo", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     var hasMatch =false;
//     for (var index = 0; index < req.session.RoleManage.length; ++index) {
//         var animal = req.session.RoleManage[index]; 
//     if(animal.permission_id == 57){ 
//     request(
//       {
//         url: michepuoAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(
//             new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//           );
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           var jsonData = JSON.parse(body);
//           // var jsonData = body
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           var michepuo = jsonData.michepuo;
//           // var listWaombaji = jsonData.listWaombaji;
//           // var objAttachment = jsonData.objAttachment;
//           if (statusCode == 300) {
//             console.log(new Date() + " " + req.session.userName + ": /Vyeo");
//             res.render(path.join(__dirname + "/public/design/tmichepuolist"), {
//               req: req,
//               data: data,
//               michepuo: michepuo,
//               useLev: req.session.UserLevel,
//                                 userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//               cheoName: req.session.cheoName,
//             });
//           }
//           if (statusCode == 209) {
//             res.redirect("/");
//           }
//         }
//       }
//     );
//     }
//   }
//   } else {
//     res.redirect("/");
//   }
// });

app.post("/SajiliCheo", function (req, res) {
  var name = req.body.name;
  var level = req.body.level;
  console.log("url " + req.session.ip_address);
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: registerCheoAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          name: name,
          level: level,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          // if(statusCode == 300){
          console.log(
            new Date() + " " + req.session.userName + ": /SajiliCheo"
          );
          res.send({
            message: message,
            statusCode: statusCode,
            useLev: req.session.UserLevel,
                              userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
            cheoName: req.session.cheoName,
          });
          // }if(statusCode == 209){
          //   res.redirect('/')
          // }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/BadiliCheo", function (req, res) {
  console.log(req.body);
  var name = req.body.name;
  var level = req.body.level;
  var cheoId = req.body.cheoId;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: updateCheoAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          name: name,
          level: level,
          cheoId: cheoId,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliCheo"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
              ip_address: req.session.ip_address,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/FutaCheo", function (req, res) {
  console.log(req.body);
  var cheoId = req.body.cheoId;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: deleteCheoAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          cheoId: cheoId,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliCheo"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/SajiliTahasusi", function (req, res) {
  var name = req.body.name;
  var level = req.body.level;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: registerTahasusiAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          name: name,
          level: level,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliCheo"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/updateTahasusi", function (req, res) {
  console.log("req.body");
  var name = req.body.name;
  var level = req.body.level;
  var fileId = req.body.fileId;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: updateTahasusiAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          name: name,
          level: level,
          fileId: fileId,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }
        console.log(body);
        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliCheo"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/SajiliMchepuo", function (req, res) {
  var name = req.body.name;
  var level = req.body.level;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: registerMchepuoAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          name: name,
          level: level,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }
        console.log(body);
        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliCheo"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/updateMchepuo", function (req, res) {
  var name = req.body.name;
  var mchep_id = req.body.mchep_id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: updateMchepuoAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          name: name,
          mchep_id: mchep_id,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }
        console.log(body);
        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliCheo"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/deleteMchepuo", function (req, res) {
  var mchep_id = req.body.mchep_id;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: futaMchepuoAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          mchep_id: mchep_id,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }
        console.log(body);
        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          if (statusCode == 300) {
            console.log(
              new Date() + " " + req.session.userName + ": /SajiliCheo"
            );
            res.send({
              message: message,
              statusCode: statusCode,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
              cheoName: req.session.cheoName,
            });
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/SajiliAda", function (req, res) {
  var ada = req.body.ada;
  var code = req.body.code;
  var kiasi = req.body.kiasi;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: registerAdaAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          ada: ada,
          code: code,
          kiasi: kiasi,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          // if(statusCode == 300){
          console.log(new Date() + " " + req.session.userName + ": /SajiliAda");
          res.send({
            message: message,
            statusCode: statusCode,
            useLev: req.session.UserLevel,
                              userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
            cheoName: req.session.cheoName,
          });
          // }if(statusCode == 209){
          //   res.redirect('/')
          // }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

app.post("/RecKumbNa", function (req, res) {
  var trackingNo = req.body.trackingNo;
  var na_kumb = req.body.na_kumb;
  if (
    typeof req.session.userName !== "undefined" ||
    req.session.userName === true
  ) {
    request(
      {
        url: registerKumbNaAPI,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          trackingNo: trackingNo,
          na_kumb: na_kumb,
          ip_address: req.session.ip_address,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to TumaComment " + error);
          res.send("failed");
        }

        if (body !== undefined) {
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          // if(statusCode == 300){
          console.log(new Date() + " " + req.session.userName + ": /SajiliAda");
          res.send({
            message: message,
            statusCode: statusCode,
            useLev: req.session.UserLevel,
                              userName: req.session.userName,
              RoleManage: req.session.RoleManage,
    userID: req.session.userID,
            cheoName: req.session.cheoName,
          });
          // }if(statusCode == 209){
          //   res.redirect('/')
          // }
        }
      }
    );
  } else {
    res.redirect("/");
  }
});

// app.post("/EditAda", function (req, res) {
//   var ada = req.body.ada;
//   var code = req.body.code;
//   var kiasi = req.body.kiasi;
//   var fee_id = req.body.fee_id;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: editAdaAPI,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           ada: ada,
//           code: code,
//           kiasi: kiasi,
//           id: fee_id,
//           ip_address: req.session.ip_address,
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to TumaComment " + error);
//           res.send("failed");
//         }

//         if (body !== undefined) {
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           if (statusCode == 300) {
//             console.log(new Date() + " " + req.session.userName + ": /EditAda");
//             res.send({
//               message: message,
//               statusCode: statusCode,
             
//             });
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


// DELETE /api/auth/logout
// app.delete("/logout", (req, res) => {
//   if (req.session) {
//     req.session.destroy((err) => {
//       if (err) {
//         // res.status(400).send('Unable to log out')
//         res.send({ statusCode: 306, message: "Umeshindwa kutoka nje" });
//       } else {
//         res.send({ statusCode: 300, message: "Karibu tena" });
//         // res.redirect('/')
//       }
//     });
//   } else {
//     res.end();
//   }
// });

var port = process.env.PORT || 8087;
var url = process.env.APP_URL || "http://localhost";

app.use("/", dashboardController);
// Maombi
app.use("/" , anzishaShuleRequestController)
app.use("/" , umilikinaumenejaRequestController)
app.use("/" , kusajiliBinafsiRequestController)
app.use("/" , kusajiliSerikaliRequestController)
app.use("/" , kusajiliCommentController)
app.use("/" , kuongezaMikondoRequestController)
app.use("/" , kubadiliJinaRequestController)
app.use("/" , kuongezaTahasusiRequestController)   //OngezaComment defined in this file
app.use("/" , kuongezaBweniRequestController)
app.use("/" , ongezaDahaliaRequestController)
app.use("/" , kubadiliUsajiliRequestController)
app.use("/" , hamishaRequestController)
app.use("/" , badiliMmilikiRequestController)
app.use("/" , badiliMenejaRequestController)
app.use("/" , futaShuleRequestController)
app.use("/", userController)
app.use("/", regionController)
app.use("/", districtController)
app.use("/", wardController)
app.use("/", streetController)
app.use("/", roleController)
app.use("/", permissionController)
app.use("/", rankController)
app.use("/", hierarchyController)
app.use("/", designationController)
app.use("/", zoneController)
app.use("/", attachmentTypeController)
app.use("/", applicationCategoryController)
app.use("/", registrationTypeController)
app.use("/", applicantController)
app.use("/", schoolController)
app.use("/", biasController)
app.use("/", combinationController)
app.use("/", feeController)
app.use("/", algorithmController)
app.use("/", ongezaDahaliaRequestController)
app.use("/", trackApplicationController)
app.use("/", attachmentController);
app.use("/", notificationController)
<<<<<<< HEAD
app.use("/", anzishaShuleBilaMajengoReportController)
app.use("/", usajiliShuleReportController)
=======
// app.use("/", reportRequestController);
>>>>>>> 220dba3ac34ae8f3571ff12e3cc19acc0c7cdc46

app.use("/", errorController);
app.listen(port, () => {
  console.log(`Hello IRS, Client Server is running at ${url}${port ? ':'+port : ''} on ${new Date()} `);
});