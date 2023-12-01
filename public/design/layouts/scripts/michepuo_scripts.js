$("#create-btn").on("click", function () {
    modal("showModal", true);
});

function BadiliData(e) {
  var id = e.getAttribute("data-id");
  var name = e.getAttribute("data-name");
  document.getElementById("id-field").value = id;
  document.getElementById("name2-field").value = name;
  modal("showEditModal" , true);
}


function sajiliMchepuo() {
  var name = document.getElementById("name-field").value;

  if (name.length <= 0) {
    $("#jazasimu").show();
  }
  
  if (name.length > 0) {
    ajaxRequest(
      `/TengenezaBias`,
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
function sasishaMchepuo() {
  var name = document.getElementById("name2-field").value;
  var id = document.getElementById("id-field").value;
  if(name.length > 0){
    ajaxRequest(
      `/BadiliBias/${id}`,
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

