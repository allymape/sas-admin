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
const { titleCase, lowerCase, sumAssociativeArray, formatDate, crypt, hasPermission } = require("./util");
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
const auditTrailController = require("./public/controllers/auditTrailController");
const handoverController = require("./public/controllers/handoverController");
const updateSchoolDetailController = require("./public/controllers/updateShoolDetailController");
// const reportRequestController = require("./public/controllers/ripoti/RipotiRequestController");
const handleSessionController = require("./public/controllers/handleSessionController");
const app = express();
app.use(helmet.frameguard())
app.use(cookieParser())
app.use(flash());
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// var session = require("cookie-session");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");


// Create a Redis client
const redisClient = createClient({
  url: 'redis://localhost:6379',
  legacyMode: false, // Enable legacy mode if you're using Redis v4+
});

redisClient.connect(console.log("Redis connected successfully.")).catch(console.error);

app.set("trust proxy", 1);
app.use(
  session({
    secret: "201-S3cr3t@#",
    resave: true,
    saveUninitialized: true,
    httpOnly: true, // dont let browser javascript access cookie ever
    secure: true, // only use cookie over https
    ephemeral: true,
    store: new RedisStore({ client: redisClient }),
    // cookie: {
    //   secure: true,
    //   maxAge: 20 * 60 * 1000,
    // },
  })
);
const useragent = require("useragent");

function clientInfoMiddleware(req, res, next) {
  // Get IP address
  const ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Get browser info
  const agent = useragent.parse(req.headers["user-agent"]);
  const browserInfo = {
    browser: agent.toAgent(),
    os: agent.os.toString(),
    platform: agent.device.toString(),
  };

  // Attach IP and browser info to req.body
  req.body.clientInfo = {
    ip: ipAddress,
    browserInfo : browserInfo,
  };
  if (req.session && req.session.email) {
    const { email, cheoName, userName, officeName } = req.session;
    const {browser , os , platform} = browserInfo;

    console.log("\n************User Info*******************\n");
    console.log(
      "URL: " + req.hostname+req.url,
      "\nBrowser" + browser,
      "\nOS:" + os,
      "\nPlatform:" + platform,
      "\nIP: " + ipAddress,
      "\nEmail:" + email,
      "\nCheo: " + cheoName,
      "\nUsername: " + userName,
      "\nOfisi: " + officeName
    );
    console.log("\n*************End******************\n");
  };
  next(); // Proceed to the next middleware or route handler
}
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
                if(modifyUrl(currentUrl).toLowerCase().trim() == urls[i].trim().toLowerCase()){
                    return true;
                }
              }
        }
    }
  return false;
};

global.permission = (req , permission_name) => {
       return hasPermission(req,permission_name);
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

app.use(clientInfoMiddleware);
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
app.use("/", updateSchoolDetailController)
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
app.use("/", auditTrailController);
app.use("/", handoverController);
app.use("/", handleSessionController);

app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace for debugging purposes
    // Customize the response based on the type of error or status code
    if (res.headersSent) {
        return next(err);
    }
    // Respond with a generic message
    res.redirect("/404");
});
app.use("/", errorController);
app.listen(port, () => {
  console.log(`Hello IRS, Client Server is running at ${url}${port ? ':'+port : ''} on ${new Date()} `);
});