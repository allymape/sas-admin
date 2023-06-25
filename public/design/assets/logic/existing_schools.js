$("#migration-btn").on("click", function () {
  confirmAction(
    PullSchools,
    "Pakia Shule ambazo silishasajiliwa",
    "warning",
    "Hautaweza kurudisha nyuma kitendo hiki.",
    "Una uhakika?"
  );
});
function PullSchools(){
    // showLoadingSpinner()
    $.ajax({
      url: "/VutaShule",
      type: "GET",
      contentType: "application/json",
      success: function (response) {
        // hideLoadingSpinner();
        if (response.statusCode == 306) {
          alertMessage(
            `Imeshindikana`,
            `Imeshindikana kupakia taarifa za Shule, Tafadhali wasiliana na Admin wa Mfumo!`,
            `warning`
          );
        }
        if (response.statusCode == 300) {
          alertMessage(
            `Hongera`,
            `Umefanikiwa kuingiza taarifa za shule ambazo zilishasajiliwa kwa ukamilifu!`
          );
        }
      },
      error: function (request, status, error) {
        console.log(request, status, error);
        // hideLoadingSpinner();
        alertMessage(
          `Tatizo`,
          `Haikuweza kuvuta taarifa za Shule, kuna itilafu wasiliana na Admin!`,
          `error`
        );
      },
    });
}

