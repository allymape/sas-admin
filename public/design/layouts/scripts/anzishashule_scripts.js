function nata() {
  ajaxRequest(`/MaombiKuanzishaShuleList`, "GET", (response) => {
    const { statusCode , message , data} = response
          if(statusCode == 300){
            console.log(data)
              $("#tasksTable").find("tbody").empty();
              for (var i = 0; i < data.length; i++) {
                var row =
                  '<tr> <th scope="row">' +
                  '<div class="form-check">' +
                  '<input class="form-check-input" type="checkbox" name="chk_child" value="option1">' +
                  "</div>" +
                  "</th>";
                row =
                  row +
                  '<td class="id" id="tracker"><a href="TaarifaOmbi/' +
                  data[i].tracking_number +
                  '" class="fw-medium link-primary"> ' +
                  data[i].tracking_number +
                  " </a></td>";
                row =
                  row +
                  '<td class="project_name"><a href="TaarifaOmbi/' +
                  data[i].tracking_number +
                  '" class="fw-medium link-primary"> ' +
                  data[i].school_name +
                  " </a></td>";
                row =
                  row +
                  "<td>" +
                  '<div class="d-flex">' +
                  '<div class="flex-grow-1 tasks_name"> ' +
                  data[i].LgaName +
                  " </div>" +
                  '<div class="flex-shrink-0 ms-4">' +
                  '<ul class="list-inline tasks-list-menu mb-0">' +
                  '<li class="list-inline-item"><a href="TaarifaOmbi/' +
                  data[i].tracking_number +
                  '"><i class="ri-eye-fill align-bottom me-2 text-muted"></i></a></li>' +
                  "</ul>" +
                  "</div>" +
                  "</div>" +
                  "</td>";
                row =
                  row +
                  '<td class="status"><span class=""> ' +
                  data[i].RegionName +
                  " </span></td>";
                row =
                  row +
                  ' <td class="due_date badge badge-soft-secondary text-uppercase"  title=" ' +
                  data[i].created_at +
                  ' "> ' +
                  diffForHumans(data[i].created_at) +
                  " </td>";
                row =
                  row +
                  '<td class="priority"><span class="badge bg-danger text-uppercase">Jipya</span></td>';
                if( $('#barua-column').is(':visible')){
                  row += `
                        <td class="text-center">
                            <a target="_blank" title="Barua" data-bs-toggle="tooltip" href="/usajiliWaShuleBarua/${data[i].tracking_number}">
                            <i class="ri-file-pdf-fill ri-2x align-bottom me-1 text-danger"></i>
                            </a>
                      </td>`;
                   }
                row = row+ "</tr>";
                $("#tasksTable").append(row);
              }
          }else{

          }
  });
}
window.onload = nata;
