import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Formats a date string to a locale-specific string
 * @param dateString - The date string to format (e.g., from API)
 * @param timeZone - Optional timezone (defaults to browser's timezone)
 * @returns Formatted date string (e.g., "12/31/2023, 11:59:59 PM")
 */
export function formatDateString(
    dateString: string | Date,
    timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): string {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
        timeZone,
    });
}

/**
 * Converts a date to a user-friendly relative time string
 * @param dateString - The date string to format
 * @returns Relative time string (e.g., "2 hours ago", "in 1 minute")
 */
export function toRelativeTime(dateString: string | Date): string {
    return dayjs(dateString).fromNow();
}

export type DateFormat =
    | "MMM D, YYYY h:mm A" // Default format - e.g. "Jan 5, 2023 2:30 PM"
    | "YYYY-MM-DD" // ISO format - e.g. "2023-01-05"
    | "YYYY-MM-DD HH:mm:ss" // Full datetime - e.g. "2023-01-05 14:30:00"
    | "MM/DD/YYYY" // US format - e.g. "01/05/2023"
    | "DD/MM/YYYY" // European format - e.g. "05/01/2023"
    | "MMMM D, YYYY" // Long format - e.g. "January 5, 2023"
    | "MMM D, YYYY" // Medium format - e.g. "Jan 5, 2023"
    | "ddd, MMM D, YYYY" // Weekday format - e.g. "Thu, Jan 5, 2023"
    | "h:mm A" // Time only - e.g. "2:30 PM"
    | "HH:mm" // 24-hour time - e.g. "14:30"
    | "YYYY-MM-DDTHH:mm:ssZ" // ISO 8601 with timezone - e.g. "2023-01-05T14:30:00Z"
    | "YYYY-MM-DD HH:mm" // ISO without seconds - e.g. "2023-01-05 14:30"
    | "YYYY" // Year only - e.g. "2023"
    | "MMM YYYY" // Month and year - e.g. "Jan 2023"
    | "Qo [quarter] YYYY" // Quarter format - e.g. "1st quarter 2023"
    | "MM-DD-YYYY"; // Alternative US format - e.g. "01-05-2023"

/**
 * Formats a date string or Date object using the specified format
 * @param dateString The date to format (string, Date, or dayjs object)
 * @param format The format to use (defaults to "MMM D, YYYY h:mm A")
 * @returns Formatted date string
 */
export function formatDate(
    dateString: string | Date | dayjs.Dayjs,
    format: DateFormat = "MMM D, YYYY h:mm A"
): string {
    return dayjs(dateString).format(format);
}

// Optional: Predefined formatters for common use cases
export const DateFormatter = {
    default: (date: string | Date | dayjs.Dayjs) => formatDate(date),
    isoDate: (date: string | Date | dayjs.Dayjs) => formatDate(date, "YYYY-MM-DD"),
    isoDateTime: (date: string | Date | dayjs.Dayjs) => formatDate(date, "YYYY-MM-DD HH:mm:ss"),
    usDate: (date: string | Date | dayjs.Dayjs) => formatDate(date, "MM/DD/YYYY"),
    europeanDate: (date: string | Date | dayjs.Dayjs) => formatDate(date, "DD/MM/YYYY"),
    longDate: (date: string | Date | dayjs.Dayjs) => formatDate(date, "MMMM D, YYYY"),
    timeOnly: (date: string | Date | dayjs.Dayjs) => formatDate(date, "h:mm A"),
    yearOnly: (date: string | Date | dayjs.Dayjs) => formatDate(date, "YYYY"),
    quarter: (date: string | Date | dayjs.Dayjs) => formatDate(date, "Qo [quarter] YYYY"),
};

/**
 * Gets the timezone-adjusted date
 * @param dateString - The date string to adjust
 * @param timeZone - Target timezone (defaults to browser's timezone)
 * @returns Day.js object in the specified timezone
 */
export function getLocalizedDate(
    dateString: string | Date,
    timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
) {
    return dayjs(dateString).tz(timeZone);
}