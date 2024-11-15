function confirmAction(
  callback,
  confirmBtnText = "delete it",
  icon = "warning",
  text = `You won't be able to revert this!`,
  title = "Are you sure?",
  html = "",
  callback_open = () => {},
  cancelCallback = () => {}
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
    if (t.isConfirmed) {
      // When confirmed (user clicked on the confirm button)
      callback();
    } else if (t.isDismissed) {
      // When canceled or dismissed
      cancelCallback(); // Call the cancel callback
    }
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

function verifySchoolInfo(
  school_name,
  registration_number,
  description,
  callback
) {
  Swal.fire({
    title: `JINA: ${school_name} REG#: ${registration_number}`,
    input: "textarea",
    inputAttributes: {
      autocapitalize: "off",
    },
    inputValue: description,
    inputPlaceholder: "Weka Maelezo ...",
    showCancelButton: true,
    cancelButtonText: "Ghairi",
    confirmButtonText: "Wasilisha",
    showLoaderOnConfirm: true,
    inputValidator: (value) => {
      if (!value) {
        return "You have to write something!";
      }
    },
    preConfirm: async (value) => {
      // Wrap the callback to handle status codes
      return new Promise((resolve) => {
        callback(value, (statusCode, message) => {
          if (statusCode === 306) {
            Swal.showValidationMessage(`Error: ${message}`);
            resolve(false); // Prevent modal from closing
          } else {
            alertMessage(
              "Alert",
              message,
              statusCode === 300 ? "success" : "warning",
              () => {
                window.location.reload()
              }
            );
            resolve(true); // Allow modal to close
          }
        });
      });
    },
    allowOutsideClick: () => false,
  }).then((result) => {
    if (result.isConfirmed) {
    }
  });
}
