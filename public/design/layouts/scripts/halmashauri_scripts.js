$("#create-btn").on("click", function () {
  confirmAction(PullCouncils,"Pakia Taarifa","warning","Hautaweza kurudisha nyuma kitendo hiki.","Una uhakika?");
});
function PullCouncils(){
     ajaxRequest("/VutaWilaya" , "POST" , (response) => {
              if (response.statusCode == 300) {
                alertMessage("Success", response.message, "success", () => {
                  renderDataTableDistricts();
                });
              }
              if (response.statusCode == 306) {
                alertMessage("Error", response.message, "error", () => {
                  // Close dialog and do nothing
                });
              }
     });
}
function editDistrict(e) {
  const id = e.getAttribute("data-id");
  const name = e.getAttribute("data-lganame");
  const lgaBox = e.getAttribute("data-lgaaddress");
  const sqaBox = e.getAttribute("data-sqaaddress");
  const ngazi = e.getAttribute("data-ngazi");
  document.getElementById("id-field").value = id;
  document.getElementById("name-field").value = name;
  document.getElementById("ngazi-field").value = ngazi;
  document.getElementById("sqa-box-field").value = sqaBox == 0 ? "" : sqaBox;
  document.getElementById("lga-box-field").value = lgaBox == 0 ? "" : lgaBox;
  $("#showEditModal").modal("show");
}
// Update
function updateLga(e){
  e.preventDefault()
  const id = $("#id-field").val()
  const sqa_address = $("#sqa-box-field").val()
  const lga_address = $("#lga-box-field").val()
  const ngazi = $("#ngazi-field").val()
  if (sqa_address || lga_address || ngazi) {
    $.ajax({
      url: `UpdateDistrict/${id}`,
      type: "POST",
      data: JSON.stringify({
        sqa_address,
        lga_address,
        ngazi,
      }),
      contentType: "application/json",
      success: function (response) {
        if (response.statusCode == 300) {
          alertMessage("Success", response.message, "success", () => {
            renderDataTableDistricts();
          });
        }
        if (response.statusCode == 306) {
          alertMessage("Error", response.message, "error", () => {
            // Close dialog and do nothing
          });
        }
      },
    });
  }
}
//list of zones
function renderDataTableDistricts(){
  ajaxRequest("/HalmashauriList" , "GET" , (response) => {
                // render table
                var fields = {
                      id : {hidden : true},
                      LgaAddress : {hidden : true,},
                      SqaAddress : {hidden : true},
                      LgaName: {},
                      ngazi: {},
                      LgaCode: {},
                      regionName: {},
                      dedAddress: {},
                      w1Address : {},
                      createdAt: {},
                      updatedAt: {},
                };
                response.data = response.councils.map((council) => ({
                  id : council.id,
                  LgaName: council.LgaName,
                  LgaCode: council.LgaCode,
                  regionName : council.regionName,
                  ngazi : council.ngazi,
                  dedAddress : council.lga_box ? `S.L.P ${council.lga_box}` : '',
                  w1Address : council.sqa_box ? `S.L.P ${council.sqa_box}` : '',
                  LgaAddress : council.lga_box,
                  SqaAddress : council.sqa_box,
                  createdAt : council.createdAt,
                  updatedAt : council.updatedAt,
                  
                }));
                dataTable(
                  "Halmashauri",
                  "districtTable",
                  fields,
                  response,
                  {
                    editBtn: {
                      show: true,
                      callback: "editDistrict(this); return false;",
                    },
                    deleteBtn: { show: false, callback: "" },
                    otherBtn: { show: false, callback: "" },
                  },
                  true,
                  "Idadi ya Halmashauri zilizopatikana "
                );
  })
}
window.onload = renderDataTableDistricts;
