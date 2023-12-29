require("dotenv").config();
const request = require("request");
const jwt = require("jsonwebtoken");
const dateAndTime = require("date-and-time");
const {
  titleCase, lowerCase,
} = require("text-case");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const  json2xls = require("json2xls");
const Cryptr = require("cryptr");
const cheerio = require("cheerio");
const  path = require("path");
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
  crypt: () => {
    const cryptr = new Cryptr("ReALLY#299992%Secret#@901838Key");
    return cryptr;
  },
  // createLetter: (
  //   tracking_number,
  //   todaydate,
  //   mwombajiAddress,
  //   finalFileNumber,
  //   fullname,
  //   title,
  //   body,
  //   signature,
  //   copies,
  //   LgaName,
  //   RegionName
  // ) => {
  //   if (fs.existsSync(tracking_number + ".pdf")) {
  //     console.log(
  //       `A letter with a tracking number ${tracking_number} already exist.`
  //     );
  //   } else {
  //     console.log(`Generate a letter tracking number ${tracking_number}`);

  //     doc.pipe(fs.createWriteStream(tracking_number + ".pdf"));
  //     // Adding functionality
  //     doc
  //       .fontSize(12)
  //       .font("Times-Bold")
  //       .text("JAMHURI YA MUUNGANO WA TANZANIA", 220, 20, 100, 100);
  //     doc.text("WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA", 210, 35, 100, 100);
  //     // Adding an image in the pdf.
  //     //doc.image("arm.png", 280, 50, 50, 50);
  //     doc
  //       .fontSize(10)
  //       .font("Times-Roman")
  //       .text("Mji wa Serikali,", 450, 80, 50, 50);
  //     doc.text("Mtumba,", 450, 90, 50, 50);
  //     doc.text("Mtaa wa Afya,", 450, 100, 50, 50);
  //     doc.text("S. L. P. 10,", 450, 110, 50, 50);
  //     doc.font("Times-Bold").text("40479 DODOMA.", 450, 120, 50, 50);
  //     doc.fontSize(10).font("Times-Roman").text(todaydate, 450, 140, 50, 50);

  //     doc.text("Anuani ya simu “ELIMU”,", 100, 80, 50, 50);
  //     doc.text("Simu: 026 296 35 33,", 100, 90, 50, 50);
  //     doc.text("Baruapepe: info@moe.go.tz,", 100, 100, 50, 50);

  //     doc.fillColor("blue").text("Tovuti: www.moe.go.tz,", 100, 110, 50, 50).link(100, 100, 160, 27, "https://www.moe.go.tz/");

  //     doc.fontSize(10).fillColor("black").text("Upatapo tafadhali jibu kwa:", 100, 130, 50, 50);

  //     doc.font("Times-Bold").text("Kumb. Na. " + finalFileNumber, 100, 150, 50, 50);
  //     doc.font("Times-Roman").text(fullname + ",", 100, 170, 170, 50);
  //     doc.text(mwombajiAddress + ",", 100, 180, 50, 50);

  //     doc.font("Times-Bold").text(LgaName + " - " + RegionName, 100, 190, 50, 50);
  //     doc.text(title, 210, 220, 50, 50);
  //     doc.font(`Times-Roman`).text(body, 100, 260, 50, 50);
  //     doc.end();
  //   }
  // },
  exportJSONToExcel: (res, jsonData, report_name = "") => {
    const xls = json2xls(jsonData);
    // fs.writeFileSync('data.xlsx' , xls , 'binary')
    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + report_name
        ? report_name + "_report.xlsx"
        : "report.xlsx"
    );
    // Send the Excel file as a binary stream
    res.send(Buffer.from(xls, "binary"));
  },

  generateLetter: (
    req,
    res,
    application_category_id,
    school_name,
    school_type_id,
    school_type,
    reference,
    created_at,
    company,
    box,
    mkoa,
    paragraphs,
    signature,
    signatory,
    cheo
  ) => {
    let doc = new PDFDocument({
      margin: 72,
      size: "A4",
    });
    const imagesPaths = path.join(__dirname + "/public/assets/images");
    const trackingNumber = req.params.id;
    const filename = encodeURIComponent(trackingNumber) + ".pdf";
    // for downloading set the content-dispostion to (download, attachment)
    res.setHeader("Content-disposition", 'inline; filename="' + filename + '"');
    res.setHeader("Content-type", "application/pdf");

    generateHeader(doc, imagesPaths, reference, created_at, company, box, mkoa); // Invoke `generateHeader` function.
    generateTitle(
      doc,
      application_category_id,
      school_type_id,
      school_type,
      school_name
    );
    paragraphs.forEach((paragraph) => generateBody(doc, paragraph));
    generateFooter(doc, signature, signatory, cheo);

    doc.pipe(res);
    doc.end();
  },
};
const getSchoolType = (school_type_id , school_type , school_name) => {
    var name = '';
    if([1,2,3].includes(school_type_id)){
      name = `Shule ya ${school_type} ${school_name} `;
    }else{
      name = `Chuo cha Ualimu ${school_name}`;
    }
    return name;
};
const containsBoldTag = (text) => /<b>(.*?)<\/b>/i.test(text);
const formatParagraph = (text, doc) => {
  //  if <b> tag present render with bold font
    if (containsBoldTag(text)) {
      const $ = cheerio.load(`<body> ${text} </body>`);
      $("body")
        .contents()
        .each((index, element) => {
          if (element.nodeType === 1) {
            doc
              .font("Times-Bold")
              .text(`${$(element).text()}`, {
                lineGap: 4,
                continued: true,
              });
          } else {
            doc.font('Times-Roman').text($(element).text(), { lineGap: 4, continued: true });
          }
        });
    } else {
      // If no tag render normal text
      doc.font("Times-Roman").text(text, { lineGap: 4, continued: true });
    }
}
const generateHeader = (doc, imagesPaths , reference, createdAt, company , box , mkoa) => {
  doc
    .font("Times-Bold")
    .fontSize(14)
    .text("JAMUHURI YA MUUNGANO WA TANZANIA", 30, 30, {
      align: "center",
      characterSpacing: 0.2,
    })
    .text("WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA", {
      align: "center",
      characterSpacing: 0.2,
    })
    .moveDown();

  doc
    .font("Times-Roman")
    .fontSize(12)
    .text(
      `Anuani ya simu "ELIMU"\nSimu: 026 296 35 33 \nBaruapepe: info@moe.go.tz \nTovut: www.moe.go.tz`,
      { lineGap: 2 }
    )
    .text(
      "Mji wa Serikali, Mtumba, \nMtaa wa Afya,\nS. L. P. 10,\n40479 DODOMA.",
      doc.page.width / 2 + 120,
      80,
      { lineGap: 2 }
    );

  doc
    .image(imagesPaths + "/national-logo.png", doc.page.width / 2 - 30, 80, {
      width: 80,
      height: 80,
    })
    .fillColor("#444444");
  doc.moveDown();

  doc.text("Unapojibu tafadhali taja:", 30, 160).moveDown().moveDown();
  doc
    .font("Times-Bold")
    .text(`Kumb. na. ${reference}`, { continued: true })
    .text(createdAt, doc.page.width / 2 - 10, 200)
    .moveDown()
    .moveDown();

// Addressee
  doc
    .font("Times-Roman")
    .text(`${company}, \nS.L.P. ${box}, \n${mkoa}.`)
    .moveDown()
    .moveDown();
}

