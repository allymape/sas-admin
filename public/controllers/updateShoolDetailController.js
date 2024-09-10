require("dotenv").config();
const express = require("express");
const updateSchoolDetailController = express.Router();
var path = require("path");
const { sendRequest, isAuthenticated, can, activeHandover } = require("../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const editSchoolAPI = API_BASE_URL + "edit-school-detail";

// Page
updateSchoolDetailController.get('/Shule/:tracking_number/edit' , isAuthenticated , can('update-schools'), activeHandover , (req , res) => {
    sendRequest(req, res, editSchoolAPI+`/${req.params.tracking_number}/edit`, "GET", {}, (jsonData) => {
      var { school_info } = jsonData;
      res.render(path.join(__dirname + "/../design/schools/edit"), {
        req,
        school_info
      });
    });
    
});
module.exports = updateSchoolDetailController;
