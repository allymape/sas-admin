require("dotenv").config();
const express = require("express");

const baruaController = express.Router();
const he = require("he")
const cors = require("cors");
var session = require("express-session");
const { isAuthenticated, sendRequest,  generateLetter, bodyContent, formatDate, decodeSignature, can } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const baruaDetailsAPI = API_BASE_URL + "barua";

const COMMON_REQUIRED_FIELDS = [
  "application_category_id",
  "registry_type_id",
  "school_category_id",
  "school_name",
  "approved_at",
  "file_number",
  "folio",
  "address_title",
  "address_name",
  "address_box",
  "address_region",
  "region",
  "district",
  "ward",
  "signatory",
  "cheo",
  "zone_name",
  "zone_box",
  "region_box",
  "district_box",
  "district_sqa_box",
  "ngazi_ya_wilaya",
];

const CATEGORY_REQUIRED_FIELDS = {
  2: (type) => (type === "meneja" ? ["manager_name"] : ["owner_name"]),
  4: ["registration_number", "level", "category"],
  5: ["stream", "old_stream"],
  6: ["category", "old_category"],
  7: ["owner_name", "old_owner_name", "registration_number"],
  8: ["manager_name", "old_manager_name"],
  9: ["old_school_name"],
  10: [
    "t_street",
    "t_ward",
    "t_district",
    "t_region",
    "t_old_street",
    "t_old_ward",
    "t_old_district",
    "t_old_region",
  ],
  12: ["combinations", "gender_type"],
  13: ["number_of_students"],
  14: ["number_of_students", "gender_type"],
};

const isMissingValue = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

const getCategoryRequiredFields = (categoryId, type) => {
  const configured = CATEGORY_REQUIRED_FIELDS[Number(categoryId)];
  if (!configured) return [];
  return typeof configured === "function" ? configured(type) : configured;
};

const validateLetterPayload = (data, type) => {
  const categoryId = Number(data?.application_category_id || 0);
  const requiredFields = [
    ...COMMON_REQUIRED_FIELDS,
    ...getCategoryRequiredFields(categoryId, type),
  ];
  const missingFields = [...new Set(requiredFields)].filter((field) =>
    isMissingValue(data?.[field])
  );
  return { categoryId, missingFields };
};

baruaController.get("/barua/:tracking_number", cors(), isAuthenticated,can('view-letters') ,function (req, res) {
        const tracking_number = req.params.tracking_number;
        const uthibitisho = req.query.type;
        const formData = {
          type: uthibitisho,
        };
        // console.log(type)
        sendRequest(req , res , baruaDetailsAPI +"/"+ tracking_number , 'POST' , formData , (jsonData) => {
          const { statusCode, data, sqa_zone_region, warnings } = jsonData;
          if(statusCode == 300){
            if (!data) {
              console.error("[BARUA][ADMIN][ERROR]", {
                tracking_number,
                type: uthibitisho || "",
                statusCode,
                message: "API imerudisha statusCode 300 lakini data ya barua ni tupu.",
                warnings: warnings || null,
              });
              return res.redirect('/404');
            }

            if (warnings) {
              console.error("[BARUA][ADMIN][ERROR]", {
                tracking_number,
                type: uthibitisho || "",
                statusCode,
                message: "Barua inaoneshwa pamoja na mapungufu ya data yaliyotoka API.",
                warnings,
              });
            }

            const validation = validateLetterPayload(data, uthibitisho);
            if (validation.missingFields.length > 0) {
              console.error("[BARUA][ADMIN][ERROR]", {
                tracking_number,
                type: uthibitisho || "",
                application_category_id: validation.categoryId || null,
                message: "Barua inaoneshwa pamoja na mapungufu ya data.",
                missing_fields: validation.missingFields,
              });
            }

            const {
              school_name,
              old_school_name,
              owner_name,
              old_owner_name,
              manager_name,
              old_manager_name,
              category,
              old_category,
              approved_at,
              file_number,
              school_folio,
              folio,
              registry_type_id,
              school_category_id,
              application_category_id,
              address_title,
              address_name,
              address_box,
              address_region,
              region,
              district,
              ngazi_ya_wilaya,
              zone_name,
              registration_number,
              registration_date,
              subcategory,
              stream,
              old_stream,
              language,
              combinations,
              number_of_students,
              gender_type,
              level,
              ward,
              signatory,
              base64signature,
              cheo,
              zone_box,
              region_box,
              district_box,
              district_sqa_box,
              masharti,
              t_street,
              t_ward,
              t_district,
              t_region,
              t_old_region,
              t_old_district,
              t_old_ward,
              t_old_street,
            } = data;
      
            // decodeSignature(base64signature, tracking_number);
            const reference = `${file_number}/${folio}`;
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
              ngazi_ya_wilaya,
              subcategory,
              stream,
              old_stream,
              language,
              ward,
              combinations,
              number_of_students,
              gender_type,
              category,
              old_category,
              t_street,
              t_ward,
              t_district,
              t_region,
              t_old_region,
              t_old_district,
              t_old_ward,
              t_old_street
            );

            const paragraphs = letter.bodyContent;
            const title = letter.title;
            const table = {
              headers: [
                `Na.`,
                "Jina la Shule",
                "Namba ya Usajili",
                "Darasa",
                "Masharti",
              ],
              rows: [
                [
                  "1.",
                  school_name,
                  registration_number,
                  `${category} (${level})`,
                  `${typeof masharti != "undefined" && masharti ? he.decode(masharti.replaceAll(/<\/?[^>]+(>|$)/gi, "").replace(/^(&nbsp;)+/, "") ) : ""}`,
                ],
              ],
            };
            generateLetter(
              req,
              res,
              base64signature,
              application_category_id, //Aina ya Ombi Kuanzisha, Umiliki na Meneja
              reference,
              createdAt,
              address_title,
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
              district_sqa_box,
              school_category_id,
              ngazi_ya_wilaya
            );
          }else{
            console.error("[BARUA][ADMIN][ERROR]", {
              tracking_number,
              type: uthibitisho || "",
              statusCode,
              message: jsonData?.message || "Imeshindikana kupata data ya barua.",
              causes: jsonData?.causes || [],
            });
            res.redirect('/404')
          }
      
    })
   
  }
);

module.exports = baruaController;
