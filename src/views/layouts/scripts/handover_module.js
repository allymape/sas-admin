(function () {
  const currentTab = String($("#handover-current-tab").val() || "my").toLowerCase();
  if (!currentTab) return;

  const canApprove = String($("#handover-can-approve").val() || "0") === "1";
  const canViewAll = String($("#handover-can-view-all").val() || "0") === "1";

  const listState = {
    page: 1,
    perPage: 10,
    totalPages: 1,
    total: 0,
    items: [],
  };

  const formModalEl = document.getElementById("handoverFormModal");
  const detailsModalEl = document.getElementById("handoverDetailsModal");
  const formModal = formModalEl ? new bootstrap.Modal(formModalEl) : null;
  const detailsModal = detailsModalEl ? new bootstrap.Modal(detailsModalEl) : null;

  const STATUS_BADGES = {
    draft: "bg-secondary",
    pending_approval: "bg-warning text-dark",
    approved: "bg-info",
    active: "bg-success",
    rejected: "bg-danger",
    cancelled: "bg-dark",
    reclaimed: "bg-primary",
    expired: "bg-light text-dark",
  };

  const STATUS_LABELS = {
    draft: "Draft",
    pending_approval: "Pending Approval",
    approved: "Approved",
    active: "Active",
    rejected: "Rejected",
    cancelled: "Cancelled",
    reclaimed: "Reclaimed",
    expired: "Expired",
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const toStatusBadge = (status) => {
    const key = String(status || "").toLowerCase();
    const klass = STATUS_BADGES[key] || "bg-secondary";
    const label = STATUS_LABELS[key] || key || "-";
    return `<span class="badge ${klass}">${label}</span>`;
  };

  const toScopeBadge = (scopeType) => {
    const key = String(scopeType || "").toLowerCase();
    if (key === "full_role") return '<span class="badge bg-danger-subtle text-danger">FULL ROLE</span>';
    if (key === "tasks_only") return '<span class="badge bg-info-subtle text-info">TASKS ONLY</span>';
    return `<span class="badge bg-light text-dark">${String(scopeType || "-")}</span>`;
  };

  const request = (url, method, data, callback) => {
    ajaxRequest(url, method, (response) => callback(response || {}), data ? JSON.stringify(data) : undefined);
  };

  const refreshApprovalHint = () => {
    const scope = String($("#handover-scope-type").val() || "tasks_only").toLowerCase();
    const $hint = $("#handover-approval-hint");
    if (!$hint.length) return;

    if (scope === "full_role") {
      $hint
        .removeClass("alert-info alert-success")
        .addClass("alert-warning")
        .text("Approval required: full_role handovers must be approved before activation.");
      return;
    }

    $hint
      .removeClass("alert-warning")
      .addClass("alert-info")
      .text("tasks_only handovers may be auto-approved based on business policy; otherwise they remain pending approval.");
  };

  const activeFilters = () => {
    const params = new URLSearchParams();
    params.set("view", currentTab);
    params.set("page", String(listState.page));
    params.set("per_page", String(listState.perPage));

    const status = String($("#filter-status").val() || "").trim();
    const scope = String($("#filter-scope").val() || "").trim();
    const fromDate = String($("#filter-from-date").val() || "").trim();
    const toDate = String($("#filter-to-date").val() || "").trim();

    if (status) params.set("status", status);
    if (scope) params.set("scope_type", scope);
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);

    return params.toString();
  };

  const buildHeaders = () => {
    if (currentTab === "assigned") {
      return ["No", "Owner", "Scope", "Start", "End", "Reason", "Status", "Active Now", "Actions"];
    }
    if (currentTab === "approvals") {
      return ["No", "Owner", "Delegate", "Scope", "Start", "End", "Reason", "Submitted At", "Status", "Actions"];
    }
    if (currentTab === "audit") {
      return ["No", "Time", "Owner", "Delegate", "Actor", "Action", "Description", "Status"];
    }
    if (currentTab === "all") {
      return ["No", "Owner", "Delegate", "Scope", "Start", "End", "Status", "Approved By", "Created At", "Actions"];
    }
    return ["No", "Delegate Name", "Scope", "Start", "End", "Reason", "Status", "Approved By", "Created At", "Actions"];
  };

  const canEdit = (row) => ["draft", "pending_approval"].includes(String(row?.status || "").toLowerCase());
  const canSubmit = (row) => String(row?.status || "").toLowerCase() === "draft";
  const canCancel = (row) => ["draft", "pending_approval", "approved"].includes(String(row?.status || "").toLowerCase());
  const canReclaim = (row) => String(row?.status || "").toLowerCase() === "active";

  const actionButtons = (row) => {
    const id = Number(row?.id || 0);
    const buttons = [
      `<button class="btn btn-sm btn-light btn-view-handover" data-id="${id}">View</button>`,
    ];

    if (currentTab === "my" || currentTab === "all") {
      if (currentTab === "my" && canEdit(row)) {
        buttons.push(`<button class="btn btn-sm btn-outline-primary btn-edit-handover" data-id="${id}">Edit</button>`);
      }
      if (currentTab === "my" && canSubmit(row)) {
        buttons.push(`<button class="btn btn-sm btn-primary btn-submit-handover" data-id="${id}">Submit</button>`);
      }
      if (currentTab === "my" && canCancel(row)) {
        buttons.push(`<button class="btn btn-sm btn-warning btn-cancel-handover" data-id="${id}">Cancel</button>`);
      }
      if (currentTab === "my" && canReclaim(row)) {
        buttons.push(`<button class="btn btn-sm btn-danger btn-reclaim-handover" data-id="${id}">Reclaim</button>`);
      }
    } else if (currentTab === "assigned") {
      buttons.push(`<a class="btn btn-sm btn-primary" href="/my-applications?work_tab=pending&delegated_from=${Number(row?.from_user_id || 0)}&handover_id=${id}">View Delegated Tasks</a>`);
    } else if (currentTab === "approvals" && canApprove) {
      buttons.push(`<button class="btn btn-sm btn-success btn-approve-handover" data-id="${id}">Approve</button>`);
      buttons.push(`<button class="btn btn-sm btn-danger btn-reject-handover" data-id="${id}">Reject</button>`);
    }

    return `<div class="d-flex flex-wrap gap-1">${buttons.join("")}</div>`;
  };

  const renderRows = () => {
    const $body = $("#handover-table-body");
    const rows = Array.isArray(listState.items) ? listState.items : [];
    if (!rows.length) {
      $body.html('<tr><td colspan="20" class="text-center text-muted py-4">No records found.</td></tr>');
      return;
    }

    const startNo = ((listState.page - 1) * listState.perPage) + 1;
    let html = "";

    rows.forEach((row, index) => {
      const no = startNo + index;
      const statusBadge = toStatusBadge(row?.status);
      const scopeBadge = toScopeBadge(row?.scope_type);
      const activeNow = Number(row?.is_active_now || 0) === 1
        ? '<span class="badge bg-success">Yes</span>'
        : '<span class="badge bg-light text-dark">No</span>';

      if (currentTab === "assigned") {
        html += `
          <tr>
            <td>${no}</td>
            <td>${row?.from_user_name || "-"}</td>
            <td>${scopeBadge}</td>
            <td>${formatDateTime(row?.start_at)}</td>
            <td>${formatDateTime(row?.end_at)}</td>
            <td>${row?.reason || "-"}</td>
            <td>${statusBadge}</td>
            <td>${activeNow}</td>
            <td>${actionButtons(row)}</td>
          </tr>
        `;
        return;
      }

      if (currentTab === "approvals") {
        html += `
          <tr>
            <td>${no}</td>
            <td>${row?.from_user_name || "-"}</td>
            <td>${row?.to_user_name || "-"}</td>
            <td>${scopeBadge}</td>
            <td>${formatDateTime(row?.start_at)}</td>
            <td>${formatDateTime(row?.end_at)}</td>
            <td>${row?.reason || "-"}</td>
            <td>${formatDateTime(row?.created_at)}</td>
            <td>${statusBadge}</td>
            <td>${actionButtons(row)}</td>
          </tr>
        `;
        return;
      }

      if (currentTab === "audit") {
        html += `
          <tr>
            <td>${no}</td>
            <td>${formatDateTime(row?.created_at)}</td>
            <td>${row?.from_user_name || "-"}</td>
            <td>${row?.to_user_name || "-"}</td>
            <td>${row?.actor_name || "-"}</td>
            <td><span class="badge bg-dark-subtle text-dark">${row?.action || "-"}</span></td>
            <td>${row?.description || "-"}</td>
            <td>${toStatusBadge(row?.handover_status)}</td>
          </tr>
        `;
        return;
      }

      html += `
        <tr>
          <td>${no}</td>
          <td>${currentTab === "all" ? (row?.from_user_name || "-") : (row?.to_user_name || "-")}</td>
          ${currentTab === "all" ? `<td>${row?.to_user_name || "-"}</td>` : ""}
          <td>${scopeBadge}</td>
          <td>${formatDateTime(row?.start_at)}</td>
          <td>${formatDateTime(row?.end_at)}</td>
          ${currentTab === "my" ? `<td>${row?.reason || "-"}</td>` : ""}
          <td>${statusBadge}</td>
          <td>${row?.approved_by_name || "-"}</td>
          <td>${formatDateTime(row?.created_at)}</td>
          <td>${actionButtons(row)}</td>
        </tr>
      `;
    });

    $body.html(html);
  };

  const renderHead = () => {
    const headers = buildHeaders();
    $("#handover-table-head").html(`<tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>`);
  };

  const refreshPaginationSummary = () => {
    const total = Number(listState.total || 0);
    const start = total === 0 ? 0 : ((listState.page - 1) * listState.perPage) + 1;
    const end = Math.min(total, listState.page * listState.perPage);
    $("#handover-pagination-summary").text(`${start}-${end} of ${total}`);
  };

  const loadActiveStatusBanner = () => {
    request("/Handover/ActiveStatus", "GET", null, (response = {}) => {
      const isActive = Number(response?.statusCode || 306) === 300 && Boolean(response?.active);
      const handover = response?.outgoing_handover || null;
      const $banner = $("#handover-active-status-banner");
      if (!$banner.length) return;
      if (!isActive) {
        $banner.addClass("d-none");
        return;
      }

      const endAt = handover?.end_at ? ` until ${formatDateTime(handover.end_at)}` : "";
      $banner
        .removeClass("d-none")
        .html(`You currently have an active handover and cannot perform workflow actions until the handover ends or is reclaimed${endAt}.`);
    });
  };

  const loadList = () => {
    request(`/Handover/List?${activeFilters()}`, "GET", null, (response = {}) => {
      const statusCode = Number(response?.statusCode || 306);
      if (statusCode !== 300) {
        const message = response?.message || "Failed to fetch handovers.";
        $("#handover-table-body").html(`<tr><td colspan="20" class="text-danger text-center py-3">${message}</td></tr>`);
        return;
      }

      listState.items = Array.isArray(response?.data) ? response.data : [];
      listState.total = Number(response?.pagination?.total || 0);
      listState.totalPages = Math.max(1, Number(response?.pagination?.pages || 1));
      renderRows();
      refreshPaginationSummary();
    });
  };

  const resetForm = () => {
    $("#handover-id").val("");
    $("#handover-form-title").text("Create Handover");
    $("#handover-to-user").val("");
    $("#handover-start-at").val("");
    $("#handover-end-at").val("");
    $("#handover-scope-type").val("tasks_only");
    $("#handover-reason").val("");
    $("#handover-notes").val("");
  };

  const gatherFormPayload = (saveAsDraft = false) => ({
    to_user_id: $("#handover-to-user").val(),
    start_at: $("#handover-start-at").val(),
    end_at: $("#handover-end-at").val(),
    reason: $("#handover-reason").val(),
    notes: $("#handover-notes").val(),
    scope_type: $("#handover-scope-type").val(),
    save_as_draft: Boolean(saveAsDraft),
  });

  const validateForm = (payload) => {
    if (!payload.to_user_id || !payload.reason || !payload.start_at || !payload.end_at) {
      alertMessage("Validation", "Please fill all required fields.", "warning");
      return false;
    }
    const start = new Date(payload.start_at);
    const end = new Date(payload.end_at);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      alertMessage("Validation", "Start date must be earlier than end date.", "warning");
      return false;
    }
    return true;
  };

  const showResult = (response, onSuccess = null) => {
    const statusCode = Number(response?.statusCode || 306);
    const ok = statusCode === 300;
    alertMessage(ok ? "Success" : "Failed", response?.message || (ok ? "Done." : "Operation failed."), ok ? "success" : "error", () => {
      if (ok && typeof onSuccess === "function") onSuccess();
    });
  };

  const loadDetails = (id) => {
    request(`/Handover/Details/${id}`, "GET", null, (response = {}) => {
      const statusCode = Number(response?.statusCode || 306);
      if (statusCode !== 300 || !response?.data) {
        return alertMessage("Failed", response?.message || "Failed to load details.", "error");
      }

      const h = response.data;
      const fields = [
        ["Owner", h.from_user_name || "-"],
        ["Delegate", h.to_user_name || "-"],
        ["Scope", toScopeBadge(h.scope_type)],
        ["Status", toStatusBadge(h.status)],
        ["Start At", formatDateTime(h.start_at)],
        ["End At", formatDateTime(h.end_at)],
        ["Reason", h.reason || "-"],
        ["Notes", h.notes || "-"],
        ["Approved By", h.approved_by_name || "-"],
        ["Approved At", formatDateTime(h.approved_at)],
        ["Cancelled By", h.cancelled_by_name || "-"],
        ["Cancelled At", formatDateTime(h.cancelled_at)],
        ["Reclaimed By", h.reclaimed_by_name || "-"],
        ["Reclaimed At", formatDateTime(h.reclaimed_at)],
        ["Created At", formatDateTime(h.created_at)],
      ];

      $("#handover-details-grid").html(fields.map(([label, value]) => `
        <div class="col-md-4">
          <div class="border rounded p-2 h-100">
            <div class="text-muted small">${label}</div>
            <div>${value}</div>
          </div>
        </div>
      `).join(""));

      request(`/Handover/Audits/${id}?page=1&per_page=100`, "GET", null, (auditResponse = {}) => {
        const rows = Array.isArray(auditResponse?.data) ? auditResponse.data : [];
        $("#handover-details-audits-body").html(
          rows.length
            ? rows.map((item) => `
                <tr>
                  <td>${formatDateTime(item?.created_at)}</td>
                  <td>${item?.actor_name || "-"}</td>
                  <td><span class="badge bg-dark-subtle text-dark">${item?.action || "-"}</span></td>
                  <td>${item?.description || "-"}</td>
                </tr>
              `).join("")
            : '<tr><td colspan="4" class="text-center text-muted">No audit events.</td></tr>',
        );
      });

      if (detailsModal) detailsModal.show();
    });
  };

  const openEdit = (id) => {
    request(`/Handover/Details/${id}`, "GET", null, (response = {}) => {
      const statusCode = Number(response?.statusCode || 306);
      if (statusCode !== 300 || !response?.data) {
        return alertMessage("Failed", response?.message || "Failed to load handover.", "error");
      }
      const h = response.data;
      $("#handover-id").val(h.id);
      $("#handover-form-title").text(`Edit Handover #${h.id}`);
      $("#handover-to-user").val(h.to_user_id);
      $("#handover-start-at").val(String(h.start_at || "").slice(0, 16).replace("T", " "));
      $("#handover-end-at").val(String(h.end_at || "").slice(0, 16).replace("T", " "));
      $("#handover-scope-type").val(h.scope_type || "tasks_only");
      $("#handover-reason").val(h.reason || "");
      $("#handover-notes").val(h.notes || "");
      $("#handover-id").attr("data-status", h.status || "");
      refreshApprovalHint();
      if (formModal) formModal.show();
    });
  };

  // Events
  $("#btn-open-handover-modal").on("click", function () {
    resetForm();
    refreshApprovalHint();
    if (formModal) formModal.show();
  });

  $("#handover-scope-type").on("change", refreshApprovalHint);

  $("#btn-save-draft").on("click", function () {
    const payload = gatherFormPayload(true);
    if (!validateForm(payload)) return;

    const id = Number($("#handover-id").val() || 0);
    if (id > 0) {
      request(`/Handover/Update/${id}`, "POST", payload, (response = {}) => {
        showResult(response, () => {
          if (formModal) formModal.hide();
          loadList();
        });
      });
      return;
    }

    request("/Handover/Create", "POST", payload, (response = {}) => {
      showResult(response, () => {
        if (formModal) formModal.hide();
        loadList();
      });
    });
  });

  $("#btn-submit-handover").on("click", function () {
    const payload = gatherFormPayload(false);
    if (!validateForm(payload)) return;
    const id = Number($("#handover-id").val() || 0);
    const currentStatus = String($("#handover-id").attr("data-status") || "").toLowerCase();

    if (id > 0 && currentStatus === "draft") {
      request(`/Handover/Update/${id}`, "POST", payload, (updateResponse = {}) => {
        const ok = Number(updateResponse?.statusCode || 306) === 300;
        if (!ok) return showResult(updateResponse);
        request(`/Handover/Submit/${id}`, "POST", {}, (submitResponse = {}) => {
          showResult(submitResponse, () => {
            if (formModal) formModal.hide();
            loadList();
          });
        });
      });
      return;
    }

    if (id > 0) {
      request(`/Handover/Update/${id}`, "POST", payload, (response = {}) => {
        showResult(response, () => {
          if (formModal) formModal.hide();
          loadList();
        });
      });
      return;
    }

    request("/Handover/Create", "POST", payload, (response = {}) => {
      showResult(response, () => {
        if (formModal) formModal.hide();
        loadList();
      });
    });
  });

  $("#btn-apply-filters").on("click", function () {
    listState.page = 1;
    loadList();
  });

  $("#btn-prev-page").on("click", function () {
    if (listState.page <= 1) return;
    listState.page -= 1;
    loadList();
  });

  $("#btn-next-page").on("click", function () {
    if (listState.page >= listState.totalPages) return;
    listState.page += 1;
    loadList();
  });

  $(document).on("click", ".btn-view-handover", function () {
    const id = Number($(this).data("id") || 0);
    if (id > 0) loadDetails(id);
  });

  $(document).on("click", ".btn-edit-handover", function () {
    const id = Number($(this).data("id") || 0);
    if (id > 0) openEdit(id);
  });

  $(document).on("click", ".btn-submit-handover", function () {
    const id = Number($(this).data("id") || 0);
    if (!id) return;
    confirmAction(() => {
      request(`/Handover/Submit/${id}`, "POST", {}, (response = {}) => showResult(response, loadList));
    }, "Yes", "warning", "Submit this handover for approval?", "Confirm");
  });

  $(document).on("click", ".btn-cancel-handover", function () {
    const id = Number($(this).data("id") || 0);
    if (!id) return;
    confirmAction(() => {
      request(`/Handover/Cancel/${id}`, "POST", {}, (response = {}) => showResult(response, loadList));
    }, "Yes", "warning", "Cancel this handover?", "Confirm");
  });

  $(document).on("click", ".btn-reclaim-handover", function () {
    const id = Number($(this).data("id") || 0);
    if (!id) return;
    confirmAction(() => {
      request(`/Handover/Reclaim/${id}`, "POST", {}, (response = {}) => showResult(response, loadList));
    }, "Yes", "warning", "Reclaim responsibilities now?", "Confirm");
  });

  $(document).on("click", ".btn-approve-handover", function () {
    const id = Number($(this).data("id") || 0);
    if (!id) return;
    confirmAction(() => {
      request(`/Handover/Approve/${id}`, "POST", {}, (response = {}) => showResult(response, loadList));
    }, "Approve", "warning", "Approve this handover?", "Confirm");
  });

  $(document).on("click", ".btn-reject-handover", function () {
    const id = Number($(this).data("id") || 0);
    if (!id) return;

    Swal.fire({
      title: "Reject Handover",
      input: "textarea",
      inputLabel: "Rejection Reason",
      inputPlaceholder: "Type rejection reason...",
      inputValidator: (value) => (!String(value || "").trim() ? "Reason is required." : undefined),
      showCancelButton: true,
      confirmButtonText: "Reject",
    }).then((result) => {
      if (!result.isConfirmed) return;
      request(`/Handover/Reject/${id}`, "POST", { reason: result.value }, (response = {}) => showResult(response, loadList));
    });
  });

  renderHead();
  refreshApprovalHint();
  loadActiveStatusBanner();
  loadList();
})();
