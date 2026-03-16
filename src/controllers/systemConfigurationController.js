require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { exec } = require("child_process");
const { isAuthenticated, can, logSystemEvent } = require("../../util");

const systemConfigurationController = express.Router();

const APP_ROOT = path.resolve(__dirname, "../..");
const WORKSPACE_ROOT = path.resolve(APP_ROOT, "..");
const SAS_API_ROOT = path.join(WORKSPACE_ROOT, "sas-api");

const ALLOWED_NODE_ROOTS = [APP_ROOT, SAS_API_ROOT].map((root) => path.resolve(root));

const DEFAULT_EDITABLE_KEYS = [
  "SYSTEM_LOGS_REFRESH_MS",
  "SYSTEM_LOGS_AUTO_REFRESH",
  "SYSTEM_LOG_ALERT_ENABLED",
  "SYSTEM_LOG_ALERT_LEVELS",
  "SYSTEM_LOG_ALERT_TO",
  "SYSTEM_LOG_ALERT_CC",
  "SYSTEM_LOG_ALERT_BCC",
  "SYSTEM_LOG_ALERT_FROM",
  "SYSTEM_LOG_ALERT_SUBJECT_PREFIX",
  "SYSTEM_LOG_ALERT_COOLDOWN_MS",
  "NODE_ENV",
  "PORT",
  "APP_URL",
  "API_BASE_URL",
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_SECURE",
  "MAIL_USER",
  "MAIL_PASS",
];

const KEY_PATTERN = /^[A-Z_][A-Z0-9_]*$/;
const SENSITIVE_KEY_PATTERN =
  /(PASSWORD|PASS|PWD|SECRET|TOKEN|API_KEY|PRIVATE_KEY|ACCESS_KEY|CLIENT_SECRET|AUTH|CREDENTIAL|SESSION|COOKIE|JWT|BEARER|ENCRYPTION|APP_KEY|DB_.*PASS|SMTP_.*PASS)/i;

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null || String(value).trim() === "") return fallback;
  return ["1", "true", "yes", "y", "on"].includes(String(value).trim().toLowerCase());
};

const toCsvArray = (value = "") =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const uniqueUppercaseKeys = (keys = []) => {
  const normalized = keys
    .map((key) => String(key || "").trim().toUpperCase())
    .filter((key) => KEY_PATTERN.test(key));
  return [...new Set(normalized)];
};

const safePath = (targetPath = "") => path.resolve(String(targetPath || ""));

const isWithinAllowedRoots = (targetPath = "") => {
  const resolved = safePath(targetPath);
  return ALLOWED_NODE_ROOTS.some((root) => resolved === root || resolved.startsWith(root + path.sep));
};

const normalizeTarget = (target = {}) => {
  const id = String(target.id || "").trim() || "target";
  const name = String(target.name || id).trim();
  const envPath = safePath(target.env_path || target.envPath || "");
  const cwd = safePath(target.cwd || path.dirname(envPath));
  const restartCommand = String(target.restart_command || target.restartCommand || "").trim();
  const allowAllKeys = toBool(
    target.allow_all_keys !== undefined ? target.allow_all_keys : target.allowAllKeys,
    true
  );
  const editableKeys = uniqueUppercaseKeys(
    Array.isArray(target.editable_keys)
      ? target.editable_keys
      : Array.isArray(target.editableKeys)
        ? target.editableKeys
        : []
  );

  if (!id || !envPath) return null;
  if (!isWithinAllowedRoots(envPath) || !isWithinAllowedRoots(cwd)) return null;

  return {
    id,
    name,
    env_path: envPath,
    cwd,
    restart_command: restartCommand,
    allow_all_keys: allowAllKeys,
    editable_keys: editableKeys,
  };
};

