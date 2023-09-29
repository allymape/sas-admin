require("dotenv").config();
const express = require("express");
const request = require("request");
const kuongezaBweniRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var bweniDetails = API_BASE_URL + "view-bweni-details";
var badiliBweni = API_BASE_URL + "maombi-badili-bweni";
// Display

kuongezaBweniRequestController.get(
  "/KuongezaBweni", 
  isAuthenticated,
  can("view-school-registration-private"),
function (req, res) {
  var obj = [];
  request(
    {
      url: badiliBweni,
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
        console.log(new Date() + ": fail to KuongezaBweni " + error);
        res.send("failed");
      }
      // console.log(body)
      if (body !== undefined) {
        // var jsonData = JSON.parse(body)
        var jsonData = body;
        var message = jsonData.message;
        var statusCode = jsonData.statusCode;
        var data = jsonData.dataList;
        var dataSummary = jsonData.dataSummary;
        if (statusCode == 300) {
          for (var i = 0; i < data.length; i++) {
            var tracking_number = data[i].tracking_number;
            var user_id = data[i].user_id;
            var LgaName = data[i].LgaName;
            var RegionName = data[i].RegionName;
            var school_name = data[i].school_name;
            var created_at = data[i].created_at;
            var remain_days = data[i].remain_days;
            req.session.TrackingNumber = tracking_number;
            obj.push({
              tracking_number: tracking_number,
              user_id: user_id,
              school_name: school_name,
              LgaName: LgaName,
              RegionName: RegionName,
              created_at: created_at,
              remain_days: remain_days,
            });
          }
          console.log(
            new Date() +
              " " +
              req.session.userName +
              ": /KuongezaBweni"
          );
          res.render(path.join(__dirname + "/../../design/maombi/bweni"), {
            req: req,
            total_month: dataSummary,
            maombi: obj,
            useLev: req.session.UserLevel,
                              userName: req.session.userName,
    RoleManage: req.session.RoleManage,
userID: req.session.userID,
            cheoName: req.session.cheoName,
          });
        }
        if (statusCode == 209) {
          res.redirect("/");
        }
      }
    }
  );
});

kuongezaBweniRequestController.get(
  "/BadiliBweni/:id", 
  isAuthenticated,
  can("view-school-registration-private"),
  function (req, res) {
  var obj = [];
  var TrackingNumber = req.params.id;
  console.log("==========")
  console.log(TrackingNumber)
  request(
    {
      url: bweniDetails,
      method: "POST",
      headers: {
        Authorization: "Bearer" + " " + req.session.Token,
        "Content-Type": "application/json",
      },
      json: {
        browser_used: req.session.browser_used,
        ip_address: req.session.ip_address,
        TrackingNumber: TrackingNumber,
        userLevel: req.session.UserLevel,
        office: req.session.office,
      },
    },
    function (error, response, body) {
      if (error) {
        console.log(new Date() + ": fail to BadiliBweni " + error);
        res.send("failed");
      }
      console.log(body)
      if (body !== undefined) {
        // var jsonData = JSON.parse(body)
        var jsonData = body;

        console.log(jsonData);
        var message = jsonData.message;
        var statusCode = jsonData.statusCode;

        if (statusCode == 300) {
          var data = jsonData.data;
          var remain_days = data[0].remain_days;
          var created_at = data[0].created_at;
          var tracking_number = data[0].tracking_number;
          var school_name = data[0].school_name;
          var LgaName = data[0].LgaName;
          var registryTypeId = data[0].registry_type_id;
          var WardNameMtu = data[0].WardNameMtu;
          var LgaNameMtu = data[0].LgaNameMtu;
          var RegionName = data[0].RegionName;
          var RegionNameMtu = data[0].RegionNameMtu;
          var fullname = data[0].fullname;
          var Newsubcategory = data[0].Newsubcategory;
          var schoolCategory = data[0].schoolCategory;
          var registry = data[0].registry;
          var occupation = data[0].occupation;
          var mwombajiAddress = data[0].mwombajiAddress;
          var mwombajiPhoneNo = data[0].mwombajiPhoneNo;
          var baruaPepe = data[0].baruaPepe;
          var language = data[0].language;
          var school_size = data[0].school_size;
          var area = data[0].area;
          var streamOld = data[0].streamOld;
          var streamNew = data[0].streamNew;
          var establishId = data[0].establishId;
          var WardName = data[0].WardName;
          var structure = data[0].structure;
          var subcategory = data[0].subcategory;
          // var count = jsonData.maoni[0].count
          var objAttachment = jsonData.objAttachment;
          var objAttachment1 = jsonData.objAttachment1;
          var objAttachment2 = jsonData.objAttachment2;
          var Maoni = jsonData.Maoni;
          console.log(
            new Date() + " " + req.session.userName + ": /BadiliBweni"
          );
          res.render(
            path.join(__dirname + "/public/design/maombi/details/view-badili-bweni"),
            {
              req: req,
              muda_ombi: remain_days,
              useLev: req.session.UserLevel,
                                userName: req.session.userName,
            RoleManage: req.session.RoleManage,
  userID: req.session.userID,
              cheoName: req.session.cheoName,
              created_at: created_at,
              tracking_number: tracking_number,
              school_name: school_name,
              LgaName: LgaName,
              RegionName: RegionName,
              RegionNameMtu: RegionNameMtu,
              fullname: fullname,
              schoolCategory: schoolCategory,
              registry: registry,
              occupation: occupation,
              mwombajiAddress: mwombajiAddress,
              registryTypeId: registryTypeId,
              mwombajiPhoneNo: mwombajiPhoneNo,
              baruaPepe: baruaPepe,
              streamNew: streamNew,
              streamOld: streamOld,
              language: language,
              school_size: school_size,
              userLevel: req.session.UserLevel,
              area: area,
              WardName: WardName,
              structure: structure,
              establishId: establishId,
              LgaNameMtu: LgaNameMtu,
              WardNameMtu: WardNameMtu,
              Newsubcategory: Newsubcategory,
              subcategory: subcategory,
              count: "",
              staffs: jsonData.staffs,
              status: jsonData.status,
              objAttachment: objAttachment,
              objAttachment1: objAttachment1,
              Maoni: Maoni,
              objAttachment2: objAttachment2,
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

module.exports = kuongezaBweniRequestController;
