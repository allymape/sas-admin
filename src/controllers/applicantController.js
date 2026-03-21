require("dotenv").config();
const express = require("express");
const applicantController = express.Router();
var path = require("path");
const request = require("request");
const { sendRequest, isAuthenticated, can, activeHandover } = require("../../util");
var API_BASE_URL = process.env.API_BASE_URL;
const allApplicantsAPI = API_BASE_URL + "all-applicants";
const findApplicantAPI = API_BASE_URL + "find-applicant";
const applicantSchoolsAPI = API_BASE_URL + "applicant-schools";
const editApplicantAPI = API_BASE_URL + "edit-applicant";
const lookForApplicantsAPI = API_BASE_URL + "look_for_applicants";
const changeSchoolApplicantAPI = API_BASE_URL + "change-school-applicant";
const applicantsRegistryTypeSummaryAPI = API_BASE_URL + "all-applicants/registry-type-summary";
const transferGovernmentSchoolsAPI = API_BASE_URL + "transfer-government-schools";
const normalizeSearchValue = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") {
    return String(value.value ?? value.q ?? value.search ?? "").trim();
  }
  return String(value).trim();
};
// Get all Applicants
applicantController.get("/Waombaji",isAuthenticated,can("view-applicants"),activeHandover, function (req, res) {
      res.render(path.join(__dirname + "/../views/waombaji"), {
        req: req,
        applicants : [],
      });
  });
// Post all Applicants
applicantController.post("/ApplicantList",isAuthenticated,can("view-applicants"),function (req, res) {
    let draw = req.body.draw;
    let start = req.body.start;
    let length = req.body.length;
    var per_page = Number(length || 10);
    var page = Number(start / length) + 1;
    const searchValue = normalizeSearchValue(
      req.body?.search?.value ?? req.body?.search_value ?? req.body?.search ?? "",
    );
    const sortBy = String(req.body?.sort_by || req.body?.sortBy || req.query?.sort_by || "").trim() || "created_at";
    const sortOrderRaw = String(req.body?.sort_order || req.body?.sortOrder || req.query?.sort_order || "").trim().toLowerCase();
    const sortOrder = ["asc", "desc"].includes(sortOrderRaw) ? sortOrderRaw : "desc";
    const minApplications = Number(req.body?.min_applications ?? req.body?.minApps ?? 0) || 0;
    const maxApplications = req.body?.max_applications !== undefined && req.body?.max_applications !== null && req.body?.max_applications !== ""
      ? Number(req.body?.max_applications)
      : null;
    const token = req.session.Token || req.body.token;
    request(
      {
        url: `${allApplicantsAPI}?page=${page}&per_page=${per_page}`,
        method: "GET",
        timeout: 20000,
        headers: {
          Authorization: "Bearer" + " " + token,
          "Content-Type": "application/json",
        },
        qs: {
          search_value: searchValue,
          sort_by: sortBy,
          sort_order: sortOrder,
          min_applications: minApplications,
          ...(Number.isFinite(maxApplications) ? { max_applications: maxApplications } : {}),
        },
      },
      (error, response, body) => {
        let parsedBody = body;
        if (typeof parsedBody === "string") {
          try {
            parsedBody = JSON.parse(parsedBody);
          } catch (e) {
            parsedBody = null;
          }
        }
        if (error || !response || response.statusCode !== 200) {
          console.log("ApplicantList request failed:", {
            error: error ? error.message : null,
            status: response ? response.statusCode : null,
          });
          return res.send({
            draw: draw,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          });
        }
        const apiTotal = Number(parsedBody?.pagination?.total);
        const totalRecords = Number.isFinite(apiTotal) ? apiTotal : Number(parsedBody?.numRows || 0);
        const dataToSend = Array.isArray(parsedBody?.data)
          ? parsedBody.data
          : (Array.isArray(parsedBody?.pagination?.data) ? parsedBody.pagination.data : []);
        return res.send({
          draw: draw,
          recordsTotal: totalRecords,
          recordsFiltered: totalRecords,
          data: dataToSend,
        });
      },
    );
  });

