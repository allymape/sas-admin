$('#angalia-zote').on('click' , function(){
    var hiddenElements = $("#list-by-label .hidden");
        if(hiddenElements.is(':visible')){
          $("#list-by-label .hidden").slideUp(1000);
          $(this)
            .find("a")
            .html(
              `Angalia Zote <i class="mdi mdi-arrow-down-bold-outline"></i>`
            );
        }else{
          $("#list-by-label .hidden").slideDown(1000);
          $(this)
            .find("a")
            .html(
              `Angalia Kiasi <i class="mdi mdi-arrow-up-bold-outline"></i>`
            );
        }
});

// $("#expand-box-height").on('click' , function(){
//      const height = $('#vertical-swiper').height()
//            $("#vertical-swiper").css("height" , height == 300 ? 500 : 300);
// });



const displaySchoolByCategoriesChat = (selector , callback) => {
  ajaxRequest("/SchoolsSummaryByRegionAndCategories", "GET", (response) => {
    // console.log(response.data);
    if (response.statusCode == 300) {
      const labels = [];
      const allData = [];
      const awaliData = [];
      const msingiData = [];
      const sekondariData = [];
      const vyuoData = [];
      const formattedResults = response.data;
      const schoolTypes = ['Shule za Awali Pekee', "Shule za Awali na Msingi" , "Shule za Sekondari", "Vyuo vya Ualimu"];
      const pieChartData = [];
      const listByLabel = $('#list-by-label')
            listByLabel.empty();
      var  i = 0;
      pieChartData[0] = 0; //Awali pekee
      pieChartData[1] = 0; //Awali na Msingi
      pieChartData[2] = 0; // Sekondari
      pieChartData[3] = 0; // Vyuo vya Ualimu
      for (const region in formattedResults) {
        const regionData = formattedResults[region];
        i++;
        if(i > 10) $("#angalia-zote").show();
        labels.push(region);
        allData.push(regionData.total);
         listByLabel.append(`<li class="py-1 ${i > 20 ? 'hidden' : ''} " ${i > 20 ? 'style=display:none' : ''}>
                              <a href="#" class="text-${
                                regionData.total == response.maxValue ? 'success fw-bolder fst-italic' : 
                                (regionData.total == response.minValue ? 'danger fw-bolder fst-italic' : 'muted')
                              }">
                                ${region} <span class="float-end">(${regionData.total})</span>
                              </a>
                            </li>`);
        for (const category in regionData.categories) {
          const categoryCount = regionData.categories[category];
          //  console.log(category , categoryCount);
          switch (Number(category)) {
            case 1:
              awaliData.push(categoryCount);
              pieChartData[0] += categoryCount;
              break;
            case 2:
              msingiData.push(categoryCount);
              pieChartData[1] += categoryCount;
              break;
            case 3:
              sekondariData.push(categoryCount);
              pieChartData[2] += categoryCount;
              break;
            case 4:
              vyuoData.push(categoryCount);
              pieChartData[3] += categoryCount;
              break;
            default:
              break;
          }
        }
      }
     
      const series = [
        {
          name: "Shule Zote",
          type: "bar",
          data: allData,
        },
        {
          name: schoolTypes[0],
          type: "line",
          data: awaliData,
        },
        {
          name: schoolTypes[1],
          type: "line",
          data: msingiData,
        },
        {
          name: schoolTypes[2],
          type: "line",
          data: sekondariData,
        },
        {
          name: schoolTypes[3],
          type: "line",
          data: vyuoData,
        },
      ];
      createChart(labels, series, selector);
      createPieChart(schoolTypes, pieChartData, "aina-za-shule-kwa-asilimia");
    }
    callback(response.statusCode)
  });
};

