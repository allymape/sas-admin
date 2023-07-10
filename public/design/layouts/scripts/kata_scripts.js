$("#create-btn").on("click", function () {
  confirmAction(
    PullWards,
    "Pakia Taarifa",
    "warning",
    "Hautaweza kurudisha nyuma kitendo hiki.",
    "Una uhakika?"
  );
});

function PullWards(){
    ajaxRequest('/VutaKata',"POST" , (response) => {
      if (response.statusCode == 300) {
        alertMessage("Success", response.message, "success", () => {
          renderDataTableWards();
        });
      }
      if (response.statusCode == 306) {
        alertMessage("Error", response.message, "error", () => {
          // Close dialog and do nothing
        });
      }
    })
}

//list of zones
function renderDataTableWards(){
  ajaxRequest("/WardList" , "GET" , (response) => {
                // render table
                var fields = {
                      WardName: {},
                      WardCode: {},
                      LgaName: {},
                      RegionName: {},
                      CreatedAt: {},
                      UpdatedAt: {},
                };
                response.data = response.wards;
                dataTable('Kata' ,'wardTable' , fields , response , null , true , 'Idadi ya Kata zilizopatikana ' );
  })
}
// , 5000);
window.onload = renderDataTableWards;