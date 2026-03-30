require("dotenv").config();
const express = require("express");
const path = require("path");
const { sendRequest, isAuthenticated, can } = require("../../util");

const religionController = express.Router();

const API_BASE_URL = process.env.API_BASE_URL;
const religionsApi = `${API_BASE_URL}religions`;
const sectNamesApi = `${API_BASE_URL}sect-names`;

const parseDataTablePage = (req) => {
  const draw = Number(req.body.draw || 1);
  const start = Number(req.body.start || 0);
  const length = Number(req.body.length || 10);
  const per_page = length > 0 ? length : 10;
  const page = Math.floor(start / per_page) + 1;
  return { draw, page, per_page };
};

// Religions pages
religionController.get("/Religions", isAuthenticated, can("view-schools"), (req, res) => {
  return res.render(path.join(__dirname + "/../views/religions"), { req });
});

religionController.post("/ReligionsList", isAuthenticated, can("view-schools"), (req, res) => {
  const { draw, page, per_page } = parseDataTablePage(req);
  const search = String(req.body?.search?.value || "").trim();
  const status = String(req.body?.status || "").trim();

  sendRequest(
    req,
    res,
    religionsApi,
    "GET",
    {
      page,
      per_page,
      is_paginated: true,
      search,
      status,
    },
    (jsonData) => {
      const data = Array.isArray(jsonData?.data) ? jsonData.data : [];
      const totalRecords = Number(jsonData?.numRows || 0);

      res.send({
        draw,
        recordsTotal: totalRecords,
        recordsFiltered: totalRecords,
        data,
      });
    }
  );
});

religionController.get("/ReligionsLookup", isAuthenticated, can("view-schools"), (req, res) => {
  const includeInactive = ["1", "true", "yes"].includes(
    String(req.query?.include_inactive || "").trim().toLowerCase()
  );

  const query = {
    is_paginated: false,
    per_page: 500,
  };

  if (!includeInactive) {
    query.status = "active";
  }

  sendRequest(
    req,
    res,
    religionsApi,
    "GET",
    query,
    (jsonData) => {
      res.send({
        statusCode: Number(jsonData?.statusCode || 306),
        data: Array.isArray(jsonData?.data) ? jsonData.data : [],
      });
    }
  );
});

religionController.post("/tengenezaReligion", isAuthenticated, can("view-schools"), (req, res) => {
  const formData = {
    name: String(req.body?.name || "").trim(),
    code: String(req.body?.code || "").trim() || null,
    status: String(req.body?.status || "active").trim().toLowerCase(),
  };

  sendRequest(req, res, religionsApi, "POST", formData, (body) => {
    res.send({
      statusCode: Number(body?.statusCode || 306),
      message: body?.message || "Failed to create religion.",
    });
  });
});

religionController.post("/badiliReligion/:id", isAuthenticated, can("view-schools"), (req, res) => {
  const id = Number(req.params.id || 0);
  const formData = {
    name: String(req.body?.name || "").trim(),
    code: String(req.body?.code || "").trim() || null,
    status: String(req.body?.status || "active").trim().toLowerCase(),
  };

  sendRequest(req, res, `${religionsApi}/${id}`, "PUT", formData, (body) => {
    res.send({
      statusCode: Number(body?.statusCode || 306),
      message: body?.message || "Failed to update religion.",
    });
  });
});

religionController.post("/futaReligion/:id", isAuthenticated, can("view-schools"), (req, res) => {
  const id = Number(req.params.id || 0);

  sendRequest(req, res, `${religionsApi}/${id}`, "DELETE", {}, (body) => {
    res.send({
      statusCode: Number(body?.statusCode || 306),
      message: body?.message || "Failed to delete religion.",
    });
  });
});

// Sect names pages
religionController.get("/SectNames", isAuthenticated, can("view-schools"), (req, res) => {
  return res.render(path.join(__dirname + "/../views/sect_names"), { req });
});

religionController.post("/SectNamesList", isAuthenticated, can("view-schools"), (req, res) => {
  const { draw, page, per_page } = parseDataTablePage(req);
  const search = String(req.body?.search?.value || "").trim();
  const religion_id = Number(req.body?.religion_id || 0) || null;

  const query = {
    page,
    per_page,
    is_paginated: true,
    search,
  };

  if (religion_id) {
    query.religion_id = religion_id;
  }

  sendRequest(req, res, sectNamesApi, "GET", query, (jsonData) => {
    const data = Array.isArray(jsonData?.data) ? jsonData.data : [];
    const totalRecords = Number(jsonData?.numRows || 0);

    res.send({
      draw,
      recordsTotal: totalRecords,
      recordsFiltered: totalRecords,
      data,
    });
  });
});

religionController.post("/tengenezaSectName", isAuthenticated, can("view-schools"), (req, res) => {
  const formData = {
    religion_id: Number(req.body?.religion_id || 0),
    word: String(req.body?.word || "").trim(),
  };

  sendRequest(req, res, sectNamesApi, "POST", formData, (body) => {
    res.send({
      statusCode: Number(body?.statusCode || 306),
      message: body?.message || "Failed to create sect name.",
    });
  });
});

religionController.post("/badiliSectName/:id", isAuthenticated, can("view-schools"), (req, res) => {
  const id = Number(req.params.id || 0);
  const formData = {
    religion_id: Number(req.body?.religion_id || 0),
    word: String(req.body?.word || "").trim(),
  };

  sendRequest(req, res, `${sectNamesApi}/${id}`, "PUT", formData, (body) => {
    res.send({
      statusCode: Number(body?.statusCode || 306),
      message: body?.message || "Failed to update sect name.",
    });
  });
});

religionController.post("/futaSectName/:id", isAuthenticated, can("view-schools"), (req, res) => {
  const id = Number(req.params.id || 0);

  sendRequest(req, res, `${sectNamesApi}/${id}`, "DELETE", {}, (body) => {
    res.send({
      statusCode: Number(body?.statusCode || 306),
      message: body?.message || "Failed to delete sect name.",
    });
  });
});

module.exports = religionController;
