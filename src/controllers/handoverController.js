require("dotenv").config();
const express = require("express");

const handoverController = express.Router();
const { sendRequest, modifiedUrl, isAuthenticated } = require("../../util");
const path  = require("path");
const API_BASE_URL = process.env.API_BASE_URL;
const handoverListAPI = API_BASE_URL + "handover-list";
const createHandoverAPI = API_BASE_URL+"handover";
const stopHandoverAPI = API_BASE_URL+"stop-handover";

handoverController.get("/MyHandover", isAuthenticated, function (req, res) {
    const per_page = Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const params = {
        per_page,
        page
    }
    sendRequest(req , res , handoverListAPI+ "?page=" + page + "&per_page=" + per_page , "GET" , params , (jsonData) => {
        const { handovers, activeHandover, numRows, statusCode } = jsonData;
        // req.originalUrl = "/Profile";
        // console.log(req.originalUrl);
        res.send({
          statusCode,
          data: statusCode == 300 ? handovers : [],
          activeHandover : statusCode == 300 ? activeHandover : false,
          pagination: {
            total: Number(numRows),
            current: Number(page),
            per_page: Number(per_page),
            url: modifiedUrl(req),
            pages: Math.ceil(Number(numRows) / Number(per_page)),
          },
        });
    });
});

handoverController.post('/Handover' , isAuthenticated , (req , res) => {
    sendRequest(req , res , createHandoverAPI , "POST" , req.body , (jsonData) => {
           const {statusCode , message} = jsonData;
           res.send({
            statusCode,
            message
           });
    })
})

handoverController.post(`/StopHandover` , isAuthenticated , (req , res) => {
       sendRequest(req, res, stopHandoverAPI , "PUT" , {} , (jsonData) => {
           const { statusCode , message } = jsonData;
             res.send({
                 statusCode,
                 message
             });
       });
})

module.exports = handoverController;
