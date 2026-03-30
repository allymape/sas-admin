require("dotenv").config();
const express = require("express");
const path = require("path");
const {
  sendRequest,
  modifiedUrl,
  isAuthenticated,
  hasPermission,
} = require("../../util");

const handoverController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const handoverListAPI = `${API_BASE_URL}handover-list`;
const handoverAssignedListAPI = `${API_BASE_URL}handover-assigned-list`;
const handoverPendingApprovalsAPI = `${API_BASE_URL}handover-pending-approvals`;
const handoverAllListAPI = `${API_BASE_URL}handover-all-list`;
const handoverAuditListAPI = `${API_BASE_URL}handover-audit-list`;
const createHandoverAPI = `${API_BASE_URL}handover`;
const stopHandoverAPI = `${API_BASE_URL}stop-handover`;
const myActivehandoverAPI = `${API_BASE_URL}my-active-handover`;
const myProfileAPI = `${API_BASE_URL}my-profile`;

const getPagination = (req = {}) => {
  const perPage = Math.max(1, Number.parseInt(req.query?.per_page || req.body?.per_page || 10, 10) || 10);
  const page = Math.max(1, Number.parseInt(req.query?.page || req.body?.page || 1, 10) || 1);
  return { page, perPage };
};

const hasHandoverModuleAccess = (req = {}) =>
  hasPermission(req, "create-handover|update-handover|approve-handover|view-audit|view-profile");

const hasApproverAccess = (req = {}) =>
  hasPermission(req, "approve-handover|update-handover|view-audit");

const hasAllHandoversAccess = (req = {}) =>
  hasPermission(req, "view-audit|approve-handover|update-handover");

const moduleGuard = (req, res, next) => {
  if (hasHandoverModuleAccess(req)) return next();
  return res.redirect("/403");
};

const roleGuard = (predicate) => (req, res, next) => {
  if (typeof predicate === "function" && predicate(req)) return next();
  return res.redirect("/403");
};

const renderModulePage = (activeTab = "my") => (req, res) => {
  sendRequest(req, res, myProfileAPI, "POST", {}, (jsonData = {}) => {
    const staffs = Array.isArray(jsonData?.staffs) ? jsonData.staffs : [];
    res.render(path.join(__dirname + "/../views/handover/index"), {
      req,
      staffs,
      activeTab,
      canApproveHandover: hasApproverAccess(req),
      canViewAllHandovers: hasAllHandoversAccess(req),
      message: "",
    });
  });
};

const forwardAction = (req, res, apiUrl, method, payload = {}) => {
  sendRequest(req, res, apiUrl, method, payload, (jsonData = {}) => {
    res.send({
      statusCode: Number(jsonData?.statusCode || 306),
      message: jsonData?.message || "Operation failed.",
      handover: jsonData?.handover || null,
      data: jsonData?.data || null,
    });
  });
};

const buildListApiConfig = (view = "my", req = {}) => {
  const normalizedView = String(view || "my").trim().toLowerCase();
  const { page, perPage } = getPagination(req);
  const status = req.query?.status || "";
  const scopeType = req.query?.scope_type || "";
  const fromDate = req.query?.from_date || "";
  const toDate = req.query?.to_date || "";

  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (status) query.set("status", status);
  if (scopeType) query.set("scope_type", scopeType);
  if (fromDate) query.set("from_date", fromDate);
  if (toDate) query.set("to_date", toDate);

  if (normalizedView === "assigned") {
    return { url: `${handoverAssignedListAPI}?${query.toString()}`, key: "handovers", page, perPage };
  }

  if (normalizedView === "approvals") {
    return { url: `${handoverPendingApprovalsAPI}?${query.toString()}`, key: "handovers", page, perPage };
  }

  if (normalizedView === "all") {
    return { url: `${handoverAllListAPI}?${query.toString()}`, key: "handovers", page, perPage };
  }

  if (normalizedView === "audit") {
    return { url: `${handoverAuditListAPI}?${query.toString()}`, key: "audits", page, perPage };
  }

  return { url: `${handoverListAPI}?${query.toString()}`, key: "handovers", page, perPage };
};

// Dedicated module pages
handoverController.get("/Handover/My", isAuthenticated, moduleGuard, renderModulePage("my"));
handoverController.get("/Handover/Assigned", isAuthenticated, moduleGuard, renderModulePage("assigned"));
handoverController.get("/Handover/Approvals", isAuthenticated, moduleGuard, roleGuard(hasApproverAccess), renderModulePage("approvals"));
handoverController.get("/Handover/Audit", isAuthenticated, moduleGuard, renderModulePage("audit"));
handoverController.get("/Handover/All", isAuthenticated, moduleGuard, roleGuard(hasAllHandoversAccess), renderModulePage("all"));

// Data listing endpoint for module pages
handoverController.get("/Handover/List", isAuthenticated, moduleGuard, (req, res) => {
  const view = String(req.query?.view || "my").toLowerCase();
  if (view === "approvals" && !hasApproverAccess(req)) {
    return res.send({ statusCode: 403, message: "403 Forbidden", data: [] });
  }
  if (view === "all" && !hasAllHandoversAccess(req)) {
    return res.send({ statusCode: 403, message: "403 Forbidden", data: [] });
  }

  const listConfig = buildListApiConfig(view, req);
  sendRequest(req, res, listConfig.url, "GET", {}, (jsonData = {}) => {
    const rows = Array.isArray(jsonData?.[listConfig.key]) ? jsonData[listConfig.key] : [];
    const numRows = Number(jsonData?.numRows || 0);
    res.send({
      statusCode: Number(jsonData?.statusCode || 306),
      data: rows,
      message: jsonData?.message || "",
      pagination: {
        total: numRows,
        current: listConfig.page,
        per_page: listConfig.perPage,
        url: modifiedUrl(req),
        pages: Math.ceil(numRows / listConfig.perPage),
      },
      activeHandover: Boolean(jsonData?.activeHandover),
    });
  });
});

