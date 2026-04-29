require("dotenv").config();
const express = require("express");
const request = require("request");
const permissionController = express.Router();
var session = require("express-session");
var path = require("path");
const { sendRequest, can, isAuthenticated, activeHandover, hasPermission } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
var allPermissionsAPI   = API_BASE_URL + "allPermissions";
var allModulesAPI   = API_BASE_URL + "allModules";
var tengenezaPermissionAPI = API_BASE_URL + "addPermission";
var editPermissionAPI   = API_BASE_URL + "editPermission";
var updatePermissionAPI = API_BASE_URL + "updatePermission";
var deletePermissionAPI = API_BASE_URL + "deletePermission";

const requireUpdatePermissionWithDebug = (req, res, next) => {
  const allowed = hasPermission(req, "update-permissions");
  console.log("[Permissions][Update][Guard]", {
    url: req.originalUrl,
    method: req.method,
    user_id: req?.session?.userID || null,
    allowed,
  });
  if (allowed) return next();
  return res.redirect("/403");
};

const safeSendRequest = (req, res, url, method = "GET", formData = {}, timeoutMs = 12000) =>
  new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ statusCode: 500, message: "Request timeout", data: [] });
    }, timeoutMs);

    try {
      sendRequest(req, res, url, method, formData, (body = {}) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(body || {});
      });
    } catch (error) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ statusCode: 500, message: error?.message || "Request failed", data: [] });
    }
  });


// Get all permissions
permissionController.get(
  "/Permissions",
  isAuthenticated,
  can("view-permissions"),
  activeHandover,
  function (req, res) {
    getAllPermissions(req, res);
  }
);

// Store Permission
permissionController.post("/tengenezaPermission",  isAuthenticated, function (req, res) {
  try {
    console.log("[Permissions][Create][UI] Incoming submit", {
      url: "/tengenezaPermission",
      method: "POST",
      payload: {
        permission_name: req.body.permission_name,
        display_name: req.body.display_name,
        module_id: req.body.module_id,
      },
      user_id: req?.session?.userID || null,
    });
    if (!hasPermission(req, "create-permissions")) {
      req.session.permissionForm = {
        values: {
          permission_name: String(req.body.permission_name || "").trim(),
          display_name: String(req.body.display_name || "").trim(),
          module_id: Number(req.body.module_id || 0) || "",
        },
        errors: {},
        general: "Huna ruhusa ya kusajili permission mpya.",
      };
      return res.redirect("/Permissions");
    }

    const permissionName = String(req.body.permission_name || "").trim();
    const displayName = String(req.body.display_name || "").trim();
    const moduleIdRaw = String(req.body.module_id ?? "").trim();
    const moduleId = Number.parseInt(moduleIdRaw, 10);
    const supportsModuleId = String(req.body.supports_module_id || "").trim() === "1";
    const values = {
      permission_name: permissionName,
      display_name: displayName,
      module_id: moduleIdRaw || "",
      supports_module_id: supportsModuleId ? "1" : "0",
    };
    const errors = {};

    if (!permissionName) errors.permission_name = "Permission name is required.";
    if (!displayName) errors.display_name = "Display name is required.";
    if (supportsModuleId) {
      if (!moduleIdRaw) {
        errors.module_id = "Module is required.";
      } else if (!Number.isFinite(moduleId) || moduleId < 1) {
        errors.module_id = "Invalid module_id.";
      }
    }

    if (Object.keys(errors).length > 0) {
      req.session.permissionForm = { values, errors, general: "" };
      return res.redirect("/Permissions");
    }

    const formData = {
      permissionName: permissionName,
      displayName: displayName,
      module_id: supportsModuleId ? moduleId : null,
    };

    safeSendRequest(req, res, tengenezaPermissionAPI, "POST", formData).then((body = {}) => {
      const statusCode = Number(body.statusCode || 500);
      const message = String(body.message || "Kuna shida tafadhali wasiliana na Misimamizi wa Mfumo. ");
      console.log("[Permissions][Create][UI->API] Response", {
        api_url: tengenezaPermissionAPI,
        statusCode,
        message,
      });

      if (statusCode === 300) {
        req.flash("success", message);
        req.session.permissionForm = null;
        return res.redirect("/Permissions");
      }

      const normalized = message.toLowerCase();
      if (normalized.includes("already exists") || normalized.includes("duplicate")) {
        errors.permission_name = "Permission already exists.";
      } else if (normalized.includes("invalid module_id")) {
        errors.module_id = "Invalid module_id.";
      } else if (normalized.includes("moduli") || normalized.includes("module")) {
        errors.module_id = "Module is required.";
      } else if (normalized.includes("permission name is required")) {
        errors.permission_name = "Permission name is required.";
      }

      req.session.permissionForm = {
        values,
        errors,
        general: Object.keys(errors).length > 0 ? "" : message,
      };
      return res.redirect("/Permissions");
    });
  } catch (error) {
    req.session.permissionForm = {
      values: {
        permission_name: String(req.body.permission_name || "").trim(),
        display_name: String(req.body.display_name || "").trim(),
        module_id: String(req.body.module_id || "").trim(),
      },
      errors: {},
      general: "Imeshindikana kusajili permission. Tafadhali jaribu tena.",
    };
    return res.redirect("/Permissions");
  }
});

