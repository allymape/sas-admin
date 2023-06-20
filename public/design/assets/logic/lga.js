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

// function Pullcouncils(){
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

function Pullcouncils(){
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
    var url = window.location.href;
    var parameters = url.split("?")[1] || "";
    $.ajax({
        url: "/HalmashauriList"+(parameters ? '?'+parameters : ''),
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            // if(typeof(response) === "string"){response = JSON.parse(response)}
            // console.log(response)
           var councils = response.councils;
           var pages = response.pagination.pages;
           var per_page = response.pagination.per_page;
           var current = response.pagination.current;
           var total = response.pagination.total;
           var first_item = per_page * (current - 1) + 1;
            $("#customerTable").find('tbody').empty();
            $(".caption").html(`<span>Idadi ya Halmashauri zilizopatikana ${total}.</span> <span class='justify-content-end'>Ukurasa ${current}  kati ya ${pages}     [${first_item} hadi ${first_item - 1 + councils.length}] </span>`);
            for (var i=0; i < councils.length; i++) {
                var row = '<tr> <td scope="row">' + (first_item + i) + "</td>"; 
                row = row + '<td class="date">' + councils[i].LgaName + "</td>";
                // row = row + '<td class="id" style="display:none;"><a href="javascript:void(0);" class="fw-medium link-primary"> ' + response[i].zoneName + ' </a></td>';
                row = row + '<td class="date">' + councils[i].LgaCode + "</td>";
                row = row + '<td class="status"><span class="text-uppercase"> ' + councils[i].regionName + ' </span></td>';
                // row = row + '<td>'+
                //             '<div class="d-flex gap-2">'+
                //                 '<div class="edit">'+
                //                     '<button class="btn btn-sm btn-success edit-item-btn" data-bs-toggle="modal" data-bs-target="#showModal"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>'+
                //                 '</div>'+
                //                 '<div class="remove">'+
                //                     '<button class="btn btn-sm btn-danger remove-item-btn" data-bs-toggle="modal" data-bs-target="#deleteRecordModal">Remove</button>'+
                //                 '</div>'+
                //             '</div>'+
                //             '</td>'+
                '</tr>';
                $('#customerTable').append(row);
            }
            paginate("Halmashauri", pages, current, per_page);
        }
    });
}
// , 5000);
window.onload = nata;