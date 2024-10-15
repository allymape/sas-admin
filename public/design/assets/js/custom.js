$(".btn-close-modal").on("click", function () {
  modal("showModal", false);
});

$("#mkoa-field").on("change", function () {
  const regionCode = $(this).val();
  $("#lga-field")
    .html("<option>Chagua Halmashauri</option>")
    .prop("disabled", true);
  $("#kata-field").html("<option>Chagua Kata</option>").prop("disabled", true);
  $("#mtaa-field").html("<option>Chagua Mtaa</option>").prop("disabled", true);
  getAllDistricts(regionCode);
});

$("#lga-field").on("change", function () {
  const lgaCode = $(this).val();
  $("#kata-field").html("<option>Chagua Kata</option>").prop("disabled", true);
  $("#mtaa-field").html("<option>Chagua Mtaa</option>").prop("disabled", true);
  getAllWards(lgaCode);
});

$("#kata-field").on("change", function () {
  const wardCode = $(this).val();
  $("#mtaa-field").html("<option>Chagua Mtaa</option>").prop("disabled", true);
  getAllStreets(wardCode);
});

$(".read-attachment").click(function () {
  const file_path = $(this).attr("data-path");
  const iframe = document.getElementById("pdfdoc");
  document.getElementById("iframediv").css =
    "background:url(/assets/images/ajax-loader.gif) center center no-repeat;";
  iframe.src = "about:blank";
  if (file_path.includes(".pdf")) {
    var path = file_path.split("/");
    const filePath = path[path.length - 1];
    iframe.src = `${document.location.origin}/View-Attachment/${filePath}`;
  } else {
    if (file_path) {
      iframe.src = `data:application/pdf;base64, ${file_path}`;
    }
  }
});

function ajaxRequest(url, method, callback, formData = {}, loading = true) {
  var currentUrl = window.location.href;
  var parameters = currentUrl.split("?")[1] || "";
  if (loading) {
    showLoadingSpinner();
  }
  // alert(typeof formData == "string");
  $.ajax({
    url: url + (parameters ? "?" + parameters : ""),
    type: method,
    contentType: "application/json",
    dataType: "json",
    data: formData,
    success: function (response) {
      if (loading) {
        hideLoadingSpinner();
      }
      callback(response);
    },
    error: function (xhr, exception, text) {
      if (loading) {
        hideLoadingSpinner();
      }
      var msg = "";
      if (xhr.status === 0) {
        msg = "Haujaunganishwa.\n Hakiki mtandao wako.";
      } else if (xhr.status == 404) {
        msg = "Ukurasa haujapatikana.";
      } else if (xhr.status == 401) {
        msg = "Hauna ruhusa ya kufanya kitendo hiki.";
      } 
      else if (xhr.status == 500) {
        msg = "Kuna tatizo la kifundi.";
      } else if (exception === "parsererror") {
        window.location.reload();
        // msg = "Requested JSON parse failed.";
        msg = "Kuna shida tafadhali.";
      } else if (exception === "timeout") {
        msg = "Muda umekishwa.";
      } else if (exception === "abort") {
        msg = "Ombi limeghairishwa.";
      } else {
        msg = "Error:" + xhr.status + " ";
      }
      alertMessage(
        `Kuna Tatizo [Error Code: ${xhr.status}]`,
        msg + "Wasiliana na Msimamizi wa Mfumo",
        "error",
        () => {}
      );
    },
  });
}

var ajaxSelect2 = (
  selector,
  url,
  placeholder = "Chagua ...",
  modalId = "modal",
  selectedValue = null,
  exclude = null,
  delay = 250
) => {
  const select2 = $(`#${selector}`).select2({
    ajax: {
      url: url,
      dataType: "json",
      delay: delay,
      data: function (params) {
        return {
          q: params.term, // search term entered by user
          exclude: exclude,
        };
      },
      processResults: function (response) {
        return {
          results: response.data,
        };
      },
    },
    placeholder: placeholder,
    dropdownParent: $(`#${modalId}`),
    theme: "classic",
  });
  if (selectedValue) {
    select2.val(selectedValue);
  }
};

