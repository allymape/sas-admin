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


//Tengeneza zoni mpya
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






