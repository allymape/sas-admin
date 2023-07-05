getUsers();
//   Populate list of users to a table
$("select").select2({
  dropdownParent: $("#showModal"),
//   theme: "classic",
});
function getUsers() {
  ajaxRequest("users", "GET", (response) => {
    if (response.statusCode == 300) {
      var fields = {
        name: {},
        email: {
          hidden: true,
        },
        phone_no: {},
        username: {},
        role_name: {},
        level_name: {},
        office: {
          tdClass: "",
          tdAttributes: "",
        },
        last_login: {},
        has_signature: {
          tdClass: "text-center",
        },
        user_status: {
          tdClass: "text-center",
        },
      };
      // modify data
      response.data = response.data.map((user) => ({
        id: user.userId,
        email: user.email,
        name: user.name,
        phone_no: user.phone_no,
        username: user.username,
        role_name: user.role_name,
        level_name: user.level_name,
        office: user.lga_name
          ? user.lga_name
          : `<span class='myTooltip' style='cursor:pointer' data-bs-toggle=tooltip title='Kanda ya ${user.zone_name}'>${user.zone_name}</span>`, //This is the reason for modification
        last_login: user.last_login,
        has_signature: user.has_signature
          ? `<span title="Sahihi ya muhusika imeingizwa" data-bs-toggle=tooltip class="myTooltip las la-signature la-2x"></span>`
          : "",
        user_status: `<span data-bs-toggle=tooltip title="${
          user.user_status ? "Active" : "In Active"
        }" class='myTooltip ${
          user.user_status
            ? "ri-check-double-fill text-success"
            : "ri-close-fill text-danger"
        }'></span>`,
      }));

      // render table
      dataTable(
        "Watumiaji",
        "userTable",
        fields,
        response,
        {
          editBtn: { show: true, callback: "editUser(this); return false" },
          deleteBtn: { show: true, callback: "AddZone1(this); return false;" },
          otherBtn: {
            show: true,
            callback: "ResetPassword(this); return false;",
          },
        },
        true,
        "Idadi ya Watumiaji iliyopatikana "
      );
      $("#userTable").tooltip({
        selector: ".myTooltip",
      });
    }
  });
  // end of table
}

$("#btn-create-user").on("click", function () {
  modal("showModal", true);
  resetAllFields();
});
function editUser(e) {
  var userId = e.getAttribute("data-id");
  getUser(userId);
}
function getUser(userId) {
  var url = "/findUser/" + userId;
  resetAllFields();
  ajaxRequest(
    url,
    "GET",
    (userResponse) => {
      if (userResponse.statusCode == 300) {
        var user = userResponse.data[0];
        document.getElementById("id-field").value = user.userId;
        document.getElementById("customername-field").value = user.name;
        document.getElementById("phone-field").value = user.phone_no;
        document.getElementById("username-field").value = user.email;
        document.getElementById("password-field").value = "";
        // Load roles
        ajaxRequest(
          "/allRoles",
          "GET",
          (rolesResponse) => {
            if (rolesResponse.statusCode == 300) {
              var roles = rolesResponse.data;
              appendSelectionOption(
                "role-field",
                roles.map((role, index) => ({
                  name: role.role_name,
                  id: role.id,
                })),
                [Number(user.role_id)],
                "Chagua Role"
              );

              // Load levels
              ajaxRequest(
                "/ranks",
                "GET",
                (ranksResponse) => {
                  if (ranksResponse.statusCode == 300) {
                    var ranks = ranksResponse.data;
                    appendSelectionOption(
                      "level-field",
                      ranks.map((rank, index) => ({
                        name: rank.rank_name,
                        id: rank.id,
                      })),
                      [user.vyeoId],
                      "Chagua Level"
                    );
                    var selectedLevel = $("#level-field")
                      .find("option:selected")
                      .text();
                    showHiddenFieldBasedOnSelectedLevel(selectedLevel);
                    // Load zones
                    ajaxRequest(
                      "/zones",
                      "GET",
                      (zonesResponse) => {
                        if (zonesResponse.statusCode == 300) {
                          var zones = zonesResponse.data;
                          appendSelectionOption(
                            "zone-field",
                            zones.map((zone, index) => ({
                              name: zone.zone_name,
                              id: zone.id,
                            })),
                            [user.zone_id],
                            "Chagua Kanda"
                          );
                          //show modal after all lookup data loaded
                          modal("showModal", true);
                          if (user.zone_id) {
                            $("#region-field").prop(
                              "disabled",
                              user.zone_id ? false : true
                            );
                            getAllRegions(user.zone_id, user.region_code);
                          }
                          if (user.region_code) {
                            $("#lga-field").prop(
                              "disabled",
                              user.region_code ? false : true
                            );
                            getAllDistricts(
                              user.region_code,
                              user.district_code
                            );
                          }
                        }
                      },
                      { is_paginated: false }
                    ); // end of zones ajax request
                  }
                },
                { is_paginated: false },
                false
              ); //end of levels ajax request
            }
          },
          { is_paginated: false },
          false
        ); // end of roles ajax request
      }
    },
    {},
    false
  );
}