window.onload = displaySchoolByCategoriesChat("school_registration_charts" , () => {});
// get total number of schools by year of registration
function displayTotalSchoolsByYearOfRegistration(){
  ajaxRequest(`/NumberOfSchoolByYearOfRegistration` , 'GET' , (response) => {
        if(response.statusCode == 300){
          const responseData = response.data;
          const individualLabels = responseData.individualData.map((item) => item.label);
          const individualData = responseData.individualData.map((item) => item.total);
          const cumulativeLabels = responseData.cumulativeData.map((item) => item.label);
          const cumulativeData = responseData.cumulativeData.map((item) => item.total);
          const seriesIndividual = [
            {
              type: "area",
              data: individualData,
            },
          ];
          createChart(individualLabels, seriesIndividual, "school_registration_by_years" , false , true);

           const seriesCumulative = [
            {
              type: "area",
              data: cumulativeData,
            },
          ];
          createChart(cumulativeLabels, seriesCumulative, "school_registration_by_years_trend" , false , true);
        }
  })
}
// 
window.onload = displayTotalSchoolsByYearOfRegistration();
// Extract Colors
function getChartColorsArray(e) {
  if (null !== document.getElementById(e)) {
    var t = document.getElementById(e).getAttribute("data-colors");
    if (t)
      return (t = JSON.parse(t)).map(function (e) {
        var t = e.replace(" ", "");
        if (-1 === t.indexOf(",")) {
          var o = getComputedStyle(document.documentElement).getPropertyValue(
            t
          );
          return o || t;
        }
        e = e.split(",");
        return 2 != e.length
          ? t
          : "rgba(" +
              getComputedStyle(document.documentElement).getPropertyValue(
                e[0]
              ) +
              "," +
              e[1] +
              ")";
      });
    console.warn("data-colors atributes not found on", e);
  }
}
// Create Bar Chart
const createChart = (labels, series, selector , dataLabelEnabled = true , tooltipShared = false) => {
  var linechartSchoolsColors = getChartColorsArray(selector);
  linechartSchoolsColors &&
    ((options = {
      series: series,
      chart: {
        id: "realtime",
        animations: {
          enabled: true,
          easing: "linear",
          dynamicAnimation: {
            speed: 1000,
          },
        },
        height: 370,
        type: "line",
        toolbar: { show: 1 },
      },
      stroke: { curve: "straight", dashArray: [0, 0, 8], width: [2, 0, 2.2] },
      fill: { opacity: [0.3, 0.8, 1] },
      markers: { size: [0, 0, 0], strokeWidth: 2, hover: { size: 4 } },
      xaxis: {
        categories: labels,
        axisTicks: { show: !1 },
        axisBorder: { show: !1 },
        labels: {
          rotate: labels.length > 10 ? -45 : 360,
          rotateAlways: true,
        },
      },
      dataLabels: {
        enabled: dataLabelEnabled,
        offsetX: 0,
        offsetY: -10,
        style: {
          fontSize: "10px",
          colors: ["#405189"],
          backgroundOpacity: 0,
        },
        formatter: function (val, { seriesIndex, dataPointIndex }) {
          if (seriesIndex === 0) {
            return val.toString();
          } else {
            return "";
          }
        },
      },
      grid: {
        show: !0,
        xaxis: { lines: { show: !0 } },
        yaxis: { lines: { show: !1 } },
        padding: { top: 0, right: -2, bottom: 15, left: 10 },
      },
      legend: {
        show: !0,
        horizontalAlign: "center",
        offsetX: 0,
        offsetY: -5,
        markers: { width: 9, height: 9, radius: 6 },
        itemMargin: { horizontal: 10, vertical: 0 },
      },
      plotOptions: {
        bar: { columnWidth: "70%", barHeight: "70%" },
      },
      colors: linechartSchoolsColors,
      tooltip: {
        shared: tooltipShared,
        // theme: 'dark',
        custom: !tooltipShared
          ? function ({ series, seriesIndex, dataPointIndex, w }) {
              var tooltipContent = `<ul class='list-group' style='font-family: Helvetica, Arial, sans-serif; font-size: 12px;'>
                                      <li class='list-group-item bg-light p-2'>
                                          ${w.globals.categoryLabels[dataPointIndex]}
                                      </li>`;
              // Display information for the bar series
              tooltipContent += `<li class='list-group-item p-2'>
                                    <span class="mdi mdi-chart-arc" style='color: ${w.globals.colors[0]}!important'></span>
                                    ${w.globals.seriesNames[0]}: ${series[0][dataPointIndex]}
                                    </li>
                                    <li class='list-group-item p-2'>
                                      <span class="mdi mdi-chart-arc" style='color: ${w.globals.colors[1]}!important'></span>
                                    ${w.globals.seriesNames[1]}: ${typeof series[1][dataPointIndex] !== 'undefined' ? series[1][dataPointIndex] : 0}
                                    </li>
                                    <li class='list-group-item p-2'>
                                      <span class="mdi mdi-chart-arc" style='color: ${w.globals.colors[2]}!important'></span>
                                    ${w.globals.seriesNames[2]}: ${typeof series[2][dataPointIndex] !== 'undefined' ? series[2][dataPointIndex] : 0}
                                    </li>
                                    <li class='list-group-item p-2'>
                                      <span class="mdi mdi-chart-arc" style='color: ${w.globals.colors[3]}!important'></span>
                                    ${w.globals.seriesNames[3]}: ${typeof series[3][dataPointIndex] !== 'undefined' ? series[3][dataPointIndex] : 0}
                                    </li>
                                    <li class='list-group-item p-2'>
                                      <span class="mdi mdi-chart-arc" style='color: ${w.globals.colors[4]}!important'></span>
                                    ${w.globals.seriesNames[4]}: ${typeof series[4][dataPointIndex] !== 'undefined' ? series[4][dataPointIndex] : 0}
                                    </li>
                                    `;
              return tooltipContent + "</ul>";
            }
          : ({ series, seriesIndex, dataPointIndex, w }) => {
              var tooltipContent = `<ul class='list-group' style='font-family: Helvetica, Arial, sans-serif; font-size: 12px;'>
                                      <li class='list-group-item p-2 bg-light'>
                                      <span class="">
                                      Total : ${series[0][dataPointIndex]}
                                      </span>
                                      </li>
                                      </ul>`;
              return tooltipContent;
            },
        y: [
          {
            formatter: function (e) {
              return void 0 !== e ? e.toFixed(0) : e;
            },
          },
          {
            formatter: function (e) {
              return void 0 !== e ? "" + e.toFixed(0) : e;
            },
          },
          {
            formatter: function (e) {
              return void 0 !== e ? e.toFixed(0) : e;
            },
          },
          {
            formatter: function (e) {
              return void 0 !== e ? e.toFixed(0) : e;
            },
          },
          {
            formatter: function (e) {
              return void 0 !== e ? e.toFixed(0) : e;
            },
          },
        ],
      },
    }),
    (chart = new ApexCharts(
      document.querySelector(`#${selector}`),
      options
    )).render());
};

  // window.setInterval(function () {
  //       getNewSeries(lastDate, {
  //         min: 10,
  //         max: 90
  //       })
      
  //       chart.updateSeries([{
  //         data: data
  //       }])
  //     }, 1000)

