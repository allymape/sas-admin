

$("#create-btn").on("click", function () {
  confirmAction(
    PullStreets,
    "Pakia Taarifa",
    "warning",
    "Hautaweza kurudisha nyuma kitendo hiki.",
    "Una uhakika?"
  );
});
function PullStreets(){
    showLoadingSpinner()
    $.ajax({
      url: "/VutaMitaa",
      type: "GET",
      contentType: "application/json",
      success: function (response) {
        hideLoadingSpinner();
        if (response.statusCode == 306) {
          alertMessage(
            `Imeshindikana`,
            `Imeshindikana kupakia taarifa za Mitaa mipya, Tafadhali wasiliana na Admin wa Mfumo!`,
            `warning`
          );
        }
        if (response.statusCode == 300) {
          alertMessage(
            `Hongera`,
            `Umefanikiwa kupakuwa taarifa za Mitaa kikamilifu!`
          );
          nata();
        }
      },
      error: function (request, status, error) {
        console.log(request, status, error);
        hideLoadingSpinner();
        alertMessage(
          `Tatizo`,
          `Haikuweza kuvuta taarifa za Mitaa, kuna itilafu wasiliana na Admin!`,
          `error`
        );
      },
    });
}

//list of zones
function nata(){
    var url = window.location.href;
    var parameters = url.split("?")[1] || "";
    showLoadingSpinner();
    $.ajax({
      url: "/MitaaList" + (parameters ? "?" + parameters : ""),
      type: "GET",
      contentType: "application/json",
      success: function (response) {
        hideLoadingSpinner();
        // if(typeof(response) === "string"){response = JSON.parse(response)}
        // console.log(response)
        var streets = response.streets;
        var pages = response.pagination.pages;
        var per_page = response.pagination.per_page;
        var current = response.pagination.current;
        var total = response.pagination.total;
        var first_item = per_page * (current - 1) + 1;

        $("#customerTable").find("tbody").empty();
        $(".caption").html(
          `<span>Idadi ya Mitaa iliyopatikana ${total}.</span> <span class='justify-content-end'>Ukurasa ${current}  kati ya ${pages}     [${first_item} hadi ${
            first_item - 1 + streets.length
          }] </span>`
        );
        for (var i = 0; i < streets.length; i++) {
          var row = '<tr> <td scope="row">' + (first_item + i) + "</td>";
          row = row + '<td class="date">' + streets[i].StreetName + "</td>";
          // row = row + '<td class="id" style="display:none;"><a href="javascript:void(0);" class="fw-medium link-primary"> ' + response[i].zoneName + ' </a></td>';
          row = row + '<td class="date">' + streets[i].StreetCode + "</td>";
          row = row + '<td class="date">' + streets[i].WardName + "</td>";
          row = row + '<td class="date">' + streets[i].LgaName + "</td>";
          row =
            row +
            '<td class="status"><span class="text-uppercase"> ' +
            streets[i].RegionName +
            " </span></td>";
          row =
            row +
            '<td class="status"><span> ' +
            formatDate(streets[i].CreatedAt) +
            " </span></td>";
          row =
            row +
            '<td class="status"><span> ' +
            formatDate(streets[i].UpdatedAt) +
            " </span></td>";
          row = row + "</tr>";
          $("#customerTable").append(row);
        }
        paginate("Mitaa", pages, current, per_page);
      },
      error: function (request, status, error) {
        console.log(request, status, error);
        hideLoadingSpinner();
      },
    });
}
// , 5000);
window.onload = nata;