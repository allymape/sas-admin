module.exports = {
  validePassword: (req, res, next) => {
    /* ...validate passwords... */
  },
  isPasswordsMatched: (a, b) => a === b,
  isStrongPassword: (password, length = 8) => {
    /* regex check */
  },
};