const defaultTargets = () => {
  const targets = [
    {
      id: "sas-admin",
      name: "SAS Admin",
      env_path: path.join(APP_ROOT, ".env"),
      cwd: APP_ROOT,
      restart_command: process.env.SYSTEM_CONFIG_RESTART_SAS_ADMIN || "",
      allow_all_keys: toBool(process.env.SYSTEM_CONFIG_SAS_ADMIN_ALLOW_ALL_KEYS, true),
      editable_keys: uniqueUppercaseKeys(
        toCsvArray(process.env.SYSTEM_CONFIG_SAS_ADMIN_EDITABLE_KEYS).length
          ? toCsvArray(process.env.SYSTEM_CONFIG_SAS_ADMIN_EDITABLE_KEYS)
          : DEFAULT_EDITABLE_KEYS
      ),
    },
  ];

  if (fs.existsSync(path.join(SAS_API_ROOT, ".env"))) {
    targets.push({
      id: "sas-api",
      name: "SAS API",
      env_path: path.join(SAS_API_ROOT, ".env"),
      cwd: SAS_API_ROOT,
      restart_command: process.env.SYSTEM_CONFIG_RESTART_SAS_API || "",
      allow_all_keys: toBool(process.env.SYSTEM_CONFIG_SAS_API_ALLOW_ALL_KEYS, true),
      editable_keys: uniqueUppercaseKeys(
        toCsvArray(process.env.SYSTEM_CONFIG_SAS_API_EDITABLE_KEYS).length
          ? toCsvArray(process.env.SYSTEM_CONFIG_SAS_API_EDITABLE_KEYS)
          : DEFAULT_EDITABLE_KEYS
      ),
    });
  }

  return targets.map(normalizeTarget).filter(Boolean);
};

const buildTargets = () => {
  const raw = String(process.env.SYSTEM_CONFIG_TARGETS_JSON || "").trim();
  if (!raw) return defaultTargets();

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultTargets();
    const targets = parsed.map(normalizeTarget).filter(Boolean);
    return targets.length ? targets : defaultTargets();
  } catch (error) {
    return defaultTargets();
  }
};

const parseEntries = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const readEnvContent = (envPath) => {
  if (!fs.existsSync(envPath)) return "";
  return fs.readFileSync(envPath, "utf8");
};

const parseEnvMap = (content = "") => {
  try {
    return dotenv.parse(content || "");
  } catch (error) {
    return {};
  }
};

const isSensitiveKey = (key = "") => SENSITIVE_KEY_PATTERN.test(String(key || ""));

const targetEntries = (target) => {
  const content = readEnvContent(target.env_path);
  const parsed = parseEnvMap(content);
  const keys = Object.keys(parsed || {}).sort((a, b) => a.localeCompare(b));

  if (target.allow_all_keys) {
    return keys.map((key) => {
      const value = String(parsed[key] ?? "");
      const sensitive = isSensitiveKey(key);
      return {
        key,
        value: sensitive ? "" : value,
        is_sensitive: sensitive,
        has_value: value !== "",
      };
    });
  }

  const whitelist = target.editable_keys || [];
  return whitelist.map((key) => {
    const value = String(parsed[key] ?? "");
    const sensitive = isSensitiveKey(key);
    return {
      key,
      value: sensitive ? "" : value,
      is_sensitive: sensitive,
      has_value: value !== "",
    };
  });
};

const resolveRestartCommand = (target) => {
  const staticCommand = String(target?.restart_command || "").trim();
  if (staticCommand) return staticCommand;

  const parsed = parseEnvMap(readEnvContent(target?.env_path || ""));
  return String(parsed?.SYSTEM_CONFIG_RESTART_COMMAND || "").trim();
};

const quoteEnvValue = (value = "") => {
  const text = String(value ?? "");
  if (text === "") return '""';
  if (/^[A-Za-z0-9_./:@-]+$/.test(text)) return text;
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
};

const updateEnvFile = (envPath, entries = [], removeKeys = []) => {
  const existingContent = readEnvContent(envPath);
  const lines = existingContent.split(/\r?\n/);
  const keyIndexMap = new Map();

  lines.forEach((line, index) => {
    const trimmed = String(line || "").trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match || !match[1]) return;
    const key = String(match[1]).trim();
    if (!keyIndexMap.has(key)) keyIndexMap.set(key, index);
  });

  const deleteSet = new Set(removeKeys.map((key) => String(key || "").trim()).filter(Boolean));
  for (const key of deleteSet) {
    const index = keyIndexMap.get(key);
    if (index !== undefined) {
      lines[index] = null;
      keyIndexMap.delete(key);
    }
  }

  entries.forEach((entry) => {
    const key = String(entry?.key || "").trim();
    if (!key) return;

    const rendered = `${key}=${quoteEnvValue(entry?.value ?? "")}`;
    if (keyIndexMap.has(key)) {
      const index = keyIndexMap.get(key);
      lines[index] = rendered;
    } else {
      lines.push(rendered);
      keyIndexMap.set(key, lines.length - 1);
    }
  });

  const nextContent = lines.filter((line) => line !== null).join("\n");
  const finalContent = nextContent.endsWith("\n") ? nextContent : `${nextContent}\n`;
  fs.writeFileSync(envPath, finalContent, "utf8");
};

