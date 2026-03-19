require("dotenv").config();
const { generateSchoolCertificate, sendRequest } = require("../../util");

const API_BASE_URL = process.env.API_BASE_URL;
const certificatesApi = API_BASE_URL + "school-certificates";

const pdf = (req, res) => {
  const trackingNumber = String(req.params.tracking_number || "").trim();
  if (!trackingNumber) return res.status(400).send("tracking_number is required");

  sendRequest(req, res, `${certificatesApi}/${encodeURIComponent(trackingNumber)}`, "GET", {}, (jsonData) => {
    if (jsonData?.success === false) {
      return res.status(404).send(jsonData?.message || "Certificate not found.");
    }

    const application = jsonData?.data?.application || null;
    const certificate = jsonData?.data?.certificate || null;
    if (!application || !certificate) {
      return res.status(404).send("Certificate data is incomplete.");
    }

    return generateSchoolCertificate(req, res, application, certificate);
  });
};

module.exports = {
  pdf,
};