const generateTitle = (doc , application_category ,school_type_id , school__type , school_name , council) => {
  let title = ``;
  const name = getSchoolType(school_type_id , school__type , school_name);
  switch (application_category) {
    case 1:
      title = `KIBALI CHA KUANZISHA ${name}`;
      break;
    case 2:
      title = `UTHIBITISHO WA MMILIKI WA ${name}`;
      break;
    case 4:
      title = `USAJILI WA ${name} KATIKA HALMASHAURI YA WILAYA YA ${council}`;
      break;
    case 5:
      title = ``
      break;
    case 6:
      title = ``
      break;
    case 7:
      title = ``
      break;
    case 8:
      title = ``
      break;
    case 8:
      title = ``
      break;
    case 9:
      title = ``
      break;
    case 10:
      title = ``
      break;
    case 11:
      title = ``
      break;
    case 12:
      title = ``
      break;
    case 13:
      title = ``
      break;
    case 14:
      title = ``
      break;
    default:
      break;
  }
  doc
    .text("Yah: ", {
      continued: true,
      width: doc.page.width - 100,
      indent: 50,
      lineBreak: true,
    })
    .font("Times-Bold")
    .text(title.toUpperCase().trim(), { underline: true, align: "center" })
    .moveDown();
}
const  generateBody = (doc, body) => {
   formatParagraph(body , doc)
  // doc
  //   .text("       Tafadhali rejea somo la barua hii", { lineGap: 4 })
  //   .moveDown();

  // doc
  //   .text(`2.    Ninafurahi kukufahamisha kuwa thibitisho umetolewa kwa `, {
  //     lineGap: 4,
  //     continued: true,
  //   })
  //   .font("Times-Bold")
  //   .text("Zainabu Aly Mweta ", { lineGap: 4, continued: true })
  //   .font("Times-Roman")
  //   .text("kuwa Meneja wa Shule ya Awali na Msingi ", {
  //     lineGap: 4,
  //     continued: true,
  //   })
  //   .font("Times-Bold")
  //   .text("Diligence.")
  //   .font("Times-Roman")
  //   .moveDown();
  // doc
  //   .text(`3.    Uthibitisho huu umetolewa tarehe `, {
  //     lineGap: 4,
  //     continued: true,
  //   })
  //   .font("Times-Bold")
  //   .text("25/10/12 ", { lineGap: 4, continued: true })
  //   .font("Times-Roman")
  //   .text("kwa mujibu wa ", { lineGap: 4, continued: true })
  //   .font("Times-Bold")
  //   .text("Sheria ya Elimu, Sura 353. ", { lineGap: 4, continued: true })
  //   .font("Times-Roman")
  //   .text("Utaiendesha shule hi kwa kuzingatia ", {
  //     lineGap: 4,
  //     continued: true,
  //   })
  //   .font("Times-Bold")
  //   .text("Sheria, Kanuni, Taratibu na Miongozo ", {
  //     lineGap: 4,
  //     continued: true,
  //   })
  //   .font("Times-Roman")
  //   .text("ya Wizara ya Elimu, Sayansi na Teknolojia. ", {
  //     lineGap: 4,
  //     continued: true,
  //   })
  //   .font("Times-Roman")
  //   .text("Hakikisha shule ina ", { lineGap: 4, continued: true })
  //   .font("Times-Bold")
  //   .text("kasiki", { lineGap: 4, continued: true })
  //   .font("Times-Roman")
  //   .text("kwa ajili ya kuhifadhia nyaraka nyeti.")
  //   .moveDown();
  // doc
  //   .font("Times-Bold")
  //   .text(`4.    Uthibitisho huu siyo kibali cha kusajili wanafunzi.`, {
  //     lineGap: 4,
  //   })
  //   .moveDown();
  // doc
  //   .font("Times-Roman")
  //   .text(`5.    Ninakutakia utekelezaji mwema.`, { lineGap: 4 });
}

const generateFooter = (doc , signature , signatory , cheo) => {
  const lineSize = 174;
  const signatureHeight = doc.page.height - 150;

  const startLine1 = doc.page.width / 2 - 100;
  const endLine1 = doc.page.width / 2 - 100 + lineSize;
  doc
    .moveTo(startLine1, signatureHeight)
    .lineTo(endLine1, signatureHeight)
    .stroke();

  doc
    .font("Times-Roman")
    .fontSize(12)
    .fill("#021c27")
    .text(
      signatory,
      doc.page.width / 2 - 350,
      signatureHeight + 25,
      {
        columns: 1,
        columnGap: 2,
        height: 40,
        width: lineSize,
        align: "center",
      }
    );
  doc
    .font("Times-Bold")
    .fontSize(12)
    .fill("#021c27")
    .text(
      cheo,
      doc.page.width / 2 - 150,
      signatureHeight + 45,
      {
        columns: 1,
        columnGap: 0,
        height: 40,
        width: lineSize + 100,
        align: "center",
        underline: true,
      }
    );
  doc.font("Times-Roman").text("", 20, doc.page.height - 50, {
    lineBreak: false,
  });
}