const summarizeTargets = (targets = []) =>
  targets.map((target) => ({
    id: target.id,
    name: target.name,
    env_path: target.env_path,
    allow_all_keys: !!target.allow_all_keys,
    editable_keys: target.editable_keys || [],
    restart_configured: !!resolveRestartCommand(target),
  }));

const getSelectedTarget = (targets = [], preferredId = "") => {
  const requested = String(preferredId || "").trim();
  if (requested) {
    const found = targets.find((target) => target.id === requested);
    if (found) return found;
  }
  return targets[0] || null;
};

const logConfigEvent = (req, payload = {}) => {
  logSystemEvent(
    req,
    {
      level: payload.level || "info",
      module: "system-config",
      event_type: payload.event_type || "system-config-action",
      message: payload.message || "System configuration action",
      source: payload.source || "sas-admin/systemConfigurationController",
      context: payload.context || null,
      error_details: payload.error_details || null,
    },
    () => {}
  );
};

const parseRemoveKeys = (value) => {
  const raw = parseEntries(value);
  return raw
    .map((key) => String(key || "").trim().toUpperCase())
    .filter((key) => KEY_PATTERN.test(key));
};

const parseSubmittedEntries = (rawEntries = []) => {
  const normalized = [];
  rawEntries.forEach((item) => {
    const key = String(item?.key || "").trim().toUpperCase();
    const value = String(item?.value ?? "");
    if (!key) return;
    normalized.push({
      key,
      value,
      keep_existing: toBool(item?.keep_existing, false),
    });
  });
  return normalized;
};

const redactSensitiveText = (value = "") => {
  const text = String(value || "");
  if (!text) return "";

  let sanitized = text.replace(
    /\b([A-Z_][A-Z0-9_]*(?:PASSWORD|PASS|PWD|SECRET|TOKEN|API_KEY|PRIVATE_KEY|ACCESS_KEY|CLIENT_SECRET|AUTH|CREDENTIAL|SESSION|COOKIE|JWT|BEARER|ENCRYPTION|APP_KEY)[A-Z0-9_]*)\s*=\s*([^\s]+)/gi,
    "$1=******"
  );

  sanitized = sanitized.replace(/(https?:\/\/[^:\s]+:)([^@\s]+)(@)/gi, "$1******$3");

  return sanitized;
};

const runCommand = (command, cwd) =>
  new Promise((resolve) => {
    exec(command, { cwd, timeout: 30000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        error,
        stdout: String(stdout || "").trim(),
        stderr: String(stderr || "").trim(),
      });
    });
  });

systemConfigurationController.get("/SystemConfigurations", isAuthenticated, can("view-audit"), function (req, res) {
  return res.render(path.join(__dirname + "/../views/system_configurations"), { req });
});

systemConfigurationController.get("/SystemConfigurationsData", isAuthenticated, can("view-audit"), function (req, res) {
  const targets = buildTargets();
  const selectedTarget = getSelectedTarget(targets, req.query?.target_id);

  if (!selectedTarget) {
    return res.send({
      statusCode: 306,
      message: "Hakuna target ya NodeJS iliyopatikana kwa system configuration.",
      data: { targets: [], selected_target_id: null, entries: [] },
    });
  }

  return res.send({
    statusCode: 300,
    message: "Configuration data imepatikana.",
    data: {
      targets: summarizeTargets(targets),
      selected_target_id: selectedTarget.id,
      entries: targetEntries(selectedTarget),
    },
  });
});

