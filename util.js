var request = require('request');

module.exports = {
  sendRequest: (req, res, url, method, formData, callback) => {
    if (typeof req.session.userName !== "undefined" ||req.session.userName === true) {
      request({
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
            res.send("failed");
          }
          //  console.log(body)
          if (body !== undefined) {
            callback(body);
          }
        }
      );
    } else {
      res.redirect("/");
    }
  },
};
