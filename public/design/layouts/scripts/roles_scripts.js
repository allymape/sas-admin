function BadiliData(e) {
var nameId = e.getAttribute("data-id");
var url = "/EditRole/" + nameId;
window.location.href = url;
}


function  createRole() {
  var role_name = document.getElementById("roleName").value;
  var checkboxes = document.querySelectorAll('input[name="formCheck1"]');
  var values = [];

  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked == true) {
      values.push(checkboxes[i].value);
    }
  }

  if (role_name.length <= 0) {
    alert("Jina la Role haliwezi kuwa null");
  } else {
     ajaxRequest(
       "/tengenezaRoles",
       "POST",
       (response) => {
         alertMessage(
           response.statusCode == 300 ? "Success" : "Fail",
           response.message,
           response.statusCode == 300 ? "success" : "error"
         );
       },
       JSON.stringify({ role_name: role_name, permissions: values })
     );
    // $.ajax({
    //   url: "/tengenezaRoles",
    //   type: "POST",
    //   data: JSON.stringify({ role_name: role_name, permissions: values }),
    //   contentType: "application/json",
    //   success: function (response) {
    //     if (response.statusCode == 300) {
    //       $("#sajilbtn").show();
    //       $("#pakiabtn").hide();
    //       $("#alertsuccess").show();
    //       window.location.href = "/CreateRole";
    //     }
    //     if (response.statusCode == 306) {
    //       $("#sajilbtn").show();
    //       $("#pakiabtn").hide();
    //       $("#alertexist").show();
    //     }
    //     if (response.statusCode == 400 || response.statusCode == 500) {
    //       $("#sajilbtn").show();
    //       $("#pakiabtn").hide();
    //       $("#alertmtandao").show();
    //     }
    //   },
    // });
  }
}

function updateRole() {
        var checkboxes = document.getElementsByName("formCheck1");
        var role_id = document.getElementById("roleID").value;
        var role_name = document.getElementById("roleName").value;
        var checkboxes = document.querySelectorAll('input[name="formCheck1"]');
        var values = [];
      
        // looping through all checkboxes
        // if checked property is true then push
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked == true) {
                values.push(checkboxes[i].value);
            }
        }

        if (role_name.length <= 0) {
        alert("Jina la Role haliwezi kuwa null");
        } else {
            ajaxRequest(
              "/sasishaRole/" + role_id,
              "POST",
              (response) => {
                alertMessage(
                  response.statusCode == 300 ? "Success" : "Fail",
                  response.message,
                  response.statusCode == 300 ? "success" : "error"
                );
              },
              JSON.stringify({
                role_id: role_id,
                role_name: role_name,
                permissions: values,
              })
            );
        // $.ajax({
        //   url: "/sasishaRole/" + role_id,
        //   type: "POST",
        //   data: JSON.stringify({
        //     role_id: role_id,
        //     role_name: role_name,
        //     permissions: values,
        //   }),
        //   contentType: "application/json",
        //   success: function (response) {
            
        //   },
        // });
        }
}

var hiddenPermissions = $(".hidden-permission");
$(".read-more").on('click' , function(){
  var td = $(this).closest("td");
  var hidden = td.find(".hidden-permission");
  $(".tooltip").remove();
  // $('.tooltip').addClass('bg-success')
  if (hidden.is(":visible")) {
    hidden.hide();
    // $(this).find("i").removeClass("ri-indeterminate-circle-line");
    $(this).html(
      `<i class="ri ri-add-circle-line ri-lg text-primary" title="Ona zaidi ..." data-bs-toggle="tooltip"></i>
      (${hidden.length}) More`
    );
  } else {
    hidden.show();
    // $(this).find("i").removeClass("ri-add-circle-line");
    //  $(this).find("i").addClass("ri-indeterminate-circle-line");
    //  $(this).removeAttribute("title");
    //  $(this).attr("title", "Ona kiasi ...");
    $(this).html(
      `<i class="ri ri-indeterminate-circle-line ri-lg text-primary" title="Ona kiasi ..." data-bs-toggle="tooltip"></i>`
    );
  }
   $(this).tooltip({
     selector: 'i'
   });
});
hiddenPermissions.hide();

// function tengenezaRole(){
//     var checkboxes = document.getElementsByName('formCheck1');
//     var role_name = document.getElementById('roleName').value;
//     var result = [];
//         for (var i = 0; i < checkboxes.length; i++) {
//             if (checkboxes[i].checked) {
//                 result += checkboxes[i].value+",";
            
//             }
//         }
//         if(role_name.length <= 0){
//             alert("Jina la Role haliwezi kuwa null")
//         }else{
//         $("#sajilbtn").hide();
//         $("#pakiabtn").show();
//         $.ajax({
//                 url: "/tengenezaRoles",
//                 type: 'POST',
//                 data: JSON.stringify({"role_name": role_name, "permissions": result}),
//                 contentType: 'application/json',
//                 success: function(response) {
//                     if(response.statusCode == 300){
//                         $("#sajilbtn").show();
//                         $("#pakiabtn").hide();
//                         $("#alertsuccess").show();
//                         window.location.href = "/CreateRole"
//                     }if(response.statusCode == 306){
//                         $("#sajilbtn").show();
//                         $("#pakiabtn").hide();
//                         $("#alertexist").show();
//                     }if(response.statusCode == 400 || response.statusCode == 500){
//                         $("#sajilbtn").show();
//                         $("#pakiabtn").hide();
//                         $("#alertmtandao").show();
//                     }
//                 }
//             });
//         }
//     }



