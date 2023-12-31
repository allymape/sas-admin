require("dotenv").config();
const express = require("express");

const maombiBaruaController = express.Router();
const path = require("path");
const cheerio = require("cheerio");
const PDFDocument = require('./pdfkitTable');

var session = require("express-session");
const API_BASE_URL = process.env.API_BASE_URL;

const mmiliShuleDetails = API_BASE_URL + "ripoti-wamiliki-shule";


// maombiBaruaController.get(
//   "/barua/:id",

//   function (req, res) {
//     const reference = "CD.5/315/3169";
//     const createdAt = '27/12/2023';
//     const company = 'Fedha Boys Secondary School';
//     const box = "S.L.P 12999";
//     const mkoa = 'Dar es salaam';
//     const title = `UTHIBITISHO WA MENEJA WA SHULE YA AWALI NA MSINGI FEDHA BOYS`;
//     const signature = 'Sahihi'
//     const signatory = "Ephrahim A. Simbeye";
//     const cheo = "KAIMU KAMISHNA WA ELIMU";
//     const paragraphs = [
//       `      Tafadhali rejea somo la barua hii.\n\n\n`,
//       `2.    Ninafurahi kukufahimisha kuwa uthibitisho umetolewa kwa <b>Zainabu Ally</b> Mweta kuwa Meneja wa Shule ya Awali na Msingi <b>Fedha Boys</b>\n\n`,
//       `3.    Uthibitisho huu umetolewa tarehe <b>27/12/2023</b> kwa mujibu wa <b>Sheria ya Elimu, Sura 353.</b> Utaindesha shule hii kwa kuzingatia <b>Sheria, Kanuni, Taratibu na Miongozo</b> ya Wizara ya Elimu, Sayansi na Teknolojia. Hakikisha shule ina <b>kasiki</b> kwa ajili ya kuhifadhia nyaraka nyeti.\n\n`,
//       `4.    Uthibitisho huu siyo kibali cha kusajili Wanafunzi.\n\n\n`,
//       `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
//     ];
//     const body = ``;
//     generateLetter(req, res, reference, createdAt, company, box, mkoa, title, paragraphs, signature, signatory, cheo);
//   }
// );


maombiBaruaController.get(
  "/usajiliWaShuleBarua/:id",

  function (req, res) {
    const reference = "CD.5/315/3169";
    const createdAt = '27/12/2023';
    const company = 'Fedha Boys Secondary School';
    const box = "S.L.P 12999";
    const mkoa = 'Dar es salaam';
    const title = `USAJILI WA SHULE YA AWALI NA MSINGI PARAGON`;
    const signature = 'Sahihi'
    const signatory = "Ephrahim A. Simbeye";
    const cheo = "KAIMU KAMISHNA WA ELIMU";
    const paragraphs = [
      `      Tafadhali rejea somo la barua hii.\n\n\n`,
      `2.    Ninafurahi kukujulisha kuwa shule ya Awali na Msingi <b>Paragon</b> imesajiliwa tarehe <b> 26/10/2023</b> kwa mujibu wa <b>Sheria ya Elimu, Sura ya 353.</b> \n\n`,
      `3.    Shule imepewa namba ya <b>Usajili EM. 20256</b> kuwa shule ya Awali na Msingi na jina <b>Paragon</b> limeidhinishwa. Shule hi imeidhinishwa kuwa ya <b>mkondo mmoja (01), kutwa na mchanganyiko</b>, itakayotumia Lugha ya Kiingereza kufundishia na kujifunzia.\n\n`,
      `4.    Kufuatana na <b>Sheria ya Elimu Sura 353,</b> cheti cha Usajili kiwekwe bayana na Uongozi wa Shule uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa <b>Kamati ya Shule</b> inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na <b>Waraka wa Elimu Na. 10 wa mwaka 2011 usajili wa shule hii utarudiwa baada ya miaka 4. </b>\n\n`,
      `5.    Mmiliki wa Shule atatakiwa kuja kuchukua cheti cha usajili wa shule akiwa na kitambulisho chake mwezi mmoja baada ya kupokea barua hii.\n\n\n`,
      `6.    Ninakutakia utekelezaji mwema.`,
    ];
    const body = ``;
    generateLetter(req, res, application_category_id = null,
      school_name = null,
      school_type_id = null,
      school_type = null, reference, createdAt, company, box, mkoa, paragraphs, signature, signatory, cheo);
  }
);


