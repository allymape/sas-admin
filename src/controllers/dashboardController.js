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
const DASHBOARD_PERIOD_CACHE_MS = Number.parseInt(
  process.env.DASHBOARD_PERIOD_CACHE_MS || "120000",
  10,
);
const DASHBOARD_PERIOD_ROWS = Number.parseInt(
  process.env.DASHBOARD_PERIOD_ROWS || "5",
  10,
);
const DASHBOARD_PERF_LOG = String(process.env.DASHBOARD_PERF_LOG || "1") === "1";
const DASHBOARD_SUMMARY_CACHE_MS = Number.parseInt(
  process.env.DASHBOARD_SUMMARY_CACHE_MS || "60000",
  10,
);
const DASHBOARD_CHART_CACHE_MS = Number.parseInt(
  process.env.DASHBOARD_CHART_CACHE_MS || "60000",
  10,
);
const DASHBOARD_YEARS_CACHE_MS = Number.parseInt(
  process.env.DASHBOARD_YEARS_CACHE_MS || "120000",
  10,
);
const DASHBOARD_SHARED_CACHE_MAX_KEYS = Number.parseInt(
  process.env.DASHBOARD_SHARED_CACHE_MAX_KEYS || "200",
  10,
);

const sharedSummaryCache = new Map();
const sharedPeriodsCache = new Map();
const sharedRegionsCategoriesCache = new Map();
const sharedYearsByOffsetCache = new Map();
const inFlightFetches = new Map();

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

const isFreshCache = (cache, ttlMs) => {
  if (!cache || typeof cache !== "object") return false;
  const fetchedAt = Number(cache.fetchedAt || 0);
  if (!Number.isFinite(fetchedAt) || fetchedAt <= 0) return false;
  const ttl = Number.isFinite(ttlMs) ? ttlMs : 0;
  return Date.now() - fetchedAt <= ttl;
};

const getDashboardScopeKey = (req) => {
  const office = Number(req?.session?.office || req?.user?.office || 0);
  const zoneId = req?.session?.zone_id || req?.user?.zone_id || "null";
  const districtCode = req?.session?.district_code || req?.user?.district_code || "null";
  return `${office}:${zoneId}:${districtCode}`;
};

const getSessionSummaryValue = (sessionSummary) => {
  if (!sessionSummary || typeof sessionSummary !== "object") return null;

  if (
    Object.prototype.hasOwnProperty.call(sessionSummary, "data") &&
    sessionSummary.data &&
    typeof sessionSummary.data === "object"
  ) {
    return sessionSummary.data;
  }

  if (Object.prototype.hasOwnProperty.call(sessionSummary, "registrations")) {
    return sessionSummary;
  }

  return null;
};

const pruneCacheMap = (cacheMap, maxSize = 200) => {
  const limit = Number.isFinite(maxSize) && maxSize > 0 ? maxSize : 200;
  while (cacheMap.size > limit) {
    const oldestKey = cacheMap.keys().next().value;
    if (oldestKey === undefined) break;
    cacheMap.delete(oldestKey);
  }
};

const getFreshMapCacheValue = (cacheMap, key, ttlMs) => {
  const cached = cacheMap.get(key);
  if (!cached || typeof cached !== "object") return null;
  if (!isFreshCache(cached, ttlMs)) {
    cacheMap.delete(key);
    return null;
  }
  return cached.data;
};

const getAnyMapCacheValue = (cacheMap, key) => {
  const cached = cacheMap.get(key);
  if (!cached || typeof cached !== "object") return null;
  return cached.data;
};

const setMapCacheValue = (cacheMap, key, data) => {
  cacheMap.set(key, {
    data,
    fetchedAt: Date.now(),
  });
  pruneCacheMap(cacheMap, DASHBOARD_SHARED_CACHE_MAX_KEYS);
};

