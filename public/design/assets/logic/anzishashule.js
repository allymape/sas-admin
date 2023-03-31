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

//list of zones
function nata(){
    $.ajax({
        url: "/MaombiKuanzishaShuleList",
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            if(typeof(response) === "string"){response = JSON.parse(response)}
            $("#tasksTable").find('tbody').empty();
            for (var i=0; i < response.length; i++) {
                var row = '<tr> <th scope="row">'+
                                '<div class="form-check">'+
                                    '<input class="form-check-input" type="checkbox" name="chk_child" value="option1">'+
                                '</div>'+
                            '</th>'; 
                row = row + '<td class="id" id="tracker"><a href="TaarifaOmbi/'+response[i].tracking_number+'" class="fw-medium link-primary"> ' + response[i].tracking_number + ' </a></td>';
                row = row + '<td class="project_name"><a href="TaarifaOmbi/'+response[i].tracking_number+'" class="fw-medium link-primary"> ' + response[i].school_name + ' </a></td>';
                row = row + '<td>'+
                            '<div class="d-flex">'+
                                '<div class="flex-grow-1 tasks_name"> ' + response[i].LgaName + ' </div>'+
                                    '<div class="flex-shrink-0 ms-4">'+
                                '<ul class="list-inline tasks-list-menu mb-0">'+
                                '<li class="list-inline-item"><a href="TaarifaOmbi/'+response[i].tracking_number+'"><i class="ri-eye-fill align-bottom me-2 text-muted"></i></a></li>'+
                                    // '<li class="list-inline-item"><a class="edit-item-btn" href="#showModal" data-bs-toggle="modal"><i class="ri-pencil-fill align-bottom me-2 text-muted"></i></a></li>'+
                            //     '<li class="list-inline-item">'+
                            // '<a class="remove-item-btn" data-bs-toggle="modal" href="#deleteOrder">'+
                            // '<i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i>'+
                            // '</a>'+
                            // '</li>'+
                            '</ul>'+
                            '</div>'+
                            '</div>'+
                            '</td>';
                row = row + '<td class="status"><span class=""> ' + response[i].RegionName + ' </span></td>';
                row = row + ' <td class="due_date badge badge-soft-secondary text-uppercase"  title=" ' + response[i].created_at + ' "> ' + response[i].remain_days + ' </td>';
                row = row + '<td class="priority"><span class="badge bg-danger text-uppercase">Jipya</span></td>';
                // row = row + '<td class="assignedto">'+
                //             '<div class="avatar-group">'+
                //                 '<a href="javascript: void(0);" class="avatar-group-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="Frank">'+
                //                     '<img src="design/assets/images/users/avatar-3.jpg" alt="" class="rounded-circle avatar-xxs" />'+
                //                 '</a>'+
                //                 '<a href="javascript: void(0);" class="avatar-group-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="Anna">'+
                //                     '<img src="design/assets/images/users/avatar-1.jpg" alt="" class="rounded-circle avatar-xxs" />'+
                //                 '</a>'+
                //             '</div>'+
                //             '</td>'+
                            '</tr>';
                $('#tasksTable').append(row);
            }
        }
    });
}
window.onload = nata;

// function viewTaarifa(tracker){
//     $.ajax({
//             url: "/TaarifaOmbi",
//             type: 'POST',
//             data: JSON.stringify({"tracker": tracker}),
//             contentType: 'application/json',
//             success: function(response) {
//                 console.log(response)
//                 //location.replace("view-ombi-details.ejs")
//             // if(typeof(response) === "string"){response = JSON.parse(response)}
//             }
//         });
//     alert("fhf")
// }