require("dotenv").config();
const express = require("express");

const PDFDocument = require("pdfkit");


const mmilikiKuthibitishwaBaruaController = express.Router();

var session = require("express-session");
const { isAuthenticated, sendRequest, can, formatParagraph, generateLetter } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;

const mmiliShuleDetails = API_BASE_URL + "ripoti-wamiliki-shule";

mmilikiKuthibitishwaBaruaController.get(
  "/mmilikiShuleBarua/:id",

  function (req, res) {
    const reference = "CD.5/315/3169";
    const createdAt = '27/12/2023';
    const company = 'Fedha Boys Secondary School';
    const box = "S.L.P 12999";
    const mkoa = 'Dar es salaam';
    const title = `UTHIBITISHO WA MENEJA WA SHULE YA AWALI NA MSINGI FEDHA BOYS`;
    const signature = 'Sahihi'
    const signatory = "Ephrahim A. Simbeye";
    const cheo = "KAIMU KAMISHNA WA ELIMU";
    const paragraphs = [
                    `      Tafadhali rejea somo la barua hii.\n\n\n`,
                    `2.    Ninafurahi kukufahimisha kuwa uthibitisho umetolewa kwa <b>Zainabu Ally</b> Mweta kuwa Meneja wa Shule ya Awali na Msingi <b>Fedha Boys</b>\n\n`,
                    `3.    Uthibitisho huu umetolewa tarehe <b>27/12/2023</b> kwa mujibu wa <b>Sheria ya Elimu, Sura 353.</b> Utaindesha shule hii kwa kuzingatia <b>Sheria, Kanuni, Taratibu na Miongozo</b> ya Wizara ya Elimu, Sayansi na Teknolojia. Hakikisha shule ina <b>kasiki</b> kwa ajili ya kuhifadhia nyaraka nyeti.\n\n`,
                    `4.    Uthibitisho huu siyo kibali cha kusajili Wanafunzi.\n\n\n`,
                    `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
    ];
    const body = ``;
    generateLetter(req , res , reference, createdAt, company , box , mkoa , title , paragraphs , signature , signatory , cheo);
  }
);



function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
  doc.fontSize(10)
    .text(c1, 50, y)
    .text(c2, 150, y)
    .text(c3, 280, y, { width: 90, align: 'right' })
    .text(c4, 370, y, { width: 90, align: 'right' })
    .text(c5, 0, y, { align: 'right' });
}



module.exports = mmilikiKuthibitishwaBaruaController;