const getOrFetchCached = async ({
  cacheMap,
  key,
  ttlMs,
  fetcher,
}) => {
  const fresh = getFreshMapCacheValue(cacheMap, key, ttlMs);
  if (fresh) {
    return { data: fresh, source: "shared-cache" };
  }

  const inFlightKey = `${key}`;
  if (inFlightFetches.has(inFlightKey)) {
    const data = await inFlightFetches.get(inFlightKey);
    return { data, source: "inflight" };
  }

  const promise = (async () => {
    const fetched = await fetcher();
    if (fetched !== null && fetched !== undefined) {
      setMapCacheValue(cacheMap, key, fetched);
    }
    return fetched;
  })()
    .finally(() => {
      inFlightFetches.delete(inFlightKey);
    });

  inFlightFetches.set(inFlightKey, promise);
  const data = await promise;
  return { data, source: "api" };
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeDashboardCategoryLabel = (item = {}) => {
  const id = Number(item?.id || 0);
  const rawLabel = String(item?.category || "").trim();
  const predefined = {
    1: "Awali",
    2: "Msingi",
    3: "Sekondari",
    4: "Vyuo vya Ualimu",
  };
  if (predefined[id]) return predefined[id];
  if (rawLabel && !/^\d+$/.test(rawLabel)) return rawLabel;
  return rawLabel || (id > 0 ? `Aina ${id}` : "Unknown");
};

const resolveCanonicalCategoryId = (item = {}) => {
  const id = Number(item?.id || 0);
  if ([1, 2, 3, 4].includes(id)) return id;

  const raw = String(item?.category || "").trim().toLowerCase();
  const rawNum = Number(raw);
  if ([1, 2, 3, 4].includes(rawNum)) return rawNum;
  if (raw.includes("awali")) return 1;
  if (raw.includes("msingi")) return 2;
  if (raw.includes("sekondari")) return 3;
  if (raw.includes("chuo") || raw.includes("vyuo") || raw.includes("ualimu")) return 4;
  return null;
};

const normalizeDashboardCategories = (categories = []) => {
  const rows = Array.isArray(categories) ? categories : [];
  const totals = { 1: 0, 2: 0, 3: 0, 4: 0 };

  rows.forEach((item) => {
    const id = resolveCanonicalCategoryId(item);
    if (!id) return;
    totals[id] += toNumber(item?.total);
  });

  const labels = {
    1: "Awali",
    2: "Msingi",
    3: "Sekondari",
    4: "Vyuo vya Ualimu",
  };

  return [1, 2, 3, 4]
    .map((id) => ({
      id,
      category: labels[id],
      total: totals[id],
    }))
    .filter((item) => item.total > 0);
};

const pickLeader = (rows = [], labelKey = "label", valueKey = "total") => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { label: "-", total: 0, share: 0 };
  }
  const total = rows.reduce((sum, row) => sum + toNumber(row?.[valueKey]), 0);
  const sorted = [...rows].sort(
    (a, b) => toNumber(b?.[valueKey]) - toNumber(a?.[valueKey]),
  );
  const top = sorted[0] || {};
  const topValue = toNumber(top?.[valueKey]);
  const share = total > 0 ? (topValue / total) * 100 : 0;
  return {
    label: String(top?.[labelKey] || "-"),
    total: topValue,
    share,
  };
};

