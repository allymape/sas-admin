// Load the map
    let defaultCenter = [-6.163, 35.7516]
    let defaultZoom = 6
    const map = L.map('map').setView(defaultCenter, defaultZoom);
    let isMapLoading = false;
    let hasMoveEndListener = false;
    let latestMapPayload = { mode: "points", rows: [], meta: {} };
    let lastHasPermission = false;
    let colorMetric = "share_view";
    // Use a normal layer group so markers stay visible even without marker-cluster CSS.
    const markers = L.layerGroup();
   function initilizeMap(){
     map.addLayer(markers); // Add the marker layer to the map
     // Add the geocoder control to the map
     L.Control.geocoder({
       defaultMarkGeocode: true,
     }).addTo(map);
   }
   initilizeMap();
     //View map
    mapView(map)
    const setMapStatus = (text, type = "secondary") => {
      $("#map-status-wrap")
        .removeClass("status-secondary status-success status-warning status-danger")
        .addClass(`status-${type}`);
      $("#map-status").text(text);
    };
    const safeText = (value, fallback = "-") => {
      const text = String(value ?? "").trim();
      return text.length ? text : fallback;
    };
    const safeUpper = (value) => safeText(value).toUpperCase();
    const formatDateTime = (date) => {
      try {
        return new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Africa/Dar_es_Salaam",
        }).format(date);
      } catch (error) {
        return date.toLocaleString();
      }
    };
    const fillList = (selector, items, emptyText) => {
      const target = $(selector);
      if (!target.length) return;
      if (!Array.isArray(items) || items.length === 0) {
        target.html(`<li>${emptyText}</li>`);
        return;
      }
      const html = items.map((item) => `<li>${item}</li>`).join("");
      target.html(html);
    };
    const summarizeByArea = (mode, rows) => {
      const counts = {};
      rows.forEach((item) => {
        const rowCount = mode === "points" ? 1 : Number(item?.school_count || 0);
        if (!Number.isFinite(rowCount) || rowCount <= 0) return;
        let key = "-";
        if (mode === "aggregate") {
          key = safeText(item?.label || item?.region || item?.district);
        } else if (mode === "cluster") {
          key = `${safeText(item?.region)} / ${safeText(item?.district)}`;
        } else {
          key = `${safeText(item?.region)} / ${safeText(item?.district)}`;
        }
        counts[key] = (counts[key] || 0) + rowCount;
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    };
    const updateLegendNote = () => {
      const legendNote = $("#legend-note");
      if (!legendNote.length) return;
      if (colorMetric === "count") {
        legendNote.text("Rangi zinatokana na idadi ya shule kwa eneo ndani ya view ya sasa.");
      } else {
        legendNote.text("Rangi zinatokana na asilimia ya eneo ndani ya view ya sasa (si population-adjusted).");
      }
    };
    const getConcentrationColor = (count, totalSchools, maxCount) => {
      const safeCount = Number(count) || 0;
      const safeTotal = Number(totalSchools) || 0;
      const safeMax = Number(maxCount) || 0;
      const share = safeTotal > 0 ? safeCount / safeTotal : 0;
      const ratio = safeMax > 0 ? safeCount / safeMax : 0;

      let high = false;
      let medium = false;
      if (colorMetric === "count") {
        high = ratio >= 0.67;
        medium = !high && ratio >= 0.34;
      } else {
        high = share >= 0.2;
        medium = !high && share >= 0.08;
      }

      if (high) {
        return { level: "High", fill: "#ef4444", border: "#b91c1c" };
      }
      if (medium) {
        return { level: "Medium", fill: "#f59e0b", border: "#b45309" };
      }
      return { level: "Low", fill: "#4ade80", border: "#15803d" };
    };
    const buildDotIcon = (fill, border) => L.divIcon({
      className: "",
      html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${fill};border:2px solid ${border};box-shadow:0 0 0 1px rgba(255,255,255,.7);"></span>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -8],
    });
    const updateDecisionPanel = (mode, rows, meta = {}) => {
      const sortedAreas = summarizeByArea(mode, rows);
      const totalSchools = Number(
        meta.total_schools || (
          mode === "points"
            ? rows.length
            : rows.reduce((sum, item) => sum + Number(item?.school_count || 0), 0)
        ),
      );
      const modeLabel = mode === "aggregate"
        ? "SUMMARY"
        : (mode === "cluster" ? "CLUSTER" : "POINTS");
      const fallbackText = meta?.fallback_from ? " (fallback)" : "";
      const top = sortedAreas[0] || { name: "-", count: 0 };
      const bottom = sortedAreas.length ? sortedAreas[sortedAreas.length - 1] : { name: "-", count: 0 };
      const topShare = totalSchools > 0 ? Math.round((top.count / totalSchools) * 100) : 0;

      $("#kpi-visible-schools").text(totalSchools.toLocaleString());
      $("#kpi-map-mode").text(`${modeLabel}${fallbackText}`.trim());
      $("#kpi-top-area").text(top.name);
      $("#kpi-top-area-count").text(`${top.count.toLocaleString()} shule`);
      $("#kpi-last-updated").text(formatDateTime(new Date()));

      const topItems = sortedAreas.slice(0, 5).map((item, index) =>
        `${index + 1}. ${item.name} <span class="text-muted">(${item.count.toLocaleString()})</span>`
      );
      fillList("#top-areas-list", topItems, "Hakuna data.");

      const insights = [];
      if (totalSchools === 0) {
        insights.push("Hakuna shule kwenye eneo hili kwa sasa.");
      } else {
        insights.push(`Eneo la kwanza ni ${top.name} (${top.count.toLocaleString()} shule).`);
        if (sortedAreas.length > 1) {
          insights.push(`Eneo la mwisho ni ${bottom.name} (${bottom.count.toLocaleString()} shule).`);
        }
        if (topShare >= 35) {
          insights.push(`Kipaumbele: ${top.name} lina ${topShare}% ya mzigo wa eneo hili.`);
        } else {
          insights.push("Usambazaji wa shule unaonekana kuwa wa wastani kwenye eneo hili.");
        }
        if (mode !== "points") {
          insights.push("Zoom in kuona shule moja moja kwa maamuzi ya ufuatiliaji.");
        }
      }
      fillList("#action-insights-list", insights, "Inasubiri data kutoka ramani...");
    };
    const renderMapPayload = (payload, hasPermission) => {
      const normalized = payload && typeof payload === "object" ? payload : { mode: "points", rows: [], meta: {} };
      const mode = String(normalized.mode || "points").toLowerCase();
      const rows = Array.isArray(normalized.rows) ? normalized.rows : [];
      const meta = normalized.meta && typeof normalized.meta === "object" ? normalized.meta : {};

      const totalSchools = Number(meta.total_schools || 0) || (
        mode === "points"
          ? rows.length
          : rows.reduce((sum, item) => sum + Number(item?.school_count || 0), 0)
      );

      markers.clearLayers();
      $("#total-school").text(totalSchools);
      updateDecisionPanel(mode, rows, meta);
      updateLegendNote();

      if (rows.length === 0) {
        setMapStatus("Hakuna shule kwenye eneo hili kwa sasa", "warning");
        return;
      }

      if (mode === "aggregate") {
        setMapStatus(`Makundi ${rows.length.toLocaleString()} • Shule ${totalSchools.toLocaleString()}`, "success");
      } else if (mode === "cluster") {
        setMapStatus(`Clusters ${rows.length.toLocaleString()} • Shule ${totalSchools.toLocaleString()}`, "success");
      } else {
        setMapStatus(`Imeonyesha shule ${rows.length.toLocaleString()}`, "success");
      }

      if (mode === "aggregate" || mode === "cluster") {
        const maxCount = rows.reduce(
          (max, item) => Math.max(max, Number(item?.school_count || 0)),
          1
        );
        rows.forEach((item) => {
          const latitudeNum = Number(item?.latitude);
          const longitudeNum = Number(item?.longitude);
          const schoolCount = Number(item?.school_count || 0);
          if (!Number.isFinite(latitudeNum) || !Number.isFinite(longitudeNum)) return;
          if (!Number.isFinite(schoolCount) || schoolCount <= 0) return;

          const color = getConcentrationColor(schoolCount, totalSchools, maxCount);
          const radius = Math.max(10, Math.min(30, 8 + (schoolCount / maxCount) * 22));
          const locationLabel = mode === "aggregate"
            ? safeText(item?.label || item?.region || item?.district)
            : `${safeText(item?.region)} / ${safeText(item?.district)}`;

          const circle = L.circleMarker([latitudeNum, longitudeNum], {
            radius,
            color: color.border,
            weight: 1.5,
            fillColor: color.fill,
            fillOpacity: 0.55,
          }).bindPopup(`
            <div class="col-md-12"><label>Eneo: ${locationLabel}</label></div>
            <div class="col-md-12"><label>Jumla ya shule: <b>${schoolCount}</b></label></div>
            <div class="col-md-12"><label>Concentration: <b>${color.level}</b></label></div>
            <div class="col-md-12"><label>Aina ya mwonekano: ${safeText(mode)}</label></div>
          `);

          markers.addLayer(circle);
        });
        return;
      }

      const areaSummary = summarizeByArea("points", rows);
      const areaCountMap = areaSummary.reduce((acc, item) => {
        acc[item.name] = Number(item.count || 0);
        return acc;
      }, {});
      const maxAreaCount = areaSummary.reduce((max, item) => Math.max(max, Number(item.count || 0)), 1);

      rows.forEach((item) => {
        const {
          latitude,
          longitude,
          tracking_number,
          name,
          ownership,
          category,
          registration_number,
          region,
          district,
          ward,
          street,
        } = item;
        const latitudeNum = Number(latitude);
        const longitudeNum = Number(longitude);
        if (!Number.isFinite(latitudeNum) || !Number.isFinite(longitudeNum)) return;

        const areaKey = `${safeText(region)} / ${safeText(district)}`;
        const areaCount = Number(areaCountMap[areaKey] || 1);
        const color = getConcentrationColor(areaCount, totalSchools, maxAreaCount);
        const marker = L.marker([latitudeNum, longitudeNum], {
          draggable: hasPermission,
          icon: buildDotIcon(color.fill, color.border),
        }).bindPopup(`
          <div class="col-md-12"><label>Lat: ${latitudeNum}, Lon: ${longitudeNum}</label></div>
          <div class="border-top border-border-top-dashed text-primary mb-2"></div>
          <div class="col-md-12"><label class="col-md-3 text-primary">Name</label><span class="col-md-9 font-bold">: ${safeUpper(name)}</span></div>
          <div class="col-md-12"><label class="col-md-3 text-primary">Type</label><span class="col-md-9">: ${safeUpper(category)}</span></div>
          <div class="col-md-12"><label class="col-md-3 text-primary">Reg #</label><span class="col-md-9">: ${safeText(registration_number)}</span></div>
          <div class="col-md-12"><label class="col-md-3 text-primary">Owner</label><span class="col-md-9">: ${safeText(ownership)}</span></div>
          <div class="col-md-12"><label class="col-md-3 text-primary">Region</label><span class="col-md-9">: ${safeText(region)}</span></div>
          <div class="col-md-12"><label class="col-md-3 text-primary">Lga</label><span class="col-md-9">: ${safeText(district)}</span></div>
          <div class="col-md-12"><label class="col-md-3 text-primary">Ward</label><span class="col-md-9">: ${safeText(ward)}</span></div>
          <div class="col-md-12"><label class="col-md-3 text-primary">Street</label><span class="col-md-9">: ${safeText(street)}</span></div>
          <div class="col-md-12"><label class="col-md-3 text-primary">Concentration</label><span class="col-md-9">: ${color.level}</span></div>
        `);
        markers.addLayer(marker);
        marker.on("dragend", function (e) {
          const newLatLng = e.target.getLatLng();
          updateMarkers(
            name,
            tracking_number,
            newLatLng.lat,
            newLatLng.lng,
            ""
          );
        });
      });
    };

    const setMapLoading = (state) => {
      isMapLoading = state;
      if (state) {
        setMapStatus("Inapakia alama...", "warning");
      }
    };

     //Lazy load markers
    function loadMarkers(param_registration_number = '') {
    if (isMapLoading) return;
    const params = new URLSearchParams(window.location.search);
    const keyword = param_registration_number
                        ? param_registration_number
                        : params.get("name_or_reg");
    const bounds = map.getBounds();
    const zoomLevel = map.getZoom();
        if (zoomLevel != defaultZoom) {
        $("#btn-zoom-default").removeClass("d-none");
        } else {
        $("#btn-zoom-default").addClass("d-none");
    }
          const formData = {
                    southWestLat: bounds.getSouthWest().lat,
                    southWestLng: bounds.getSouthWest().lng,
                    northEastLat: bounds.getNorthEast().lat,
                    northEastLng: bounds.getNorthEast().lng,
                    zoom: zoomLevel,
                    date_range: params.get("date_range"),
                    search: params.get("search"),
                    name_or_reg: keyword,
                    category: params.get("category"),
                    ownership: params.get("ownership"),
                    region: params.get("region"),
                    district: params.get("district"),
                    ward: params.get("ward"),
                    street: params.get("street"),
                    };
                setMapLoading(true);

                ajaxRequest(
                  "/MapData",
                  "POST",
                  (response) => {
                    setMapLoading(false);
                    const { data, statusCode, hasPermission } = response || {};
                    const normalizePayload = (payload) => {
                      if (Array.isArray(payload)) {
                        return { mode: "points", rows: payload, meta: {} };
                      }
                      if (payload && typeof payload === "object" && Array.isArray(payload.rows)) {
                        return {
                          mode: String(payload.mode || "points").toLowerCase(),
                          rows: payload.rows,
                          meta: payload.meta && typeof payload.meta === "object" ? payload.meta : {},
                        };
                      }
                      return { mode: "points", rows: [], meta: {} };
                    };

                    if (statusCode == 300) {
                      const payload = normalizePayload(data);
                      latestMapPayload = payload;
                      lastHasPermission = Boolean(hasPermission);
                      renderMapPayload(latestMapPayload, lastHasPermission);
                    } else {
                      latestMapPayload = { mode: "points", rows: [], meta: {} };
                      renderMapPayload(latestMapPayload, Boolean(hasPermission));
                      setMapStatus(safeText(response?.message, "Imeshindikana kupakia data ya ramani"), "danger");
                    }
                  },
                  JSON.stringify(formData),
                  false
                );
    }
    function updateMarkers(name , tracking_number, latitude, longitude , registration_number) {
        const text = `You want to update ${name} to lat: ${latitude}, lon: ${longitude}`;
        confirmAction(
        () => {
            ajaxRequest("/UpdateMarker", "POST", (response) => {
                    if (response.statusCode == 300) {
                        alertMessage("Success", response.message, "success", () => {
                        registration_number
                          ? loadMarkers(registration_number)
                          : loadMarkers();
                        });
                    } else {
                        alertMessage("Error", response.message, "error", () => {
                            registration_number
                              ? loadMarkers(registration_number)
                              : loadMarkers();
                      });
                    }
                }, JSON.stringify({ tracking_number, latitude, longitude })
            );
        },
        "Update Marker",
        "warning",
        text,
        "Are you sure?",
        "",
        () => {},
        () => {
            registration_number
              ? loadMarkers(registration_number)
              : loadMarkers();
        }
        )
    }

    function mapView(map){
    // Base layers
    const osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
    );
    const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
        attribution: 'Imagery &copy; <a href="https://www.esri.com">Esri</a>',
        maxZoom: 19,
        maxNativeZoom: 19,
        }
    );
    const terrain = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
        attribution:
            'Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
        }
    );
    // Keep Satellite as default base layer.
    satellite.addTo(map);
    // Layer control to toggle between maps
    const baseLayers = {
        OpenStreetMap: osm,
        Satellite: satellite,
        Terrain: terrain,
    };
    L.control.layers(baseLayers).addTo(map);
    }
     
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            clearTimeout(timeout);
              if (typeof func !== "function") {
                console.error("Provided argument is not a function:", func);
                return;
              }
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    const debouncedLoadMarkers = debounce(() => loadMarkers(), 300);
    function mapMoveEnd(loadNow = false){
        if (!hasMoveEndListener) {
          map.on("moveend", debouncedLoadMarkers);
          hasMoveEndListener = true;
        }
        if (loadNow) {
          loadMarkers();
        }
    }
    var cleanHref = cleanUrl(window.location.href);
    window.history.replaceState(null, null, cleanHref);
    $("#color-metric").on("change", function () {
      const selected = String($(this).val() || "share_view");
      colorMetric = selected;
      updateLegendNote();
      if (latestMapPayload && Array.isArray(latestMapPayload.rows)) {
        renderMapPayload(latestMapPayload, lastHasPermission);
      }
    });
    // Example function to zoom in to level 15 and reset back to default after 5 seconds
    function zoomToLocationAndReset(zoom = 6) {
    // Set a timeout to reset the zoom after 5 seconds (or any desired delay)
            showLoadingSpinner()
            setTimeout(function () {
                // Reset to default zoom and center
                hideLoadingSpinner()
                map.setView(defaultCenter, zoom);
            }, 300); // 5000ms = 5 seconds
    }
  let locationMarker; // Define globally to retain reference
  let locationCircle;

  function showMyLocation() {
    // Locate and show user's current location
    map.locate({ setView: false, maxZoom: 16, enableHighAccuracy: true });

    // Define the custom icon
    const myLocationIcon = L.icon({
      iconUrl: "../../../css/map/images/loc.png",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30],
    });

    // Ensure event listener is not duplicated
    map.off("locationfound").on("locationfound", function (e) {
      const radius = e.accuracy / 2;

      // Remove previous marker if it exists
      if (locationMarker) {
        map.removeLayer(locationMarker);
      }

      // Add a marker for the current location
      locationMarker = L.marker(e.latlng, { icon: myLocationIcon })
        .addTo(map)
        .bindPopup(`You are within ${radius.toFixed(2)} meters from this point`)
        .openPopup();

      // Add a circle to show location accuracy
      if (locationCircle) {
        map.removeLayer(locationCircle);
      }
      locationCircle = L.circle(e.latlng, radius).addTo(map);
    });

    // Handle location error
    map.on("locationerror", function () {
      alert("Unable to retrieve your location.");
    });
  }

    
