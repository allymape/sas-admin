require("dotenv").config();
const path = require("path");
const fs = require("fs");
const { sendRequest, generateLetter } = require("../../util");

const API_BASE_URL = process.env.API_BASE_URL;
const templatesApi = API_BASE_URL + "letter-templates";
const variablesApi = `${templatesApi}/variables`;
const applicationCategoriesApi = API_BASE_URL + "all-application-categories";
const addresseeTemplatesApi = API_BASE_URL + "letter-addressee-templates";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderMarkdownToHtml = (markdown = "") => {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const out = [];

  let inCode = false;
  let codeLang = "";
  let codeLines = [];
  let listItems = [];
  let listMode = null; // "ul" | "ol" | null

  const listIndentStyle = (indentSpaces) => {
    const spaces = Number(indentSpaces) || 0;
    const level = Math.max(0, Math.min(4, Math.floor(spaces / 2)));
    if (!level) return "";
    return ` style="margin-left:${level * 12}px"`;
  };

  const flushList = () => {
    if (!listItems.length) return;
    const tag = listMode === "ol" ? "ol" : "ul";
    out.push(`<${tag}>`);
    listItems.forEach((item) => {
      if (typeof item === "string") return out.push(`<li>${item}</li>`);
      const html = item?.html ?? "";
      const indent = item?.indent ?? 0;
      out.push(`<li${listIndentStyle(indent)}>${html}</li>`);
    });
    out.push(`</${tag}>`);
    listItems = [];
    listMode = null;
  };

  const flushCode = () => {
    if (!inCode) return;
    const code = escapeHtml(codeLines.join("\n"));
    const classAttr = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : "";
    out.push(`<pre><code${classAttr}>${code}</code></pre>`);
    inCode = false;
    codeLang = "";
    codeLines = [];
  };

  const inline = (text) =>
    escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, (_m, strongText) => `<strong>${strongText}</strong>`)
      .replace(/\*([^*]+)\*/g, (_m, emText) => `<em>${emText}</em>`)
      .replace(/`([^`]+)`/g, (_m, code) => `<code>${escapeHtml(code)}</code>`);

  for (const rawLine of lines) {
    const line = String(rawLine ?? "");

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (inCode) {
        flushCode();
      } else {
        flushList();
        inCode = true;
        codeLang = String(fence[1] || "").trim();
        codeLines = [];
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)\s*$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)\s*$/);
    const ordered = line.match(/^\s*(\d+)\.\s+(.+)\s*$/);
    if (unordered || ordered) {
      const mode = ordered ? "ol" : "ul";
      const itemText = ordered ? ordered[2] : unordered[1];
      const indentSpaces = (line.match(/^\s*/) || [""])[0].length;
      if (listMode && listMode !== mode) flushList();
      listMode = mode;
      listItems.push({ html: inline(itemText), indent: indentSpaces });
      continue;
    }

    if (!line.trim()) {
      flushList();
      out.push("<div class=\"mb-2\"></div>");
      continue;
    }

    flushList();
    out.push(`<p>${inline(line)}</p>`);
  }

  flushList();
  flushCode();

  return out.join("\n");
};

const normalizeKey = (value) => String(value || "").trim();
const normalizeType = (value) => {
  const type = String(value || "").trim().toLowerCase();
  return type ? type : "";
};
const normalizeIsActive = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) return 0;
  if (["1", "true", "yes", "ndio", "y", "on"].includes(text)) return 1;
  if (["0", "false", "no", "hapana", "n", "off"].includes(text)) return 0;
  return null;
};

const splitBodyTemplateToParagraphs = (value) => {
  const raw = String(value || "").replace(/\r\n/g, "\n");
  if (!raw.trim()) return [];

  const parts = raw
    .split(/\n\s*\n+/g)
    .map((p) => p.trim())
    .filter(Boolean);

  return parts.length ? parts : [raw.trim()];
};

const splitLines = (value) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const index = (req, res) => {
  sendRequest(req, res, templatesApi, "GET", {}, (jsonData) => {
    const rows = Array.isArray(jsonData?.data) ? jsonData.data : [];
    res.render(path.join(__dirname, "/../views/letter-templates/index"), {
      req,
      templates: rows,
      success: jsonData?.success !== false,
    });
  });
};

const preview = (req, res) => {
  const templateKey = normalizeKey(req.params.template_key);
  if (!templateKey) return res.redirect("/letter-templates");

  sendRequest(req, res, `${templatesApi}/${encodeURIComponent(templateKey)}`, "GET", {}, (jsonData) => {
    const template = jsonData?.data || null;
    if (!template) {
      req.flash("warning", jsonData?.message || "Template haijapatikana.");
      return res.redirect("/letter-templates");
    }

    const title = String(template?.title_template || template?.name || template?.template_key || "TEMPLATE").trim();
    const paragraphs = splitBodyTemplateToParagraphs(template?.body_template || "");

    const reference = String(template?.reference_template || "{{file_number}}/{{folio}}").trim() || "{{file_number}}/{{folio}}";
    const date = String(template?.date_template || "{{approved_at}}").trim() || "{{approved_at}}";
    const addresseeLines = splitLines(template?.addressee_template || "").length
      ? splitLines(template?.addressee_template || "")
      : ["{{address_title}},", "{{address_name}}", "S.L.P {{address_box}},", "{{address_region}}"];

    const headerOverrides = { addressee: addresseeLines };

    // Dummy placeholders for variables-only preview.
    const placeholders = {
      address_title: "{{address_title}}",
      address_name: "{{address_name}}",
      address_box: "{{address_box}}",
      address_region: "{{address_region}}",
      signatory: "{{signatory}}",
      cheo: "{{cheo}}",
      region: "{{region}}",
      district: "{{district}}",
      zone_name: "{{zone_name}}",
      zone_box: "{{zone_box}}",
      region_box: "{{region_box}}",
      district_box: "{{district_box}}",
      district_sqa_box: "{{district_sqa_box}}",
      ngazi_ya_wilaya: "{{ngazi_ya_wilaya}}",
    };

    const table = {
      headers: [],
      rows: [],
    };

    // Minimal values to keep PDF layout consistent (no special-case government chuo header/table).
    const applicationCategoryId = Number(template?.application_category_id || 0);
    const registryType = 1;
    const schoolTypeId = 1;

    generateLetter(
      req,
      res,
      null, // base64signature
      applicationCategoryId,
      reference,
      date,
      placeholders.address_title,
      placeholders.address_name,
      placeholders.address_box,
      placeholders.address_region,
      title,
      paragraphs,
      placeholders.signatory,
      placeholders.cheo,
      table,
      registryType,
      placeholders.region,
      placeholders.district,
      placeholders.zone_name,
      placeholders.zone_box,
      placeholders.region_box,
      "", // sqa_zone_region
      placeholders.district_box,
      placeholders.district_sqa_box,
      schoolTypeId,
      placeholders.ngazi_ya_wilaya,
      headerOverrides,
    );
  });
};

const createForm = (req, res) => {
  sendRequest(req, res, `${applicationCategoriesApi}?page=1&per_page=100`, "GET", { is_paginated: true }, (catsData) => {
    const categories = Array.isArray(catsData?.data) ? catsData.data : [];
    sendRequest(req, res, addresseeTemplatesApi, "GET", {}, (addData) => {
      const addresseeTemplates = Array.isArray(addData?.data) ? addData.data : [];
      sendRequest(req, res, variablesApi, "GET", {}, (varsData) => {
        res.render(path.join(__dirname, "/../views/letter-templates/edit"), {
          req,
          mode: "create",
          template: null,
          variablesCatalog: varsData?.data || null,
          applicationCategories: categories,
          addresseeTemplates,
          error: null,
        });
      });
    });
  });
};

const editForm = (req, res) => {
  const templateKey = normalizeKey(req.params.template_key);
  if (!templateKey) return res.redirect("/letter-templates");

  sendRequest(req, res, `${applicationCategoriesApi}?page=1&per_page=100`, "GET", { is_paginated: true }, (catsData) => {
    const categories = Array.isArray(catsData?.data) ? catsData.data : [];
    sendRequest(req, res, addresseeTemplatesApi, "GET", {}, (addData) => {
      const addresseeTemplates = Array.isArray(addData?.data) ? addData.data : [];
      sendRequest(req, res, variablesApi, "GET", {}, (varsData) => {
        sendRequest(req, res, `${templatesApi}/${encodeURIComponent(templateKey)}`, "GET", {}, (jsonData) => {
          res.render(path.join(__dirname, "/../views/letter-templates/edit"), {
            req,
            mode: "edit",
            template: jsonData?.data || null,
            variablesCatalog: varsData?.data || null,
            applicationCategories: categories,
            addresseeTemplates,
            error: jsonData?.success === false ? (jsonData?.message || "Failed to load template") : null,
          });
        });
      });
    });
  });
};

const create = (req, res) => {
  const addresseeTemplateId = String(req.body?.addressee_template_id || "").trim();
  const payload = {
    template_key: normalizeKey(req.body?.template_key),
    name: String(req.body?.name || "").trim(),
    application_category_id: String(req.body?.application_category_id || "").trim() || null,
    letter_type: normalizeType(req.body?.letter_type) || null,
    title_template: String(req.body?.title_template || ""),
    body_template: String(req.body?.body_template || ""),
    reference_template: String(req.body?.reference_template || ""),
    date_template: String(req.body?.date_template || ""),
    addressee_template: addresseeTemplateId ? "" : String(req.body?.addressee_template || ""),
    addressee_template_id: addresseeTemplateId || null,
    is_active: normalizeIsActive(req.body?.is_active),
  };

  sendRequest(req, res, templatesApi, "POST", payload, (jsonData) => {
    if (jsonData?.success === false) {
      req.flash("warning", jsonData?.message || "Failed to create template");
      return res.redirect("/letter-templates/new");
    }
    return res.redirect(`/letter-templates/${encodeURIComponent(payload.template_key)}/edit`);
  });
};

const update = (req, res) => {
  const templateKey = normalizeKey(req.params.template_key);
  if (!templateKey) return res.redirect("/letter-templates");

  const addresseeTemplateId = String(req.body?.addressee_template_id || "").trim();
  const payload = {
    name: String(req.body?.name || "").trim(),
    application_category_id: String(req.body?.application_category_id || "").trim() || null,
    letter_type: normalizeType(req.body?.letter_type) || null,
    title_template: String(req.body?.title_template || ""),
    body_template: String(req.body?.body_template || ""),
    reference_template: String(req.body?.reference_template || ""),
    date_template: String(req.body?.date_template || ""),
    addressee_template: addresseeTemplateId ? "" : String(req.body?.addressee_template || ""),
    addressee_template_id: addresseeTemplateId || null,
    is_active: normalizeIsActive(req.body?.is_active),
  };

  sendRequest(req, res, `${templatesApi}/${encodeURIComponent(templateKey)}`, "PUT", payload, (jsonData) => {
    if (jsonData?.success === false) {
      req.flash("warning", jsonData?.message || "Failed to update template");
      return res.redirect(`/letter-templates/${encodeURIComponent(templateKey)}/edit`);
    }
    req.flash("success", `Template updated (v${jsonData?.version || "?"}).`);
    return res.redirect(`/letter-templates/${encodeURIComponent(templateKey)}/edit`);
  });
};

const guide = (req, res) => {
  const guidePath = path.join(__dirname, "..", "..", "docs", "letter-templates-guide.md");
  const markdown = fs.existsSync(guidePath) ? fs.readFileSync(guidePath, "utf8") : "# Guide not found";

  res.render(path.join(__dirname, "/../views/letter-templates/guide"), {
    req,
    guideHtml: renderMarkdownToHtml(markdown),
    guideUpdatedAt: fs.existsSync(guidePath)
      ? fs.statSync(guidePath).mtime
      : null,
  });
};

module.exports = {
  index,
  preview,
  createForm,
  editForm,
  create,
  update,
  guide,
};