applicantController.get(
  "/ApplicantRegistryTypeSummary",
  isAuthenticated,
  can("view-applicants"),
  function (req, res) {
    const token = req.session.Token || req.body?.token;
    const searchValue = String(req.query?.search_value || "").trim();
    const minApplications = Number(req.query?.min_applications ?? 0) || 0;
    const maxApplications = req.query?.max_applications !== undefined && req.query?.max_applications !== null && req.query?.max_applications !== ""
      ? Number(req.query?.max_applications)
      : null;

    request(
      {
        url: applicantsRegistryTypeSummaryAPI,
        method: "GET",
        timeout: 20000,
        headers: {
          Authorization: "Bearer" + " " + token,
          "Content-Type": "application/json",
        },
        qs: {
          search_value: searchValue,
          min_applications: minApplications,
          ...(Number.isFinite(maxApplications) ? { max_applications: maxApplications } : {}),
        },
      },
      (error, response, body) => {
        let parsedBody = body;
        if (typeof parsedBody === "string") {
          try {
            parsedBody = JSON.parse(parsedBody);
          } catch (e) {
            parsedBody = null;
          }
        }

        if (error || !response || response.statusCode !== 200) {
          return res.send({ error: true, data: [] });
        }

        return res.send({
          error: false,
          data: Array.isArray(parsedBody?.data) ? parsedBody.data : [],
        });
      }
    );
  }
);

// look for applicants
applicantController.get(
  "/LookForApplicants",
  isAuthenticated,
  can("view-applicants"),
  function (req, res) {
    var per_page = Number(req.query.per_page || 10);
    var page = Number(req.query.page || 1);
    var search = req.query.q;
    var exclude = req.query.exclude;
    sendRequest(
      req,
      res,
      lookForApplicantsAPI + "?page=" + page + "&per_page=" + per_page,
      "GET",
      { search: search, exclude: exclude },
      (jsonData) => {
        var data = jsonData.data;
        res.send({
          statusCode: data.statusCode,
          message: data.message,
          data: data,
        });
      }
    );
  }
);

// show applicant by id
applicantController.get("/Mwombaji/:id", isAuthenticated, can("view-applicants"),activeHandover, function (req, res) {
  var per_page = Number(req.query.per_page || 10);
  var page = Number(req.query.page || 1);
  var formData = {
    search: req.query.tafuta,
  };
  var applicant_id = req.params.id;
  sendRequest(req,res,findApplicantAPI +"/" +req.params.id +"?page=" +page +"&per_page=" +per_page,"GET",formData,
    (jsonData) => {
      var statusCode = jsonData.statusCode;
      var data = jsonData.data;
      var applicationNumRows = data.applicationsNumRows;
      // var schoolsNumRows = data.schoolsNumRows;
      // var attachmentsNumRows = data.attachmentsNumRows;
      res.render(path.join(__dirname + "/../views/waombaji/view_mwombaji"), {
        req: req,
        statusCode: statusCode,
        applicant: data.applicant,
        applicant_id: applicant_id,
        applications: data.applications,
        // schools: data.schools,
        // attachments: data.attachments,
        applications_pagination: {
          total: applicationNumRows,
          current: page,
          per_page: per_page,
          url: "Mwombaji/" + req.params.id,
          pages: Math.ceil(applicationNumRows / per_page),
        },
      });
    }
  );
});
applicantController.post(
  "/ApplicantSchools/:id",
  isAuthenticated,
  can("view-applicants"),
  function (req, res) {
     let draw = req.body.draw;
     let start = req.body.start;
     let length = req.body.length;
     var per_page = Number(length || 10);
     var page = Number(start / length) + 1;
     var applicant_id = req.params.id;
     sendRequest(
       req,
       res,
       applicantSchoolsAPI+'/'+applicant_id + "?page=" + page + "&per_page=" + per_page,
       "GET",
       req.body,
       (jsonData) => {
         let totalRecords = jsonData.numRows;
         const dataToSend = jsonData.data;
         res.send({
           draw: draw,
           recordsTotal: totalRecords,
           recordsFiltered: totalRecords,
           data: dataToSend,
         });
       }
     );
  }
);
// edit applicant by id
applicantController.get(
  "/Mwombaji/:id/badili",
  isAuthenticated,
  can("update-applicants"),
  activeHandover,
  function (req, res) {
    sendRequest(
      req,
      res,
      editApplicantAPI + "/" + req.params.id + '/edit',
      "GET",
      {},
      (jsonData) => {
        var statusCode = jsonData.statusCode;
        var data = jsonData.data;
        // console.log(data);
        res.render(path.join(__dirname + "/../views/waombaji/edit_mwombaji"), {
          req: req,
          statusCode: statusCode,
          applicant: data,
        });
      }
    );
  }
);
// Transfer Ownership
applicantController.post(
  "/BadiliMwombaji",
  isAuthenticated,
  can("update-applicants"),
  activeHandover,
  function (req, res) {
    sendRequest(
      req,
      res,
      changeSchoolApplicantAPI,
      "POST",
      req.body,
      (response) => {
        res.send({
          statusCode: response.statusCode,
          message: response.message,
        });
      }
    );
  }
);

