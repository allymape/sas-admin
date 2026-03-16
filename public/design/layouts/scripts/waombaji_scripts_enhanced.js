// Enhanced Waombaji Scripts
// Utility functions

/**
 * Change date format to readable format
 * @param {string} dateString - Date string from database (YYYY-MM-DD HH:MM:SS)
 * @returns {string} Formatted date
 */
function changeDateFormat(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('sw-TZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Format time ago (e.g., "2 days ago")
 * @param {string} dateString - Date string
 * @returns {string} Time ago string
 */
function timeAgo(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'sasa hivi';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' dakika zilizopita';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' saa zilizopita';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' siku zilizopita';
    
    return Math.floor(seconds / 604800) + ' wiki zilizopita';
}

/**
 * Action buttons generator
 * @param {object} row - Row data
 * @param {array} elements - Button configurations
 * @returns {string} HTML buttons
 */
function actionButtons(row, elements) {
    let html = '<div style="display:inline-flex; gap: 0.25rem">';

    elements.forEach(el => {
        if (!el.show) return;

        if (el.type === 'link') {
            html += `
                <a href="${el.link}" class="${el.class} action-btn" 
                   title="${el.moreAttributes || ''}" 
                   ${el.moreAttributes || ''}>
                    <i class="${el.icon}"></i>
                </a>
            `;
        } else if (el.type === 'button') {
            html += `
                <button onclick="${el.function}" class="${el.class} action-btn" 
                        title="${el.moreAttributes || ''}" 
                        ${el.moreAttributes || ''}>
                    <i class="${el.icon}"></i>
                </button>
            `;
        }
    });

    html += '</div>';
    return html;
}

/**
 * Initialize DataTable with custom configuration
 * @param {string} tableId - Table element ID
 * @param {string} url - API endpoint URL
 * @param {string} method - HTTP method (GET or POST)
 * @param {array} columns - Column configuration array
 * @param {object} options - Additional DataTable options
 */
function tableData(tableId, url, method = 'GET', columns = [], options = {}) {
    const defaultOptions = {
        processing: true,
        serverSide: true,
        pageLength: 10,
        lengthChange: true,
        searching: false,
        ordering: false,
        paging: true,
        responsive: true,
        dom: '<"top"lf>rt<"bottom"ip>',
        ajax: {
            url: url,
            type: method,
            data: function(d) {
                // Can be overridden in custom options
            }
        },
        columnDefs: [
            {
                targets: -1,
                orderable: false,
                searchable: false
            }
        ],
        language: {
            sProcessing: 'Inakiprosesa...',
            sSearch: 'Tafuta:',
            sLengthMenu: 'Onyesha _MENU_ entries',
            sInfo: 'Onyesha _START_ to _END_ of _TOTAL_ entries',
            sInfoEmpty: 'Onyesha 0 to 0 of 0 entries',
            sInfoFiltered: '(filtered from _MAX_ total entries)',
            sInfoPostFix: '',
            sLoadingRecords: 'Inakipakua matokeo...',
            sZeroRecords: 'Hakuna matokeo yanayolingana.',
            sEmptyTable: 'Hapana data inaonekana katika jedwali.',
            oPaginate: {
                sFirst: 'Kwanza',
                sPrevious: 'Nyuma',
                sNext: 'Habari',
                sLast: 'Mwisho'
            },
            oAria: {
                sSortAscending: ': activate to sort column ascending',
                sSortDescending: ': activate to sort column descending'
            }
        }
    };

    const config = {
        ...defaultOptions,
        columns: columns,
        ...options
    };

    return $(`#${tableId}`).DataTable(config);
}

/**
 * Get all selected rows from checkbox
 * @returns {array} Array of selected row IDs
 */
function getSelectedRows() {
    const selected = [];
    document.querySelectorAll('.row-checkbox:checked').forEach(checkbox => {
        const row = checkbox.closest('tr');
        if (row && row.dataset.id) {
            selected.push(row.dataset.id);
        }
    });
    return selected;
}

/**
 * Show success notification
 * @param {string} message - Message to display
 */
function showSuccess(message) {
    console.log('✓ Success:', message);
    // Can be extended to use toast library
    if (typeof Toastr !== 'undefined') {
        Toastr.success(message);
    }
}

/**
 * Show error notification
 * @param {string} message - Error message
 */
function showError(message) {
    console.error('✗ Error:', message);
    if (typeof Toastr !== 'undefined') {
        Toastr.error(message);
    }
}

/**
 * Show info notification
 * @param {string} message - Info message
 */
function showInfo(message) {
    console.info('ℹ Info:', message);
    if (typeof Toastr !== 'undefined') {
        Toastr.info(message);
    }
}

/**
 * Export table data to CSV
 * @param {string} filename - Output filename
 */
function exportToCSV(filename = 'export.csv') {
    const table = document.querySelector('table');
    if (!table) return;

    const csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvColumns = [];
        cols.forEach(col => {
            csvColumns.push(col.innerText);
        });
        csv.push(csvColumns.join(','));
    });

    downloadCSV(csv.join('\n'), filename);
}

/**
 * Download CSV file
 * @param {string} csv - CSV content
 * @param {string} filename - Filename
 */
function downloadCSV(csv, filename) {
    const csvFile = new Blob([csv], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(csvFile);
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

/**
 * Debounce function for search input
 * @param {function} func - Function to debounce
 * @param {number} wait - Debounce time in milliseconds
 * @returns {function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance optimization
 * @param {function} func - Function to throttle
 * @param {number} limit - Throttle time in milliseconds
 * @returns {function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Parse API response and handle errors
 * @param {object} response - API response
 * @returns {object} Parsed response
 */
function parseApiResponse(response) {
    if (!response) {
        throw new Error('Hakuna jibu kutoka kwa server');
    }

    if (response.error || response.statusCode === 306) {
        throw new Error(response.message || 'Kosa limejitokeza');
    }

    return response.data;
}

/**
 * Format number with thousand separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return Number(num || 0).toLocaleString('sw-TZ');
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
function truncate(str, length = 50, suffix = '...') {
    if (!str || str.length <= length) return str;
    return str.slice(0, length) + suffix;
}

/**
 * Check if value is empty
 * @param {*} value - Value to check
 * @returns {boolean} True if empty
 */
function isEmpty(value) {
    return (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
    );
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        changeDateFormat,
        timeAgo,
        actionButtons,
        tableData,
        getSelectedRows,
        showSuccess,
        showError,
        showInfo,
        exportToCSV,
        downloadCSV,
        debounce,
        throttle,
        parseApiResponse,
        formatNumber,
        capitalize,
        truncate,
        isEmpty,
        isValidEmail
    };
}