// Edit Permission
permissionController.get("/Permissions/:id",  isAuthenticated, requireUpdatePermissionWithDebug, function (req, res) {
  var id = Number(req.params.id);
  safeSendRequest(req, res, editPermissionAPI + "/" + id, "GET", {}).then((jsonData = {}) => {
      if (Number(jsonData.statusCode) !== 300 || !Array.isArray(jsonData.data) || jsonData.data.length === 0) {
        req.flash("error", "Permission uliyotaka kubadili haijapatikana.");
        return getAllPermissions(req, res, false, null);
      }
      return getAllPermissions(req, res, true, jsonData.data);
  });
});

// Update Permission
permissionController.post("/badiliPermission/:id",  isAuthenticated, requireUpdatePermissionWithDebug, function (req, res) {
  var id = Number(req.params.id);
  console.log("[Permissions][Update][UI] Incoming submit", {
    url: "/badiliPermission/" + id,
    method: "POST",
    payload: {
      permission_name: req.body.permission_name,
      display_name: req.body.display_name,
      module_id: req.body.module_id,
      status: req.body.status,
      is_default: req.body.is_default,
    },
    user_id: req?.session?.userID || null,
  });
  const permissionName = String(req.body.permission_name || "").trim();
  const displayName = String(req.body.display_name || "").trim();
  const moduleIdRaw = String(req.body.module_id ?? "").trim();
  const moduleId = Number.parseInt(moduleIdRaw, 10);
  const supportsModuleId = String(req.body.supports_module_id || "").trim() === "1";
  const values = {
    permission_name: permissionName,
    display_name: displayName,
    module_id: moduleIdRaw || "",
    supports_module_id: supportsModuleId ? "1" : "0",
  };
  const errors = {};
  if (!permissionName) errors.permission_name = "Permission name is required.";
  if (!displayName) errors.display_name = "Display name is required.";
  if (supportsModuleId) {
    if (!moduleIdRaw) {
      errors.module_id = "Module is required.";
    } else if (!Number.isInteger(moduleId) || moduleId < 1) {
      errors.module_id = "Module must be a valid integer.";
    }
  }

  if (Object.keys(errors).length > 0) {
    req.session.permissionForm = { values, errors, general: "" };
    return res.redirect("/Permissions/" + id);
  }

  var formData = {
          permissionName: permissionName,
          displayName: displayName,
          module_id: supportsModuleId ? moduleId : null,
          status: req.body.status,
          is_default: req.body.is_default,
  }
  safeSendRequest(req, res, updatePermissionAPI + "/" + id, "PUT", formData).then((jsonData = {}) => {
        var statusCode = Number(jsonData.statusCode || 500);
        var message = String(jsonData.message || "Kuna shida tafadhali wasiliana na Misimamizi wa Mfumo. ");
        console.log("[Permissions][Update][UI->API] Response", {
          api_url: updatePermissionAPI + "/" + id,
          method: "PUT",
          statusCode,
          message,
        });
        if ([200, 201, 300].includes(statusCode)) {
          req.flash("success", message);
          req.session.permissionForm = null;
          return res.redirect("/Permissions");
        }

        const normalized = message.toLowerCase();
        if (normalized.includes("already exists") || normalized.includes("duplicate")) {
          errors.permission_name = "Permission already exists.";
        } else if (normalized.includes("invalid module_id")) {
          errors.module_id = "Invalid module_id.";
        } else if (normalized.includes("display name is required")) {
          errors.display_name = "Display name is required.";
        } else if (normalized.includes("permission name is required")) {
          errors.permission_name = "Permission name is required.";
        }
        req.session.permissionForm = {
          values,
          errors,
          general: Object.keys(errors).length > 0 ? "" : message,
        };
        return res.redirect("/Permissions/" + id);
  }).catch((error) => {
        req.session.permissionForm = {
          values,
          errors: {},
          general: String(error?.message || "Imeshindikana kubadili permission. Tafadhali jaribu tena."),
        };
        return res.redirect("/Permissions/" + id);
  });
});

