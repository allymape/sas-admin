const axios = require("axios");

const sendRequest = async (req, res, url, method, formData = {}, token) => {
  try {
    const authToken = token || req.session.Token || req.body.token;

    if (!authToken) {
      req.flash("error", "Your session has expired, Tafadhali ingia tena.");
      return res.redirect("/");
    }

    const response = await axios({
      url: url,
      method: method,
      headers: {
        Authorization: "Bearer " + authToken,
        "Content-Type": "application/json",
      },
      data: formData,
    });

    if (response.data === "Too many requests, please try again later.") {
      req.flash(
        "warning",
        "Too many requests, please try again after 10 minutes.",
      );
      return res.redirect("/");
    }

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      return res.status(403).redirect("/403");
    }

    console.error("Request error:", error.message);
    return res
      .status(500)
      .send({ success: false, message: "Internal server error" });
  }
};

module.exports = { sendRequest };
