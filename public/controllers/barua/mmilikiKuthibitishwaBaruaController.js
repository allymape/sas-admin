require("dotenv").config();
const express = require("express");

const PDFDocument = require("pdfkit");


const mmilikiKuthibitishwaBaruaController = express.Router();

var session = require("express-session");
const { isAuthenticated, sendRequest,  generateLetter, bodyContent, formatDate } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const baruaDetailsAPI = API_BASE_URL + "barua";

mmilikiKuthibitishwaBaruaController.get("/uthibitishoMenejaShuleBarua/:tracking_number",
  function (req, res) {
    const tracking_number = req.params.tracking_number;
    const type = req.query.type;
    const formData = {
         type : type
    }
    sendRequest(req , res , baruaDetailsAPI +"/"+ tracking_number , 'POST' , formData , (jsonData) => {
     
      const {statusCode , data } = jsonData;
      console.log(statusCode)
      if(statusCode == 300){
        const {
          school_name,
          owner_name,
          manager_name,
          category,
          approved_at,
          file_number,
          school_folio,
          folio,
          registry_type_id,
          school_category_id,
          application_category_id,
          address_name,
          address_box,
          region,
          district
        } = data;
        console.log(data)
        const reference = `${file_number}/${school_folio}/${folio}`;
        const createdAt = formatDate(approved_at , 'DD/MM/YYYY');
        const box = "S.L.P "+address_box;
        const region_address = "Dar es salaam";
        const signature = "Sahihi";
        const signatory = "Ephrahim A. Simbeye";
        const cheo = "KAIMU KAMISHNA WA ELIMU";
        const registry_type = registry_type_id;
        const school_region = region;
        const school_council = district;
        const letter = bodyContent(
              application_category_id, //Aina ya Ombi Kuanzisha, Umiliki na Meneja
              registry_type,
              school_name,
              school_category_id,
              category,  // Aina ya Shule Sekendari, Msingi n.k
              createdAt,
              type,
              owner_name,
              manager_name,
              school_region,
              school_council
        );

        const paragraphs = letter.bodyContent;
        const title = letter.title;
        generateLetter(
          req,
          res,
          application_category_id, //Aina ya Ombi Kuanzisha, Umiliki na Meneja
          school_name,
          school_category_id,
          category,  // Aina ya Shule Sekendari, Msingi n.k
          reference,
          createdAt,
          address_name,
          box,
          region_address,
          title,
          paragraphs,
          signature,
          signatory,
          cheo
        );
      }else{
        // res.status(404).send();
        res.redirect('/404')
      }
      
    })
   
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
