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


// attachments

function showViambata() {
  var gamechanger = document.getElementById("gamechanger");
  gamechanger.value = 1;
  var table = document.getElementById("emptbl");
  // $(".viambataDiv").removeClass('d-none');
  const kiambata = $(".viambataDiv");
  if(kiambata.is(":visible")){
    kiambata.addClass('d-none')
  }else{
    kiambata.removeClass("d-none");
  }
}

function Pandisha() {
  var gamechanger = document.getElementById("gamechanger").value;
  var trackerId = document.getElementById("trackerId").value;
  var faili = document.getElementById("faili").value;
  var selectedFile = document.getElementById("failiAttached").files;
  if (selectedFile.length > 0) {
    // Select the very first file from list
    var fileToLoad = selectedFile[0];
    // FileReader function for read the file.
    var fileReader = new FileReader();
    var base64;
    // Onload of file read the file content
    fileReader.onload = function (fileLoadedEvent) {
      base64 = fileLoadedEvent.target.result;
      // Print data in console
      // alert(base64);
      var taachedFile = base64.split(",");

      var keyString = trackerId + "-" + faili + "-" + new Date();
      let hash = 0;
      for (charIndex = 0; charIndex < keyString.length; ++charIndex) {
        hash += keyString.charCodeAt(charIndex);
        hash += hash << 10;
        hash ^= hash >> 6;
      }
      hash += hash << 3;
      hash ^= hash >> 11;
      var key = (((hash + (hash << 15)) & 4294967295) >>> 0).toString(16);
      // $.ajax({
      //   url: "/TumaAttachment",
      //   type: "POST",
      //   data: JSON.stringify({
      //     keyString: key,
      //     trackerId: trackerId,
      //     attachment: faili,
      //     kiambatisho: taachedFile[1],
      //   }),
      //   contentType: "application/json",
      //   success: function (response) {
      //     // if(typeof(response) === "string"){response = JSON.parse(response)}
      //     alert(response);
      //     //window.location.href = "/MaombiKuanzishaShule";
      //   },
      // });
      ajaxRequest("/TumaAttachment" , "POST" , (response) => {
           alert(response);
      },
      JSON.stringify({
          keyString: key,
          trackerId: trackerId,
          attachment: faili,
          kiambatisho: taachedFile[1],
        })
      )
    };
    // Convert data to base64
    fileReader.readAsDataURL(fileToLoad);
  }
}

function badili(school_name) {
  var trackingId = document.getElementById("trackingId").value;
  var inviteMembersModalLabel = document.getElementById(
    "inviteMembersModalLabel"
  );
  inviteMembersModalLabel.value = "JINA PENDEKEZWA: " + school_name;
  var newName = document.getElementById("newName");
  newName.value = school_name;
  $("#inviteMembersModal").modal("show");
}

function changeName() {
  var trackingId = document.getElementById("trackingId").value;
  var newName = document.getElementById("newName").value;
  ajaxRequest("/changeshule","POST" , (response) => {
    const {success , message} = response
     $("#inviteMembersModal").modal("hide");
      alertMessage(success ? 'Umefanikiwa' : 'Haujafanikiwa',message, success ? 'success' : 'error', ()=> {
        window.location.href = "/TaarifaOmbi/" + trackingId;
      } , {})
  } , JSON.stringify({ trackingId: trackingId, newName: newName }))
}