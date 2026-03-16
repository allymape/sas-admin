require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const schoolFilesController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const allSchoolListAPI = API_BASE_URL + "school-files";
const applicationsAPI = API_BASE_URL + "applications";
const updateSchoolFileNumberAPI = API_BASE_URL + "update-school-file-number";
const missingSchoolFileNumbersCountAPI =
  API_BASE_URL + "missing-school-file-numbers-count";
const generateMissingSchoolFileNumbersAPI =
  API_BASE_URL + "generate-missing-school-file-numbers";

schoolFilesController.get(
  "/MajaladaYaShule",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    return res.render(path.join(__dirname + "/../views/school_files"), { req });
  }
);

schoolFilesController.post(
  "/MajaladaYaShuleList",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const draw = Number(req.body.draw || 1);
    const start = Number(req.body.start || 0);
    const length = Number(req.body.length || 10);
    const per_page = length > 0 ? length : 10;
    const page = Math.floor(start / per_page) + 1;
    const search = String(req.body?.search?.value || "").trim();
    const orderColIndex = Number(req.body?.order?.[0]?.column);
    const orderDir = String(req.body?.order?.[0]?.dir || "asc").toLowerCase() === "desc"
      ? "desc"
      : "asc";
    const orderColumnData =
      Number.isFinite(orderColIndex) && orderColIndex >= 0
        ? String(req.body?.columns?.[orderColIndex]?.data || "").trim()
        : "";
    const sortableColumns = new Set([
      "name",
      "reg_no",
      "category",
      "ownership",
      "file_number",
      "applications_count",
    ]);
    const sortBy = sortableColumns.has(orderColumnData) ? orderColumnData : "name";

    sendRequest(
      req,
      res,
      `${allSchoolListAPI}?page=${page}&per_page=${per_page}`,
      "GET",
      {
        ...(search ? { search_value: search } : {}),
        sort_by: sortBy,
        sort_dir: orderDir,
      },
      (jsonData) => {
        const totalRecords = Number(jsonData?.numRows || 0);
        const data = Array.isArray(jsonData?.data) ? jsonData.data : [];
        const missingFileNumbersCount = Number(
          jsonData?.missing_file_numbers_count || 0
        );

        res.send({
          draw,
          recordsTotal: totalRecords,
          recordsFiltered: totalRecords,
          data,
          missingFileNumbersCount,
        });
      }
    );
  }
);

schoolFilesController.post(
  "/MajaladaYaShuleApplicationsList/:school_id",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const schoolId = Number(req.params.school_id || 0);
    const draw = Number(req.body.draw || 1);
    const start = Number(req.body.start || 0);
    const length = Number(req.body.length || 10);
    const per_page = length > 0 ? length : 10;
    const page = Math.floor(start / per_page) + 1;
    const search = String(req.body?.search?.value || "").trim();

    const query = new URLSearchParams({
      page: String(page),
      per_page: String(per_page),
      establishing_school_id: String(schoolId),
    });
    if (search) query.set("search", search);

    sendRequest(
      req,
      res,
      `${applicationsAPI}?${query.toString()}`,
      "GET",
      {},
      (jsonData) => {
        const payload = jsonData?.data || {};
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const totalRecords = Number(payload?.total || rows.length);

        res.send({
          draw,
          recordsTotal: totalRecords,
          recordsFiltered: totalRecords,
          data: rows,
        });
      }
    );
  }
);

schoolFilesController.post(
  "/MajaladaYaShuleBadiliNamba/:school_id",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    const schoolId = Number(req.params.school_id || 0);
    const file_number = String(req.body?.file_number || "").trim();

    if (!schoolId) {
      return res.send({
        statusCode: 306,
        message: "Shule haijapatikana.",
      });
    }

    if (!file_number) {
      return res.send({
        statusCode: 306,
        message: "Namba ya jalada inahitajika.",
      });
    }

    sendRequest(
      req,
      res,
      `${updateSchoolFileNumberAPI}/${schoolId}`,
      "PUT",
      { file_number },
      (jsonData) => {
        res.send({
          statusCode: Number(jsonData?.statusCode || 306),
          message:
            jsonData?.message || "Imeshindikana kubadili namba ya jalada.",
        });
      }
    );
  }
);

schoolFilesController.post(
  "/MajaladaYaShuleGenerateMissing",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    sendRequest(
      req,
      res,
      generateMissingSchoolFileNumbersAPI,
      "POST",
      {},
      (jsonData) => {
        res.send({
          statusCode: Number(jsonData?.statusCode || 306),
          message:
            jsonData?.message || "Imeshindikana kugenerate namba za jalada.",
          data: jsonData?.data || { updated: 0, skipped: 0 },
        });
      }
    );
  }
);

schoolFilesController.get(
  "/MajaladaYaShuleMissingCount",
  isAuthenticated,
  can("view-schools"),
  function (req, res) {
    sendRequest(
      req,
      res,
      missingSchoolFileNumbersCountAPI,
      "GET",
      {},
      (jsonData) => {
        res.send({
          statusCode: Number(jsonData?.statusCode || 306),
          message:
            jsonData?.message ||
            "Imeshindikana kupata idadi ya majalada yasiyo na namba.",
          data: {
            total: Number(jsonData?.data?.total || 0),
          },
        });
      }
    );
  }
);

module.exports = schoolFilesController;