$("#view-chart-modal").on("click", function () {
  
  displaySchoolByCategoriesChat("modal-school_registration_charts" , (code) => {
      if(code == 300){
        $("#chartModal").find('.card-title').html(`<h4>${$('#chart-summary-title').text()}</h4>`);
        modal("chartModal", true);
      }
  });
});

//  Create Pie Chart
const createPieChart = (label , series , selector) => {
  var options,
    chart,
    chartDonutBasicColors = getChartColorsArray(selector);
  chartDonutBasicColors &&
    ((options = {
      series: series,
      labels: label,
      chart: { height: 500, type: "donut" },
      legend: {
        position: "bottom",
        verticalAlign: "middle",
        horizontalAlign: "center",
      },
      fill: { type: "gradient_" },
      stroke: { show: !0 },
      dataLabels: {
        dropShadow: { enabled: !0 },
      },
      colors: chartDonutBasicColors,
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
              },
            },
            dataLabels: {
              formatter: function (val, { series }) {
                var total = series.reduce(function (acc, data) {
                  return acc + data;
                }, 0);
                return total.toLocaleString();
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    }),
    (chart = new ApexCharts(
      document.querySelector(`#${selector}`),
      options
    )).render());
}


// var worldemapmarkers,
//   vectorMapWorldMarkersColors = getChartColorsArray("sales-by-locations");
// vectorMapWorldMarkersColors &&
//   (worldemapmarkers = new jsVectorMap({
//     map: "world_merc",
//     selector: "#sales-by-locations",
//     zoomOnScroll: !1,
//     zoomButtons: !1,
//     selectedMarkers: [0, 5],
//     regionStyle: {
//       initial: {
//         stroke: "#9599ad",
//         strokeWidth: 0.25,
//         fill: vectorMapWorldMarkersColors[0],
//         fillOpacity: 1,
//       },
//     },
//     markersSelectable: !0,
//     markers: [
//       { name: "Palestine", coords: [31.9474, 35.2272] },
//       { name: "Russia", coords: [61.524, 105.3188] },
//       { name: "Canada", coords: [56.1304, -106.3468] },
//       { name: "Greenland", coords: [71.7069, -42.6043] },
//     ],
//     markerStyle: {
//       initial: { fill: vectorMapWorldMarkersColors[1] },
//       selected: { fill: vectorMapWorldMarkersColors[2] },
//     },
//     labels: {
//       markers: {
//         render: function (e) {
//           return e.name;
//         },
//       },
//     },
//   }));

var overlay, swiper = new Swiper(".vertical-swiper", {
    slidesPerView: 6,
    spaceBetween: 10,
    mousewheel: !0,
    loop: !0,
    direction: "vertical",
    autoplay: { delay: 2000, disableOnInteraction: !0 },
  }),

  layoutRightSideBtn = document.querySelector(".layout-rightside-btn");
layoutRightSideBtn &&
  (document.querySelectorAll(".layout-rightside-btn").forEach(function (e) {
    var t = document.querySelector(".layout-rightside-col");
    e.addEventListener("click", function () {
      t.classList.contains("d-block")
        ? (t.classList.remove("d-block"), t.classList.add("d-none"))
        : (t.classList.remove("d-none"), t.classList.add("d-block"));
    });
  }),
  window.addEventListener("resize", function () {
    var e = document.querySelector(".layout-rightside-col");
    e &&
      document.querySelectorAll(".layout-rightside-btn").forEach(function () {
        window.outerWidth < 1699 || 3440 < window.outerWidth
          ? e.classList.remove("d-block")
          : 1699 < window.outerWidth && e.classList.add("d-block");
      });
  }),
  (overlay = document.querySelector(".overlay")) &&
    document.querySelector(".overlay").addEventListener("click", function () {
      1 ==
        document
          .querySelector(".layout-rightside-col")
          .classList.contains("d-block") &&
        document
          .querySelector(".layout-rightside-col")
          .classList.remove("d-block");
    })),
  window.addEventListener("load", function () {
    var e = document.querySelector(".layout-rightside-col");
    e &&
      document.querySelectorAll(".layout-rightside-btn").forEach(function () {
        window.outerWidth < 1699 || 3440 < window.outerWidth
          ? e.classList.remove("d-block")
          : 1699 < window.outerWidth && e.classList.add("d-block");
      });
  });

