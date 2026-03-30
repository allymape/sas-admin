(function () {
  "use strict";

  var MODE_KEY = "sas_theme_mode";
  var ACCENT_KEY = "sas_theme_accent";
  var LEGACY_MODE_KEY = "sas_layout_mode";
  var VALID_MODES = ["light", "dark", "system"];
  var VALID_ACCENTS = ["blue", "indigo", "green"];

  function safeLocalStorage(action, key, value) {
    try {
      if (!window.localStorage) return null;
      if (action === "get") return window.localStorage.getItem(key);
      if (action === "set") {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function safeSessionStorage(action, key, value) {
    try {
      if (!window.sessionStorage) return null;
      if (action === "get") return window.sessionStorage.getItem(key);
      if (action === "set") {
        window.sessionStorage.setItem(key, value);
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  function getSavedMode() {
    var savedMode = safeLocalStorage("get", MODE_KEY);
    if (VALID_MODES.indexOf(savedMode) === -1) {
      var legacyMode = safeLocalStorage("get", LEGACY_MODE_KEY);
      if (legacyMode === "light" || legacyMode === "dark") {
        savedMode = legacyMode;
      }
    }
    return VALID_MODES.indexOf(savedMode) > -1 ? savedMode : "system";
  }

  function getSavedAccent() {
    var accent = safeLocalStorage("get", ACCENT_KEY);
    return VALID_ACCENTS.indexOf(accent) > -1 ? accent : "blue";
  }

  function resolveLayoutMode(mode) {
    if (mode !== "system") return mode;
    var isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return isDark ? "dark" : "light";
  }

  function updateThemeModeInputs(mode) {
    var inputs = document.querySelectorAll('input[name="sas-theme-mode"]');
    Array.prototype.forEach.call(inputs, function (input) {
      input.checked = input.value === mode;
    });
  }

  function updateAccentButtons(accent) {
    var buttons = document.querySelectorAll("[data-sas-accent-option]");
    Array.prototype.forEach.call(buttons, function (button) {
      var isActive = button.getAttribute("data-sas-accent-option") === accent;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function updateThemeCycleIcon(mode, resolvedMode) {
    var buttons = document.querySelectorAll(".sas-theme-cycle");
    var iconClass = "bx bx-adjust";
    if (mode === "system") {
      iconClass = "bx bx-desktop";
    } else if (resolvedMode === "dark") {
      iconClass = "bx bx-moon";
    } else {
      iconClass = "bx bx-sun";
    }

    Array.prototype.forEach.call(buttons, function (button) {
      var icon = button.querySelector("i");
      if (!icon) return;
      icon.className = iconClass + " fs-22";
      button.setAttribute("data-theme-mode", mode);
      button.setAttribute("title", "Theme: " + mode);
    });
  }

  function applyTheme(mode, accent, persist) {
    var html = document.documentElement;
    var normalizedMode = VALID_MODES.indexOf(mode) > -1 ? mode : "system";
    var normalizedAccent = VALID_ACCENTS.indexOf(accent) > -1 ? accent : "blue";
    var resolved = resolveLayoutMode(normalizedMode);

    html.setAttribute("data-sas-theme-mode", normalizedMode);
    html.setAttribute("data-sas-accent", normalizedAccent);
    html.setAttribute("data-layout-mode", resolved);

    safeSessionStorage("set", "data-layout-mode", resolved);

    if (persist !== false) {
      safeLocalStorage("set", MODE_KEY, normalizedMode);
      safeLocalStorage("set", ACCENT_KEY, normalizedAccent);
      if (normalizedMode === "light" || normalizedMode === "dark") {
        safeLocalStorage("set", LEGACY_MODE_KEY, normalizedMode);
      }
    }

    updateThemeModeInputs(normalizedMode);
    updateAccentButtons(normalizedAccent);
    updateThemeCycleIcon(normalizedMode, resolved);
  }

  function setThemeMode(mode) {
    applyTheme(mode, getSavedAccent(), true);
  }

  function setThemeAccent(accent) {
    applyTheme(getSavedMode(), accent, true);
  }

  function cycleThemeMode() {
    var mode = getSavedMode();
    var next = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setThemeMode(next);
  }

  function ensureToastContainer() {
    var container = document.getElementById("sas-toast-container");
    if (container) return container;

    container = document.createElement("div");
    container.id = "sas-toast-container";
    container.className = "sas-toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
    return container;
  }

  function notify(message, type, title) {
    var text = (message || "").toString().trim();
    if (!text) return;

    var tone = type || "info";
    var heading = title || (tone === "success" ? "Success" : tone === "error" ? "Error" : "Notice");
    var toastContainer = ensureToastContainer();
    var toast = document.createElement("div");
    toast.className = "toast align-items-center border-0 sas-toast sas-toast-" + tone;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("aria-atomic", "true");
    toast.innerHTML =
      '<div class="d-flex">' +
      '  <div class="toast-body">' +
      '    <div class="sas-toast-title">' + heading + "</div>" +
      "    " + text +
      "  </div>" +
      '  <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>' +
      "</div>";

    toastContainer.appendChild(toast);

    if (window.bootstrap && window.bootstrap.Toast) {
      var bootstrapToast = new window.bootstrap.Toast(toast, { delay: 3500 });
      bootstrapToast.show();
      toast.addEventListener("hidden.bs.toast", function () {
        if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
      });
    } else {
      window.setTimeout(function () {
        if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
      }, 3000);
    }
  }

  function confirmDialog(message, options) {
    var cfg = options || {};
    var title = cfg.title || "Confirm Action";
    if (window.Swal && typeof window.Swal.fire === "function") {
      return window.Swal.fire({
        title: title,
        text: message || "Please confirm this action.",
        icon: cfg.icon || "warning",
        showCancelButton: true,
        confirmButtonText: cfg.confirmText || "Confirm",
        cancelButtonText: cfg.cancelText || "Cancel",
      });
    }
    var ok = window.confirm(message || "Please confirm this action.");
    return Promise.resolve({ isConfirmed: ok });
  }

  function attachThemeHandlers() {
    var modeInputs = document.querySelectorAll('input[name="sas-theme-mode"]');
    Array.prototype.forEach.call(modeInputs, function (input) {
      input.addEventListener("change", function () {
        setThemeMode(input.value);
      });
    });

    var accentButtons = document.querySelectorAll("[data-sas-accent-option]");
    Array.prototype.forEach.call(accentButtons, function (button) {
      button.addEventListener("click", function () {
        setThemeAccent(button.getAttribute("data-sas-accent-option"));
      });
    });

    var cycleButtons = document.querySelectorAll(".sas-theme-cycle");
    Array.prototype.forEach.call(cycleButtons, function (button) {
      button.addEventListener("click", cycleThemeMode);
    });

    if (window.matchMedia) {
      var media = window.matchMedia("(prefers-color-scheme: dark)");
      if (media && typeof media.addEventListener === "function") {
        media.addEventListener("change", function () {
          if (getSavedMode() === "system") {
            applyTheme("system", getSavedAccent(), false);
          }
        });
      }
    }
  }

  function attachGlobalFormState() {
    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (!form || form.tagName !== "FORM") return;

      var method = (form.getAttribute("method") || "get").toLowerCase();
      if (method === "get") return;

      var submitter = event.submitter || form.querySelector('button[type="submit"], input[type="submit"]');
      if (!submitter || submitter.hasAttribute("data-sas-no-loading")) return;

      if (submitter.dataset.sasLoadingApplied === "1") return;

      submitter.dataset.sasLoadingApplied = "1";
      submitter.dataset.sasOriginalHtml = submitter.innerHTML;
      submitter.disabled = true;
      submitter.classList.add("disabled");
      submitter.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Saving...';
    });
  }

  function initializeTheme() {
    applyTheme(getSavedMode(), getSavedAccent(), false);
  }

  window.SASTheme = {
    setMode: setThemeMode,
    setAccent: setThemeAccent,
    getMode: getSavedMode,
    getAccent: getSavedAccent,
  };

  window.SASUI = window.SASUI || {};
  window.SASUI.toastSuccess = function (message, title) {
    notify(message, "success", title || "Success");
  };
  window.SASUI.toastError = function (message, title) {
    notify(message, "error", title || "Error");
  };
  window.SASUI.toastInfo = function (message, title) {
    notify(message, "info", title || "Info");
  };
  window.SASUI.confirm = confirmDialog;

  initializeTheme();

  document.addEventListener("DOMContentLoaded", function () {
    initializeTheme();
    attachThemeHandlers();
    attachGlobalFormState();
  });
})();
