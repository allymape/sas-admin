$(document).on("click", ".transfer-school", function () {
  const school = $(this);
  const school_name = school.data("school_name");
  const reg_number = school.data("registration_number");
  const tracking_number = school.data("tracking_number");
  const search = school.data("current_applicant_email");
  $("#school-name").val(school_name);
  $("#registration-number").val(reg_number);
  $("#tracking-number").val(tracking_number);
  modal("varyingcontentModal", true);
  ajaxSelect2(
    "applicant-name",
    "/LookForApplicants",
    "Type Name or Email",
    "varyingcontentModal",
    null,
    search
  );
});

$('#applicant-name').on('change' , function(){
    var applicant = $(this).val()
        $("#btn-update-applicant").prop("disabled", applicant ? false : true);
});

$("#btn-update-applicant").on("click" , function(){
      confirmAction(() => {
        ajaxRequest('/BadiliMwombaji' , 'POST' , (response) => {
            var statusCode = response.statusCode;
                    alertMessage(statusCode == 300 ? 'Hongera' : 'Samahani!' , 
                    response.message , statusCode == 300 ? 'success' : 'error' , () => {
                           if(statusCode == 300){
                              $('#datatable').DataTable().ajax.reload();
                           }
                    } )
        } , JSON.stringify({
            tracking_number : $('#tracking-number').val(),
            user_id  : $('#applicant-name').val()
        }))
      } , 'Ndio' , 'warning' , 'Unakaribia kubadili Mwombaji wa shule hii' , 'Una uhakika?')
});

$("a[role='tab']").on("click" , function(){
  const tab = $(this).attr("href").replace("#", "");
  updateUrl('tab' , tab)
});

$(".pagination a").on('click' , function(e){
    e.preventDefault();
    var page = $(this).data('i')
    var refr = updateUrl('page' , page);
        if(!refr) window.location.reload()
});