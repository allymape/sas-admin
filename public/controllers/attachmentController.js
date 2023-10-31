require("dotenv").config();
const express = require("express");
const request = require("request");
const attachmentController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated } = require("../../util");
const FRONTEND_URL = process.env.FRONTEND_URL;
const pdf2base64 = require("pdf-to-base64");

attachmentController.post("/View-Attachment", isAuthenticated, function (req, res) {
    const file_path = req.body.file_path;
    if(file_path){
        pdf2base64(FRONTEND_URL + file_path)
        .then( (response) => {
                console.log(response);
                res.send({
                  statusCode: 300,
                  data: response,
                });
        }).catch( (error) => {
            res.send({
              statusCode: 500,
              data: error,
            });
        });
            
    }else{
        res.send({
            statusCode : 404,
            data : null
        });
    }
});

module.exports = attachmentController;
