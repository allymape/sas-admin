function BadiliData(e) {
var nameId = e.getAttribute("data-id");
var name = e.getAttribute("data-name");
document.getElementById("id1-field3").value = nameId;
document.getElementById("customername1-field").value = name;
$("#showEditModal").modal("show");
}
function AddZone1(e) {
var nameId = e.getAttribute("data-id");
document.getElementById("code-field-edit").value = nameId;
$("#deleteRecordModal").modal("show");
}


function sajiliHati(){
    var name = document.getElementById('cheo-field').value;
    var level = document.getElementById('status-field').value;
    var cheo_rank = level.split(" - ");
    var location = cheo_rank[0];
    if(name.length <= 0){
        $("#jazasimu").show();
    }
    if(location == '#'){
        $("#jazacheo").show();
    }if(name.length > 0 && location != '#'){
        $.ajax({
            url: "/SajiliCheo",
            type: 'POST',
            data: JSON.stringify({"name": name, "level": location}),
            contentType: 'application/json',
            success: function(response) {
                if(response.statusCode == 300){
                    $("#alertsuccess").show();
                }if(response.statusCode == 306){
                    $("#alertexist").show();
                }if(response.statusCode == 400 || response.statusCode == 500){
                    $("#alertmtandao").show();
                }
                // if(typeof(response) === "string"){response = JSON.parse(response)}
            }
        });
    }
}
function sasishaHati(){
    var name = document.getElementById('customername1-field').value;
    var cheoId = document.getElementById('id1-field3').value;
    var level = document.getElementById('status1-field').value;
    var cheo_rank = level.split(" - ");
    var location = cheo_rank[0];
    $.ajax({
        url: "/BadiliCheo",
        type: 'POST',
        data: JSON.stringify({"name": name, "level": location, 
        "cheoId": cheoId}),
        contentType: 'application/json',
        success: function(response) {
        alert("response")
        $('#showModal').modal('hide');
        //nata();
        window.location.href = "/Vyeo"
            // if(typeof(response) === "string"){response = JSON.parse(response)}
        }
    });
}
function futaCheo(){
    var cheoId = document.getElementById('code-field-edit').value;
    $.ajax({
        url: "/FutaCheo",
        type: 'POST',
        data: JSON.stringify({"cheoId": cheoId}),
        contentType: 'application/json',
        success: function(response) {
        alert("response")
        $('#showModal').modal('hide');
        //nata();
        window.location.href = "/Vyeo"
            // if(typeof(response) === "string"){response = JSON.parse(response)}
        }
    });
}
function funga(){
    window.location.href = "/Vyeo"
}


function vyeoLocation(){
    var vcheo = document.getElementById("status-field").value;
    var cheo_rank = vcheo.split(" - ");
    var location = cheo_rank[0];
    // alert("location")
}

