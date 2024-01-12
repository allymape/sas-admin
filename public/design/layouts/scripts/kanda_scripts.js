$("#create-btn").on('click' , function(){
    modal('showModal-create' , true);
});
//update zones
function updateKanda() {
  var zoneid = document.getElementById("id1-field").value;
  var zonecode = document.getElementById("code1-field").value;
  var box = document.getElementById("box1-field").value;
  var zonename = document.getElementById("customername1-field").value;
  var status = document.getElementById("status-field");
  if (zonecode.length <= 0) {
    $("#editsimu").show();
  }
  if (zonename.length <= 0) {
    $("#editkanda").show();
  }
  if (zonename.length > 0 && zonecode.length > 0) {
    ajaxRequest(`/BadiliZone/${zoneid}` , 'POST' , (response) => {
        const statusCode = response.statusCode;
        alertMessage(statusCode == 300 ? 'Umefanikiwa' : 'Haujafanikiwa' , response.message , statusCode == 300 ? 'success' : 'error' , () => {
            if(statusCode == 300){
                listZones()
            }
        } )
    } , JSON.stringify({
        zonecode: zonecode,
        zonename: zonename,
        box : box,
        statusid: status.checked ? 1 : 0
      }));
  }
}


//Tengeneza zoni mpya
function saveKanda() {
  var zonecode = document.getElementById("id-field").value;
  var zonename = document.getElementById("customername-field").value;
  if (zonecode.length <= 0) {
    $("#jazasimu").show();
  }
  if (zonename.length <= 0) {
    $("#jazakanda").show();
  }
  if (zonename.length > 0 && zonecode.length > 0) {
   ajaxRequest(
     `/TengenezaZone/`,
     "POST",
     (response) => {
       const statusCode = response.statusCode;
       alertMessage(
         statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
         response.message,
         statusCode == 300 ? "success" : "error",
         () => {
           if (statusCode == 300) {
             listZones();
           }
         }
       );
     },
     JSON.stringify({
       zonecode: zonecode,
       zonename: zonename
     })
   );
  }
}

function listZones() {
  ajaxRequest("/zones" , 'GET' , (response) => {
       if(response.statusCode == 300){
            const fields = {
              id: {
                hidden: true,
              },
              address: {
                hidden: true,
              },
              status_id: {
                hidden: true,
              },
              zone_name: {},
              zone_code: {},
              box: {},
              status: {},
            };
         response.data = response.data.map((item) => ({
                id : item.id,
                zone_name: item.zone_name,
                zone_code : item.zone_code,
                box : item.box ? `S.L.P ${item.box}` : ``,
                address : item.box,
                status : item.status_id ? `<span class="badge bg-success">active</span>` : `<span class="badge bg-danger">In Active</span>`,
                status_id : item.status_id,
         }));
            dataTable(
              "Zoni",
              "kandaTable",
              fields,
              response,
              {
                editBtn: {
                  show: true,
                  callback: "badiliKanda(this); return false",
                },
                deleteBtn: {
                  show: true,
                  callback: "futaKanda(this); return false;",
                },
              },
              true,
              "Idadi ya Kanda Zilizopatikana"
            );
       }
  });
}
window.onload = listZones;

function badiliKanda(e) {
  var nameId = e.getAttribute("data-id");
  var name = e.getAttribute("data-zone_name");
  var box = e.getAttribute("data-address");
  var status = e.getAttribute("data-status_id");
  // document.getElementById("code1-field").value = code;
  document.getElementById("id1-field").value = nameId;
  document.getElementById("customername1-field").value = name;
  document.getElementById("box1-field").value = box;
  document.getElementById("status-field").checked = status == 1 ? true : false;
   modal('showEditModal' , true)
}

function futaKanda(e) {
  var zoneid = e.getAttribute("data-id");
  var statusid = e.getAttribute('data-status_id');
     if(statusid == 1){
         confirmAction(
           () => {
             ajaxRequest(
               `/FutaZone/${zoneid}`,
               "POST",
               (response) => {
                 const statusCode = response.statusCode;
                 alertMessage(
                   statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
                   response.message,
                   statusCode == 300 ? "success" : "error",
                   () => {
                     if (statusCode == 300) {
                       listZones();
                     }
                   }
                 );
               },
               {}
             );
           },
           "Ndio",
           "warning",
           "Je, Unataka kweli kufuta kanda hii?",
           "Una uhakika?"
         );
     }else{
        alertMessage('Haiwezekani' , 'Hauwezi kufuta Kanda hii, ilishafutwa tayari.' , 'error')
     }
}


