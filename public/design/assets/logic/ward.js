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
    PullWards,
    "Pakia Taarifa",
    "warning",
    "Hautaweza kurudisha nyuma kitendo hiki.",
    "Una uhakika?"
  );
});

function PullWards(){
    // alert('Inapakia kutoka kwenye orodha ya mikoa, Tafadhali subiri')
    $("#firstbtn").hide();
    $("#pakiabtn").show();
    $.ajax({
        url: "/VutaKata",
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            if (response.statusCode == 306) {
              alertMessage(
                `Imeshindikana`,
                `Imeshindikana kupakia taarifa za Kata mpya, Tafadhali wasiliana na Admin wa Mfumo!`,
                `warning`
              );
            }
            if (response.statusCode == 300) {
              alertMessage(
                `Hongera`,
                `Umefanikiwa kupakuwa taarifa za Kata kikamilifu!`
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
        url: "/WardList"+(parameters ? '?'+parameters : ''),
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            // if(typeof(response) === "string"){response = JSON.parse(response)}
           // console.log(response)
            var wards = response.wards;
            var pages = response.pagination.pages;
            var per_page = response.pagination.per_page;
            var current = response.pagination.current;
            var total = response.pagination.total;
            var first_item = per_page * (current - 1) + 1;
            $("#customerTable").find('tbody').empty();
            $(".caption").html(`<span>Idadi ya Kata zilizopatikana ${total}.</span> <span class='justify-content-end'>Ukurasa ${current}  kati ya ${pages}     [${first_item} hadi ${first_item - 1 + wards.length}] </span>`);
            for (var i=0; i < wards.length; i++) {
                var row = '<tr> <td scope="row">' + (first_item + i) + "</td>"; 
                row = row + '<td class="date">' + wards[i].WardName + "</td>";
                // row = row + '<td class="id" style="display:none;"><a href="javascript:void(0);" class="fw-medium link-primary"> ' + response[i].zoneName + ' </a></td>';
                row = row + '<td class="date">' + wards[i].WardCode + "</td>";
  
                row = row + '<td class="date">' + wards[i].LgaName + "</td>";
                row = row + '<td class="status"><span class="text-uppercase"> ' + wards[i].RegionName + ' </span></td>';
                row = row + '<td class="status"><span> ' + formatDate(wards[i].CreatedAt) + ' </span></td>';
                row = row + '<td class="status"><span> ' + formatDate(wards[i].UpdatedAt)+ '  </span></td>';
                row = row +'</tr>';
                $('#customerTable').append(row);
            }
             paginate("Kata", pages, current, per_page);
        }
    });
}
// , 5000);
window.onload = nata;