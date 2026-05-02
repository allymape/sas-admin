const TREND_WINDOW_SIZE = 10;
const chartInstances = {};
const yearWindowState = {
  limit: TREND_WINDOW_SIZE,
  offset: 0,
  totalYears: 0,
  hasOlder: false,
  hasNewer: false,
  isLoading: false,
  startYear: null,
  endYear: null,
};
const combinedYearsState = {
  labels: [],
  individualValues: [],
  cumulativeValues: [],
};
const REGION_CATEGORY_CHART_CACHE_MS = 60000;
let regionsCategoryChartCache = {
  fetchedAt: 0,
  response: null,
};

const setYearsChartsLoading = (isLoading) => {
  if (isLoading) {
    $("#years-combined-chart-loading").show();
    $("#school_registration_years_combined_chart").hide();
    return;
  }

  $("#years-combined-chart-loading").hide();
  $("#school_registration_years_combined_chart").show();
};

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



const updateTrendWindowControls = () => {
  const hasCustomRange =
    Number.isFinite(yearWindowState.startYear) &&
    Number.isFinite(yearWindowState.endYear);
  const total = combinedYearsState.labels.length;
  const startLabel = total ? combinedYearsState.labels[0] : null;
  const endLabel = total ? combinedYearsState.labels[total - 1] : null;
  const rangeLabel = hasCustomRange
    ? `Miaka: ${yearWindowState.startYear} - ${yearWindowState.endYear}`
    : (startLabel && endLabel ? `Miaka: ${startLabel} - ${endLabel}` : "");

  $("#trend-window-range").text(rangeLabel);
  $("#trend-prev-window").prop(
    "disabled",
    hasCustomRange || !yearWindowState.hasOlder || yearWindowState.isLoading
  );
  $("#trend-next-window").prop(
    "disabled",
    hasCustomRange || !yearWindowState.hasNewer || yearWindowState.isLoading
  );
};

const initializeTrendRangeYearOptions = () => {
  const startSelect = $("#trend-start-year");
  const endSelect = $("#trend-end-year");
  if (!startSelect.length || !endSelect.length) return;

  const currentYear = new Date().getFullYear();
  const minYear = 1970;
  const startOptions = ['<option value="">Kuanzia</option>'];
  const endOptions = ['<option value="">Hadi</option>'];

  for (let year = currentYear; year >= minYear; year -= 1) {
    startOptions.push(`<option value="${year}">${year}</option>`);
    endOptions.push(`<option value="${year}">${year}</option>`);
  }

  startSelect.html(startOptions.join(""));
  endSelect.html(endOptions.join(""));
};

const parseYearFromLabel = (labelValue) => {
  const label = String(labelValue || "").trim();
  const direct = Number.parseInt(label, 10);
  if (Number.isFinite(direct)) return direct;
  const matched = label.match(/\b(19|20)\d{2}\b/);
  return matched ? Number.parseInt(matched[0], 10) : NaN;
};

const createCombinedYearsChart = (labels, individualValues, cumulativeValues) => {
  const selector = "school_registration_years_combined_chart";
  const chartColors = getChartColorsArray(selector) || ["#ef4444", "#2563eb"];
  const chartElement = document.querySelector(`#${selector}`);
  if (!chartElement) return;

  const options = {
    series: [
      {
        name: "Idadi ya Shule kwa Mwaka Ulioanzishwa",
        type: "bar",
        data: individualValues,
      },
      {
        name: "Trend ya Jumla ya Shule Zilizosajiliwa",
        type: "line",
        data: cumulativeValues,
      },
    ],
    chart: {
      height: 430,
      type: "line",
      toolbar: { show: true },
    },
    stroke: {
      width: [0, 3],
      curve: "smooth",
    },
    fill: {
      opacity: [0.85, 0.16],
      type: ["solid", "solid"],
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: [0, 3],
      strokeWidth: 2,
      hover: { size: 5 },
    },
    colors: chartColors,
    xaxis: {
      categories: labels,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        rotate: labels.length > 10 ? -35 : 0,
        rotateAlways: labels.length > 10,
      },
    },
    yaxis: [
      {
        title: { text: "Idadi kwa Mwaka" },
        labels: {
          formatter: (value) => `${Math.round(Number(value) || 0)}`,
        },
      },
      {
        opposite: true,
        title: { text: "Jumla Zilizosajiliwa" },
        labels: {
          formatter: (value) => `${Math.round(Number(value) || 0)}`,
        },
      },
    ],
    plotOptions: {
      bar: {
        columnWidth: "42%",
        borderRadius: 4,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      offsetY: 4,
    },
    grid: {
      borderColor: "#e7edf6",
      strokeDashArray: 3,
      padding: { left: 10, right: 10, top: 8, bottom: 6 },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => `${Math.round(Number(value) || 0)}`,
      },
    },
  };

  if (chartInstances[selector]) {
    chartInstances[selector].destroy();
  }

  const chart = new ApexCharts(chartElement, options);
  chart.render();
  chartInstances[selector] = chart;
};

