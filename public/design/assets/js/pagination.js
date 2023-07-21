
function paginate(url , pages , current , per_page){
    $(".pagination").empty();
    if(pages > 1){
                var page = current > 5 ? current - 4 : 1; 
                const searchParams = setUrlSearchParams();
                const search = searchParams ? "&"+searchParams : '';
                var per_page_url = per_page && per_page != 10 ? '&per_page='+per_page : '';
                $(".pagination").html();
                var paginationDiv = '<div class="pagination-wrap hstack gap-2">';
                    paginationDiv =  paginationDiv +`<a class="page-item pagination-prev ${current == 1 ? 'disabled' : ''}"  href='${page==current ? '#' : url+"?page=1"+ per_page_url }'>First</a>` 
                    paginationDiv =  paginationDiv +`<a class="page-item pagination-prev ${current == 1 ? 'disabled' : ''}"  id="previous" href="${current > 1 ? `/${url}?page=${current-1}${per_page_url}` : '#'}">Previous</a>`;
                    paginationDiv =  paginationDiv +'<ul class="pagination listjs-pagination mb-0">';
                    
                    if ( page !== 1) { 
                        paginationDiv = paginationDiv+`<li class="disabled"><a class="page">...</a></li>`
                    }
                    for (page ;page <= current + 4 && page <= pages; page++) {
                        paginationDiv = paginationDiv+`<li class='${page==current ? `active` : ``}'><a href='/${url}?page=${page}${per_page_url}${search}' data-i='${page}' class="page" data-page='${per_page}'>${page}</a></li>` 
                        if (page == (current + 4) && page < pages) { 
                            paginationDiv = paginationDiv+`<li class="disabled"><a class="page">...</a></li>`
                        }
                    }
                    paginationDiv =  paginationDiv + `<a class="page-item pagination-next ${current == pages ? 'disabled' : ''}"  id="previous" href="${current < pages ? `/${url}?page=${current+1} ${per_page_url}` : '#'}">Next</a>`
                    paginationDiv = paginationDiv+`<a href='${current==pages ? '#' : url+'?page='+pages}${per_page_url}${search}'  class="page-item pagination-next ${current==pages ? 'disabled' : ''}">Last</a>` 
                    paginationDiv =  paginationDiv +'</ul>';
                    paginationDiv =  paginationDiv+'</div>'; 
                $(".pagination").append(paginationDiv);

    }else{
        $(".page-length").hide();
    }
}

