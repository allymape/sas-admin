// src/controllers/authController.js
require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const requestIp = require("request-ip"); // For getting client IP
const path = require("path");
const API_BASE_URL = process.env.API_BASE_URL;
const loginAPI = API_BASE_URL + "login";
const LOGIN_TIMEOUT_MS = Number.parseInt(process.env.LOGIN_TIMEOUT_MS || "12000", 10);
const LOGIN_RETRY_COUNT = Number.parseInt(process.env.LOGIN_RETRY_COUNT || "0", 10);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryLogin = (err) => {
  const status = Number(err?.response?.status || 0);
  const code = String(err?.code || "");
  return (
    code === "ECONNABORTED" ||
    code === "ECONNRESET" ||
    [502, 503, 504].includes(status)
  );
};

const loginRequest = async (body) => {
  const timeoutMs = Number.isFinite(LOGIN_TIMEOUT_MS) && LOGIN_TIMEOUT_MS > 0
    ? LOGIN_TIMEOUT_MS
    : 12000;
  const retries = Number.isFinite(LOGIN_RETRY_COUNT) && LOGIN_RETRY_COUNT >= 0
    ? LOGIN_RETRY_COUNT
    : 0;

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await axios.post(loginAPI, body, {
        headers: { "Content-Type": "application/json" },
        timeout: timeoutMs,
      });
    } catch (err) {
      lastError = err;
      if (attempt === retries || !shouldRetryLogin(err)) {
        throw err;
      }
      await sleep(300 * (attempt + 1));
    }
  }

  throw lastError;
};
// Login Page
const showLogin = (req, res) => {
  return res.render(path.join(__dirname, "/../views/login"), {
    req: req,
    message: "",
  });
};
const login = async (req, res) => {
  const errorMessage = "Kuna tatizo, wasiliana na msimamizi wa mfumo.";
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      req.flash("error", "Username na password zinahitajika.");
      return res.redirect("/");
    }

    const clientIp = requestIp.getClientIp(req);
    const browser = req.headers["user-agent"];
    const device = req.device?.type || "unknown";

    const body = {
      username,
      password,
      clientIp,
      browser,
      device,
    };

    const response = await loginRequest(body);

    const data = response.data;

    if (data === "Too many requests, please try again later.") {
      req.flash(
        "warning",
        "Too many requests, please try again after 10 minutes.",
      );
      return res.redirect("/");
    }

    const { statusCode, message, error } = data;

    if (error) {
      req.flash("error", message || errorMessage);
      return res.redirect("/");
    }

    if (statusCode === 302) {
      req.session.loginAttempt = (req.session.loginAttempt || 0) + 1;
      req.flash("warning", message);
      return res.redirect("/");
    }

    if (statusCode === 300) {
      const { user, RoleManage, token } = data;
      req.session.UserLevel = user.user_level;
      req.session.kanda = user.kanda;
      req.session.office = user.office;
      req.session.officeName = user.office_name;
      req.session.twofa = user.twofa;
      req.session.Token = token;
      req.session.userID = user.id;
      req.session.userName = user.name;
      req.session.cheoName = user.cheo.toUpperCase();
      req.session.jukumu = user.jukumu;
      req.session.email = user.email;
      req.session.ip_address = clientIp;
      req.session.browser_used = browser;
      req.session.RoleManage = RoleManage;

      // Redirect to dashboard
      return res.redirect("/Dashboard");
    }

    req.flash("error", message || errorMessage);
    return res.redirect("/");
  } catch (err) {
    console.error("Login Error:", err.message);
    const apiError = err.response?.data;

    if (apiError?.statusCode === 302) {
      req.flash("warning", apiError.message || errorMessage);
      return res.redirect("/");
    }

    if (apiError?.message) {
      req.flash("error", apiError.message);
      return res.redirect("/");
    }

    if (err.code === "ECONNABORTED") {
      req.flash(
        "error",
        "Muunganisho wa mfumo umechukua muda mrefu. Tafadhali jaribu tena baada ya muda mfupi.",
      );
      return res.redirect("/");
    }

    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      req.flash(
        "error",
        "Imeshindikana kufikia huduma ya kuingia. Hakikisha API server ina-run na jaribu tena.",
      );
      return res.redirect("/");
    }

    req.flash("error", "Kuna tatizo la server. Tafadhali jaribu tena baadaye.");
    return res.redirect("/");
  }
};
const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
    }
    return res.redirect("/");
  });
};

module.exports = {
  showLogin,
  login,
  logout
};