systemConfigurationController.post("/SystemConfigurationsSave", isAuthenticated, can("view-audit"), function (req, res) {
  const targets = buildTargets();
  const selectedTarget = getSelectedTarget(targets, req.body?.target_id);

  if (!selectedTarget) {
    return res.send({
      statusCode: 306,
      message: "Target ya kuhifadhi haijapatikana.",
    });
  }

  const incomingEntries = parseSubmittedEntries(parseEntries(req.body?.entries));
  const removeKeys = parseRemoveKeys(req.body?.remove_keys);

  if (!incomingEntries.length && !removeKeys.length) {
    return res.send({
      statusCode: 306,
      message: "Hakuna mabadiliko ya kuhifadhi.",
    });
  }

  const invalidKeys = incomingEntries
    .map((item) => item.key)
    .filter((key) => !KEY_PATTERN.test(key));

  if (invalidKeys.length) {
    return res.send({
      statusCode: 306,
      message: `Keys sio sahihi: ${[...new Set(invalidKeys)].join(", ")}`,
    });
  }

  if (!selectedTarget.allow_all_keys) {
    const allowed = new Set(selectedTarget.editable_keys || []);
    const blocked = incomingEntries
      .map((item) => item.key)
      .filter((key) => !allowed.has(key));

    if (blocked.length) {
      return res.send({
        statusCode: 306,
        message: `Huna ruhusa kuhariri keys hizi: ${[...new Set(blocked)].join(", ")}`,
      });
    }
  }

  try {
    const existingEnv = parseEnvMap(readEnvContent(selectedTarget.env_path));
    const resolvedEntries = incomingEntries.map((entry) => {
      if (!entry.keep_existing) return { key: entry.key, value: entry.value };

      const hasExistingValue = Object.prototype.hasOwnProperty.call(existingEnv, entry.key);
      if (hasExistingValue) {
        return {
          key: entry.key,
          value: String(existingEnv[entry.key] ?? ""),
        };
      }

      return { key: entry.key, value: entry.value };
    });

    updateEnvFile(selectedTarget.env_path, resolvedEntries, removeKeys);

    logConfigEvent(req, {
      level: "info",
      event_type: "env-save",
      message: `Imehifadhi .env kwa target ${selectedTarget.id}.`,
      context: {
        target_id: selectedTarget.id,
        updated_keys: incomingEntries.map((item) => item.key),
        removed_keys: removeKeys,
      },
    });

    return res.send({
      statusCode: 300,
      message: "Mabadiliko ya .env yamehifadhiwa. Restart service ili yachukue effect.",
      data: {
        target_id: selectedTarget.id,
        entries: targetEntries(selectedTarget),
      },
    });
  } catch (error) {
    logConfigEvent(req, {
      level: "error",
      event_type: "env-save-failed",
      message: `Imefeli kuhifadhi .env kwa target ${selectedTarget.id}.`,
      context: {
        target_id: selectedTarget.id,
      },
      error_details: {
        message: error?.message || null,
      },
    });

    return res.send({
      statusCode: 306,
      message: `Imeshindikana kuhifadhi .env: ${error?.message || "unknown error"}`,
    });
  }
});

systemConfigurationController.post(
  "/SystemConfigurationsRestart",
  isAuthenticated,
  can("view-audit"),
  async function (req, res) {
    const targets = buildTargets();
    const selectedTarget = getSelectedTarget(targets, req.body?.target_id);

    if (!selectedTarget) {
      return res.send({
        statusCode: 306,
        message: "Target ya restart haijapatikana.",
      });
    }

    const restartCommand = resolveRestartCommand(selectedTarget);
    if (!restartCommand) {
      return res.send({
        statusCode: 306,
        message: "Restart command haijawekwa kwa target hii.",
      });
    }

    const result = await runCommand(restartCommand, selectedTarget.cwd);
    const safeStdout = redactSensitiveText(result.stdout);
    const safeStderr = redactSensitiveText(result.stderr);

    if (result.error) {
      logConfigEvent(req, {
        level: "error",
        event_type: "service-restart-failed",
        message: `Restart imefeli kwa target ${selectedTarget.id}.`,
        context: {
          target_id: selectedTarget.id,
          command: restartCommand,
          stdout: safeStdout.slice(0, 3000),
          stderr: safeStderr.slice(0, 3000),
        },
        error_details: {
          message: result.error.message,
        },
      });

      return res.send({
        statusCode: 306,
        message: `Restart imefeli: ${result.error.message}`,
        data: {
          stdout: safeStdout,
          stderr: safeStderr,
        },
      });
    }

    logConfigEvent(req, {
      level: "warning",
      event_type: "service-restart",
      message: `Restart command imekimbia kwa target ${selectedTarget.id}.`,
      context: {
        target_id: selectedTarget.id,
        command: restartCommand,
        stdout: safeStdout.slice(0, 3000),
        stderr: safeStderr.slice(0, 3000),
      },
    });

    return res.send({
      statusCode: 300,
      message: "Restart command imekimbia.",
      data: {
        stdout: safeStdout,
        stderr: safeStderr,
      },
    });
  }
);

module.exports = systemConfigurationController;
