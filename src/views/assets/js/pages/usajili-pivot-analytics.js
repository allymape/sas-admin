(function () {
  const config = window.__usajiliPivotConfig || {};
  const apiUrl = config.apiUrl || "";
  const summaryApiUrl = config.summaryApiUrl || "";
  const initialQuery = config.query || {};

  if (!apiUrl || typeof window.jQuery === "undefined") return;

  const $ = window.jQuery;
  const pivotProbe = $("<div></div>");
  const hasPivotUi = $.pivotUtilities && typeof pivotProbe.pivotUI === "function";

  if (!hasPivotUi) {
    $("#pivotStatus")
      .removeClass("d-none alert-info")
      .addClass("alert-danger")
      .text("PivotTable.js pivotUI haijapakiwa. Tafadhali hakiki assets.");
    return;
  }

  const DEFAULT_LIMIT = Number(config.defaultLimit || 5000);
  const MAX_CLIENT_RENDER_ROWS = Number(config.maxClientRenderRows || 0);
  const ALL_CONFIRM_THRESHOLD = Number(config.allConfirmThreshold || 20000);
  const LIMIT_OPTIONS = ["1000", "2000", "5000", "10000", "all"];
  const SESSION_LIMIT_KEY = "usajiliPivotSelectedLimit";

  const FIELD_CONFIG = [
    { key: "region_name", label: "Mkoa", kind: "dimension" },
    { key: "district_name", label: "Wilaya", kind: "dimension" },
    { key: "council_name", label: "Halmashauri", kind: "dimension" },
    { key: "ward_name", label: "Kata", kind: "dimension" },
    { key: "ownership_name", label: "Umiliki", kind: "dimension" },
    { key: "level_name", label: "Ngazi", kind: "dimension" },
    { key: "school_type_name", label: "Aina ya Shule", kind: "dimension" },
    { key: "accommodation_name", label: "Malazi", kind: "dimension" },
    { key: "specialization_name", label: "Tahasusi", kind: "dimension" },
    { key: "language_name", label: "Lugha", kind: "dimension" },
    { key: "verification_status", label: "Uthibitisho", kind: "dimension" },
    { key: "record_count", label: "Jumla ya Maombi", kind: "metric" },
  ];

  const DEFAULT_PIVOT_LAYOUT = {
    rows: ["region_name"],
    cols: ["ownership_name"],
    vals: ["record_count"],
    aggregatorName: "Count",
    rendererName: "Table",
  };

  const KEY_TO_LABEL = FIELD_CONFIG.reduce((acc, field) => {
    acc[field.key] = field.label;
    return acc;
  }, {});
  const labelOf = (key) => KEY_TO_LABEL[key] || key;

  const readStoredLimit = () => {
    try {
      return window.sessionStorage.getItem(SESSION_LIMIT_KEY);
    } catch (error) {
      return null;
    }
  };

  const normalizeLimitValue = (rawValue) => {
    const value = String(rawValue || "").trim().toLowerCase();
    if (value === "all") return "all";

    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      const normalized = String(parsed);
      if (LIMIT_OPTIONS.includes(normalized)) return normalized;
    }

    return String(DEFAULT_LIMIT);
  };

  const persistSelectedLimit = (limitValue) => {
    try {
      window.sessionStorage.setItem(
        SESSION_LIMIT_KEY,
        normalizeLimitValue(limitValue)
      );
    } catch (error) {
      // Ignore storage failures silently.
    }
  };

  const formatLimitLabel = (limitValue) => {
    if (String(limitValue) === "all") return "All";
    const asNumber = Number(limitValue);
    return Number.isFinite(asNumber)
      ? asNumber.toLocaleString()
      : String(DEFAULT_LIMIT);
  };

  const state = {
    rows: [],
    pivotRows: [],
    summary: null,
    selectedLimit: normalizeLimitValue(
      initialQuery?.limit || readStoredLimit() || String(DEFAULT_LIMIT)
    ),
    allLoadConfirmed: false,
    totalRecordsEstimate: null,
  };

  const $status = $("#pivotStatus");
  const $loading = $("#pivotLoading");
  const $empty = $("#pivotEmptyState");
  const $pivot = $("#pivotUiContainer");
  const $limitSelect = $("#pivotLimitSelect");

  const toDimension = (value) => {
    if (value === null || typeof value === "undefined") return "Haijulikani";
    const text = String(value).trim();
    return text.length ? text : "Haijulikani";
  };

  const toMetric = (value) => {
    if (value === null || typeof value === "undefined" || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const mapVerificationStatus = (row) => {
    const direct = String(
      row.verification_status || row.verification_label || row.verified_label || ""
    ).trim();

    if (direct.length) {
      const normalized = direct.toLowerCase();
      if (["1", "verified", "ndiyo", "yes"].includes(normalized)) return "Verified";
      if (["0", "not verified", "not_verified", "hapana", "no"].includes(normalized)) {
        return "Not Verified";
      }
      return direct;
    }

    const code = Number(row.verification_code);
    if (Number.isFinite(code)) return code === 1 ? "Verified" : "Not Verified";
    return "Not Verified";
  };

  const toPivotRecord = (row) => {
    const verificationStatus = mapVerificationStatus(row);
    const normalized = {
      ...row,
      school_type_name: row.school_type_name ?? null,
      verification_status: verificationStatus,
      record_count: toMetric(row.record_count) ?? 1,
    };

    const output = {};
    FIELD_CONFIG.forEach((field) => {
      const sourceValue = normalized[field.key];
      output[field.label] =
        field.kind === "metric" ? toMetric(sourceValue) : toDimension(sourceValue);
    });
    return output;
  };

  const setStatus = (message, type) => {
    const alertType = type || "info";
    $status
      .removeClass("d-none alert-info alert-success alert-warning alert-danger")
      .addClass(`alert-${alertType}`)
      .text(message || "");
  };

  const clearStatus = () => {
    $status.addClass("d-none").text("");
  };

  const setLoading = (isLoading) => {
    $loading.toggleClass("d-none", !isLoading);
  };

  const extractRecordCountFromPayload = (payload) => {
    const candidates = [
      payload?.summary?.total_records,
      payload?.summary?.records_total,
      payload?.summary?.num_rows,
      payload?.summary?.records_returned,
      payload?.summary?.loaded_records,
      payload?.total_records,
      payload?.records_total,
      payload?.num_rows,
      payload?.numRows,
      payload?.recordsTotal,
    ];

    for (let index = 0; index < candidates.length; index += 1) {
      const parsed = Number(candidates[index]);
      if (Number.isFinite(parsed) && parsed >= 0) {
        return parsed;
      }
    }

    if (Array.isArray(payload?.data)) return payload.data.length;
    return null;
  };

  const updateMeta = (summary) => {
    const loaded = Number(
      summary?.records_returned ?? summary?.loaded_records ?? state.rows.length ?? 0
    );
    const refreshed = summary?.last_refreshed
      ? new Date(summary.last_refreshed)
      : null;
    const backendMs = Number(
      summary?.timings?.request_total_ms || summary?.timings?.service_total_ms || 0
    );

    const limitMeta = getLimitMetaFromSummary(summary || {});

    $("#metaRecords").text(loaded.toLocaleString());
    $("#metaLimit").text(limitMeta.displayLimit);
    $("#metaRefreshed").text(
      refreshed && !Number.isNaN(refreshed.getTime())
        ? refreshed.toLocaleString()
        : "-"
    );
    $("#metaBackendMs").text(backendMs > 0 ? `${backendMs.toFixed(0)} ms` : "-");
  };

  const getLimitMetaFromSummary = (summary = {}) => {
    const requestedRaw =
      summary?.requested_limit !== null &&
      typeof summary?.requested_limit !== "undefined"
        ? summary.requested_limit
        : state.selectedLimit;

    const requestedLimit = normalizeLimitValue(requestedRaw || state.selectedLimit);

    const parsedApplied = Number(summary?.applied_limit);
    const appliedLimit = Number.isFinite(parsedApplied) && parsedApplied > 0
      ? parsedApplied
      : null;

    let displayLimit = formatLimitLabel(requestedLimit);

    if (requestedLimit === "all" && appliedLimit !== null) {
      displayLimit = `All (cap ${appliedLimit.toLocaleString()})`;
    } else if (appliedLimit !== null) {
      displayLimit = formatLimitLabel(String(appliedLimit));
    }

    return {
      requestedLimit,
      appliedLimit,
      displayLimit,
    };
  };

  const updateCompactSummary = () => {
    const total = state.rows.length;
    let verified = 0;
    let notVerified = 0;

    state.rows.forEach((row) => {
      const label = mapVerificationStatus(row).toLowerCase();
      if (label === "verified") {
        verified += 1;
      } else {
        notVerified += 1;
      }
    });

    $("#compactSummaryLine").text(
      `Jumla: ${total.toLocaleString()} | Verified: ${verified.toLocaleString()} | Not Verified: ${notVerified.toLocaleString()}`
    );
  };

  const updatePivotConfigSummary = (pivotConfig) => {
    const rows = Array.isArray(pivotConfig?.rows)
      ? pivotConfig.rows
      : DEFAULT_PIVOT_LAYOUT.rows.map((key) => labelOf(key));
    const cols = Array.isArray(pivotConfig?.cols)
      ? pivotConfig.cols
      : DEFAULT_PIVOT_LAYOUT.cols.map((key) => labelOf(key));
    const aggregator =
      pivotConfig?.aggregatorName || DEFAULT_PIVOT_LAYOUT.aggregatorName;
    const renderer = pivotConfig?.rendererName || DEFAULT_PIVOT_LAYOUT.rendererName;

    $("#pivotConfigSummary").text(
      `Rows: ${rows.join(", ") || "-"} | Columns: ${cols.join(", ") || "-"} | Aggregator: ${aggregator} | Renderer: ${renderer}`
    );
  };

  const buildRenderers = () => {
    const baseRenderers = $.extend({}, $.pivotUtilities.renderers || {});

    if ($.pivotUtilities && $.pivotUtilities.plotly_renderers) {
      $.extend(baseRenderers, $.pivotUtilities.plotly_renderers);
    }

    if (!baseRenderers["Table Heatmap"] && baseRenderers["Heatmap"]) {
      baseRenderers["Table Heatmap"] = baseRenderers["Heatmap"];
    }

    return baseRenderers;
  };

  const renderPivotWorkspace = () => {
    if (!state.pivotRows.length) {
      $pivot.empty();
      $empty.removeClass("d-none");
      return;
    }

    $empty.addClass("d-none");
    $pivot.empty();
    $pivot.removeData("pivotUIOptions");

    const renderers = buildRenderers();

    $pivot.pivotUI(
      state.pivotRows,
      {
        rows: DEFAULT_PIVOT_LAYOUT.rows.map((key) => labelOf(key)),
        cols: DEFAULT_PIVOT_LAYOUT.cols.map((key) => labelOf(key)),
        vals: DEFAULT_PIVOT_LAYOUT.vals.map((key) => labelOf(key)),
        aggregatorName: DEFAULT_PIVOT_LAYOUT.aggregatorName,
        rendererName: DEFAULT_PIVOT_LAYOUT.rendererName,
        renderers,
        menuLimit: 500,
        onRefresh: function (pivotConfig) {
          updatePivotConfigSummary(pivotConfig || {});
        },
      },
      true
    );

    updatePivotConfigSummary({
      rows: DEFAULT_PIVOT_LAYOUT.rows.map((key) => labelOf(key)),
      cols: DEFAULT_PIVOT_LAYOUT.cols.map((key) => labelOf(key)),
      vals: DEFAULT_PIVOT_LAYOUT.vals.map((key) => labelOf(key)),
      aggregatorName: DEFAULT_PIVOT_LAYOUT.aggregatorName,
      rendererName: DEFAULT_PIVOT_LAYOUT.rendererName,
    });
  };

  const collectParams = (options = {}) => {
    const params = new URLSearchParams(window.location.search || "");
    if (options.includeLimit === false) {
      params.delete("limit");
    } else {
      params.set("limit", state.selectedLimit);
    }
    return params;
  };

  const fetchSummaryEstimate = async () => {
    if (Number.isFinite(state.totalRecordsEstimate)) {
      return state.totalRecordsEstimate;
    }

    if (!summaryApiUrl) return null;

    try {
      const params = collectParams({ includeLimit: false });
      const response = await fetch(`${summaryApiUrl}?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });

      if (!response.ok) return null;

      const payload = await response.json();
      if (Number(payload?.statusCode) !== 300 || payload?.error) {
        return null;
      }

      const estimate = extractRecordCountFromPayload(payload);
      if (Number.isFinite(estimate)) {
        state.totalRecordsEstimate = estimate;
        return estimate;
      }

      return null;
    } catch (error) {
      return null;
    }
  };

  const ensureAllLimitSafety = async () => {
    if (state.selectedLimit !== "all") return true;
    if (state.allLoadConfirmed) return true;

    const estimate = await fetchSummaryEstimate();
    const shouldAskConfirmation =
      !Number.isFinite(estimate) || Number(estimate) > ALL_CONFIRM_THRESHOLD;

    if (!shouldAskConfirmation) {
      state.allLoadConfirmed = true;
      return true;
    }

    const message = Number.isFinite(estimate)
      ? `Loading all ${Number(estimate).toLocaleString()} records may be slow. Continue?`
      : "Loading all records may be slow. Continue?";

    const confirmed = window.confirm(message);
    if (confirmed) {
      state.allLoadConfirmed = true;
    }

    return confirmed;
  };

  const setLimitSelectorValue = (value) => {
    if (!$limitSelect.length) return;
    $limitSelect.val(normalizeLimitValue(value));
  };

  const fetchData = async (options = {}) => {
    try {
      if (!options.skipAllConfirm) {
        const allSafe = await ensureAllLimitSafety();
        if (!allSafe) {
          setStatus("Umeghairi kupakia records zote.", "warning");
          return;
        }
      }

      clearStatus();
      setLoading(true);
      $empty.addClass("d-none");

      const params = collectParams();
      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      if (Number(payload.statusCode) !== 300 || payload.error) {
        throw new Error(payload.message || "Imeshindikana kupakia data ya pivot");
      }

      const totalEstimate = extractRecordCountFromPayload(payload);
      if (Number.isFinite(totalEstimate)) {
        state.totalRecordsEstimate = totalEstimate;
      }

      state.summary = payload.summary || {};
      state.rows = Array.isArray(payload.data) ? payload.data : [];

      if (MAX_CLIENT_RENDER_ROWS > 0 && state.rows.length > MAX_CLIENT_RENDER_ROWS) {
        state.rows = state.rows.slice(0, MAX_CLIENT_RENDER_ROWS);
        setStatus(
          `Dataset imezidi ukubwa wa browser. Tumeonyesha records ${MAX_CLIENT_RENDER_ROWS.toLocaleString()} za kwanza kwa usalama.`,
          "warning"
        );
      }

      state.pivotRows = state.rows.map((row) => toPivotRecord(row));

      updateMeta(state.summary);
      updateCompactSummary();
      renderPivotWorkspace();

      const limitMeta = getLimitMetaFromSummary(state.summary || {});
      const loadedRecords = Number(
        state.summary?.records_returned ??
          state.summary?.loaded_records ??
          state.rows.length ??
          0
      );

      if (state.summary?.truncated) {
        let warningMessage = "Dataset imewekewa limit upande wa server.";

        if (String(limitMeta.requestedLimit).toLowerCase() === "all" && limitMeta.appliedLimit !== null) {
          warningMessage = `Umeomba All lakini server imetumia cap ya ${Number(limitMeta.appliedLimit).toLocaleString()} records.`;
        } else if (limitMeta.appliedLimit !== null) {
          warningMessage = `Dataset imewekewa limit ya ${Number(limitMeta.appliedLimit).toLocaleString()} records upande wa server.`;
        }

        setStatus(`${warningMessage} Loaded: ${loadedRecords.toLocaleString()}.`, "warning");
      } else {
        const backendMs = Number(
          state.summary?.timings?.request_total_ms ||
            state.summary?.timings?.service_total_ms ||
            0
        );
        setStatus(
          `Pivot workspace iko tayari. Loaded: ${loadedRecords.toLocaleString()} | Limit: ${limitMeta.displayLimit} | Backend: ${backendMs.toFixed(0)} ms`,
          "success"
        );
      }

      if (!state.rows.length) {
        $empty.removeClass("d-none");
      }
    } catch (error) {
      console.error("[PivotAnalytics][fetch.error]", error);
      $pivot.empty();
      $empty.removeClass("d-none").text("Imeshindikana kupakia data ya pivot.");
      setStatus(`Imeshindikana kupakia pivot data: ${error.message || error}`, "danger");
    } finally {
      setLoading(false);
    }
  };

  const applyLimitChange = async (nextLimitRaw) => {
    const nextLimit = normalizeLimitValue(nextLimitRaw);
    const previousLimit = state.selectedLimit;

    if (nextLimit === previousLimit) {
      setLimitSelectorValue(previousLimit);
      return;
    }

    state.selectedLimit = nextLimit;
    state.allLoadConfirmed = false;
    state.totalRecordsEstimate = null;
    persistSelectedLimit(nextLimit);
    setLimitSelectorValue(nextLimit);

    if (nextLimit === "all") {
      const safeToProceed = await ensureAllLimitSafety();
      if (!safeToProceed) {
        state.selectedLimit = previousLimit;
        state.allLoadConfirmed = false;
        state.totalRecordsEstimate = null;
        persistSelectedLimit(previousLimit);
        setLimitSelectorValue(previousLimit);
        setStatus("Umeghairi kubadili dataset kuwa All.", "warning");
        return;
      }
    }

    fetchData({ skipAllConfirm: true });
  };

  if ($limitSelect.length) {
    setLimitSelectorValue(state.selectedLimit);
    $limitSelect.on("change", function () {
      applyLimitChange($(this).val());
    });
  }

  persistSelectedLimit(state.selectedLimit);

  $("#btnReloadPivotData").on("click", function () {
    fetchData();
  });

  fetchData();
})();