$("#level-field").on("change", function () {
  var selectLevel = $(this).find("option:selected").text();
  showHiddenFieldBasedOnSelectedLevel(selectLevel);
});
// On change zone
$("#zone-field").on("change", function () {
  var zoneId = $(this).val();
  if ($("#region-field").is(":visible")) {
    // Load regions
    $("#region-field").prop("disabled", zoneId ? false : true);
    emptyLgaField()
    zoneId ? getAllRegions(zoneId) : emptyRegionField();
  }
});

$("#region-field").on("change", function () {
  var regionCode = $(this).val();
      regionCode ? getAllDistricts(regionCode) : emptyLgaField();
});

function showHiddenFieldBasedOnSelectedLevel(selectLevel) {
  var selectedValue = selectLevel.toLocaleLowerCase().trim();
  var zoneDiv = $("#zone-field").closest("div");
  var regionDiv = $("#region-field").closest("div");
  var lgaDiv = $("#lga-field").closest("div");
  var levelDiv = $("#level-field").closest("div");
  hideAllSelectField();
  if (selectedValue == "k1" || selectedValue.includes("k1")) {
    zoneDiv.removeClass("d-none");
  } else if (selectedValue == "w1" || selectedValue.includes("w1")) {
    zoneDiv.removeClass("d-none");
    regionDiv.removeClass("d-none");
    lgaDiv.removeClass("d-none");
  }
}

function hideAllSelectField() {
  $("#zone-field").closest("div").addClass("d-none").find("select").val("");
  $("#region-field")
    .closest("div")
    .addClass("d-none")
    .find("select")
    .val("")
    .prop("disabled", true)
    .html("<option value=''>Chagua Kanda kwanza</option>");
  $("#lga-field")
    .closest("div")
    .addClass("d-none")
    .find("select")
    .val("")
    .prop("disabled", true)
    .html("<option value=''>Chagua Mkoa kwanza</option>");
}

function emptyLgaField(){
    $("#lga-field").val("")
                   .prop("disabled", true)
                   .html("<option value=''>Chagua Mkoa kwanza</option>");
}

function emptyRegionField() {
  $("#region-field")
    .val("")
    .prop("disabled", true)
    .html("<option value=''>Chagua Kanda kwanza</option>");
}

function resetAllFields() {
  $("#showModal").find("input,select,file").val("");
}

$("#show-password-checkbox").on("change", function () {
  var checked = $(this).prop("checked");
  if (checked) $("#send-email-checkbox").prop("checked", false);
  showPasswordFields();
});
$("#send-email-checkbox").on("change", function () {
  var checked = $(this).prop("checked");
  if (checked) $("#show-password-checkbox").prop("checked", false);
  showPasswordFields();
});
//
function showPasswordFields() {
  var checked = $("#show-password-checkbox").prop("checked");
  var passwordFields = $("#password-fields");
  passwordFields.addClass("d-none");
  checked
    ? passwordFields.removeClass("d-none")
    : passwordFields.addClass("d-none");
  if (!checked) {
    document.getElementById("password-field").value = "";
    document.getElementById("repassword-field").value = "";
  }
}