maombiBaruaController.get(
  "/hudumaYaBweniBarua/:id",

  function (req, res) {
    const reference = "CD.5/315/3169";
    const createdAt = '27/12/2023';
    const company = 'Fedha Boys Secondary School';
    const box = "S.L.P 12999";
    const mkoa = 'Dar es salaam';
    const title = `KIBALI CHA KUTOA HUDUMA YA BWENI KWA SHULE YA SEKONDARI AHMES`;
    const signature = 'Sahihi'
    const signatory = "Ephrahim A. Simbeye";
    const cheo = "KAIMU KAMISHNA WA ELIMU";
    const paragraphs = [
      `      Tafadhali rejea somo la barua hii.\n\n\n`,
      `2.    Napenda kukujulisha kuwa maombi yako ya kibali cha kutoa <b>huduma ya bweni</b> katika shule ya Sekondari <b>AHMES</b> yamekubaliwa. \n\n`,
      `3.    Kibali kimetolewa tarehe <b>26/10/2023</b> kulaza wanafunzi <b>288 Wasichana tu</b>. Unaagizwa kuimarisha hali ya usalama wa wanafunzi ndani na nje ya bweni. Kibali hiki kimetolewa kulaza wanafunzi wa <b>Sekondari tu.</b> \n\n`,
      `4.    Aidha, <b>Wathibiti Ubora wa Shule</b> watafuatilia kuhusu uwekaji vifaa vya zimamoto, viashiria moshi, makabati pamoja na sehemu ya kuteketeza taka <b>(Incinerator)</b>. Pia watafuatilia idadi halisi ya wanafunzi wanaolala ndani ya mabweni ili kuepuka <b>msongamano</b> wa wanafunzi.\n\n`,
      `5.    Kibali hiki kimetolewa kwa mujibu wa <b>Sheria ya Elimu, Sura 353</b>. Kwa masharti kuwa utazingatia mwongozo wa Wizara wa kuanzisha na kusajili shule. \n\n\n`,
      `6.    Ninakutakia utekelezaji mwema.`,
    ];
    const body = ``;
    generateLetter(req, res, application_category_id = null,
      school_name = null,
      school_type_id = null,
      school_type = null, reference, createdAt, company, box, mkoa, paragraphs, signature, signatory, cheo);
  }
);


maombiBaruaController.get(
  "/kutumiaMajengoKuanzishaShuleBarua/:id",

  function (req, res) {
    const reference = "CD.5/315/3169";
    const createdAt = '27/12/2023';
    const company = 'Fedha Boys Secondary School';
    const box = "S.L.P 12999";
    const mkoa = 'Dar es salaam';
    const title = `KIBALI CHA KUTUMIA MAJENGO KUANZISHA SHULE YA AWALI NA MSINGI NURUNJEMA TEGETA`;
    const signature = 'Sahihi'
    const signatory = "Ephrahim A. Simbeye";
    const cheo = "KAIMU KAMISHNA WA ELIMU";
    const paragraphs = [
      `      Tafadhali rejea somo la barua hii.\n\n\n`,
      `2.    Ninafurahi kukufahamisha kuwa kibali cha kutumia majengo kuanzisha shule ya Awali na Msingi <b>Nurunjema Tegeta</b> katika Mtaa wa <b>Nyuki</b>, Kata ya <b>Kunduchi</b>, Halmashauri ya <b>Manispaa ya Kinondoni</b>, Mkoa wa <b>Dar es Salaam</b>, kimetolewa. \n\n`,
      `3.    Kibali hiki kimetolewa kwa mujibu wa <b>Sheria ya Elimu, Sura 353,</b> kwa masharti  kuwa utazingatia mongozo wa Wizara wa kuanzisha na kusajili shule. Unashauriwa kuendelea kuwasiliana na <b>Mhandisi wa Ujenzi wa Halmashauri ya Manispaa</b> kwa ushauri wa kitaalam. \n\n`,
      `4.    Hakikisha jina la Mmiliki wa Shule litakalojazwa katika fomu <b>US.2</b> ya kuomba. Uthibitisho wa mwenye shule liwe lililoko kwenye Hatimiliki ya ardhi au mkataba wa mauziano. Aidha, Meneja atakayependekezwa katika fomu namba <b>US.3</b> awe mwalimu au kama siyo mwalim awe amepata mafunzo ya Vongozi wa Elimu katika Chuo kinachotambulia na Serikali. Awasilishe nakala ya cheti cha taaluma ya Ualimu na wasifu binafsi. \n\n`,
      `5.    <b>Kibali hiki siyo ruhusa ya kuandikisha wanafunzi.</b>\n\n\n`,
      `6.    Ninakutakia utekelezaji mwema.`,
    ];
    const body = ``;
    generateLetter(req, res, application_category_id = null,
      school_name = null,
      school_type_id = null,
      school_type = null, reference, createdAt, company, box, mkoa, paragraphs, signature, signatory, cheo);
  }
);