var dataTable = (
  url,
  tableId,
  fields,
  response,
  actionBtn = {
    showBtn: { show: false },
    editBtn: { show: true },
    deleteBtn: { show: true },
    otherBtn: { show: false },
  },
  hasRowNumber = true,
  caption = "Idadi iliyopatikana",
  ribbon = true
) => {
  var table = $(`#${tableId}`);
  var tBody = table.find("tbody");
  var data = response.data;
  var pages = response.pagination.pages;
  var per_page = response.pagination.per_page;
  var current = response.pagination.current;
  var total = response.pagination.total;
  var first_item = per_page * (current - 1) + 1;
  tBody.empty(); //empty table body
  $(".table-caption-header").remove();
  if (caption) {
    table.before(
      `<div class="table-caption-header alert alert-info h6 d-flex align-items-center justify-content-between">
        <span> ${caption} ${total}.</span> 
        <span class='justify-content-end'>Ukurasa ${current}  kati ya ${pages}     
        [${first_item} hadi ${first_item - 1 + data.length}] </span>
    </div>`
    );
  }
  if (ribbon) {
    table.closest(".card-body")
      .append(`<div class="ribbon-three ribbon-three-info">
                  <span class="badge">${total}</span>
                  </div>`);
  }
  $.each(data, (dataKey, dataValue) => {
    var rowData = "";
    var dataAttributes = "";
    //  rowData =  rowData + `<tr>`;
    rowData =
      rowData + (hasRowNumber ? `<td>${first_item + dataKey}</td>` : "");
    var tdCheckbox = "";

    $.each(fields, (fieldKey, fieldValues) => {
      dataAttributes =
        dataAttributes +
        (containtHtmlTags(dataValue[fieldKey])
          ? ""
          : `data-${fieldKey}="${dataValue[fieldKey]}"`);
      if (isCheckBox(dataValue[fieldKey])) {
        tdCheckbox = tdCheckbox + `<td>${dataValue[fieldKey]}</td>`;
        // return;
      } else {
        var hidden =
          typeof fieldValues.hidden !== undefined ? fieldValues.hidden : false;
        if (!hidden) {
          rowData =
            rowData +
            `<td 
              ${
                typeof fieldValues.tdClass !== "undefined"
                  ? "class='" + fieldValues.tdClass + "'"
                  : ""
              } 
              ${
                typeof fieldValues.tdTitle !== "undefined"
                  ? "title='" + fieldValues.tdTitle + "'"
                  : ""
              } 
              ${
                typeof fieldValues.tdStyle !== "undefined"
                  ? "style='" + fieldValues.tdStyle + "'"
                  : ""
              }
              ${
                typeof fieldValues.tdAttributes !== "undefined"
                  ? fieldValues.tdAttributes
                  : ""
              }
              >
              ${dataValue[fieldKey]}
            </td>`;
        }
      }
    });
    if (actionBtn !== null && typeof actionBtn !== "undefined") {
      rowData = rowData + `<td class="text-right">`;
      // Show Button
      if (typeof actionBtn.showBtn !== "undefined" && actionBtn.showBtn.show) {
        rowData = rowData + `Show`;
      }
      // Edit Button
      if (typeof actionBtn.editBtn !== "undefined" && actionBtn.editBtn.show) {
        rowData =
          rowData +
          ` <a href='#' class="btn btn-link text-primary" 
                            data-id="${dataValue.id ? dataValue.id : ""}" 
                            ${dataAttributes}
                            onclick="${
                              typeof actionBtn.editBtn.callback !== "undefined"
                                ? actionBtn.editBtn.callback
                                : ""
                            }"
                            ><svg xmlns="http://www.w3.org/2000/svg" 
                                  width="24" height="24" viewBox="0 0 24 24" 
                                  fill="none" stroke="currentColor" stroke-width="2" 
                                  stroke-linecap="round" stroke-linejoin="round" 
                                  class="feather feather-edit-3">
                                  <path d="M12 20h9"
                              >
                              </path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z">
                              </path>
                          </svg>
                        </a>`;
      }
      //  Delete Button
      if (
        typeof actionBtn.deleteBtn !== "undefined" &&
        actionBtn.deleteBtn.show &&
        (typeof dataValue.status == "undefined" ||
          (typeof dataValue.status != "undefined" && dataValue.status == 1))
      ) {
        rowData =
          rowData +
          ` <button type="button" class="btn btn-link text-danger" 
                          data-id="${dataValue.id ? dataValue.id : ""}" 
                          ${dataAttributes}
                          onclick="${
                            typeof actionBtn.deleteBtn.callback !== "undefined"
                              ? actionBtn.deleteBtn.callback
                              : ""
                          }"
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                          class="feather feather-trash-2">
                          <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                          </button>`;
      }
      // Other Button
      if (
        typeof actionBtn.otherBtn !== "undefined" &&
        actionBtn.otherBtn.show &&
        (typeof dataValue.status == "undefined" ||
          (typeof dataValue.status != "undefined" && dataValue.status == 1))
      ) {
        rowData =
          rowData +
          `<button type="button" class="btn btn-link text-warning" 
                            data-id="${dataValue.id ? dataValue.id : ""}" 
                            ${dataAttributes}
                            onclick="${
                              typeof actionBtn.otherBtn.callback !== "undefined"
                                ? actionBtn.otherBtn.callback
                                : ""
                            }"
                          ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-unlock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                          </button>`;
      }
      rowData = rowData + `</td>`;
    }
    if (tdCheckbox) {
      rowData = tdCheckbox + rowData;
    }
    rowData = `<tr>` + rowData + `</tr>`;
    tBody.append(rowData); //add table  rowData to table body
  });
  paginate(url, pages, current, per_page); //add pagination
};

