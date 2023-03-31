//update zones
function updateKanda(){
    var zoneid = document.getElementById('id1-field').value;
    var zonecode = document.getElementById('code1-field').value;
    var zonename = document.getElementById('customername1-field').value;
    if(zonecode.length <= 0){
        $("#editsimu").show();
    }if(zonename.length <= 0){
        $("#editkanda").show();
    }if(zonename.length > 0 && zonecode.length > 0){
        $.ajax({
            url: "/updateZone",
            type: 'POST',
            data: JSON.stringify({"zonecode": zonecode, "zonename": zonename, "zoneid": zoneid}),
            contentType: 'application/json',
            success: function(response) {
                if(response.statusCode == 300){
                    $("#alertsuccess1").show();
                }if(response.statusCode == 306){
                    $("#alertexist1").show();
                }if(response.statusCode == 400 || response.statusCode == 500){
                    $("#alertmtandao1").show();
                }
                // if(typeof(response) === "string"){response = JSON.parse(response)}
            }
        });
    }
}

function funga(){
    window.location.href = "/Zoni"
}

//register zones
function saveKanda(){
    var zonecode = document.getElementById('id-field').value;
    var zonename = document.getElementById('customername-field').value;
    if(zonecode.length <= 0){
        $("#jazasimu").show();
    }if(zonename.length <= 0){
        $("#jazakanda").show();
    }if(zonename.length > 0 && zonecode.length > 0){
        $.ajax({
            url: "/saveZone",
            type: 'POST',
            data: JSON.stringify({"zonecode": zonecode, "zonename": zonename}),
            contentType: 'application/json',
            success: function(response) {
                if(response.statusCode == 300){
                    $("#alertsuccess").show();
                }if(response.statusCode == 306){
                    $("#alertexist").show();
                }if(response.statusCode == 400 || response.statusCode == 500){
                    $("#alertmtandao").show();
                }
            // alert("response")
            // $('#showModal').modal('hide');
            // nata();
                // if(typeof(response) === "string"){response = JSON.parse(response)}
            }
        });
    }
}

//list of zones
function nata(){
    $.ajax({
        url: "/KandaList",
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            if(typeof(response) === "string"){response = JSON.parse(response)}
            console.log(response)
            $("#customerTable").find('tbody').empty();
            for (var i=0; i < response.length; i++) {
                var row = '<tr> <th scope="row">'+
                                '<div class="form-check">'+
                                    '<input class="form-check-input" type="checkbox" name="chk_child" value="option1">'+
                                '</div>'+
                            '</th>'; 
                // row = row + '<td class="id" style="display:none;"><a href="javascript:void(0);" class="fw-medium link-primary"> ' + response[i].zoneName + ' </a></td>';
                row = row + '<td class="date">' + response[i].zoneName + '</td>';
                row = row + '<td class="status"><span class="badge badge-soft-success text-uppercase"> ' + response[i].zoneCode + ' </span></td>';
                row = row + '<td>'+
                            '<div class="d-flex gap-2">'+
                                '<div class="edit">'+
                                    '<button class="btn btn-sm btn-success edit-item-btn" data-bs-toggle="modal" data-id= ' + 
                                    response[i].zoneId + ' data-name= ' + response[i].zoneName + ' data-code= ' + 
                                    response[i].zoneCode + ' onclick="BadiliData(this); return false;">Edit</button>'+
                                '</div>'+
                                '<div class="remove">'+
                                '<button type="button" class="btn btn-danger add-btn" '+
                                'data-bs-toggle="modal" data-id="'+ response[i].zoneId +'" '+
                                ' id="create-btn" '+
                                'onclick="AddZone1(this); return false;">Futa</button>';
                                '</div>'+
                            '</div>'+
                        '</td></tr>';
                $('#customerTable').append(row);
            }
        }
    });
}
// , 5000);
window.onload = nata;

function BadiliData(e){
    var nameId = e.getAttribute('data-id');
    var name = e.getAttribute('data-name');
    var code = e.getAttribute('data-code');
    document.getElementById("code1-field").value = code;
    document.getElementById("id1-field").value = nameId;
    document.getElementById("customername1-field").value = name;
    $('#showEditModal').modal('show');
}

function AddZone1(e){
    var nameId = e.getAttribute('data-id');
    document.getElementById("code-field-edit").value = nameId;
    // var kanda = document.getElementById("ada-field").value;
    $('#deleteRecordModal').modal('show');
}

function futaHati(){
    var name = document.getElementById('code-field-edit').value;
     
        $.ajax({
            url: "/FutaZoni",
            type: 'POST',
            data: JSON.stringify({"name": name}),
            contentType: 'application/json',
            success: function(response) {
            alert("Kanda imefutwa kikamilifu")
            $('#kaimishaModal').modal('hide');
            window.location.href = "/Zoni"
            }
        });

}