handoverController.get("/Handover/Details/:id", isAuthenticated, moduleGuard, (req, res) => {
  sendRequest(req, res, `${API_BASE_URL}handover/${req.params.id}/details`, "GET", {}, (jsonData = {}) => {
    res.send({
      statusCode: Number(jsonData?.statusCode || 306),
      message: jsonData?.message || "",
      data: jsonData?.handover || null,
    });
  });
});

handoverController.get("/Handover/Audits/:id", isAuthenticated, moduleGuard, (req, res) => {
  const { page, perPage } = getPagination(req);
  sendRequest(
    req,
    res,
    `${API_BASE_URL}handover/${req.params.id}/audits?page=${page}&per_page=${perPage}`,
    "GET",
    {},
    (jsonData = {}) => {
      const rows = Array.isArray(jsonData?.audits) ? jsonData.audits : [];
      const total = Number(jsonData?.numRows || 0);
      res.send({
        statusCode: Number(jsonData?.statusCode || 306),
        message: jsonData?.message || "",
        data: rows,
        pagination: {
          total,
          current: page,
          per_page: perPage,
          pages: Math.ceil(total / perPage),
        },
      });
    },
  );
});

// Lifecycle actions
handoverController.post("/Handover/Create", isAuthenticated, moduleGuard, (req, res) => {
  forwardAction(req, res, createHandoverAPI, "POST", req.body || {});
});

handoverController.post("/Handover/Update/:id", isAuthenticated, moduleGuard, (req, res) => {
  forwardAction(req, res, `${API_BASE_URL}handover/${req.params.id}`, "PUT", req.body || {});
});

handoverController.post("/Handover/Submit/:id", isAuthenticated, moduleGuard, (req, res) => {
  forwardAction(req, res, `${API_BASE_URL}handover/${req.params.id}/submit`, "PUT", {});
});

handoverController.post("/Handover/Cancel/:id", isAuthenticated, moduleGuard, (req, res) => {
  forwardAction(req, res, `${API_BASE_URL}handover/${req.params.id}/cancel`, "PUT", {});
});

handoverController.post("/Handover/Reclaim/:id", isAuthenticated, moduleGuard, (req, res) => {
  forwardAction(req, res, `${API_BASE_URL}handover/${req.params.id}/reclaim`, "PUT", {});
});

handoverController.post("/Handover/Approve/:id", isAuthenticated, moduleGuard, (req, res) => {
  if (!hasApproverAccess(req)) {
    return res.send({ statusCode: 403, message: "403 Forbidden" });
  }
  forwardAction(req, res, `${API_BASE_URL}handover/${req.params.id}/approve`, "PUT", {});
});

handoverController.post("/Handover/Reject/:id", isAuthenticated, moduleGuard, (req, res) => {
  if (!hasApproverAccess(req)) {
    return res.send({ statusCode: 403, message: "403 Forbidden" });
  }
  forwardAction(req, res, `${API_BASE_URL}handover/${req.params.id}/reject`, "PUT", {
    reason: req.body?.reason || "",
  });
});

handoverController.post("/Handover/RunMaintenance", isAuthenticated, moduleGuard, (req, res) => {
  if (!hasApproverAccess(req)) {
    return res.send({ statusCode: 403, message: "403 Forbidden" });
  }
  forwardAction(req, res, `${API_BASE_URL}handover/run-maintenance`, "POST", {});
});

// Legacy endpoints used by Profile > Kaimisha (compatibility)
handoverController.get("/MyHandover", isAuthenticated, function (req, res) {
  const { page, perPage } = getPagination(req);
  sendRequest(req, res, `${handoverListAPI}?page=${page}&per_page=${perPage}`, "GET", {}, (jsonData = {}) => {
    const handovers = Array.isArray(jsonData?.handovers) ? jsonData.handovers : [];
    const numRows = Number(jsonData?.numRows || 0);
    const statusCode = Number(jsonData?.statusCode || 306);
    res.send({
      statusCode,
      data: statusCode === 300 ? handovers : [],
      activeHandover: statusCode === 300 ? Boolean(jsonData?.activeHandover) : false,
      pagination: {
        total: numRows,
        current: page,
        per_page: perPage,
        url: modifiedUrl(req),
        pages: Math.ceil(numRows / perPage),
      },
    });
  });
});

handoverController.post("/Handover", isAuthenticated, (req, res) => {
  forwardAction(req, res, createHandoverAPI, "POST", req.body || {});
});

handoverController.post("/StopHandover", isAuthenticated, (req, res) => {
  forwardAction(req, res, stopHandoverAPI, "PUT", {});
});

// Explicit active-status helper for module scripts
handoverController.get("/Handover/ActiveStatus", isAuthenticated, moduleGuard, (req, res) => {
  sendRequest(req, res, myActivehandoverAPI, "POST", {}, (jsonData = {}) => {
    res.send({
      statusCode: Number(jsonData?.statusCode || 306),
      active: Boolean(jsonData?.active),
      outgoing_handover: jsonData?.outgoing_handover || null,
    });
  });
});

module.exports = handoverController;
