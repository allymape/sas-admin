require("dotenv").config();
const request = require("request");
const jwt = require("jsonwebtoken");
const dateAndTime = require("date-and-time");
const {
  titleCase, lowerCase,
} = require("text-case");
const fs = require("fs");
const  json2xls = require("json2xls");
const Cryptr = require("cryptr");
const cheerio = require("cheerio");
const  path = require("path");
const PDFDocument = require("./public/controllers/barua/pdfkitTable");
const url  = require("url");

module.exports = {
  modifiedUrl: (req, newParams = { status: req.query.status }) => {
    const currentUrl = req.originalUrl;
    const parseUrl = url.parse(currentUrl, true);
    console.log(parseUrl);
    for (const key in newParams) {
      if (newParams.hasOwnProperty(key)) {
        const value = newParams[key];
        if (value) {
          console.log(`${key} ${value}`);
          parseUrl.query[key] = value;
        }
      }
    }
    if (parseUrl.query.page) {
      delete parseUrl.query.page;
    }
    const newUrl = url.format({
      pathname: parseUrl.pathname.substring(1),
      query: parseUrl.query,
    });
    return newUrl;
  },
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
    title,
    paragraphs,
    signature,
    signatory,
    cheo,
    table,
    registry_type
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
    generateTitle(doc, title);
    paragraphs.forEach((paragraph) => {
      if (paragraph.trim() == "<table/>") {
        if (application_category_id == 4 && registry_type == 3) {
          addTable(doc, table);
        }
      } else {
        generateBody(doc, paragraph);
      }
    });
    generateFooter(doc, signature, signatory, cheo);
    doc.pipe(res);
    doc.end();
  },

  bodyContent: (
    application_category_id,
    registry_type,
    school_name,
    school_type_id,
    school_type,
    approved_date,
    registration_number,
    registration_date,
    type = "", //manager or owner
    owner_name = "",
    manager_name = "",
    region = "",
    council = "",
    subcategory = "",
    stream = "",
    old_stream = "",
    language = ""
  ) => {
    let bodyContent = null;
    const name = getSchoolType(school_type_id, school_type, school_name);
    let title = ``;
    switch (application_category_id) {
      case 1:
        title = `KIBALI CHA KUANZISHA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Ninafurahi kukufahimisha kuwa uthibitisho umetolewa kwa <b>${owner_name}</b>  kuwa Meneja wa Shule ya Awali na Msingi <b>${school_name}</b>\n\n`,
          `3.    Uthibitisho huu umetolewa tarehe <b>${approved_date}</b> kwa mujibu wa <b>Sheria ya Elimu, Sura 353.</b> Utaindesha shule hii kwa kuzingatia <b>Sheria, Kanuni, Taratibu na Miongozo</b> ya Wizara ya Elimu, Sayansi na Teknolojia. Hakikisha shule ina <b>kasiki</b> kwa ajili ya kuhifadhia nyaraka nyeti.\n\n`,
          `4.    Uthibitisho huu siyo kibali cha kusajili Wanafunzi.\n\n\n`,
          `5.   <b>Ninakutakia utekelezaji mwema.</b>`,
        ];

        break;
      case 2:
        title = `UTHIBITISHO WA ${
          type == "mmiliki" ? "MMILIKI" : "MENEJA"
        } WA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Ninafurahi kukufahimisha kuwa uthibitisho umetolewa kwa <b>${
            type == "mmiliki" ? owner_name.replace(/ +(?= )/g,'') : str = manager_name.replace(/ +(?= )/g,'')
          }</b>  kuwa ${
            type == "mmiliki" ? "Mmiliki" : "Meneja"
          } wa <b>${name}</b>\n\n`,
          `3.    Uthibitisho huu umetolewa tarehe <b>${approved_date}</b> kwa mujibu wa <b>Sheria ya Elimu, Sura 353.</b> Utaindesha shule hii kwa kuzingatia <b>Sheria, Kanuni, Taratibu na Miongozo</b> ya Wizara ya Elimu, Sayansi na Teknolojia. Hakikisha shule ina <b>kasiki</b> kwa ajili ya kuhifadhia nyaraka nyeti.\n\n`,
          `4.    Uthibitisho huu siyo kibali cha kusajili Wanafunzi.\n\n\n`,
          `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
        ];
        break;
      case 4:
        title =
          registry_type == 3
            ? `USAJILI WA ${name} KATIKA HALMASHAURI YA WILAYA YA ${council}`
            : `USAJILI WA ${name}`;
        bodyContent =
          registry_type == 3
            ? usajiliSerikali(
                name,
                school_name,
                school_type_id,
                region,
                council
              )
            : usajiliBinafsi(
                name,
                school_name,
                school_type_id,
                registration_date,
                registration_number,
                subcategory,
                stream,
                language
              );
        break;
      case 5:
        title = `KIBALI CHA KUONGEZA MKONDO  ${
          stream - old_stream
        } ILI IWE MIKONDO ${stream} KWA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Napenda kukufahamisha kuwa Wizara imekubali ombi lako la kuongeza Mkondo <b>mmoja (01)</b> katika shule ya Awali na Msingi <b>Sayari</b> ili iwe <b>Mikondo miwili (02)</b>. Kibali kimetolewa tarehe <b>15/09/2023</b>\n\n`,
          `3.    Hata hivyo unatakiwa kuendelea kuboresha miundombinu ya shule ikiwa ni pamoja na kuajiri walimu wenye sifa na kununua vitabu vya kutosha.\n\n`,
          `4.    Mfahamishe Katibu Mtendaji wa Baraza la Mitihani ni lini wanafunzi walioongezeka watafanya upimaji wa darasa la IV na mtihani wa Taifa wa darasa la VII.\n\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;
      case 6:
        title = `Kubadili aina ya usajili`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
        ];
        break;
      case 7:
        title = `Kubadili mmiliki wa shule`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
        ];
        break;
      case 8:
        title = `Kubadili meneja wa shule`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
        ];
        break;
      case 9:
        title = `KIBALI CHA KUBADILI JINA LA SHULE YA SEKONDARI EMBRI’S BOYS   KUWA SHULE YA SEKONDARI EMBRIS`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Wizara ya Elimu, Sayansi na Teknolojia imepokea barua yenye <b>Kumb. Na. HMW/SMJ/EL/EM/41/43</b> ya tarehe <b>20/09/2023</b> kuhusu maombi ya mabadiliko ya jina la Shule ya Sekondari <b>Embri’s Boys</b> kuwa <b>Embris</b>\n\n`,
          `3.    Ninafurahi kukufahamisha kuwa maombi ya mabadiliko ya jina la shule yamekubaliwa. Hivyo, kuanzia tarehe ya barua hii, shule hii itatambulika kwa jina la <b>Embris Sekondari.</b>\n\n`,
          `4.    Unaagizwa kuzijulisha Mamlaka zote za kielimu juu ya mabadiliko ya jina la shule.\n\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;
      case 10:
        title = `Kuhamisha shule`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
        ];
        break;
      case 11:
        title = `Kufuta usajili wa shule`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
        ];
        break;
      case 12:
        title = `KIBALI CHA KUONGEZA  TAHASUSI  ZA  CBG NA HGK, KATIKA SHULE YA SEKONDARI  BWABUKI`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Nafurahi kukujulisha kuwa Wizara imekubali kutoa kibali cha kuanzisha tahasusi za <b>CBG NA HGK</b> mkondo mmoja <b>(01)</b> kwa kila tahasusi kwa Wasichana pekee. Kibali hiki kimetolewa tarehe <b>26/6/2023</b>\n\n`,
          `3.    Hata hivyo, unatakiwa kuendelea kuboresha miundombinu ya shule pamoja na kununua samani na vitabu vya kutosha.\n\n`,
          `4.    Aidha, mfahamishe <b>Katibu Mtendaji Baraza la Mitihani Tanzania</b> ni lini shule itakuwa na <b>Wanafunzi watakaofanya Mtihani wa Taifa kidato cha sita kwa tahasusi husika</b>.\n\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;
      case 13:
        title = `Kuongeza dahalia`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
        ];
        break;
      case 14:
        title = `KIBALI CHA KUTOA HUDUMA YA BWENI KWA SHULE YA SEKONDARI AHMES`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Napenda kukujulisha kuwa maombi yako ya kibali cha kutoa <b>huduma ya bweni</b> katika shule ya Sekondari <b>AHMES</b> yamekubaliwa. \n\n`,
          `3.    Kibali kimetolewa tarehe <b>26/10/2023</b> kulaza wanafunzi <b>288 Wasichana tu</b>. Unaagizwa kuimarisha hali ya usalama wa wanafunzi ndani na nje ya bweni. Kibali hiki kimetolewa kulaza wanafunzi wa <b>Sekondari tu.</b> \n\n`,
          `4.    Aidha, <b>Wathibiti Ubora wa Shule</b> watafuatilia kuhusu uwekaji vifaa vya zimamoto, viashiria moshi, makabati pamoja na sehemu ya kuteketeza taka <b>(Incinerator)</b>. Pia watafuatilia idadi halisi ya wanafunzi wanaolala ndani ya mabweni ili kuepuka <b>msongamano</b> wa wanafunzi.\n\n`,
          `5.    Kibali hiki kimetolewa kwa mujibu wa <b>Sheria ya Elimu, Sura 353</b>. Kwa masharti kuwa utazingatia mwongozo wa Wizara wa kuanzisha na kusajili shule. \n\n\n`,
          `6.    Ninakutakia utekelezaji mwema.`,
        ];
        break;
      default:
        break;
    }
    return { bodyContent, title };
  },
};

const usajiliSerikali = (name , school_name , school_type, region, council) => {
  return [
    `    Tafadhali rejea somo la barua hii.\n\n\n`,
    `2.  Napenda kukujulisha kuwa Wizara imekubali maombi ya Halmashauri ya Wilaya ya <b>${council}</b> ya kusajili <b>${name}</b> itakayomilikiwa na wananchi wa Halmashauri ya Wilaya ya ${council}. kwa kushirikiana na Mkoa wa ${region}\n\n`,
    `3.  Mkoa unaruhusiwa kuchagua wanafunzi wa Kidato cha Kwanza kwa mwaka 2023.  Shule itakuwa ya kutwa, mchanganyiko na yenye mkondo mmoja (01). Shule hii imesajiliwa rasmi tarehe 17/02/2023 na kupewa namba ya usajili kama ifuatavyo:\n\n\n`,
    `<table/>`,
    `4.  Wizara inaiagiza Halmashauri ya Wilaya ya <b>${council}</b> kuendelea kukamilisha ujenzi wa miundombinu yote. Endapo miundombinu haitakamilika, Halmashauri haitaruhusiwa kuandikisha Wanafunzi wa kidato cha kwanza Januari 2024.\n\n`,
    `5.  Mkuu wa Shule atapaswa kuifahamisha Wizara sanduku la barua la shule pindi litakapofunguliwa ili kurahisisha mawasiliano. Aidha, mfahamishe Katibu Mtendaji wa Baraza la Mitihani ni lini shule itakuwa na Wanafunzi watakaofanya Mtihani wa Taifa.\n\n\n`,
    `6.  Kwa mujibu wa Waraka wa Elimu Na. 10 wa mwaka 2011, Usajili wa shule hii utarudiwa baada ya miaka 4.\n\n\n`,
    `7.  Nakutakia utekelezaji mwema.`,
  ];
};
const usajiliBinafsi = (
  name,
  school_name,
  school_type,
  registration_date,
  registration_number,
  subcategory,
  stream,
  language
) => {
  const type = school_type == 4 ? 'Chuo' : 'Shule'
  return [
    `    Tafadhali rejea somo la barua hii.\n\n\n`,
    `2.  Ninafurahi kukujulisha kuwa ${name} imesajiliwa tarehe <b>${registration_date}</b> kwa mujibu wa Sheria ya Elimu, Sura ya 353.\n\n\n`,
    `3.  ${type} ${school_type == 4 ? 'kimipewa' : 'imepewa'} namba ya Usajili <b>${registration_number}</b> kuwa shule ya ${subcategory} na jina <b>${school_name}</b> limeidhinishwa. Shule hii ni ya ${subcategory} na imeidhinishwa kuwa na Mkondo ${stream} inayotumia lugha ya ${language} kufundishia na kujifunzia. \n\n`,
    `4.	 Kufuatana na Sheria ya Elimu, Sura 353, cheti cha Usajili kiwekwe bayana na Uongozi wa Shule uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa Kamati ya Shule inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na Waraka wa Elimu Na. 10 wa mwaka 2011 usajili wa shule hii utarudiwa baada ya miaka 4.\n\n\n`,
    `5.	 Mmiliki wa Shule atatakiwa kuja kuchukua cheti  cha usajili  wa shule akiwa  na kitambulisho  chake  mwezi  mmoja baada ya kupokea  barua hii.\n\n\n`,
    `6.  Ninakutakia utekelezaji mwema.`,
  ];
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
              .font("Helvetica-Bold")
              .fillColor("black")
              .text(` ${$(element).text().trim() } `, {
                lineGap: 4,
                continued: true,
                align : 'justify'
              });
          } else {
            doc
              .fillColor("black")
              .font("Helvetica")
              .text($(element).text(), {
                lineGap: 4,
                continued: true,
                align: "justify",
              });
          }
        });
    } else {
      // If no tag render normal text
      doc
        .fillColor("black")
        .font("Helvetica")
        .text(text, { lineGap: 4, continued: true, align: "justify" });
    }
}

// Letter Head
const generateHeader = (doc, imagesPaths , reference, createdAt, company , box , mkoa) => {
  doc
    .font("Helvetica-Bold")
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
    .font("Helvetica")
    .fontSize(12)
    .text(
      `Anuani ya simu "ELIMU"\nSimu: 026 296 35 33 \nBaruapepe: info@moe.go.tz`,
      { lineGap: 2 }
    )

    doc.text('Tovuti: ' , {lineBreak : false})
    doc.fillColor("blue")
    .text("www.moe.go.tz")
    .link(100, 100, 160, 27, "https://www.moe.go.tz/")

    doc.fillColor("black")
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
    .font("Helvetica-Bold")
    .text(`Kumb. na. ${reference}`, { continued: true })
    .text(createdAt, doc.page.width / 2 - 10, 200)
    .moveDown()
    .moveDown();

// Addressee
  doc
    .font("Helvetica")
    .text(`${company}, \n${box}, \n${mkoa}.`)
    .moveDown()
    .moveDown();
}
// Title
const generateTitle = (doc , title) => {
  doc
    .text("Yah: ", {
      continued: true,
      width: doc.page.width - 100,
      indent: 50,
      lineBreak: true,
    })
    .font("Helvetica-Bold")
    .text(title.toUpperCase().trim(), { underline: true, align: "center" })
    .moveDown();
}
// Body
const  generateBody = (doc, bodyContent) => {
   formatParagraph(bodyContent , doc)
}

// 
const generateFooter = (doc , signature , signatory , cheo) => {
  const lineSize = 174;
  const signatureHeight = doc.y + 100;

  const startLine1 = doc.page.width / 2 - 100;
  const endLine1 = doc.page.width / 2 - 100 + lineSize;
  doc
    .moveTo(startLine1, signatureHeight)
    .lineTo(endLine1, signatureHeight)
    .stroke();

  doc
    .font("Helvetica")
    .fontSize(12)
    .fill("#021c27")
    .text(
      signatory,
      doc.page.width / 2 - 350,
      signatureHeight + 25,
      {
        columns: 1,
        columnGap: 2,
        height: 2,
        width: lineSize,
        align: "center",
      }
    );
  doc
    .font("Helvetica-Bold")
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
  doc.font("Helvetica").text("", 20, doc.page.height - 50, {
    lineBreak: false,
  });
}

const addTable = (doc  , table) => {
  const tableArray = {
                      headers : table.headers,
                      rows : table.rows
                    };
  doc.table(tableArray, {
    columnsSize: [40, 60, 80, 120, 230],
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: () => doc.font("Helvetica").fontSize(12),
    padding : 0,
    hideHeader : false
  });
}