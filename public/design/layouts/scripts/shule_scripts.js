

function setDatePicker(inputId, defaultDateValue = null) {
  flatpickr(`#${inputId}`, {
         defaultDate: defaultDateValue,
         dateFormat : 'Y-m-d',
  });
}
//list of zones
function renderDataTable(){
  setUrlSearchParams();
  ajaxRequest("/SchoolList", "GET", (response) => {
    // render table
    var fields = {
      id: { hidden: true },
      name: {},
      reg_no: {},
      ownership: {},
      category: {},
      reg_date: {},
      opening_date: {},
      region: {},
      lga: {},
      ward: {},
      street: {},
      updated_at: {},
      status: {},
    };
    response.data = response.schools.filter( (item) => {
      if (response.canEdit)
        return (item.name = `<a href="/ShuleDetails/${item.id}/Edit">${item.name}</a>`);
      else
        return item.name
    })
    response.data = response.schools.filter( (item) => {
        return item.status = `<span class='badge bg-${item.reg_status == 1 ? "success" : (reg_status == 2 ? "danger" : "warning")}'>${item.status}</span>`;        
    })
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
// window.onload = renderDataTable;
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
              $('#datatable').DataTable().ajax.reload();
            }
          }
        );
    } , {}); 
}


$('#lga-field , #ownership-field').on("change" , function(){
      writeOwnerField()
})

function writeOwnerField(){
  const ownership_id = $("#ownership-field").val();
  const lga = $("#lga-field option:selected").text();
        ownership_id == 3 ? $("#owner-name-field").val(`DED ${lga}`) : $("#owner-name-field").val("")
}
const defaultLatitude = $("#latitude-field").data("latitude");
const defaultLongitude = $("#longitude-field").data("longitude");
$("#add-school").on('click' , function(){
     modal("schoolModal", true);
     $("#school-form").find("button[type='submit']").text('Create');
     $("#school-form").attr("action" , "AddShule");
      $("#description").closest(".row").addClass("d-none");
     resetFields();
     $("#latitude-field").val(defaultLatitude);
     $("#longitude-field").val(defaultLongitude);
     showOwnerAndAddressFields()
     getRegions(null);
});

function hideOwnerAndAddressFields(){
     $(".owner-name-field").addClass("d-none");
     $(".address-field").addClass("d-none");
}
function showOwnerAndAddressFields(){
   $(".owner-name-field").removeClass("d-none");
   $(".address-field").removeClass("d-none");
}
function resetFields(){
  $("#school-form").find("input").val("");
  $("#school-form").find("select").val("");
  $("#search-school").val("").change();
  $("#id-field").value = "";
  setDatePicker("registration-date-field", '');
  document.getElementById('tracking-number').innerText = ""
}
function edit(e){
  const id = e.getAttribute("data-id") ? e.getAttribute("data-id") : document.getElementById('search-school').value;
  if(id){
      $("#school-form").attr("action", `/UpdateShule/${id}`);
      hideOwnerAndAddressFields()
      ajaxRequest(`EditShule/${id}` , 'GET' , (response) => {
        const { data , statusCode } = response;
          if(statusCode == 300 && data){
             const school_name = data.name;
             const selectedRegion = data.region;
             const selectedLga = data.lga;
             const selectedWard = data.ward;
             const selectedStreet = data.street;
             const registration_date = data.registration_date == "0000-00-00" ? null : data.registration_date;
             const category = data.category;
             const latitude = data.latitude;
             const longitude = data.longitude;
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
             document.getElementById('tracking-number').innerText = " - "+ tracking_number
             document.getElementById("registration-date-field").value = "";
             document.getElementById("latitude-field").value = latitude ? latitude : defaultLatitude;
             document.getElementById("longitude-field").value = longitude ? longitude : defaultLongitude;
             $("#description").val(data.description);
             data.is_verified
               ? $("#description").closest(".row").addClass("d-none")
               : $("#description").closest(".row").removeClass("d-none");
             setDatePicker("registration-date-field", registration_date);
             getRegions(selectedRegion);
            if(selectedRegion){
              getAllDistricts(selectedRegion , selectedLga);
              if(selectedLga){
                getAllWards(selectedLga , selectedWard);
                if(selectedWard){
                   getAllStreets(selectedWard, selectedStreet);
                }
              }
            }
            $("#school-form").find("button[type='submit']").text("Update");
            if (!$("#schoolModal").is(':visible')){
               modal("schoolModal", true);
            } 
          }else{
            alertMessage('404' , 'Not Found' , 'error')
          }
      } )
  }
}
function getRegions(selectedRegion){
  ajaxRequest(
            "/LookupRegion",
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
            { is_paginated: false}, 
          );
}
$("#school-form").on('submit' , function(e){
  e.preventDefault();
  const formData = parseQueryString($(this).serialize());
  const category = $("#category-field").val();
  const registration_number = $("#registration-number-field").val();
  // Define the regex patterns for each category
  const patterns = {
    1: /^EA\..*$/, // Category 1: Starts with "EA."
    2: /^EM\..*$/, // Category 2: Starts with "EM."
    3: /^S\..*$/, // Category 3: Starts with "S."
    4: /^CU\..*$/, // Category 4: Starts with "CU."
  };

  // Check if the registration number matches the pattern for the selected category
  const regex = patterns[category];
  if (regex && regex.test(registration_number)) {
   for (var i in formData) {
     if (
       formData[i] == "" &&
       i != "address" &&
       $("#owner-name-field").is(":visible")
     ) {
       var input = $(`input[name='${i}'],select[name='${i}']`);
       var label = $("label[for='" + input.attr("id") + "']").text();
       input.focus();
       alertMessage(
         "Invalid",
         `Tafadhali unatakiwa kujaza sehemu ya ${label}`,
         "warning"
       );
       return;
     }
   }

   confirmAction(
     () => {
       const url = $(this).attr("action");
       if (url) {
         ajaxRequest(
           `${url}`,
           "POST",
           (response) => {
             const { statusCode, message, action } = response;
             alertMessage(
               statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
               message,
               statusCode == 300 ? "success" : "error",
               () => {
                 if (statusCode == 300) {
                   $("#datatable").DataTable().ajax.reload();
                   if (action == "create") {
                     resetFields();
                   }
                 }
               }
             );
           },
           JSON.stringify(formData)
         );
       }
     },
     "Ndio!",
     "warning",
     `Je, unataka kuhifadhi taarifa hizi?`,
     "Una uhakika?"
   );
  } else {
    alertMessage(
      "Invalid",
      `Invalid registration number for the selected category.`,
      "warning"
    );
    return;
  }
  
});

