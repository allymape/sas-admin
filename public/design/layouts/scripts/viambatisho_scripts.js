const renderDataTableAttachmentTypes = () => {
  ajaxRequest("/AttachmentTypes", "GET", (response) => {
    if (response.statusCode == 300) {
      // render table
      var fields = {
        checkbox: {},
        id: {
          hidden: true,
        },
        name: {},
        registry: {},
        app_name: {},
        size: { tdClass: "text-center" },
        status: { tdClass: "text-center" },
        reg_type: { hidden: true },
        app_cat: { hidden: true },
        status_id: { hidden: true },
      };
      response.data = response.data.map((type) => ({
        checkbox: `<input type='checkbox' class='form-check-input'/>`,
        id: type.id,
        name: type.attachment_name,
        registry: type.registry
          ? type.registry
          : `<span class="badge badge-label bg-info"><i class="mdi mdi-circle-medium"></i> Wote <i class="mdi mdi-circle-medium"></i></span>`,
        app_name: type.app_name,
        size: type.size,
        status: type.status
          ? `<span class="ri-check-double-fill text-success"></span>`
          : `<span class="ri-close-fill text-danger"></span>`,
        reg_type: type.registration_type_id,
        status_id: type.status,
        app_cat: type.application_category_id,
      }));
      dataTable(
        "Viambatisho",
        "attachmentTypeTable",
        fields,
        response,
        {
          editBtn: { show: true, callback: `BadiliData(this); return false` },
          deleteBtn: { show: true, callback: `AddZone1(this); return false;` },
        },
        true,
        "Idadi ya Aina za Viambatisho vilivyopatikana "
      );
    }
  });
};
function sajiliHati() {
  var jina_hati = document.getElementById("name-field").value;
  var ukubwa = document.getElementById("size-field").value;
  var file_format = document.getElementById("format-field").value;
  var aina_ombi = document.getElementById("application-category-field").value;
  var aina_mwombaji = document.getElementById("registration-type-field").value;
  $("#jazahati").hide();
  $("#jazaukubwa").hide();
  $("#ainaombi").hide();
  $("#ainamwombaji").hide();

  if (jina_hati == "") {
    $("#jazahati").show();
  } else if (
    Number(ukubwa) < 0 ||
    ukubwa == "" ||
    ukubwa == 0 ||
    ukubwa == "0" ||
    !/^-?\d*\.?\d*$/.test(ukubwa)
  ) {
    $("#jazaukubwa").show();
  } else if (aina_ombi == "") {
    $("#ainaombi").show();
  } else if (aina_mwombaji == "") {
    $("#ainamwombaji").show();
  } else {
    var data = {
      jina_hati: jina_hati,
      ukubwa: ukubwa,
      file_format: file_format,
      aina_ombi: aina_ombi,
      aina_mwombaji: aina_mwombaji,
    };
    ajaxRequest(
      "/tengenezaAttachmentType",
      "POST",
      (response) => {
        if (response.statusCode == 300) {
          renderDataTableAttachmentTypes();
          $("#showModal").find("input,select").val("")
          document.getElementById("format-field").value = "PDF";
          alertMessage("Success", response.message, "success");
        }
        if (response.statusCode == 306) {
          alertMessage("Error", response.message, "error");
        }
      },
      JSON.stringify(data)
    );
  }
}
function funga() {
  window.location.href = "/Viambatisho";
}

function BadiliData(e) {
  console.log(e.getAttribute("data-reg_type"));
  var nameId = e.getAttribute("data-id");
  var name = e.getAttribute("data-name");
  var size = e.getAttribute("data-size");
  var app_cat = e.getAttribute("data-app_cat");
  var reg_type = e.getAttribute("data-reg_type");
  var status_id = e.getAttribute("data-status_id");
  document.getElementById("id-field").value = nameId;
  document.getElementById("name-field2").value = name;
  document.getElementById("size-field2").value = size;
  document.getElementById("attachment-type-status").checked = Number(status_id)
    ? true
    : false;

  addApplicationCategoriesToSelectionInput(
    "application-category-field2",
    Number(app_cat)
  );
  addRegistrationTypesToSelectionInput(
    "registration-type-field2",
    Number(reg_type)
  );
  modal("showEditModal", true);
}

$("#create-btn").on("click", function () {
  modal("showModal", true);
  addApplicationCategoriesToSelectionInput("application-category-field");
  addRegistrationTypesToSelectionInput("registration-type-field");
});

const addRegistrationTypesToSelectionInput = (
  elementId,
  selectedValue = null
) => {
  console.log(selectedValue)
  ajaxRequest(
    "/RegistrationTypes",
    "GET",
    (response) => {
      if (response.statusCode == 300) {
        response.data.unshift({
          id: "0",
          name: "Wote",
        });
        appendSelectionOption(
          elementId,
          response.data.sort(),
          [selectedValue],
          "Chagua Aina ya Mwombaji"
        );
      }
    },
    { is_paginated: false }
  );
};
const addApplicationCategoriesToSelectionInput = (
  elementId,
  selectedValue = null
) => {
  ajaxRequest(
    "/AppliciationCategories",
    "GET",
    (response) => {
      if (response.statusCode == 300) {
        appendSelectionOption(
          elementId,
          response.data,
          [selectedValue],
          "Chagua Aina ya Ombi"
        );
      }
    },
    { is_paginated: false }
  );
};

function updateHati() {
  var jina_hati = document.getElementById("name-field2").value;
  var ukubwa = document.getElementById("size-field2").value;
  var file_format = document.getElementById("format-field2").value;
  var aina_ombi = document.getElementById("application-category-field2").value;
  var aina_mwombaji = document.getElementById("registration-type-field2").value;
  var fileId = document.getElementById("id-field").value;
  var status_id = document.getElementById("attachment-type-status").checked;
  var data = {
    jina_hati: jina_hati,
    ukubwa: ukubwa,
    file_format: file_format,
    aina_ombi: aina_ombi,
    aina_mwombaji: aina_mwombaji,
    hali: status_id ? 1 : 0,
  };
  if (jina_hati !== "" && aina_ombi != 0 && aina_mwombaji != "") {
    ajaxRequest(
      "/badiliAttachmentType/" + fileId,
      "POST",
      (response) => {
        if (response.statusCode == 300) {
          renderDataTableAttachmentTypes();
          alertMessage("Success", response.message, "success");
        }
        if (response.statusCode == 306) {
          alertMessage("Error", response.message, "error");
        }
      },
      JSON.stringify(data)
    );
  } else {
    alertMessage(
      "Ooooops!",
      "Sehemu ya Mwombaji na aina ya ombi ni za lazima.",
      "warning"
    );
  }
}
function AddZone1(e) {
  var nameId = e.getAttribute("data-id");
  document.getElementById("code-field-edit").value = nameId;
  $("#deleteRecordModal").modal("show");
}
function futaHati() {
  var name = document.getElementById("code-field-edit").value;
  $.ajax({
    url: "/FutaKiambatisho",
    type: "POST",
    data: JSON.stringify({ kiambatishoId: name }),
    contentType: "application/json",
    success: function (response) {
      alert("response");
      $("#deleteRecordModal").modal("hide");
      window.location.href = "/Viambatisho";
    },
  });
}

window.onload = renderDataTableAttachmentTypes;