function containtHtmlTags(str) {
  const specialHtmlCharacters = /[<>]/;
  return specialHtmlCharacters.test(str);
}
// check if is checkbox
function isCheckBox(str) {
  if (containtHtmlTags(str)) {
    var element = $(str);
    if (typeof element.attr("type") !== "undefined") {
      return true;
    }
  }
  return false;
}

function modal(modalId, show = false) {
  var myModal = new bootstrap.Modal(document.getElementById(modalId), {
    keyboard: false,
    backdrop: "static",
  });
  show ? myModal.show() : myModal.hide();
}

function formatDate(date) {
  if (date) {
    if (date.split("T").length > 1) {
      var newDate = new Date(date).toISOString().split("T");
      return newDate;
    }
    return date;
  }
  return;
}

function changeDateFormat(dateStr) {
  // Create a new Date object
  const dateObj = new Date(dateStr);
  // Format it for the desired timezone (e.g., +3 GMT)
  const options = {
    timeZone: "Africa/Dar_es_Salaam", // Eastern Africa Time (EAT)
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Use 24-hour format
  };
  // Format using toLocaleString
  const formattedDate = dateObj.toLocaleString("en-US", options);
  return formattedDate;
}

function changeOnlyDateFormat(dateStr) {
  // Create a new Date object
  const dateObj = new Date(dateStr);
  // Extract day, month, and year
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = dateObj.getFullYear();
  // Format to DD-MM-YYYY
  const formattedDate = `${day}-${month}-${year}`;
  return formattedDate;
}

// Function to calculate the difference in days from now to a specified datetime
function findDiffDaysFromNow(targetDate) {
  // Check if the targetDate is a valid date
  const endDate = new Date(targetDate);
  if (isNaN(endDate)) {
    throw new Error("Invalid date format");
  }
  // Get the current date
  const now = new Date();
  // Calculate the difference in milliseconds
  const diffTime = now - endDate;
  // Convert milliseconds to days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 1000 ms in a second, 60 seconds in a minute, 60 minutes in an hour, 24 hours in a day
  return diffDays;
}


function showLoadingSpinner() {
  $("#loading").fadeIn();
  var opts = {
    lines: 12, // The number of lines to draw
    length: 7, // The length of each line
    width: 5, // The line thickness
    radius: 10, // The radius of the inner circle
    color: "#000", // #rgb or #rrggbb
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
  };
  var target = document.getElementById("loading");
  var spinner = new Spinner(opts).spin(target);
}

function hideLoadingSpinner() {
  $("#loading").fadeOut();
}

