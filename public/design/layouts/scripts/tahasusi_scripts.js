$("#create-btn").on("click", function () {
  modal("showModal", true);
});
function BadiliData(e) {
  var id = e.getAttribute("data-id");
  var name = e.getAttribute("data-name");
  var specialization = e.getAttribute("data-specialization_id");
  // var status = e.getAttribute("data-status");
  document.getElementById("id-field").value = id;
  document.getElementById("name2-field").value = name;
  document.getElementById("specialization2-field").value = specialization;
  // document.getElementById("status2-field").checked = status == 1 ? true : false;
  modal("showEditModal" , true);
}

function deleteRestoreTahasusi(e) {
  const id = e.getAttribute("data-id");
  const status = e.getAttribute("data-status");
  confirmAction(
    () => {
      ajaxRequest(`/FutaCombination/${id}`, "POST", (response) => {
        const statusCode = response.statusCode;
        alertMessage(
          statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
          response.message,
          statusCode == 300 ? "success" : "error",
          () => {
            if (statusCode == 300) {
              window.location.reload();
            }
          }
        );
      });
    },
    (confirmBtnText = "Endelea"),
    (icon = `${status == 1 ? 'error' : 'warning'}`),
    (text = `${status == 1 ? 'You want to delete this?You can restore it back!' : 'You want to restore this?'}`),
    (title = "Are you sure?"),
    (html = "")
  );
}
function sajiliTahasusi() {
  var name = document.getElementById("name-field").value;
  var specialization = document.getElementById("specialization-field").value;

  if (name.length <= 0) {
    $("#jazasimu").show();
  }
  if (specialization.length <= 0) {
    $("#jazacheo").show();
  }
  if (name.length > 0 && specialization.length > 0) {
    ajaxRequest(
      `/TengenezaCombination`,
      "POST",
      (response) => {
        const statusCode = response.statusCode;
        alertMessage(
          statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
          response.message,
          statusCode == 300 ? "success" : "error",
          () => {
            if (statusCode == 300) {
              window.location.reload();
            }
          }
        );
      },
      JSON.stringify({
        name: name,
        school_specialization_id: specialization,
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
function sasishaTahasusi() {
  var name = document.getElementById("name2-field").value;
  var school_specialization_id = document.getElementById("specialization2-field").value;
  var id = document.getElementById("id-field").value;
  if (name.length > 0 && school_specialization_id.length > 0) {
    ajaxRequest(
      `/BadiliCombination/${id}`,
      "POST",
      (response) => {
        const statusCode = response.statusCode;
        alertMessage(
          statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
          response.message,
          statusCode == 300 ? "success" : "error",
          () => {
            if (statusCode == 300) {
              window.location.reload();
            }
          }
        );
      },
      JSON.stringify({
        name: name,
        school_specialization_id: school_specialization_id,
      })
    );
  }
//   $.ajax({
//     url: "/BadiliCheo",
//     type: "POST",
//     data: JSON.stringify({ name: name, level: location, cheoId: cheoId }),
//     contentType: "application/json",
//     success: function (response) {
//       alert("response");
//       $("#showModal").modal("hide");
//       //nata();
//       window.location.href = "/Vyeo";
//       // if(typeof(response) === "string"){response = JSON.parse(response)}
//     },
//   });
}

