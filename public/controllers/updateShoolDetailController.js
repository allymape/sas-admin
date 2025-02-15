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

// View School Details
updateSchoolDetailController.get("/ShuleDetails/:tracking_number" , isAuthenticated , can('view-school-details') , activeHandover, (req, res) => {
  //View Screen
  getSchoolDetails(req, res, (responseData) => {
    res.render(path.join(__dirname + "/../design/schools/show"), responseData);
  });
})
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
      res.render(path.join(__dirname + "/../design/schools/edit"), responseData);
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
          req,
        });
      } else {
        res.status(statusCode).redirect("/404");
      }
    }
  );
}
// Update SchoolDetails
updateSchoolDetailController.post('/ShuleDetails/:tracking_number', isAuthenticated , can('update-school-details') , activeHandover , (req, res) => {
  const tracking_number = req.params.tracking_number 
  sendRequest(req, res, updateSchoolDeatilsApi+`/${tracking_number}`, "PUT", req.body, (jsonData) => {
      var { statusCode , message } = jsonData;
      req.flash("statusCode" , statusCode)
      req.flash("message", message)
      res.redirect(`/ShuleDetails/${tracking_number}/Edit`);
    });
});

module.exports = updateSchoolDetailController;