const initializeCombinedYearsWindow = (individualData = [], cumulativeData = []) => {
  const byYear = new Map();

  (individualData || []).forEach((item) => {
    const year = String(item.label || "");
    if (!year) return;
    if (!byYear.has(year)) byYear.set(year, { label: year, individual: 0, cumulative: 0 });
    byYear.get(year).individual = Number(item.total) || 0;
  });

  (cumulativeData || []).forEach((item) => {
    const year = String(item.label || "");
    if (!year) return;
    if (!byYear.has(year)) byYear.set(year, { label: year, individual: 0, cumulative: 0 });
    byYear.get(year).cumulative = Number(item.total) || 0;
  });

  const records = [...byYear.values()];
  const allYearsNumeric = records.every((item) => !Number.isNaN(Number(item.label)));
  if (allYearsNumeric) {
    records.sort((a, b) => Number(a.label) - Number(b.label));
  } else {
    records.sort((a, b) => String(a.label).localeCompare(String(b.label)));
  }

  combinedYearsState.labels = records.map((item) => item.label);
  combinedYearsState.individualValues = records.map((item) => item.individual);
  combinedYearsState.cumulativeValues = records.map((item) => item.cumulative);

  createCombinedYearsChart(
    combinedYearsState.labels,
    combinedYearsState.individualValues,
    combinedYearsState.cumulativeValues
  );
  yearWindowState.hasRenderedData = combinedYearsState.labels.length > 0;
  updateTrendWindowControls();
};