maombiBaruaController.get(
  "/kubadiliMkondoBarua/:id",

  function (req, res) {
    const reference = "CD.5/315/3169";
    const createdAt = '27/12/2023';
    const company = 'Fedha Boys Secondary School';
    const box = "S.L.P 12999";
    const mkoa = 'Dar es salaam';
    const title = `KIBALI CHA KUTUMIA MAJENGO KUANZISHA SHULE YA AWALI NA MSINGI NURUNJEMA TEGETA`;
    const signature = 'Sahihi'
    const signatory = "Ephrahim A. Simbeye";
    const cheo = "KAIMU KAMISHNA WA ELIMU";
    const paragraphs = [
      `      Tafadhali rejea somo la barua hii.\n\n\n`,
      `2.    Ninafurahi kukufahamisha kuwa kibali cha kutumia majengo kuanzisha shule ya Awali na Msingi <b>Nurunjema Tegeta</b> katika Mtaa wa <b>Nyuki</b>, Kata ya <b>Kunduchi</b>, Halmashauri ya <b>Manispaa ya Kinondoni</b>, Mkoa wa <b>Dar es Salaam</b>, kimetolewa. \n\n`,
      `3.    Kibali hiki kimetolewa kwa mujibu wa <b>Sheria ya Elimu, Sura 353,</b> kwa masharti  kuwa utazingatia mongozo wa Wizara wa kuanzisha na kusajili shule. Unashauriwa kuendelea kuwasiliana na <b>Mhandisi wa Ujenzi wa Halmashauri ya Manispaa</b> kwa ushauri wa kitaalam. \n\n`,
      `4.    Hakikisha jina la Mmiliki wa Shule litakalojazwa katika fomu <b>US.2</b> ya kuomba. Uthibitisho wa mwenye shule liwe lililoko kwenye Hatimiliki ya ardhi au mkataba wa mauziano. Aidha, Meneja atakayependekezwa katika fomu namba <b>US.3</b> awe mwalimu au kama siyo mwalim awe amepata mafunzo ya Vongozi wa Elimu katika Chuo kinachotambulia na Serikali. Awasilishe nakala ya cheti cha taaluma ya Ualimu na wasifu binafsi. \n\n`,
      `5.    <b>Kibali hiki siyo ruhusa ya kuandikisha wanafunzi.</b>\n\n\n`,
      `6.    Ninakutakia utekelezaji mwema.`,
    ];
    const body = ``;
    generateLetter(req, res,
      application_category_id = null,
      school_name = null,
      school_type_id = null,
      school_type = null,
      reference, createdAt, company, box, mkoa, paragraphs, signature, signatory, cheo);
  }
);


function generateLetter(
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
) {
  console.log(paragraphs)
  let doc = new PDFDocument({
    margin: 72,
    size: "A4",
  });
  const imagesPaths = path.join(path.dirname(require.main.filename) + "/public/assets/images");
  const trackingNumber = req.params.id;
  const filename = encodeURIComponent(trackingNumber) + ".pdf";
  res.setHeader("Content-disposition", 'inline; filename="' + filename + '"');
  res.setHeader("Content-type", "application/pdf");

  generateHeader(doc, imagesPaths, reference, created_at, company, box, mkoa);
  doc.text('', { align: 'left' })
  generateTitle(
    doc,
    application_category_id,
    school_type_id,
    school_type,
    school_name
  );
  paragraphs.forEach((paragraph) => generateBody(doc, paragraph));

  doc.text('', { align: 'left' })

  doc.moveDown()
  doc.moveDown()
  doc.moveDown()


  const tableArray = {
    headers: ["Na.", "Jina la Shule", "Namba ya Usajili", "Darasa", "Masharti"],
    rows: [
      ["1.", "Bonde", "S.5790", "ELIMU YA KIDATO CHA I-IV", "Shule imesajiliwa kwa masharti ya kukamilisha maabara 03, ofisi 02, maktaba 01, jengo la utawala, nyumba za walimu na chumba maalum cha wasichana ifikapo Oktoba, 2022"],
      ["1.", "Bonde", "S.5790", "ELIMU YA KIDATO CHA I-IV", "Shule imesajiliwa kwa masharti ya kukamilisha maabara 03, ofisi 02, maktaba 01, jengo la utawala, nyumba za walimu na chumba maalum cha wasichana ifikapo Oktoba, 2022"],
      ["1.", "Bonde", "S.5790", "ELIMU YA KIDATO CHA I-IV", "Shule imesajiliwa kwa masharti ya kukamilisha maabara 03, ofisi 02, maktaba 01, jengo la utawala, nyumba za walimu na chumba maalum cha wasichana ifikapo Oktoba, 2022"],
    ],
  };

  doc.table(tableArray, {
    columnsSize: [40, 60, 80, 120, 230],
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(11),
    prepareRow: () => doc.font("Helvetica").fontSize(8)
  });


  console.log(doc.y);

  generateFooter(doc, signature, signatory, cheo);

  doc.pipe(res);
  doc.end();
}


const generateHeader = (doc, imagesPaths, reference, createdAt, company, box, mkoa) => {
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

const generateTitle = (doc, application_category, school_type_id, school__type, school_name, council) => {
  let title = ``;
  const name = getSchoolType(school_type_id, school__type, school_name);
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
const containsBoldTag = (text) => /<b>(.*?)<\/b>/i.test(text);


const generateBody = (doc, text) => {
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
    doc.font("Times-Roman").text(text, { lineGap: 4, continued: true });
  }

}

const generateFooter = (doc, signature, signatory, cheo) => {
  const lineSize = 174;
  const signatureHeight = doc.y + 50;

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
      doc.page.width / 2 - 100,
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

const getSchoolType = (school_type_id, school_type, school_name) => {
  var name = '';
  if ([1, 2, 3].includes(school_type_id)) {
    name = `Shule ya ${school_type} ${school_name} `;
  } else {
    name = `Chuo cha Ualimu ${school_name}`;
  }
  return name;
};



module.exports = maombiBaruaController;