$(".page-size").on("change", function (e) {
  e.preventDefault();
  var isRefreshed = updateUrl("per_page", $(this).val());
  if (!isRefreshed) window.location.reload();
});

$(".btn-delete").on("click", function (e) {
  e.preventDefault();
  confirmAction(
    () => {
      $(this).closest("form").submit();
    },
    "Futa",
    "warning",
    `Hautaweza kurudisha kitendo hiki kikifanikiwa!`,
    "Je, unataka kuendelea?"
  );
});

function appendSelectionOption(
  selectId,
  data,
  selected = [],
  defaultText = "Chagua"
) {
  var fieldSelect = $("#" + selectId);
  var options = `<option value="">${defaultText} </option>`;
  var id = "";
  var name = "";
  for (var i = 0; i < data.length; i++) {
    id = data[i].id;
    name = data[i].name;
    options =
      options +
      `<option value='${id}'  ${
        selected.includes(id) ? "selected" : ""
      } > ${name} </option>`;
  }
  fieldSelect.html(options).prop("disabled", false);
}

function getAllHierarchies(rankId, user = null, selectedHierarchy = null) {
  if (rankId) {
    ajaxRequest(
      "/LookupHierarchies",
      "GET",
      (response) => {
        if (response.statusCode == 300) {
          var data = response.data;
          appendSelectionOption(
            "uongozi-field",
            data.map((item, index) => ({
              name: item.name,
              id: item.id,
            })),
            [selectedHierarchy],
            "Chagua yupo chini ya "
          );
          var selectedUongozi = $("#uongozi-field")
            .find("option:selected")
            .text();
          getAllDesignations(
            user ? user.uongozi : null,
            user ? user.cheo : null
          );
          showHiddenFieldBasedOnSelectedHierarchy(selectedUongozi);
          getAllZones(user, user ? user.zone_id : null);
        }
      },
      { is_paginated: false, rank_id: rankId }
    );
  }
}
function getAllDesignations(hierarchyId, selectedDesignation = null) {

  if (hierarchyId) {
    ajaxRequest(
      "/LookupDesignations",
      "GET",
      (response) => {
        const {statusCode , data} = response;
        console.log(statusCode)
        if (statusCode == 300) {
          appendSelectionOption(
            "cheo-field",
            data.map((item, index) => ({
              name: item.name,
              id: item.id,
            })),
            [selectedDesignation],
            "Chagua cheo "
          );
        }
      },
      { is_paginated: false, hierarchy_id: hierarchyId }
    );
  }
}
// Get Zones
function getAllZones(user = null, selectedZone = null) {
  // Load zones
  ajaxRequest(
    "/LookupZones",
    "GET",
    (zonesResponse) => {
      if (zonesResponse.statusCode == 300) {
        var zones = zonesResponse.data;
        appendSelectionOption(
          "kanda-field",
          zones.map((zone, index) => ({
            name: zone.zone_name,
            id: zone.id,
          })),
          [Number(selectedZone)],
          "Chagua Kanda ..."
        );
        if (user && user.zone_id) {
          $("#mkoa-field").prop("disabled", user.zone_id ? false : true);
          getAllRegions(
            user ? user.zone_id : null,
            user ? user.region_code : null
          );
        }
        if (user && user.region_code) {
          $("#lga-field").prop(
            "disabled",
            user && user.region_code ? false : true
          );
          getAllDistricts(
            user ? user.region_code : null,
            user ? user.district_code : null
          );
        }
      }
    },
    { is_paginated: false }
  ); // end of zones ajax request
}
function getAllRegions(zoneId, selectedRegion = null) {
  if (zoneId) {
    ajaxRequest(
      "/LookupRegion",
      "GET",
      (regionsResponse) => {
        if (regionsResponse.statusCode == 300) {
          var regions = regionsResponse.regions;
          appendSelectionOption(
            "mkoa-field",
            regions.map((region, index) => ({
              name: region.regionName,
              id: region.regionCode,
            })),
            [selectedRegion],
            "Chagua Mkoa"
          );
        }
      },
      { is_paginated: false, zone_id: zoneId }
    );
  }
}

