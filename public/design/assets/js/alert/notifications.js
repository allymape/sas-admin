
// setTimeout( () => {
//     $("#notifications").removeClass('d-none');
// } , 5000)

let getMyNotifications = () => {
    // alert('x')
      ajaxRequest(`/MyNotifications` , 'POST' , (response) => {
           const {statusCode , data , counter , new_message_count} = response
                
                 if(statusCode == 300){
                        if(parseInt(counter) > 0){
                            $("#notifications").removeClass('d-none');
                            $("#unread-notification-counter").text(counter);
                            $("#all-noti-tab").html(allNotTabs(data));
                            $("#all-noti-tab-count").text(data.length > 0 ? `(${data.length})` : '');
                            $("#all-new-messages-count").text(new_message_count > 0 ? `${new_message_count} New` : '');
                            $("#messages-tab").html(allMessages(data));
                        }
                 }

      } , {} , true)
}

let allNotTabs = (data) => {
    let content = `<div data-simplebar style="max-height: 300px;" class="pe-2">`;
        data.forEach(item => {
            const { task, url, school_name , tracking_number ,remain_days ,created_at } = item;
             content += `
                    <div class="text-reset notification-item d-block dropdown-item position-relative">
                        <div class="d-flex">
                            <div class="avatar-xs me-3">
                                <span class="avatar-title bg-soft-info text-info rounded-circle fs-16">
                                    <i class="bx bx-message-square-dots"></i>
                                </span>
                            </div>
                            <div class="flex-1"  title="${created_at}">
                                <a href="${url}" class="stretched-link">
                                    <h6 class="mt-0 mb-2 lh-base">
                                    <small class="text-secondary">${tracking_number}</small>: ${task} <i><b>${school_name}</b></i>
                                    </h6>
                                </a>
                                <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                    <span><i class="mdi mdi-clock-outline"></i> ${remain_days} </span> <!-Just 30 sec ago!->
                                </p>
                            </div>
                        </div>
                    </div>`;
        });
        content += `</div>
                    <div class="my-3 text-center">
                        <button type="button" class="btn btn-soft-success waves-effect waves-light">View
                            All Notifications <i class="ri-arrow-right-line align-middle"></i></button>
                    </div>`; 
       
    return content;
}

let allMessages = (data) => {
    let content = `<div data-simplebar style="max-height: 300px;" class="pe-2">`;
    var hasMessage = false;
    var counter = 0;
    data.forEach((item) => {
      const {
        task,
        url,
        school_name,
        tracking_number,
        staff_name,
        title,
        remain_days,
        created_at,
        comments,
      } = item;
       if(comments){
        hasMessage = true;
        counter ++;
         content += `<div class="text-reset notification-item d-block dropdown-item">
                        <div class="d-flex">
                            <img src="design/assets/images/users/user-dummy-img.jpg"
                                class="me-3 rounded-circle avatar-xs" alt="user-pic">
                            <div class="flex-1" title='${task}' data-bs-toggle="tooltip">
                                <a href="${url}" class="stretched-link">
                                    <h6 class="mt-0 mb-1 fs-13 fw-semibold">${staff_name} (${title}) <span class="text-success badge"><small>${tracking_number} </small></span></h6>
                                </a>
                                <div class="fs-13 text-muted">
                                    <p class="mb-1"> ${comments}</p>
                                </div>
                                <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                    <span><i class="mdi mdi-clock-outline"></i>${remain_days}</span>
                                    <span class="text-secondary px-2">${school_name}</span>
                                </p>
                            </div>
                            
                        </div>
                    </div>
                   `;
       }
    });
    content += ` <div class="my-3 text-center">
                        <button type="button" class="btn btn-soft-success waves-effect waves-light">View
                            All Messages <i class="ri-arrow-right-line align-middle"></i></button>
                    </div>
                </div>`;
    $("#all-messages-tab-count").text(counter > 0 ? `(${counter})` : "");
    if(hasMessage){
        return content;
    }
    return;
}

getMyNotifications()