const transferGovernmentSchoolsHandler = (req, res) => {
  const userId = Number(req.params.id);
  const applicantId = Number(req.body?.applicant_id);
  const lgaCode = String(req.body?.lga_code || "").trim();
  const registryTypeId = Number(req.body?.registry_type_id);
  const token = req.session.Token || req.body.token;

  if (!userId || !applicantId || !lgaCode || registryTypeId !== 3) {
    return res.send({
      statusCode: 306,
      message: "Taarifa za uhamisho hazijakamilika (hakiki Mwombaji/Halmashauri).",
    });
  }

  request(
    {
      url: transferGovernmentSchoolsAPI,
      method: "POST",
      timeout: 30000,
      headers: {
        Authorization: "Bearer" + " " + token,
        "Content-Type": "application/json",
      },
      json: {
        user_id: userId,
        applicant_id: applicantId,
        lga_code: lgaCode,
        registry_type_id: registryTypeId,
      },
    },
    (error, response, body) => {
      if (error || !response || response.statusCode !== 200) {
        console.log("TransferGovernmentSchools failed:", {
          error: error ? error.message : null,
          status: response ? response.statusCode : null,
        });
        return res.send({
          statusCode: 306,
          message: "Imeshindikana kufanya transfer, jaribu tena.",
        });
      }

      const schoolsUpdated = Number(body?.schoolsUpdated || 0) || 0;
      const applicationsUpdated = Number(body?.applicationsUpdated || 0) || 0;
      return res.send({
        statusCode: body?.statusCode || 300,
        schoolsUpdated,
        applicationsUpdated,
        message:
          body?.statusCode === 300
            ? `Transfer imekamilika. Shule ${schoolsUpdated} na Maombi ${applicationsUpdated} yamehamishwa.`
            : (body?.message || "Imeshindikana kufanya transfer."),
      });
    }
  );
};

// Bulk transfer government schools (in a district) to this applicant
applicantController.post(
  "/TransferGovernmentSchools/:id",
  isAuthenticated,
  can("update-schools"),
  activeHandover,
  transferGovernmentSchoolsHandler
);

// Backward compatible alias (old url)
applicantController.post(
  "/TransferRegistry3Schools/:id",
  isAuthenticated,
  can("update-schools"),
  activeHandover,
  transferGovernmentSchoolsHandler
);
module.exports = applicantController;
