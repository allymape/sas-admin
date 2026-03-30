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
function resolveWorkflowDeletedScope(){
  const params = new URLSearchParams(window.location.search || "");
  const showDeleted = String(params.get("show_deleted") || "").toLowerCase();
  const deletedScope = String(params.get("deleted_scope") || "").toLowerCase();

  if (showDeleted === "1" || showDeleted === "true" || showDeleted === "deleted") {
    return "deleted";
  }
  if (showDeleted === "all") {
    return "all";
  }
  if (["active", "deleted", "all"].includes(deletedScope)) {
    return deletedScope;
  }
  return "active";
}

function resolveWorkflowApplicationCategoryId(){
  const params = new URLSearchParams(window.location.search || "");
  const applicationCategoryId = String(params.get("application_category_id") || "").trim();
  if (!applicationCategoryId) {
    return "";
  }
  const parsed = Number(applicationCategoryId);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : "";
}

function buildWorkflowViewUrl(viewMode, applicationCategoryId = ""){
  const params = new URLSearchParams();
  if (applicationCategoryId) {
    params.set("application_category_id", applicationCategoryId);
  }

  if (viewMode === "deleted") {
    params.set("show_deleted", "1");
  } else if (viewMode === "all") {
    params.set("show_deleted", "all");
  }

  const query = params.toString();
  return query ? `/Workflow?${query}` : "/Workflow";
}

function buildWorkflowCaption(deletedScope){
  if (deletedScope === "deleted") {
    return "Idadi ya mipangilio ya utendaji kazi iliyofutwa";
  }

  if (deletedScope === "all") {
    return "Idadi ya mipangilio ya utendaji kazi (zote)";
  }

  return "Idadi ya mipangilio ya utendaji kazi iliyosajiliwa";
}

function syncWorkflowStartByOrder() {
  const orderInput = document.getElementById("order");
  const isStartInput = document.getElementById("is_start");
  const isStartHiddenInput = document.getElementById("is_start_value");

  if (!orderInput || !isStartInput || !isStartHiddenInput) {
    return;
  }

  const applyStartState = () => {
    const selectedOrder = Number(orderInput.value || 0);
    const shouldBeStart = selectedOrder === 1;
    isStartInput.disabled = false;
    isStartInput.checked = shouldBeStart;
    isStartHiddenInput.value = shouldBeStart ? "1" : "0";
    isStartInput.disabled = true;
  };

  const scheduleApplyState = () => {
    window.setTimeout(applyStartState, 0);
  };

  window.applyWorkflowStartByOrder = applyStartState;
  let lastOrderValue = String(orderInput.value || "");
  applyStartState();
  orderInput.addEventListener("change", scheduleApplyState);
  orderInput.addEventListener("input", scheduleApplyState);
  orderInput.addEventListener("addItem", scheduleApplyState);
  orderInput.addEventListener("removeItem", scheduleApplyState);

  const choiceContainer = orderInput.nextElementSibling;
  if (choiceContainer && choiceContainer.classList && choiceContainer.classList.contains("choices")) {
    choiceContainer.addEventListener("click", scheduleApplyState);
    choiceContainer.addEventListener("keyup", scheduleApplyState);
  }

  window.setInterval(() => {
    const currentOrderValue = String(orderInput.value || "");
    if (currentOrderValue !== lastOrderValue) {
      lastOrderValue = currentOrderValue;
      applyStartState();
    }
  }, 150);
}

function listWorkflow() {
  const deletedScope = resolveWorkflowDeletedScope();
  const applicationCategoryId = resolveWorkflowApplicationCategoryId();
  const requestUrl = "/All-workflows";
  let paginationUrl = `Workflow?deleted_scope=${encodeURIComponent(deletedScope)}`;
  const captionText = buildWorkflowCaption(deletedScope);
  if (applicationCategoryId) {    
    paginationUrl += `&application_category_id=${encodeURIComponent(applicationCategoryId)}`;
  }
  ajaxRequest(requestUrl , 'GET' , (response) => {
       if(response.statusCode == 300){
           const fields = {
              id: {
                hidden: true,
              },
              application_category_id: {
                hidden: true,
              },
              timeline: {},
              unit_name: {},
              app_name: {},
              flags: {},
              step_order: {},
              action: { tdClass: "text-end" },
            };
         response.data = response.data.map((item, index, items) => ({
           id : item.id,
           application_category_id : item.application_category_id,
           is_group_end: Number(item.is_final) === 1 ? 1 : 0,
           timeline: buildWorkflowTimeline(item, items[index - 1], items[index + 1]),
           unit_name: item.unit_name || "-",
           app_name: item.app_name,
           flags: formatWorkflowFlags(item),
           step_order: formatStepOrderBadge(item),
           action: formatWorkflowAction(item),
         }));
            dataTable(
              paginationUrl,
              "workflowTable",
              fields,
              response,
              null,
              false,
              captionText
            );
            applyWorkflowGroupDividers(response.data);
            highlightEditingWorkflowRow();
       }
  });
}

window.addEventListener("load", function(){
     syncWorkflowStartByOrder();
     listWorkflow();
});

function highlightEditingWorkflowRow(){
     const currentId = Number(window.currentWorkflowEditId || 0);
     if(!currentId){
       return;
     }

     $("#workflowTable tbody tr").removeClass("workflow-row-active");
     const editLink = $(`#workflowTable tbody a[data-id='${currentId}']`).first();
     if(editLink.length){
       editLink.closest("tr").addClass("workflow-row-active");
     }
}

