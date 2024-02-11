// $("#select-application-categories-filter").on("change", function () {
//   //   modal("showModal-create", true);
//   alert('xx')
//   const formFilter = $("#form-application-categories-filter");
//   const select = $(this);
//   console.log(this);
//   // $(this).closest("form").submit();
// });
// const selectElement = document.querySelector("[data-choices]");
// selectElement.addEventListener('change' , function(event){
//    alert('xxx')
// })
function listWorkflow() {
  ajaxRequest("/All-workflows" , 'GET' , (response) => {
       if(response.statusCode == 300){
            const fields = {
              id: {
                hidden: true,
              },
              application_category_id: {
                hidden: true,
              },
              app_name: {},
              workflow: {},
              order: {},
            };
         response.data = response.data.map((item) => ({
           id : item.id,
           application_category_id : item.application_category_id,
           app_name: item.app_name,
           workflow: `<div>
                          <span class="mdi mdi-account-arrow-right"></span> 
                           <span class="ml-2 mr-2"> ${item.start_from} </span>
                           &nbsp;
                           <span class="bx bx-right-arrow-alt"></span>&nbsp;
                          <span class="mdi mdi-account-arrow-right"></span> 
                           <span class="ml-2 mr-2"> ${item.end_to} </span>
                      </div>`,
           order: item._order,
         }));
            dataTable(
              "Workflow",
              "workflowTable",
              fields,
              response,
              {
                editBtn: {
                  show: true,
                  callback:
                    "window.location.href='/Workflow/'+$(this).data('id')+'?application_category_id='+$(this).data('application_category_id'); return false;",
                },
                deleteBtn: {
                  show: true,
                  callback: `deleteWorkflow(this); return false;`,
                },
              },
              true,
              "Idadi ya mipangilio ya utendaji kazi iliyosajiliwa"
            );
       }
  });
}
window.onload = listWorkflow;

function deleteWorkflow(element){
     const id = $(element).data('id')
     confirmAction(
       () => {
         ajaxRequest(`/Futaworkflow/${id}` , "POST" , (response) => {
          const {statusCode , message} = response;
               alertMessage(statusCode == 300 ? 'Umefanikiwa' : 'Haujafanikiwa' , message , statusCode == 300 ? 'success' : 'error' , () => {
                   if(statusCode == 300){
                      window.location.reload()
                   }
               })
         });
       },
       "Ndio",
       "warning",
       "Je, una uhakika unataka kufuta workflow hii?",
       "Thibitisha",
     );
}

function formatWorkflow(workflow){
     if(workflow.includes(',')){
      var modifiedFlow = '';
      const flow = workflow.split(",")
      flow.forEach((item , index) => {
         if(index + 1 == flow.length){
          modifiedFlow += `<span class="mdi mdi-account"></span><span class="ml-2 mr-2">${item}</span>`;
         }else{
          modifiedFlow += `<span class="mdi mdi-account-arrow-right"></span> 
                           <span class="ml-2 mr-2"> ${item} </span>
                           &nbsp;<span class="bx bx-right-arrow-alt"></span>&nbsp;`;
         }
        
      });
       return `<div class="d-flex">${modifiedFlow}</div>`;
     }
     return workflow;
}

