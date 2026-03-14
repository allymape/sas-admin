const numeral = require("numeral");
const {
  titleCase,
  lowerCase,
  sumAssociativeArray,
  formatDate,
  crypt,
  hasPermission,
} = require("../../util");

function modifyUrl(currentUrl) {
  const splitByQuery = currentUrl.split("?");
  const urlParts = splitByQuery.length === 2 ? splitByQuery[0].split("/") : currentUrl.split("/");

  if (urlParts.length > 0 && !JSON.stringify(urlParts).includes(".")) {
    if (urlParts.length === 1) return urlParts[0];
    if (urlParts.length === 2) return urlParts[0] + "/*";
    if (urlParts.length === 3) return urlParts[0] + "/*/" + urlParts[2];
    if (urlParts.length === 4) return urlParts[0] + `/${urlParts[1]}/*/` + urlParts[3];
    return currentUrl;
  }

  return "";
}

function registerGlobals(app) {
  app.locals.getCurrentUrl = (req) => {
    const rawUrl = req.originalUrl || req.url || "";
    const cleanedUrl = rawUrl.replace(/^\/+/, "");
    return cleanedUrl.includes("?") ? cleanedUrl.split("?")[0] : cleanedUrl;
  };

  global.sumAssociativeArray = (array) => sumAssociativeArray(array);
  global.crypt = () => crypt();

  global.routeIs = (urlSegments, currentUrl) => {
    if (urlSegments) {
      const urls = urlSegments.split("|");
      if (Array.isArray(urls) && urls.length > 0) {
        for (let i = 0; i < urls.length; i += 1) {
          if (modifyUrl(currentUrl).toLowerCase().trim() === urls[i].trim().toLowerCase()) {
            return true;
          }
        }
      }
    }
    return false;
  };

  global.permission = (req, permissionName) => hasPermission(req, permissionName);
  global.nameCase = (text) => titleCase(lowerCase(text));
  global.numberFormat = (number, format = "0,0") => numeral(number).format(format);
  global.dateFormat = (date, format = "DD/MM/YYYY HH:mm:ss") => formatDate(date, format);

  global.remainDays = (fromDate) => {
    const today = new Date();
    const diffInSeconds = Math.abs(today - new Date(fromDate)) / 1000;

    const days = Math.floor(diffInSeconds / 60 / 60 / 24);
    const hours = Math.floor((diffInSeconds / 60 / 60) % 24);
    const minutes = Math.floor((diffInSeconds / 60) % 60);
    const seconds = Math.floor(diffInSeconds % 60);

    let remainDays = null;

    if (days > 7) {
      remainDays = global.dateFormat(fromDate, "DD-MM-YYYY HH:mm:ss");
    } else if (days > 0) {
      remainDays = `Siku ${days} ${days > 1 ? "zilizopita" : "iliyopita"} `;
    } else if (days <= 0 && hours <= 0 && minutes <= 0) {
      remainDays = `Sekunde ${seconds} ${seconds > 1 ? "zilizopita" : "iliyopita"}`;
    } else if (days <= 0 && hours <= 0) {
      remainDays = `Dakika ${minutes} ${minutes > 1 ? "zilizopita" : "iliyopita"}`;
    } else if (days <= 0) {
      remainDays = `Saa ${hours} ${hours > 1 ? "zilizopita" : "iliyopita"}`;
    }

    return remainDays;
  };
}

module.exports = {
  registerGlobals,
};
