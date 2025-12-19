import { format, parse } from 'date-fns';

/**
 * Format a date string according to the user's preferred format
 * @param dateString - ISO date string or Date object
 * @param formatString - Format preference (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date, formatString: string = 'DD/MM/YYYY'): string {
    if (!dateString) return '';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    // Map format strings to date-fns format tokens
    const formatMap: Record<string, string> = {
        'DD/MM/YYYY': 'dd/MM/yyyy',
        'MM/DD/YYYY': 'MM/dd/yyyy',
        'YYYY-MM-DD': 'yyyy-MM-dd',
    };

    const dateFnsFormat = formatMap[formatString] || 'dd/MM/yyyy';

    try {
        return format(date, dateFnsFormat);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString.toString();
    }
}

/**
 * Get a user-friendly date format for display
 * @param dateString - ISO date string or Date object
 * @param formatString - Format preference
 * @returns Formatted date with month name
 */
export function formatDateLong(dateString: string | Date, formatString: string = 'DD/MM/YYYY'): string {
    if (!dateString) return '';

    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    try {
        // Always use a readable format for long dates
        return format(date, 'MMMM d, yyyy');
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString.toString();
    }
}
