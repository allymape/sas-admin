function BadiliData(e) {
var nameId = e.getAttribute("data-id");
var url = "/EditRole/" + nameId;
window.location.href = url;
}
function sajiliRole() {
  window.location.href = "/CreateRole";
}

function getRolePermissionCheckboxes() {
  return document.querySelectorAll('input[name="formCheck1"]');
}

function updateCheckAllState() {
  var checkAll = document.getElementById("check-all");
  if (!checkAll) return;

  var checkboxes = Array.from(getRolePermissionCheckboxes()).filter(function (checkbox) {
    return !checkbox.disabled;
  });

  if (!checkboxes.length) {
    checkAll.checked = false;
    checkAll.indeterminate = false;
    return;
  }

  var checkedCount = checkboxes.filter(function (checkbox) {
    return checkbox.checked;
  }).length;

  checkAll.checked = checkedCount === checkboxes.length;
  checkAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
  updateModuleCheckAllStates();
}

function updateModuleCheckAllStates() {
  var moduleToggles = document.querySelectorAll(".module-check-all");
  if (!moduleToggles.length) return;

  moduleToggles.forEach(function (toggle) {
    var moduleKey = toggle.getAttribute("data-module");
    if (!moduleKey) return;

    var moduleCheckboxes = Array.from(
      document.querySelectorAll('input[name="formCheck1"][data-module="' + moduleKey + '"]')
    ).filter(function (checkbox) {
      return !checkbox.disabled;
    });

    if (!moduleCheckboxes.length) {
      toggle.checked = false;
      toggle.indeterminate = false;
      return;
    }

    var checkedCount = moduleCheckboxes.filter(function (checkbox) {
      return checkbox.checked;
    }).length;

    toggle.checked = checkedCount === moduleCheckboxes.length;
    toggle.indeterminate = checkedCount > 0 && checkedCount < moduleCheckboxes.length;
  });
}

function initModuleCheckAllBehavior() {
  var moduleToggles = document.querySelectorAll(".module-check-all");
  if (!moduleToggles.length) return;

  moduleToggles.forEach(function (toggle) {
    toggle.addEventListener("change", function () {
      var moduleKey = toggle.getAttribute("data-module");
      var shouldCheck = toggle.checked;
      if (!moduleKey) return;

      var moduleCheckboxes = document.querySelectorAll(
        'input[name="formCheck1"][data-module="' + moduleKey + '"]'
      );
      moduleCheckboxes.forEach(function (checkbox) {
        if (checkbox.disabled) return;
        checkbox.checked = shouldCheck;
      });
      updateCheckAllState();
    });
  });

  updateModuleCheckAllStates();
}

function applyPermissionTemplate(permissionIds) {
  var permissionSet = new Set(
    (Array.isArray(permissionIds) ? permissionIds : []).map(function (id) {
      return String(id);
    })
  );

  getRolePermissionCheckboxes().forEach(function (checkbox) {
    if (checkbox.disabled) return;
    checkbox.checked = permissionSet.has(String(checkbox.value));
  });

  updateCheckAllState();
}

function clearPermissionTemplate() {
  getRolePermissionCheckboxes().forEach(function (checkbox) {
    if (checkbox.disabled) return;
    checkbox.checked = false;
  });

  updateCheckAllState();
}

function loadRolesForInheritance() {
  var inheritSelect = document.getElementById("inherit-role-id");
  if (!inheritSelect) return;

  var resolveRoleId = function (role) {
    var rawId = role && (role.id ?? role.role_id ?? role.roleId);
    var parsed = Number(rawId);
    return Number.isFinite(parsed) ? parsed : null;
  };

  var resolveRoleName = function (role, roleId) {
    if (!role || typeof role !== "object") return "Role " + roleId;
    return (
      role.role_name ||
      role.name ||
      role.label ||
      role.role ||
      ("Role " + roleId)
    );
  };

  ajaxRequest("/LookupRoles", "GET", function (response) {
    if (response.statusCode != 300) return;

    var roles = Array.isArray(response.data) ? response.data : [];
    var inserted = 0;

    inheritSelect.innerHTML = '<option value="">-- Chagua role --</option>';

    roles.forEach(function (role) {
      var roleId = resolveRoleId(role);
      if (!roleId) return;
      var option = document.createElement("option");
      option.value = String(roleId);
      option.textContent = resolveRoleName(role, roleId);
      inheritSelect.appendChild(option);
      inserted += 1;
    });

    if (!inserted) {
      inheritSelect.innerHTML = '<option value="">-- Hakuna role zilizopatikana --</option>';
    }
  });
}

