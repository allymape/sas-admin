require("dotenv").config();
const express = require("express");
const updateSchoolDetailController = express.Router();
var path = require("path");
const { sendRequest, isAuthenticated, can, activeHandover } = require("../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const editSchoolAPI = API_BASE_URL + "edit-school-detail";
const updateSchoolDeatilsApi = API_BASE_URL + "update-school-detail";

// Edit school details
updateSchoolDetailController.get('/ShuleDetails/:tracking_number/edit' , isAuthenticated , can('update-schools'), activeHandover , (req , res) => {
    sendRequest(req, res, editSchoolAPI+`/${req.params.tracking_number}/edit`, "GET", {}, (jsonData) => {
      var { school_info, languages, school_categories, school_sub_categories, building_structures, genders,
            specializations, registration_structures, curriculums, certificates, sect_names } = jsonData;
      res.render(path.join(__dirname + "/../design/schools/edit"), {
            req,
            school_info,
            languages,
            school_categories,
            school_sub_categories,
            building_structures,
            genders,
            specializations,
            registration_structures,
            curriculums,
            certificates,
            sect_names,
      });
    });
});
// Update SchoolDetails
updateSchoolDetailController.post('/ShuleDetails/:tracking_number', isAuthenticated , can('update-schools') , activeHandover , (req, res) => {
  const tracking_number = req.params.tracking_number 
  sendRequest(req, res, updateSchoolDeatilsApi+`/${tracking_number}`, "PUT", req.body, (jsonData) => {
      var { statusCode , message } = jsonData;
      req.flash("statusCode" , statusCode)
      req.flash("message", message)
      res.redirect(`/ShuleDetails/${tracking_number}/Edit`);
    });
});

module.exports = updateSchoolDetailController;
