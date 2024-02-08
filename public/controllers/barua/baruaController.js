require("dotenv").config();
const express = require("express");

const baruaController = express.Router();
const cors = require("cors");
var session = require("express-session");
const { isAuthenticated, sendRequest,  generateLetter, bodyContent, formatDate, decodeSignature, can } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const baruaDetailsAPI = API_BASE_URL + "barua";

baruaController.get("/barua/:tracking_number", cors(), isAuthenticated,can('view-letters') ,function (req, res) {
        const tracking_number = req.params.tracking_number;
        const uthibitisho = req.query.type;
        const formData = {
          type: uthibitisho,
        };
        // console.log(type)
        sendRequest(req , res , baruaDetailsAPI +"/"+ tracking_number , 'POST' , formData , (jsonData) => {
          const { statusCode, data, sqa_zone_region } = jsonData;
          // console.log(data)
          if(statusCode == 300){
            const {
              school_name,
              old_school_name,
              owner_name,
              old_owner_name,
              manager_name,
              old_manager_name,
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
              address_region,
              region,
              district,
              zone_name,
              registration_number,
              registration_date,
              subcategory,
              stream,
              old_stream,
              language,
              combinations,
              number_of_students,
              gender_types,
              level,
              ward,
              signatory, 
              base64signature , 
              cheo,
              zone_box,
              region_box,
              district_box,
              district_sqa_box
            } = data;
            decodeSignature(base64signature, tracking_number);
            const reference = `${file_number}/${school_folio}/${folio}`;
            const createdAt = approved_at != undefined ? formatDate(approved_at , 'DD/MM/YYYY'): null;
            const box = address_box;
            const region_address = address_region;
            const registry_type = registry_type_id;
            const school_region = region;
            const school_council = district;
            const letter = bodyContent(
              application_category_id, //Aina ya Ombi Kuanzisha, Umiliki na Meneja
              registry_type,
              school_name,
              old_school_name,
              school_category_id,
              category, // Aina ya Shule Sekendari, Msingi n.k
              createdAt,
              registration_number,
              registration_date
                ? formatDate(registration_date, "DD/MM/YYYY")
                : "",
              uthibitisho,
              owner_name,
              old_owner_name,
              manager_name,
              old_manager_name,
              school_region,
              school_council,
              subcategory,
              stream,
              old_stream,
              language,
              ward,
              combinations,
              number_of_students,
              gender_types
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
              tracking_number,
              application_category_id, //Aina ya Ombi Kuanzisha, Umiliki na Meneja
              reference,
              createdAt,
              address_name,
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
            );
          }else{
            // res.status(404).send();
            res.redirect('/404')
          }
      
    })
   
  }
);

module.exports = baruaController;
