require("dotenv").config();
const request = require("request");
const jwt = require("jsonwebtoken");
const dateAndTime = require("date-and-time");
const {
  titleCase, lowerCase,
} = require("text-case");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const doc = new PDFDocument();
const  json2xls = require("json2xls");

module.exports = {
  sendRequest: (req, res, url, method, formData, callback) => {
    if (
      typeof req.session.userName !== "undefined" ||
      req.session.userName === true
    ) {
      request(
        {
          url: url,
          method: method,
          headers: {
            Authorization: "Bearer" + " " + req.session.Token,
            "Content-Type": "application/json",
          },
          json: formData,
        },
        (error, response, body) => {
          // console.log(body);
          if (error) {
            console.log("error", error);
          }
          //  console.log(body)
          if (body == "Too many requests, please try again later.") {
            req.flash(
              "warning",
              "Too many requests, please try again after 10 minutes."
            );
            res.redirect("/");
          } else if (body !== undefined && response.statusCode == 200) {
            callback(body);
          } else {
            if (
              response &&
              typeof response !== "undefined" &&
              response.statusCode == 403
            ) {
              res.status(response.statusCode).redirect("/403");
            } else {
              console.log(body, response);
            }
          }
        }
      );
    } else {
      req.flash("error", "Your session has expired, Tafadhali ingia tena.");
      res.redirect("/");
    }
  },
  // Check user permission
  can: (permission) => {
    // return a middleware
    return (req, res, next) => {
      const { user } = req;
      if (user && user.userPermissions.includes(permission)) {
        next(); // role is allowed, so continue on the next middleware
      } else {
        // console.log(permission, req);
        res.redirect("/403"); // user is forbidden
      }
    };
  },

  isAuthenticated: (req, res, next) => {
    const authorization = "Bearer" + " " + req.session.Token;
    // req.session.previousUrl = req.originalUrl;
    if (authorization) {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      //  console.log(token);
      jwt.verify(
        token,
        process.env.JWT_SECRET || "the-super-strong-secrect",
        (err, decode) => {
          if (err) {
            res.redirect("/");
          } else {
            req.user = decode;
            next();
          }
        }
      );
    } else {
      res.redirect("/");
    }
  },

  redirectIfAuthenticated: (req, res, next) => {
    if (req.session.userName) {
      // let  previousUrl = req.session.previousUrl
      // res.redirect(previousUrl ? previousUrl : '/Dashboard');
      res.redirect("/Dashboard");
    }
    next();
  },
  titleCase: (text) => {
    //Title Case
    return titleCase(text);
  },
  lowerCase: (text) => {
    //Title Case
    return lowerCase(text);
  },

  sumAssociativeArray: (array) => {
    const sum = Object.values(array).reduce(
      (accumulator, item) => accumulator + item.total,
      0
    );
    return sum;
  },

  arraySum: (array) => {
    let sum = 0;
    if (array.length > 0) {
      sum = array.reduce((sum, number) => sum + number);
    }
    return sum;
  },
  greating: (name) => {
    const date = new Date().getHours();
    var majira = "";
    if (date >= 5 && date < 12) {
      majira = "Habari ya Asubuhi";
    } else if (date >= 12 && date < 16) {
      majira = "Habari ya Mchana";
    } else if (date >= 16) {
      majira = "Habari ya Jioni";
    } else {
      majira = "Habari";
    }
    return majira + ", " + name + "!";
  },
  formatDate: (date, format = "YYYY-MM-DD HH:mm:ss") => {
    return dateAndTime.format(
      typeof date === "string" ? new Date(date) : date,
      format
    );
  },
  createLetter: (
    tracking_number,
    todaydate,
    mwombajiAddress,
    finalFileNumber,
    fullname,
    title,
    body,
    signature,
    copies,
    LgaName,
    RegionName
  ) => {
    if (fs.existsSync(tracking_number + ".pdf")) {
      console.log(
        `A letter with a tracking number ${tracking_number} already exist.`
      );
    } else {
      console.log(`Generate a letter tracking number ${tracking_number}`);

      doc.pipe(fs.createWriteStream(tracking_number + ".pdf"));
      // Adding functionality
      doc
        .fontSize(12)
        .font("Times-Bold")
        .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);
      doc.text("WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA", 210, 35, 100, 100);
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
      doc.fontSize(10).font("Times-Roman").text(todaydate, 450, 140, 50, 50);

      doc.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);
      doc.text("Simu: 026 296 35 33,", 100, 90, 50, 50);
      doc.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

      doc.fillColor("blue").text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50).link(100, 100, 160, 27, "https://www.moe.go.tz/");

      doc.fontSize(10).fillColor("black").text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

      doc.font("Times-Bold").text("Kumb. Na. " + finalFileNumber, 100, 150, 50, 50);
      doc.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);
      doc.text(mwombajiAddress + ",", 100, 180, 50, 50);

      doc.font("Times-Bold").text(LgaName + " - " + RegionName, 100, 190, 50, 50);
      doc.text(title, 210, 220, 50, 50);
      // doc
      //   .font("Times-Roman")
      //   .text("Tafadhali rejea somo la barua hii.", 100, 240, 50, 50);

      doc.font(`Times-Roman`).text(body, 100, 260, 50, 50);
      // doc.text("Ninafurahi kukufahamisha kuwa Kamishna wa Elimu amemthibitisha  " +owner_name.toUpperCase() +" kumiliki " +schoolCategory.toUpperCase() +" " +
      //     school_name.toUpperCase() +
      //     ".",
      //   100,
      //   260,
      //   50,
      //   50
      // );

      // doc.text(
      //   "Uthibitisho huu umetolewa tarehe " +
      //     created_at +
      //     " kwa mujibu wa Sheria ya Elimu, Sura 353. Utamiliki shule hii kwa kuzingatia Sheria na Miongozo ya Wizara ya Elimu, Sayansi na Teknolojia. Unaagizwa kukamilisha miundombinu yote muhimu ya shule kabla ya kujaza fomu Namba RS 8..",
      //   100,
      //   290,
      //   50,
      //   50
      // );

      // doc.text("Nakutakia utekelezaji mwema.", 100, 400, 50, 50);

      // doc.image('arm.png',280, 430, 50, 50);

      // doc.text("KAMISHNA WA ELIMU", 280, 520, 50, 50);
      // doc.font("Times-Bold").text("KAMISHNA WA ELIMU", 250, 540, 50, 50);
      // doc.text("Nakala:", 100, 580, 50, 50);
      // doc.font("Times-Roman").text("Katibu Mkuu,", 100, 600, 50, 50);

      // doc.text("OR – TAMISEMI,", 100, 610, 50, 50);
      // doc.text("S.L.P.1923,", 100, 620, 50, 50);
      // doc.font("Times-Bold").text("DODOMA.", 100, 630, 50, 50);

      // doc.font("Times-Roman").text("Katibu Mtendaji,", 100, 650, 50, 50);
      // doc.text("Baraza la Mitihani Tanzania,", 100, 660, 50, 50);
      // doc.text("S.L.P.2624,", 100, 670, 50, 50);
      // doc.font("Times-Bold").text("DAR ES SALAAM.", 100, 680, 50, 50);

      // doc.addPage().font("Times-Roman").text("Mthibiti Mkuu Ubora wa Shule,", 100, 50, 50, 50);
      // doc.text("Kanda ya Mashariki,", 100, 60, 50, 50);
      // doc.text("S.L.P.2419,", 100, 70, 50, 50);
      // doc.font("Times-Bold").text(RegionName + ".", 100, 80, 50, 50);

      // doc.font("Times-Roman").text("Afisa Elimu Mkoa,", 100, 100, 50, 50);
      // doc.text("Mkoa wa " + RegionName + ",", 100, 110, 50, 50);

      // doc.text("S.L.P.315,", 100, 120, 50, 50);
      // doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);

      // doc.font("Times-Roman").text("Afisa Elimu " + schoolCategory + ",", 100, 150, 50, 50);
      // doc.text(LgaName + ",", 100, 160, 50, 50);
      // doc.text("S.L.P.384,", 100, 170, 50, 50);
      // doc.font("Times-Bold").text(RegionName + ".", 100, 180, 50, 50);

      // doc.font("Times-Bold").text(RegionName + ".", 100, 130, 50, 50);
      // doc.font("Times-Roman").text("Mthibiti Mkuu Ubora wa Shule,", 100, 200, 50, 50);
      // doc.text(LgaName + ",", 100, 160, 50, 50);
      // doc.text("S.L.P.384,", 100, 210, 50, 50);
      // doc.font("Times-Bold").text(RegionName + ".", 100, 220, 50, 50);

      // Finalize PDF file
      doc.end();
    }
  },
  exportJSONToExcel : (res , jsonData , report_name = '') => {
    const xls = json2xls(jsonData);
    // fs.writeFileSync('data.xlsx' , xls , 'binary')
    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename="+report_name ? report_name+"_report.xlsx" : "report.xlsx");
    // Send the Excel file as a binary stream
    res.send(Buffer.from(xls, "binary"));
  }
};
