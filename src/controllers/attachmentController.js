require("dotenv").config();
const express = require("express");
const attachmentController = express.Router();
var path = require("path");
const { sendRequest, can, isAuthenticated } = require("../../util");
const FRONTEND_URL = process.env.FRONTEND_URL;
const pdf2base64 = require("pdf-to-base64");
var API_BASE_URL = process.env.API_BASE_URL;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// var pandishaHatiAPI = API_BASE_URL + "upload-attachment";
var pandishaHatiAPI = FRONTEND_URL + "api/school-establishment/upload-attachments";
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const https = require("https");
const fs = require("fs");
const axios = require("axios");
const request = require("request");
const formidable = require("formidable");
// Custom HTTPS agent with SSL verification
const agent = new https.Agent({
  // ca: fs.readFileSync("sas_certificate.crt"),
  rejectUnauthorized: false, // Ensures SSL verification
});

const stripLeadingSlash = (value) => String(value || "").replace(/^\/+/, "");
const stripTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");
const isAbsoluteUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());
const safeDecodeUriComponent = (value) => {
  try {
    return decodeURIComponent(String(value || ""));
  } catch (error) {
    return String(value || "");
  }
};

const buildAttachmentSourceUrl = (rawPath) => {
  const inputPath = String(rawPath || "").trim();
  if (!inputPath) return "";

  if (isAbsoluteUrl(inputPath)) {
    return inputPath;
  }

  const normalizedPath = stripLeadingSlash(inputPath);
  if (!normalizedPath || normalizedPath.includes("..")) return "";

  const normalizedFrontendUrl = stripTrailingSlash(FRONTEND_URL);
  if (!normalizedFrontendUrl) return "";

  if (normalizedPath.startsWith("attachments/")) {
    return `${normalizedFrontendUrl}/${normalizedPath}`;
  }

  return `${normalizedFrontendUrl}/attachments/${normalizedPath}`;
};

const estimateDataUrlBytes = (dataUrl) => {
  const raw = String(dataUrl || "").trim();
  if (!raw) return 0;
  const parts = raw.split(",");
  const base64 = parts.length > 1 ? parts[1] : parts[0];
  if (!base64) return 0;
  const normalized = base64.replace(/\s/g, "");
  const padding = (normalized.match(/=+$/) || [""])[0].length;
  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
};

const fetchAttachmentTypeById = (token, attachmentTypeId, callback) => {
  request(
    {
      url: `${API_BASE_URL}all-attachment-types`,
      method: "GET",
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      qs: {
        page: 1,
        per_page: 500,
        deleted: "false",
      },
    },
    (error, response, body) => {
      if (error || !response || response.statusCode >= 400) {
        return callback(null);
      }
      const rows = Array.isArray(body?.data) ? body.data : [];
      const match = rows.find((row) => Number(row?.id || 0) === Number(attachmentTypeId || 0)) || null;
      return callback(match);
    },
  );
};

