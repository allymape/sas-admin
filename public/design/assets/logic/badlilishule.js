function wasilisha(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-2';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    var trackerId = document.getElementById('trackerId').value;
    var newstream = document.getElementById('newstream').value;
    var oldstream = document.getElementById('oldstream').value;
    var establishId = document.getElementById('establishId').value;

    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
        $.ajax({
            url: "/BadiliJinaComment",
            type: 'POST',
            data: JSON.stringify({"coments": coments, "staffs": staffs, 
            "haliombi": haliombi, "trackerId": trackerId, "oldstream": oldstream,
            "attachment": "", "kiambatisho": "", "newstream": newstream,
            "attach_length": "", "establishId": establishId}),
            contentType: 'application/json',
            success: function(response) {
                window.location.href = "/MaombiKuanzishaShule";
            }
        });
    }else{
        alert("Samahani huwezi kubonyeza kitufe hiki")
    }
    }else{
    alert("Tafadhali weka maoni yako")
    }

}

function rudisha(){
    // var fileInput = document.querySelector('#formFileMultiple');
    // if(document.getElementById("formFileMultiple").files.length <= 0){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-1';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    var trackerId = document.getElementById('trackerId').value;

    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
        $.ajax({
            url: "/BadiliJinaComment",
            type: 'POST',
            data: JSON.stringify({"coments": coments, "staffs": staffs, 
            "haliombi": haliombi, "trackerId": trackerId, 
            "attachment": "", "kiambatisho": "", 
            "attach_length": ""}),
            contentType: 'application/json',
            success: function(response) {
                window.location.href = "/MaombiKuanzishaShule";
            }
        });
    }else{
        alert("Samahani huwezi kubonyeza kitufe hiki")
    }
    }else{
    alert("Tafadhali weka maoni yako")
    }

}

function wasilishak1(){
    // var fileInput = document.querySelector('#formFileMultiple');
    // if(document.getElementById("formFileMultiple").files.length <= 0){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-12';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    var trackerId = document.getElementById('trackerId').value;

    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
        $.ajax({
            url: "/BadiliJinaComment",
            type: 'POST',
            data: JSON.stringify({"coments": coments, "staffs": staffs, 
            "haliombi": haliombi, "trackerId": trackerId, 
            "attachment": "", "kiambatisho": "", 
            "attach_length": ""}),
            contentType: 'application/json',
            success: function(response) {
                window.location.href = "/MaombiKuanzishaShule";
            }
        });
    }else{
        alert("Samahani huwezi kubonyeza kitufe hiki")
    }
    }else{
    alert("Tafadhali weka maoni yako")
    }

}

function wasilishaKe(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-10';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 2;
    
    var trackerId = document.getElementById('trackerId').value;
    var school_name_old = document.getElementById('school_name_old').value;
    var school_name_new = document.getElementById('school_name_new').value;
    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
        $.ajax({
            url: "/BadiliJinaComment",
            type: 'POST',
            data: JSON.stringify({"coments": coments, "staffs": staffs, 
            "haliombi": haliombi, "trackerId": trackerId, "school_name_old": school_name_old,
            "attachment": "", "kiambatisho": "", "school_name_new": school_name_new,
            "attach_length": ""}),
            contentType: 'application/json',
            success: function(response) {
                alert("Jina La Shule limebadilishwa kikamilifu")
                window.location.href = "/MaombiKuanzishaShule";
            }
        });
    }else{
        alert("Samahani huwezi kubonyeza kitufe hiki")
    }
    }else{
    alert("Tafadhali weka maoni yako")
    }

}

function kataaKe(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-10';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 3;
    
    var trackerId = document.getElementById('trackerId').value;
    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
        $.ajax({
            url: "/BadiliJinaComment",
            type: 'POST',
            data: JSON.stringify({"coments": coments, "staffs": staffs, 
            "haliombi": haliombi, "trackerId": trackerId, 
            "attachment": "", "kiambatisho": "", 
            "attach_length": ""}),
            contentType: 'application/json',
            success: function(response) {
                alert("Ombi la kubadili Jina la Shule limekataliwa")
                window.location.href = "/MaombiKuanzishaShule";
            }
        });
    }else{
        alert("Samahani huwezi kubonyeza kitufe hiki")
    }
    }else{
    alert("Tafadhali weka maoni yako")
    }

}

