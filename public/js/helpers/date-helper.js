// Date Helper Functions for Enhanced Waombaji

/**
 * Format date for display
 * @param {string} dateString - Date string from database
 * @returns {string} Formatted date
 */
function changeDateFormat(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('sw-TZ', options) + ' ' + date.toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return dateString;
    }
}

/**
 * Get date only (without time)
 * @param {string} dateString - Date string
 * @returns {string} Date only
 */
function getDateOnly(dateString) {
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
 * Get time only
 * @param {string} dateString - Date string
 * @returns {string} Time only
 */
function getTimeOnly(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('sw-TZ', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Get relative time (e.g., "2 days ago")
 * @param {string} dateString - Date string
 * @returns {string} Relative time
 */
function getRelativeTime(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const intervals = {
            mwaka: 31536000,
            mwezi: 2592000,
            wiki: 604800,
            siku: 86400,
            saa: 3600,
            dakika: 60
        };

        for (const [unit, secondsPerUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsPerUnit);
            if (interval >= 1) {
                return interval === 1 
                    ? `${interval} ${unit} iliyopita`
                    : `${interval} ${unit} zilizopita`;
            }
        }

        return 'sasa hivi';
    } catch (e) {
        return dateString;
    }
}

/**
 * Compare two dates
 * @param {string} date1 - First date
 * @param {string} date2 - Second date
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
function compareDates(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
}

/**
 * Check if date is today
 * @param {string} dateString - Date string
 * @returns {boolean} True if today
 */
function isToday(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    
    return date.toDateString() === today.toDateString();
}

/**
 * Check if date is yesterday
 * @param {string} dateString - Date string
 * @returns {boolean} True if yesterday
 */
function isYesterday(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return date.toDateString() === yesterday.toDateString();
}

/**
 * Get date range label (e.g., "This week", "This month")
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string} Range label
 */
function getDateRangeLabel(startDate, endDate) {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Siku moja';
    if (days === 6) return 'Wiki moja';
    if (days === 29 || days === 30) return 'Mwezi mmoja';
    if (days >= 365) return 'Mwaka mmoja';
    
    return days + ' siku';
}

/**
 * Format date for API/Database (YYYY-MM-DD)
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date for database
 */
function formatDateForDB(date) {
    let d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();
    
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    return [year, month, day].join('-');
}

/**
 * Get start of day
 * @param {Date} date - Date object
 * @returns {Date} Date at 00:00:00
 */
function getStartOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Get end of day
 * @param {Date} date - Date object
 * @returns {Date} Date at 23:59:59
 */
function getEndOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

/**
 * Add days to date
 * @param {Date} date - Date object
 * @param {number} days - Days to add
 * @returns {Date} New date
 */
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

/**
 * Subtract days from date
 * @param {Date} date - Date object
 * @param {number} days - Days to subtract
 * @returns {Date} New date
 */
function subtractDays(date, days) {
    return addDays(date, -days);
}