const loadYearsWindow = (offset = 0, retryCount = 0, forceRange = false) => {
  const nextOffset = Math.max(0, Number(offset) || 0);
  if (yearWindowState.isLoading) return;
  const hasCustomRange =
    Number.isFinite(yearWindowState.startYear) &&
    Number.isFinite(yearWindowState.endYear);
  const currentYear = new Date().getFullYear();
  const customRangeLimit = hasCustomRange
    ? Math.max(1, (yearWindowState.endYear - yearWindowState.startYear) + 1)
    : yearWindowState.limit;
  const isLatestTenYearsRange =
    hasCustomRange &&
    yearWindowState.endYear === currentYear &&
    yearWindowState.startYear === (currentYear - (TREND_WINDOW_SIZE - 1));
  const shouldSendServerRange = hasCustomRange && (forceRange || !isLatestTenYearsRange);
  const effectiveOffset = hasCustomRange ? 0 : nextOffset;

  yearWindowState.isLoading = true;
  setYearsChartsLoading(true);
  updateTrendWindowControls();

  $.ajax({
    url: `/NumberOfSchoolByYearOfRegistration`,
    type: "GET",
    dataType: "json",
    data: {
      limit: customRangeLimit,
      offset: effectiveOffset,
      start_year: shouldSendServerRange ? yearWindowState.startYear : undefined,
      end_year: shouldSendServerRange ? yearWindowState.endYear : undefined,
    },
    success: function (response) {
      yearWindowState.isLoading = false;

      if (response.statusCode == 300) {
        const responseData = response.data || {};
        const pagination = responseData.pagination || {};
        const hasServerPagination =
          Object.prototype.hasOwnProperty.call(pagination, "hasOlder") &&
          Object.prototype.hasOwnProperty.call(pagination, "hasNewer");

        const allIndividual = responseData.individualData || [];
        const allCumulative = responseData.cumulativeData || [];

        let individualData = allIndividual;
        let cumulativeData = allCumulative;

        if (hasServerPagination) {
          yearWindowState.offset = Number(pagination.offset || 0);
          yearWindowState.totalYears = Number(pagination.totalYears || 0);
          yearWindowState.hasOlder = Boolean(pagination.hasOlder);
          yearWindowState.hasNewer = Boolean(pagination.hasNewer);
        } else {
          // Fallback for legacy endpoint that returns full-year arrays without pagination metadata.
          const totalYears = allIndividual.length;
          const offset = Math.max(0, nextOffset);
          const windowSize = yearWindowState.limit;
          const endIndex = Math.max(0, totalYears - offset);
          const startIndex = Math.max(0, endIndex - windowSize);

          individualData = allIndividual.slice(startIndex, endIndex);
          cumulativeData = allCumulative.slice(startIndex, endIndex);

          yearWindowState.offset = offset;
          yearWindowState.totalYears = totalYears;
          yearWindowState.hasOlder = offset + windowSize < totalYears;
          yearWindowState.hasNewer = offset > 0;
        }

        const hasCustomRange =
          Number.isFinite(yearWindowState.startYear) &&
          Number.isFinite(yearWindowState.endYear);
        if (hasCustomRange && !shouldSendServerRange) {
          const minYear = yearWindowState.startYear;
          const maxYear = yearWindowState.endYear;
          const originalIndividualData = Array.isArray(individualData) ? [...individualData] : [];
          const originalCumulativeData = Array.isArray(cumulativeData) ? [...cumulativeData] : [];
          individualData = (individualData || []).filter((item) => {
            const year = parseYearFromLabel(item?.label);
            return Number.isFinite(year) && year >= minYear && year <= maxYear;
          });
          cumulativeData = (cumulativeData || []).filter((item) => {
            const year = parseYearFromLabel(item?.label);
            return Number.isFinite(year) && year >= minYear && year <= maxYear;
          });
          if ((!individualData || individualData.length === 0) && originalIndividualData.length > 0) {
            individualData = originalIndividualData;
          }
          if ((!cumulativeData || cumulativeData.length === 0) && originalCumulativeData.length > 0) {
            cumulativeData = originalCumulativeData;
          }
        }
        if (hasCustomRange) {
          yearWindowState.hasOlder = false;
          yearWindowState.hasNewer = false;
          yearWindowState.offset = 0;
        }

        // Important: show chart containers before rendering ApexCharts.
        // Rendering while hidden can produce zero-width charts until a browser resize event.
        setYearsChartsLoading(false);

        initializeCombinedYearsWindow(individualData, cumulativeData);

        // Ensure final layout pass on slow devices/browsers.
        setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
      } else {
        setYearsChartsLoading(false);
        updateTrendWindowControls();
      }
    },
    error: function () {
      yearWindowState.isLoading = false;
      setYearsChartsLoading(false);
      updateTrendWindowControls();
      if (retryCount < 1) {
        setTimeout(() => loadYearsWindow(nextOffset, retryCount + 1, forceRange), 450);
        return;
      }

      const hasExistingData =
        Array.isArray(combinedYearsState.labels) &&
        combinedYearsState.labels.length > 0;

      if (hasExistingData) {
        alertMessage(
          "Tahadhari",
          "Mtandao umechelewa kidogo. Tumeendelea kutumia data ya awali.",
          "warning",
          () => {}
        );
        return;
      }

      alertMessage(
        "Kuna Tatizo",
        "Imeshindikana kupakua miaka inayofuata/iliyopita. Tafadhali jaribu tena.",
        "error",
        () => {}
      );
    },
  });
};

$("#trend-prev-window").on("click", function () {
  if (!yearWindowState.hasOlder) return;
  loadYearsWindow(yearWindowState.offset + yearWindowState.limit);
});

