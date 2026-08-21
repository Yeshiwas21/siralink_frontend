import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
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

    const inputRef = useRef(null);
    const portalRef = useRef(null);
    const { t } = useTranslation();

    const months = t("date_picker.months", { returnObjects: true }) || DEFAULT_MONTHS;
    const weekdays = t("date_picker.weekdays", { returnObjects: true }) || DEFAULT_WEEKDAYS;
    const displayPlaceholder = placeholder || t("date_picker.date_picker_placeholder", "YYYY-MM-DD");

    const todayEth = getTodayEthiopian();

    const parsedDate = value ? value.split("-").map(Number) : [];
    const selectedYear = parsedDate[0] || null;
    const selectedMonth = parsedDate[1] ? parsedDate[1] - 1 : null;
    const selectedDay = parsedDate[2] || null;

    const [viewYear, setViewYear] = useState(selectedYear || todayEth.year);
    const [viewMonth, setViewMonth] = useState(selectedMonth !== null ? selectedMonth : todayEth.month);

    const years = Array.from({ length: 100 }, (_, i) => todayEth.year - i);

    // Check if viewing the last month of the current year
    const isLastMonthOfCurrentYear = viewYear >= todayEth.year && viewMonth === 12;

    const updateCoords = useCallback(() => {
        if (!inputRef.current || !portalRef.current) return;

        const rect = inputRef.current.getBoundingClientRect();
        const popoverWidth = 320;
        const popoverHeight = portalRef.current.offsetHeight || 380;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        let left = rect.left;
        if (left + popoverWidth > screenWidth - 16) {
            left = Math.max(16, screenWidth - popoverWidth - 16);
        }

        const spaceBelow = screenHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldFlipUpward = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

        const top = shouldFlipUpward
            ? Math.max(16, rect.top - popoverHeight - 6)
            : rect.bottom + 6;

        portalRef.current.style.top = `${top}px`;
        portalRef.current.style.left = `${left}px`;
    }, []);

    useLayoutEffect(() => {
        if (isOpen) {
            updateCoords();
        }
    }, [isOpen, updateCoords]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            const isClickInsideInput = inputRef.current && inputRef.current.contains(e.target);
            const isClickInsidePortal = portalRef.current && portalRef.current.contains(e.target);

            if (!isClickInsideInput && !isClickInsidePortal) {
                setIsOpen(false);
            }
        };

        const handleScrollOrResize = () => {
            updateCoords();
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScrollOrResize, true);
            window.removeEventListener("resize", handleScrollOrResize);
        };
    }, [isOpen, updateCoords]);

    const handleOpen = () => {
        setViewYear(selectedYear || todayEth.year);
        setViewMonth(selectedMonth !== null ? selectedMonth : todayEth.month);
        setIsOpen((prev) => !prev);
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

    const handlePrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(12);
            setViewYear((prev) => prev - 1);
        } else {
            setViewMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (isLastMonthOfCurrentYear) return;

        if (viewMonth === 12) {
            setViewMonth(0);
            setViewYear((prev) => prev + 1);
        } else {
            setViewMonth((prev) => prev + 1);
        }
    };

    const handleJumpToToday = () => {
        setViewYear(todayEth.year);
        setViewMonth(todayEth.month);
        const formattedMonth = String(todayEth.month + 1).padStart(2, "0");
        const formattedDay = String(todayEth.day).padStart(2, "0");
        onChange(`${todayEth.year}-${formattedMonth}-${formattedDay}`);
        setIsOpen(false);
    };

    const daysInMonth = getDaysInEthMonth(viewYear, viewMonth);
    const startWeekday = getFirstWeekday(viewYear, viewMonth);

    return (
        <div className="w-full">
            <input
                ref={inputRef}
                type="text"
                readOnly
                placeholder={displayPlaceholder}
                value={value || ""}
                onClick={handleOpen}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
            />

            {isOpen &&
                createPortal(
                    <>
                        {/* Mobile Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/40 z-9998 sm:hidden"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Datepicker Popover */}
                        <div
                            ref={portalRef}
                            className="fixed z-9999 w-auto max-w-[320px] sm:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 select-none"
                        >
                            {/* Top Navigation Row: < Today > */}
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition cursor-pointer"
                                    title={t("date_picker.prev_month", "Previous Month")}
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleJumpToToday}
                                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
                                >
                                    {t("date_picker.today")}
                                </button>

                                {/* Next Month Button: Hidden on last month of current year */}
                                {!isLastMonthOfCurrentYear ? (
                                    <button
                                        type="button"
                                        onClick={handleNextMonth}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition cursor-pointer"
                                        title={t("date_picker.next_month", "Next Month")}
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                ) : (
                                    <div className="w-8 h-8" />
                                )}
                            </div>

                            {/* Month & Year Selection Row */}
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

                            {/* Weekday Labels */}
                            <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 dark:text-gray-400 mb-2">
                                {weekdays.map((day, idx) => (
                                    <div key={idx}>{day}</div>
                                ))}
                            </div>

                            {/* Days Grid */}
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

                            {/* Footer Action Row */}
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
                    </>,
                    document.body
                )}
        </div>
    );
}