require("dotenv").config();
const request = require("request");
const jwt = require("jsonwebtoken");
const dateAndTime = require("date-and-time");
const {
  titleCase, lowerCase,
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


module.exports = {
  isAuthenticated: (req, res, next) => {
    const authorization = "Bearer" + " " + req.session.Token;
    // req.session.previousUrl = req.originalUrl;
    if (authorization) {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || "the-super-strong-secrect",
        (err, decode) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              req.session.destroy((error) => {
                if (error) console.log(error);
              });
            }
            res.redirect("/");
          } else {
            req.user = decode;
            const { exp } = decode;
            const timestamp = Math.round(Date.now() / 1000, 0);
            if (exp - timestamp > 0) {
              console.log("refresh Token");
            }
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
    if (
      typeof req.session.userName !== "fined" ||
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
    district_sqa_box
  ) => {
    const options = {
      margin: 72,
      size: "A4",
    };
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
      registry_type
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
      district_sqa_box
    );
    doc.pipe(res);
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
    type = "", //manager or owner
    owner_name = "",
    old_owner_name = "",
    manager_name = "",
    old_manager_name = "",
    region = "",
    council = "",
    subcategory = "",
    stream = "",
    old_stream = "",
    language = "",
    ward = "",
    combinations = "",
    number_of_students = 0,
    gender_type = ""
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
    var type = school_type_id == 4 ? "Chuo" : "Shule";

    switch (application_category_id) {
      case 1:
        title = `KIBALI CHA KUANZISHA ${name}`;
        bodyContent = [
          `       Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Ninafurahi kukufahamisha kuwa kibali cha kuanzisha ${school_type_only}<b>${school_name}</b> kimetolewa ili shule hiyo ianzishwe katika Kata ya <b>${ward}</b> Halmashauri ya Wilaya ya <b>${council}</b> Mkoa wa <b>${region}.</b> \n\n`,
          `3.    Kibali hiki kimetolewa kwa mujibu wa <b>Sheria ya Elimu Sura ya 353</b>, kwa masharti kuwa utazingatia mwongozo wa Wizara wa kuanzisha na kusajili shule zisizo za Serikali. Unashauriwa kuwasiliana na <b>Msanifu wa Majengo wa Wilaya</b> kwa ushauri wa kitaalam wa kuendeleza majengo hayo kulingana na mahitaji ya Shule. Aidha, unatakiwa kuhakikisha uwepo wa miundombinu ya walemavu katika shule yako.\n\n`,
          `4.    <b>Uthibitisho huu siyo kibali cha kusajili Wanafunzi.</b>\n\n`,
          `5.    Ninakutakia utekelezaji mwema`,
        ];

        break;
      case 2:
        title = `UTHIBITISHO WA ${
          type == "mmiliki" ? "MMILIKI" : "MENEJA"
        } WA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Ninafurahi kukufahimisha kuwa uthibitisho umetolewa kwa <b>${
            type == "mmiliki"
              ? owner_name.replace(/ +(?= )/g, "")
              : (str = manager_name.replace(/ +(?= )/g, ""))
          }</b>  kuwa ${
            type == "mmiliki" ? "Mmiliki" : "Meneja"
          } wa ${school_type_only}<b>${school_name}</b>\n\n`,
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
        let total_streams = (stream ?? 0) + (old_stream ?? 0);
        let mikondo_text = (count) => (count > 1 ? "mikondo" : "mkondo");

        title = `KIBALI CHA KUONGEZA ${mikondo_text(stream ?? 0)}  (${
          stream ?? 0
        }) ILI IWE ${mikondo_text(
          total_streams
        )} (${total_streams}) KWA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Napenda kukufahamisha kuwa Wizara imekubali ombi lako la kuongeza ${mikondo_text(
            stream ?? 0
          )} <b>${toSwahili(stream ?? 0)} (${
            stream ?? 0
          })</b> katika ${school_type_only} <b>${school_name}</b> ili iwe <b>${mikondo_text(
            total_streams
          )} ${toSwahili(
            total_streams
          )} (${total_streams})</b>. Kibali kimetolewa tarehe <b>${approved_date}</b>.\n\n`,
          `3.    Hata hivyo unatakiwa kuendelea kuboresha miundombinu ya shule ikiwa ni pamoja na kuajiri walimu wenye sifa na kununua vitabu vya kutosha.\n\n\n`,
          `4.    Mfahamishe Katibu Mtendaji wa Baraza la Mitihani ni lini wanafunzi walioongezeka watafanya upimaji wa darasa la IV na mtihani wa Taifa wa darasa la VII.\n\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 6:
        title = `KIBALI CHA KUBADILI USAJILI WA ${name} KUWA ${gender_type}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Napenda kukujulisha kuwa Wizara imepokea barua yako yenye <b>Kumb Na. WIPAHS/KIB/EXT/GIRLS/2023/0049</b> ya tarehe <b>24/10/2023</b> ukiomba kubadili usajili wa ${name}, kuwa ${school_type_only} ${gender_type} ya ${school_name}.\n\n`,
          `3.    Wizara imeridhia ombi lako. Pia kibali cha bweni kimetokea kulaza wanafunzi ${number_of_students} Wavulana. Hivyo, kuanzia tarehe ya barua hii shule itakuwa kutwa, bweni mchanganyiko.\n\n`,
          `4.    <b>Hivyo unatakiwa kuzifahamisha mamlaka nyingine za kielimu kuhusu mabadiliko haya.</b>\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 7:
        title = `KIBALI CHA KUBADILISHA MMILIKI WA SHULE KATIKA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Wizara inapenda kukujulisha kuwa maombi yako ya kubadili mmiliki yamekubaliwa kuanzia tarehe ya barua hii shule itamilikiwa na ${owner_name} kutoka kwa ${old_owner_name}.\n\n`,
          `3.    Shule itaendelea na namba ile ile ya zamani ya usajili ${registration_number}. Aidha, unajulishwa kufuata cheti kipya cha usajili chenye jina la mmiliki mpya mwezi mmoja tangu barua hii ilipoandikwa.\n\n`,
          `4.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 8:
        title = `KIBALI CHA KUBADILI MENEJA WA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Wizara imepokea barua yako yenye/isiyo na kumbukumbu namba ya tarehe ………………………… ukiomba kibali cha kubadili Meneja wa ${name}.\n\n`,
          `3.    Ninafurahi kukujulisha kuwa ombi lako limekubaliwa.  Kwa mamlaka niliyonayo na kwa Sheria ya Elimu, Sura 353 nafuta uthibitisho wa ndugu ${old_manager_name}. Aliyekuwa meneja wa ${name}  Kuanzia tarehe ya barua hii ${approved_date} siyo meneja wa ${name}.\n\n`,
          `3.    Unatakiwa kuzitaarifu Mamlaka nyingine za kielimu juu ya mabadiliko yaliyofanyika.\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 9:
        title = `KIBALI CHA KUBADILI JINA LA ${old_name} KUWA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Wizara ya Elimu, Sayansi na Teknolojia imepokea barua yenye <b>Kumb. Na. HMW/SMJ/EL/EM/41/43</b> ya tarehe <b>20/09/2023 </b> kuhusu maombi ya mabadiliko ya jina la  <b>${old_name} </b> kuwa <b>${name}</b>\n\n`,
          `3.    Ninafurahi kukufahamisha kuwa maombi ya mabadiliko ya jina la ${type} yamekubaliwa. Hivyo, kuanzia tarehe ya barua hii, shule hii itatambulika kwa jina la <b>${name}</b>\n\n`,
          `4.    Unaagizwa kuzijulisha Mamlaka zote za kielimu juu ya mabadiliko ya jina la shule.\n\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 10:
        title = `KIBALI CHA KUHAMISHA  ${name} `;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Wizara ya Elimu, Sayansi na Teknolojia imepokea barua ya maombi ya kibali cha kuhamisha ${name}.\n\n`,
          `3.    Kamishna wa Elimu ameridhia  shule hiyo ihamie katika eneo jipya.  \n\n`,
          `4.    Shule itahama na namba ya usajili ${registration_number} na itakuwa katika eneo ………… la Kiutawala.\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 11:
        title = ` KUFUTA USAJILI WA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Rejea barua yenye Kumb. Na. ......... ya tarehe ........ iliyohusu kusudio la kufuta usajili wa ${name}.\n\n`,
          `3.    Kwa kuwa umewasilisha cheti halisi cha usajaili wa ${name}.inaonesha umeridhia ${type} kufutwa. Kwa mamlaka niliyopewa na Sheria ya Elimu, Sura 353, ninafuta usajili ${registration_number}, kuanzia tarehe ya barua hii ${type} ${
            school_type_id == 4 ? "hiki kinafutwa" : "hii inafutwa"
          } kutoka katika kanzi data ya ${
            school_type_id == 4 ? "Vyuo vya Ualimu vilivyopo" : "Shule zilizopo"
          } nchini Tanzania Bara.\n\n`,
          `4.    Ninakutakia utekelezaji mwema`,
        ];
        break;

      case 12:
        title = `KIBALI CHA KUONGEZA TAHASUSI ZA ${combinations}, KATIKA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Nafurahi kukujulisha kuwa Wizara imekubali kutoa kibali cha kuanzisha tahasusi za <b>${combinations}</b> mkondo mmoja <b>(01)</b> kwa kila tahasusi kwa ${gender_type} pekee. Kibali hiki kimetolewa tarehe <b>${approved_date}</b>\n\n`,
          `3.    Hata hivyo, unatakiwa kuendelea kuboresha miundombinu ya shule pamoja na kununua samani na vitabu vya kutosha.\n\n`,
          `4.    Aidha, mfahamishe <b>Katibu Mtendaji Baraza la Mitihani Tanzania</b> ni lini shule itakuwa na <b>Wanafunzi watakaofanya Mtihani wa Taifa kidato cha sita kwa tahasusi husika</b>.\n\n\n`,
          `5.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 13:
        title = `KIBALI CHA KUTOA HUDUMA YA DAHALIA KATIKA ${name} KATIKA HALMASHAURI YA ${council}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Napenda kukujulisha kuwa maombi yako ya <b>kibali cha kutoa huduma ya Dahalia</b> katika ${name}. yamekubaliwa.  Kibali kimetolewa tarehe ${approved_date}. kulaza wanafunzi ${number_of_students}. tu ambao watagharamiwa na wazazi/walezi wa wanafunzi watakao lala ndani ya dahalia na kuratibiwa na Halmashauri husika.\n\n`,
          `3.    Aidha, Serikali haitahusika na gharama za uendeshaji wa dahalia.\n\n\n`,
          `4.    Ninakutakia utekelezaji mwema.`,
        ];
        break;

      case 14:
        title = `KIBALI CHA KUTOA HUDUMA YA BWENI KWA ${name}`;
        bodyContent = [
          `      Tafadhali rejea somo la barua hii.\n\n\n`,
          `2.    Napenda kukujulisha kuwa maombi yako ya kibali cha kutoa <b>huduma ya bweni</b> katika <b>${name}</b> yamekubaliwa. \n\n`,
          `3.    Kibali kimetolewa tarehe ${approved_date} kulaza wanafunzi <b>${number_of_students} ${gender_type}</b>. Unaagizwa kuimarisha hali ya usalama wa wanafunzi ndani na nje ya bweni. Kibali hiki kimetolewa kulaza wanafunzi wa <b>${type} tu.</b> \n\n`,
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

const usajiliSerikali = (name, school_name, school_type, region, council) => {
  return [
    `    Tafadhali rejea somo la barua hii.\n\n\n`,
    `2.  Napenda kukujulisha kuwa Wizara imekubali maombi ya Halmashauri ya Wilaya ya <b>${council}</b> ya kusajili <b>${name}</b> itakayomilikiwa na wananchi wa Halmashauri ya Wilaya ya ${council}. kwa kushirikiana na Mkoa wa ${region}\n\n`,
    `3.  Mkoa unaruhusiwa kuchagua wanafunzi wa Kidato cha Kwanza kwa mwaka 2023.  Shule itakuwa ya kutwa, mchanganyiko na yenye mkondo mmoja (01). Shule hii imesajiliwa rasmi tarehe ${approved_date} na kupewa namba ya usajili kama ifuatavyo:\n\n\n`,
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
const getSchoolType = (school_type_id, school_type, school_name) => {
  var name = '';
  if ([1, 2, 3].includes(school_type_id)) {
    name = `Shule ya ${school_type} ${school_name} `;
  } else {
    name = `Chuo cha Ualimu ${school_name}`;
  }
  return name;
};

const getSchoolTypeOnly = (school_type_id, school_type) => {
  var name = '';
  if ([1, 2, 3].includes(school_type_id)) {
    name = `Shule ya ${school_type} `;
  } else {
    name = `Chuo cha Ualimu `;
  }
  return name;
};

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
            .text($(element).text(), {
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
  registry_type
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
    .fillColor("#444444");
  doc.moveDown();

  doc
    .text("Unapojibu tafadhali taja:", 30, 150, { continue: true })
    .moveDown()
    .moveDown();
  doc
    .font("Helvetica-Bold")
    .text(`Kumb. na. ${reference}`, { continued: true })
    .text(createdAt, doc.page.width / 2 - 60, 190)
    .moveDown()
    .moveDown();

  // Addressee
  doc
    .font("Helvetica-Bold")
    .text(
      `${
        company ? company.toUpperCase() : company || "<Insert Company/Name>"
      },  \n${ registry_type != 3 || registry_type == '' ? (box  || "<Insert Address>")+`,\n` : "" }`
    )
    .text(
      `${region_address ? region_address.toUpperCase() : region_address}.`,
      { underline: true }
    )
    .moveDown()
    .moveDown();
};
// Title
const generateTitle = (doc, title) => {
  doc
    .font("Helvetica-Bold")
    .text(`Yah: ${title.toUpperCase()}`, { underline: true, align: "center" })
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
      signatory ? doc.page.width / 2 - 350 : 50,
      signatureHeight + 15,
      {
        // columns: 1,
        columnGap: 2,
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
      signatureHeight + 33,
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
  district_sqa_box
) => {
  const has_copies = zone_box || region_box || district_box || district_sqa_box;
  const $copies = has_copies
    ? `Nakala:
  
          ${
            zone_box
              ? `Mthibiti Mkuu Ubora wa Shule,
          Kanda ya ${zone_name ? zone_box + "," : "<Insert Zone Name>"}
          S.L.P. ${zone_box ? zone_box : "<Insert Zone Address>"}, ${
                  sqa_zone_region
                    ? "<u>" + sqa_zone_region + ".</u>"
                    : "<Insert Region>"
                }`
              : ``
          }
        ${
          region_box
            ? `  Afisa Elimu Mkoa,
          Mkoa wa ${region ? region : "<Insert Region>"},
          S.L.P ${region_box ? region_box : "<Insert Region Address"}, ${
                region ? "<u>" + region + ".</u>" : "<Insert Region>"
              }`
            : ``
        }
          ${
            district_box
            ? `Afisa Elimu Sekondari
          Halmashauri ya ${district ? district : "<Insert District>"},
          S.L.P ${district_box ? district_box : "<Insert District Address>"}, ${
                  region ? "<u>" + region + ".</u>" : "<Insert Region>"
                }`
              : ``
          }
          ${
            district_sqa_box
              ? `Mthibiti Mkuu Ubora wa Shule,
          Halmashauri ya ${district ? district : "<Insert District>"},
          S.L.P ${
            district_sqa_box
              ? district_sqa_box
              : "<Insert District SQA Address>"
          }, ${region ? "<u>" + region + ".</u>" : "<Insert Region>"}`
              : ``
          }
          `
    : ``; //end has copies;

  // console.log($copies)
  has_copies
    ? formatText($copies, doc, "left", "Helvetica", true, 0, false, true)
    : ``;
};

const addTable = (doc, table) => {
  const tableArray = {
    headers: table.headers,
    rows: table.rows
  };
  doc.table(tableArray, {
    columnsSize: [40, 60, 80, 120, 230],
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: () => doc.font("Helvetica").fontSize(12),
    padding: 0,
    hideHeader: false
  });
}
