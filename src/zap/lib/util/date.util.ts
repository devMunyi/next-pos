import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Customize the relative time strings
dayjs.updateLocale('en', {
    relativeTime: {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years'
    }
});

export function fancyDate(date: Date | string | dayjs.Dayjs): string {
    return dayjs(date).fromNow();
}

type datestringformats = 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm:ss' | 'DD-MM-YYYY' | 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'MMMM D, YYYY' | 'MMM D, YYYY' | 'D MMMM YYYY';

export function getStringDate(date?: Date | string | dayjs.Dayjs | undefined, format: datestringformats = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).format(format);
}


export function nowDatetimeObject() {
    return dayjs().toDate();
}


export function toRelativeTime(dateString: string | Date): string {
    return dayjs(dateString).fromNow();
}


export function getNairobiDateString(utcDate: string): string {
    const date = new Date(utcDate);
    return new Intl.DateTimeFormat("en-KE", {
        timeZone: "Africa/Nairobi",
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}
