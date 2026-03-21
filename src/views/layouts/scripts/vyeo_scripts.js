$("#create-btn").on("click", function () {
  modal("showModal", true);
});

function BadiliData(button) {
  const rowData = JSON.parse(button.getAttribute("data-row") || "{}");
  const id = rowData.id;
  const name = rowData.name;
  const description = rowData.description;
  const level = rowData.level;
  const status = rowData.status ? true : false;

  const idField = document.getElementById("id-field");
  if (idField) idField.value = id ?? "";

  const nameField = document.getElementById("name2-field");
  if (nameField) nameField.value = name ?? "";

  const descriptionField = document.getElementById("description2-field");
  if (descriptionField) descriptionField.value = description ?? "";

  const levelField = document.getElementById("uongozi2-field");
  if (levelField) levelField.value = level ?? "";

  const statusField = document.getElementById("status-field");
  if (statusField) statusField.checked = status;

  modal("showEditModal", true);
}

function sajiliHati() {
  const name = String(document.getElementById("name-field")?.value || "").trim();
  const description = String(
    document.getElementById("description-field")?.value || ""
  ).trim();
  const level = String(document.getElementById("uongozi-field")?.value || "").trim();

  if (name.length <= 0) $("#jazasimu").show();
  if (level.length <= 0) $("#jazacheo").show();

  if (name.length > 0 && level.length > 0) {
    ajaxRequest(
      `/tengenezaDesignation`,
      "POST",
      (response) => {
        const statusCode = response.statusCode;
        alertMessage(
          statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
          response.message,
          statusCode == 300 ? "success" : "error",
          () => {
            if (statusCode == 300) $("#datatable").DataTable().ajax.reload();
          }
        );
      },
      JSON.stringify({ name, description, level })
    );
  }
}

function sasishaHati() {
  const id = String(document.getElementById("id-field")?.value || "").trim();
  const name = String(document.getElementById("name2-field")?.value || "").trim();
  const description = String(
    document.getElementById("description2-field")?.value || ""
  ).trim();
  const level = String(document.getElementById("uongozi2-field")?.value || "").trim();
  const status = Boolean(document.getElementById("status-field")?.checked);

  if (name.length > 0 && level.length > 0 && id) {
    ajaxRequest(
      `/badiliDesignation/${id}`,
      "POST",
      (response) => {
        const statusCode = response.statusCode;
        alertMessage(
          statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
          response.message,
          statusCode == 300 ? "success" : "error",
          () => {
            if (statusCode == 300) $("#datatable").DataTable().ajax.reload();
          }
        );
      },
      JSON.stringify({
        name,
        level,
        description,
        status: status ? 1 : 0,
      })
    );
  }
}

