

$("#create-btn").on("click", function () {
  confirmAction(
    PullStreets,
    "Pakia Taarifa",
    "warning",
    "Hautaweza kurudisha nyuma kitendo hiki.",
    "Una uhakika?"
  );
});
function PullStreets(){
    ajaxRequest('/VutaMitaa' , 'POST' , (response) => {
      if (response.statusCode == 300) {
        alertMessage("Success", response.message, "success", () => {
          renderDataTableStreets();
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
function renderDataTableStreets(){

  ajaxRequest("/MitaaList" , "GET" , (response) => {
                // render table
                var fields = {
                      StreetName: {},
                      StreetCode: {},
                      WardName: {},
                      LgaName: {},
                      RegionName: {},
                      CreatedAt: {},
                      UpdatedAt: {},
                };
                response.data = response.streets;
                dataTable('Mitaa' ,'streetTable' , fields , response , null , true , 'Idadi ya Mitaa iliyopatikana ' );
  })
}
// , 5000);
window.onload = renderDataTableStreets;