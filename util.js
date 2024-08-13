require("dotenv").config();
const request = require("request");
const jwt = require("jsonwebtoken");
const dateAndTime = require("date-and-time");
const {
  titleCase, lowerCase,
  sentenceCase,
  capitalCase
} = require("text-case");
const fs = require("fs");
const json2xls = require("json2xls");
const Cryptr = require("cryptr");
const cheerio = require("cheerio");
const path = require("path");
const PDFDocument = require("./public/controllers/barua/pdfkitTable");
const url = require("url");

const { toSwahili } = require('digits-to-swahili');
const { level } = require("winston");
const API_BASE_URL = process.env.API_BASE_URL;
const myActivehandover = API_BASE_URL + "my-active-handover";
const refreshTokenApi = API_BASE_URL + "refresh_token";

module.exports = {
  isAuthenticated: (req, res, next) => {
    const sessionToken = req.session.Token;
    const bodyToken = req.body.token;
    const authorization = "Bearer" + " " + (sessionToken || bodyToken);
    // req.session.previousUrl = req.originalUrl;
    if (authorization) {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || "the-super-strong-secrect",
        (err, decode) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              if (bodyToken) {
                return res.send({
                  success: false,
                  statusCode: 402,
                  message: "Token is expired",
                });
              } else {
                req.session.destroy((error) => {
                  if (error) console.log(error);
                });
              }
            } else {
              if (bodyToken) {
                res.status(401).send({
                  success: false,
                  statusCode: 401,
                  message: "You are not authorized",
                });
              } else {
                res.redirect("/");
              }
            }
          } else {
            req.user = decode;
            const { exp } = decode;
            const timestamp = Math.round(Date.now() / 1000, 0);
            if (exp - timestamp < 300) {
              module.exports.refreshToken(req, res)
              console.log("Refresh token");
            }
            next();
          }
        }
      );
    } else {
      if (bodyToken) {
        res.status(401).send({
          success: false,
          statusCode: 401,
          message: "You are not authorized",
        });
      } else {
        res.redirect("/");
      }
    }
  },
  refreshToken: (req, res) => {
    module.exports.sendRequest(
      req,
      res,
      refreshTokenApi,
      "POST",
      {},
      (jsonData) => {
        const { statusCode, token } = jsonData;
        if(statusCode == 300){
          req.session.Token = token;
        }
      }
    );
  },
  activeHandover: (req, res, next) => {
    const current_url = req.originalUrl;
    if (
      !["/Profile", "/MyHandover", "/MyNotifications"].includes(current_url)
    ) {
      module.exports.sendRequest(
        req,
        res,
        myActivehandover,
        "POST",
        {},
        (jsonData) => {
          const { active } = jsonData;
          const {is_password_changed} = req.user
          if (!is_password_changed){
            return res.redirect("/Profile?tab=change_password");
          }
          if (active) {
            return res.redirect("/Profile?tab=kaimisha");
          }
        }
      );
    }
    next();
  },
  redirectIfAuthenticated: (req, res, next) => {
    if (req.session.userName) {
      // let  previousUrl = req.session.previousUrl
      // res.redirect(previousUrl ? previousUrl : '/Dashboard');
      res.redirect("/Dashboard");
    }
    next();
  },
  validePassword: (req, res, next) => {
    const { oldpassword, newpassword, confirmpassword } = req.body;
    if (!oldpassword || !newpassword || !confirmpassword) {
      res.send({
        statusCode: 422,
        message: "Tafadhali jaza maeneo yote kwa ukamilifu.",
      });
    } else if (
      !module.exports.isPasswordsMatched(newpassword, confirmpassword)
    ) {
      res.send({
        statusCode: 422,
        message: "Tafadhali hakikisha nywila yako mpya zinafanana.",
      });
    } else if (module.exports.isPasswordsMatched(oldpassword, newpassword)) {
      res.send({
        statusCode: 422,
        message:
          "Tafadhali hakikisha nywila yako mpya na ya zamani hazifanani.",
      });
    } else if (!module.exports.isStrongPassword(newpassword)) {
      res.send({
        statusCode: 422,
        message:
          "Tafadhali hakikisha nywila yako mpya ina characters angalau 8 na ikiwa na mchanganyiko wa angalau herufi moja kubwa, herufi moja ndogo na special character.",
      });
    } else {
      next();
    }
  },
  isPasswordsMatched: (a, b) => {
    return a === b;
  },
  isValidLength: (str, length = 8) => {
    return str.length >= length;
  },
  isStrongPassword: (password, length = 8) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  },
  modifiedUrl: (req, newParams = { status: req.query.status }) => {
    const currentUrl = req.originalUrl;
    const parseUrl = url.parse(currentUrl, true);
    // console.log(parseUrl);
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
    if (parseUrl.query.per_page) {
      delete parseUrl.query.per_page;
    }
    const newUrl = url.format({
      pathname: parseUrl.pathname.substring(1),
      query: parseUrl.query,
    });
    return newUrl;
  },
  sendRequest: (req, res, url, method, formData, callback) => {
    const nameOrToken = typeof (req.session.userName || req.body.token);
    const token = req.session.Token || req.body.token;
    if (nameOrToken !== "undefined" || req.session.userName === true) {
      request(
        {
          url: url,
          method: method,
          headers: {
            Authorization: "Bearer" + " " + token,
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
  sendRequestTest: (req, res, url, method, formData, callback) => {
    request(
      {
        url: url,
        method: method,
        headers: {
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
  decodeSignature: (base64Data, tracking_number) => {
    if (base64Data) {
      const fileDataDecoded = Buffer.from(base64Data, "base64");
      fs.writeFileSync(
        __dirname + `/tmp/signature_${tracking_number}.png`,
        fileDataDecoded,
        (error) => {
          if (error) console.log(error);
        }
      );
    }
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
    tracking_number,
    application_category_id,
    reference,
    created_at,
    company,
    box,
    region_address,
    title,
    paragraphs,
    signatory,
    cheo,
    table,
    registry_type,
    region,
    district,
    zone_name,
    zone_box,
    region_box,
    sqa_zone_region,
    district_box,
    district_sqa_box,
    school_type_id,
    ngazi_ya_wilaya
  ) => {
    const options = {
      margin: 72,
      size: "A4",
    };
    // console.log(
    //   region,
    //   district,
    //   zone_name,
    //   zone_box,
    //   region_box,
    //   sqa_zone_region,
    //   district_box,
    //   district_sqa_box
    // );
    let doc = new PDFDocument(options);
    const imagesPaths = path.join(__dirname + "/public/assets/images");
    const trackingNumber = req.params.id;
    const filename = encodeURIComponent(trackingNumber) + ".pdf";
    // for downloading set the content-dispostion to (download, attachment)
    res.setHeader("Content-disposition", 'inline; filename="' + filename + '"');
    res.setHeader("Content-type", "application/pdf");

    generateHeader(
      doc,
      imagesPaths,
      reference,
      created_at,
      company,
      box,
      region_address,
      registry_type,
      school_type_id
    ); // Invoke `generateHeader` function.
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
    generateFooter(res, doc, tracking_number, signatory, cheo);
    generateCopies(
      doc,
      region,
      district,
      zone_name,
      zone_box,
      region_box,
      sqa_zone_region,
      district_box,
      district_sqa_box,
      school_type_id,
      application_category_id,
      ngazi_ya_wilaya
    );

    doc.pipe(res, { end: true });
    doc.end();
  },

  bodyContent: (
    application_category_id,
    registry_type,
    school_name,
    old_school_name,
    school_type_id,
    school_type,
    approved_date,
    registration_number,
    registration_date,
    uthibitisho = "", //manager or owner
    owner_name = "",
    old_owner_name = "",
    manager_name = "",
    old_manager_name = "",
    region = "",
    council = "",
    ngazi_ya_wilaya = "",
    subcategory = "",
    stream = "",
    old_stream = "",
    language = "",
    ward = "",
    combinations = "",
    number_of_students = 0,
    gender_type = "",
    category, //  awali, msingi, sekondari
    old_category // msingi, chuo cha ualimu 
  ) => {
    let bodyContent = null;
    const name = getSchoolType(school_type_id, school_type, school_name);
    const old_name = getSchoolType(
      school_type_id,
      school_type,
      old_school_name
    );
    let title = ``;
    let school_type_only = getSchoolTypeOnly(school_type_id, school_type);
    var type = school_type_id == 4 ? "chuo" : "shule";
    var ngazi = ngaziWilaya(ngazi_ya_wilaya);

    switch (application_category_id) {
      case 1:
        title = `KIBALI CHA KUANZISHA ${titleCase(name.toLowerCase())}`;
        bodyContent = [
          `       Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Ninafurahi kukufahamisha kuwa kibali cha kuanzisha ${school_type_only}<b>${school_name} </b> katika Kata ya <b>${ward} </b> Halmashauri ya ${ngazi} <b>${council}</b> Mkoa wa <b>${region}</b> kimetolewa.\n\n`,
          `3.    Kibali hiki kimetolewa kwa mujibu wa <b>Sheria ya Elimu Sura ya 353</b>, kwa masharti kuwa utazingatia mwongozo wa Wizara wa kuanzisha na kusajili shule. Unashauriwa kuwasiliana na <b>Msanifu wa Majengo wa Halmashauri ya ${ngazi} ${council} </b> kwa ushauri wa kitaalam wa kuendeleza majengo hayo kulingana na mahitaji ya ${type}. Aidha, unatakiwa kuhakikisha uwepo wa miundombinu ya walemavu katika ${type} ${
            type == "chuo" ? "chako" : "yako"
          }.\n\n`,
          `4.     <b>Uthibitisho huu siyo kibali cha kusajili ${
            type == "chuo" ? "Wanachuo" : "Wanafunzi"
          }.</b>\n\n`,
          `5.    Ninakutakia utekelezaji mwema`,
        ];

        break;
      case 2:
        title = `UTHIBITISHO WA ${
          uthibitisho == "mmiliki" ? "MMILIKI" : "MENEJA"
        } WA ${titleCase(name.toLowerCase())}`;
       
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Ninafurahi kukufahimisha kuwa uthibitisho umetolewa kwa <b>${
            uthibitisho == "mmiliki"
              ? owner_name.replace(/ +(?= )/g, "")
              : (str = manager_name.replace(/ +(?= )/g, ""))
          } </b>  kuwa ${
            uthibitisho == "mmiliki"
              ? registry_type == 2
                ? "wamiliki"
                : "mmiliki"
              : "meneja"
          } wa ${school_type_only}<b>${school_name}</b>.\n\n`,
          `3.    Uthibitisho huu umetolewa tarehe <b>${approved_date}</b> kwa mujibu wa <b>Sheria ya Elimu, Sura 353.</b> ${
           uthibitisho == "mmiliki" ? (registry_type == 2 ? "Mtamiliki" : "Utamiliki") : "Utendesha"
          } ${type} ${
            type == "chuo" ? "hiki" : "hii"
          } kwa kuzingatia <b>Sheria, Kanuni, Taratibu na Miongozo </b>ya Wizara ya Elimu, Sayansi na Teknolojia. ${ uthibitisho == "meneja" ? "Hakikisha "+type+" ina <b>kasiki </b> kwa ajili ya kuhifadhia nyaraka nyeti": (registry_type == 2 ? "Mnaagizwa" : "Unaagizwa")+ " kukamilisha miundombinu yote muhimu ya "+type+" kabla ya maombi ya usajili wa "+type+"}"}.\n\n`,
          `4.    Uthibitisho huu siyo kibali cha kusajili ${
            type == "chuo" ? "Wanachuo" : "Wanafunzi"
          }.\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;
      case 4:
        title =
          registry_type == 3
            ? `USAJILI WA ${titleCase(name.toLowerCase())} KATIKA HALMASHAURI YA ${ngazi} ${council}`
            : `USAJILI WA ${titleCase(name.toLowerCase())}`;
        bodyContent =
          registry_type == 3
            ? usajiliSerikali(
                name,
                school_name,
                school_type_id,
                region,
                council,
                ngazi_ya_wilaya,
                approved_date,
                gender_type,
                stream,
                subcategory
              )
            : usajiliBinafsi(
                name,
                school_name,
                school_type_id,
                registration_date,
                registration_number,
                subcategory,
                stream,
                language,
                gender_type
              );
        break;
      case 5:
        let total_streams = (stream ?? 0) + (old_stream ?? 0);
        let mikondo_text = (count) => (count > 1 ? "mikondo" : "mkondo");

        title = `KIBALI CHA KUONGEZA ${mikondo_text(stream ?? 0)}  (${
          stream ?? 0
        }) ILI IWE ${mikondo_text(
          total_streams
        )} (${total_streams}) KWA ${titleCase(name.toLowerCase())}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Napenda kukufahamisha kuwa Wizara imekubali ombi lako la kuongeza ${mikondo_text(
            stream ?? 0
          )} <b>${numberToWord(stream ?? 0)} (${
            stream ?? 0
          })</b> katika ${school_type_only} <b>${school_name}</b> ili iwe <b>${mikondo_text(
            total_streams
          )} ${numberToWord(
            total_streams
          )} (${total_streams})</b>. Kibali kimetolewa tarehe <b>${approved_date}</b>.\n\n`,
          `3.    Hata hivyo unatakiwa kuendelea kuboresha miundombinu ya ${type} ikiwa ni pamoja na kuajiri walimu wenye sifa na kununua vitabu vya kutosha.\n\n\n`,
          `4.    Mfahamishe Katibu Mtendaji wa Baraza la Mitihani ni lini ${
            type == "chuo" ? "Wanachuo" : "Wanafunzi"
          } walioongezeka watafanya upimaji wa darasa la IV na mtihani wa Taifa wa darasa la VII.\n\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 6:
        new_school_category_text =  (category.toLowerCase() == "chuo cha ualimu" ? "chuo cha ualimu " : "shule ya "+category.toLowerCase()+" ") +sentenceCase(school_name.toLowerCase())
        old_school_category_text =  (old_category.toLowerCase() == "chuo cha ualimu" ? "chuo cha ualimu " : "shule ya "+old_category.toLowerCase()+" ") +sentenceCase(school_name.toLowerCase())
        title = `KIBALI CHA KUBADILI USAJILI WA ${old_school_category_text} KUWA ${new_school_category_text}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n`,
          `2.    Napenda kukujulisha kuwa Wizara imeridhia maombi yako ya kubadili usajili wa ${old_school_category_text} kuwa ${new_school_category_text}.\n\n`,
          `3.    <b>Hivyo unatakiwa kuzifahamisha mamlaka nyingine za kielimu kuhusu mabadiliko haya.</b>\n\n`,
          `4.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 7:
        title = `KIBALI CHA KUBADILI MMILIKI WA ${titleCase(name.toLowerCase())}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n`,
          `2.    Wizara inapenda kukujulisha kuwa maombi ya kubadili mmiliki wa ${titleCase(name.toLowerCase())} yamekubaliwa kuanzia tarehe ya barua hii. ${sentenceCase(
            type
          )} ${
            type == "chuo" ? "kitamilikiwa" : "itamilikiwa"
          } na ${capitalCase(owner_name)} kutoka kwa ${capitalCase(old_owner_name)}.\n\n`,
          `3.    ${sentenceCase(type)} ${
            type == "chuo" ? "kitaendelea" : "itaendelea"
          } na namba ile ile ya zamani ya usajili ${registration_number}. Aidha, unajulishwa kufuata cheti kipya cha usajili chenye jina la mmiliki mpya mwezi mmoja tangu barua hii ilipoandikwa.\n\n`,
          `4.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 8:
        title = `KIBALI CHA KUBADILI MENEJA WA ${titleCase(name.toLowerCase())}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n`,
          `2.    Wizara imepokea ombi lako la kubadili Meneja wa ${titleCase(name.toLowerCase())}.\n\n`,
          `3.    Ninafurahi kukujulisha kuwa ombi lako limekubaliwa.  Kwa mamlaka niliyonayo na kwa Sheria ya Elimu, Sura 353 nafuta uthibitisho wa ndugu ${capitalCase(old_manager_name)}, aliyekuwa meneja wa ${titleCase(name.toLowerCase())}  Kuanzia tarehe ya barua hii ${approved_date} siyo meneja wa ${titleCase(name.toLowerCase())} na kumthibitisha ndugu ${capitalCase(manager_name)}.\n\n`,
          `3.    Unatakiwa kuzitaarifu Mamlaka nyingine za kielimu juu ya mabadiliko yaliyofanyika.\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 9:
        title = `KIBALI CHA KUBADILI JINA LA ${old_name} KUWA ${school_name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Wizara ya Elimu, Sayansi na Teknolojia imepokea maombi yako ya mabadiliko ya jina la  <b>${old_name} </b> kuwa <b>${school_name}</b>\n\n`,
          `3.    Ninafurahi kukufahamisha kuwa maombi ya mabadiliko ya jina la ${type} yamekubaliwa. Hivyo, kuanzia tarehe ya barua hii, ${type} ${
            type == "chuo" ? "hiki" : "hii"
          } itatambulika kwa jina la <b>${school_name}</b>\n\n`,
          `4.    Hivyo, Unaagizwa kuzijulisha Mamlaka zote za kielimu juu ya mabadiliko ya jina la ${type}.\n\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 10:
        title = `KIBALI CHA KUHAMISHA  ${titleCase(name.toLowerCase())} `;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n`,
          `2.    Wizara ya Elimu, Sayansi na Teknolojia imepokea maombi ya kibali cha kuhamisha ${titleCase(name.toLowerCase())} kutoka .... kwenda....\n\n`,
          `3.    Kwa mamlaka niliyonayo nitatoa kibali cha kuhamisha ${type.toLowerCase()} kuanzia tarehe ya barua hii.  \n\n`,
          `4.    Aidha, ${type} ${
            type == "chuo" ? "kitaendelea" : "itaendelea"
          } kutumia namba ya usajili wake wa mwanzo.\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 11:
        title = ` KUFUTA USAJILI WA ${titleCase(name.toLowerCase())}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n`,
          `2.    Wizara imepokea ombi la kufuta usajili wa ${titleCase(name.toLowerCase())}.\n\n`,
          `3.    Kwa mujibu wa masharti ya <b>Sheria ya Elimu, Sura ya 353 </b>${type=="chuo" ? "ninakifutia" : "ninaifutia"} rasmi usajili ${titleCase(name.toLowerCase())} kuanzia tarehe ya barua hii.\n\n`,
          `4.    Aidha, unatakiwa kuzitaarifu mamlaka nyingine za kielimu juu ya mabadiliko hayo.\n\n`,
          `5.    Ninakutakia utekelezaji mwema`,
        ];
        break;

      case 12:
        title = `KIBALI CHA KUONGEZA TAHASUSI ZA ${combinations}, KATIKA ${titleCase(name.toLowerCase())}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Nafurahi kukujulisha kuwa Wizara imekubali kutoa kibali cha kuanzisha tahasusi za <b>${combinations}</b> mkondo mmoja <b>(01)</b> kwa kila tahasusi kwa ${gender_type} pekee. Kibali hiki kimetolewa tarehe <b>${approved_date}</b>\n\n`,
          `3.    Hata hivyo, unatakiwa kuendelea kuboresha miundombinu ya ${type} pamoja na kununua samani na vitabu vya kutosha.\n\n`,
          `4.    Aidha, mfahamishe <b>Katibu Mtendaji Baraza la Mitihani Tanzania</b> ni lini ${type} ${
            type == "chuo" ? "kitakuwa" : "itakuwa"
          } na <b>Wanafunzi watakaofanya Mtihani wa Taifa kidato cha sita kwa tahasusi husika</b>.\n\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 13:
        title = `KIBALI CHA KUTOA HUDUMA YA DAHALIA KATIKA ${titleCase(name.toLowerCase())} KATIKA HALMASHAURI YA ${ngazi} ${council}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Napenda kukujulisha kuwa maombi yako ya <b>kibali cha kutoa huduma ya Dahalia</b> katika ${titleCase(name.toLowerCase())}. yamekubaliwa.  Kibali kimetolewa tarehe ${approved_date}. kulaza wanafunzi ${number_of_students}. tu ambao watagharamiwa na wazazi/walezi wa wanafunzi watakao lala ndani ya dahalia na kuratibiwa na Halmashauri husika.\n\n`,
          `3.    Aidha, Serikali haitahusika na gharama za uendeshaji wa dahalia.\n\n\n`,
          `4.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 14:
        title = `KIBALI CHA KUTOA HUDUMA YA BWENI KWA ${titleCase(name.toLowerCase())}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Napenda kukujulisha kuwa maombi yako ya kibali cha kutoa <b>huduma ya bweni</b> katika <b>${titleCase(name.toLowerCase())}</b> yamekubaliwa. \n\n`,
          `3.    Kibali kimetolewa tarehe ${approved_date} kulaza wanafunzi <b>${number_of_students} ${gender_type}</b>. Unaagizwa kuimarisha hali ya usalama wa wanafunzi ndani na nje ya bweni. Kibali hiki kimetolewa kulaza wanafunzi wa <b>${type} tu.</b> \n\n`,
          `4.    Aidha, <b>Wathibiti Ubora wa Shule</b> watafuatilia kuhusu uwekaji vifaa vya zimamoto, viashiria moshi, makabati pamoja na sehemu ya kuteketeza taka <b>(Incinerator)</b>.Pia watafuatilia idadi halisi ya wanafunzi wanaolala ndani ya mabweni ili kuepuka <b>msongamano</b> wa wanafunzi.\n`,
          `5.    Kibali hiki kimetolewa kwa mujibu wa <b>Sheria ya Elimu, Sura 353</b>. Kwa masharti kuwa utazingatia mwongozo wa Wizara wa kuanzisha na kusajili ${type}. \n\n`,
          `6.    Ninakutakia utekelezaji mwema.`,
        ];
        break;
      default:
        break;
    }
    return { bodyContent, title };
  },
};

const ngaziWilaya = (ngazi_ya_wilaya) => {
    var ngazi = "";
     switch(ngazi_ya_wilaya) {
       case "Wilaya":
         ngazi = "Wilaya ya";
         break;
       case "Mji":
         ngazi =  "Mji wa";
         break;
       case "Manispaa":
         ngazi = "Manispaa ya";
         break;
       case "Jiji":
         ngazi = "Jiji la";
         break;
       default:
        ngazi =  "<Insert>";
        break;
     }
  return ngazi;
}

const usajiliSerikali = (
  name,
  school_name,
  school_type,
  region,
  council,
  ngazi_ya_wilaya,
  approved_date,
  gender_type,
  stream,
  subcategory
) => {
  var ngazi = ngaziWilaya(ngazi_ya_wilaya);
  const type = school_type == 4 ? "chuo" : "shule";
  var wanafunzi_wapya_text =
    school_type == 4 ? "mwaka wa kwanza" : (school_type == 3 ? "kidato cha kwanza" : (school_type == 2 ? "darasa la kwanza" : "darasa la awali"));
  return [
    `    Tafadhali rejea somo la barua hii.\n\n`,
    `2.  Napenda kukujulisha kuwa Wizara imekubali maombi ya Halmashauri ya ${ngazi} <b>${council}</b> ya kusajili <b>${titleCase(name.toLowerCase())}</b> itakayomilikiwa na wananchi wa Halmashauri ya ${ngazi} ${council} kwa kushirikiana na Mkoa wa ${region}\n\n`,
    `3.  ${type == "chuo" ? "Wizara" : "Mkoa"} ${type == "chuo" ? "inaruhusiwa" : "unaruhusiwa"} kuchagua ${school_type == 4 ? 'Wanachuo' : 'Wanafunzi'} wa ${wanafunzi_wapya_text}.  ${sentenceCase(type)} itakuwa ya ${subcategory}, ${gender_type} na yenye ${stream < 2 ? 'mkondo' : 'mikondo'} ${numberToWord(stream)} (${stream}). ${sentenceCase(type)} ${type == "chuo" ? "hiki kimesajiliwa" : "hii imesajiliwa"} rasmi tarehe ${approved_date} na kupewa namba ya usajili kama ifuatavyo:\n\n`,
    `<table/>`,
    `4.  Wizara inaiagiza Halmashauri ya ${ngazi} <b>${council}</b> kuendelea kukamilisha ujenzi wa miundombinu yote. Endapo miundombinu haitakamilika, Halmashauri haitaruhusiwa kuandikisha ${school_type == 4 ? 'Wanachuo' : 'Wanafunzi'} wa ${wanafunzi_wapya_text}.\n\n`,
    `5.  Mkuu wa ${type} atapaswa kuifahamisha Wizara sanduku la barua la shule pindi litakapofunguliwa ili kurahisisha mawasiliano. Aidha, mfahamishe Katibu Mtendaji wa Baraza la Mitihani ni lini ${type} itakuwa na ${school_type == 4 ? 'Wanachuo' : 'Wanafunzi'} watakaofanya Mtihani wa Taifa.\n\n`,
    `6.  Kwa mujibu wa Waraka wa Elimu Na. 10 wa mwaka 2011, Usajili wa ${type} ${type == 'chuo' ? 'hiki' : 'hii'} utarudiwa baada ya miaka 4.\n\n`,
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
  language,
  gender_type
) => {
  const type = school_type == 4 ? "Chuo" : "Shule";
  // ${school_type == 4 ? 'cha' : 'ya'}
  return [
    `    Tafadhali rejea somo la barua hii.\n\n`,
    `2.  Ninafurahi kukujulisha kuwa ${titleCase(name.toLowerCase())} imesajiliwa tarehe <b>${registration_date}</b> kwa mujibu wa Sheria ya Elimu, Sura ya 353.\n\n`,
    `3.  ${type} ${
      school_type == 4 ? "kimipewa" : "imepewa"
    } namba ya Usajili <b>${registration_number}</b> kuwa ya  ${subcategory} ${gender_type} na jina <b>${school_name} </b> limeidhinishwa. ${type} ${
      school_type == 4 ? "hiki" : "hii"
    } imeidhinishwa kuwa na ${
      stream < 2 ? "mkondo" : "mikondo"
    } ${numberToWord(stream)} (${stream}) inayotumia lugha ya ${language} kufundishia na kujifunzia. \n\n`,
    `4.	 Kufuatana na Sheria ya Elimu, Sura 353, cheti cha Usajili kiwekwe bayana na Uongozi wa ${type} uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa Kamati ya ${type} inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na Waraka wa Elimu Na. 10 wa mwaka 2011, Usajili wa ${type} ${
      type == "chuo" ? "hiki" : "hii"
    } utarudiwa baada ya miaka 4.\n\n`,
    `5.	 Mmiliki wa ${type} atatakiwa kuja kuchukua cheti  cha usajili  wa ${type} akiwa  na kitambulisho  chake  mwezi  mmoja baada ya kupokea  barua hii.\n\n`,
    `6.  Ninakutakia utekelezaji mwema.`,
  ];
};
const getSchoolType = (school_type_id, school_type, school_name) => {
  var name = '';
  if ([1, 2, 3].includes(school_type_id)) {
    name = `shule ya ${school_type.toLowerCase()} ${school_name} `;
  } else {
    name = `chuo cha Ualimu ${school_name}`;
  }
  return name;
};

const getSchoolTypeOnly = (school_type_id, school_type) => {
  var name = '';
  if ([1, 2, 3].includes(school_type_id)) {
    name = `shule ya ${school_type.toLowerCase()} `;
  } else {
    name = `chuo cha ualimu `;
  }
  return name;
};

const numberToWord = (number) => {
     var word;
     switch (number) {
       case 0:
         word = "sufuri";
         break;
       case 1:
         word = "mmoja";
         break;
       case 2:
         word = "miwili";
         break;
       case 3:
         word = "mitatu";
         break;
       case 4:
         word = "minne";
         break;
       case 5:
         word = "mitano";
         break;
       case 6:
         word = "sita";
         break;
       case 7:
         word = "saba";
         break;
       case 8:
         word = "nane";
         break;
       case 9:
         word = "tisa";
         break;
       case 10:
         word = "kumi";
         break;
       default:
        word = ""
         break;
     }
     return word;
}

const containsBoldTag = (text) => /<b>(.*?)<\/b>/i.test(text);
const containUnderlineTag = (text) => /<u>(.*?)<\/u>/i.test(text);
const formatText = (
  text,
  doc,
  align = "justify",
  font_family = "Helvetica",
  uppercase = true,
  lineGap = 4,
  continued = true,
  is_bold = false
) => {
  //  if <b> tag present render with bold font
  if (containsBoldTag(text)) {
    var $ = cheerio.load(`<body> ${text} </body>`);
    $("body")
      .contents()
      .each((index, element) => {
          doc
            .font(element.nodeType === 1 ? "Helvetica-Bold" : "Helvetica")
            .fillColor("black")
            .fontSize(12)
            .text( $(element).text(), {
              lineGap: lineGap,
              continued: continued,
              align: align,
            });
        
      });
    }else if(containUnderlineTag(text)) {
      var $ = cheerio.load(`<body> ${text} </body>`);
    $("body")
      .contents()
      .each((index , element) => {
          const myText = $(element).text();
          console.log(is_bold ? font_family : `${font_family}-Bold`);
             doc
               .font(
                 is_bold && element.nodeType === 1
                   ? `${font_family}-Bold`
                   : font_family
               )
               .text(myText, {
                 lineGap: lineGap,
                 indent: element.nodeType === 1 ? 33 : 0,
                 underline: element.nodeType === 1,
                 //  continued: continued,
                 align: align,
               });
      });
    } else {
      // If no tag render normal text
      doc
        .fillColor("black")
        .font("Helvetica")
        .text(text, { align: align });
    }
}

// Letter Head
const generateHeader = (
  doc,
  imagesPaths,
  reference,
  createdAt,
  company,
  box,
  region_address,
  registry_type,
  school_type_id
) => {
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
    );

  doc.text("Tovuti: ", { lineBreak: false });
  doc
    .fillColor("blue")
    .text("www.moe.go.tz")
    .link(100, 100, 160, 27, "https://www.moe.go.tz/");

  doc
    .fillColor("black")
    .text(
      "Mji wa Serikali Mtumba, \nMtaa wa Afya,\nS. L. P. 10,\n40479 DODOMA.",
      doc.page.width / 2 + 80,
      80,
      { lineGap: 2 }
    );

  doc
    .image(imagesPaths + "/national-logo.png", doc.page.width / 2 - 30, 80, {
      width: 80,
      height: 80,
    })
    .fillColor("#000");
  doc.moveDown();

  doc
    .text("Unapojibu tafadhali taja:", 30, 150, { continue: true })
    // .fontSize(10)
    .moveDown()
    .moveDown();
  doc
    .font("Helvetica-Bold")
    .text(`Kumb. na. ${reference}`, { continued: true })
    .text(createdAt, doc.page.width / 2 - 60, 190)
    .moveDown()
    .moveDown();

  // Addressee

  // Kama Chuo ni cha Serikali
  if(registry_type == 3 && school_type_id == 4){
    doc
    .font("Helvetica-Bold")
    .text(
      `${
        "Wizara ya Elimu, Sayansi na Teknolojia"
      },  \n${'S.L.P 10'},\n`
    )
    .text(
      `${'DODOMA'}.`,
      { underline: true }
    )
    .moveDown()
    .moveDown();
  }else{
    doc
    .font("Helvetica-Bold")
    .text(
      `${
        company ? company.toUpperCase() : company || "<Insert Company/Name>"
      },  \n${ (box ? (box.toString().includes("S") ? box : 'S.L.P '+box) : '') + `,\n`}`
    )
    .text(
      `${region_address ? region_address.toUpperCase() : region_address}.`,
      { underline: true }
    )
    .moveDown()
    .moveDown();
  }
  
};
// Title
const generateTitle = (doc, title) => {
  doc
    .font("Helvetica-Bold")
    .text(`Yah. ${title.toUpperCase()}`, { underline: true, align: "center" })
    .moveDown();
}
// Body
const generateBody = (doc, bodyContent) => {
  
  formatText(bodyContent, doc);
}

// 
const generateFooter = (res , doc, tracking_number, signatory, cheo) => {
  const lineSize = 174;
  const signatureHeight = doc.y + 100;

  const startLine1 = doc.page.width / 2 - 100;
  const endLine1 = doc.page.width / 2 - 100 + lineSize;

  // SIGNATURE
  const signature = `${__dirname + "/tmp/signature_" + tracking_number}.png`;
  if (fs.existsSync(signature)) {
    doc.image(signature, doc.page.width / 2 - 50, signatureHeight - 70, {
      width: 120,
      height: 80,
    });
    fs.unlinkSync(signature)
    //  .fillColor("#444444");
    //  doc.moveDown();
  }else{
    doc.text(
      `<Insert Signature>`,
      -50,
      signatureHeight,
      {
        align : 'center'
      }
    ).moveDown();
  }
// LINE
  // doc
  //   .moveTo(startLine1, signatureHeight)
  //   .lineTo(endLine1, signatureHeight)
  //   .stroke();

  doc
    .font("Helvetica")
    .fontSize(12)
    .fill("#021c27")
    .text(
      signatory ? signatory : `<Insert Name>`,
      50,
      signatureHeight,
      {
        // columns: 1,
        columnGap: 1,
        height: 2,
        // width: lineSize,
        align: "center",
      }
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fill("#021c27")
    .text(
      cheo ? cheo : `<Insert Title>`,
      doc.page.width / 2 - 150,
      signatureHeight + 20,
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

const generateCopies = (
  doc,
  region,
  district,
  zone_name,
  zone_box,
  region_box,
  sqa_zone_region,
  district_box,
  district_sqa_box,
  school_type,
  application_category_id,
  ngazi_ya_wilaya
) => {
  const has_copies = zone_box || region_box || district_box || district_sqa_box;
  var ngazi = ngaziWilaya(ngazi_ya_wilaya);
  var copies = has_copies
    ? `Nakala:
  `
    : "";
  // console.log(zone_box);
  if ([4, 11, 9, 14, 12, 5].includes(application_category_id)) {
    copies += `
          Katibu Mkuu,
          OR – TAMISEMI,
          S.L.P.1923,<u>Dodoma.</u>
          Katibu Mtendaji,
          Baraza la Mitihani Tanzania,
          S.L.P.2624,<u>Dar es salaam.</u>`;
  }
  copies += zone_box
    ? `${
        zone_box
          ? `
          Mthibiti Mkuu Ubora wa Shule,
          Kanda ya ${zone_name ? zone_name + "," : "<Insert Zone Name>"}
          S.L.P. ${zone_box ? zone_box : "<Insert Zone Address>"}, ${
              sqa_zone_region
                ? "<u>" + sqa_zone_region + ".</u>"
                : "<Insert Region>"
            }`
          : ``
      }`
    : "";
  copies += region_box
    ? `
          Afisa Elimu Mkoa,
          Mkoa wa ${region ? region : "<Insert Region>"},
          S.L.P ${region_box ? region_box : "<Insert Region Address"}, ${
        region ? "<u>" + region + ".</u>" : "<Insert Region>"
      }`
    : "";
  // copies += district_box
  //   ? `
  //         Afisa Elimu ${[1, 2].includes(school_type) ? "Msingi" : ""}${
  //       [3, 4].includes(school_type) ? "Sekondari" : ""
  //     }
  //         Halmashauri ya ${district ? district : "<Insert District>"},
  //         S.L.P ${district_box ? district_box : "<Insert District Address>"}, ${
  //       region ? "<u>" + region + ".</u>" : "<Insert Region>"
  //     }`
  //   : "";
  copies += district_sqa_box
    ? `
          Mthibiti Mkuu Ubora wa Shule,
          Halmashauri ya ${ngazi} ${
        district ? district : "<Insert District>"
      },
          S.L.P ${
            district_sqa_box
              ? district_sqa_box
              : "<Insert District SQA Address>"
          }, ${region ? "<u>" + region + ".</u>" : "<Insert Region>"}
          
          `
    : "";
  //end has copies;
  has_copies
    ? formatText(copies, doc, "left", "Helvetica", true, 0, false, true)
    : "";
};

const addTable = (doc, table) => {
  const tableArray = {
    headers: table.headers,
    rows: table.rows
  };
  doc.table(tableArray, {
    columnsSize: [40, 60, 80, 120, 230],
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
    prepareRow: () => doc.font("Helvetica").fontSize(10),
    padding: 0,
    hideHeader: false
  });
}
