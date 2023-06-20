
function paginate(url , pages , current , per_page){
    if(pages > 1){
                var page = current > 5 ? current - 4 : 1; 
                $(".pagination").html();
                var paginationDiv = '<div class="pagination-wrap hstack gap-2">';
                    paginationDiv =  paginationDiv + `<a class="page-item pagination-prev ${current == 1 ? 'disabled' : ''}"  id="previous" href="${current > 1 ? `/${url}?page=${current-1}` : '#'}">Previous</a>`;
                    paginationDiv =  paginationDiv +'<ul class="pagination listjs-pagination mb-0">';
                    paginationDiv = paginationDiv+`<li class='${page==current ? `disabled` : ``}'><a href='${page==current ? '#' : url }' data-i='1' class="page" data-page='${per_page}'>First</a></li>` 
                    if ( page !== 1) { 
                        paginationDiv = paginationDiv+`<li class="disabled"><a class="page">...</a></li>`
                    }
                    for (page ;page <= current + 4 && page <= pages; page++) {
                        paginationDiv = paginationDiv+`<li class='${page==current ? `active` : ``}'><a href='/${url}?page=${page}' data-i='${page}' class="page" data-page='${per_page}'>${page}</a></li>` 
                        if (page == (current + 4) && page < pages) { 
                            paginationDiv = paginationDiv+`<li class="disabled"><a class="page">...</a></li>`
                        }
                    }
                    
                    paginationDiv =  paginationDiv +'</ul>';
                    paginationDiv =  paginationDiv + `<a class="page-item pagination-next ${current == pages ? 'disabled' : ''}"  id="previous" href="${current < pages ? `/${url}?page=${current+1}` : '#'}">Next</a>`
                    paginationDiv =  paginationDiv+'</div>'; 
                $(".pagination").append(paginationDiv);
    }
}

