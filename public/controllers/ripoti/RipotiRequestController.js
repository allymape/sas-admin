require("dotenv").config();
const express = require("express");
const request = require("request");
const reportRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, createLetter, formatDate } = require("../../../util");
// const { sendRequest, isAuthenticated, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
const requestRiportKuanzishaAPI = API_BASE_URL + "ripoti-kuanzisha-shule";
var maoanzishaShuleListAPI = API_BASE_URL +"maombi-kuanzisha-shule";
var ombiDetails = API_BASE_URL + "view-ombi-details";
var ombiReply = API_BASE_URL + "tuma-ombi-majibu";

// Display
// reportRequestController.get("/RipotiKuanzisha",isAuthenticated,can("view-initiate-schools"),
//   function (req, res) {
//     const per_page = Number(req.query.per_page || 10);
//     const page = Number(req.query.page || 1);
//     const formData = {
//             page,
//             per_page
//     };
    
//     sendRequest(req,res,requestRiportKuanzishaAPI, "GET", formData, (jsonData) => {
//         const { data , numRows } = jsonData;
//         // const data = jsonData.data
//         // const numRows = jsonData.numRows;
//         const body = `Tafadhali husika na kichwa cha habari hapo juu.
                      
//                       Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

//                       The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham
//                       `;
//         const LgaName = 'Mtwara MC';
//         const RegionName = "Mtwara";
//         createLetter( formatDate(new Date() ,'YYYY-MM-DD-HH-mm-ss') , '10-12-2023' , 'SLP 234' , 'EC/12/23/001' , 'iBnadmu' , 'Yah: Hello' , body , 'KE' , '' , LgaName , RegionName);
//         res.render(path.join(__dirname + "/../../design/ripoti/kuanzisha"), {
//           req: req,
//           data: data,
//           pagination: {
//                 total: numRows,
//                 current: page,
//                 per_page: per_page,
//                 url : 'RipotiKuanzisha',
//                 pages: Math.ceil(numRows / per_page),
//           },
//         });
//       }
//     );
//   }
// );
reportRequestController.get("/RipotiZilizosajiliwa", isAuthenticated, function (req, res) {
  var obj = [];
  var objlist = [];
  var objtotal = [];
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var today = new Date();
  // today = dateFormat.format(today, "dd/mm/yyyy")

  sendRequest(req, res , )
 
    request(
      {
        url: sajiliShuleJumlaAPI + `?page=${page}&per_page=${per_page}`,
        method: "POST",
        headers: {
          Authorization: "Bearer" + " " + req.session.Token,
          "Content-Type": "application/json",
        },
        json: {
          browser_used: req.session.browser_used,
          ip_address: req.session.ip_address,
          UserLevel: req.session.UserLevel,
          Office: req.session.office,
        },
      },
      function (error, response, body) {
        if (error) {
          console.log(new Date() + ": fail to RipotiZilizosajiliwa " + error);
          res.send("failed");
        }
        console.log(body);
        if (body !== undefined) {
          // var jsonData = JSON.parse(body)
          var jsonData = body;
          var message = jsonData.message;
          var statusCode = jsonData.statusCode;
          var data = jsonData.data;
          var numRows = jsonData.numRows;

          for (var i = 0; i < data.length; i++) {
            var kaunti = data[i].kaunti;
            var category = data[i].category;
            objtotal.push({ kaunti: kaunti, category: category });
          }
          var list = jsonData.list;
          for (var i = 0; i < list.length; i++) {
            var school_name = list[i].school_name;
            var category = list[i].category;
            var approved_at = list[i].approved_at;
            var LgaName = list[i].LgaName;
            var RegionName = list[i].RegionName;
            var tracking_number = list[i].tracking_number;
            var dateDisplay = list[i].dateDisplay;
            var WardName = list[i].WardName;
            var reg_no = list[i].reg_no;
            var subcategory = list[i].subcategory;
            var gender_type = list[i].gender_type;
            var school_phone = list[i].school_phone;
            var po_box = list[i].po_box;
            var level = list[i].level;
            var owner_name = list[i].owner_name;
            var todaydate = list[i].todaydate;
            var school_email = list[i].school_email;
            var stream = list[i].stream;
            var language = list[i].language;
            objlist.push({
              school_name: school_name,
              category: category,
              subcategory: subcategory,
              level: level,
              po_box: po_box,
              language: language,
              approved_at: approved_at,
              LgaName: LgaName,
              RegionName: RegionName,
              gender_type: gender_type,
              school_phone: school_phone,
              tracking_number: tracking_number,
              dateDisplay: dateDisplay,
              WardName: WardName,
              reg_no: reg_no,
              school_email: school_email,
            });
            // const data = [
            //   { name: 'Diary', code: 'diary_code', author: 'Pagorn' },
            //   { name: 'Note', code: 'note_code', author: 'Pagorn' },
            //   { name: 'Medium', code: 'medium_code', author: 'Pagorn' },
            // ]
          }
          if (statusCode == 300) {
            console.log(
              new Date() +
                " " +
                req.session.userName +
                ": /RipotiZilizosajiliwa"
            );
            const workSheet = XLSX.utils.json_to_sheet(objlist);
            const workBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
            XLSX.writeFile(workBook, "sample.xlsx");
            // Saving the pdf file in root directory.

            res.render(
              path.join(
                __dirname + "/public/design/reports/ripotizilizosajiliwa"
              ),
              {
                req: req,
                objtotal: objtotal,
                list: objlist,
                useLev: req.session.UserLevel,
                userName: req.session.userName,
                RoleManage: req.session.RoleManage,
                userID: req.session.userID,
                cheoName: req.session.cheoName,
                pagination: {
                  total: numRows,
                  current: page,
                  per_page: per_page,
                  url: "RipotiZilizosajiliwa",
                  pages: Math.ceil(numRows / per_page),
                },
              }
            );
          }
          if (statusCode == 209) {
            res.redirect("/");
          }
        }
      }
    );

});


module.exports = reportRequestController;
