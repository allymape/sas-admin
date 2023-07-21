
function nata(){
    ajaxRequest(`/MaombiKuanzishaShuleList` , 'GET' , (response) => {
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
                            '</ul>'+
                            '</div>'+
                            '</div>'+
                            '</td>';
                row = row + '<td class="status"><span class=""> ' + response[i].RegionName + ' </span></td>';
                row = row + ' <td class="due_date badge badge-soft-secondary text-uppercase"  title=" ' + response[i].created_at + ' "> ' + response[i].remain_days + ' </td>';
                row = row + '<td class="priority"><span class="badge bg-danger text-uppercase">Jipya</span></td>';
                            '</tr>';
                $('#tasksTable').append(row);
            }
    });
   
}
window.onload = nata;
