require("dotenv").config();
const path = require("path");
const request = require("request");
const { sendRequest } = require("../../../util");

const API_BASE_URL = process.env.API_BASE_URL;
const myApplicationsAPI = API_BASE_URL + "applications/my-applications";
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

const toWorkTab = (value, fallback = "pending") => {
  const tab = String(value || fallback).toLowerCase();
  return ["pending", "handled"].includes(tab) ? tab : fallback;
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

const buildPageTitle = (categories, selectedCategoryId, selectedStatusId, selectedWorkTab = "pending") => {
  const parts = ["Maombi Yangu"];

  if (selectedWorkTab === "pending") parts.push("Maombi Yanayosubiri");
  if (selectedWorkTab === "handled") parts.push("Maombi Yaliyoshughulikiwa");

  if (selectedCategoryId) {
    const selectedCategory = categories.find((item) => Number(item.id) === Number(selectedCategoryId));
    if (selectedCategory?.label) parts.push(selectedCategory.label);
  }

  const statusLabel = getStatusLabel(selectedStatusId);
  if (statusLabel) parts.push(statusLabel);

  return parts.join(" - ");
};

const buildApplicationsUrl = (page, perPage, selectedCategoryId, selectedStatusId, selectedWorkTab = "pending", search = "") => {
  const query = new URLSearchParams({
    page: String(page),
    work_tab: selectedWorkTab,
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

  return `${myApplicationsAPI}?${query.toString()}`;
};

const buildAttendPath = (trackingNumber) =>
  `/my-applications/${encodeURIComponent(trackingNumber)}/attend`;

const redirectAttendWithToast = (res, trackingNumber, toastType, message, hash = "") =>
  res.redirect(
    `${buildAttendPath(trackingNumber)}?toast_type=${encodeURIComponent(toastType)}&toast_message=${encodeURIComponent(message)}${hash ? `#${String(hash).replace(/^#/, "")}` : ""}`,
  );

const fetchApplicationByTracking = (req, trackingNumber, callback) => {
  const url = `${applicationsAPI}/${encodeURIComponent(trackingNumber)}`;
  request(
    {
      url,
      method: "GET",
      json: true,
      headers: {
        Authorization: `Bearer ${req.session.Token}`,
      },
    },
    (error, response, body) => {
      if (error) {
        return callback({
          ok: false,
          statusCode: 500,
          message: "Error! Unable to open this application.",
        });
      }

      if (response?.statusCode === 404) {
        return callback({
          ok: false,
          statusCode: 404,
          message: body?.message || `Warning! Application ${trackingNumber} was not found.`,
        });
      }

      if (!response || response.statusCode !== 200) {
        return callback({
          ok: false,
          statusCode: response?.statusCode || 500,
          message: body?.message || "Error! Something went wrong. Try again.",
        });
      }

      const jsonData = body || {};
      const success = jsonData?.success !== false;
      const application = jsonData?.data || null;

      if (!success || !application) {
        return callback({
          ok: false,
          statusCode: 404,
          message: jsonData?.message || `Warning! Application ${trackingNumber} was not found.`,
        });
      }

      return callback({
        ok: true,
        application,
      });
    },
  );
};

const canCurrentUserTakeAction = (req, application) => {
  const approvalStatus = Number(application?.is_approved);
  const loggedInStaffId = Number(req?.user?.staff_id || req?.user?.id);
  const assignedStaffId = Number(
    application?.staff_id ||
    application?.assigned_staff?.id ||
    application?.current_staff?.id,
  );
  const canAttendByPendingRule = typeof application?.can_attend === "boolean"
    ? application.can_attend
    : null;
  const workflowContext = application?.workflow || {};
  const isCurrentAssigneeByWorkflow = Boolean(workflowContext?.is_current_assignee);
  const allowedActions = Array.isArray(workflowContext?.allowed_actions)
    ? workflowContext.allowed_actions
    : [];
  const isAssignedToLoggedInStaff = Number.isFinite(loggedInStaffId)
    && Number.isFinite(assignedStaffId)
    && loggedInStaffId === assignedStaffId;

  return canAttendByPendingRule !== null
    ? canAttendByPendingRule
    : (
      [0, 1].includes(approvalStatus)
      && (isCurrentAssigneeByWorkflow || allowedActions.length > 0 || isAssignedToLoggedInStaff)
    );
};

const index = (req, res) => {
  const page = toPositiveInt(req.query.page, 1);
  const perPage = toPerPage(req.query.per_page);
  const selectedCategoryId = toPositiveInt(req.query.application_category_id, null);
  const selectedStatusId = toNonNegativeInt(req.query.is_approved, null);
  const selectedWorkTab = toWorkTab(req.query.work_tab, "pending");
  const searchTerm = toSearch(req.query.search);
  const url = buildApplicationsUrl(page, perPage, selectedCategoryId, selectedStatusId, selectedWorkTab, searchTerm);

  sendRequest(req, res, url, "GET", {}, (jsonData) => {
    const { applications, pagination, success } = parseApplicationsPayload(
      jsonData,
      page,
      perPage,
    );
    const categorySummary = parseCategorySummary(jsonData, applications);
    const pageTitle = buildPageTitle(categorySummary, selectedCategoryId, selectedStatusId, selectedWorkTab);

    res.render(path.join(__dirname, "/../../views/applications"), {
      req,
      applications,
      pagination,
      success,
      routeBasePath: "/my-applications",
      categorySummary,
      selectedCategoryId,
      selectedStatusId,
      selectedWorkTab,
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
  const selectedWorkTab = toWorkTab(req.query.work_tab, "pending");
  const searchTerm = toSearch(req.query.search);
  const url = buildApplicationsUrl(page, perPage, selectedCategoryId, selectedStatusId, selectedWorkTab, searchTerm);

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

const attend = (req, res) => {
  const trackingNumber = String(req.params.trackingNumber || "").trim();
  if (!trackingNumber) {
    return res.redirect("/my-applications");
  }

  fetchApplicationByTracking(req, trackingNumber, (result) => {
    if (!result?.ok) {
      const toastType = result?.statusCode === 404 ? "warning" : "error";
      return res.redirect(
        `/my-applications?toast_type=${encodeURIComponent(toastType)}&toast_message=${encodeURIComponent(result?.message || "Error! Something went wrong. Try again.")}`,
      );
    }

    const application = result.application;
    const canTakeAction = canCurrentUserTakeAction(req, application);
    const categoryName = String(application?.application_category?.app_name || "-").toUpperCase();
    return res.render(path.join(__dirname, "/../../views/applications/attend"), {
      req,
      success: true,
      application,
      canTakeAction,
      pageTitle: `OMBI LA ${categoryName}`,
    });
  });
};

const addComment = (req, res) => {
  const trackingNumber = String(req.params.trackingNumber || "").trim();
  const content = String(req.body.content || "").trim();

  if (!trackingNumber) {
    return res.redirect("/my-applications");
  }

  if (!content) {
    return redirectAttendWithToast(res, trackingNumber, "warning", "Warning! Please enter your comment.", "comments-info");
  }

  fetchApplicationByTracking(req, trackingNumber, (result) => {
    if (!result?.ok) {
      return redirectAttendWithToast(
        res,
        trackingNumber,
        result?.statusCode === 404 ? "warning" : "error",
        result?.message || "Error! Unable to open this application.",
        "comments-info",
      );
    }

    if (!canCurrentUserTakeAction(req, result.application)) {
      return redirectAttendWithToast(
        res,
        trackingNumber,
        "warning",
        "Warning! You are not allowed to add comments on this application right now.",
        "comments-info",
      );
    }

    const url = `${applicationsAPI}/${encodeURIComponent(trackingNumber)}/comment`;
    request(
      {
        url,
        method: "POST",
        json: true,
        headers: {
          Authorization: `Bearer ${req.session.Token}`,
        },
        body: {
          content,
        },
      },
      (error, response, body) => {
        if (error) {
          return redirectAttendWithToast(
            res,
            trackingNumber,
            "danger",
            "Error! Unable to save comment.",
            "comments-info",
          );
        }

        if (!response || response.statusCode >= 400 || body?.success === false) {
          const message = body?.message || "Error! Unable to save comment.";
          return redirectAttendWithToast(res, trackingNumber, "error", message, "comments-info");
        }

        return redirectAttendWithToast(
          res,
          trackingNumber,
          "success",
          "Success! Comment saved successfully.",
          "comments-info",
        );
      },
    );
  });
};

const submitWorkflowAction = (req, res) => {
  const trackingNumber = String(req.params.trackingNumber || "").trim();
  const action = String(req.body.action || "").trim();
  const content = String(req.body.content || "").trim();
  const targetStaffId = String(req.body.target_staff_id || "").trim();

  if (!trackingNumber) {
    return res.redirect("/my-applications");
  }

  if (!action) {
    return redirectAttendWithToast(res, trackingNumber, "warning", "Warning! Please choose workflow action.", "comments-info");
  }

  if (!content) {
    return redirectAttendWithToast(res, trackingNumber, "warning", "Warning! Please enter recommendation or comment.", "comments-info");
  }

  fetchApplicationByTracking(req, trackingNumber, (result) => {
    if (!result?.ok) {
      return redirectAttendWithToast(
        res,
        trackingNumber,
        result?.statusCode === 404 ? "warning" : "error",
        result?.message || "Error! Unable to open this application.",
        "comments-info",
      );
    }

    if (!canCurrentUserTakeAction(req, result.application)) {
      return redirectAttendWithToast(
        res,
        trackingNumber,
        "warning",
        "Warning! You are not allowed to perform workflow action on this application right now.",
        "comments-info",
      );
    }

    const url = `${applicationsAPI}/${encodeURIComponent(trackingNumber)}/advance`;
    request(
      {
        url,
        method: "POST",
        json: true,
        headers: {
          Authorization: `Bearer ${req.session.Token}`,
        },
        body: {
          action,
          content,
          target_staff_id: targetStaffId || null,
        },
      },
      (error, response, body) => {
        if (error) {
          return redirectAttendWithToast(
            res,
            trackingNumber,
            "danger",
            "Error! Unable to process workflow action.",
            "comments-info",
          );
        }

        if (!response || response.statusCode >= 400 || body?.success === false) {
          const message = body?.message || "Error! Unable to process workflow action.";
          return redirectAttendWithToast(res, trackingNumber, "error", message, "comments-info");
        }

        return redirectAttendWithToast(
          res,
          trackingNumber,
          "success",
          "Success! Workflow action completed.",
          "comments-info",
        );
      },
    );
  });
};

module.exports = {
  index,
  list,
  attend,
  addComment,
  submitWorkflowAction,
};
