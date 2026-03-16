require("dotenv").config();
const express = require("express");
const moduleController = express.Router();
const path = require("path");
const { sendRequest, can, isAuthenticated, activeHandover } = require("../../util");

const API_BASE_URL = process.env.API_BASE_URL;
const allModulesAPI = API_BASE_URL + "allModules";
const addModuleAPI = API_BASE_URL + "addModule";
const editModuleAPI = API_BASE_URL + "editModule";
const updateModuleAPI = API_BASE_URL + "updateModule";
const deleteModuleAPI = API_BASE_URL + "deleteModule";

// Get all modules
moduleController.get("/Modules", isAuthenticated, can("view-permissions"), activeHandover, function (req, res) {
  getAllModules(req, res);
});

// Store module
moduleController.post("/tengenezaModule", isAuthenticated, can("create-permissions"), function (req, res) {
  const formData = {
    module_name: req.body.module_name,
    display_name: req.body.display_name,
  };

  sendRequest(req, res, addModuleAPI, "POST", formData, (body) => {
    const statusCode = body.statusCode;
    const message = body.message;
    req.flash(statusCode == 300 ? "success" : "error", message);
    res.redirect("/Modules");
  });
});

// Edit module
moduleController.get("/Modules/:id", isAuthenticated, can("update-permissions"), function (req, res) {
  const id = Number(req.params.id);
  sendRequest(req, res, `${editModuleAPI}/${id}`, "GET", {}, (jsonData) => {
    getAllModules(req, res, true, jsonData?.data || []);
  });
});

// Update module
moduleController.post("/badiliModule/:id", isAuthenticated, can("update-permissions"), function (req, res) {
  const id = Number(req.params.id);
  const formData = {
    module_name: req.body.module_name,
    display_name: req.body.display_name,
    status: req.body.status,
  };

  sendRequest(req, res, `${updateModuleAPI}/${id}`, "PUT", formData, (jsonData) => {
    const statusCode = jsonData.statusCode;
    const message = jsonData.message;
    req.flash(statusCode == 300 ? "success" : "error", message);
    statusCode == 300 ? res.redirect("/Modules") : res.redirect(`/Modules/${id}`);
  });
});

// Delete module
moduleController.post("/futaModule/:id", isAuthenticated, can("delete-permissions"), function (req, res) {
  const id = Number(req.params.id);
  sendRequest(req, res, `${deleteModuleAPI}/${id}`, "DELETE", {}, (jsonData) => {
    const statusCode = jsonData.statusCode;
    const message = jsonData.message;
    req.flash(statusCode == 300 ? "success" : "error", message);
    res.redirect("/Modules");
  });
});

function getAllModules(req, res, edit = false, editedData = null) {
  const per_page = Number(req.query.per_page || 10);
  const page = Number(req.query.page || 1);
  const url = `${allModulesAPI}?page=${page}&per_page=${per_page}`;
  const formData = {
    browser_used: req.session.browser_used,
    ip_address: req.session.ip_address,
    useLevel: req.session.UserLevel,
    office: req.session.office,
    tafuta: req.query.tafuta,
  };

  sendRequest(req, res, url, "GET", formData, (jsonData) => {
    if (jsonData === undefined) return;

    const statusCode = jsonData.statusCode;
    const data = jsonData.data;
    const numRows = jsonData.numRows;

    if (statusCode == 300) {
      res.render(path.join(__dirname + "/../views/modules"), {
        req: req,
        data: data,
        useLev: req.session.UserLevel,
        userName: req.session.userName,
        RoleManage: req.session.RoleManage,
        userID: req.session.userID,
        cheoName: req.session.cheoName,
        edit: edit,
        eModule: editedData,
        pagination: {
          total: Number(numRows),
          current: Number(page),
          per_page: Number(per_page),
          url: "Modules",
          pages: Math.ceil(Number(numRows) / Number(per_page)),
        },
      });
    }

    if (statusCode == 209) {
      res.redirect("/");
    }
  });
}

module.exports = moduleController;

