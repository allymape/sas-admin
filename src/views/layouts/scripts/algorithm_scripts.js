$("#generate-btn").on("click", function () {
//   modal("showModal-create", true);
     confirmAction( () => {
        generateLastNumbers()
     } ,"Endelea", 'warning' , `Hautaweza kurudisha nyuma kitendo hiki` , 'Una uhakika?')
});
//update zones
function updateAlgorithm() {
  var id = document.getElementById("id-field").value;
  var last_number = document.getElementById("lastnumber-field").value;
  if (last_number.length <= 0) {
    $("#lastnumber-error").show();
  }
  if (last_number.length > 0) {
    ajaxRequest(`/BadiliAlgorithm/${id}` , 'POST' , (response) => {
        const statusCode = response.statusCode;
        alertMessage(statusCode == 300 ? 'Umefanikiwa' : 'Haujafanikiwa' , response.message , statusCode == 300 ? 'success' : 'error' , () => {
            if(statusCode == 300){
                listAlgorithms()
            }
        } )
    } , JSON.stringify({
        last_number: last_number
      }));
  }
}


//Tengeneza algorithm mpya
function generateLastNumbers() {
   ajaxRequest(
     `/TengenezaAlgorithm/`,
     "POST",
     (response) => {
       const statusCode = response.statusCode;
        if (statusCode == 300) {
            showLoadingSpinner()
            setTimeout( () => {
                hideLoadingSpinner();
                listAlgorithms();
            }, 5000)
        }
     },
     JSON.stringify({}),
     false
   );
}

function listAlgorithms() {
    
  ajaxRequest("/All-algorithms" , 'GET' , (response) => {
       if(response.statusCode == 300){
            const fields = {
              id: {
                hidden : true
              },
              category : {},
              code: {},
              last_number: {},
            };
         response.data = response.data.map((item) => ({
                id : item.id,
                category : item.category,
                code: item.code,
                last_number : item.last_number,
         }));
            dataTable(
              "All-algorithms",
              "algorithmTable",
              fields,
              response,
              {
                editBtn: {
                  show: true,
                  callback: "badiliAlgorith(this); return false",
                },
                deleteBtn: {
                  show: false,
                //   callback: "futaAlgorthim(this); return false;",
                },
              },
              true,
              "Idadi ya algorithm iliyopatikana"
            );
       }
  });
}
window.onload = listAlgorithms;

function badiliAlgorith(e) {
  var id = e.getAttribute("data-id");
  var last_number = e.getAttribute("data-last_number");

  document.getElementById("id-field").value = id;
  document.getElementById("lastnumber-field").value = last_number;
   modal('showEditModal' , true)
}

// function futaAlgorthim(e) {
//   var zoneid = e.getAttribute("data-id");
//   var statusid = e.getAttribute('data-status_id');
//      if(statusid == 1){
//          confirmAction(
//            () => {
//              ajaxRequest(
//                `/FutaAlgorithm/${zoneid}`,
//                "POST",
//                (response) => {
//                  const statusCode = response.statusCode;
//                  alertMessage(
//                    statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
//                    response.message,
//                    statusCode == 300 ? "success" : "error",
//                    () => {
//                      if (statusCode == 300) {
//                        listAlgorithms();
//                      }
//                    }
//                  );
//                },
//                {}
//              );
//            },
//            "Ndio",
//            "warning",
//            "Je, Unataka kweli kufuta algorithm hii?",
//            "Una uhakika?"
//          );
//      }else{
//         alertMessage('Haiwezekani' , 'Hauwezi kufuta Kanda hii, ilishafutwa tayari.' , 'error')
//      }
// }


