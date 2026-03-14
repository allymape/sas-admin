const jwt = require("jsonwebtoken");
const { sendRequest, refreshTokenApi } = require("../services/api.service");

module.exports = {
  isAuthenticated: (req, res, next) => {
    /* ...token check logic... */
  },
  refreshToken: (req, res) => {
    /* ...refresh token logic calling sendRequest... */
  },
  redirectIfAuthenticated: (req, res, next) => {
    /* ...redirect logic... */
  },
};
