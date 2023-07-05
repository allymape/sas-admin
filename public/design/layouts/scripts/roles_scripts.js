function BadiliData(e) {
var nameId = e.getAttribute("data-id");
var url = "/EditRole/" + nameId;
window.location.href = url;
}
function sajiliRole() {
  window.location.href = "/CreateRole";
}

$("#sync-all").on("click" , function(){
    confirmAction( () => {
       ajaxRequest("/sync_roles_and_permissions" , "POST" , (response) => {
             alertMessage(
               response.statusCode == 300 ? "Success" : "Fail",
               response.message,
               response.statusCode == 300 ? "success" : "error",
               () => {
                    if(response.statusCode == 300){
                        window.location.href = "/Roles";
                    }
               }
             );
       } , {});
    } , 'Ndio' , 'warning' , 'Hautaweza kurudisha nyuma kitendo hiki.' ,'Una uhakika unataka kuvuta default roles and permissions?' );
});

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
        }
}

var hiddenPermissions = $(".hidden-permission");
$(".read-more").on('click' , function(){
  var td = $(this).closest("td");
  var hidden = td.find(".hidden-permission");
  $(".tooltip").remove();
  if (hidden.is(":visible")) {
    hidden.hide();
    $(this).html(
      `<i class="ri ri-add-circle-line ri-lg text-primary" title="Ona zaidi ..." data-bs-toggle="tooltip"></i>
      (${hidden.length}) More`
    );
  } else {
    hidden.show();
    $(this).html(
      `<i class="ri ri-indeterminate-circle-line ri-lg text-primary" title="Ona kiasi ..." data-bs-toggle="tooltip"></i>`
    );
  }
   $(this).tooltip({
     selector: 'i'
   });
});
hiddenPermissions.hide();

