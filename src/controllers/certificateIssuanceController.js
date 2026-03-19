require("dotenv").config();
const path = require("path");
const { sendRequest } = require("../../util");

const API_BASE_URL = process.env.API_BASE_URL;
const certificatesApi = API_BASE_URL + "school-certificates";

const toPositiveInt = (value, fallback) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const toPerPage = (value) => {
  const num = Number.parseInt(value, 10);
  if (![10, 15, 20, 50, 100].includes(num)) return null;
  return num;
};

const toTab = (value) => {
  const tab = String(value || "").trim().toLowerCase();
  return tab === "issued" ? "issued" : "pending";
};

const index = (req, res) => {
  const tab = toTab(req.query.tab);
  const page = toPositiveInt(req.query.page, 1);
  const perPage = toPerPage(req.query.per_page) || 15;
  const search = String(req.query.search || "").trim();
  const preview = String(req.query.preview || "").trim();

  const params = new URLSearchParams({
    issued: tab === "issued" ? "1" : "0",
    page: String(page),
    per_page: String(perPage),
  });
  if (search) params.set("search", search);

  sendRequest(req, res, `${certificatesApi}?${params.toString()}`, "GET", {}, (jsonData) => {
    const payload = jsonData?.data || {};
    const rows = Array.isArray(payload.data) ? payload.data : [];
    const pagination = payload.pagination || {
      current_page: page,
      per_page: perPage,
      total: rows.length,
      last_page: 1,
    };

    res.render(path.join(__dirname, "/../views/certificates/index"), {
      req,
      tab,
      rows,
      pagination,
      search,
      preview,
      success: jsonData?.success !== false,
      message: jsonData?.message || null,
    });
  });
};

const issue = (req, res) => {
  const trackingNumber = String(req.params.tracking_number || "").trim();
  if (!trackingNumber) return res.redirect("/vyeti");

  const expectedYear = String(req.body?.expected_year || "").trim();
  const expectedSeq = String(req.body?.expected_seq || "").trim();

  const payload = {};
  if (expectedYear) payload.expected_year = expectedYear;
  if (expectedSeq) payload.expected_seq = expectedSeq;

  sendRequest(req, res, `${certificatesApi}/${encodeURIComponent(trackingNumber)}/issue`, "POST", payload, (jsonData) => {
    if (jsonData?.success === false) {
      req.flash("warning", jsonData?.message || "Imeshindikana ku-issue cheti.");
      return res.redirect("/vyeti");
    }

    req.flash("success", "Cheti kime-issue kikamilifu.");
    return res.redirect(`/vyeti?tab=issued&preview=${encodeURIComponent(trackingNumber)}`);
  });
};

const issuePreview = (req, res) => {
  const trackingNumber = String(req.params.tracking_number || "").trim();
  if (!trackingNumber) return res.status(400).send({ success: false, message: "tracking_number is required" });

  sendRequest(req, res, `${certificatesApi}/${encodeURIComponent(trackingNumber)}/issue-preview`, "GET", {}, (jsonData) => {
    if (jsonData?.success === false) {
      return res.status(400).send(jsonData);
    }
    return res.send(jsonData);
  });
};

module.exports = {
  index,
  issue,
  issuePreview,
};