function updateUser() {
  var name = document.getElementById("customername-field").value;
  var username = document.getElementById("username-field").value;
  var phone = document.getElementById("phone-field").value;
  var email = document.getElementById("username-field").value;
  var roleId = document.getElementById("role-field").value;
  var userLevel = document.getElementById("level-field").value;
  var selectedFile = document.getElementById("sign-field").files;
  var levelId = userLevel;
  var password = document.getElementById("password-field").value;
  var repassword = document.getElementById("repassword-field").value;
  var strength = document.getElementById("strength").value;
  var strengthhidden = document.getElementById("strengthhidden").value;
  var lgas = document.getElementById("lga-field").value;
  var region = document.getElementById("region-field").value;
  var zone = document.getElementById("zone-field").value;
  var base64image = [];
  // var rankLevel = document.getElementById('status1-field').value;
  var userId = document.getElementById("id-field").value;
  // var cheo = rankLevel.split("-");
  var data = {
    name: name,
    username: username,
    lgas: lgas,
    zone: zone,
    region: region,
    phone: phone,
    email: email,
    roleId: roleId,
    password: "",
    levelId: levelId,
    userId: userId,
  };
  if ($("#password-field").is(":visible")) {
    if (password == "" || repassword == "") {
      alertMessage(
        "Oooops",
        "Tafadhali jaza neno siri au ficha neno siri ili kuendelea",
        "warning"
      );
      return;
    }
  }
  if (password.length > 0) {
    if (password == repassword) {
      if (strengthhidden == "Strong!") {
        data["password"] = password;
      } else {
        alertMessage(
          "Ooooops",
          "Umeweka neno siri lisilo salama (Weak). Hakikisha neno siri linakuwa na  angalau herufi kubwa 1, herufi ndogo 1, namba 1, special character 1 na linatakiwa kuwa na jumla ya characters kuanzia 8",
          "warning"
        );
        return;
      }
    } else {
      alertMessage(
        "Oooops",
        "Nenosiri hazifanani (Password does not match)",
        "warning"
      );
      return;
    }
  }

  if (selectedFile.length > 0) {
    // Select the very first file from list
    var fileToLoad = selectedFile[0];
    // FileReader function for read the file.
    var fileReader = new FileReader();
    // Onload of file read the file content
    fileReader.onload = function (fileLoadedEvent) {
      var base64 = fileLoadedEvent.target.result;
      var taachedFile = base64.split(",");
      base64image.push(taachedFile[1]);
      data["selectedFile"] = base64image;
      ajaxUpdateUser(data);
    };

    // Convert data to base64
    fileReader.readAsDataURL(fileToLoad);
  } else {
    ajaxUpdateUser(data);
  }
}

function ajaxUpdateUser(data) {
  ajaxRequest(
    "/UpdateWatumiaji",
    "POST",
    (updateResponse) => {
      var code = updateResponse.statusCode;
      var message = updateResponse.message;
      var userId = data.userId;
      if (code == 300) {
        getUsers();
        alertMessage("Umefanikiwa", message, "success", () => {
          $("#sign-field").val("");
        });
      }
      if (code == 306) {
        alertMessage("Haujafanikiwa!", message, "error", () => {});
      }
    },
    JSON.stringify(data)
  );
}

// *************************************END - BY MAPE ******************************