function tuma(){
    alert("hfsdbjfsd")
    var gamechanger = document.getElementById('gamechanger').value;
        var coments = document.getElementById('exampleFormControlTextarea1').value;
        var userLevel = document.getElementById('userLevel').value;
        var staffs = document.getElementById('staffs').value;
        var haliombi = 1;
        var trackerId = document.getElementById('trackerId').value;
        var staffsInput = document.getElementById('staffs').value;
        if(coments.length > 0){
            if(staffsInput == '#'){
        $.ajax({
            url: "/BadiliJinaComment",
            type: 'POST',
            data: JSON.stringify({"coments": coments, "staffs": staffs, 
            "haliombi": haliombi, "trackerId": trackerId, 
            "attachment": "", "kiambatisho": "", 
            "attach_length": ""}),
            contentType: 'application/json',
            success: function(response) {
                window.location.href = "/MaombiKuanzishaShule";
            }
        });
    }else{
        alert("Samahani huwezi kubonyeza kitufe hiki")
    }
        }else{
            alert("Tafadhali weka maoni yako")
        }
}

function nata(){
    $.ajax({
        url: "/MaombiKuanzishaShuleList",
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            if(typeof(response) === "string"){response = JSON.parse(response)}
            $("#tasksTable").find('tbody').empty();
            for (var i=0; i < response.length; i++) {
                var row = '<tr> <th scope="row">'+
                                '<div class="form-check">'+
                                    '<input class="form-check-input" type="checkbox" name="chk_child" value="option1">'+
                                '</div>'+
                            '</th>'; 
                row = row + '<td class="id" id="tracker"><a href="TaarifaOmbi/'+response[i].tracking_number+'" class="fw-medium link-primary"> ' + response[i].tracking_number + ' </a></td>';
                row = row + '<td class="project_name"><a href="apps-projects-overview.html" class="fw-medium link-primary"> ' + response[i].school_name + ' </a></td>';
                row = row + '<td>'+
                            '<div class="d-flex">'+
                                '<div class="flex-grow-1 tasks_name"> ' + response[i].LgaName + ' </div>'+
                                    '<div class="flex-shrink-0 ms-4">'+
                                '<ul class="list-inline tasks-list-menu mb-0">'+
                                '<li class="list-inline-item"><a href="apps-tasks-details.html"><i class="ri-eye-fill align-bottom me-2 text-muted"></i></a></li>'+
                                    '<li class="list-inline-item"><a class="edit-item-btn" href="#showModal" data-bs-toggle="modal"><i class="ri-pencil-fill align-bottom me-2 text-muted"></i></a></li>'+
                                '<li class="list-inline-item">'+
                            '<a class="remove-item-btn" data-bs-toggle="modal" href="#deleteOrder">'+
                            '<i class="ri-delete-bin-fill align-bottom me-2 text-muted"></i>'+
                            '</a>'+
                            '</li>'+
                            '</ul>'+
                            '</div>'+
                            '</div>'+
                            '</td>';
                row = row + '<td class="status"><span class=""> ' + response[i].RegionName + ' </span></td>';
                row = row + ' <td class="due_date badge badge-soft-secondary text-uppercase"  title=" ' + response[i].created_at + ' "> ' + response[i].remain_days + ' </td>';
                row = row + '<td class="priority"><span class="badge bg-danger text-uppercase">High</span></td>';
                row = row + '<td class="assignedto">'+
                            '<div class="avatar-group">'+
                                '<a href="javascript: void(0);" class="avatar-group-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="Frank">'+
                                    '<img src="design/assets/images/users/avatar-3.jpg" alt="" class="rounded-circle avatar-xxs" />'+
                                '</a>'+
                                '<a href="javascript: void(0);" class="avatar-group-item" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-placement="top" title="Anna">'+
                                    '<img src="design/assets/images/users/avatar-1.jpg" alt="" class="rounded-circle avatar-xxs" />'+
                                '</a>'+
                            '</div>'+
                            '</td>'+
                            '</tr>';
                $('#tasksTable').append(row);
            }
        }
    });
}
window.onload = nata;

