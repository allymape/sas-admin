
// setTimeout( () => {
//     $("#notifications").removeClass('d-none');
// } , 5000)

const getMyNotifications = () => {
    // alert('x')
      ajaxRequest(`/MyNotifications` , 'POST' , (response) => {
           const {statusCode , data , counter} = response
                 console.log(statusCode , data , counter)
                 if(statusCode == 300){
                        if(parseInt(counter) > 0){
                            $("#notifications").removeClass('d-none');
                            $("#unread-notification-counter").text(counter);
                            $("#all-noti-tab").html(allNotTabs(data));
                        }
                 }

      } , {} , true)
}

const allNotTabs = (data) => {
    let content = `<div data-simplebar style="max-height: 300px;" class="pe-2">`;
        data.forEach(item => {
            const { task, url, school_name , tracking_number } = item;
             content += `
                    <div class="text-reset notification-item d-block dropdown-item position-relative">
                        <div class="d-flex">
                            <div class="avatar-xs me-3">
                                <span class="avatar-title bg-soft-info text-info rounded-circle fs-16">
                                    <i class="bx bx-message-square-dots"></i>
                                </span>
                            </div>
                            <div class="flex-1">
                                <a href="${url}" class="stretched-link">
                                    <h6 class="mt-0 mb-2 lh-base">
                                    <small class="text-secondary">${tracking_number}</small>: ${task} <b>${school_name}</b>
                                    </h6>
                                </a>
                                <p class="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                    <span><i class="mdi mdi-clock-outline"></i> Just 30 sec ago</span>
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
getMyNotifications()