function applyWorkflowGroupDividers(items){
     const rows = $("#workflowTable tbody tr");
     rows.removeClass("workflow-group-divider");
     if(!Array.isArray(items) || !rows.length){
       return;
     }

     rows.each((index, element) => {
       const row = items[index] || {};
       if(Number(row.is_group_end) === 1){
         $(element).addClass("workflow-group-divider");
       }
     });
}

function getWorkflowCategoryColor(item){
     const palette = [
       { badge: "bg-primary", dot: "#0d6efd", line: "rgba(13, 110, 253, 0.32)" },
       { badge: "bg-success", dot: "#198754", line: "rgba(25, 135, 84, 0.32)" },
       { badge: "bg-warning text-dark", dot: "#f59f00", line: "rgba(245, 159, 0, 0.32)" },
       { badge: "bg-info text-dark", dot: "#0dcaf0", line: "rgba(13, 202, 240, 0.32)" },
       { badge: "bg-danger", dot: "#dc3545", line: "rgba(220, 53, 69, 0.32)" },
       { badge: "bg-dark", dot: "#212529", line: "rgba(33, 37, 41, 0.28)" },
     ];
     const appKey = String(item.app_name || "");
     const hash = appKey.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
     return palette[hash % palette.length];
}

function buildWorkflowTimeline(item, previousItem, nextItem){
     const color = getWorkflowCategoryColor(item);
     const sameAsPrevious = previousItem && previousItem.app_name === item.app_name;
     const sameAsNext = nextItem && nextItem.app_name === item.app_name;
     const isStart = Number(item.is_start) === 1;
     const isFinal = Number(item.is_final) === 1;
     const iconClass = isStart
       ? "ri-play-circle-line"
       : isFinal
       ? "ri-check-double-line"
       : "ri-git-commit-line";
     return `<div class="d-flex align-items-center gap-2" title="${item.app_name || ''} - Step ${item._order}">
               <div class="position-relative" style="width: 22px; min-height: 54px;">
                 ${sameAsPrevious ? `<span style="position:absolute; left:50%; top:-14px; height:15px; width:2px; transform:translateX(-50%); background:${color.line};"></span>` : ""}
                 <span class="d-inline-flex align-items-center justify-content-center" style="position:absolute; left:50%; top:50%; width:24px; height:24px; border-radius:999px; transform:translate(-50%, -50%); background:#fff; color:${color.dot}; border:2px solid ${color.dot}; box-shadow:0 0 0 4px rgba(255,255,255,0.96); font-size:13px;">
                   <i class="${iconClass}"></i>
                 </span>
                 ${sameAsNext ? `<span style="position:absolute; left:50%; top:39px; bottom:-14px; width:2px; transform:translateX(-50%); background:${color.line};"></span>` : ""}
               </div>
               <span class="text-body fw-medium">${item.start_from || "-"}</span>
             </div>`;
}

function formatStepOrderBadge(item){
     const color = getWorkflowCategoryColor(item);
     return `<span class="badge ${color.badge}">${item._order}</span>`;
}

function editWorkflow(id, applicationCategoryId){
     window.location.href = `/Workflow/${id}?application_category_id=${applicationCategoryId}`;
}

function deleteWorkflow(id){
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

function restoreWorkflow(id){
     confirmAction(
       () => {
         ajaxRequest(`/Rejeshaworkflow/${id}`, "POST", (response) => {
           const { statusCode, message } = response;
           alertMessage(
             statusCode == 300 ? "Umefanikiwa" : "Haujafanikiwa",
             message,
             statusCode == 300 ? "success" : "error",
             () => {
               if (statusCode == 300) {
                 window.location.reload();
               }
             }
           );
         });
       },
       "Ndio",
       "warning",
       "Je, una uhakika unataka kurejesha workflow hii?",
       "Thibitisha"
     );
}

function formatWorkflowAction(item){
     const id = Number(item.id || 0);
     const appCategoryId = Number(item.application_category_id || 0);
     if (!id) {
       return "-";
     }

     if (item.deleted_at) {
       return `<div class="d-flex justify-content-end">
                 <button type="button" class="btn btn-sm btn-soft-success" onclick="restoreWorkflow(${id}); return false;">
                   <i class="ri-refresh-line align-middle me-1"></i>Restore
                 </button>
               </div>`;
     }

     return `<div class="d-flex justify-content-end gap-2">
               <a href="#" class="btn btn-link text-primary p-0" onclick="editWorkflow(${id}, ${appCategoryId}); return false;">
                 <i class="ri-pencil-line fs-17"></i>
               </a>
               <button type="button" class="btn btn-link text-danger p-0" onclick="deleteWorkflow(${id}); return false;">
                 <i class="ri-delete-bin-6-line fs-17"></i>
               </button>
             </div>`;
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

function formatWorkflowFlags(item){
     const flags = [];
     if(item.deleted_at) flags.push('<span class="badge bg-danger">Deleted</span>');
     if(Number(item.is_start) === 1) flags.push('<span class="badge bg-primary">Start</span>');
     if(Number(item.is_final) === 1) flags.push('<span class="badge bg-success">Final</span>');
     if(Number(item.can_assign) === 1) flags.push('<span class="badge bg-info text-dark">Assign</span>');
     if(Number(item.can_approve) === 1) flags.push('<span class="badge bg-success">Approve</span>');
     if(Number(item.can_return) === 1) flags.push('<span class="badge bg-warning text-dark">Return</span>');
     return flags.length ? `<div class="d-flex flex-wrap gap-1">${flags.join('')}</div>` : '-';
}