const buildDecisionBrief = (
  summary = defaultDashboardSummary(),
  periods = defaultRegisteredSchoolsByPeriod(),
  isStale = false,
) => {
  const registrationsTotal = toNumber(summary?.registrations?.total);
  const todayTotal = toNumber(periods?.todayRecent?.todayTotal || periods?.todayRecent?.total);
  const weekTotal = toNumber(periods?.week?.total);
  const monthTotal = toNumber(periods?.month?.total);
  const yearTotal = toNumber(periods?.year?.total);
  const weekDailyAvg = weekTotal > 0 ? weekTotal / 7 : 0;
  const todayVsWeekPct = weekDailyAvg > 0 ? ((todayTotal - weekDailyAvg) / weekDailyAvg) * 100 : 0;

  const categoryLeader = pickLeader(summary?.categories, "category", "total");
  const ownerLeader = pickLeader(summary?.owners, "owner", "total");
  const structureLeader = pickLeader(summary?.structures, "label", "total");

  const alerts = [];
  if (isStale) {
    alerts.push({
      level: "warning",
      message: "Baadhi ya takwimu zimetoka cache kwa sababu ya mtandao/API.",
      action: "Hakikisha API iko stable, kisha refresh.",
    });
  }
  if (todayTotal <= 0) {
    alerts.push({
      level: "info",
      message: "Hakuna usajili wa leo uliorekodiwa.",
      action: "Kagua maombi ya pending na approvals za leo.",
    });
  }
  if (ownerLeader.share >= 80) {
    alerts.push({
      level: "warning",
      message: `Umiliki umejikita zaidi kwa ${ownerLeader.label} (${ownerLeader.share.toFixed(1)}%).`,
      action: "Fuatilia uwiano wa umiliki kwa maamuzi ya sera.",
    });
  }
  if (todayVsWeekPct < -35 && weekTotal > 0) {
    alerts.push({
      level: "warning",
      message: "Kasi ya leo ipo chini ukilinganisha na wastani wa wiki.",
      action: "Angalia bottleneck kwenye workflow ya approvals.",
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      level: "success",
      message: "Kasi ya usajili na usambazaji wa takwimu ipo katika mstari mzuri.",
      action: "Endelea kufuatilia trend kila siku.",
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    metrics: {
      total_registered: registrationsTotal,
      today_total: todayTotal,
      week_total: weekTotal,
      month_total: monthTotal,
      year_total: yearTotal,
      week_daily_average: weekDailyAvg,
      today_vs_week_pct: todayVsWeekPct,
    },
    leaders: {
      category: categoryLeader,
      owner: ownerLeader,
      structure: structureLeader,
    },
    alerts,
  };
};

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
  const startedAt = Date.now();
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
      if (DASHBOARD_PERF_LOG) {
        console.log("[DASHBOARD][PERF][period]", {
          period,
          ms: Date.now() - startedAt,
          rows: parsed.rows.length,
          total: parsed.total,
          timeout_fallback: false,
        });
      }
      return parsed;
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
  const startedAt = Date.now();
  const rowsPerPeriod = Number.isFinite(DASHBOARD_PERIOD_ROWS) && DASHBOARD_PERIOD_ROWS > 0
    ? DASHBOARD_PERIOD_ROWS
    : 5;
  const todayData = await fetchRegisteredSchoolsByPeriod(req, res, "today", rowsPerPeriod);
  const [weekData, monthData, yearData] = await Promise.all([
    fetchRegisteredSchoolsByPeriod(req, res, "week", rowsPerPeriod),
    fetchRegisteredSchoolsByPeriod(req, res, "month", rowsPerPeriod),
    fetchRegisteredSchoolsByPeriod(req, res, "year", rowsPerPeriod),
  ]);

  const todayRows = Array.isArray(todayData.rows) ? todayData.rows : [];
  const shouldFetchRecent = todayRows.length === 0;
  const recentData = shouldFetchRecent
    ? await fetchRegisteredSchoolsByPeriod(req, res, "recent", rowsPerPeriod)
    : { rows: [], total: 0 };
  const recentRows = Array.isArray(recentData.rows) ? recentData.rows : [];

  const responsePayload = {
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

  if (DASHBOARD_PERF_LOG) {
    console.log("[DASHBOARD][PERF][periods-all]", {
      ms: Date.now() - startedAt,
      fetched_recent: shouldFetchRecent,
      today: responsePayload.todayRecent.total,
      week: responsePayload.week.total,
      month: responsePayload.month.total,
      year: responsePayload.year.total,
    });
  }

  return responsePayload;
};

// Comprehensive dashboard
const dashboard = async (req, res) => {
  try {
    const pageStartedAt = Date.now();
    const scopeKey = getDashboardScopeKey(req);
    const summaryCacheKey = `summary:${scopeKey}`;
    const periodCacheKey = `periods:${scopeKey}`;

    const sessionSummaryRaw = req.session.dashboardSummaryCache;
    const sessionSummaryValue = getSessionSummaryValue(sessionSummaryRaw);
    const sessionSummaryFresh = isFreshCache(sessionSummaryRaw, DASHBOARD_SUMMARY_CACHE_MS)
      ? getSessionSummaryValue(sessionSummaryRaw)
      : null;
    const sharedSummaryFresh = getFreshMapCacheValue(
      sharedSummaryCache,
      summaryCacheKey,
      DASHBOARD_SUMMARY_CACHE_MS,
    );
    const fallbackSummary =
      sessionSummaryFresh ||
      sharedSummaryFresh ||
      sessionSummaryValue ||
      defaultDashboardSummary();

    const sessionPeriodRaw = req.session.dashboardPeriodCache;
    const sessionPeriodsFresh = isFreshCache(sessionPeriodRaw, DASHBOARD_PERIOD_CACHE_MS)
      ? (sessionPeriodRaw.data || defaultRegisteredSchoolsByPeriod())
      : null;
    const sharedPeriodsFresh = getFreshMapCacheValue(
      sharedPeriodsCache,
      periodCacheKey,
      DASHBOARD_PERIOD_CACHE_MS,
    );
    const fallbackPeriods =
      sessionPeriodsFresh ||
      sessionPeriodRaw?.data ||
      sharedPeriodsFresh ||
      defaultRegisteredSchoolsByPeriod();

    const summaryStartedAt = Date.now();
    const summaryTask = (async () => {
      const { data, source } = await getOrFetchCached({
        cacheMap: sharedSummaryCache,
        key: summaryCacheKey,
        ttlMs: DASHBOARD_SUMMARY_CACHE_MS,
        fetcher: async () => {
          const response = await withTimeout(
            sendRequest(req, res, schoolSummariesAPI, "GET", {}),
            Number.isFinite(DASHBOARD_RENDER_TIMEOUT_MS) ? DASHBOARD_RENDER_TIMEOUT_MS : 2500,
          );
          return response?.data || null;
        },
      });

      if (data) {
        req.session.dashboardSummaryCache = {
          data,
          fetchedAt: Date.now(),
        };
      }

      return {
        summary: data || fallbackSummary,
        isFresh: Boolean(data),
        source: data ? source : "fallback-cache",
        ms: Date.now() - summaryStartedAt,
      };
    })();

    const periodsStartedAt = Date.now();
    const periodsTask = (async () => {
      if (sessionPeriodsFresh) {
        return {
          periods: sessionPeriodsFresh,
          source: "session-cache",
          ms: 0,
        };
      }

      const { data, source } = await getOrFetchCached({
        cacheMap: sharedPeriodsCache,
        key: periodCacheKey,
        ttlMs: DASHBOARD_PERIOD_CACHE_MS,
        fetcher: async () => fetchAllRegisteredSchoolPeriods(req, res),
      });

      if (data) {
        req.session.dashboardPeriodCache = {
          data,
          fetchedAt: Date.now(),
        };
      }

      return {
        periods: data || fallbackPeriods,
        source: data ? source : "fallback-cache",
        ms: Date.now() - periodsStartedAt,
      };
    })();

    const [summaryResult, periodsResult] = await Promise.all([summaryTask, periodsTask]);

    const summary = summaryResult.summary;
    const {
      registrations = { total: 0 },
      owners = [],
      categories = [],
      applications = [],
      structures = [],
    } = summary;
    const normalizedCategories = normalizeDashboardCategories(categories);
    const registeredSchoolsByPeriod = periodsResult.periods;

    const decisionBrief = buildDecisionBrief(
      {
        registrations,
        owners,
        categories: normalizedCategories,
        structures,
      },
      registeredSchoolsByPeriod,
      !summaryResult.isFresh,
    );

    // Render the dashboard view
    res.render(DASHBOARD_VIEW_PATH, {
      req,
      greating: greating(req.session.userName),
      schoolSummaryByRegistrations: registrations,
      schoolsSummaryByCategories: normalizedCategories,
      schoolsSummaryByOwners: owners,
      schoolSummaryByApplications: applications,
      schoolSummaryByStructures: structures,
      dashboardDataStale: !summaryResult.isFresh,
      registeredSchoolsByPeriod,
      decisionBrief,
    });

    if (DASHBOARD_PERF_LOG) {
      console.log("[DASHBOARD][PERF][page-render]", {
        summary_ms: summaryResult.ms,
        summary_source: summaryResult.source,
        periods_ms: periodsResult.ms,
        periods_source: periodsResult.source,
        total_ms: Date.now() - pageStartedAt,
        stale_summary: !summaryResult.isFresh,
      });
    }
  } catch (err) {
    console.error("Dashboard Error:", err);
    const fallbackSummary = getSessionSummaryValue(req.session.dashboardSummaryCache) || defaultDashboardSummary();
    const fallbackPeriods = defaultRegisteredSchoolsByPeriod();
    const fallbackCategories = normalizeDashboardCategories(fallbackSummary.categories);
    res.render(DASHBOARD_VIEW_PATH, {
      req,
      greating: greating(req.session.userName),
      schoolSummaryByRegistrations: fallbackSummary.registrations,
      schoolsSummaryByCategories: fallbackCategories,
      schoolsSummaryByOwners: fallbackSummary.owners,
      schoolSummaryByApplications: fallbackSummary.applications,
      schoolSummaryByStructures: fallbackSummary.structures,
      dashboardDataStale: true,
      registeredSchoolsByPeriod: fallbackPeriods,
      decisionBrief: buildDecisionBrief(fallbackSummary, fallbackPeriods, true),
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
    const payload = req.body && typeof req.body === "object" ? req.body : {};
    const query = new URLSearchParams(
      Object.entries(payload).reduce((acc, [key, value]) => {
        if (value === undefined || value === null) return acc;
        const normalized = String(value).trim();
        if (!normalized.length) return acc;
        acc[key] = normalized;
        return acc;
      }, {}),
    ).toString();

    const url = query ? `${mapDataAPI}?${query}` : mapDataAPI;
    const mapData = await sendRequest(req, res, url, "GET", {});

    if (!mapData || typeof mapData !== "object") {
      console.log("[MapData][ADMIN][INVALID_RESPONSE]", {
        url,
        type: typeof mapData,
      });
      return res.send({
        statusCode: 306,
        data: [],
        hasPermission: hasPermission(req, "update-school-marker"),
        message: "Imeshindikana kupata data ya ramani.",
      });
    }

    const rawData = mapData.data;
    const data = Array.isArray(rawData)
      ? { mode: "points", rows: rawData, meta: {} }
      : (rawData && typeof rawData === "object"
          ? rawData
          : { mode: "points", rows: [], meta: {} });
    const statusCode = Number(mapData.statusCode || 306);
    const message = mapData.message || (statusCode === 300 ? "OK" : "Imeshindikana kupata data ya ramani.");

    console.log("[MapData][ADMIN][RESULT]", {
      url,
      statusCode,
      mode: data.mode || "unknown",
      rows: Array.isArray(data.rows) ? data.rows.length : 0,
      hasPermission: hasPermission(req, "update-school-marker"),
    });

    return res.send({
      statusCode,
      data,
      hasPermission: hasPermission(req, "update-school-marker"),
      message,
    });
  }catch (err) {
    console.error("Dashboard Error:", err);
    return res.send({
      statusCode: 306,
      data: [],
      hasPermission: hasPermission(req, "update-school-marker"),
      message: "Kuna tatizo, tafadhali jaribu tena baadaye.",
    });
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
      if (res.headersSent) return;
      const scopeKey = getDashboardScopeKey(req);
      const cacheKey = `regions-categories:${scopeKey}`;
      const cached = getFreshMapCacheValue(
        sharedRegionsCategoriesCache,
        cacheKey,
        DASHBOARD_CHART_CACHE_MS,
      );
      if (cached) {
        if (res.headersSent) return;
        return res.send(cached);
      }

      const { data } = await getOrFetchCached({
        cacheMap: sharedRegionsCategoriesCache,
        key: cacheKey,
        ttlMs: DASHBOARD_CHART_CACHE_MS,
        fetcher: async () => {
          const jsonData = await sendRequest(req, res, schoolByCategoriesAPI, "GET", {});
          if (res.headersSent) return null;
          if (!jsonData || typeof jsonData !== "object") return null;

          const { data: responseData, statusCode } = jsonData;
          const payload = responseData || {};
          const summaryData = payload.data || {};
          const minValue = payload.minValue ?? jsonData.minValue ?? 0;
          const maxValue = payload.maxValue ?? jsonData.maxValue ?? 0;

          return {
            statusCode: statusCode,
            data: summaryData,
            maxValue: maxValue,
            minValue: minValue,
          };
        },
      });
      if (res.headersSent) return;

      if (data) {
        if (res.headersSent) return;
        return res.send(data);
      }

      const stale = getAnyMapCacheValue(sharedRegionsCategoriesCache, cacheKey);
      if (stale) {
        if (res.headersSent) return;
        return res.send(stale);
      }

      if (res.headersSent) return;
      return res.send({
        statusCode: 306,
        data: {},
        maxValue: 0,
        minValue: 0,
      });
    }catch (err) {
        console.error("Dashboard Error:", err);
        if (res.headersSent) return;
        req.flash("error", "Kuna tatizo, tafadhali jaribu tena baadaye.");
        return res.redirect("/"); // or to an error page
      }
  };
// Registered Schools by Year of Registration + Trend
const getNumberOfSchoolByYearOfRegistration = async (req, res) => {
    try {
      if (res.headersSent) return;
      const limit = Number.parseInt(req.query?.limit, 10);
      const offset = Number.parseInt(req.query?.offset, 10);
      const query = new URLSearchParams({
        limit: Number.isFinite(limit) ? String(limit) : "10",
        offset: Number.isFinite(offset) ? String(offset) : "0",
      }).toString();
      const scopeKey = getDashboardScopeKey(req);
      const cacheKey = `years-by-offset:${scopeKey}:${query}`;
      const cached = getFreshMapCacheValue(
        sharedYearsByOffsetCache,
        cacheKey,
        DASHBOARD_YEARS_CACHE_MS,
      );
      if (cached) {
        if (res.headersSent) return;
        return res.send(cached);
      }

      const { data } = await getOrFetchCached({
        cacheMap: sharedYearsByOffsetCache,
        key: cacheKey,
        ttlMs: DASHBOARD_YEARS_CACHE_MS,
        fetcher: async () => {
          const jsonData = await sendRequest(
            req,
            res,
            `${numberOfSchoolByYearsAPI}?${query}`,
            "GET",
            {},
          );
          if (res.headersSent) return null;
          if (!jsonData || typeof jsonData !== "object") return null;

          const { data: responseData, statusCode, message } = jsonData;
          const { cumulativeData = [], individualData = [], pagination = {} } = responseData || {};
          return {
            statusCode: statusCode,
            data: {
              cumulativeData,
              individualData,
              pagination,
            },
            message: message,
          };
        },
      });
      if (res.headersSent) return;

      if (data) {
        if (res.headersSent) return;
        return res.send(data);
      }

      const stale = getAnyMapCacheValue(sharedYearsByOffsetCache, cacheKey);
      if (stale) {
        if (res.headersSent) return;
        return res.send(stale);
      }

      if (res.headersSent) return;
      return res.send({
        statusCode: 306,
        data: {
          cumulativeData: [],
          individualData: [],
          pagination: {
            limit: Number.isFinite(limit) ? limit : 10,
            offset: Number.isFinite(offset) ? offset : 0,
            totalYears: 0,
            hasOlder: false,
            hasNewer: false,
          },
        },
        message: "Error",
      });
    }catch (err) {
        console.error("Dashboard Error:", err);
        if (res.headersSent) return;
        req.flash("error", "Kuna tatizo, tafadhali jaribu tena baadaye.");
        return res.redirect("/"); // or to an error page
      }
  };

module.exports = {dashboard, mapView, getMapData , UpdateMarker, getSchoolsSummaryByRegionAndCategories , getNumberOfSchoolByYearOfRegistration};
