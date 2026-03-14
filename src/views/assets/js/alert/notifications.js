(function () {
  const $notificationsRoot = $("#notifications");
  if (!$notificationsRoot.length) return;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const toText = (value, fallback = "-") => {
    const normalized = String(value ?? "").trim();
    return normalized || fallback;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("sw-TZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEmptyState = (message = "Hakuna maombi yanayosubiri kwa sasa.") => `
    <div class="p-4 text-center">
      <div class="w-25 w-sm-50 pt-2 mx-auto">
        <img src="/design/assets/images/svg/bell.svg" class="img-fluid" alt="bell">
      </div>
      <h6 class="mt-3 mb-0 fs-14 fw-semibold">${escapeHtml(message)}</h6>
    </div>
  `;

  const renderPendingList = (applications = []) => {
    if (!applications.length) return renderEmptyState();

    let html = `<div data-simplebar style="max-height: 320px;" class="pe-2">`;

    applications.forEach((item) => {
      const trackingNumber = toText(item?.tracking_number);
      const schoolName = toText(item?.establishing_school?.school_name);
      const categoryName = toText(item?.application_category?.app_name);
      const createdAt = formatDateTime(item?.created_at);
      const url = trackingNumber !== "-"
        ? `/my-applications/${encodeURIComponent(trackingNumber)}/attend`
        : "/my-applications?work_tab=pending";

      html += `
        <a href="${escapeHtml(url)}" class="text-reset notification-item d-block dropdown-item position-relative">
          <div class="d-flex">
            <div class="avatar-xs me-3">
              <span class="avatar-title bg-soft-info text-info rounded-circle fs-16">
                <i class="ri-file-list-3-line"></i>
              </span>
            </div>
            <div class="flex-1">
              <h6 class="mt-0 mb-1 fs-13 fw-semibold">${escapeHtml(trackingNumber)}</h6>
              <div class="fs-12 text-muted">
                <p class="mb-1">${escapeHtml(schoolName)}</p>
                <p class="mb-1">Aina: ${escapeHtml(categoryName)}</p>
              </div>
              <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                <span><i class="mdi mdi-clock-outline"></i> ${escapeHtml(createdAt)}</span>
              </p>
            </div>
          </div>
        </a>
      `;
    });

    html += `
      </div>
      <div class="my-3 text-center">
        <a href="/my-applications?work_tab=pending" class="btn btn-soft-success waves-effect waves-light">
          Fungua Maombi Yanayosubiri <i class="ri-arrow-right-line align-middle"></i>
        </a>
      </div>
    `;

    return html;
  };

  const renderMyApplicationsTab = (totalPending = 0) => `
    <div class="p-3 text-center">
      <p class="mb-2 fs-13 text-muted">Una maombi yanayosubiri: <strong>${totalPending}</strong></p>
      <a href="/my-applications?work_tab=pending" class="btn btn-soft-primary btn-sm">Fungua Maombi Yangu</a>
    </div>
  `;

  const setCounter = (totalPending = 0) => {
    const total = Number.parseInt(totalPending, 10) || 0;
    const $unreadCounter = $("#unread-notification-counter");
    const $allNotiTabCount = $("#all-noti-tab-count");
    const $allNewMessagesCount = $("#all-new-messages-count");
    const $allMessagesTabCount = $("#all-messages-tab-count");

    if (total > 0) {
      $unreadCounter
        .removeClass("d-none")
        .html(`${total}<span class="visually-hidden">unread messages</span>`);
      $allNotiTabCount.text(`(${total})`);
      $allNewMessagesCount.removeClass("d-none").text(`${total} mapya`);
      $allMessagesTabCount.text(`(${total})`);
      return;
    }

    $unreadCounter.addClass("d-none").empty();
    $allNotiTabCount.text("");
    $allNewMessagesCount.addClass("d-none").text("");
    $allMessagesTabCount.text("");
  };

  const fetchPendingApplications = () => {
    $.ajax({
      url: "/my-applications/list",
      type: "GET",
      dataType: "json",
      data: {
        work_tab: "pending",
        page: 1,
        per_page: 10,
      },
      success: (response) => {
        const rows = Array.isArray(response?.data) ? response.data : [];
        const totalPending = Number.parseInt(response?.pagination?.total, 10) || rows.length;

        setCounter(totalPending);
        $("#all-noti-tab").html(renderPendingList(rows));
        $("#messages-tab").html(renderMyApplicationsTab(totalPending));
      },
      error: () => {
        setCounter(0);
        $("#all-noti-tab").html(renderEmptyState("Imeshindikana kupata maombi yanayosubiri."));
        $("#messages-tab").html(renderMyApplicationsTab(0));
      },
    });
  };

  fetchPendingApplications();
  setInterval(fetchPendingApplications, 60000);
})();