function getAllDistricts(regionCode, selectedDistrict = null) {
  ajaxRequest(
    "/LookupHalmashauri",
    "GET",
    (councilsResponse) => {
      if (councilsResponse.statusCode == 300) {
        var councils = councilsResponse.councils;
        $("#lga-field").prop("disabled", regionCode ? false : true);
        appendSelectionOption(
          "lga-field",
          councils.map((council, index) => ({
            name: council.LgaName,
            id: council.LgaCode,
          })),
          [selectedDistrict],
          "Chagua Halmashauri"
        );
      }
    },
    { is_paginated: false, region_code: regionCode }
  );
}

function getAllWards(lgaCode, selectedWard = null) {
  ajaxRequest(
    "/LookupKata",
    "GET",
    (wardsResponse) => {
      if (wardsResponse.statusCode == 300) {
        const { wards } = wardsResponse;
        $("#kata-field").prop("disabled", lgaCode ? false : true);
        appendSelectionOption(
          "kata-field",
          wards.map((ward, index) => ({
            name: ward.WardName,
            id: ward.WardCode,
          })),
          [selectedWard],
          "Chagua Kata"
        );
      }
    },
    { is_paginated: false, lga_code: lgaCode }
  );
}

function getAllStreets(wardCode, selectedStreet = null) {
  ajaxRequest(
    "/LookupMitaa",
    "GET",
    (streetsResponse) => {
      const { streets, statusCode } = streetsResponse;
      // console.log(statusCode)
      if (statusCode == 300) {
        $("#mtaa-field").prop("disabled", wardCode ? false : true);
        appendSelectionOption(
          "mtaa-field",
          streets.map((street, index) => ({
            name: street.StreetName,
            id: street.StreetCode,
          })),
          [selectedStreet],
          "Chagua Mtaa"
        );
      }
    },
    { is_paginated: false, ward_code: wardCode }
  );
}

// jquery search from html dom
function search(searchElementInput, targetedElements, parent, messageId) {
  let search = $(searchElementInput).val();
  let counter = 0;
  if (search.length > 2) {
    $.each(targetedElements, (index, element) => {
      let text = $(element).text();
      if (text && text.trim().toLowerCase().includes(search.toLowerCase())) {
        $(element).closest(parent).slideDown();
        counter++;
      } else {
        $(element).closest(parent).slideUp();
      }
    });
    if (counter == 0) {
      $(`#${messageId}`)
        .html(
          `<span class='text-info'>Hatujapata kinacholingana na ulichokiandika ...<i>${search}</i><span>`
        )
        .removeClass("d-none");
      return;
    } else {
      $(`#${messageId}`).addClass("d-none");
      return;
    }
  } else {
    targetedElements.closest(parent).slideDown();
    // $(`#${messageId}`).hide();
  }
  if (counter == 0) {
    $(`#${messageId}`).addClass("d-none");
  }
}

$("#logout").on("click", function (e) {
  e.preventDefault();
  logoutFx();
});

var urlWithoutQuery =
  window.location.protocol +
  "//" +
  window.location.host +
  window.location.pathname;

// on search
$(".app-search").on("submit", function (e) {
  e.preventDefault();
  var search = $("#search-options").val();
  var refreshed = updateUrl("tafuta", search);
  if (!refreshed) {
    window.location.reload();
  }
});

//on close search
$("#search-close").on("click", function () {
  var refreshed = updateUrl("tafuta", "");
  if (!refreshed) {
    window.location.reload();
  }
});

var updateUrl = (param, value) => {
  const searchParams = new URLSearchParams(window.location.search);
  const hasPageParam = searchParams.has("page");
  let refreshed = false;
  if (hasPageParam) {
    //  newUrl = newUrl.replace(/(\?|&)page=([^&]*)/, `?page=1`);
    searchParams.delete("page");
    refreshed = true;
  }
  value ? searchParams.set(param, value) : searchParams.delete(param);
  let newUrl = window.location.pathname + "?" + searchParams.toString();
  history.pushState({}, document.title, newUrl);
  if (hasPageParam) {
    window.location.reload();
  }
  return refreshed;
};

function logoutFx() {
  $(
    `<form action='/Logout' method='POST'><input type='hidden' value='logout'></form>`
  )
    .appendTo("body")
    .submit()
    .remove();
}

