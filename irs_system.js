var session = require("express-session");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
const request = require("request");
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
const { titleCase, lowerCase, sumAssociativeArray, formatDate, crypt } = require("./util");
const dashboardController = require("./public/controllers/dashboardController");
const designationController = require("./public/controllers/designationController");
const applicantController = require("./public/controllers/applicantController");
const numeral = require('numeral');
const schoolController = require("./public/controllers/schoolController");
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
const reportKuanzishaRequestController = require("./public/controllers/ripoti/RipotiRequestKuanzishaController");
const reportUsajiliRequestController = require("./public/controllers/ripoti/RipotiRequestUsajiliController");
const reportWamilikiRequestController = require("./public/controllers/ripoti/RipotiRequestWamilikiController");
const reportMenejaRequestController = require("./public/controllers/ripoti/RipotiRequestMenejaController");
const reportMabadilikoRequestController = require("./public/controllers/ripoti/RipotiRequestMabadilikoController");
const maombiBaruaController = require("./public/controllers/barua/maombiBaruaController");
const baruaController = require("./public/controllers/barua/baruaController");
const workflowController = require("./public/controllers/workflowController");

// const reportRequestController = require("./public/controllers/ripoti/RipotiRequestController");

const app = express();
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
global.crypt = () => {
     return crypt();
}
global.routeIs =  (url_segments, currentUrl) => {
  // console.log(currentUrl , url_segments)
    if(url_segments){
        var urls = url_segments.split("|");
        if (Array.isArray(urls) && urls.length > 0) {
              for(var i=0; i< urls.length; i++){
                // console.log('cehkakdka ',currentUrl , currentUrl.replace(/^\/+/, '') , urls[i].trim()))
                // console.log(modifyUrl(currentUrl.) === urls[i].trim())
                // console.log(modifyUrl(currentUrl).toLowerCase().trim() , "xxxxx" , urls[i].toLowerCase())
                if(modifyUrl(currentUrl).toLowerCase().trim() == urls[i].trim().toLowerCase()){
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
    if(url.length > 0 && !JSON.stringify(url).includes('.')){
      // console.log(url.length  , currentUrl , url[0]) 
     if(url.length == 1){
        return url[0];
     }
    if(url.length == 2){
        return url[0]+"/*";
     }
     if(url.length == 3){
        return url[0]+"/*"+url[2];
     }
     if(url.length == 4){
        return url[0]+`/${url[1]}/*/`+url[3];
     }
     return currentUrl;
    }
    return '';
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

// var updateHatiAPI = BASEURL + "edit-attachment";
var pandishaHatiAPI = BASEURL + "upload-attachment";
var verify = BASEURL + "verify";
var changepassAPI = BASEURL + "changepass";



// app.get("/PasswordReset", function (req, res) {
//   res.render(path.join(__dirname + "/public/design/password_reset"));
// });

// app.post("/WekaNywira", function (req, res) {
//   var email = req.body.email;
//   request(
//     {
//       url: passResAPI,
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
//             ": fail to reset password " +
//             error
//         );
//         res.send("failed");
//       }
//       if (body !== undefined) {
//         // console.log(body)
//         var message = body.message;
//         var statusCode = body.statusCode;
//         if (statusCode == 302) {
//           res.render(path.join(__dirname + "/public/design/login"), {
//             req: req,
//             message: message,
//           });
//         } else if (statusCode == 300) {
//           // console.log("2FA: " + req.session.twofa);
//           console.info(
//             new Date() +
//               ": " +
//               email +
//               " with IP: " +
//               requestIp.getClientIp(req) +
//               ": reset password successful"
//           );

//           res.render(path.join(__dirname + "/public/design/badili_nywira"), {
//             req: req,
//             email: email,
//           });
//         }
//         else {
//           res.redirect("/");
//         }
//       }
//     }
//   );
// });

// app.post("/BadiliNywira", function (req, res) {
//   console.log(req.body);
//   var email = req.body.email;
//   var msimbo = req.body.msimbo;
//   var password = req.body.password;
//   request(
//     {
//       url: thibitishapassAPI,
//       method: "POST",
//       json: {
//         browser_used: req.session.browser_used,
//         ip_address: req.session.ip_address,
//         email: email,
//         password: password,
//         msimbo: msimbo,
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
//             " fail to access  /BadiliNywira Endpoint" +
//             error
//         );
//         // res.send("failed");
//       }
//       if (body !== undefined) {
//         // console.log(body)
//         var message = body.message;
//         var statusCode = body.statusCode;
//         if (statusCode == 302) {
//           res.render(path.join(__dirname + "/public/design/login"), {
//             req: req,
//             message: message,
//           });
//         } else if (statusCode == 300) {
//           // console.log("2FA: " + req.session.twofa);
//           console.info(
//             new Date() +
//               ": " +
//               email +
//               " with IP: " +
//               requestIp.getClientIp(req) +
//               " Successful to change password"
//           );
//           req.flash("error", message);
//           res.render(path.join(__dirname + "/public/design/login"), {
//             req: req,
//             message: message,
//           });
//         }
//         else {
//           res.redirect("/");
//         }
//       }
//     }
//   );
// });

// app.post("/BadiliPass", function (req, res) {
//   console.log(req.body);
//   var userid = req.body.userid;
//   var oldpassword = req.body.oldpassword;
//   var password = req.body.password;
//   request(
//     {
//       url: changepassAPI,
//       method: "POST",
//       headers: {
//         Authorization: "Bearer" + " " + req.session.Token,
//         "Content-Type": "application/json",
//       },
//       json: {
//         browser_used: req.session.browser_used,
//         ip_address: req.session.ip_address,
//         userid: userid,
//         password: password,
//         oldpassword: oldpassword,
//       },
//     },
//     function (error, response, body) {
//       if (error) {
//         console.error(
//           new Date() +
//             ": " +
//             " with IP: " +
//             requestIp.getClientIp(req) +
//             " fail to access  /BadiliPass Endpoint" +
//             error
//         );
//         res.send("failed");
//       }
//       if (body !== undefined) {
//         console.log(body)
// res.send(body)
//       }
//     }
//   );
// });

// app.post("/Wezesha2FA", function (req, res) {
//   var faValue = req.body.faValue;
//   request(
//     {
//       url: wezeshaAPI,
//       method: "POST",
//       headers: {
//         Authorization: "Bearer" + " " + req.session.Token,
//         "Content-Type": "application/json",
//       },
//       json: {
//         browser_used: req.session.browser_used,
//         ip_address: req.session.ip_address,
//         faValue: faValue,
//       },
//     },
//     function (error, response, body) {
//       if (error) {
//         console.error(new Date() + ": fail to access /Wezesha2FA " + error);
//         res.send("failed");
//       }
//       if (body !== undefined) {
//         console.log(body);
//         var message = body.message;
//         var statusCode = body.statusCode;
//         if (statusCode == 300) {
//           // console.log("uewrurure " + req.session.userID)
//           console.info(
//             new Date() + ": " + req.session.userName + "Successful 2FA"
//           );
//           res.send({ message: message });
//         }
//         else {
//           res.redirect("/");
//         }
//       }
//     }
//   );
// });

// app.post("/Thibitisha2FA", function (req, res) {
//   console.log(req.body);
//   var faValue = req.body.faValue;
//   request(
//     {
//       url: thibitishaAPI,
//       method: "POST",
//       headers: {
//         Authorization: "Bearer" + " " + req.session.Token,
//         "Content-Type": "application/json",
//       },
//       json: {
//         browser_used: req.session.browser_used,
//         ip_address: req.session.ip_address,
//         faValue: faValue,
//       },
//     },
//     function (error, response, body) {
//       if (error) {
//         console.error(new Date() + ": fail to access /Thibitisha2FA " + error);
//         res.send("failed");
//       }
//       if (body !== undefined) {
//         console.log(body);
//         var message = body.message;
//         var statusCode = body.statusCode;
//         if (statusCode == 300) {
//           // console.log("uewrurure " + req.session.userID)
//           console.info(new Date() + ": Successful /Thibitisha2FA");
//           res.send({ message: message, statusCode: statusCode });
//         }
//         else {
//           res.redirect("/");
//         }
//       }
//     }
//   );
// });

// app.post("/ScanTrackNo", function (req, res) {
//   console.log(req.body);
//   var trackingNo = req.body.trackno;
//   request(
//     {
//       url: scanAPI,
//       method: "POST",
//       headers: {
//         Authorization: "Bearer" + " " + req.session.Token,
//         "Content-Type": "application/json",
//       },
//       json: {
//         browser_used: req.session.browser_used,
//         ip_address: req.session.ip_address,
//         trackingNo: trackingNo,
//       },
//     },
//     function (error, response, body) {
//       if (error) {
//         console.error(
//           new Date() + ": " + trackno + " fail to access /ScanTrackNo " + error
//         );
//         res.send("failed");
//       }
//       if (body !== undefined) {
//         console.log(body);
//         var message = body.message;
//         var jina = body.jina;
//         var statusCode = body.statusCode;
//         var finalText = message + " - " + jina;
//         if (statusCode == 300) {
//           // console.log("uewrurure " + req.session.userID)
//           console.info(
//             new Date() + trackingNo + ": Successful /ScanTrackNo Scanned"
//           );
//           res.send({ message: finalText });
//         }
//         else {
//           res.redirect("/");
//         }
//       }
//     }
//   );
// });

// app.post("/SimulatePayment", function (req, res) {
//   var trackingNo = req.body.trackno;
//   request(
//     {
//       url: simulateAPI,
//       method: "POST",
//       headers: {
//         Authorization: "Bearer" + " " + req.session.Token,
//         "Content-Type": "application/json",
//       },
//       json: {
//         browser_used: req.session.browser_used,
//         ip_address: req.session.ip_address,
//         trackingNo: trackingNo,
//       },
//     },
//     function (error, response, body) {
//       if (error) {
//         console.error(new Date() + ": fail to login " + error);
//         res.send("failed");
//       }
//       if (body !== undefined) {
//         console.log(body);
//         var message = body.message;
//         var statusCode = body.statusCode;
//         if (statusCode == 300) {
//           // console.log("uewrurure " + req.session.userID)
//           console.info(new Date() + trackingNo + ": Successful Scanned");
//           res.send({ message: message });
//         }
//         if (statusCode == 209) {
//           res.redirect("/");
//         }
//       }
//     }
//   );
// });

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


// app.get("/Kata", function (req, res) {
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//         var hasMatch = false;
//         for (var index = 0; index < req.session.RoleManage.length; ++index) {
//           var animal = req.session.RoleManage[index];
//           if (animal.permission_id == 53) {
//             res.render(path.join(__dirname + "/public/design/wards"), {
//                     req: req,
//                     useLev: req.session.UserLevel,
//                     userName: req.session.userName,
//                     RoleManage: req.session.RoleManage,
//                     userID: req.session.userID,
//                     cheoName: req.session.cheoName,
//             });
//           }
//         }
//       } else {
//         res.redirect("/");
//       }
// });


// app.get("/verify/:id", function (req, res) {
//   var TrackingNumber = req.params.id;
//   request(
//     {
//       url: verify,
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       json: {
//         browser_used: req.session.browser_used,
//         ip_address: req.session.ip_address,
//         TrackingNumber: TrackingNumber,
//       },
//     },
//     function (error, response, body) {
//       if (error) {
//         console.log(
//           new Date() + ": fail to MaombiKuanzishaShuleJumla " + error
//         );
//         res.send("failed");
//       }
//       if (body !== undefined) {
//         var jsonData = body;
//         console.log(jsonData);
//         var message = jsonData.message;
//         var statusCode = jsonData.statusCode;
//         console.log(
//           new Date() + " " + req.session.userName + ": /Thibitisha acount"
//         );
//         res.render(path.join(__dirname + "/public/design/thibitisha_acount"), {
//           req: req,
//           statusCode: statusCode,
//           message: message,
//         });
//       }
//     }
//   );
// });

// app.get("/ActiveMenu", function (req, res) {
 
//   // if(req.session.userName){
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     const date = new Date().getHours();
//     var majira;
//     if (date < 12) {
//       majira = "Habari za Asubuhi";
//     } else if (date < 18) {
//       majira = "Habari za Mchana";
//     } else if (date > 18) {
//       majira = "Habari za Jioni";
//     }
//     //  console.log(req.session.Token)
//     request(
//       {
//         url: activeMenuAPI,
//         method: "GET",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//       },
//       function (error, response, body) {
//         if (error) {
//           console.log(new Date() + ": fail to activeUserAPI " + error);
//           res.send("failed");
//         }
//         // console.log(body)
//         if (body !== undefined) {
//           // console.log(body);
//           var jsonData = JSON.parse(body);
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           var data = jsonData.data;
//           var count = jsonData.count;
//           var kauntikuanza = jsonData.kauntikuanza;
//           // var kauntimajengo = jsonData.kauntimajengo;
//           // var kauntimmiliki = jsonData.kauntimmiliki;
//           // var kauntibadilijina = jsonData.kauntibadilijina;
//           // var kauntibweni = jsonData.kauntibweni;
//           // var kauntidahalia = jsonData.kauntidahalia;
//           // var kauntiainausajili = jsonData.kauntiainausajili;
//           if (statusCode == 300) {
//             // console.log("2FA: " + req.session.twofa);
//             // console.log(new Date() + ": Successful dashbord");
//             res.send({
//               salamu: majira,
//               name: data,
//               count: count,
//               useLev: req.session.UserLevel,
//                                 userName: req.session.userName,
//               RoleManage: req.session.RoleManage,
//     userID: req.session.userID,
//               cheoName: req.session.cheoName,
//               kauntikuanza: kauntikuanza,
//               TwoFA: req.session.twofa,
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



// app.post("/UserProfile", function (req, res) {
//   console.log(req.body);
//   // var zonecode = req.body.zonecode;
//   // var zonename = req.body.zonename;
//   // request({
//   //   url: sajiliZoniAPI,
//   //   method: 'POST',
//   //   headers: {
//   //     'Authorization': 'Bearer' + " " + req.session.Token,
//   //     'Content-Type': 'application/json',
//   //   },
//   //   json: {"browser_used": req.session.browser_used, "ip_address": req.session.ip_address, zonecode: zonecode, zonename: zonename}
//   // }, function(error, response, body){
//   //   if(error) {
//   //     console.log(new Date() + ": fail to login " + error)
//   //     res.send("failed")
//   //   }
//   //  // console.log(body)
//   //   if (body !== undefined) {
//   //     console.log(body)
//   //     res.send({"status": "success"})
//   //     // var message = body.message;
//   //     // var userID = body.id;
//   //     // var token = body.token;
//   //     // var resultcode = body.statusCode;
//   //     // req.session.Token = token;
//   //     // // var refreshToken = body.refreshToken;

//   //   }
//   // });
// });

// app.post("/TumaAttachment", function (req, res) {
//   // console.log(req.body)
//   var keyString = req.body.keyString;
//   var trackerId = req.body.trackerId;
//   var attachment = req.body.attachment;
//   var kiambatisho = req.body.kiambatisho;
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     request(
//       {
//         url: pandishaHatiAPI,
//         method: "POST",
//         headers: {
//           Authorization: "Bearer" + " " + req.session.Token,
//           "Content-Type": "application/json",
//         },
//         json: {
//           browser_used: req.session.browser_used,
//           ip_address: req.session.ip_address,
//           keyString: keyString,
//           trackerId: trackerId,
//           attachment: attachment,
//           kiambatisho: kiambatisho,
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
//           var jsonData = body;
//           var message = jsonData.message;
//           var statusCode = jsonData.statusCode;
//           if (statusCode == 300) {
//             res.send("Imepakiwa kikamilifu");
//           }
//           if (statusCode == 302) {
//             console.log(
//               new Date() + " " + req.session.userName + ": /TumaAttachment"
//             );
//             res.send("Haijafanikiwa tafadhali jaribu tena");
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









// app.get("/AuditTrail", function (req, res) {
//   var obj = [];
//   if (
//     typeof req.session.userName !== "undefined" ||
//     req.session.userName === true
//   ) {
//     var hasMatch =false;
//     for (var index = 0; index < req.session.RoleManage.length; ++index) {
//         var animal = req.session.RoleManage[index]; 
//     if(animal.permission_id == 64){ 
//     request(
//       {
//         url: auditTrailAPI,
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
//           var vyeo = jsonData.vyeo;
//           // var listWaombaji = jsonData.listWaombaji;
//           // var objAttachment = jsonData.objAttachment;
//           if (statusCode == 300) {
//             console.log(new Date() + " " + req.session.userName + ": /Vyeo");
//             res.render(path.join(__dirname + "/public/design/audits/audit"), {
//               req: req,
//               data: data,
//               vyeo: vyeo,
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
app.use("/", workflowController);
app.use("/", ongezaDahaliaRequestController)
app.use("/", trackApplicationController)
app.use("/", attachmentController);
app.use("/", notificationController)
app.use("/", reportKuanzishaRequestController);
app.use("/", reportUsajiliRequestController);
app.use("/", reportWamilikiRequestController);
app.use("/", reportMenejaRequestController);
app.use("/", reportMabadilikoRequestController);
app.use("/", maombiBaruaController);
app.use("/", baruaController);


app.use("/", errorController);
app.listen(port, () => {
  console.log(`Hello IRS, Client Server is running at ${url}${port ? ':'+port : ''} on ${new Date()} `);
});