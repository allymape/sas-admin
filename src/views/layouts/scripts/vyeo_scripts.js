$("#create-btn").on("click", function () {
  modal("showModal", true);
});
function BadiliData(button) {
  const rowData = JSON.parse(button.getAttribute("data-row"));
  var id = rowData.id;
  var name = rowData.name;
  var description = rowData.description;
  var level = rowData.level;
  var status = rowData.status ? true : false;
 
  if (document.getElementById("id-field")) {
    document.getElementById("id-field").value = id;
  }
  if (document.getElementById("name2-field")) {
    document.getElementById("name2-field").value = name;
  }
  if (document.getElementById("description2-field")) {
    document.getElementById("description2-field").value = description;
  }
  if (document.getElementById("uongozi2-field")) {
    document.getElementById("uongozi2-field").value = level;
  }
  const statusField = document.getElementById("status-field");
  if (statusField) {
    statusField.checked = status;
  }
  modal("showEditModal" , true);
}


function sajiliHati() {
  var name = document.getElementById("name-field").value;
  var description = document.getElementById("description-field").value;
  var level = document.getElementById("uongozi-field").value;

  if (name.length <= 0) {
    $("#jazasimu").show();
  }
  if (level.length <=0 ) {
    $("#jazacheo").show();
  }
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
            if (statusCode == 300) {
              $("#datatable").DataTable().ajax.reload();
            }
          }
        );
      },
      JSON.stringify({
        name: name,
        description : description,
        level: level,
      })
    );
  }
//   if (name.length > 0 && location != "#") {
    // $.ajax({
    //   url: "/add_designation",
    //   type: "POST",
    //   data: JSON.stringify({ name: name, level: location }),
    //   contentType: "application/json",
    //   success: function (response) {
    //     if (response.statusCode == 300) {
    //       $("#alertsuccess").show();
    //     }
    //     if (response.statusCode == 306) {
    //       $("#alertexist").show();
    //     }
    //     if (response.statusCode == 400 || response.statusCode == 500) {
    //       $("#alertmtandao").show();
    //     }
    //     // if(typeof(response) === "string"){response = JSON.parse(response)}
    //   },
    // });
//   }
}
function sasishaHati() {
  var name = document.getElementById("name2-field").value;
  var description = document.getElementById("description2-field").value;
  var level = document.getElementById("uongozi2-field").value;
  var id = document.getElementById("id-field").value;
  var status = document.getElementById("status-field").checked;
  if(name.length > 0 && level.length > 0){
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
            if (statusCode == 300) {
              $('#datatable').DataTable().ajax.reload();
            }
          }
        );
      },
      JSON.stringify({
        name: name,
        level: level,
        description: description,
        status: status ? 1 : 0,
      })
    );
  }

}

