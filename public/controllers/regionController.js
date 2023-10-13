require("dotenv").config();
const express = require("express");
const request = require("request");
const regionController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated } = require("../../util");
var API_BASE_URL      = process.env.API_BASE_URL;
var mikoaListAPI      = API_BASE_URL + "regions";
var regionsAPI = API_BASE_URL + "lookup-regions";
var VutaMikoaListAPI  = API_BASE_URL + "usajiliMikoa";
var mkoaKandaAPI      = API_BASE_URL + "assign-region-zone";
var zonesApi      = API_BASE_URL + "allZones";


regionController.get("/Mikoa", isAuthenticated, can('view-regions'), function (req, res) {
            sendRequest(req , res , zonesApi , 'GET' , { is_paginated : false } , (jsonData) => {
                if(jsonData.statusCode == 300){
                  res.render(path.join(__dirname + "/../design/mikoa"), {
                  req: req,
                  zones: jsonData.data,
                  useLev: req.session.UserLevel,
                  userName: req.session.userName,
                  RoleManage: req.session.RoleManage,
                  userID: req.session.userID,
                  cheoName: req.session.cheoName,
                });
                }
            }); 
});

regionController.get("/MikoaList", isAuthenticated, can('view-regions'), function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
   
    sendRequest(req, res, mikoaListAPI + "?page=" + page + "&per_page=" + per_page, "GET", req.query , (jsonData) => {
        var data = jsonData.data;
        var numRows = jsonData.numRows;
        // console.log(data);
        res.send({
        statusCode: jsonData.statusCode,
        regions: data,
        pagination: {
            total: numRows,
            current: page,
            per_page: per_page,
            pages: Math.ceil(numRows / per_page),
        },
        });
  });
});

regionController.get("/LookupRegion", isAuthenticated, function (req, res) {
    sendRequest(req, res, regionsAPI , "GET", req.query , (jsonData) => {
        var data = jsonData.data;
        res.send({
            statusCode: jsonData.statusCode,
            regions: data,
        });
  });
});

regionController.post("/VutaMikoa", isAuthenticated, can('create-regions'), function (req, res) {
    sendRequest(req, res, VutaMikoaListAPI, "POST", {}, (jsonData) => {
        res.send({ 
            statusCode: jsonData.statusCode, 
            message: jsonData.message 
        });
    });
});
regionController.post("/MkoaKanda", isAuthenticated, can('update-regions'), function (req, res) {
    var formData = {
                    browser_used: req.session.browser_used,
                    ip_address: req.session.ip_address,
                    kanda: req.body.kanda,
                    regionId: req.body.regionId,
                  };
    sendRequest(req, res, mkoaKandaAPI, "POST", formData , (jsonData) => {
          res.send({
                statusCode: jsonData.statusCode,
                message: jsonData.message,
          });
    });
});


module.exports = regionController;