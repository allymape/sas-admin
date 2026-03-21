require("dotenv").config();
const express = require("express");
const request = require("request");
const reportUsajiliRequestController = express.Router();
var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can, createLetter, formatDate, exportJSONToExcel, activeHandover } = require("../../../util");
// const { sendRequest, isAuthenticated, can } = require("../../../util");
var API_BASE_URL = process.env.API_BASE_URL;
const requestRiportUsajiliAPI = API_BASE_URL + "ripoti-usajili-shule";
const requestRiportUsajiliAnalyticsAPI = API_BASE_URL + "ripoti-usajili-shule/analytics";
const requestRiportUsajiliLookupsAPI = API_BASE_URL + "ripoti-usajili-shule/lookups";
const thibitishaUsajiliAPI = API_BASE_URL + "thibitisha-usajili-shule";
const rekebishaUsajiliAPI = API_BASE_URL + "rekebisha-usajili-shule";

const csvEscape = (value) => {
  if (value === null || typeof value === "undefined") return "";
  const text = String(value);
  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const streamUsajiliCsv = (req, res, baseParams = {}) => {
  const token = req.session.Token || req.body?.token;
  if (!token) {
    res.status(401).send("Token is required.");
    return;
  }

  const chunkSize = Math.min(5000, Math.max(500, Number(req.query.chunk_size || 2000)));
  const fileName = `ripoti_usajili_shule_${formatDate(new Date(), "YYYYMMDD_HHmmss")}.csv`;
  const headers = [
    "Namba ya Ombi",
    "Jina la Shule",
    "Namba Usajili",
    "Tarehe Usajili",
    "Mkondo",
    "Aina",
    "Lugha",
    "Ni Seminari",
    "Bweni",
    "Shule ni",
    "Majengo",
    "Umiliki",
    "Mkoa",
    "Halmashauri",
    "Kata",
    "Mtaa",
    "Tarehe",
    "Hali",
    "Uthibitisho",
  ];

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
  res.write("\uFEFF");
  res.write(`${headers.join(",")}\n`);

  const writeRows = (rows = []) => {
    rows.forEach((item) => {
      const statusText = Number(item.status) === 2 ? "Limethibitishwa" : Number(item.status) === 3 ? "Limekataliwa" : "";
      const verifiedText = Number(item.is_verified) === 1 ? "Ndiyo" : "Hapana";
      const line = [
        item.tracking_number,
        item.school_name,
        item.registration_number,
        item.registration_date ? formatDate(item.registration_date, "DD-MM-YYYY") : "",
        item.stream,
        item.category,
        item.language,
        item.is_seminary ? "Ndio" : "",
        item.subcategory,
        item.gender_type,
        item.structure,
        item.registry,
        item.region,
        item.district,
        item.ward,
        item.street,
        item.approved_at ? formatDate(item.approved_at, "DD-MM-YYYY HH:mm") : "",
        statusText,
        verifiedText,
      ].map(csvEscape).join(",");
      res.write(`${line}\n`);
    });
  };

  const fetchPage = (page) => {
    request(
      {
        url: requestRiportUsajiliAPI,
        method: "GET",
        json: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        qs: {
          ...baseParams,
          export: "true",
          page,
          per_page: chunkSize,
        },
      },
      (error, response, body) => {
        if (error || !response || response.statusCode !== 200) {
          if (!res.headersSent) {
            res.status(500).send("Imeshindikana kufanya export ya CSV.");
          } else {
            res.end();
          }
          return;
        }

        const rows = Array.isArray(body?.data) ? body.data : [];
        if (!rows.length) {
          res.end();
          return;
        }

        writeRows(rows);
        fetchPage(page + 1);
      }
    );
  };

  fetchPage(1);
};

const normalizeRegions = (regions = []) =>
  (Array.isArray(regions) ? regions : []).map((region) => ({
    ...region,
    regionCode: region?.regionCode ?? region?.RegionCode ?? region?.id ?? null,
    regionName: region?.regionName ?? region?.RegionName ?? region?.name ?? null,
  }));

// Display
reportUsajiliRequestController.get(
  "/RipotiZilizosajiliwa",
  isAuthenticated,
  can("view-registered-school-report"),
  activeHandover,
  function (req, res) {
    const isExport = req.query.export === "true";
    const exportFormat = String(req.query.export_format || "xlsx").toLowerCase();
    const useCsvStreaming = isExport && exportFormat === "csv";
    const isFast = String(req.query.fast || "1") !== "0";
    const per_page =
      isExport && !useCsvStreaming && req.query.max
        ? Number(req.query.max)
        : Number(req.query.per_page || 10);
    const page = Number(req.query.page || 1);
    const status = req.query.status;
    const tracking_number = req.query.tracking_number;
    const date_range = req.query.date_range;
    const category = req.query.category;
    const verified = req.query.verified;
    const ownership = req.query.ownership;
    const structure = req.query.structure;
    const certificate = req.query.certificate;
    const region = req.query.region;
    const district = req.query.district;
    const ward = req.query.ward;
    const street = req.query.street;

    const formData = {
      page,
      per_page,
      export: req.query.export === "true" ? "true" : "false",
      fast: isFast ? "true" : "false",
      tracking_number,
      status,
      date_range,
      category,
      verified,
      ownership,
      structure,
      certificate,
      region,
      district,
      ward,
      street,
    };

    if (useCsvStreaming) {
      streamUsajiliCsv(req, res, formData);
      return;
    }

    sendRequest(
      req,
      res,
      requestRiportUsajiliAPI,
      "GET",
      formData,
      (jsonData) => {
        const { data, numRows, categories, structures , certificates, ownerships, regions, timings, has_next, has_prev } =
          jsonData;
        if (isExport) {
          data.forEach((item) => {
            delete item.status;
            delete item.is_verified;
            delete item.registration_id;
            delete item.approved_at;
            delete item.approved;
            delete item.corrected;
            delete item.description;
          });
          const csvData = data.map((item) => ({
            ...item,
            registration_date : item.registration_date ? formatDate(item.registration_date, "DD-MM-YYYY") : '',
          }));
          console.log("Export to Excel...")
          exportJSONToExcel(res, csvData);
        } else {
          res.render(path.join(__dirname, "../../views/reports/usajili/index"), {
            req: req,
            data: data,
            categories,
            structures,
            ownerships,
            certificates,
            regions: normalizeRegions(regions),
            timings: timings || null,
            fast: isFast,
            has_next: Boolean(has_next),
            has_prev: Boolean(has_prev),
            pagination: {
              total: numRows,
              current: page,
              per_page: per_page,
              url: "RipotiZilizosajiliwa",
              pages: typeof numRows === "number" ? Math.ceil(numRows / per_page) : null,
            },
          });
        }
      }
    );
  }
);

// Analytics page for RipotiZilizosajiliwa (pivot + charts)
reportUsajiliRequestController.get(
  "/RipotiUsajiliAnalytics",
  isAuthenticated,
  can("view-registered-school-report"),
  activeHandover,
  function (req, res) {
    sendRequest(req, res, requestRiportUsajiliLookupsAPI, "GET", {}, (jsonData) => {
      const { categories, structures, certificates, ownerships, regions, languages, specializations } = jsonData || {};
      return res.render(path.join(__dirname, "../../views/reports/usajili/analytics"), {
        req,
        categories: Array.isArray(categories) ? categories : [],
        structures: Array.isArray(structures) ? structures : [],
        certificates: Array.isArray(certificates) ? certificates : [],
        ownerships: Array.isArray(ownerships) ? ownerships : [],
        languages: Array.isArray(languages) ? languages : [],
        specializations: Array.isArray(specializations) ? specializations : [],
        regions: normalizeRegions(regions),
      });
    });
  }
);

// Analytics (pivot) for RipotiZilizosajiliwa
reportUsajiliRequestController.get(
  "/RipotiZilizosajiliwaAnalytics",
  isAuthenticated,
  can("view-registered-school-report"),
  activeHandover,
  function (req, res) {
    const row_dim = String(req.query.row_dim || "region").trim();
    const col_dim = String(req.query.col_dim || "status").trim();

    const formData = {
      ...req.query,
      row_dim,
      col_dim,
      export: "false",
      fast: "true",
      page: null,
      per_page: null,
    };

    sendRequest(req, res, requestRiportUsajiliAnalyticsAPI, "GET", formData, (jsonData) => {
      return res.send(jsonData);
    });
  }
);

reportUsajiliRequestController.post(`/RekebishaUsajili/:tracking_number`,isAuthenticated,(req, res) => {
    sendRequest(req, res , rekebishaUsajiliAPI+`/${req.params.tracking_number}` , "POST" , req.body , (jsonData) => {
          const {statusCode , message} = jsonData
          res.send({
            statusCode,
            message
          });
    })
  }
);
reportUsajiliRequestController.post(
  `/ThibitishaUsajili/:tracking_number`,
  isAuthenticated,
  (req, res) => {
     sendRequest(req, res , thibitishaUsajiliAPI+`/${req.params.tracking_number}` , "POST" , req.body , (jsonData) => {
          const {statusCode , message} = jsonData
          res.send({
            statusCode,
            message
          });
    })
  }
);
module.exports = reportUsajiliRequestController;
