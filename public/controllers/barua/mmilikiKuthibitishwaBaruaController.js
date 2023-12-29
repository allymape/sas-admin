require("dotenv").config();
const express = require("express");

const PDFDocument = require("pdfkit");


const mmilikiKuthibitishwaBaruaController = express.Router();

var session = require("express-session");
const { isAuthenticated, sendRequest, can, formatParagraph, generateLetter } = require("../../../util");
const { createBody, bodyContent } = require("../../design/maombi/barua/baruaBodyTemplate");
const API_BASE_URL = process.env.API_BASE_URL;

const baruaDetailsAPI = API_BASE_URL + "barua";

mmilikiKuthibitishwaBaruaController.get("/mmilikiShuleBarua/:tracking_number",
  function (req, res) {
    const tracking_number = req.params.tracking_number;
    sendRequest(req , res , baruaDetailsAPI +"/"+ tracking_number , 'POST' , {} , (jsonData) => {
         console.log(jsonData)
    })
    // const reference = "CD.5/315/3169";
    // const createdAt = '27/12/2023';
    // const company = 'Fedha Boys Secondary School';
    // const box = "S.L.P 12999";
    // const mkoa = 'Dar es salaam';
    // const signature = 'Sahihi'
    // const signatory = "Ephrahim A. Simbeye";
    // const cheo = "KAIMU KAMISHNA WA ELIMU";
    // const application_category_id = 1;
    // const school_type_id = 4;
    // const school_type = 'Sekondari';
    // const paragraphs = bodyContent(application_category_id)
    // const school_name = `Fedha Boys`
    // generateLetter(
    //   req,
    //   res,
    //   application_category_id,
    //   school_name,
    //   school_type_id,
    //   school_type,
    //   reference,
    //   createdAt,
    //   company,
    //   box,
    //   mkoa,
    //   paragraphs,
    //   signature,
    //   signatory,
    //   cheo
    // );
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
