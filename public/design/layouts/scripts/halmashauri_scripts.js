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
//list of zones
function renderDataTableDistricts(){
  ajaxRequest("/HalmashauriList" , "GET" , (response) => {
                // render table
                var fields = {
                      LgaName: {},
                      LgaCode: {},
                      regionName: {},
                      createdAt: {},
                      updatedAt: {},
                };
                response.data = response.councils;
                dataTable('Halmashauri' ,'districtTable' , fields , response , null , true , 'Idadi ya Halmashauri zilizopatikana ' );
  })
}
window.onload = renderDataTableDistricts;
