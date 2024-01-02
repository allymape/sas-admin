require("dotenv").config();
const express = require("express");

const PDFDocument = require("pdfkit");


const baruaController = express.Router();

var session = require("express-session");
const { isAuthenticated, sendRequest,  generateLetter, bodyContent, formatDate } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const baruaDetailsAPI = API_BASE_URL + "barua";

baruaController.get("/barua/:tracking_number",
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
          district,
          registration_number,
          registration_date,
          subcategory,
          stream,
          old_stream,
          language,
          level,
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
          category, // Aina ya Shule Sekendari, Msingi n.k
          createdAt,
          registration_number,
          registration_date ? formatDate(registration_date, "DD/MM/YYYY") : "",
          type,
          owner_name,
          manager_name,
          school_region,
          school_council,
          subcategory,
          stream,
          old_stream,
          language
        );

        const paragraphs = letter.bodyContent;
        const title = letter.title;
        const table = {
                        headers : [`Na.`, "Jina la Shule", "Namba ya Usajili", "Darasa", "Masharti"],
                        rows : [
                                  [
                                   "1.", 
                                  school_name, 
                                  registration_number, 
                                  `${category} ${level}`, 
                                  `Shule imesajiliwa kwa masharti ya kukamilisha maabara 03, ofisi 02, maktaba 01, jengo la utawala, nyumba za walimu na chumba maalum cha wasichana ifikapo Oktoba, 2022`],
                                ]
                      }
        generateLetter(
          req,
          res,
          application_category_id, //Aina ya Ombi Kuanzisha, Umiliki na Meneja
          school_name,
          school_category_id,
          category, // Aina ya Shule Sekendari, Msingi n.k
          reference,
          createdAt,
          address_name,
          box,
          region_address,
          title,
          paragraphs,
          signature,
          signatory,
          cheo,
          table,
          registry_type
        );
      }else{
        // res.status(404).send();
        res.redirect('/404')
      }
      
    })
   
  }
);

module.exports = baruaController;