$('a').click(function(){
    var base64doc = $(this).attr('data-path');
    console.log(base64doc)
    document.getElementById("pdfdoc").src = "data:application/pdf;base64,"+base64doc;
});

function badili(school_name){
    var trackingId = document.getElementById('trackingId').value;
    var inviteMembersModalLabel = document.getElementById('inviteMembersModalLabel');
    inviteMembersModalLabel.value = "JINA PENDEKEZWA: " + school_name;
    var newName = document.getElementById('newName');
    newName.value = school_name;
    $('#inviteMembersModal').modal('show');
}

function changeName(){
    var trackingId = document.getElementById('trackingId').value;
    var newName = document.getElementById('newName').value;
    $.ajax({
        url: "/changeshule",
        type: 'POST',
        data: JSON.stringify({"trackingId": trackingId, "newName": newName}),
        contentType: 'application/json',
        success: function(response) {
        $('#inviteMembersModal').modal('hide');
        window.location.href = "/TaarifaOmbi/"+trackingId;
        }
    });

}

function addRows(){ 
    var table = document.getElementById('emptbl');
    var rowCount = table.rows.length;
    var cellCount = table.rows[0].cells.length; 
    var row = table.insertRow(rowCount);
    for(var i =0; i <= cellCount; i++){
        var cell = 'cell'+i;
        cell = row.insertCell(i);
        var copycel = document.getElementById('col'+i).innerHTML;
        cell.innerHTML=copycel;
        if(i == 3){ 
            var radioinput = document.getElementById('col3').getElementsByTagName('input'); 
            for(var j = 0; j <= radioinput.length; j++) { 
                if(radioinput[j].type == 'radio') { 
                    var rownum = rowCount;
                    radioinput[j].name = 'gender['+rownum+']';
                }
            }
        }
    }
}

function deleteRows(){
    var table = document.getElementById('emptbl');
    var rowCount = table.rows.length;
    if(rowCount > '2'){
        var row = table.deleteRow(rowCount-1);
        rowCount--;
    }
    else{
        alert('There should be atleast one row');
    }
}

function showViambata(){
    var gamechanger = document.getElementById('gamechanger');
    gamechanger.value = 1;
    var table = document.getElementById('emptbl');
    $(".viambataDiv").show();
}

function Pandisha(){
    var gamechanger = document.getElementById('gamechanger').value;
    var trackerId = document.getElementById('trackerId').value;
    var faili = document.getElementById('faili').value;
    var selectedFile = document.getElementById('failiAttached').files;
    if (selectedFile.length > 0) {
    // Select the very first file from list
    var fileToLoad = selectedFile[0];
    // FileReader function for read the file.
    var fileReader = new FileReader();
    var base64;
    // Onload of file read the file content
    fileReader.onload = function(fileLoadedEvent) {
        base64 = fileLoadedEvent.target.result;
        // Print data in console
       // alert(base64);
       var taachedFile = base64.split(",")

    var keyString = trackerId+"-"+faili+"-"+new Date();
    let hash = 0;
    for (charIndex = 0; charIndex < keyString.length; ++charIndex)
    {
        hash += keyString.charCodeAt(charIndex);
        hash += hash << 10;
        hash ^= hash >> 6;
    }
    hash += hash << 3;
    hash ^= hash >> 11;
    var key = (((hash + (hash << 15)) & 4294967295) >>> 0).toString(16)
        $.ajax({
            url: "/TumaAttachment",
            type: 'POST',
            data: JSON.stringify({
                                  "keyString": key, "trackerId": trackerId, 
                                  "attachment": faili, "kiambatisho": taachedFile[1]
            }),
            contentType: 'application/json',
            success: function(response) {
                // if(typeof(response) === "string"){response = JSON.parse(response)}
                alert(response)
                //window.location.href = "/MaombiKuanzishaShule";
            }
        });
    };
    // Convert data to base64
    fileReader.readAsDataURL(fileToLoad);
}
}