function validate2FA() {
  var wezesha = document.getElementById("controls-slide");
  var wezeshaValue = 0;
  if (wezesha.checked == true) {
    wezeshaValue = 1;
  }
  if (wezesha.checked == false) {
    wezeshaValue = 0;
  }
  $.ajax({
    url: "/Wezesha2FA",
    type: "POST",
    data: JSON.stringify({ faValue: wezeshaValue }),
    contentType: "application/json",
    success: function (response) {
      if (typeof response === "string") {
        response = JSON.parse(response);
      }
      alert(response.message);
    },
  });
}
function passwordChanged() {
  var strength = document.getElementById("strengthmwox");
  var strongRegex = new RegExp(
    "^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$",
    "g"
  );
  var mediumRegex = new RegExp(
    "^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$",
    "g"
  );
  var enoughRegex = new RegExp("(?=.{6,}).*", "g");
  var pwd = document.getElementById("new-pass-field");
  var strengthhidden = document.getElementById("strengthhiddenmwox");
  if (pwd.value.length == 0) {
    strength.innerHTML = "Type Password";
    strengthhidden.value = "Type Password";
  } else if (false == enoughRegex.test(pwd.value)) {
    strength.innerHTML = "More Characters";
    strengthhidden.value = "More Characters";
  } else if (strongRegex.test(pwd.value)) {
    strength.innerHTML = '<span style="color:green">Strong!</span>';
    strengthhidden.value = "Strong!";
  } else if (mediumRegex.test(pwd.value)) {
    strength.innerHTML = '<span style="color:orange">Medium!</span>';
    strengthhidden.value = "Medium!";
  } else {
    strength.innerHTML = '<span style="color:red">Weak!</span>';
    strengthhidden.value = "Weak!";
  }
}
function badliPass() {
  var userid = document.getElementById("id-fieldmwox").value;
  var oldpassword = document.getElementById("old-pass-field").value;
  var password = document.getElementById("new-pass-field").value;
  var repassword = document.getElementById("re-pass-field").value;
  var strengthhidden = document.getElementById("strengthhiddenmwox").value;
  if (password == repassword) {
    $("#sajilbtn").hide();
    $("#pakiabtn").show();
    if (strengthhidden == "Strong!") {
      $.ajax({
        url: "/BadiliPass",
        type: "POST",
        data: JSON.stringify({
          userid: userid,
          oldpassword: oldpassword,
          password: password,
        }),
        contentType: "application/json",
        success: function (response) {
          // console.log(response)
          // alert(response.statusCode)
          if (response.statusCode == 300) {
            $("#sajilbtn").show();
            $("#pakiabtn").hide();
            $("#alertsuccessmwox").show();
            setTimeout(function () {
              logoutFx();
            }, 2000);
          }
          if (response.statusCode == 306) {
            $("#sajilbtn").show();
            $("#pakiabtn").hide();
            $("#alertexistmwox").show();
          }
          if (response.statusCode == 400 || response.statusCode == 500) {
            $("#sajilbtn").show();
            $("#pakiabtn").hide();
            $("#alertmtandaomwox").show();
          }
        },
      });
    } else {
      alert("Nenosiri sio Salama");
    }
  } else {
    alert("Nenosiri hazifanani");
  }
}

var setUrlSearchParams = (url_segment = null) => {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);
  const entries = [];
  // Iterate over the query string parameters
  for (const [key, value] of searchParams.entries()) {
    entries.push({ key, value });
  }
  // Check if any key has an empty value
  const emptyKeys = url.search
    .substring(1)
    .split("&")
    .map((param) => param.split("=")[0])
    .filter((key) => !searchParams.has(key));
  // Add empty keys to the entries array
  emptyKeys.forEach((key) => {
    entries.push({ key, value: null });
  });

  entries.forEach((params) => {
    const { key, value } = params;
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  });
  // Delete Page from search params if present.
  if (searchParams.has("page")) {
    searchParams.delete("page");
  } else {
    let newUrl = window.location.pathname + "?" + searchParams.toString();
    history.pushState(
      {},
      document.title,
      searchParams.toString() ? newUrl : newUrl.replace("?", "")
    ); //Modify url and make sure it does not include empty params
  }
  let params = searchParams.toString();
  if (url_segment) {
    return `/${url_segment}?` + params;
  }
  return params;
};

