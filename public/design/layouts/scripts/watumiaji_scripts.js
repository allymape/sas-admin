getUsers();
//   Populate list of users to a table
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
          ? `<span class='myTooltip' style='cursor:pointer' data-bs-toggle=tooltip title='Kanda ya ${
              user.zone_name
            }'>
          ${user.section_name + " " + user.lga_name}
          </span>`
          : user.zone_name
          ? `<span class='myTooltip' style='cursor:pointer' data-bs-toggle=tooltip title='Kanda ya ${
              user.zone_name
            }'>
          ${user.section_name + " " + user.zone_name}
          </span>`
          : user.section_name + " HQ",
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
        status: user.user_status,
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
  } , true);
  // end of table
}

$("#btn-create-user").on("click", function () {
  resetAllFields();
  getLookUpData();
  $("#id-field").remove();
});
// Edit User
function editUser(e) {
  var userId = e.getAttribute("data-id");
  $("#id-field").remove();
  $("#user-form").prepend(`<input type='hidden' id='id-field' />`);
  resetAllFields();
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
        document.getElementById("id-field").value = userId;
        document.getElementById("name-field").value = user.name;
        document.getElementById("phone-field").value = user.phone_no;
        document.getElementById("username-field").value = user.email;
        document.getElementById("password-field").value = "";
        document.getElementById("repassword-field").value = "";
        getLookUpData(user);
      }
    },
    {},
    false
  );
}

function getLookUpData(user){
  // Load roles
  ajaxRequest(
    "/LookupRoles",
    "POST",
    (rolesResponse) => {
      if (rolesResponse.statusCode == 300) {
        var roles = rolesResponse.data;
        appendSelectionOption(
          "jukumu-field",
          roles.map((role, index) => ({
            name: role.role_name,
            id: role.role_id,
          })),
          [Number(user ? user.jukumu : null)],
          "Chagua Role"
        );

        // Load Ranks
        ajaxRequest(
          "/LookupRanks",
          "POST",
          (ranksResponse) => {
            if (ranksResponse.statusCode == 300) {

              var ranks = ranksResponse.data;
              appendSelectionOption(
                "ngazi-field",
                ranks.map((rank, index) => ({
                  name: rank.name,
                  id: rank.id,
                })),
                [user ? user.ngazi : null],
                "Chagua Ngazi"
              );

              getAllHierarchies(
                user ? user.ngazi : null,
                user,
                user ? user.uongozi : null
              );
              // getAllDesignations()
              modal("showModal", true);
            }
          },
          {},
          false
        ); //end of levels ajax request
      }
    },
    {},
    false
  ); // end of roles ajax request
}


//on change Ngazi
$("#ngazi-field").on("change", function () {
  var rankId = $(this).val();
      rankId ? getAllHierarchies(rankId) : emptyUongoziField();
      hideAllSelectField();
      emptyVyeoField();
});
//on change Ngazi
$("#uongozi-field").on("change", function () {
  var hierarchyId = $(this).val();
      hierarchyId ? getAllDesignations(hierarchyId) : emptyVyeoField();
});
$("#uongozi-field").on("change", function () {
  var selectText = $(this).find("option:selected").text();
  showHiddenFieldBasedOnSelectedHierarchy(selectText);
});
// On change zone
$("#kanda-field").on("change", function () {
  var zoneId = $(this).val();
  if ($("#mkoa-field").is(":visible")) {
    // Load regions
    $("#mkoa-field").prop("disabled", zoneId ? false : true);
    emptyLgaField();
    zoneId ? getAllRegions(zoneId) : emptyRegionField();
  }
});

$("#mkoa-field").on("change", function () {
  var regionCode = $(this).val();
  regionCode ? getAllDistricts(regionCode) : emptyLgaField();
});

