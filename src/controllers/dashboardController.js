require("dotenv").config();
const express = require("express");
const request = require("request");
const dashboardController = express.Router();
// var session = require("express-session");
var path = require("path");
const {  can, isAuthenticated, greating, activeHandover, hasPermission, validateGeoLocation } = require("../../util");
const { dash } = require("pdfkit");
const { send } = require("process");
const { sendRequest } = require("../helpers/requestHelper");
var API_BASE_URL = process.env.API_BASE_URL;
var mapDataAPI = API_BASE_URL + "map-data";
var updateMarkerAPI = API_BASE_URL + "update-marker";
var dashboardFilterAPI = API_BASE_URL + "dashboard-filters";
var schoolByCategoriesAPI = API_BASE_URL+ "schools-summary-by-regions-and-categories"
var schoolSummariesAPI = API_BASE_URL + "school-summaries";
var numberOfSchoolByYearsAPI = API_BASE_URL + "number-of-schools-by-year-of-regitration";
var registeredSchoolsByPeriodAPI = API_BASE_URL + "registered-schools-by-period";
const DASHBOARD_VIEW_PATH = path.join(__dirname, "/../views/dashboard/index");
const DASHBOARD_RENDER_TIMEOUT_MS = Number.parseInt(
  process.env.DASHBOARD_RENDER_TIMEOUT_MS || "5000",
  10,
);

const defaultDashboardSummary = () => ({
  registrations: { total: 0 },
  categories: [],
  owners: [],
  applications: [],
  structures: [],
});

const defaultRegisteredSchoolsByPeriod = () => ({
  todayRecent: { rows: [], total: 0, source: "recent" },
  week: { rows: [], total: 0 },
  month: { rows: [], total: 0 },
  year: { rows: [], total: 0 },
});

const withTimeout = (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);

const parseRegisteredSchoolsPeriodResponse = (response, fallbackPeriod = "recent") => {
  if (!response || typeof response !== "object") return null;

  const statusCode = Number(response.statusCode);
  if (statusCode !== 300) return null;

  const payload = response?.data && typeof response.data === "object"
    ? response.data
    : {};
  const nestedPayload = payload?.data && typeof payload.data === "object"
    ? payload.data
    : payload;

  return {
    period: nestedPayload.period || String(fallbackPeriod || "recent"),
    rows: Array.isArray(nestedPayload.rows) ? nestedPayload.rows : [],
    total: Number(nestedPayload.total || 0),
  };
};

const fetchRegisteredSchoolsByPeriod = async (req, res, period, limit = 10) => {
  try {
    const query = new URLSearchParams({
      period: String(period || "recent"),
      limit: String(Number.isFinite(Number(limit)) ? Number(limit) : 10),
    }).toString();
    let response = await withTimeout(
      sendRequest(req, res, `${registeredSchoolsByPeriodAPI}?${query}`, "GET", {}),
      Number.isFinite(DASHBOARD_RENDER_TIMEOUT_MS) ? DASHBOARD_RENDER_TIMEOUT_MS : 2500,
    );

    let parsed = parseRegisteredSchoolsPeriodResponse(response, period);
    if (parsed) {
      return parsed;
    }

    if (!response) {
      response = await sendRequest(req, res, `${registeredSchoolsByPeriodAPI}?${query}`, "GET", {});
      parsed = parseRegisteredSchoolsPeriodResponse(response, period);
      if (parsed) {
        return parsed;
      }
    }

    console.error(`Dashboard period fetch unexpected response (${period}):`, {
      hasResponse: Boolean(response),
      statusCode: Number(response?.statusCode || 0),
      message: response?.message || null,
      success: response?.success,
      error: response?.error,
      dataType: typeof response?.data,
      hasRows: Array.isArray(response?.data?.rows),
      rowCount: Array.isArray(response?.data?.rows) ? response.data.rows.length : 0,
    });
  } catch (error) {
    console.error(`Dashboard period fetch error (${period}):`, {
      message: error?.message || String(error),
      responseStatus: error?.response?.status,
      responseData: error?.response?.data || null,
    });
  }

  return {
    period: String(period || "recent"),
    rows: [],
    total: 0,
  };
};

const fetchAllRegisteredSchoolPeriods = async (req, res) => {
  // Sequential fetch helps avoid overloading DB with 5 heavy joins at once.
  const todayData = await fetchRegisteredSchoolsByPeriod(req, res, "today", 10);
  const recentData = await fetchRegisteredSchoolsByPeriod(req, res, "recent", 10);
  const weekData = await fetchRegisteredSchoolsByPeriod(req, res, "week", 10);
  const monthData = await fetchRegisteredSchoolsByPeriod(req, res, "month", 10);
  const yearData = await fetchRegisteredSchoolsByPeriod(req, res, "year", 10);

  const todayRows = Array.isArray(todayData.rows) ? todayData.rows : [];
  const recentRows = Array.isArray(recentData.rows) ? recentData.rows : [];

  return {
    todayRecent: {
      rows: todayRows.length > 0 ? todayRows : recentRows,
      // If we fallback to "recent" rows, avoid showing all-time total on the badge.
      total: todayRows.length > 0 ? Number(todayData.total || 0) : Number(recentRows.length || 0),
      source: todayRows.length > 0 ? "today" : "recent",
      todayTotal: Number(todayData.total || 0),
      recentTotal: Number(recentData.total || 0),
      recentVisible: Number(recentRows.length || 0),
    },
    week: {
      rows: Array.isArray(weekData.rows) ? weekData.rows : [],
      total: Number(weekData.total || 0),
    },
    month: {
      rows: Array.isArray(monthData.rows) ? monthData.rows : [],
      total: Number(monthData.total || 0),
    },
    year: {
      rows: Array.isArray(yearData.rows) ? yearData.rows : [],
      total: Number(yearData.total || 0),
    },
  };
};