const fetchApplicationByTracking = (token, trackingNumber, callback) => {
  request(
    {
      url: `${API_BASE_URL}applications/${encodeURIComponent(String(trackingNumber || "").trim())}`,
      method: "GET",
      json: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    (error, response, body) => {
      if (error || !response || response.statusCode >= 400 || body?.success === false) {
        return callback(null);
      }
      return callback(body?.data || null);
    },
  );
};

const toSingleFieldValue = (value) => {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
};

const parseMultipartAttachmentRequest = (req, callback) => {
  const contentType = String(req.headers?.["content-type"] || "").toLowerCase();
  if (!contentType.includes("multipart/form-data")) {
    return callback(null, { fields: req.body || {}, files: req.files || {} });
  }

  const form = formidable({ multiples: false });
  form.parse(req, (error, fields, files) => {
    if (error) return callback(error);
    return callback(null, { fields: fields || {}, files: files || {} });
  });
};

attachmentController.get(
  "/View-Attachment/*",
  isAuthenticated,
  async function (req, res) {
    const rawPath = safeDecodeUriComponent(req.params?.[0]).trim();
    const sourceUrl = buildAttachmentSourceUrl(rawPath);
    console.log("attachment_url",sourceUrl)
    if (sourceUrl) {
      try {
        const response = await axios.get(sourceUrl, {
          responseType: "stream", // Stream the PDF file directly
          httpsAgent: agent,
        });
        // Set the response headers for PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline"); // Inline to view in browser; change to 'attachment' to force download
        // Pipe the response directly to the client
        response.data.pipe(res);
      } catch (error) {
        console.error("Error downloading or serving PDF:", error.message);
        // Send a beautiful error message as HTML
        res.render(path.join(__dirname + "/../views/errors/download/500"), {error});
      }
    } else {
        res.render(path.join(__dirname + "/../views/errors/download/404"));
    }
  }
);
attachmentController.post(
  "/TumaAttachment",
  isAuthenticated,
  can("upload-attachments"),
  function (req, res) {
    // const formData = {
    //   keyString: req.body.keyString,
    //   trackerId: req.body.trackerId,
    //   attachment: req.body.attachment,
    //   kiambatisho: req.body.kiambatisho,
    // };
    // console.log(formData);
    // sendRequest(req, res, pandishaHatiAPI, "POST", formData, (jsonData) => {
    //   console.log(jsonData);
    //   var { statusCode, message, success } = jsonData;
    //   return res.send({
    //     success,
    //     statusCode,
    //     message,
    //   });
    // });
    // console.log(req.body.kiambatisho);
    try {
      return parseMultipartAttachmentRequest(req, (parseError, parsed) => {
        if (parseError) {
          return res.status(422).send({
            success: false,
            statusCode: 306,
            message: "Invalid upload payload.",
          });
        }

      const fields = parsed?.fields || {};
      const files = parsed?.files || {};
      const applicationId = toSingleFieldValue(fields.application_id || req.body?.application_id);
      const trackingNumber = toSingleFieldValue(
        fields.tracking_number || fields.trackerId || req.body?.tracking_number || req.body?.trackerId || applicationId || "",
      );
      const attachmentTypeId = Number(
        toSingleFieldValue(fields.attachment_type_id || fields.attachment || req.body?.attachment_type_id || req.body?.attachment || 0),
      );
      const rawPayload = toSingleFieldValue(
        fields.kiambatisho_data_url || fields.kiambatisho || req.body?.kiambatisho_data_url || req.body?.kiambatisho || "",
      );
      let normalizedPayload = rawPayload.startsWith("data:")
        ? rawPayload
        : (rawPayload ? `data:application/octet-stream;base64,${rawPayload}` : "");

      const uploadedFile = files.file || files.attachment || null;
      if (!normalizedPayload && uploadedFile?.filepath) {
        try {
          const fileBuffer = fs.readFileSync(uploadedFile.filepath);
          const mimeType = String(uploadedFile.mimetype || "application/octet-stream");
          normalizedPayload = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
        } catch (error) {
          normalizedPayload = "";
        }
      }

      if (!trackingNumber) {
        return res.status(422).send({
          success: false,
          statusCode: 306,
          message: "Tracking/Application id is required.",
        });
      }

      if (!Number.isFinite(attachmentTypeId) || attachmentTypeId <= 0) {
        return res.status(422).send({
          success: false,
          statusCode: 306,
          message: "Attachment type is required.",
        });
      }

      if (!normalizedPayload) {
        return res.status(422).send({
          success: false,
          statusCode: 306,
          message: "Attachment file is required.",
        });
      }

      const uploadedFileBytes = uploadedFile?.size
        ? Number(uploadedFile.size || 0)
        : estimateDataUrlBytes(normalizedPayload);
      const token = req.session?.Token || req.body?.token || "";
      return fetchApplicationByTracking(token, trackingNumber, (application) => {
        if (!application) {
          return res.status(422).send({
            success: false,
            statusCode: 306,
            message: "Application not found.",
          });
        }
        const applicationCategoryId = Number(
          application?.application_category_id || application?.application_category?.id || 0,
        );

        return fetchAttachmentTypeById(token, attachmentTypeId, (attachmentType) => {
          if (!attachmentType) {
            return res.status(422).send({
              success: false,
              statusCode: 306,
              message: "Attachment type is invalid.",
            });
          }

          const attachmentStatus = Number(attachmentType?.status_id ?? attachmentType?.status ?? 0);
          const attachmentIsBackend = Number(attachmentType?.is_backend || 0);
          const attachmentCategoryId = Number(attachmentType?.application_category_id || 0);
          if (attachmentStatus !== 1 || attachmentIsBackend !== 1) {
            return res.status(422).send({
              success: false,
              statusCode: 306,
              message: "Attachment type is not allowed for backend upload.",
            });
          }
          if (applicationCategoryId > 0 && attachmentCategoryId > 0 && applicationCategoryId !== attachmentCategoryId) {
            return res.status(422).send({
              success: false,
              statusCode: 306,
              message: "Attachment type does not belong to this application category.",
            });
          }

          const maxSizeMb = Number(attachmentType?.size || attachmentType?.file_size || 0);
          const maxSizeBytes = maxSizeMb > 0 ? maxSizeMb * 1024 * 1024 : 0;
          if (maxSizeBytes > 0 && uploadedFileBytes > maxSizeBytes) {
            return res.status(422).send({
              success: false,
              statusCode: 306,
              message: `Ukubwa wa faili umezidi kiwango cha ${maxSizeMb} MB.`,
            });
          }

          const formData = {
            tracking_number: trackingNumber,
            staff_id: req.user.id,
            attachments: [
              {
                attachment_type: attachmentTypeId,
                attachment_path: normalizedPayload,
              },
            ],
          };
          const uploadToken = process.env.FRONT_END_TOKEN;
          request(
            {
              url: pandishaHatiAPI,
              method: "POST",
              headers: {
                Authorization: "Bearer" + " " + uploadToken,
                "Content-Type": "application/json",
              },
              json: formData,
            },
            (error, response, body) => {
              if (error) {
                console.log("error", error);
                return res.status(500).send({
                  success: false,
                  statusCode: 306,
                  message: "Kuna tatizo wasiliana na Msimamizi wa mfumo ......",
                });
              } else {
                const { statusCode, message } = body;
                if (response.statusCode == 200) {
                  res.status(response.statusCode).send({
                    success: statusCode ? true : false,
                    statusCode: statusCode ? 300 : 306,
                    message: message
                      ? message
                      : "Kuna shida tafadhali hakiki ukubwa wa faili lako.",
                  });
                } else {
                  res.status(response.statusCode).send({
                    success: false,
                    statusCode: 306,
                    message: `${message} Wasiliana na Msimamizi wa mfumo.`,
                  });
                }
              }
            },
          );
        });
      });
      });
    } catch (error) {
      console.log(error)
        return res.status(500).send({
          success: false,
          statusCode:306,
          message : 'Kuna tatizo wasiliana na Msimamizi wa mfumo.',
        });
    }
  }
);

module.exports = attachmentController;
