// require("dotenv").config();
// const express = require("express");
// const request = require("request");
// const reportZilizosajiliwaRequestController = express.Router();
// var session = require("express-session");
// var path = require("path");
// const { isAuthenticated, sendRequest, can, createLetter, formatDate } = require("../../../util");
// // const { sendRequest, isAuthenticated, can } = require("../../../util");
// var API_BASE_URL = process.env.API_BASE_URL;
// const requestRiportKuanzishaAPI = API_BASE_URL + "ripoti-kuanzisha-shule";

// // reportZilizosajiliwaRequestController.get(
// //   "/RipotiZilizosajiliwa",
// //   isAuthenticated,
// //   can("view-initiate-schools"),
// //   function (req, res) {
// //     const per_page = Number(req.query.per_page || 10);
// //     const page = Number(req.query.page || 1);
// //     const formData = { page, per_page };

// //     sendRequest(
// //       req,
// //       res,
// //       requestRiportKuanzishaAPI,
// //       "GET",
// //       formData,
// //       (jsonData) => {
// //         const { data, numRows } = jsonData;
// //         res.render(path.join(__dirname + "/../../design/ripoti/kuanzisha"), {
// //           req: req,
// //           data: data,
// //           pagination: {
// //             total: numRows,
// //             current: page,
// //             per_page: per_page,
// //             url: "RipotiKuanzisha",
// //             pages: Math.ceil(numRows / per_page),
// //           },
// //         });
// //       }
// //     );
// //   }
// // );


// module.exports = reportZilizosajiliwaRequestController;
