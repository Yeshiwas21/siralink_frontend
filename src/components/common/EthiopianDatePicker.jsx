import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const DEFAULT_MONTHS = [
    "መስከረም", "ጥቅምት", "ሕዳር", "ታኅሣሥ", "ጥር", "የካቲት",
    "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];

const DEFAULT_WEEKDAYS = ["ሰኞ", "ማክ", "ረቡ", "ሐሙ", "ዓር", "ቅዳ", "እሑ"];

const isEthLeapYear = (year) => (year + 1) % 4 === 0;

const getDaysInEthMonth = (year, monthIndex) => {
    if (monthIndex === 12) return isEthLeapYear(year) ? 6 : 5;
    return 30;
};

const ethToGregorianDate = (ethYear, ethMonthIndex, ethDay = 1) => {
    let totalDays = ethMonthIndex * 30 + (ethDay - 1);
    for (let y = 2000; y < ethYear; y++) {
        totalDays += isEthLeapYear(y) ? 366 : 365;
    }
    const refMs = Date.UTC(2007, 8, 12);
    return new Date(refMs + totalDays * 86400000);
};

const getFirstWeekday = (year, monthIndex) => {
    const gDate = ethToGregorianDate(year, monthIndex, 1);
    const dayOfWeek = gDate.getUTCDay();
    return (dayOfWeek + 6) % 7;
};

const getTodayEthiopian = () => {
    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const refUtc = Date.UTC(2007, 8, 12);

    let diffDays = Math.floor((todayUtc - refUtc) / 86400000);
    let ethYear = 2000;

    while (true) {
        const daysInYear = isEthLeapYear(ethYear) ? 366 : 365;
        if (diffDays < daysInYear) break;
        diffDays -= daysInYear;
        ethYear++;
    }

    const ethMonth = Math.floor(diffDays / 30);
    const ethDay = (diffDays % 30) + 1;

    return { year: ethYear, month: ethMonth, day: ethDay };
};

export default function EthiopianDatePicker({ value, onChange, placeholder }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const { t } = useTranslation();

    const months = t("date_picker.months", { returnObjects: true }) || DEFAULT_MONTHS;
    const weekdays = t("date_picker.weekdays", { returnObjects: true }) || DEFAULT_WEEKDAYS;
    const displayPlaceholder = placeholder || t("date_picker.date_picker_placeholder", "YYYY-MM-DD");

    const todayEth = getTodayEthiopian();

    // Derive selection directly from value prop
    const parsedDate = value ? value.split("-").map(Number) : [];
    const selectedYear = parsedDate[0] || null;
    const selectedMonth = parsedDate[1] ? parsedDate[1] - 1 : null;
    const selectedDay = parsedDate[2] || null;

    // View state for navigating months/years inside the picker dropdown
    const [viewYear, setViewYear] = useState(selectedYear || todayEth.year);
    const [viewMonth, setViewMonth] = useState(selectedMonth !== null ? selectedMonth : todayEth.month);

    const years = Array.from({ length: 100 }, (_, i) => todayEth.year - i);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpen = () => {
        // Reset view navigation to current selected value or today when opening
        setViewYear(selectedYear || todayEth.year);
        setViewMonth(selectedMonth !== null ? selectedMonth : todayEth.month);
        setIsOpen(!isOpen);
    };

    const handleDayClick = (day) => {
        const formattedMonth = String(viewMonth + 1).padStart(2, "0");
        const formattedDay = String(day).padStart(2, "0");
        onChange(`${viewYear}-${formattedMonth}-${formattedDay}`);
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange("");
        setIsOpen(false);
    };

    const daysInMonth = getDaysInEthMonth(viewYear, viewMonth);
    const startWeekday = getFirstWeekday(viewYear, viewMonth);

    return (
        <div ref={containerRef} className="relative w-full">
            <input
                type="text"
                readOnly
                placeholder={displayPlaceholder}
                value={value || ""}
                onClick={handleOpen}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            />

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 z-50 sm:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:translate-y-0 sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:mt-2 w-auto max-w-[320px] mx-auto sm:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 select-none">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <select
                                value={viewMonth}
                                onChange={(e) => setViewMonth(Number(e.target.value))}
                                className="bg-transparent font-semibold text-gray-900 dark:text-white text-base focus:outline-none cursor-pointer"
                            >
                                {months.map((month, idx) => (
                                    <option key={idx} value={idx} className="dark:bg-gray-800">
                                        {month}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={viewYear}
                                onChange={(e) => setViewYear(Number(e.target.value))}
                                className="bg-transparent font-bold text-gray-900 dark:text-white text-base focus:outline-none cursor-pointer"
                            >
                                {years.map((year) => (
                                    <option key={year} value={year} className="dark:bg-gray-800">
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 dark:text-gray-400 mb-2">
                            {weekdays.map((day, idx) => (
                                <div key={idx}>{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {Array.from({ length: startWeekday }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}

                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                const isSelected =
                                    selectedDay === day &&
                                    selectedMonth === viewMonth &&
                                    selectedYear === viewYear;

                                const isToday =
                                    day === todayEth.day &&
                                    viewMonth === todayEth.month &&
                                    viewYear === todayEth.year;

                                let buttonStyle = "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200";

                                if (isSelected) {
                                    buttonStyle = "bg-amber-400 text-gray-900 font-bold";
                                } else if (isToday) {
                                    buttonStyle = "bg-black text-white dark:bg-white dark:text-black font-bold shadow-md";
                                }

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleDayClick(day)}
                                        className={`h-9 w-9 mx-auto flex items-center justify-center rounded-xl transition cursor-pointer ${buttonStyle}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 px-2">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline cursor-pointer"
                            >
                                {t("date_picker.clear", "Clear")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline cursor-pointer"
                            >
                                {t("date_picker.close", "Close")}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}