// Comprehensive dashboard
const dashboard = async (req, res) => {
  try {
    const fallbackSummary = req.session.dashboardSummaryCache || defaultDashboardSummary();
    let response = await withTimeout(
      sendRequest(req, res, schoolSummariesAPI, "GET", {}),
      Number.isFinite(DASHBOARD_RENDER_TIMEOUT_MS) ? DASHBOARD_RENDER_TIMEOUT_MS : 2500,
    );

    // On first-load timeout (no cache), try one direct fetch so cards like UMILIKI are not empty.
    if (!response?.data && !req.session.dashboardSummaryCache) {
      response = await sendRequest(req, res, schoolSummariesAPI, "GET", {});
    }

    const summary = response?.data || fallbackSummary;
    const {
      registrations = { total: 0 },
      owners = [],
      categories = [],
      applications = [],
      structures = [],
    } = summary;

    if (response?.data) {
      req.session.dashboardSummaryCache = summary;
    }

    const registeredSchoolsByPeriod = await fetchAllRegisteredSchoolPeriods(req, res);

    // Render the dashboard view
    res.render(DASHBOARD_VIEW_PATH, {
      req,
      greating: greating(req.session.userName),
      schoolSummaryByRegistrations: registrations,
      schoolsSummaryByCategories: categories,
      schoolsSummaryByOwners: owners,
      schoolSummaryByApplications: applications,
      schoolSummaryByStructures: structures,
      dashboardDataStale: !response?.data,
      registeredSchoolsByPeriod,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    const fallbackSummary = req.session.dashboardSummaryCache || defaultDashboardSummary();
    res.render(DASHBOARD_VIEW_PATH, {
      req,
      greating: greating(req.session.userName),
      schoolSummaryByRegistrations: fallbackSummary.registrations,
      schoolsSummaryByCategories: fallbackSummary.categories,
      schoolsSummaryByOwners: fallbackSummary.owners,
      schoolSummaryByApplications: fallbackSummary.applications,
      schoolSummaryByStructures: fallbackSummary.structures,
      dashboardDataStale: true,
      registeredSchoolsByPeriod: defaultRegisteredSchoolsByPeriod(),
    });
  }
};
// Map View
const mapView = async (req, res) => {
  const filters = await sendRequest(req, res, dashboardFilterAPI, "GET", {});
  const { categories, ownerships, regions } = filters.data;

  res.render(path.join(__dirname, "/../views/map"), {
    req,
    categories,
    ownerships,
    regions,
    location: null,
  });
};
//Map data
const getMapData = async (req, res) => { 
  try {
  const mapData = await sendRequest(req, res, mapDataAPI, "GET", req.body );
  const { data, statusCode, message } = mapData;
  res.send({
      statusCode: statusCode,
      data: data,
      hasPermission : hasPermission(req , "update-school-marker"),
      message: message,
    })
  }catch (err) {
    console.error("Dashboard Error:", err);
    req.flash("error", "Kuna tatizo, tafadhali jaribu tena baadaye.");
    res.redirect("/"); // or to an error page
  }
};
//Update Maerker
const UpdateMarker = async (req, res) => { 
      const jsonData = await sendRequest(req, res, updateMarkerAPI, "POST", req.body);
        const { statusCode, message } = jsonData;
        console.log("Update Marker Response:", jsonData);
        res.send({
          statusCode: statusCode,
          message: message,
        })
};
// Registered Schools by Regions by ownership
const getSchoolsSummaryByRegionAndCategories  = async (req, res) => {
    try {
      const jsonData = await sendRequest(req, res, schoolByCategoriesAPI, "GET", {});
      const { data, statusCode } = jsonData;
      const payload = data || {};
      const summaryData = payload.data || {};
      const minValue = payload.minValue ?? jsonData.minValue ?? 0;
      const maxValue = payload.maxValue ?? jsonData.maxValue ?? 0;
      res.send({
        statusCode: statusCode,
        data: summaryData,
        maxValue: maxValue,
        minValue: minValue,
      });
    }catch (err) {
        console.error("Dashboard Error:", err);
        req.flash("error", "Kuna tatizo, tafadhali jaribu tena baadaye.");
        res.redirect("/"); // or to an error page
      }
  };
// Registered Schools by Year of Registration + Trend
const getNumberOfSchoolByYearOfRegistration = async (req, res) => {
    try {
      const limit = Number.parseInt(req.query?.limit, 10);
      const offset = Number.parseInt(req.query?.offset, 10);
      const query = new URLSearchParams({
        limit: Number.isFinite(limit) ? String(limit) : "10",
        offset: Number.isFinite(offset) ? String(offset) : "0",
      }).toString();

      const jsonData = await sendRequest(
        req,
        res,
        `${numberOfSchoolByYearsAPI}?${query}`,
        "GET",
        {},
      );  
      const { data, statusCode, message } = jsonData;
      const { cumulativeData, individualData, pagination = {} } = data;
      res.send({
        statusCode: statusCode,
        data: {
          cumulativeData,
          individualData,
          pagination,
        },
        message: message,
      });
    }catch (err) {
        console.error("Dashboard Error:", err);
        req.flash("error", "Kuna tatizo, tafadhali jaribu tena baadaye.");
        res.redirect("/"); // or to an error page
      }
  };

module.exports = {dashboard, mapView, getMapData , UpdateMarker, getSchoolsSummaryByRegionAndCategories , getNumberOfSchoolByYearOfRegistration};
