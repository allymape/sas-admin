const dateAndTime = require("date-and-time");
const fs = require("fs");
const Cryptr = require("cryptr");
const json2xls = require("json2xls");

module.exports = {
  formatDate: (date, format = "YYYY-MM-DD HH:mm:ss") =>
    dateAndTime.format(date, format),
  greating: (name) => {
    /* ...morning/evening greeting logic... */
  },
  crypt: () => new Cryptr("ReALLY#299992%Secret#@901838Key"),
  sumAssociativeArray: (array) =>
    Object.values(array).reduce((acc, i) => acc + i.total, 0),
  arraySum: (arr) => arr.reduce((sum, n) => sum + n, 0),
  decodeSignature: (base64Data, tracking_number) => {
    /* write PNG */
  },
  exportJSONToExcel: (res, jsonData, report_name = "") => {
    /* json2xls logic */
  },
  modifiedUrl: (req, newParams) => {
    /* ...modify URL query params... */
  },
};
