function confirmAction(
  callback,
  confirmBtnText = "delete it",
  icon = "warning",
  text = `You won't be able to revert this!`,
  title = "Are you sure?",
  html = "",
  callback_open = () => {}
) {
  Swal.fire({
    title: `${title}`,
    text: text,
    html: html,
    icon: icon,
    showCancelButton: !0,
    allowOutsideClick: false,
    confirmButtonText: `${confirmBtnText ? confirmBtnText : "Ndio!"}`,
    cancelButtonText: "Ghairi",
    customClass: {
      confirmButton: "btn btn-primary w-xs me-2 mt-2",
      cancelButton: "btn btn-danger w-xs mt-2",
    },
    buttonsStyling: !1,
    showCloseButton: !0,
    didOpen: () => {
       callback_open();
    },
  }).then(function (t) {
    t.value && callback();
  });
}

function alertMessage(title = "" , text='' , icon = 'success' , callback , data = null) {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    customClass: {
      confirmButton: "btn btn-primary w-xs mt-2",
    },
    confirmButtonText: "Funga",
    buttonsStyling: !1,
  }).then(function (t) {
    t.value && callback(data);
  });
}