function sajiliHati() {
  var name = document.getElementById("customername-field").value;

  // var jazaname = document.getElementById('jazaname');

  var username = document.getElementById("username-field").value;

  var phone = document.getElementById("phone-field").value;

  var email = document.getElementById("username-field").value;

  var status = document.getElementById("status-field").value;
  // alert(status)
  var selectedFile = document.getElementById("sign-field").files;
  var roleRMe = document.getElementById("roleRM-field1").value;
  // alert(roleRMe)
  var cheo = status.split("-");
  var password = document.getElementById("password-field").value;
  var repassword = document.getElementById("repassword-field").value;
  var strength = document.getElementById("strength").value;
  // alert(strength)
  var strengthhidden = document.getElementById("strengthhidden").value;
  var lgas = document.getElementById("lga-field").value;
  var kanda = document.getElementById("kanda-field").value;
  var rankLevel = document.getElementById("status-field").value;
  var cheo = rankLevel.split("-");
  // let isnum = /^\d+$/.test(name);
  // const specialChars = /[`!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?~]/;
  if (lblError.innerHTML == "Invalid email address.") {
    alert("Tafadhali hakiki barua pepe");
  } else {
    if (password == repassword) {
      if (name.length <= 0) {
        $("#jazaname").show();
      }
      if (username.length <= 0) {
        $("#jazausername").show();
      }
      if (phone.length <= 0) {
        $("#jazasimu").show();
      }
      if (name.length > 0 && username.length > 0 && phone.length > 0) {
        $("#sajilbtn").hide();
        $("#pakiabtn").show();
        if (strengthhidden == "Strong!") {
          // alert(isnum)
          // alert(specialChars.test(name))
          // if(!isnum){
          //     if (specialChars.test(name)) {
          if (selectedFile.length > 0) {
            // Select the very first file from list
            var fileToLoad = selectedFile[0];
            // FileReader function for read the file.
            var fileReader = new FileReader();
            // var base64;
            // Onload of file read the file content
            fileReader.onload = function (fileLoadedEvent) {
              base64 = fileLoadedEvent.target.result;
              // Print data in console
              //alert(base64);
              var taachedFile = base64.split(",");

              $.ajax({
                url: "/SajiliWatumiaji",
                type: "POST",
                data: JSON.stringify({
                  name: name,
                  username: username,
                  lgas: lgas,
                  kanda: kanda,
                  phone: phone,
                  email: email,
                  status: cheo[0],
                  password: password,
                  cheo: cheo[1],
                  selectedFile: taachedFile[1],
                  roleRMe: roleRMe,
                }),
                contentType: "application/json",
                success: function (response) {
                  // console.log(response)
                  // alert(response.statusCode)
                  if (response.statusCode == 300) {
                    $("#sajilbtn").show();
                    $("#pakiabtn").hide();
                    $("#alertsuccess").show();
                  }
                  if (response.statusCode == 306) {
                    $("#sajilbtn").show();
                    $("#pakiabtn").hide();
                    $("#alertexist").show();
                  }
                  if (
                    response.statusCode == 400 ||
                    response.statusCode == 500
                  ) {
                    $("#sajilbtn").show();
                    $("#pakiabtn").hide();
                    $("#alertmtandao").show();
                  }
                },
              });
            };
            // Convert data to base64
            fileReader.readAsDataURL(fileToLoad);
          } else {
            $.ajax({
              url: "/SajiliWatumiaji",
              type: "POST",
              data: JSON.stringify({
                name: name,
                username: username,
                lgas: lgas,
                kanda: kanda,
                phone: phone,
                email: email,
                status: cheo[0],
                password: password,
                cheo: cheo[1],
                selectedFile: "",
                roleRMe: roleRMe,
              }),
              contentType: "application/json",
              success: function (response) {
                // console.log(response)
                // alert(response.statusCode)
                if (response.statusCode == 300) {
                  $("#sajilbtn").show();
                  $("#pakiabtn").hide();
                  $("#alertsuccess").show();
                }
                if (response.statusCode == 306) {
                  $("#sajilbtn").show();
                  $("#pakiabtn").hide();
                  $("#alertexist").show();
                }
                if (response.statusCode == 400 || response.statusCode == 500) {
                  $("#sajilbtn").show();
                  $("#pakiabtn").hide();
                  $("#alertmtandao").show();
                }
              },
            });
          }
        } else {
          alert("Nenosiri sio Salama");
        }
      } else {
        alert("Imeshindwa kusajili, Tafadhali Angalia taarifa na utume tena");
      }
    } else {
      alert("Nenosiri hazifanani");
    }
  }
}
function funga() {
  window.location.href = "/Watumiaji";
}

function passwordChanged() {
  var strength = document.getElementById("strength");
  var strongRegex = new RegExp(
    "^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$",
    "g"
  );
  var mediumRegex = new RegExp(
    "^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$",
    "g"
  );
  var enoughRegex = new RegExp("(?=.{6,}).*", "g");
  var pwd = document.getElementById("password-field");
  if (pwd.value.length == 0) {
    strength.innerHTML = "Type Password";
    strengthhidden.value = "Type Password";
  } else if (false == enoughRegex.test(pwd.value)) {
    strength.innerHTML = "More Characters";
    strengthhidden.value = "More Characters";
  } else if (strongRegex.test(pwd.value)) {
    strength.innerHTML = '<span style="color:green">Strong!</span>';
    strengthhidden.value = "Strong!";
  } else if (mediumRegex.test(pwd.value)) {
    strength.innerHTML = '<span style="color:orange">Medium!</span>';
    strengthhidden.value = "Medium!";
  } else {
    strength.innerHTML = '<span style="color:red">Weak!</span>';
    strengthhidden.value = "Weak!";
  }
}

