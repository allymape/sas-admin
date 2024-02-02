$("#staffs").on('change' , function(){
     const id = $(this).val();
           if(['#',""].includes(id)){
             $("#btn-tuma").addClass("d-none");
             $("#btn-wasilisha").removeClass("d-none");
             $("#btn-kataa").removeClass("d-none");
             $("#btn-rudisha").removeClass("d-none");
           }else{
             $("#btn-wasilisha").addClass("d-none");
             $("#btn-kataa").addClass("d-none");
             $("#btn-rudisha").addClass("d-none");
            $("#btn-tuma").removeClass("d-none");
           }
});

function tuma(commentUrl , redirectUrl) {
  formSubmit(commentUrl, redirectUrl, "tuma", 1);
}
// wasilisha;
function wasilisha(commentUrl , redirectUrl) {
  formSubmit(commentUrl, redirectUrl, "wasilisha", 2);
}

function kataa(commentUrl, redirectUrl) {
  formSubmit(commentUrl, redirectUrl, "kataa", 3);
}

function rudisha(commentUrl , redirectUrl) {
  formSubmit(commentUrl, redirectUrl, "rudisha", 4);
}

function formSubmit(commentUrl, redirectUrl , actionName, haliombi) {
    var coments = document.getElementById("exampleFormControlTextarea1").value;
    // var staffs = "0-10";
    var staffs = document.getElementById("staffs").value;
    var trackerId = document.getElementById("trackerId").value;
    tumaMaoniYako(
      commentUrl,
      {
        coments: coments,
        staffs: staffs,
        haliombi: haliombi,
        trackerId: trackerId,
        attachment: "",
        kiambatisho: "",
        attach_length: "",
      },
      staffs,
      coments,
      actionName,
      redirectUrl
    );
}