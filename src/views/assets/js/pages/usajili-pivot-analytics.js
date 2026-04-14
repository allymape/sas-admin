(function () {
  const config = window.__usajiliPivotConfig || {};
  const apiUrl = config.apiUrl || "";
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

  const DEFAULT_LIMIT = Number(config.defaultLimit || 2000);
  const MAX_CLIENT_RENDER_ROWS = Number(config.maxClientRenderRows || 5000);

  const FIELD_CONFIG = [
    { key: "id", label: "ID", kind: "dimension" },
    { key: "application_number", label: "Namba ya Ombi", kind: "dimension" },
    { key: "tracking_number", label: "Namba ya Ufuatiliaji", kind: "dimension" },
    { key: "school_name", label: "Jina la Shule", kind: "dimension" },
    { key: "owner_name", label: "Jina la Mmiliki", kind: "dimension" },
    { key: "ownership_name", label: "Umiliki", kind: "dimension" },
    { key: "region_name", label: "Mkoa", kind: "dimension" },
    { key: "district_name", label: "Wilaya", kind: "dimension" },
    { key: "council_name", label: "Halmashauri", kind: "dimension" },
    { key: "ward_name", label: "Kata", kind: "dimension" },
    { key: "level_name", label: "Ngazi", kind: "dimension" },
    { key: "education_type_name", label: "Aina ya Shule", kind: "dimension" },
    { key: "specialization_name", label: "Tahasusi", kind: "dimension" },
    { key: "language_name", label: "Lugha", kind: "dimension" },
    { key: "verification_label", label: "Uthibitisho", kind: "dimension" },
    { key: "institution_status", label: "Hali ya Usajili", kind: "dimension" },
    { key: "application_date", label: "Tarehe ya Ombi", kind: "dimension" },
    { key: "application_year", label: "Mwaka wa Ombi", kind: "dimension" },
    { key: "application_month_name", label: "Mwezi wa Ombi", kind: "dimension" },
    { key: "application_quarter", label: "Robo ya Ombi", kind: "dimension" },

    { key: "record_count", label: "Jumla ya Maombi", kind: "metric" },
    { key: "verified_record", label: "Jumla Verified", kind: "metric" },
    { key: "not_verified_record", label: "Jumla Not Verified", kind: "metric" },
    { key: "processing_days", label: "Siku za Uchakataji", kind: "metric" }
  ];

  const KEY_TO_LABEL = FIELD_CONFIG.reduce((acc, field) => {
    acc[field.key] = field.label;
    return acc;
  }, {});
  const labelOf = (key) => KEY_TO_LABEL[key] || key;

  const state = {
    rows: [],
    pivotRows: [],
    summary: null,
    sampleVisible: false
  };

  const $status = $("#pivotStatus");
  const $loading = $("#pivotLoading");
  const $empty = $("#pivotEmptyState");
  const $pivot = $("#pivotUiContainer");

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

  const mapVerificationLabel = (row) => {
    const direct = String(row.verification_label || row.verification_status || "").trim();
    if (direct.length) {
      const v = direct.toLowerCase();
      if (["1", "verified", "ndiyo", "yes"].includes(v)) return "Verified";
      if (["0", "not verified", "not_verified", "hapana", "no"].includes(v)) return "Not Verified";
      return direct;
    }

    const code = Number(row.verification_code);
    if (Number.isFinite(code)) return code === 1 ? "Verified" : "Not Verified";
    return "Not Verified";
  };

  const mapRegStatusLabel = (row) => {
    const code = Number(row.institution_status);
    if (Number.isFinite(code)) {
      if (code === 1) return "Imesajiliwa";
      if (code === 0) return "Haijasajiliwa";
    }
    return toDimension(row.institution_status);
  };

  const toPivotRecord = (row) => {
    const normalized = {
      ...row,
      verification_label: mapVerificationLabel(row),
      institution_status: mapRegStatusLabel(row)
    };

    const output = {};
    FIELD_CONFIG.forEach((field) => {
      const sourceValue = normalized[field.key];
      output[field.label] = field.kind === "metric" ? toMetric(sourceValue) : toDimension(sourceValue);
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

  const updateMeta = (summary) => {
    const loaded = Number(summary?.loaded_records || state.rows.length || 0);
    const limit = Number(summary?.max_limit || 0) || Number(DEFAULT_LIMIT || 0);
    const refreshed = summary?.last_refreshed ? new Date(summary.last_refreshed) : null;
    const backendMs = Number(summary?.timings?.request_total_ms || summary?.timings?.service_total_ms || 0);

    $("#metaRecords").text(loaded.toLocaleString());
    $("#metaLimit").text(limit > 0 ? limit.toLocaleString() : "-");
    $("#metaRefreshed").text(refreshed && !Number.isNaN(refreshed.getTime()) ? refreshed.toLocaleString() : "-");
    $("#metaBackendMs").text(backendMs > 0 ? `${backendMs.toFixed(0)} ms` : "-");
  };

  const updateCompactSummary = () => {
    const total = state.rows.length;
    let verified = 0;
    let notVerified = 0;

    state.rows.forEach((row) => {
      const label = mapVerificationLabel(row).toLowerCase();
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
    const rows = Array.isArray(pivotConfig?.rows) ? pivotConfig.rows : [labelOf("region_name")];
    const cols = Array.isArray(pivotConfig?.cols) ? pivotConfig.cols : [labelOf("ownership_name")];
    const aggregator = pivotConfig?.aggregatorName || "Count";
    const renderer = pivotConfig?.rendererName || "Table";

    $("#pivotConfigSummary").text(
      `Rows: ${rows.join(", ") || "-"} | Columns: ${cols.join(", ") || "-"} | Aggregator: ${aggregator} | Renderer: ${renderer}`
    );
  };

  const renderFlatPreview = () => {
    const previewRows = state.rows.slice(0, 20);
    const previewFields = [
      "application_number",
      "tracking_number",
      "school_name",
      "ownership_name",
      "region_name",
      "district_name",
      "council_name",
      "level_name",
      "verification_label",
      "institution_status"
    ];

    const $thead = $("#flatDatasetPreviewTable thead");
    const $tbody = $("#flatDatasetPreviewTable tbody");

    if (!previewRows.length) {
      $thead.html("<tr><th>Sample Data</th></tr>");
      $tbody.html("<tr><td class='text-muted'>Hakuna data ya kuonyesha.</td></tr>");
      $("#flatDatasetCaption").text("0 / 0");
      return;
    }

    const headHtml = `<tr>${previewFields.map((key) => `<th>${labelOf(key)}</th>`).join("")}</tr>`;
    $thead.html(headHtml);

    const bodyHtml = previewRows
      .map((row) => {
        const cells = previewFields
          .map((key) => {
            if (key === "verification_label") return mapVerificationLabel(row);
            if (key === "institution_status") return mapRegStatusLabel(row);
            const value = row[key];
            return value === null || typeof value === "undefined" ? "" : String(value);
          })
          .map((value) => `<td>${value}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    $tbody.html(bodyHtml);
    $("#flatDatasetCaption").text(`${previewRows.length.toLocaleString()} / ${state.rows.length.toLocaleString()}`);
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

    const renderers = buildRenderers();

    $pivot.pivotUI(
      state.pivotRows,
      {
        rows: [labelOf("region_name")],
        cols: [labelOf("ownership_name")],
        vals: [labelOf("record_count")],
        aggregatorName: "Count",
        rendererName: "Table",
        renderers,
        hiddenAttributes: [labelOf("id")],
        menuLimit: 500,
        sorters: {
          [labelOf("application_month")]: (a, b) => Number(a || 0) - Number(b || 0)
        },
        onRefresh: function (pivotConfig) {
          updatePivotConfigSummary(pivotConfig || {});
        }
      },
      true
    );

    updatePivotConfigSummary({
      rows: [labelOf("region_name")],
      cols: [labelOf("ownership_name")],
      aggregatorName: "Count",
      rendererName: "Table"
    });
  };

  const collectParams = () => {
    const params = new URLSearchParams(window.location.search || "");
    if (!params.get("limit")) params.set("limit", String(DEFAULT_LIMIT));
    return params;
  };

  const fetchData = async () => {
    try {
      clearStatus();
      setLoading(true);
      $empty.addClass("d-none");

      const params = collectParams();
      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "same-origin"
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      if (Number(payload.statusCode) !== 300 || payload.error) {
        throw new Error(payload.message || "Imeshindikana kupakia data ya pivot");
      }

      state.summary = payload.summary || {};
      state.rows = Array.isArray(payload.data) ? payload.data : [];

      if (state.rows.length > MAX_CLIENT_RENDER_ROWS) {
        state.rows = state.rows.slice(0, MAX_CLIENT_RENDER_ROWS);
        setStatus(
          `Dataset imezidi ukubwa wa browser. Tumeonyesha records ${MAX_CLIENT_RENDER_ROWS.toLocaleString()} za kwanza kwa usalama.`,
          "warning"
        );
      }

      state.pivotRows = state.rows.map((row) => toPivotRecord(row));

      updateMeta(state.summary);
      updateCompactSummary();
      renderFlatPreview();
      renderPivotWorkspace();

      if (state.summary?.truncated) {
        setStatus("Dataset imewekewa limit upande wa server. Ongeza limit kwenye URL ikiwa unahitaji data zaidi.", "warning");
      } else {
        const backendMs = Number(state.summary?.timings?.request_total_ms || state.summary?.timings?.service_total_ms || 0);
        setStatus(`Pivot workspace iko tayari. Loaded: ${state.rows.length.toLocaleString()} | Backend: ${backendMs.toFixed(0)} ms`, "success");
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

  $("#btnToggleSampleData").on("click", function () {
    state.sampleVisible = !state.sampleVisible;
    $("#sampleDataCollapse").toggleClass("d-none", !state.sampleVisible);
    $(this).text(state.sampleVisible ? "Ficha Sample Data" : "Onyesha Sample Data");
  });

  $("#btnReloadPivotData").on("click", function () {
    fetchData();
  });

  fetchData();
})();