function passwordChanged1() {
  var strength = document.getElementById("strength1");
  var strongRegex = new RegExp(
    "^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$",
    "g"
  );
  var mediumRegex = new RegExp(
    "^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$",
    "g"
  );
  var enoughRegex = new RegExp("(?=.{6,}).*", "g");
  var pwd = document.getElementById("password1-field");
  if (pwd.value.length == 0) {
    strength.innerHTML = "Type Password";
    strengthhidden.value = "Type Password";
  } else if (false == enoughRegex.test(pwd.value)) {
    strength.innerHTML = "More Characters";
    strengthhidden.value = "More Characters";
  } else if (strongRegex.test(pwd.value)) {
    strength.innerHTML = '<span style="color:green">Strong!</span>';
    strengthhidden.value = "Strong!";
  } else if (mediumRegex.test(pwd.value)) {
    strength.innerHTML = '<span style="color:orange">Medium!</span>';
    strengthhidden.value = "Medium!";
  } else {
    strength.innerHTML = '<span style="color:red">Weak!</span>';
    strengthhidden.value = "Weak!";
  }
}



function ValidateEmail() {
  var email = document.getElementById("username-field").value;
  var lblError = document.getElementById("lblError");
  lblError.innerHTML = "";
  var expr =
    /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  if (!expr.test(email)) {
    lblError.innerHTML = "Invalid email address.";
  }
}

function AddZone1(e){
    var nameId = e.getAttribute('data-id');
    var name = e.getAttribute('data-name');
    document.getElementById("code-field-edit").value = nameId;
    document.getElementById("ada-field-edit").value = name;
    document.getElementById("ada-field-edit").value = name;
    // var kanda = document.getElementById("ada-field").value;
    $('#deleteRecordModal').modal('show');
}
function ResetPassword(e){
    modal('resetPasswordModal' , true);
    var nameId = e.getAttribute('data-id');
    var name = e.getAttribute('data-name');
    var email = e.getAttribute('data-email');
    var email_length = email.length;
    var first_four_letter = email.substr(0, 4)
    var rest_letters_len = email.substr(email_length - 4, email_length)
    var rest_letters = first_four_letter+'*********'+rest_letters_len;
    // for(var i = 0; i < rest_letters_len.length; i++){
    //     rest_letters = '*'
    // }
    var last_four_letter = email.substr(email_length - 4, email_length)
    document.getElementById("code-field-edit").value = nameId;
    document.getElementById("code1-field-edit").value = name;
    document.getElementById("ada1-field-edit").value = email;
    // document.getElementById("email_only").value = email;
    // var kanda = document.getElementById("ada-field").value;
    $('#resetPasswordModal').modal('show');
}

function futaHati(){
    var name = document.getElementById('code-field-edit').value;
        
        $.ajax({
            url: "/FutaWatumiaji",
            type: 'POST',
            data: JSON.stringify({"name": name}),
            contentType: 'application/json',
            success: function(response) {
            alert("Mdau amefutwa kikamilifu")
            $('#kaimishaModal').modal('hide');
            window.location.href = "/Watumiaji"
            }
        });

}
function TumaEmail(){
    var email_only = document.getElementById('ada1-field-edit').value;
        ajaxRequest('/TumaEmail' , 'POST' , (response) => {
            var statusCode = response.statusCode;
            var message = response.message;
            alertMessage(statusCode == 300 ? 'Success' : 'Error!' , message , statusCode == '300' ? 'success' : 'error')
        } , JSON.stringify({email : email_only}))
}

        function checkOnlyNo() {
          var email = document.getElementById("customername-field").value;
          let isnum = /^\d+$/.test(email);
          if (isnum) {
            // $("#sajilbtn").hide();
            $("#jazanamba").show();
            $("#add-btnmwox").prop("disabled", true);
          }
          if (!isnum) {
            $("#jazanamba").hide();
            $("#add-btnmwox").prop("disabled", false);
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?~]/;
            if (specialChars.test(email)) {
              $("#jazanalama").show();
              $("#add-btnmwox").prop("disabled", true);
            } else {
              $("#jazanalama").hide();
              $("#add-btnmwox").prop("disabled", false);
            }
          }
        }


         function onlyNumberKey(evt) {
           // Only ASCII character in that range allowed
           var ASCIICode = evt.which ? evt.which : evt.keyCode;
           if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
             return false;
           return true;
         }