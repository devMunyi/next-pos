"use client";

import { formatDisplayDate, formatDisplayDateAndTime } from "@/zap/lib/util/common.client.util";
import { fancyDate } from "@/zap/lib/util/date.util";

type DateDisplayProps = {
    date: string | Date;
    showTime?: boolean; // flag to control whether time is shown
};

export function DateDisplay({ date, showTime = true }: DateDisplayProps) {
    const dateString = typeof date === "string" ? date : date.toISOString();

    return (
        <div className="flex flex-col">
            {showTime ? formatDisplayDateAndTime(dateString) : formatDisplayDate(dateString)}
            <span className="text-primary">{fancyDate(date)}</span>
        </div>
    );
}