function showHiddenFieldBasedOnSelectedHierarchy(selectText) {
  if(selectText){
    var selectedValue = selectText.toLowerCase().trim();
    var zoneDiv = $("#kanda-field").closest("div");
    var regionDiv = $("#mkoa-field").closest("div");
    var lgaDiv = $("#lga-field").closest("div");
    var levelDiv = $("#cheo-field").closest("div");
    hideAllSelectField();
    if (selectedValue == "k1" || selectedValue.includes("k1")) {
      zoneDiv.removeClass("d-none");
      getAllZones();
    } else if (selectedValue == "w1" || selectedValue.includes("w1")) {
      getAllZones();
      zoneDiv.removeClass("d-none");
      regionDiv.removeClass("d-none");
      lgaDiv.removeClass("d-none");
    }
  }
}

function hideAllSelectField() {
  $("#kanda-field")
    .closest("div")
    .addClass("d-none")
    .find("select")
    .val("")
    .html("<option value=''>Chagua Kanda</option>");
  $("#mkoa-field")
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

function emptyUongoziField() {
  $("#uongozi-field")
    .prop("disabled", true)
    .html("<option value=''>Chagua Ngazi kwanza</option>");
}
function emptyVyeoField() {
  $("#cheo-field")
    .prop("disabled", true)
    .html("<option value=''>Chagua Sehemu</option>");
}
function emptyLgaField() {
  $("#lga-field")
    .prop("disabled", true)
    .html("<option value=''>Chagua Mkoa kwanza</option>");
}

function emptyRegionField() {
  $("#mkoa-field")
    .prop("disabled", true)
    .html("<option value=''>Chagua Kanda kwanza</option>");
}

function resetAllFields() {
  $("#showModal").find("input,file").val("");
  $("#showModal").find("select").html("").select2({ data: [{ id: "", text: "" }] });
  $("#jukumu-field").select2({
    placeholder: "Chagua Jukumu",
    dropdownParent: $("#showModal"),
    //   theme: "classic",
  });
   $("#ngazi-field").select2({
     placeholder: "Chagua Ngazi",
     dropdownParent: $("#showModal"),
     //   theme: "classic",
   });
    $("#uongozi-field").select2({
      placeholder: "Chagua",
      dropdownParent: $("#showModal"),
      //   theme: "classic",
    });
   $("#cheo-field").select2({
     placeholder: "Chagua Cheo",
     dropdownParent: $("#showModal"),
     //   theme: "classic",
   });
  $("#kanda-field").select2({
    placeholder: "Chagua Kanda",
    dropdownParent: $("#showModal"),
    //   theme: "classic",
  });
  $("#mkoa-field").select2({
    placeholder: "Chagua Kanda kwanza",
    dropdownParent: $("#showModal"),
    //   theme: "classic",
  });
  $("#lga-field").select2({
    placeholder: "Chagua Mkoa kwanza",
    dropdownParent: $("#showModal"),
    //   theme: "classic",
  });
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
// Validate form
function validateUserForm(){
  var name = document.getElementById("name-field").value;
  var username = document.getElementById("username-field").value;
  var phone = document.getElementById("phone-field").value;
  var email = document.getElementById("username-field").value;
  var roleId = document.getElementById("jukumu-field").value;
  var userLevel = document.getElementById("cheo-field").value;
  var password = document.getElementById("password-field").value;
  var repassword = document.getElementById("repassword-field").value;
  var strength = document.getElementById("strength").value;
  var strengthhidden = document.getElementById("strengthhidden").value;
  var lgas = document.getElementById("lga-field").value;
  var region = document.getElementById("mkoa-field").value;
  var zone = document.getElementById("kanda-field").value;
  // var rankLevel = document.getElementById('status1-field').value;

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
    levelId: userLevel,
  };
   
  var zoneField = $("#kanda-field");
  var lgaField = $("#lga-field");

  if ($("#password-field").is(":visible")) {
    if (password == "" || repassword == "") {
      alertMessage(
        "Oooops",
        "Tafadhali jaza neno siri au ficha neno siri ili kuendelea",
        "warning"
      );
      return;
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
  }

  if (
    roleId.length <= 0 ||
    userLevel.length <= 0 ||
    (zoneField.is(":visible") && zone.length <= 0) ||
    (lgaField.is(":visible") && lgas.length <= 0)
  ) {
    alertMessage(
      "Oooops",
      "Sehemu zote zilizowekwa alama ya * lazima zijazwe.",
      "warning"
    );
    return;
  }
  return data;
}
// Create or Update user account
function saveUser() {
  var selectedFile = document.getElementById("sign-field").files;
  var base64image = [];
  var data = validateUserForm()
  var elementId = document.getElementById("id-field");
    if (elementId !== null) {
      data["userId"] = elementId.value;
      var url = `UpdateUser/${elementId.value}`;
    }else{
      var url = `CreateUser`;
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
      ajaxSaveUser(url ,data);
    };
    // Convert data to base64
    fileReader.readAsDataURL(fileToLoad);
  } else {
    ajaxSaveUser(url , data);
  }
}

function ajaxSaveUser(url , data) {
  ajaxRequest(
    url,
    "POST",
    (response) => {
      var code = response.statusCode;
      var message = response.message;
      if (code == 300) {
        getUsers();
        alertMessage("Umefanikiwa", message, "success", () => {
          $("#sign-field").val("");
          var elementId = document.getElementById("id-field");
          if (elementId == null) {
            modal("showModal" , false);
            resetAllFields();
            getLookUpData();
          }
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
  var name = document.getElementById("name-field").value;

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
      if (phone.length <= 0) {
        $("#jazasimu").show();
      }
      if (name.length > 0 && username.length > 0 && phone.length > 0) {
        // $("#sajilbtn").hide();
        // $("#pakiabtn").show();
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

function AddZone1(e) {
  var nameId = e.getAttribute("data-id");
  var name = e.getAttribute("data-name");
  document.getElementById("code-field-edit").value = nameId;
  document.getElementById("ada-field-edit").value = name;
  document.getElementById("ada-field-edit").value = name;
  // var kanda = document.getElementById("ada-field").value;
  $("#deleteRecordModal").modal("show");
}
function ResetPassword(e) {
  modal("resetPasswordModal", true);
  var nameId = e.getAttribute("data-id");
  var name = e.getAttribute("data-name");
  var email = e.getAttribute("data-email");
  var email_length = email.length;
  var first_four_letter = email.substr(0, 4);
  var rest_letters_len = email.substr(email_length - 4, email_length);
  var rest_letters = first_four_letter + "*********" + rest_letters_len;
  // for(var i = 0; i < rest_letters_len.length; i++){
  //     rest_letters = '*'
  // }
  var last_four_letter = email.substr(email_length - 4, email_length);
  document.getElementById("code-field-edit").value = nameId;
  document.getElementById("code1-field-edit").value = name;
  document.getElementById("ada1-field-edit").value = email;
  // document.getElementById("email_only").value = email;
  // var kanda = document.getElementById("ada-field").value;
  $("#resetPasswordModal").modal("show");
}

function deleteUser() {
  var id = document.getElementById("code-field-edit").value;
     ajaxRequest(`/DisableUser/${id}` , "POST" , (response) => {
         const {statusCode , message} = response;
          alertMessage(statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa" , 
                       message,
                       statusCode == 300 ? 'success' : 'error' , () => {});
            if(statusCode == 300){
              getUsers()
            }
     } , {});
}

function TumaEmail() {
  var email_only = document.getElementById("ada1-field-edit").value;
  ajaxRequest(
    "/TumaEmail",
    "POST",
    (response) => {
      var statusCode = response.statusCode;
      var message = response.message;
      alertMessage(
        statusCode == 300 ? "Success" : "Error!",
        message,
        statusCode == 300 ? "success" : "error"
      );
    },
    JSON.stringify({ email: email_only })
  );
}

function checkOnlyNo() {
  var email = document.getElementById("name-field").value;
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
  if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57)) return false;
  return true;
}
