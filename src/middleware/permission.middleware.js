module.exports = {
  can: (permission) => (req, res, next) => {
    /* ...check permission middleware... */
  },
  hasPermission: (req, permission_name) => {
    /* ...return true/false... */
  },
};
