//register zones
function saveKanda(){
    var zonecode = document.getElementById('id-field').value;
    var zonename = document.getElementById('customername-field').value;
    $.ajax({
            url: "/saveZone",
            type: 'POST',
            data: JSON.stringify({"zonecode": zonecode, "zonename": zonename}),
            contentType: 'application/json',
            success: function(response) {
            // alert("response")
            $('#showModal').modal('hide');
            nata();
                // if(typeof(response) === "string"){response = JSON.parse(response)}
            }
        });
}

// function PullRegions(){
//     alert('Inapakia kutoka kwenye orodha ya Halmashauri, Tafadhali subiri')
//     $.ajax({
//         url: "/VutaWilaya",
//         type: 'GET',
//         contentType: 'application/json',
//         success: function(response) {
//         alert("response")
//         window.location.href = "/Halmashauri"
//        // window.location.href = "/Mikoa"
//         }
//     });
// }

function PullRegions(){
    // alert('Inapakia kutoka kwenye orodha ya mikoa, Tafadhali subiri')
    $("#firstbtn").hide();
    $("#pakiabtn").show();
    $.ajax({
        url: "/VutaWilaya",
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            if(response.statusCode == 306){
                $("#firstbtn").show();
                $("#pakiabtn").hide();
                $("#alertmeshindwa").show();
            }
            if(response.statusCode == 300){
                $("#firstbtn").show();
                $("#pakiabtn").hide();
                $("#alertmefanikiwa").show();
            }
        }
    });
}

//list of zones
function nata(){
    $.ajax({
        url: "/HalmashauriList",
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            if(typeof(response) === "string"){response = JSON.parse(response)}
           // console.log(response)
            $("#customerTable").find('tbody').empty();
            for (var i=0; i < response.length; i++) {
                var row = '<tr> <th scope="row">'+
                                '<div class="form-check">'+
                                    '<input class="form-check-input" type="checkbox" name="chk_child" value="option1">'+
                                '</div>'+
                            '</th>'; 
                row = row + '<td class="date">' + response[i].LgaName + '</td>';
                // row = row + '<td class="id" style="display:none;"><a href="javascript:void(0);" class="fw-medium link-primary"> ' + response[i].zoneName + ' </a></td>';
                row = row + '<td class="date">' + response[i].LgaCode + '</td>';

                row = row + '<td class="status"><span class="badge badge-soft-success text-uppercase"> ' + response[i].regionName + ' </span></td>';
                // row = row + '<td>'+
                //             '<div class="d-flex gap-2">'+
                //                 '<div class="edit">'+
                //                     '<button class="btn btn-sm btn-success edit-item-btn" data-bs-toggle="modal" data-bs-target="#showModal">Edit</button>'+
                //                 '</div>'+
                //                 '<div class="remove">'+
                //                     '<button class="btn btn-sm btn-danger remove-item-btn" data-bs-toggle="modal" data-bs-target="#deleteRecordModal">Remove</button>'+
                //                 '</div>'+
                //             '</div>'+
                //             '</td>'+
                        '</tr>';
                $('#customerTable').append(row);
            }
        }
    });
}
// , 5000);
window.onload = nata;