function initRoleInheritanceForCreatePage() {
  var inheritSelect = document.getElementById("inherit-role-id");
  var applyButton = document.getElementById("apply-inherit-role");
  var clearButton = document.getElementById("clear-inherit-role");
  if (!inheritSelect || !applyButton || !clearButton) return;

  loadRolesForInheritance();

  applyButton.addEventListener("click", function () {
    var selectedRoleId = Number(inheritSelect.value);
    if (!selectedRoleId) {
      alertMessage("Info", "Chagua role kwanza kabla ya kunakili.", "info");
      return;
    }

    ajaxRequest("/RoleTemplate/" + selectedRoleId, "GET", function (response) {
      if (response.statusCode == 300) {
        var assigned = response.data && Array.isArray(response.data.assigned_permissions)
          ? response.data.assigned_permissions
          : [];
        applyPermissionTemplate(assigned);
        alertMessage("Success", "Permissions zimenakiliwa kutoka role uliyochagua.", "success");
      } else {
        alertMessage("Fail", response.message || "Imeshindikana kunakili permissions.", "error");
      }
    });
  });

  clearButton.addEventListener("click", function () {
    clearPermissionTemplate();
  });
}

function initCheckAllBehavior() {
  var checkAll = document.getElementById("check-all");
  if (!checkAll) return;

  checkAll.addEventListener("change", function () {
    var shouldCheck = checkAll.checked;
    getRolePermissionCheckboxes().forEach(function (checkbox) {
      if (checkbox.disabled) return;
      checkbox.checked = shouldCheck;
    });
    updateCheckAllState();
  });

  getRolePermissionCheckboxes().forEach(function (checkbox) {
    checkbox.addEventListener("change", updateCheckAllState);
  });

  updateCheckAllState();
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
       "/tengenezaRole",
       "POST",
       (response) => {
        const {statusCode , message} = response
         alertMessage(
           statusCode == 300 ? "Success" : "Fail",
           message,
           statusCode == 300 ? "success" : "error",
           () => {
              if(statusCode == 300){
                window.location.href = "/CreateRole";
              }
           }
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

$("#search-permission").on("keyup", function () {
  var query = String($(this).val() || "").trim().toLowerCase();
  var moduleCards = $(".permission-module-card");
  var permissionOptions = $(".permission-option");

  if (!moduleCards.length || !permissionOptions.length) {
    var targetedElements = $(".checkbox").closest("div").find("span");
    var parent = "div";
    var messageId = "message-box";
    search(this, targetedElements, parent, messageId);
    return;
  }

  var matchCount = 0;
  if (query.length > 2) {
    moduleCards.each(function () {
      var moduleHasMatch = false;
      $(this)
        .find(".permission-option")
        .each(function () {
          var text = String($(this).data("search-text") || $(this).text() || "").toLowerCase();
          var isMatch = text.includes(query);
          $(this).toggle(isMatch);
          if (isMatch) {
            moduleHasMatch = true;
            matchCount++;
          }
        });
      $(this).toggle(moduleHasMatch);
    });

    if (matchCount === 0) {
      $("#message-box")
        .html(
          "<span class='text-info'>Hatujapata kinacholingana na ulichokiandika ... <i>" +
            query +
            "</i></span>"
        )
        .removeClass("d-none");
    } else {
      $("#message-box").addClass("d-none");
    }
    return;
  }

  permissionOptions.show();
  moduleCards.show();
  $("#message-box").addClass("d-none");
});

initRoleInheritanceForCreatePage();
initCheckAllBehavior();
initModuleCheckAllBehavior();
