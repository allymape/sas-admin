$("#create-btn").on('click' , function(){
    modal('showModal' , true);
});
function BadiliData(e) {
  var id = e.getAttribute("data-id");
  var name = e.getAttribute("data-name");
  var rankid = e.getAttribute("data-rank-level");
  var statusid = e.getAttribute("data-status");
  document.getElementById("id-field").value = id;
  document.getElementById("rank-name2-field").value = name;
  document.getElementById("ranks2-field").value = rankid
  document.getElementById("status-field").checked = (statusid == 1 ? true : false)
  modal("showEditModal", true)
}

function sajiliHati() {
  var name = document.getElementById("rank-name-field").value;
  var rank = document.getElementById("ranks-field").value;

  if (name.length > 0 && rank > 0) {
            ajaxRequest(
            `/tengenezaHierarchy`,
            "POST",
            (response) => {
                const statusCode = response.statusCode;
                alertMessage(
                statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
                response.message,
                statusCode == 300 ? "success" : "error",
                () => {
                    if (statusCode == 300) {
                    window.location.reload()
                    }
                }
                );
            },
            JSON.stringify({
                name: name,
                rank : rank
            })
            );
  }
}
function sasishaHati() {
  var id = document.getElementById("id-field").value;
  var name = document.getElementById("rank-name2-field").value;
  var rank = document.getElementById("ranks2-field").value;
  var status = document.getElementById("status-field").checked;
  if(name.length > 0 && rank.length > 0){
     ajaxRequest(
        `/badiliHierarchy/${id}`,
        "POST",
        (response) => {
            const statusCode = response.statusCode;
            alertMessage(
            statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
            response.message,
            statusCode == 300 ? "success" : "error",
            () => {
                if (statusCode == 300) {
                window.location.reload()
                }
            }
            );
        },
        JSON.stringify({
            name: name,
            rank : rank,
            status : status ? 1 : 0
        })
        );
  }
}
function futaCheo() {
  var cheoId = document.getElementById("code-field-edit").value;
  $.ajax({
    url: "/FutaCheo",
    type: "POST",
    data: JSON.stringify({ cheoId: cheoId }),
    contentType: "application/json",
    success: function (response) {
      alert("response");
      $("#showModal").modal("hide");
      //nata();
      window.location.href = "/Vyeo";
      // if(typeof(response) === "string"){response = JSON.parse(response)}
    },
  });
}
function funga() {
  window.location.href = "/Vyeo";
}


