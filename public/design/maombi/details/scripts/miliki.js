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
// window.onload = nata;

function tuma(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = document.getElementById('staffs').value;
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    var trackerId = document.getElementById('trackerId').value;
      tumaMaoniYako(
        "/MmilikiBadiliComment",
        {
          coments: coments,
          staffs: staffs,
          haliombi: haliombi,
          trackerId: trackerId,
        },
        staffs,
        coments,
        "tuma",
        "/BadiliMmiliki"
      );
    // if(coments.length > 0){
    // $.ajax({
    //     url: "/MmilikiBadiliComment",
    //     type: 'POST',
    //     data: JSON.stringify({"coments": coments, "staffs": staffs, "haliombi": haliombi, "trackerId": trackerId}),
    //     contentType: 'application/json',
    //     success: function(response) {
    //         window.location.href = "/BadiliMmiliki";
    //     }
    // });
    // }else{
    //     alert("Tafadhali weka maoni yako")
    // }
}

function wasilisha(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-5';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    var trackerId = document.getElementById('trackerId').value;
    var staffsInput = document.getElementById('staffs').value;
    tumaMaoniYako(
      "/MmilikiBadiliComment",
      {
        coments: coments,
        staffs: staffs,
        haliombi: haliombi,
        trackerId: trackerId,
        attachment: "",
        kiambatisho: "",
        attach_length: "",
      },
      staffsInput,
      coments,
      "wasilisha",
      "/BadiliMmiliki"
    );
    // if(coments.length > 0){
    //     if(staffsInput == '#'){
    //     $.ajax({
    //         url: "/MmilikiBadiliComment",
    //         type: 'POST',
    //         data: JSON.stringify({"coments": coments, "staffs": staffs, 
    //         "haliombi": haliombi, "trackerId": trackerId, 
    //         "attachment": "", "kiambatisho": "", 
    //         "attach_length": ""}),
    //         contentType: 'application/json',
    //         success: function(response) {
    //             window.location.href = "/BadiliMmiliki";
    //         }
    //     });
    // }else{
    //     alert("Samahani huwezi kubonyeza kitufe hiki")
    // }
    // }else{
    // alert("Tafadhali weka maoni yako")
    // }

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
     tumaMaoniYako(
       "/MmilikiBadiliComment",
       {
         coments: coments,
         staffs: staffs,
         haliombi: haliombi,
         trackerId: trackerId,
         attachment: "",
         kiambatisho: "",
         attach_length: "",
       },
       staffs,
       coments,
       "rudisha",
       "/BadiliMmiliki"
     );
    // if(coments.length > 0){
    //     if(staffsInput == '#'){
    //     $.ajax({
    //         url: "/MmilikiBadiliComment",
    //         type: 'POST',
    //         data: JSON.stringify({"coments": coments, "staffs": staffs, 
    //         "haliombi": haliombi, "trackerId": trackerId, 
    //         "attachment": "", "kiambatisho": "", 
    //         "attach_length": ""}),
    //         contentType: 'application/json',
    //         success: function(response) {
    //             window.location.href = "/BadiliMmiliki";
    //         }
    //     });
    // }else{
    //     alert("Samahani huwezi kubonyeza kitufe hiki")
    // }
    // }else{
    // alert("Tafadhali weka maoni yako")
    // }

}

function wasilishak1(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-9';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 1;
    var trackerId = document.getElementById('trackerId').value;

    var staffsInput = document.getElementById('staffs').value;
       tumaMaoniYako(
         "/MmilikiBadiliComment",
         {
           coments: coments,
           staffs: staffs,
           haliombi: haliombi,
           trackerId: trackerId,
           attachment: "",
           kiambatisho: "",
           attach_length: "",
         },
         staffsInput,
         coments,
         "wasilisha",
         "/BadiliMmiliki"
       );
    // if(coments.length > 0){
    //     if(staffsInput == '#'){
    //     $.ajax({
    //         url: "/MmilikiBadiliComment",
    //         type: 'POST',
    //         data: JSON.stringify({"coments": coments, "staffs": staffs, 
    //         "haliombi": haliombi, "trackerId": trackerId, 
    //         "attachment": "", "kiambatisho": "", 
    //         "attach_length": ""}),
    //         contentType: 'application/json',
    //         success: function(response) {
    //             window.location.href = "/MaombiKuanzishaShule";
    //         }
    //     });
    // }else{
    //     alert("Samahani huwezi kubonyeza kitufe hiki")
    // }
    // }else{
    // alert("Tafadhali weka maoni yako")
    // }

}