function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};
  for (const param of params.entries()) {
    const [key, value] = param;
    result[key] = value;
  }
  return result;
}

// setTimeout(() =>  {
//     var kuanzacounti = document.getElementById("kuanzacounti");
//     ajaxRequest(`/ActiveMenu` , 'GET' , (response) => {

//               if (typeof response === "string") {
//                 response = JSON.parse(response);
//               }
//               txt = document.createTextNode(response.kauntikuanza);
//               kuanzacounti.appendChild(txt);
//               if (response.TwoFA == 0) {
//                 document.getElementById("controls-slide").checked = false;
//               }

//               if (response.TwoFA == 1) {
//                 document.getElementById("controls-slide").checked = true;
//               }
//     } , {} , false);
//   }, 1000);

function diffForHumans(date) {
  if (date) {
    const dt = new Date(date);
    // Make a fuzzy time
    var delta = Math.round((+new Date() - dt) / 1000);
    var minute = 60,
      hour = minute * 60,
      day = hour * 24;
    var fuzzy = "";
    if (delta < 60) {
      fuzzy = "Sek " + delta;
    } else if (delta < hour) {
      fuzzy = "Dak " + Math.floor(delta / minute);
    } else if (Math.floor(delta / hour) < 24) {
      fuzzy = "Saa " + Math.floor(delta / hour);
    } else if (Math.floor(delta / day) <= 30) {
      fuzzy = "Siku " + Math.floor(delta / day);
    } else if (Math.floor(delta / day) > 30) {
      return changeDateFormat(date);
    }
    return fuzzy;
  }
}

function tumaMaoniYako(
  urlComment,
  data,
  staffsInput,
  comments,
  btn,
  urlRedirection = ""
) {
  if (comments.length > 0) {
    if (
      (staffsInput == "#" && btn == "wasilisha") ||
      (staffsInput != "#" && staffsInput != "" && btn == "tuma") ||
      (staffsInput == "#" && staffsInput != "" && btn == "rudisha") ||
      (staffsInput == "#" && staffsInput != "" && btn == "thibitisha") ||
      (staffsInput == "#" && staffsInput != "" && btn == "kataa")
    ) {
      confirmAction(
        () => {
          ajaxRequest(
            `${urlComment}`,
            "POST",
            (response) => {
              const { statusCode } = response;
              if (statusCode == 300) {
                alertMessage(
                  `Success`,
                  `Hongera! Umefanikiwa`,
                  "success",
                  () => {
                    if (urlRedirection) {
                      window.location.href = urlRedirection;
                    }
                  }
                );
              } else {
                alertMessage(
                  `Error`,
                  `Samahani! Haujafanikiwa kuna tatizo Wasiliana na Msimamizi wa Mfumo.`,
                  "warning",
                  () => {
                    window.location.href = urlRedirection;
                  }
                );
              }
            },
            JSON.stringify(data)
          );
        },
        "Ndio!, Endelea",
        "warning",
        `Je, una uhakika unataka ${
          btn == "tuma"
            ? "kutuma kwenda kwa " + $("#staffs option:selected").text()
            : btn == "wasilisha"
            ? "kuwasilisha ombi hili kwenda ngazi juu"
            : btn == "rudisha"
            ? "kurudisha ombi hili kwa Mwombaji"
            : btn == "thibitisha"
            ? "kuthibitisha ombi hili"
            : btn == "kataa"
            ? "kukataa ombi hili"
            : ""
        }?`,
        "Confirmation"
      );
    } else {
      if (btn == "tuma") {
        alertMessage(
          "Tahadhari",
          "Tafadhali, Chagua Afisa wa kumtumia.",
          "warning",
          () => {}
        );
      } else {
        alertMessage(
          "Tahadhari",
          "Samahani, huwezi kubonyeza kitufe hiki",
          "warning",
          () => {}
        );
      }
    }
  } else {
    alertMessage("Tahadhari", "Weka maoni yako kwanza.", "warning", () => {});
  }
}


