


function PullStreets(){
    // alert('Inapakia kutoka kwenye orodha ya mikoa, Tafadhali subiri')
    $("#firstbtn").hide();
    $("#pakiabtn").show();
    $.ajax({
        url: "/VutaMitaa",
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
        url: "/MitaaList"+(parameters ? '?'+parameters : ''),
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            // if(typeof(response) === "string"){response = JSON.parse(response)}
            // console.log(response)
           var streets = response.streets;
           var pages = response.pagination.pages;
           var per_page = response.pagination.per_page;
           var current = response.pagination.current;
           var total = response.pagination.total;
           var first_item = per_page * (current - 1) + 1;

            $("#customerTable").find('tbody').empty();
            $(".caption").html(`<span>Idadi ya Mitaa iliyopatikana ${total}.</span> <span class='justify-content-end'>Ukurasa ${current}  kati ya ${pages}     [${first_item} hadi ${first_item - 1 + streets.length}] </span>`);
            for (var i=0; i < streets.length; i++) {
                var row = '<tr> <td scope="row">' + (first_item + i) + "</td>"; 
                row = row + '<td class="date">' + streets[i].StreetName + "</td>";
                // row = row + '<td class="id" style="display:none;"><a href="javascript:void(0);" class="fw-medium link-primary"> ' + response[i].zoneName + ' </a></td>';
                row = row + '<td class="date">' + streets[i].StreetCode + "</td>";
                row = row + '<td class="date">' + streets[i].WardName + "</td>";
                row = row + '<td class="date">' + streets[i].LgaName + "</td>";
                row = row + '<td class="status"><span class="text-uppercase"> ' + streets[i].RegionName + ' </span></td>';
                row = row +'</tr>';
                $('#customerTable').append(row);
            }
            paginate("Mitaa", pages, current, per_page);
        }
    });
}
// , 5000);
window.onload = nata;