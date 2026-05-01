const axios = require("axios");
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.API_REQUEST_TIMEOUT_MS || "8000", 10);

const isAjaxRequest = (req) => {
  const xrw = String(req?.headers?.["x-requested-with"] || "").toLowerCase();
  if (xrw === "xmlhttprequest") return true;

  const accepts = String(req?.headers?.accept || "").toLowerCase();
  return accepts.includes("application/json");
};

const sendRequest = async (req, res, url, method, formData = {}, token) => {
  try {
    const authToken = token || req.session.Token || req.body.token;

    if (!authToken) {
      req.flash("error", "Your session has expired, Tafadhali ingia tena.");
      return res.redirect("/");
    }

    const normalizedMethod = String(method || "GET").toUpperCase();
    const requestConfig = {
      url: url,
      method: normalizedMethod,
      timeout: Number.isFinite(REQUEST_TIMEOUT_MS) && REQUEST_TIMEOUT_MS > 0 ? REQUEST_TIMEOUT_MS : 8000,
      headers: {
        Authorization: "Bearer " + authToken,
        "Content-Type": "application/json",
      },
    };

    // For GET requests, send filters/pagination as query params (many APIs ignore GET bodies).
    if (normalizedMethod === "GET") {
      requestConfig.params = formData;
    } else {
      requestConfig.data = formData;
    }

    const response = await axios(requestConfig);

    if (response.data === "Too many requests, please try again later.") {
      req.flash(
        "warning",
        "Too many requests, please try again after 10 minutes.",
      );
      return res.redirect("/");
    }

    return response.data;
  } catch (error) {
    const status = Number(error?.response?.status || 0);
    const apiMessage = String(error?.response?.data?.message || "").trim();
    const fallbackMessage = "Kuna tatizo la server. Tafadhali jaribu tena baadaye.";
    const message = apiMessage || fallbackMessage;
    const ajaxRequest = isAjaxRequest(req);

    if (status === 401) {
      if (req?.session) {
        req.session.Token = null;
      }

      if (ajaxRequest) {
        return res.status(401).send({
          success: false,
          statusCode: 401,
          message: message || "Session expired. Tafadhali ingia tena.",
        });
      }

      if (typeof req?.flash === "function") {
        req.flash("error", message || "Session expired. Tafadhali ingia tena.");
      }
      return res.redirect("/");
    }

    if (status === 403) {
      return res.status(403).redirect("/403");
    }

    console.error("Request error:", {
      url,
      method,
      status,
      message: error?.message || "Unknown request error",
      response: error?.response?.data || null,
    });

    if (!ajaxRequest && req?.method === "GET") {
      if (typeof req?.flash === "function") {
        req.flash("error", message);
      }
      return res.redirect("/");
    }

    return res.status(status >= 400 ? status : 500).send({
      success: false,
      statusCode: status >= 400 ? status : 500,
      message,
    });
  }
};

module.exports = { sendRequest };
