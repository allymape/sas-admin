$("#create-btn").on('click' , function(){
    modal('showModal-create' , true);
});
//update ranks
function updateNgazi() {
  var rankid = document.getElementById("field-id").value;
  var rankname = document.getElementById("rank1-field").value;
  var status = document.getElementById("status-field");
  if (rankname.length <= 0) {
    $("#editngazi").show();
  }
  if (rankname.length > 0) {
    ajaxRequest(`/BadiliRank/${rankid}` , 'POST' , (response) => {
        const statusCode = response.statusCode;
        alertMessage(statusCode == 300 ? 'Umefanikiwa' : 'Haujafanikiwa' , response.message , statusCode == 300 ? 'success' : 'error' , () => {
            if(statusCode == 300){
                listRanks()
            }
        } )
    } , JSON.stringify({
        rankname: rankname,
        statusid: status.checked ? 1 : 0
      }));
  }
}


//Tengeneza zoni mpya
function saveNgazi() {
  var rankname = document.getElementById("rank-field").value;
  if (rankname.length <= 0) {
    $("#jazangazi").show();
  }
  if (rankname.length > 0) {
   ajaxRequest(
     `/TengenezaRank/`,
     "POST",
     (response) => {
       const statusCode = response.statusCode;
       alertMessage(
         statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
         response.message,
         statusCode == 300 ? "success" : "error",
         () => {
           if (statusCode == 300) {
             listRanks();
           }
         }
       );
     },
     JSON.stringify({
       rankname: rankname
     })
   );
  }
}

function listRanks() {
  ajaxRequest("/Ranks", "GET", (response) => {
    if (response.statusCode == 300) {
      const fields = {
        id: {},
        name: {},
        status_id: { hidden : true},
        status: {},
      };
      response.data = response.data.map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status_id
          ? `<span class="badge bg-success">active</span>`
          : `<span class="badge bg-danger">In Active</span>`,
        status_id: item.status_id,
      }));
      dataTable(
        "Ngazi",
        "ngaziTable",
        fields,
        response,
        {
          editBtn: {
            show: true,
            callback: "badiliNgazi(this); return false",
          },
          deleteBtn: {
            show: false,
            callback: "futaNgazi(this); return false;",
          },
        },
        true,
        "Idadi ya Ngazi Zilizopatikana"
      );
    }
  });
}
window.onload = listRanks;

function badiliNgazi(e) {
  var id = e.getAttribute("data-id");
  var name = e.getAttribute("data-name");
  var status = e.getAttribute("data-status_id");
  document.getElementById("field-id").value = id;
  document.getElementById("rank1-field").value = name;
  document.getElementById("status-field").checked = status == 1 ? true : false;
   modal('showEditModal' , true)
}

function futaNgazi(e) {
  var rankid = e.getAttribute("data-id");
  var statusid = e.getAttribute('data-status_id');
     if(statusid == 1){
         confirmAction(
           () => {
             ajaxRequest(
               `/FutaRank/${rankid}`,
               "POST",
               (response) => {
                 const statusCode = response.statusCode;
                 alertMessage(
                   statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
                   response.message,
                   statusCode == 300 ? "success" : "error",
                   () => {
                     if (statusCode == 300) {
                       listRanks();
                     }
                   }
                 );
               },
               {}
             );
           },
           "Ndio",
           "warning",
           "Je, Unataka kweli kufuta ngazi hii?",
           "Una uhakika?"
         );
     }else{
        alertMessage('Haiwezekani' , 'Hauwezi kufuta Ngazi hii, ilishafutwa tayari.' , 'error')
     }
}


