// Checkbox all (Chagua Zote) make this code reusable ###########
var checkboxes = $(".checkbox");
var check_all = $("#check-all");
check_all.on("change", function () {
  var checked = $(this).prop("checked");
  checkboxes.prop("checked", checked);
});

checkboxes.on("change", function () {
  makeAllSelected();
});

function makeAllSelected() {
  var selected_checkboxes = $(".checkbox:checked");
  check_all.prop("checked", checkboxes.length === selected_checkboxes.length);
}
makeAllSelected();
// End of Checkbox all ############