// Delete Permission
permissionController.post("/futaPermission/:id",  isAuthenticated, can('delete-permissions'), function (req, res) {
  var id = Number(req.params.id);
  sendRequest(req, res, deletePermissionAPI + "/" + id, "DELETE", {}, (jsonData) => {
        var statusCode = jsonData.statusCode;
        var message = jsonData.message;
        req.flash(statusCode == 300 ? "success" : "error", message);
        res.redirect("/Permissions");
  });
});

async function getAllPermissions(req, res, edit = false, editedData = null) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var filter = String(req.query.filter || "all").toLowerCase();
  var tafuta = String(req.query.tafuta || "").trim();
  var url = allPermissionsAPI + "?page=" + page + "&per_page=" + per_page;
  if (filter === "active") {
    url += "&status=1";
  } else if (filter === "default") {
    url += "&is_default=1";
  } else {
    filter = "all";
  }
  var formData = {
            browser_used: req.session.browser_used,
            ip_address: req.session.ip_address,
            useLevel: req.session.UserLevel,
            office: req.session.office,
            tafuta : req.query.tafuta
   };
  const permissionForm =
    req.session && req.session.permissionForm && typeof req.session.permissionForm === "object"
      ? req.session.permissionForm
      : { values: {}, errors: {}, general: "" };
  if (req.session) req.session.permissionForm = null;

  const jsonData = await safeSendRequest(req, res, url, "GET", formData);
  if (!jsonData || typeof jsonData !== "object") {
    req.flash("error", "Imeshindikana kupakia permissions kwa sasa.");
    return res.render(path.join(__dirname + "/../views/permissions"), {
      req,
      data: [],
      modules: [],
      currentFilter: filter,
      activeTotal: 0,
      defaultTotal: 0,
      useLev: req.session.UserLevel,
      userName: req.session.userName,
      RoleManage: req.session.RoleManage,
      userID: req.session.userID,
      cheoName: req.session.cheoName,
      edit,
      ePermission: editedData,
      permissionForm,
      permissionSupportsModuleId: true,
      pagination: {
        total: 0,
        current: Number(page),
        per_page: Number(per_page),
        url: filter === "all" ? "Permissions" : `Permissions?filter=${filter}`,
        pages: 0,
      },
    });
  }

  var statusCode = jsonData.statusCode;
  var data = Array.isArray(jsonData.data) ? jsonData.data : [];
  var numRows = Number(jsonData.numRows || data.length || 0);
  const permissionSupportsModuleId =
    typeof jsonData.hasModuleId === "boolean" ? jsonData.hasModuleId : true;

  if (statusCode == 209) {
    return res.redirect("/");
  }

  const [activeResponse, defaultResponse, moduleResponse] = await Promise.all([
    safeSendRequest(req, res, allPermissionsAPI + "?page=1&per_page=1&status=1", "GET", {}),
    safeSendRequest(req, res, allPermissionsAPI + "?page=1&per_page=1&is_default=1", "GET", {}),
    safeSendRequest(req, res, allModulesAPI + "?page=1&per_page=500&is_paginated=false&status=1", "GET", {}),
  ]);

  const activeTotal =
    activeResponse && activeResponse.statusCode === 300
      ? Number(activeResponse.numRows || 0)
      : 0;

  const defaultTotal =
    defaultResponse && defaultResponse.statusCode === 300
      ? Number(defaultResponse.numRows || 0)
      : 0;

  const modules =
    moduleResponse && moduleResponse.statusCode === 300 && Array.isArray(moduleResponse.data)
      ? moduleResponse.data
      : [];

  if (statusCode !== 300) {
    req.flash("error", String(jsonData.message || "Imeshindikana kupakia permissions kwa sasa."));
  }

  return res.render(path.join(__dirname + "/../views/permissions"), {
    req: req,
    data: data,
    modules: modules,
    currentFilter: filter,
    activeTotal: activeTotal,
    defaultTotal: defaultTotal,
    useLev: req.session.UserLevel,
    userName: req.session.userName,
    RoleManage: req.session.RoleManage,
    userID: req.session.userID,
    cheoName: req.session.cheoName,
    edit: edit,
    ePermission: editedData,
    permissionForm,
    permissionSupportsModuleId,
    pagination: {
      total: Number(numRows),
      current: Number(page),
      per_page: Number(per_page),
      url: (() => {
        const params = new URLSearchParams();
        if (filter !== "all") params.set("filter", filter);
        if (tafuta) params.set("tafuta", tafuta);
        const query = params.toString();
        return query ? `Permissions?${query}` : "Permissions";
      })(),
      pages: Math.ceil(Number(numRows) / Number(per_page)),
    },
  });
}
module.exports = permissionController;
