$("#btn-update-details").on("click", function (e) {
        e.preventDefault();
        const phone_number = $("#phonenumberInput").val();
        const email_notify = $("#emailNotifyInput").prop("checked") ? 1 : 0;
        confirmAction(() => {
            update(`/UpdateMyProfile`, { phone_number, email_notify } , (response) => {
                const { statusCode, message } = response;
                alertMessage(
                  statusCode == 300
                    ? "Umefanikiwa"
                    : "Haujafanikiwa",
                  message,
                  statusCode == 300 ? "success" : "error",
                  () => {
                    //  if (statusCode == 300) {
                    //  }
                  }
                );
            });
        } , 'Ndio!' , 'warning' , 'Tafadhali thibitisha ili uweze kuendelea.' , 'Je, Una Uhakika?')
});

$("#btn-change-password").on("click", function (e) {
  e.preventDefault();
  const oldpassword = $("#oldpasswordInput").val();
  const newpassword = $("#newpasswordInput").val();
  const confirmpassword = $("#confirmpasswordInput").val();
  update(`/ChangeMyPassword` , {oldpassword , newpassword , confirmpassword} , (response) => {
    const { statusCode  , message} = response;
     alertMessage(
       statusCode == 300 ? 'Umefanikiwa' : ( statusCode == 422 ? 'Kuna Makosa' : 'Haujafanikiwa'),
       message,
       statusCode == 300 ? "success" : "error",
       () => {
         if (statusCode == 300) {
          $("#logout").remove();
           $(document)
             .find("body")
             .append(`<form action="/Logout" method="POST" id="logout"><input name="logout" type="hidden" /></form>`);
           $("#logout").submit()
         }
       }
     );
  })
});


//Tengeneza
function update(url , data , callback) {
 ajaxRequest(
   `${url}`,
   "POST",
   (response) => {
     callback(response)
   },
   JSON.stringify(data)
 );
}
function hideShowHandoverForm(active){
      if(active){
        $("#handover-form").addClass("d-none");
        $("#handover-stop").removeClass("d-none");
      }else{
        $("#handover-form").removeClass("d-none");
        $("#handover-stop").addClass("d-none");
      }
}
// 
$("#handover-stop button").on("click" , function(){
     confirmAction(() => {
       ajaxRequest("/StopHandover" , "POST" , (response) => {
           const { statusCode , message } = response
           const success = statusCode == 300;
           alertMessage(success ? 'Umefanikiwa' : 'Haujafanikiwa' , message , success ? 'success' : 'error' , () => {
               if(success){
                  handovers();
               }
           })
       });
     } , "Ndio" , "warning" , "Je, una uhakika?" , "Thibitisha")
});
// 
function handovers(){
  ajaxRequest("/MyHandover", "GET", (response) => {
    const {statusCode , data, activeHandover} = response
    hideShowHandoverForm(activeHandover);
    if (statusCode == 300) {
      const fields = {
        id: { hidden : true},
        name: {},
        start: {},
        end : {},
        reason : {},
        created_at : {hidden : true},
        active: {},
      };
      response.data = data.map((item) => ({
        id: item.id,
        name: item.name,
        start: item.start,
        end: item.end,
        reason: item.reason,
        active: item.active
          ? `<span class="badge bg-success">Active</span>`
          : `<span class="badge bg-danger">In Active</span>`
      }));
      dataTable(
        "Profile",
        "handover-table",
        fields,
        response,
        {
          editBtn: {
            show: false,
            callback: "badiliNgazi(this); return false",
          },
          deleteBtn: {
            show: false,
            callback: "futaNgazi(this); return false;",
          },
        },
        true,
        "",
        false
      );
    }
  });
}
function clearHandoverFields(){
   document.getElementById("handover-staff").value = "";
   document.getElementById("handover-date").value = "";
   document.getElementById("handover-reason").value = "";
}
handovers()
// handover
$("#btn-handover").on('click' , function(e){
  e.preventDefault();
  const staff =  document.getElementById('handover-staff').value;
  const dates =  document.getElementById('handover-date').value;
  const reason =  document.getElementById('handover-reason').value;
  const formData = {staff , dates , reason}
  if(staff.length > 0 && dates.length > 0 && reason.length > 0){
    ajaxRequest(
      `/Handover`,
      "POST",
      (response) => {
        const { statusCode, message } = response;
        alertMessage(
          statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
          message,
          statusCode == 300 ? "success" : "warning",
          () => {
            if (statusCode == 300) {
              clearHandoverFields();
              handovers();
            }
          }
        );
      },
      JSON.stringify(formData)
    );
  }else{
    alertMessage('Onyo' , 'Jaza sehemu zote zinazotakiwa' , 'warning')
  }
});