// Remove empty parameters from the URL
    var cleanUrl = function(url) {
        var urlObj = new URL(url);
        urlObj.searchParams.forEach((value, key) => {
            if (!value) {
                urlObj.searchParams.delete(key);
            }
        });
        return urlObj.toString();
    };

    // Update the URL without reloading the page
    if (window.history.replaceState) {
        var cleanHref = cleanUrl(window.location.href);
        window.history.replaceState(null, null, cleanHref);
    }

function tableData(tableId ,url, type, columns , data = null , columnDefs = []) {
  $(`#${tableId}`).DataTable({
    processing: true,
    serverSide: true,
    ajax: {
      url: url,
      type: type,
      data: function (d) {
        // You can add any necessary data processing here if needed
        // Example: Adding custom parameters to the request
        // d.customParam1 = "value1";
        // d.customParam2 = "value2";
        if (typeof data === "object" && data !== null) {
          data.forEach((item) => {
            d[item.name] = item.value;
          });
        }
      },
    },
    columns: columns,
    layout: {
      topStart: {
        buttons: [
          "pageLength",
          [
            {
              extend: "copyHtml5",
              footer: false,
              exportOptions: { columns: ":not(:last-child)" },
            },
            {
              extend: "excelHtml5",
              footer: false,
              text: "Export Excel",
              exportOptions: { columns: ":not(:last-child)" },
            },
            {
              extend: "csvHtml5",
              footer: false,
              text: "Export CSV",
              exportOptions: { columns: ":not(:last-child)" },
            },
            {
              extend: "pdfHtml5",
              footer: false,
              text: "Export PDF",
              exportOptions: { columns: ":not(:last-child)" },
              orientation: "landscape",
              pageSize: "A4",
              customize: function (doc) {
                var colCount = new Array();
                $(`#${tableId}`)
                  .find("thead tr:first-child th")
                  .each(function () {
                    if ($(this).attr("colspan")) {
                      for (var i = 1; i <= $(this).attr("colspan"); i++) {
                        colCount.push("*");
                      }
                    } else {
                      colCount.push("*");
                    }
                  });
                // doc.content[1].table.widths = colCount;
              },
            },
            {
              extend: "print",
              footer: false,
              exportOptions: { columns: ":not(:last-child)" },
            },
          ],
          "colvis",
        ],
      },
    },
    columnDefs: columnDefs,
    lengthMenu: [
      [10, 25, 50, 100, 500, -1],
      ["10 rows", "25 rows", "50 rows", "100 rows", "500 rows", "Show all"],
    ],
    language: {
      searchPlaceholder: "Search Here ...",
    },
  });
}

function actionButtons(row, elements) {
  const escapedRow = JSON.stringify(row)
    .replace(/"/g, "&quot;") // escape double quotes
    .replace(/'/g, "&#39;"); // escape single quotes
  if (typeof elements == "object") {
    let tags = ``;
    elements.forEach((element) => {
      if (element.show) {
        if (element.type == "button") {
          tags += `<button type="button"
                          ${
                            element.moreAttributes ? element.moreAttributes : ""
                          }
                          ${
                            row
                              ? `data-row="${escapedRow}"`
                              : ""
                          } 
                          class="${element.class ? element.class : ""}" 
                          onclick="${
                            element.function
                              ? element.function + "(this); return false;"
                              : ""
                          }"
                      >
                        <span class="${
                          element.icon ? element.icon : ""
                        }"></span> ${element.btnText ? element.btnText : ""}
                    </button>`;
        } else {
          tags += `<a href="${element.link ? element.link : "#"}" 
                        ${element.moreAttributes ? element.moreAttributes : ""}
                        ${row ? "data-row='" + JSON.stringify(row) + "'" : ""} 
                        class="${element.class ? element.class : ""}" 
                        onclick="${
                          element.function
                            ? element.function + "(this); return false;"
                            : ""
                        }"
                     >
                        <span class="${
                          element.icon ? element.icon : ""
                        }"></span> ${element.btnText ? element.btnText : ""}
                    </a>`;
        }
      }
    });
    return tags;
  }
}