$("#trend-next-window").on("click", function () {
  if (!yearWindowState.hasNewer) return;
  loadYearsWindow(Math.max(0, yearWindowState.offset - yearWindowState.limit));
});

$("#trend-apply-range").on("click", function () {
  const startYear = Number.parseInt($("#trend-start-year").val(), 10);
  const endYear = Number.parseInt($("#trend-end-year").val(), 10);

  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) {
    alertMessage(
      "Tahadhari",
      "Tafadhali chagua mwaka wa kuanzia na wa mwisho.",
      "warning",
      () => {}
    );
    return;
  }

  if (startYear > endYear) {
    alertMessage(
      "Tahadhari",
      "Mwaka wa kuanzia usizidi mwaka wa mwisho.",
      "warning",
      () => {}
    );
    return;
  }

  yearWindowState.startYear = startYear;
  yearWindowState.endYear = endYear;
  yearWindowState.offset = 0;
  loadYearsWindow(0, 0, true);
});

$("#trend-clear-range").on("click", function () {
  yearWindowState.startYear = null;
  yearWindowState.endYear = null;
  $("#trend-start-year").val("");
  $("#trend-end-year").val("");
  yearWindowState.offset = 0;
  loadYearsWindow(0, 0, false);
});

const renderSchoolByCategoriesChart = (selector, response) => {
  if (response.statusCode != 300) return;

  const labels = [];
  const allData = [];
  const awaliData = [];
  const msingiData = [];
  const sekondariData = [];
  const vyuoData = [];
  const formattedResults = response.data || {};
  const schoolTypes = ["Shule za Awali", "Shule za Awali na Msingi", "Shule za Sekondari", "Vyuo vya Ualimu"];
  const pieChartData = [0, 0, 0, 0];
  const isModalSelector = selector === "modal-school_registration_charts";
  const listByLabel = $("#list-by-label");

  if (!isModalSelector) {
    listByLabel.empty();
    $("#angalia-zote").hide();
  }

  let i = 0;
  for (const region in formattedResults) {
    const regionData = formattedResults[region] || {};
    i++;
    labels.push(region);
    allData.push(Number(regionData.total || 0));

    if (!isModalSelector) {
      if (i > 10) $("#angalia-zote").show();
      listByLabel.append(`<li class="py-1 ${i > 20 ? "hidden" : ""}" ${i > 20 ? "style=display:none" : ""}>
                            <a href="#" class="text-${
                              regionData.total == response.maxValue ? "success fw-bolder fst-italic"
                              : (regionData.total == response.minValue ? "danger fw-bolder fst-italic" : "muted")
                            }">
                              ${region} <span class="float-end">(${regionData.total})</span>
                            </a>
                          </li>`);
    }

    for (const category in (regionData.categories || {})) {
      const categoryCount = Number(regionData.categories[category] || 0);
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

  const numericTotals = allData.map((v) => Number(v) || 0);
  const maxTotal = numericTotals.length ? Math.max(...numericTotals) : 0;
  const minTotal = numericTotals.length ? Math.min(...numericTotals) : 0;
  const sameMinMax = maxTotal === minTotal;

  const barRanges = sameMinMax
    ? [{ from: minTotal, to: maxTotal, color: "#60a5fa" }]
    : [
        { from: minTotal, to: minTotal, color: "#ef4444" },
        { from: maxTotal, to: maxTotal, color: "#1d4ed8" },
        { from: minTotal + 0.0001, to: ((maxTotal + minTotal) / 2), color: "#93c5fd" },
        { from: ((maxTotal + minTotal) / 2) + 0.0001, to: maxTotal - 0.0001, color: "#60a5fa" },
      ];

  const series = [
    { name: "Shule Zote", type: "bar", data: allData },
    { name: schoolTypes[0], type: "line", data: awaliData },
    { name: schoolTypes[1], type: "line", data: msingiData },
    { name: schoolTypes[2], type: "line", data: sekondariData },
    { name: schoolTypes[3], type: "line", data: vyuoData },
  ];

  createChart(labels, series, selector, true, false, barRanges);
  if (!isModalSelector) {
    createPieChart(schoolTypes, pieChartData, "aina-za-shule-kwa-asilimia");
  }
};

const displaySchoolByCategoriesChat = (selector, callback) => {
  const hasFreshCache = regionsCategoryChartCache.response
    && (Date.now() - Number(regionsCategoryChartCache.fetchedAt || 0)) <= REGION_CATEGORY_CHART_CACHE_MS;

  if (hasFreshCache) {
    renderSchoolByCategoriesChart(selector, regionsCategoryChartCache.response);
    callback(300);
    return;
  }

  ajaxRequest("/SchoolsSummaryByRegionAndCategories", "GET", (response) => {
    if (response && Number(response.statusCode) === 300) {
      regionsCategoryChartCache = {
        response,
        fetchedAt: Date.now(),
      };
    }

    renderSchoolByCategoriesChart(selector, response || { statusCode: 306, data: {} });
    callback(response?.statusCode || 306);
  });
};

// get total number of schools by year of registration
function displayTotalSchoolsByYearOfRegistration(){
  const currentYear = new Date().getFullYear();
  const defaultStartYear = currentYear - (TREND_WINDOW_SIZE - 1);
  yearWindowState.startYear = null;
  yearWindowState.endYear = null;
  $("#trend-start-year").val(String(defaultStartYear));
  $("#trend-end-year").val(String(currentYear));
  loadYearsWindow(0);
}

document.addEventListener("DOMContentLoaded", function () {
  initializeTrendRangeYearOptions();
  displaySchoolByCategoriesChat("school_registration_charts", () => {});
  displayTotalSchoolsByYearOfRegistration();
});
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
const createChart = (
  labels,
  series,
  selector,
  dataLabelEnabled = true,
  tooltipShared = false,
  barRanges = []
) => {
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
        bar: {
          columnWidth: "70%",
          barHeight: "70%",
          colors: Array.isArray(barRanges) && barRanges.length ? { ranges: barRanges } : undefined,
        },
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
    }));

  if (!linechartSchoolsColors) return;

  const chartElement = document.querySelector(`#${selector}`);
  if (!chartElement) return;

  if (chartInstances[selector]) {
    chartInstances[selector].destroy();
  }

  chartInstances[selector] = new ApexCharts(chartElement, options);
  chartInstances[selector].render();
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
  if (!chartDonutBasicColors) return;

  const total = (series || []).reduce((acc, val) => acc + (Number(val) || 0), 0);
  const summaryEl = document.querySelector(`#${selector}-summary`);
  if (summaryEl) {
    const summaryHtml = (label || []).map((name, idx) => {
      const value = Number((series || [])[idx] || 0);
      const pct = total > 0 ? ((value / total) * 100) : 0;
      const color = chartDonutBasicColors[idx] || "#94a3b8";
      return `
        <div class="pie-summary-item">
          <div class="pie-summary-label"><span class="pie-dot" style="background:${color};"></span>${name}</div>
          <div class="pie-summary-meta">${pct.toFixed(1)}% • ${value.toLocaleString()}</div>
        </div>
      `;
    }).join("");
    summaryEl.innerHTML = summaryHtml;
  }

  options = {
    series: series,
    labels: label,
    chart: { height: 285, type: "donut" },
    legend: {
      show: false,
    },
    fill: { type: "solid" },
    stroke: { show: true, width: 2, colors: ["#fff"] },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val >= 2 ? `${val.toFixed(1)}%` : "";
      },
      style: {
        fontSize: "13px",
        fontWeight: 700,
      },
      dropShadow: { enabled: false },
    },
    colors: chartDonutBasicColors,
    plotOptions: {
      pie: {
        donut: {
          size: "64%",
          labels: {
            show: true,
            value: {
              formatter: function (v) {
                const value = Number(v) || 0;
                return value.toLocaleString();
              },
            },
            total: {
              showAlways: true,
              show: true,
              label: "Total",
              formatter: function () {
                return total.toLocaleString();
              },
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: 250 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  if (chartInstances[selector]) {
    chartInstances[selector].destroy();
  }
  chart = new ApexCharts(document.querySelector(`#${selector}`), options);
  chart.render();
  chartInstances[selector] = chart;
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
