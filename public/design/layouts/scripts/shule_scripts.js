

function setDatePicker(inputId, defaultDateValue = null) {
  flatpickr(`#${inputId}`, {
         defaultDate: defaultDateValue,
         dateFormat : 'Y-m-d',
  });
}
//list of zones
function renderDataTableWards(){
  setUrlSearchParams();
  ajaxRequest("/SchoolList", "GET", (response) => {
    // render table
    var fields = {
      id : {hidden : true},
      name: {},
      reg_no: {},
      ownership: {},
      category: {},
      reg_date: {},
      region: {},
      lga: {},
      ward: {},
      street: {},
      created_at: {},
      updated_at: {},
      status: {},
    };
    response.data = response.schools;
    dataTable(
      "Shule",
      "schoolsTable",
      fields,
      response,
      {
        editBtn: { show: true, callback: `edit(this); return false` },
      },
      true,
      "Idadi ya Shule zilizopatikana "
    );
  });
}
// , 5000);
window.onload = renderDataTableWards;
$("#btn-migrate-schools").on("click", function () {
  confirmAction(
    PullSchools,
    "Pakia Shule ambazo silishasajiliwa",
    "warning",
    "Hautaweza kurudisha nyuma kitendo hiki.",
    "Una uhakika?"
  );
});
function PullSchools() {
    ajaxRequest("/VutaShule" , "POST" , (response) => {
        const statusCode = response.statusCode;
        alertMessage(
          statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
          response.message,
          statusCode == 300 ? "success" : "error",
          () => {
            if (statusCode == 300) {
              renderDataTableWards();
            }
          }
        );
    } , {}); 
}

function edit(e){
  const id = e.getAttribute("data-id") ? e.getAttribute("data-id") : document.getElementById('search-school').value;
        
  if(id){
      ajaxRequest(`/EditShule/${id}` , 'GET' , (response) => {
        const { data , statusCode } = response;
          if(statusCode == 300 && data){
             const school_name = data.name;
             const selectedRegion = data.region;
             const selectedLga = data.lga;
             const selectedWard = data.ward;
             const selectedStreet = data.street;
             const opening_date = data.opening_date;
             const category = data.category;
             const ownership = data.ownership;
             const registration_number = data.registration_number;
            //  const payment = data.payment;
             const tracking_number = data.tracking_number;
             document.getElementById("id-field").value = tracking_number;
             document.getElementById('name-field').value = school_name
             document.getElementById('registration-number-field').value = registration_number
            //  document.getElementById('payment-field').checked = (payment == 2 ? true : false) 
             document.getElementById('category-field').value = category
             document.getElementById('ownership-field').value = ownership
             document.getElementById('tracking-number').innerText = tracking_number
             setDatePicker("opening-date-field", opening_date);
             ajaxRequest(
                  "/MikoaList",
                  "GET",
                  (regionsResponse) => {
                    if (regionsResponse.statusCode == 300) {
                      var regions = regionsResponse.regions;
                      appendSelectionOption(
                        "mkoa-field",
                        regions.map((region, index) => ({
                          name: region.regionName,
                          id: region.regionCode,
                        })),
                        [selectedRegion],
                        "Chagua Mkoa"
                      );
                    }
                  },
                  { is_paginated: false}
                );
            if(selectedRegion){
              getAllDistricts(selectedRegion , selectedLga);
              if(selectedLga){
                getAllWards(selectedLga , selectedWard);
                if(selectedWard){
                   getAllStreets(selectedWard , selectedStreet);
                }
              }
            }
            if (!$("#schoolModal").is(':visible')){
               modal("schoolModal", true);
            } 
          }else{
            alertMessage('404' , 'Not Found' , 'error')
          }
      } )
  }
}

$("#school-form").on('submit' , function(e){
    e.preventDefault();
    confirmAction(() => {
             const formData = parseQueryString($(this).serialize());
             const id = document.getElementById('id-field').value;
              if(id){
                ajaxRequest(
                  `/UpdateShule/${id}`,
                  "POST",
                  (response) => {
                    const { statusCode, message } = response;
                    alertMessage(
                      statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
                      message,
                      statusCode == 300 ? "success" : "error",
                      () => {
                        if(statusCode == 300){
                          renderDataTableWards(); 
                        }
                      }
                    );
                  },
                  JSON.stringify(formData)
                );
              }
    } , 'Ndio!' , 'warning' , `Unataka kufanya mabadiliko ya shule hii za shule hii ${document.getElementById('tracking-number').innerText}?` , 'Una uhakika?') 
    
});

ajaxSelect2("search-school", "LookForSchools", "Tafuta Shule", "schoolModal");

$('#mkoa-field').on('change' , function(){
  const regionCode = $(this).val();
        $("#lga-field").html("<option>Chagua Halmashauri</option>").prop('disabled' , true);
        $("#kata-field").html("<option>Chagua Kata</option>").prop("disabled", true);
        $("#mtaa-field").html("<option>Chagua Mtaa</option>").prop("disabled", true);
        getAllDistricts(regionCode)
})

$("#lga-field").on("change", function () {
  const lgaCode = $(this).val();
  $("#kata-field").html("<option>Chagua Kata</option>").prop("disabled", true);
   $("#mtaa-field").html("<option>Chagua Mtaa</option>").prop("disabled", true);
  getAllWards(lgaCode);
});

$("#kata-field").on("change", function () {
  const wardCode = $(this).val();
  $("#mtaa-field").html("<option>Chagua Mtaa</option>").prop("disabled", true);
  getAllStreets(wardCode);
});