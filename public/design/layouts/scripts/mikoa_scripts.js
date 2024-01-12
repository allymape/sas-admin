
    function AddZone(e){
        var regionId = e.getAttribute('data-id');
        var zoneId = e.getAttribute('data-zone');
        var box = e.getAttribute("data-address");
        var hasSqaOffice = e.getAttribute("data-has_sqa_office");
        document.getElementById("regionId").value = regionId;
       
        $("#zone-field").val(zoneId)
        $("#box-field").val(box)
        $("#sqa-zone-field").prop("checked", hasSqaOffice ? true : false);
        $('#showModalZone').modal('show');
    }

    function sajiliHati(){
        var regionId = document.getElementById('regionId').value;
        var kanda = document.getElementById('zone-field').value;
        var box = document.getElementById("box-field").value;
        var has_sqa_zone = document.getElementById("sqa-zone-field").checked;
        $.ajax({
          url: "/MkoaKanda",
          type: "POST",
          data: JSON.stringify({
            kanda: kanda,
            regionId: regionId,
            has_sqa_zone,
            box
          }),
          contentType: "application/json",
          success: function (response) {
            if (response.statusCode == 300) {
              alertMessage("Success", response.message, "success", () => {
                renderDataTableRegions();
              });
            }
            if (response.statusCode == 306) {
              alertMessage("Error", response.message, "error", () => {
                // Close dialog and do nothing
              });
            }
          },
        });
    }

    $("#create-btn").on("click" , function(){
    confirmAction(PullRegions ,'Pakia Taarifa' , 'warning' , 'Hautaweza kurudisha nyuma kitendo hiki.' ,'Una uhakika?' );
})

function PullRegions() {
  ajaxRequest("/VutaMikoa" , "POST" , (response) => {
      if (response.statusCode == 306) {
        alertMessage(`Imeshindikana` , `Imeshindikana kupakia taarifa za Mikoa mipya, Tafadhali wasiliana na Admin wa Mfumo!` , `warning`);
      }
      if (response.statusCode == 300) {
        alertMessage(`Hongera` , `Umefanikiwa kupakuwa taarifa za Mikoa kikamilifu!`);
        renderDataTableRegions()
      }});
}
//register zones
function saveKanda() {
  var zonecode = document.getElementById("id-field").value;
  var zonename = document.getElementById("customername-field").value;
  ajaxRequest("/saveZone" , "POST" , (response) => {
    alert(response.statusCode)
  } , JSON.stringify({zonecode: zonecode, zonename: zonename }))
}

function renderDataTableRegions() {
  ajaxRequest("/MikoaList" , "GET" , (response) => {
                // render table
                var fields = {
                  zone: {
                    hidden: true,
                  },
                  address: {
                    hidden: true,
                  },
                  has_sqa_office : {
                    hidden: true,
                  },
                  name: {},
                  code: {},
                  box: {},
                  zone_name: {},
                  sqa_zone: {
                    tdClass: "text-center",
                  },
                  created_at: {},
                  updated_at: {},
                };
                response.data = response.regions.map((region) => ({
                  id: region.regionCode,
                  name: region.regionName,
                  code: region.regionCode,
                  box: region.box ? `S.L.P ${region.box}` : "",
                  address: region.box,
                  zone_name: region.zoneName,
                  has_sqa_office: region.sqa_zone,
                  zone: region.zoneCode,
                  sqa_zone: region.sqa_zone
                    ? `<span class=" ri-building-2-line text-primary ri-2x"></span>`
                    : "",
                  created_at: region.createdAt,
                  updated_at: region.updatedAt,
                }));
                dataTable('Mikoa' ,'regionTable' , fields , response , {
                            editBtn :  { show : true , callback : 'AddZone(this); return false;'}, 
                            deleteBtn: { show : false , callback: ''},
                            otherBtn:  { show : false , callback: '' }
                        }, true , 'Idadi ya Mikoa iliyopatikana ' );
  })
}
window.onload = renderDataTableRegions;
