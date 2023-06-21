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

$("#create-btn").on("click", function () {
  confirmAction(
    PullCouncils,
    "Pakia Taarifa",
    "warning",
    "Hautaweza kurudisha nyuma kitendo hiki.",
    "Una uhakika?"
  );
});

function PullCouncils(){
  
    $.ajax({
        url: "/VutaWilaya",
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
           if (response.statusCode == 306) {
             alertMessage(
               `Imeshindikana`,
               `Imeshindikana kupakia taarifa za Halmashauri mpya, Tafadhali wasiliana na Admin wa Mfumo!`,
               `warning`
             );
           }
           if (response.statusCode == 300) {
             alertMessage(
               `Hongera`,
               `Umefanikiwa kupakuwa taarifa za Halmashauri kikamilifu!`
             );
             nata();
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
                row = row + '<td class="status"><span> ' + formatDate(councils[i].createdAt) + ' </span></td>';
                row = row + '<td class="status"><span> ' + formatDate(councils[i].updatedAt)+ ' </span></td>';
                row = row +'</tr>';
                $('#customerTable').append(row);
            }
            paginate("Halmashauri", pages, current, per_page);
        }
    });
}
// , 5000);
window.onload = nata;