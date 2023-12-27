require("dotenv").config();
const express = require("express");
const request = require("request");
const reportMabadilikoRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, exportJSONToExcel } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;
const requestRiportBadiliMikondoAPI = API_BASE_URL + "ripoti-badili-mikondo";
const requestRiportBadiliUsajiliAPI = API_BASE_URL + "ripoti-badili-usajili";
const requestRiportHamishaShuleAPI = API_BASE_URL + "ripoti-hamisha-shule";
const requestRiportKubadiliUmilikiAPI = API_BASE_URL + "ripoti-badili-umiliki";
const requestRiportKubadiliMenejaAPI = API_BASE_URL + "ripoti-badili-meneja";
const requestRiportKubadiliJinaAPI = API_BASE_URL + "ripoti-badili-jina";
const requestRiportFutaShuleAPI = API_BASE_URL + "ripoti-kufuta-shule";
const requestRiportBadiliDahaliaAPI = API_BASE_URL + "ripoti-badili-dahalia";
const requestRiportBadiliTahasusiAPI = API_BASE_URL + "ripoti-badili-tahasusi";
const requestRiportBadiliBweniAPI = API_BASE_URL + "ripoti-badili-bweni";

// Mikondo
reportMabadilikoRequestController.get("/RipotiKuongezaMikondo",isAuthenticated,can("view-addition-of-streams-report"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportBadiliMikondoAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/mikondo"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKuongezaMikondo",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);
// Uhamisho
reportMabadilikoRequestController.get("/RipotiKuhamishaShule",isAuthenticated,can("view-change-school-location"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportHamishaShuleAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/kuhamisha"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKuhamishaShule",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);

// Usajili
reportMabadilikoRequestController.get("/RipotiKubadiliUsajili",isAuthenticated,can("view-change-registration-type"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportBadiliUsajiliAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/usajili"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKubadiliUsajili",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);

// Umiliki
reportMabadilikoRequestController.get("/RipotiKubadiliUmiliki",isAuthenticated,can("view-change-school-owners-report"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportKubadiliUmilikiAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/mmiliki"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKubadiliUmiliki",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);

// Meneja
reportMabadilikoRequestController.get("/RipotiKubadiliMeneja",isAuthenticated,can("view-change-school-managers-report"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportKubadiliMenejaAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/meneja"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKubadiliMeneja",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);
// Jina
reportMabadilikoRequestController.get("/RipotiKubadiliJina",isAuthenticated,can("view-change-school-name-report"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportKubadiliJinaAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/jina"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKubadiliJina",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);

// Kufuta
reportMabadilikoRequestController.get("/RipotiKufutaShule",isAuthenticated,can("view-deregistration-report"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportFutaShuleAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/kufuta"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKufutaShule",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);

// Tahasusi
reportMabadilikoRequestController.get("/RipotiKuongezaTahasusi", isAuthenticated, can("view-addition-of-bias-report"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportBadiliTahasusiAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/tahasusi"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKuongezaTahasusi",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);

// Dahalia
reportMabadilikoRequestController.get("/RipotiKuongezaDahalia",isAuthenticated,can("view-addition-of-combinations-report"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportBadiliDahaliaAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/dahalia"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKuongezaDahalia",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);

// Bweni
reportMabadilikoRequestController.get("/RipotiKuongezaBweni",isAuthenticated,can("view-addition-of-domitory-report"),
  function (req, res) {
    const per_page = req.query.export == "true" && req.query.max ? Number(req.query.max) : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number
    const date_range = req.query.date_range
    const category = req.query.category
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;
    const formData = {
            page,
            per_page,
            tracking_number,
            status,
            date_range,
            category,
            ownership,
            structure,
            region,
            district,
            ward,
            street
    };
    sendRequest(req,res,requestRiportBadiliBweniAPI, "GET", formData, (jsonData) => {
        const { data , numRows, categories, structures, ownerships, regions } = jsonData;
        if(req.query.export == 'true'){
           data.forEach( (item) => { delete item.status })
           exportJSONToExcel(res, data);
        }else{
           res.render(
             path.join(__dirname + "/../../design/reports/mabadiliko/bweni"),
             {
               req: req,
               data: data,
               categories,
               structures,
               ownerships,
               regions,
               pagination: {
                 total: numRows,
                 current: page,
                 per_page: per_page,
                 url: "RipotiKuongezaBweni",
                 pages: Math.ceil(numRows / per_page),
               },
             }
           );
        }
       
      }
    );
  }
);

module.exports = reportMabadilikoRequestController;
