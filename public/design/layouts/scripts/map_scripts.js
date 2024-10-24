// Load the map
    let defaultCenter = [-6.163, 35.7516]
    let defaultZoom = 6
    const map = L.map('map').setView(defaultCenter, defaultZoom);
    // Create a layer group for markers
    const markers = L.markerClusterGroup(); // Use marker clustering for better performance
   function initilizeMap(){
     // Add OpenStreetMap tile layer
     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
       maxZoom: 19,
       // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
     }).addTo(map);

     map.addLayer(markers); // Add the marker layer to the map
     // Add the geocoder control to the map
     L.Control.geocoder({
       defaultMarkGeocode: true,
     }).addTo(map);
   }
   initilizeMap();
     //View map
    mapView(map)
     //Lazy load markers
     function loadMarkers(param_registration_number = '') {
        const params = new URLSearchParams(window.location.search);
        const keyword = param_registration_number
                            ? param_registration_number
                            : params.get("name_or_reg");
        const bounds = map.getBounds();
         const zoomLevel = map.getZoom();
                    ajaxRequest(
                      "/MapData",
                      "POST",
                      (response) => {
                        const { data, statusCode, hasPermission } = response;
                        if (statusCode == 300) {
                          // Clear the current markers
                          markers.clearLayers();
                          // Add markers to the map
                          $("#total-school").text(data.length);
                          data.forEach((item) => {
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
                            const marker = L.marker([latitude, longitude], {
                              draggable: hasPermission,
                            }).addTo(map).bindPopup(`
                                                <div class="col-md-12">
                                                <label>Lat: ${latitude}, Lon: ${longitude}</label>
                                                </div>
                                                <div class="border-top border-border-top-dashed text-primary mb-2"></div>
                                                <div class="col-md-12">
                                                    <label class="col-md-3 text-primary">Name</label><span class="col-md-9 font-bold">: ${name.toUpperCase()}</span>
                                                </div>
                                                <div class="col-md-12">
                                                    <label class="col-md-3 text-primary">Type</label><span class="col-md-9">: ${category.toUpperCase()}</span>
                                                <div class="col-md-12">
                                                    <label class="col-md-3 text-primary">Reg #</label><span class="col-md-9">: ${registration_number}</span>
                                                </div>
                                                <div class="col-md-12">
                                                    <label class="col-md-3 text-primary">Owner</label><span class="col-md-9">: ${ownership}</span>
                                                </div>
                                                <div class="col-md-12">
                                                    <label class="col-md-3 text-primary">Region</label><span class="col-md-9">: ${region}</span>
                                                </div>
                                                <div class="col-md-12">
                                                    <label class="col-md-3 text-primary">District</label><span class="col-md-9">: ${district}</span>
                                                </div>
                                                <div class="col-md-12">
                                                    <label class="col-md-3 text-primary">Ward</label><span class="col-md-9">: ${ward}</span>
                                                </div>
                                                <div class="col-md-12">
                                                    <label class="col-md-3 text-primary">Street</label><span class="col-md-9">: ${street}</span>
                                                </div>
                                                `);
                            // .openPopup();
                            markers.addLayer(marker);
                            marker.on("dragend", function (e) {
                              // Get the new marker position
                              const newLatLng = e.target.getLatLng();
                              // Update the popup with the new coordinates
                              updateMarkers(
                                name,
                                tracking_number,
                                newLatLng.lat,
                                newLatLng.lng,
                                param_registration_number
                              );
                            });
                          });
                        }
                      },
                      JSON.stringify({
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
                      })
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
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
        attribution: 'Imagery &copy; <a href="https://www.esri.com">Esri</a>',
        urlTemplate:
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        }
    );
    const terrain = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
        attribution:
            'Map data: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors',
        }
    );
    // Add OSM as the default base layer
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
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    map.on('moveend', debounce(loadMarkers, 300));

    var cleanHref = cleanUrl(window.location.href);
    window.history.replaceState(null, null, cleanHref);
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
    
