require("dotenv").config();
const path = require("path");
const { sendRequest } = require("../../../util");

const API_BASE_URL = process.env.API_BASE_URL;
const applicationsAPI = API_BASE_URL + "applications";
const ALLOWED_PER_PAGE = [10, 15, 20, 50, 100];

const toPositiveInt = (value, fallback) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

const toNonNegativeInt = (value, fallback) => {
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
};

const toSearch = (value) => String(value || "").trim();
const toPerPage = (value) => {
  const num = Number.parseInt(value, 10);
  return ALLOWED_PER_PAGE.includes(num) ? num : null;
};

const toNameCase = (value) => {
  const input = String(value || "").trim();
  if (!input) return "";
  return input.toUpperCase();
};

const normalizeApplicationApplicantName = (row) => {
  if (!row || typeof row !== "object") return row;
  const normalized = { ...row };

  if (row.applicant && typeof row.applicant === "object") {
    normalized.applicant = {
      ...row.applicant,
      name: toNameCase(row.applicant.name),
    };
  }

  if (typeof row.applicant_name === "string") {
    normalized.applicant_name = toNameCase(row.applicant_name);
  }

  return normalized;
};

const parseApplicationsPayload = (apiResponse, fallbackPage, fallbackPerPage) => {
  const payload = apiResponse?.data || {};
  const rows = Array.isArray(payload.data)
    ? payload.data.map((row) => normalizeApplicationApplicantName(row))
    : [];

  return {
    success: apiResponse?.success !== false,
    applications: rows,
    pagination: {
      current_page: toPositiveInt(payload.current_page, fallbackPage),
      per_page: toPositiveInt(payload.per_page, fallbackPerPage),
      total: toPositiveInt(payload.total, rows.length),
      last_page: toPositiveInt(payload.last_page, 1),
    },
  };
};

const parseCategorySummary = (apiResponse, applications) => {
  const summary = apiResponse?.application_categories_summary;
  if (Array.isArray(summary) && summary.length > 0) {
    return summary.map((item) => ({
      id: item.id,
      label: item.label || "-",
      total: toPositiveInt(item.total, 0),
    }));
  }

  const totals = applications.reduce((acc, row) => {
    const categoryId = row?.application_category?.id;
    const categoryName = row?.application_category?.app_name || "Unknown";
    const key = String(categoryId || categoryName);
    if (!acc[key]) acc[key] = { id: categoryId || null, label: categoryName, total: 0 };
    acc[key].total += 1;
    return acc;
  }, {});

  return Object.values(totals);
};

const getStatusLabel = (statusId) => {
  if (statusId === null || statusId === undefined || statusId === "") return null;
  const id = Number(statusId);
  if (!Number.isFinite(id)) return null;
  if (id === 0) return "Yaliyowasilishwa";
  if (id === 1) return "Yanayochakatwa";
  if (id === 2) return "Yaliyokubaliwa";
  if (id === 3) return "Yaliyokataliwa";
  if (id === 4) return "Yaliyorudishwa";
  return null;
};

const buildPageTitle = (categories, selectedCategoryId, selectedStatusId) => {
  const parts = [];
  if (selectedCategoryId) {
    const selectedCategory = categories.find((item) => Number(item.id) === Number(selectedCategoryId));
    if (selectedCategory?.label) parts.push(selectedCategory.label);
  }

  const statusLabel = getStatusLabel(selectedStatusId);
  if (statusLabel) parts.push(statusLabel);

  if (!parts.length) return "Maombi Yote";
  return `Maombi - ${parts.join(" | ")}`;
};

const buildApplicationsUrl = (
  page,
  perPage,
  selectedCategoryId,
  selectedStatusId,
  search = "",
  selectedEstablishingSchoolId = null,
) => {
  const query = new URLSearchParams({
    page: String(page),
  });

  if (perPage) {
    query.set("per_page", String(perPage));
  }

  if (selectedCategoryId) {
    query.set("application_category_id", String(selectedCategoryId));
  }

  if (selectedStatusId !== null && selectedStatusId !== undefined) {
    query.set("is_approved", String(selectedStatusId));
  }
  if (search) {
    query.set("search", search);
  }
  if (selectedEstablishingSchoolId) {
    query.set("establishing_school_id", String(selectedEstablishingSchoolId));
  }

  return `${applicationsAPI}?${query.toString()}`;
};

const index = (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const perPage = toPerPage(req.query.per_page);
  const selectedCategoryId = toPositiveInt(req.query.application_category_id, null);
  const selectedStatusId = toNonNegativeInt(req.query.is_approved, null);
  const selectedEstablishingSchoolId = toPositiveInt(req.query.establishing_school_id, null);
  const searchTerm = toSearch(req.query.search);
  const url = buildApplicationsUrl(
    page,
    perPage,
    selectedCategoryId,
    selectedStatusId,
    searchTerm,
    selectedEstablishingSchoolId,
  );

  sendRequest(req, res, url, "GET", {}, (jsonData) => {
    const { applications, pagination, success } = parseApplicationsPayload(
      jsonData,
      page,
      perPage,
    );
    const categorySummary = parseCategorySummary(jsonData, applications);
    const pageTitle = buildPageTitle(categorySummary, selectedCategoryId, selectedStatusId);

    res.render(path.join(__dirname, "/../../views/applications"), {
      req,
      applications,
      pagination,
      success,
      routeBasePath: "/applications",
      categorySummary,
      selectedCategoryId,
      selectedStatusId,
      selectedWorkTab: null,
      selectedEstablishingSchoolId,
      searchTerm,
      pageTitle,
    });
  });
};

const list = (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const perPage = toPerPage(req.query.per_page, 10);
  const selectedCategoryId = toPositiveInt(req.query.application_category_id, null);
  const selectedStatusId = toNonNegativeInt(req.query.is_approved, null);
  const selectedEstablishingSchoolId = toPositiveInt(req.query.establishing_school_id, null);
  const searchTerm = toSearch(req.query.search);
  const url = buildApplicationsUrl(
    page,
    perPage,
    selectedCategoryId,
    selectedStatusId,
    searchTerm,
    selectedEstablishingSchoolId,
  );

  sendRequest(req, res, url, "GET", {}, (jsonData) => {
    const { applications, pagination, success } = parseApplicationsPayload(
      jsonData,
      page,
      perPage,
    );

    res.send({
      success,
      data: applications,
      pagination,
    });
  });
};

module.exports = {
  index,
  list,
};
