require("dotenv").config();
const express = require("express");

const loginActivityController = express.Router();
const { sendRequest, modifiedUrl, isAuthenticated, activeHandover } = require("../../util");
const path  = require("path");
const API_BASE_URL = process.env.API_BASE_URL;
const loginActivityAPI = API_BASE_URL + "login-activity";

loginActivityController.get("/LoginActivity", isAuthenticated, activeHandover , function (req, res) {
    const per_page = Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const params = {
        per_page,
        page
    }
    sendRequest(req , res , loginActivityAPI+ "?page=" + page + "&per_page=" + per_page , "POST" , params , (jsonData) => {
        const {activities , numRows , statusCode} = jsonData;
        res.render(path.join(__dirname + "/../views/login_activity"), {
          req,
          activities: statusCode == 300 ? activities : [],
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

module.exports = loginActivityController;
