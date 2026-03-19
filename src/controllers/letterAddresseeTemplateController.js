require("dotenv").config();
const path = require("path");
const { sendRequest } = require("../../util");

const API_BASE_URL = process.env.API_BASE_URL;
const addresseeApi = API_BASE_URL + "letter-addressee-templates";

const toId = (value) => {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
};

const normalizeKey = (value) => String(value || "").trim();
const normalizeText = (value) => String(value || "").trim();
const normalizeKind = (value) => {
  const kind = String(value || "").trim().toLowerCase();
  return kind ? kind : null;
};
const normalizeIsActive = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return 0;
  if (["1", "true", "yes", "ndio", "y", "on"].includes(text)) return 1;
  if (["0", "false", "no", "hapana", "n", "off"].includes(text)) return 0;
  return null;
};

const index = (req, res) => {
  sendRequest(req, res, addresseeApi, "GET", {}, (jsonData) => {
    const rows = Array.isArray(jsonData?.data) ? jsonData.data : [];
    res.render(path.join(__dirname, "/../views/letter-addressee-templates/index"), {
      req,
      addresseeTemplates: rows,
      success: jsonData?.success !== false,
    });
  });
};

const createForm = (req, res) => {
  res.render(path.join(__dirname, "/../views/letter-addressee-templates/edit"), {
    req,
    mode: "create",
    item: null,
    error: null,
  });
};

const editForm = (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.redirect("/letter-addressee-templates");

  sendRequest(req, res, `${addresseeApi}/${id}`, "GET", {}, (jsonData) => {
    if (jsonData?.success === false) {
      req.flash("warning", jsonData?.message || "Failed to load addressee template");
      return res.redirect("/letter-addressee-templates");
    }

    res.render(path.join(__dirname, "/../views/letter-addressee-templates/edit"), {
      req,
      mode: "edit",
      item: jsonData?.data || null,
      error: null,
    });
  });
};

const create = (req, res) => {
  const payload = {
    template_key: normalizeKey(req.body?.template_key),
    name: normalizeText(req.body?.name),
    address_kind: normalizeKind(req.body?.address_kind),
    addressee_template: normalizeText(req.body?.addressee_template),
    is_active: normalizeIsActive(req.body?.is_active),
  };

  sendRequest(req, res, addresseeApi, "POST", payload, (jsonData) => {
    if (jsonData?.success === false) {
      req.flash("warning", jsonData?.message || "Failed to create addressee template");
      return res.redirect("/letter-addressee-templates/new");
    }
    req.flash("success", "Addressee format saved.");
    return res.redirect("/letter-addressee-templates");
  });
};

const update = (req, res) => {
  const id = toId(req.params.id);
  if (!id) return res.redirect("/letter-addressee-templates");

  const payload = {
    name: normalizeText(req.body?.name),
    address_kind: normalizeKind(req.body?.address_kind),
    addressee_template: normalizeText(req.body?.addressee_template),
    is_active: normalizeIsActive(req.body?.is_active),
  };

  sendRequest(req, res, `${addresseeApi}/${id}`, "PUT", payload, (jsonData) => {
    if (jsonData?.success === false) {
      req.flash("warning", jsonData?.message || "Failed to update addressee template");
      return res.redirect(`/letter-addressee-templates/${id}/edit`);
    }
    req.flash("success", "Addressee format updated.");
    return res.redirect(`/letter-addressee-templates/${id}/edit`);
  });
};

module.exports = {
  index,
  createForm,
  editForm,
  create,
  update,
};