ajaxSelect2("search-school", "LookForSchools", "Tafuta Shule", "schoolModal");

function showMap(button) {
  const rowData = JSON.parse(button.getAttribute("data-row"));
  const registration_number = rowData.reg_no;
  const region = rowData.region;
  const district = rowData.lga;
  const ward = rowData.ward;
  const street = rowData.street;
  const name = rowData.name;
  $("#school-info").text(
    `${name} - ${registration_number} [Mkoa: ${region} > Halmashauri: ${district} > Kata: ${ward} > Mtaa: ${street}] `
  );
  // Ensure the modal is opened before initializing the map and loading markers
  modal("mapModal", true); // This function should display the modal
  // After the modal is shown, initialize the map and load markers
  setTimeout(function () {
    map.invalidateSize(); // Adjust the map size once modal is fully visible
    zoomToLocationAndReset(6);
    mapMoveEnd(registration_number);
    // showMyLocation();
    // debounce( () => {
    //   loadMarkers(registration_number);
    // } , 300); // Load markers after the map is initialized
  }, 300); // Delay to ensure the modal is fully opened before invalidating the map size
}

function softDeleteSchool(e){
  const tracking_number = e.getAttribute("data-id")
  confirmAction(
    () => {
      const url = `/DeleteSchool/${tracking_number}`;
      if (url) {
        ajaxRequest(
          `${url}`,
          "POST",
          (response) => {
            const { statusCode, message, action } = response;
            alertMessage(
              statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
              message,
              statusCode == 300 ? "success" : "error",
              () => {
                if (statusCode == 300) {
                  $("#datatable").DataTable().ajax.reload();
                }
              }
            );
          },
          {}
        );
      }
    },
    "Ndio!",
    "warning",
    `Je, unataka kufuta shule hii?, Hata hivyo, Shule hii itaendelea kuhifadhiwa kwenye kanzidata`,
    "Una uhakika?"
  );
}
function deregisterSchool(e){
  const tracking_number = e.getAttribute("data-id");
   confirmAction(
     () => {
       const url = `/DeregisterSchool/${tracking_number}`;
       if (url) {
         ajaxRequest(
           `${url}`,
           "POST",
           (response) => {
             const { statusCode, message, action } = response;
             alertMessage(
               statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
               message,
               statusCode == 300 ? "success" : "error",
               () => {
                 if (statusCode == 300) {
                   $("#datatable").DataTable().ajax.reload();
                 }
               }
             );
           },
           {}
         );
       }
     },
     "Ndio!",
     "warning",
     `Je, unataka kuifutia usajili shule hii?, Hata hivyo, Shule hii itaendelea kuhifadhiwa kwenye kanzidata`,
     "Una uhakika?"
   );
}
