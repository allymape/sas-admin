require("dotenv").config();
const request = require("request");
const jwt = require("jsonwebtoken");
const dateAndTime = require("date-and-time");
const {
  titleCase, lowerCase,
} = require("text-case");

module.exports = {
  sendRequest: (req, res, url, method, formData, callback) => {
    if (
      typeof req.session.userName !== "undefined" ||
      req.session.userName === true
    ) {
      request(
        {
          url: url,
          method: method,
          headers: {
            Authorization: "Bearer" + " " + req.session.Token,
            "Content-Type": "application/json",
          },
          json: formData,
        },
        (error, response, body) => {
          // console.log(body);
          if (error) {
            console.log("error", error);
          }
          //  console.log(body)
          if (body !== undefined && response.statusCode == 200) {
            callback(body);
          } else {
            // console.log(response)
            if (typeof response !== undefined && response.statusCode == 403) {
              res.status(response.statusCode).redirect("/403");
            }
          }
        }
      );
    } else {
      res.redirect("/");
    }
  },
  // Check user permission
  can: (permission) => {
    // return a middleware
    return (req, res, next) => {
      const { user } = req;
      if (user && user.userPermissions.includes(permission)) {
        next(); // role is allowed, so continue on the next middleware
      } else {
        // console.log(permission, req);
        res.redirect("/403"); // user is forbidden
      }
    };
  },

  isAuthenticated: (req, res, next) => {
    const authorization = "Bearer" + " " + req.session.Token;
    // req.session.previousUrl = req.originalUrl;
    if (authorization) {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      //  console.log(token);
      jwt.verify(
        token,
        process.env.JWT_SECRET || "the-super-strong-secrect",
        (err, decode) => {
          if (err) {
            res.redirect("/");
          } else {
            req.user = decode;
            next();
          }
        }
      );
    } else {
      res.redirect("/");
    }
  },

  redirectIfAuthenticated: (req, res, next) => {
    if (req.session.userName) {
      // let  previousUrl = req.session.previousUrl
      // res.redirect(previousUrl ? previousUrl : '/Dashboard');
      res.redirect("/Dashboard");
    }
    next();
  },
  titleCase: (text) => {
    //Title Case
    return titleCase(text);
  },
  lowerCase: (text) => {
    //Title Case
    return lowerCase(text);
  },

  sumAssociativeArray: (array) => {
    const sum = Object.values(array).reduce(
      (accumulator, item) => accumulator + item.total,
      0
    );
    return sum;
  },

  arraySum: (array) => {
    let sum = 0;
    if (array.length > 0) {
      sum = array.reduce((sum, number) => sum + number);
    }
    return sum;
  },
  greating: (name) => {
    const date = new Date().getHours();
    var majira = "";
    if (date < 12) {
      majira = "Habari ya Asubuhi";
    } else if (date < 18) {
      majira = "Habari ya Mchana";
    } else if (date > 18) {
      majira = "Habari ya Jioni";
    }
    return majira + ", " + name + "!";
  },
  formatDate: (date, format = "YYYY-MM-DD hh:mm:ss") => {
    return dateAndTime.format(
      typeof date === "string" ? new Date(date) : date,
      format
    );
  },
};
