

        const map = L.map('map').setView([-6.1630, 35.7516], 6);
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            // attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        // Create a layer group for markers
        const markers = L.markerClusterGroup(); // Use marker clustering for better performance

        map.addLayer(markers); // Add the marker layer to the map
        // Add the geocoder control to the map
        L.Control.geocoder({
            defaultMarkGeocode: true
        }).addTo(map);
     //View map
        mapView(map)
     //Lazy load markers
     function loadMarkers(){
        const params = new URLSearchParams(window.location.search);
         const bounds = map.getBounds();
         const zoomLevel = map.getZoom();
                    ajaxRequest('/MapData', 'POST', (response) => {
                    const { data, statusCode, hasPermission } = response;
                    if(statusCode == 300){
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
                            markers.addLayer(marker)
                             marker.on("dragend", function (e) {
                               // Get the new marker position
                               const newLatLng = e.target.getLatLng();
                               // Update the popup with the new coordinates
                               updateMarkers(name , tracking_number , newLatLng.lat , newLatLng.lng)
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
                    date_range: params.get('date_range'),
                    search: params.get('search'),
                    name_or_reg: params.get('name_or_reg'),
                    category: params.get('category'),
                    ownership: params.get('ownership'),
                    region: params.get('region'),
                    district: params.get('district'),
                    ward: params.get('ward'),
                    street: params.get('street'),
                })
            );
     }
function updateMarkers(name , tracking_number, lat, lon) {
    const text = `You want to update ${name} to lat: ${lat}, lon: ${lon}`;
    confirmAction(
      () => {
        ajaxRequest("/UpdateMarker", "POST", (response) => {
                if (response.statusCode == 300) {
                    alertMessage("Success", response.message, "success", () => {
                    loadMarkers();
                    });
                } else {
                    alertMessage("Error", response.message, "error", () => {
                    });
                }
            }, JSON.stringify({ tracking_number, lat, lon })
        );
      },
      "Update Marker",
      "warning",
      text,
      "Are you sure?",
      "",
      () => {},
      () => {
        loadMarkers();
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
if($('#mkoa-field').val() || 
   $("input[name='name_or_reg']").val() ||
   $("select[name='category']").val() ||
   $("select[name='ownership']").val() ||
   $("input[name='date_range']").val()
){
    loadMarkers()
}else{
   loadMarkers()
}