function wasilishaKe(){
    // alert("sdfsdf")
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-10';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 2;
    var trackerId = document.getElementById('trackerId').value;
    var staffsInput = document.getElementById('staffs').value;
    tumaMaoniYako(
      "/MmilikiBadiliComment",
      {
        coments: coments,
        staffs: staffs,
        owner_name_old: "",
        haliombi: haliombi,
        trackerId: trackerId,
        authorized_person_old: "",
        attachment: "",
        kiambatisho: "",
        owner_name: "",
        authorized_person: "",
        attach_length: "",
      },
      staffsInput,
      coments,
      "wasilisha",
      "/BadiliMmiliki"
    );
    // if(coments.length > 0){
    //     if(staffsInput == '#'){
    //     $.ajax({
    //         url: "/MmilikiBadiliComment",
    //         type: 'POST',
    //         data: JSON.stringify({"coments": coments, "staffs": staffs, "owner_name_old": "",
    //         "haliombi": haliombi, "trackerId": trackerId, "authorized_person_old": "",
    //         "attachment": "", "kiambatisho": "", "owner_name": "", "authorized_person": "",
    //         "attach_length": ""}),
    //         contentType: 'application/json',
    //         success: function(response) {
    //             window.location.href = "/BadiliMmiliki";
    //         }
    //     });
    // }else{
    //     alert("Samahani huwezi kubonyeza kitufe hiki")
    // }
    // }else{
    // alert("Tafadhali weka maoni yako")
    // }

}

function wasilishaKeBadili(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-10';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 2;
    
    var trackerId = document.getElementById('trackerId').value;
    var authorized_person_old = document.getElementById('authorized_person_old').value;

    var owner_name_old = document.getElementById('owner_name_old').value;
    var owner_name = document.getElementById('owner_name').value;
    var authorized_person = document.getElementById('authorized_person').value;
    var staffsInput = document.getElementById('staffs').value;
      tumaMaoniYako(
        "/MmilikiBadiliComment",
        {
          coments: coments,
          staffs: staffs,
          owner_name_old: owner_name_old,
          haliombi: haliombi,
          trackerId: trackerId,
          authorized_person_old: authorized_person_old,
          attachment: "",
          kiambatisho: "",
          owner_name: owner_name,
          authorized_person: authorized_person,
          attach_length: "",
        },
        staffsInput,
        coments,
        "wasilisha",
        "/BadiliMmiliki"
      );
    // if(coments.length > 0){
    //     if(staffsInput == '#'){
    //     $.ajax({
    //         url: "/MmilikiBadiliComment",
    //         type: 'POST',
    //         data: JSON.stringify({"coments": coments, "staffs": staffs, "owner_name_old": owner_name_old,
    //         "haliombi": haliombi, "trackerId": trackerId, "authorized_person_old": authorized_person_old,
    //         "attachment": "", "kiambatisho": "", "owner_name": owner_name, "authorized_person": authorized_person,
    //         "attach_length": ""}),
    //         contentType: 'application/json',
    //         success: function(response) {
    //             window.location.href = "/BadiliMmiliki";
    //         }
    //     });
    // }else{
    //     alert("Samahani huwezi kubonyeza kitufe hiki")
    // }
    // }else{
    // alert("Tafadhali weka maoni yako")
    // }

}

function kataaKe(){
    var coments = document.getElementById('exampleFormControlTextarea1').value;
    var staffs = '0-10';
    var userLevel = document.getElementById('userLevel').value;
    var haliombi = 3;
    
    var trackerId = document.getElementById('trackerId').value;
    
    var schoolCategoryID = document.getElementById('schoolCategoryID').value;

    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
        $.ajax({
            url: "/MmilikiBadiliComment",
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
    
    var schoolCategoryID = document.getElementById('schoolCategoryID').value;

    var staffsInput = document.getElementById('staffs').value;
    if(coments.length > 0){
        if(staffsInput == '#'){
        $.ajax({
            url: "/MmilikiBadiliComment",
            type: 'POST',
            data: JSON.stringify({"coments": coments, "staffs": staffs,
            "haliombi": haliombi, "trackerId": trackerId, "schoolCategoryID": schoolCategoryID,
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

// $('a').click(function(){
//     var base64doc = $(this).attr('data-path');
//     console.log(base64doc)
//     document.getElementById("pdfdoc").src = "data:application/pdf;base64,"+base64doc;
// });

