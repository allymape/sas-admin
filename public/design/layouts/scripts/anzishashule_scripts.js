function nata() {
  ajaxRequest(`/MaombiKuanzishaShuleList`, "GET", (response) => {
    const { statusCode  , data , pagination} = response
          if(statusCode == 300){
           const { url, pages, current, per_page , total } = pagination;
              $("#tasksTable").find("tbody").empty();

              $("#tasksTable").closest(".card-body")
                .append(`<div class="ribbon-three ribbon-three-info">
              <span class="badge">${total}</span>
              </div>`);
              for (var i = 0; i < data.length; i++) {
                var row = '<tr>';
                row = row +'<td class="id" id="tracker"><a href="TaarifaOmbi/' +
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
                  ' <td class="due_date  text-uppercase"  title=" ' +
                  data[i].created_at +
                  ' "> ' +
                  diffForHumans(data[i].created_at) +
                  " </td>";
                row =
                  row +
                  `<td class="priority">
                  <span class="badge ${ data[i].is_approved == 0 ?  'bg-warning' : ''}
                        ${ data[i].is_approved == 1 ?  'bg-primary' : ''}
                        ${ data[i].is_approved == 2 ?  'bg-success' : ''}
                        ${ data[i].is_approved == 3 ?  'bg-danger' : ''}"
                        >
                        ${ data[i].is_approved == 0 ?  'Jipya' : ''}
                        ${ data[i].is_approved == 1 ?  'Linashughulikiwa' : ''}
                        ${ data[i].is_approved == 2 ?  'Limekubaliwa' : ''}
                        ${ data[i].is_approved == 3 ?  'Limekataliwa' : ''}
                  </span>
                  </td>`;
                if ($("#barua-column").is(":visible")) {
                  if (data[i].folio) {
                    row += `
                            <td class="text-center">
                                <a target="_blank" title="Barua" data-bs-toggle="tooltip" href="/barua/${data[i].tracking_number}">
                                <i class="ri-file-pdf-fill ri-2x align-bottom me-1 text-danger"></i>
                                </a>
                           </td>`;
                  }
                }
                row = row + "</tr>";
                $("#tasksTable").append(row);
                
                paginate(url, pages, current, per_page); //add pagination
              }
          }else{

          }
  });
}
window.onload = nata;
