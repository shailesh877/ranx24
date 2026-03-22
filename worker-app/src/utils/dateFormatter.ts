/**
 * Format date to readable string
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Format date to short format
 * @param date - Date string or Date object
 * @returns Short date string (e.g., "15 Jan")
 */
export const formatShortDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
};

/**
 * Format time to readable string
 * @param time - Time string (e.g., "14:30" or "2:30 PM")
 * @returns Formatted time string
 */
export const formatTime = (time: string): string => {
    if (!time) return '';

    // If already in 12-hour format, return as is
    if (time.includes('AM') || time.includes('PM')) {
        return time;
    }

    // Convert 24-hour to 12-hour format
    const parts = time.split(':');
    if (parts.length < 2) return time;

    const [hours, minutes] = parts.map(Number);

    if (isNaN(hours) || isNaN(minutes)) return time;

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Format date and time together
 * @param date - Date string or Date object
 * @param time - Time string
 * @returns Combined date and time string (e.g., "Jan 15, 2025 at 2:30 PM")
 */
export const formatDateTime = (date: string | Date, time?: string): string => {
    const formattedDate = formatDate(date);

    if (time) {
        const formattedTime = formatTime(time);
        return `${formattedDate} at ${formattedTime}`;
    }

    return formattedDate;
};

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const getRelativeTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatDate(d);
};

/**
 * Check if date is today
 * @param date - Date string or Date object
 * @returns True if date is today
 */
export const isToday = (date: string | Date): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();

    return d.toDateString() === today.toDateString();
};

/**
 * Check if date is in the past
 * @param date - Date string or Date object
 * @returns True if date is in the past
 */
export const isPast = (date: string | Date): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    return d < now;
};
