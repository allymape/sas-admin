require("dotenv").config();
const request = require("request");
const jwt = require("jsonwebtoken");
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
          if (error) {
            // res.send("failed");
          }
          //  console.log(body)
          if (body !== undefined && response.statusCode == 200) {
            callback(body);
          } else {
            if (typeof response.statusCode == 'undefined' &&  response.statusCode == 403) {
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
};
