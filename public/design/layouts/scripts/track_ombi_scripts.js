
function makePayment(e){
      const tracking_number = e.getAttribute("data-tracking_number");
    confirmAction(() => {
        ajaxRequest(`/ChangePayment/${tracking_number}`, "POST", (response) => {
             const {statusCode , message} = response
              alertMessage(statusCode == 300 ? 'Umefanikiwa' : 'Haujafanikiwa' , message , statusCode == 300 ? 'success' : 'warning' , () => {
                  if(statusCode == 300){
                    window.location.reload();
                  }
              })
        });
    } , 'Ndio! Endelea' , 'warning' , `Je, unataka kubadili hali ya malipo ya ombi hili lenye namba ya Ombi ${tracking_number}?` , 'Thibitisha')
}

$(".btn-reassign").on("click" , function(){
     modal("reassign-modal" , true);
});