function confirmAction(callback , confirmBtnText = 'delete it' , icon='warning' , text = `You won't be able to revert this!` , title = 'Are you sure?'){
    Swal.fire({
      title: `${title}`,
      text: text,
      icon: icon,
      showCancelButton: !0,
      confirmButtonClass: "btn btn-primary w-xs me-2 mt-2",
      cancelButtonClass: "btn btn-danger w-xs mt-2",
      confirmButtonText: `${confirmBtnText ? confirmBtnText : "Ndio!"}`,
      cancelButtonText: "Ghairi",
      buttonsStyling: !1,
      showCloseButton: !0,
    }).then(function (t) {
      t.value && callback();
    });
}

function alertMessage(title = "Deleted!" , text='Your file has been deleted.' , icon = 'success' , callback , data = null) {
  Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonClass: "btn btn-primary w-xs mt-2",
        confirmButtonText:'Funga',
        buttonsStyling: !1,
  }).then(function(t){
      t.value && callback(data)
  });
}
