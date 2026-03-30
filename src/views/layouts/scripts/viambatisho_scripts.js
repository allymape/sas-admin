const renderDataTableAttachmentTypes = () => {
  ajaxRequest("/AttachmentTypes", "GET", (response) => {
    if (response.statusCode == 300) {
      // render table
      //  console.log(response.data)
      var fields = {
        id: {
          hidden: true,
        },
        name: { tdClass: "text-start" },
        registry: { tdClass: "text-center" },
        app_name: { tdClass: "text-start" },
        structure: { tdClass: "text-center" },
        size: { tdClass: "text-center text-nowrap" },
        backend: { tdClass: "text-center" },
        status: { tdClass: "text-center" },
        reg_type: { hidden: true },
        structure_id: { hidden: true },
        app_cat: { hidden: true },
        status_id: { hidden: true },
        is_backend: { hidden: true },
      };
      response.data = response.data.map((type) => {
        const attachmentName = String(type.attachment_name || "-").replace(/"/g, "&quot;");
        const appName = String(type.app_name || "-").replace(/"/g, "&quot;");

        return ({
        id: type.id,
        name: `<span class="attachment-name" title="${attachmentName}">${attachmentName}</span>`,
        registry: type.registry
          ? type.registry
          : `<span class="badge bg-info-subtle text-info">Wote</span>`,
        app_name: `<span title="${appName}">${appName}</span>`,
        size: Number(type.size || 0),
        backend: type.is_backend
          ? `<span class="badge bg-warning-subtle text-warning">Ndani</span>`
          : `<span class="badge bg-light text-muted">Hapana</span>`,
        status: type.status
          ? `<span class="badge bg-success-subtle text-success">Hai</span>`
          : `<span class="badge bg-danger-subtle text-danger">Si Hai</span>`,
        reg_type: type.registration_type_id,
        structure: type.structure
          ? type.structure
          : `<span class="badge bg-success-subtle text-success">Wote</span>`,
        structure_id: type.structure_id,
        status_id: type.status,
        is_backend: type.is_backend,
        app_cat: type.application_category_id,
      })});
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
  var registration_structure_id = document.getElementById("registration-structure-field").value;
  var is_backend = document.getElementById("backend-field").checked ? 1 : 0;
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
      structure: registration_structure_id,
      is_backend: is_backend,
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
  var structure_id = e.getAttribute("data-structure_id");
  var status_id = e.getAttribute("data-status_id");
  var is_backend = e.getAttribute("data-is_backend");
  document.getElementById("id-field").value = nameId;
  document.getElementById("name-field2").value = name;
  document.getElementById("size-field2").value = size;
  document.getElementById("attachment-type-status").checked = Number(status_id)? true: false;
  document.getElementById("backend-field2").checked = Number(is_backend) ? true :false;

  addApplicationCategoriesToSelectionInput(
    "application-category-field2",
    Number(app_cat)
  );
  addRegistrationTypesToSelectionInput(
    "registration-type-field2",
    Number(reg_type) > 0 ?  Number(reg_type) : "0"
  );
  if(structure_id){
    document.getElementById("registration-structure-field2").value = Number(structure_id) 
  }else{
    document.getElementById("registration-structure-field2").value = structure_id
  }
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
  // console.log(selectedValue)
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
  var registration_structure_id = document.getElementById("registration-structure-field2").value;
  var fileId = document.getElementById("id-field").value;
  var is_backend = document.getElementById("backend-field2").checked ? 1 : 0;
  var status_id = document.getElementById("attachment-type-status").checked;
  var data = {
    jina_hati: jina_hati,
    ukubwa: ukubwa,
    file_format: file_format,
    aina_ombi: aina_ombi,
    aina_mwombaji: aina_mwombaji,
    structure: registration_structure_id,
    hali: status_id ? 1 : 0,
    is_backend: is_backend,
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


window.onload = renderDataTableAttachmentTypes;