function rudishaMteja(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-0';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 4;
    var trackerId = document.getElementById('trackerId').value;

    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
        $.ajax({
            url: "/BadiliJinaComment",
            type: 'POST',
            data: JSON.stringify({"coments": coments, "staffs": staffs, 
            "haliombi": haliombi, "trackerId": trackerId, 
            "attachment": "", "kiambatisho": "", 
            "attach_length": ""}),
            contentType: 'application/json',
            success: function(response) {
                window.location.href = "/MaombiKuanzishaShule";
            }
        });
    }else{
        alert("Samahani huwezi kubonyeza kitufe hiki")
    }
    }else{
    alert("Tafadhali weka maoni yako")
    }

}

function wasilishaMus(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-9';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    
    var trackerId = document.getElementById('trackerId').value;
    
    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
    $.ajax({
        url: "/BadiliJinaComment",
        type: 'POST',
        data: JSON.stringify({"coments": coments, "staffs": staffs,
        "haliombi": haliombi, "trackerId": trackerId,
        "attachment": "", "kiambatisho": "", 
        "attach_length": 0, "ombitype": 1}),
        contentType: 'application/json',
        success: function(response) {
            window.location.href = "/MaombiKusajiliShule";
        }
    });
}else{
    alert("Samahani huwezi kubonyeza kitufe hiki")
}
    }else{
    alert("Tafadhali weka maoni yako")
    }

}

function wasilishaAdsa(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-9';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    
    var trackerId = document.getElementById('trackerId').value;
    
    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
    $.ajax({
        url: "/BadiliJinaComment",
        type: 'POST',
        data: JSON.stringify({"coments": coments, "staffs": staffs,
        "haliombi": haliombi, "trackerId": trackerId,
        "attachment": "", "kiambatisho": "", 
        "attach_length": 0, "ombitype": 1}),
        contentType: 'application/json',
        success: function(response) {
            window.location.href = "/MaombiKusajiliShule";
        }
    });
}else{
    alert("Samahani huwezi kubonyeza kitufe hiki")
}
    }else{
    alert("Tafadhali weka maoni yako")
    }

}

function rudishaMus(){
    // var fileInput = document.querySelector('#formFileMultiple');
    // if(document.getElementById("formFileMultiple").files.length <= 0){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-2';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    
    var trackerId = document.getElementById('trackerId').value;
    
    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
    $.ajax({
        url: "/BadiliJinaComment",
        type: 'POST',
        data: JSON.stringify({"coments": coments, "staffs": staffs,
        "haliombi": haliombi, "trackerId": trackerId,
        "attachment": "", "kiambatisho": "", 
        "attach_length": 0, "ombitype": 1}),
        contentType: 'application/json',
        success: function(response) {
            window.location.href = "/MaombiKusajiliShule";
        }
    });
}else{
    alert("Samahani huwezi kubonyeza kitufe hiki")
}
    }else{
    alert("Tafadhali weka maoni yako")
    }

}

function wasilishaMmus(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-12';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    var trackerId = document.getElementById('trackerId').value;
    
    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
    $.ajax({
        url: "/BadiliJinaComment",
        type: 'POST',
        data: JSON.stringify({"coments": coments, "staffs": staffs,
        "haliombi": haliombi, "trackerId": trackerId,
        "attachment": "", "kiambatisho": "", 
        "attach_length": 0, "ombitype": 1}),
        contentType: 'application/json',
        success: function(response) {
            window.location.href = "/MaombiKusajiliShule";
        }
    });
}else{
    alert("Samahani huwezi kubonyeza kitufe hiki")
}
    }else{
    alert("Tafadhali weka maoni yako")
    }
}
