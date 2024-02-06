var session = require("express-session");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
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
const loginActivityController = require("./public/controllers/loginActivityController");

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

global.dateFormat = (date , format = "DD/MM/YYYY HH:mm:ss") => {
    return formatDate(date , format);
}

global.remainDays =  (fromDate) => {
    var today = new Date();
    var diffInSeconds = Math.abs(today - new Date(fromDate)) / 1000;
    var days = Math.floor(diffInSeconds / 60 / 60 / 24);
    var hours = Math.floor((diffInSeconds / 60 / 60) % 24);
    var minutes = Math.floor((diffInSeconds / 60) % 60);
    var seconds = Math.floor(diffInSeconds % 60);
    var milliseconds = Math.round(
      (diffInSeconds - Math.floor(diffInSeconds)) * 1000
    );
    var remain_days = null;
    if (days > 7) {
      remain_days = dateFormat(fromDate, "DD-MM-YYYY HH:mm:ss");
    } else if (days > 0) {
      remain_days = `Siku ${days} ${days > 1 ? "zilizopita" : "iliyopita"} `;
    } else if (days <= 0 && hours <= 0 && minutes <= 0) {
      remain_days = `Sekunde ${seconds} ${
        seconds > 1 ? "zilizopita" : "iliyopita"
      }`;
    } else if (days <= 0 && hours <= 0) {
      remain_days = `Dakika ${minutes} ${
        minutes > 1 ? "zilizopita" : "iliyopita"
      }`;
    } else if (days <= 0) {
      remain_days = `Saa ${hours} ${hours > 1 ? "zilizopita" : "iliyopita"}`;
    }
    return remain_days;
  }

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
app.use("/", loginActivityController);


app.use("/", errorController);
app.listen(port, () => {
  console.log(`Hello IRS, Client Server is running at ${url}${port ? ':'+port : ''} on ${new Date()} `);
});