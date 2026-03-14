require("dotenv").config();
const express = require("express");
const updateSchoolDetailController = express.Router();
var path = require("path");
const { sendRequest, isAuthenticated, can, activeHandover, updateWindowMiddleware } = require("../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const getSchoolAPI = API_BASE_URL + "get-school-detail";
const updateSchoolDeatilsApi = API_BASE_URL + "update-school-detail";
const startDate = new Date(process.env.START_DATE || "2025-02-01");
const endDate = new Date(process.env.END_DATE ||  "2025-02-10");
const { body, validationResult } = require("express-validator");

const validateSchoolDetails = [
  // Validate required fields
  body("stream")
    .optional() // Stream is optional
    .custom((value) => {
      if (
        value !== "" &&
        (!Number.isInteger(Number(value)) || Number(value) < 1)
      ) {
        throw new Error("Idadi ya Mkono inatakiwa kuwa namba na isiwe chini ya 1.");
      }
      return true;
    }),
  body("number_of_students")
    .notEmpty()
    .withMessage("Idadi ya Wanafunzi inatakiwa kujazwa.")
    .isInt({ min: 0 })
    .withMessage("Idadi ya Wanafunzi inatakiwa kuwa namba na isiwe chini ya 0."),
  body("number_of_teachers")
    .notEmpty()
    .withMessage("Number of teachers is required.")
    .isInt({ min: 0 })
    .withMessage("Idadi ya Walimu inatakiwa kuwa namba na isiwe chini ya 0."),
  body("school_phone")
    .optional()
    .custom((value) => {
      const phoneRegex = /^0\d{9}$/; // Ensures "0xxxnnnnnn" format (10 digits starting with 0)
      if (!phoneRegex.test(value)) {
        throw new Error("Namba ya simu sio sahii. weka kwa muundo huu: 0xxx######");
      }
      return true;
    }),
  body("email").optional().isEmail().withMessage("Baruapepe iliyoingizwa sio sahihi."),
  // "institution_name" is required only if it exists in req.body
  body("institution_name")
    .if(body("institution_name").exists()) // Apply rule only if present
    .notEmpty()
    .withMessage("Jina la Taasisi linapaswa kujazwa."),
  // "ward" is required only if it exists in req.body
  body("ward")
    .if(body("ward").exists()) // Apply rule only if present
    .notEmpty()
    .withMessage("Jaza taarifa ya Kata kwa Taasisi."),
  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("statusCode", 400);
      req.flash(
        "message",
        errors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
      return res.redirect(`/ShuleDetails/${req.params.tracking_number}/Edit`);
    }
    next();
  },
];

// View School Details
updateSchoolDetailController.get(
  "/ShuleDetails/:tracking_number",
  isAuthenticated,
  can("view-school-details"),
  activeHandover,
  (req, res) => {
    //View Screen
    getSchoolDetails(req, res, (responseData) => {
      res.render(
        path.join(__dirname + "/../views/schools/show"),
        responseData
      );
    });
  }
);
// Edit school details
updateSchoolDetailController.get(
  "/ShuleDetails/:tracking_number/edit",
  isAuthenticated,
  can("edit-school-details"),
  activeHandover,
  updateWindowMiddleware(startDate , endDate),
  (req, res) => {
    // Edit Screen
    getSchoolDetails(req , res , (responseData) => {
      responseData[
        "window_closed"
      ] = `Kumbuka: Dirisha la kufanya mabadiliko litafungwa tarehe ${endDate}. Tafadhali kamilisha shughuli zako mapema ili kuepuka usumbufu.`;
      res.render(path.join(__dirname + "/../views/schools/edit"), responseData);
    } , true);
  }
);
//get schools
function getSchoolDetails(req , res , callback , edit =  false){
  sendRequest(
    req,
    res,
    getSchoolAPI + `/${req.params.tracking_number}`,
    "GET",
    {},
    (jsonData) => {
      var {
        statusCode,
        message,
        school_info,
        institute_info,
        languages,
        school_categories,
        school_sub_categories,
        building_structures,
        registry_types,
        genders,
        specializations,
        combinations,
        school_combinations,
        registration_structures,
        curriculums,
        certificates,
        sect_names,
        owner,
        manager,
        denominations,
        ownership_sub_types,
        regions
      } = jsonData;
      if (statusCode == 300) {
        callback({
          school_info,
          institute_info,
          languages,
          school_categories,
          school_sub_categories,
          building_structures,
          registry_types,
          genders,
          specializations,
          combinations,
          school_combinations,
          registration_structures,
          curriculums,
          certificates,
          sect_names,
          owner,
          manager,
          ownership_sub_types,
          denominations,
          edit,
          regions,
          req,
        });
      } else {
        res.status(statusCode).redirect("/404");
      }
    }
  );
}
// Update SchoolDetails
updateSchoolDetailController.post('/ShuleDetails/:tracking_number', isAuthenticated, validateSchoolDetails , can('update-school-details') , activeHandover , (req, res) => {
  const tracking_number = req.params.tracking_number 
  sendRequest(req, res, updateSchoolDeatilsApi+`/${tracking_number}`, "PUT", req.body, (jsonData) => {
      var { statusCode , message } = jsonData;
      req.flash("statusCode" , statusCode)
      req.flash("message", message)
      res.redirect(`/ShuleDetails/${tracking_number}/Edit`);
    });
});

module.exports = updateSchoolDetailController;
